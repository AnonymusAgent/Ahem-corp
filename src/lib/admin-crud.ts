import { and, asc, desc, eq, getTableColumns, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import * as t from "@/db/schema";
import { audit, hashPassword, passwordProblem, type SessionUser } from "./auth";
import { cleanText } from "./forms";
import { getResourceDef, TABLES, type AdminField, type ResourceDef } from "./resources";
import { ApiError, safeUrl } from "./security";
import { can, leadTypesForRole, slugify } from "./site";

type Row = Record<string, unknown>;
type Ctx = { def: ResourceDef; table: PgTable; cols: Record<string, PgColumn> };

export function resourceFor(key: string, user: SessionUser): Ctx {
  const def = getResourceDef(key);
  const table = TABLES[key];
  if (!def || !table) throw new ApiError(404, "Unknown module.");
  if (!can(user.role, def.permission)) throw new ApiError(403, "You do not have permission to access this module.");
  return { def, table, cols: getTableColumns(table) as Record<string, PgColumn> };
}

/** Row-level scope applied to every query on a resource. */
function scopeFor(key: string, user: SessionUser): SQL | undefined {
  if (key === "leads") return inArray(t.leads.type, leadTypesForRole(user.role));
  if (key === "media") return eq(t.files.kind, "media");
  return undefined;
}

function strip(def: ResourceDef, row: Row): Row {
  if (!def.hidden?.length) return row;
  const out = { ...row };
  for (const h of def.hidden) delete out[h];
  return out;
}

function parseId(def: ResourceDef, raw: string): string | number {
  if (def.key === "media") {
    if (!/^[a-f0-9]{32}$/.test(raw)) throw new ApiError(400, "Invalid id.");
    return raw;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new ApiError(400, "Invalid id.");
  return n;
}

function buildWhere(ctx: Ctx, user: SessionUser, params: URLSearchParams): SQL | undefined {
  const { def, cols } = ctx;
  const where: SQL[] = [];
  const scope = scopeFor(def.key, user);
  if (scope) where.push(scope);
  const q = (params.get("q") || "").trim().slice(0, 100);
  if (q && def.search.length) {
    const pattern = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
    const parts = def.search.filter((c) => cols[c]).map((c) => ilike(cols[c]!, pattern));
    const clause = or(...parts);
    if (clause) where.push(clause);
  }
  for (const f of def.filters) {
    const v = params.get(`f_${f.name}`);
    const col = cols[f.name];
    if (!v || !col || !f.options.some(([o]) => o === v)) continue;
    where.push(col.dataType === "boolean" ? eq(col, v === "true") : eq(col, v));
  }
  return where.length ? and(...where) : undefined;
}

export async function listRows(key: string, user: SessionUser, params: URLSearchParams, exportAll = false) {
  const ctx = resourceFor(key, user);
  const { def, table, cols } = ctx;
  const where = buildWhere(ctx, user, params);
  const sortName = params.get("sort") && cols[params.get("sort")!] ? params.get("sort")! : def.sort[0];
  const dir = (params.get("dir") || def.sort[1]) === "asc" ? "asc" : "desc";
  const sortCol = cols[sortName]!;
  const pageSize = exportAll ? 5000 : Math.min(100, Math.max(5, Number(params.get("pageSize")) || 20));
  const page = exportAll ? 1 : Math.max(1, Number(params.get("page")) || 1);
  const order = [dir === "asc" ? asc(sortCol) : desc(sortCol), cols.id ? desc(cols.id) : desc(sortCol)];
  const rows = (await db
    .select()
    .from(table)
    .where(where)
    .orderBy(...order)
    .limit(pageSize)
    .offset((page - 1) * pageSize)) as Row[];
  const [count] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(where);
  return { def, rows: rows.map((r) => strip(def, r)), total: count?.n ?? 0, page, pageSize, sort: sortName, dir };
}

export async function getRow(key: string, user: SessionUser, rawId: string): Promise<{ ctx: Ctx; row: Row; id: string | number }> {
  const ctx = resourceFor(key, user);
  const id = parseId(ctx.def, rawId);
  const scope = scopeFor(key, user);
  const [row] = (await db
    .select()
    .from(ctx.table)
    .where(and(eq(ctx.cols.id!, id), scope))
    .limit(1)) as Row[];
  if (!row) throw new ApiError(404, "Record not found.");
  return { ctx, row, id };
}

/* ------------------------------- Validation ------------------------------ */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const fileRef = (v: unknown) => {
  if (!v || typeof v !== "object") return null;
  const r = v as { id?: unknown; name?: unknown; size?: unknown };
  if (typeof r.id !== "string" || !/^[a-f0-9]{32}$/.test(r.id)) return null;
  return { id: r.id, name: cleanText(r.name).slice(0, 160) || "file", size: typeof r.size === "number" ? r.size : undefined };
};

function coerce(f: AdminField, raw: unknown, errors: Record<string, string>): unknown {
  switch (f.type) {
    case "boolean":
      return raw === true || raw === "true";
    case "number": {
      const n = Number(raw);
      return Number.isFinite(n) ? Math.trunc(n) : 0;
    }
    case "list":
    case "images": {
      const arr = (Array.isArray(raw) ? raw : String(raw ?? "").split("\n"))
        .map((x) => cleanText(x).slice(0, 400))
        .filter(Boolean)
        .slice(0, 60);
      if (f.type === "images") {
        const urls = arr.map((u) => safeUrl(u));
        if (urls.some((u) => u === null)) errors[f.name] = "Every line must be an http(s) URL or a /path.";
        return urls.filter(Boolean);
      }
      return arr;
    }
    case "file":
      return fileRef(raw);
    case "files":
      return (Array.isArray(raw) ? raw : []).map(fileRef).filter(Boolean).slice(0, 12);
    default: {
      const multi = f.type === "textarea" || f.type === "markdown";
      const v = cleanText(raw, multi);
      const max = f.max ?? (multi ? 8000 : 300);
      if (!v) {
        if (f.required) errors[f.name] = "This field is required.";
        return f.type === "date" || f.type === "url" || f.type === "image" ? null : "";
      }
      if (v.length > max) errors[f.name] = `Maximum ${max} characters.`;
      if (f.type === "select" && f.options && !f.options.some(([o]) => o === v)) errors[f.name] = "Choose one of the listed options.";
      if (f.type === "date" && (!DATE_RE.test(v) || Number.isNaN(new Date(v).getTime()))) errors[f.name] = "Enter a valid date.";
      if (f.type === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) errors[f.name] = "Enter a valid email address.";
        return v.toLowerCase();
      }
      if (f.type === "url" || f.type === "image") {
        const u = safeUrl(v);
        if (u === null) errors[f.name] = "Enter a valid http(s) URL or a /path.";
        return u;
      }
      return v;
    }
  }
}

async function uniqueSlug(ctx: Ctx, wanted: string, excludeId?: string | number): Promise<string> {
  const baseSlug = slugify(wanted) || "item";
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? baseSlug : `${baseSlug}-${i}`;
    const clash = await db
      .select({ id: ctx.cols.id! })
      .from(ctx.table)
      .where(excludeId != null ? and(eq(ctx.cols.slug!, candidate), ne(ctx.cols.id!, excludeId)) : eq(ctx.cols.slug!, candidate))
      .limit(1);
    if (!clash.length) return candidate;
  }
  return `${baseSlug}-${Date.now()}`;
}

