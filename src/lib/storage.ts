import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fileBlobs, files, type FileRef } from "@/db/schema";
import { ApiError } from "./security";

/**
 * File storage.
 * Files are stored in PostgreSQL (metadata in `files`, bytes in `file_blobs`) so uploads survive
 * redeploys and are covered by database backups. `putObject` / `getObject` are the only two
 * functions that touch the bytes, so an S3-compatible bucket can be swapped in here.
 */

type Rule = { mime: string; inline?: boolean; check: (b: Buffer) => boolean };

const starts = (b: Buffer, sig: number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);
const isZip = (b: Buffer) => starts(b, [0x50, 0x4b, 0x03, 0x04]) || starts(b, [0x50, 0x4b, 0x05, 0x06]);
const isOle = (b: Buffer) => starts(b, [0xd0, 0xcf, 0x11, 0xe0]);
const isText = (b: Buffer) => !b.subarray(0, 4096).includes(0);

const RULES: Record<string, Rule> = {
  pdf: { mime: "application/pdf", inline: true, check: (b) => b.subarray(0, 1024).includes("%PDF-") },
  png: { mime: "image/png", inline: true, check: (b) => starts(b, [0x89, 0x50, 0x4e, 0x47]) },
  jpg: { mime: "image/jpeg", inline: true, check: (b) => starts(b, [0xff, 0xd8, 0xff]) },
  jpeg: { mime: "image/jpeg", inline: true, check: (b) => starts(b, [0xff, 0xd8, 0xff]) },
  webp: { mime: "image/webp", inline: true, check: (b) => starts(b, [0x52, 0x49, 0x46, 0x46]) && starts(b, [0x57, 0x45, 0x42, 0x50], 8) },
  mp4: { mime: "video/mp4", inline: true, check: (b) => starts(b, [0x66, 0x74, 0x79, 0x70], 4) },
  webm: { mime: "video/webm", inline: true, check: (b) => starts(b, [0x1a, 0x45, 0xdf, 0xa3]) },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", check: isZip },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", check: isZip },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", check: isZip },
  zip: { mime: "application/zip", check: isZip },
  doc: { mime: "application/msword", check: isOle },
  xls: { mime: "application/vnd.ms-excel", check: isOle },
  dwg: { mime: "application/acad", check: (b) => starts(b, [0x41, 0x43, 0x31]) },
  dxf: { mime: "application/dxf", check: isText },
  csv: { mime: "text/csv", check: isText },
  txt: { mime: "text/plain", check: isText },
};

const MB = 1024 * 1024;
const DOCS = ["pdf", "doc", "docx", "xls", "xlsx", "pptx", "png", "jpg", "jpeg", "zip"];

export const FILE_KINDS = {
  /** Public-site attachments on inquiries: private, admin-only downloads. */
  lead: { ext: [...DOCS, "webp", "csv", "txt", "dwg", "dxf"], max: 10 * MB, public: false },
  /** CVs: private, HR/admin-only downloads. */
  resume: { ext: ["pdf", "doc", "docx"], max: 5 * MB, public: false },
  /** Media library: public assets used on the website. */
  media: { ext: ["png", "jpg", "jpeg", "webp", "mp4", "webm", "pdf"], max: 20 * MB, public: true },
  /** Tender documents authorised for public release. */
  tender: { ext: DOCS, max: 15 * MB, public: true },
  /** Corporate profile PDF. */
  profile: { ext: ["pdf"], max: 15 * MB, public: true },
  /** Compliance documents: visibility is decided by the certification record. */
  certification: { ext: ["pdf", "png", "jpg", "jpeg"], max: 15 * MB, public: false },
} as const;
export type FileKind = keyof typeof FILE_KINDS;

export function acceptFor(kind: FileKind): string {
  return FILE_KINDS[kind].ext.map((e) => `.${e}`).join(",");
}

function cleanName(name: string): string {
  const base = name.split(/[\\/]/).pop() || "file";
  return base.replace(/[\u0000-\u001F\u007F<>:"|?*]/g, "").replace(/\s+/g, " ").trim().slice(-120) || "file";
}

async function putObject(id: string, data: Buffer) {
  await db.insert(fileBlobs).values({ fileId: id, data });
}

async function getObject(id: string): Promise<Buffer | null> {
  const [row] = await db.select({ data: fileBlobs.data }).from(fileBlobs).where(eq(fileBlobs.fileId, id)).limit(1);
  return row ? Buffer.from(row.data) : null;
}

/** Validates (extension allow-list, size, content signature) and stores an uploaded file. */
export async function saveUpload(file: File, kind: FileKind, uploadedBy?: number): Promise<FileRef> {
  const rule = FILE_KINDS[kind];
  const name = cleanName(file.name);
  const ext = (name.includes(".") ? name.split(".").pop()! : "").toLowerCase();
  if (!ext || !(rule.ext as readonly string[]).includes(ext) || !RULES[ext]) {
    throw new ApiError(400, `"${name}" is not an accepted file type. Allowed: ${rule.ext.join(", ").toUpperCase()}.`);
  }
  if (file.size === 0) throw new ApiError(400, `"${name}" is empty.`);
  if (file.size > rule.max) {
    throw new ApiError(400, `"${name}" is larger than the ${Math.round(rule.max / MB)} MB limit.`);
  }
  const data = Buffer.from(await file.arrayBuffer());
  if (!RULES[ext]!.check(data)) {
    throw new ApiError(400, `"${name}" does not look like a valid .${ext} file.`);
  }
  const id = randomBytes(16).toString("hex");
  await db.insert(files).values({ id, name, mime: RULES[ext]!.mime, size: data.length, kind, uploadedBy: uploadedBy ?? null });
  try {
    await putObject(id, data);
  } catch (e) {
    await db.delete(files).where(eq(files.id, id));
    throw e;
  }
  return { id, name, size: data.length };
}

export async function saveUploads(list: File[], kind: FileKind, maxFiles = 5): Promise<FileRef[]> {
  const real = list.filter((f) => f && typeof f === "object" && f.size > 0);
  if (real.length > maxFiles) throw new ApiError(400, `Please attach at most ${maxFiles} files.`);
  const refs: FileRef[] = [];
  try {
    for (const f of real) refs.push(await saveUpload(f, kind));
  } catch (e) {
    for (const r of refs) await deleteFile(r.id);
    throw e;
  }
  return refs;
}

export async function getFileMeta(id: string) {
  if (!/^[a-f0-9]{32}$/.test(id)) return null;
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return row ?? null;
}

export async function readFile(id: string) {
  const meta = await getFileMeta(id);
  if (!meta) return null;
  const data = await getObject(id);
  if (!data) return null;
  const ext = meta.name.split(".").pop()!.toLowerCase();
  return { meta, data, inline: !!RULES[ext]?.inline };
}

export async function deleteFile(id: string) {
  await db.delete(files).where(eq(files.id, id)).catch(() => undefined);
}

export function fileUrl(id: string): string {
  return `/api/files/${id}`;
}
