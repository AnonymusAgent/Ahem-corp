import { apiUser, audit } from "@/lib/auth";
import { ApiError, enforceRateLimit, jsonError } from "@/lib/security";
import type { Permission } from "@/lib/site";
import { saveUpload, type FileKind } from "@/lib/storage";

const KIND_PERMISSION: Partial<Record<FileKind, Permission>> = {
  media: "media",
  tender: "tenders",
  certification: "certifications",
  profile: "settings",
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const kind = String(form.get("kind") || "media") as FileKind;
    const permission = KIND_PERMISSION[kind];
    if (!permission) throw new ApiError(400, "Unknown upload type.");
    const user = await apiUser(req, permission);
    await enforceRateLimit(req, "admin-upload", 120, 600);
    const file = form.get("file");
    if (typeof file !== "object" || file === null) throw new ApiError(400, "No file was uploaded.");
    const ref = await saveUpload(file, kind, user.id);
    await audit({ user, action: "upload", entity: kind, entityId: ref.id, summary: `Uploaded ${ref.name}`, req });
    return Response.json({ file: ref, url: `/api/files/${ref.id}` }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