async function validate(ctx: Ctx, body: Row, mode: "create" | "update", id?: string | number): Promise<Row> {
  const { def, cols } = ctx;
  const errors: Record<string, string> = {};
  const values: Row = {};
  for (const f of def.fields) {
    if (f.readOnly || f.type === "password" || f.name === "slug") continue;
    if (mode === "update" && (f.lockOnEdit || !(f.name in body))) continue;
    if (!cols[f.name]) continue;
    values[f.name] = coerce(f, body[f.name], errors);
  }
  const slugField = def.fields.find((f) => f.name === "slug");
  if (slugField && def.slugFrom && cols.slug) {
    const given = cleanText(body.slug);
    if (mode === "create") values.slug = await uniqueSlug(ctx, given || String(values[def.slugFrom] || ""));
    else if (given && !slugField.lockOnEdit) values.slug = await uniqueSlug(ctx, given, id);
  }
  if (def.key === "users") {
    const password = typeof body.password === "string" ? body.password : "";
    if (mode === "create" && !password) errors.password = "Set an initial password.";
    if (password) {
      const problem = passwordProblem(password);
      if (problem) errors.password = problem;
      else {
        values.passwordHash = await hashPassword(password);
        values.mustChangePassword = true;
      }
    }
  }
  if (Object.keys(errors).length) throw new ApiError(422, "Please correct the highlighted fields.", errors);
  if (mode === "update" && cols.updatedAt) values.updatedAt = new Date();
  return values;
}

function pgCode(e: unknown): string | undefined {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code || err?.cause?.code;
}

async function activeSuperAdmins(excludeId: number): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(t.users)
    .where(and(eq(t.users.role, "super_admin"), eq(t.users.active, true), ne(t.users.id, excludeId)));
  return r?.n ?? 0;
}

/* -------------------------------- Mutations ------------------------------ */

export async function createRow(key: string, user: SessionUser, body: Row, req: Request): Promise<Row> {
  const ctx = resourceFor(key, user);
  if (!ctx.def.canCreate) throw new ApiError(405, "Records in this module cannot be created here.");
  const values = await validate(ctx, body, "create");
  try {
    const [row] = (await db.insert(ctx.table).values(values).returning()) as Row[];
    await audit({ user, action: "create", entity: key, entityId: String(row!.id), summary: String(row![ctx.def.titleField] ?? ""), req });
    return strip(ctx.def, row!);
  } catch (e) {
    if (pgCode(e) === "23505") throw new ApiError(409, "A record with the same unique value (for example email or slug) already exists.");
    throw e;
  }
}

export async function updateRow(key: string, user: SessionUser, rawId: string, body: Row, req: Request): Promise<Row> {
  const { ctx, row: existing, id } = await getRow(key, user, rawId);
  if (!ctx.def.canEdit) throw new ApiError(405, "Records in this module cannot be edited.");
  const values = await validate(ctx, body, "update", id);
  if (key === "users") {
    const self = id === user.id;
    const demoting = "role" in values && values.role !== "super_admin" && existing.role === "super_admin";
    const deactivating = values.active === false && existing.active === true;
    if (self && (demoting || deactivating)) throw new ApiError(400, "You cannot demote or deactivate your own account.");
    if ((demoting || deactivating) && existing.role === "super_admin" && (await activeSuperAdmins(id as number)) === 0)
      throw new ApiError(400, "At least one active Super Admin is required.");
  }
  if (!Object.keys(values).length) return strip(ctx.def, existing);
  try {
    const [row] = (await db.update(ctx.table).set(values).where(eq(ctx.cols.id!, id)).returning()) as Row[];
    if (key === "users" && (values.passwordHash || values.active === false)) {
      // Force re-authentication everywhere after a password reset or deactivation.
      await db.delete(t.sessions).where(self(id, user) ? sql`false` : eq(t.sessions.userId, id as number));
    }
    const changed = Object.keys(values).filter((k) => k !== "updatedAt" && k !== "passwordHash");
    await audit({
      user,
      action: "published" in body && Object.keys(body).length === 1 ? (body.published ? "publish" : "unpublish") : "update",
      entity: key,
      entityId: String(id),
      summary: `${String(row![ctx.def.titleField] ?? "")} — ${values.passwordHash ? "password reset; " : ""}fields: ${changed.join(", ")}`,
      req,
    });
    return strip(ctx.def, row!);
  } catch (e) {
    if (pgCode(e) === "23505") throw new ApiError(409, "A record with the same unique value (for example email or slug) already exists.");
    throw e;
  }
}

const self = (id: string | number, user: SessionUser) => id === user.id;

export async function deleteRow(key: string, user: SessionUser, rawId: string, req: Request) {
  const { ctx, row, id } = await getRow(key, user, rawId);
  if (!ctx.def.canDelete) throw new ApiError(405, "Records in this module cannot be deleted.");
  if (key === "users") {
    if (id === user.id) throw new ApiError(400, "You cannot delete your own account.");
    if (row.role === "super_admin" && row.active && (await activeSuperAdmins(id as number)) === 0)
      throw new ApiError(400, "At least one active Super Admin is required.");
  }
  if (key === "leads" && !can(user.role, "settings")) throw new ApiError(403, "Only administrators can delete leads.");
  await db.delete(ctx.table).where(eq(ctx.cols.id!, id));
  await audit({ user, action: "delete", entity: key, entityId: String(id), summary: String(row[ctx.def.titleField] ?? ""), req });
}

/* ---------------------------------- CSV ---------------------------------- */

function cell(v: unknown): string {
  let s: string;
  if (v == null) s = "";
  else if (v instanceof Date) s = v.toISOString();
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Row[]): string {
  if (!rows.length) return "\uFEFF";
  const headers = Object.keys(rows[0]!);
  const lines = [headers.map(cell).join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))];
  return `\uFEFF${lines.join("\r\n")}`;
}
