import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, certifications, leads } from "@/db/schema";
import { audit, getUser } from "@/lib/auth";
import { jsonError, ApiError } from "@/lib/security";
import { can, leadTypesForRole } from "@/lib/site";
import { FILE_KINDS, readFile, type FileKind } from "@/lib/storage";

/** Serves stored files. Public assets are open; everything else requires a signed-in, authorised user. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const file = await readFile(id);
    if (!file) throw new ApiError(404, "File not found.");
    const kind = file.meta.kind as FileKind;
    let isPublic = FILE_KINDS[kind]?.public === true;

    if (!isPublic) {
      const user = await getUser();
      if (kind === "certification") {
        const [open] = await db
          .select({ id: certifications.id })
          .from(certifications)
          .where(and(eq(certifications.published, true), eq(certifications.visibility, "public"), sql`${certifications.file}->>'id' = ${id}`))
          .limit(1);
        if (open) isPublic = true;
        else if (!user || !can(user.role, "certifications")) throw new ApiError(user ? 403 : 401, "This document is not publicly available.");
      } else if (kind === "lead") {
        if (!user || !can(user.role, "leads")) throw new ApiError(user ? 403 : 401, "Sign in to download this file.");
        const [lead] = await db
          .select({ type: leads.type, reference: leads.reference })
          .from(leads)
          .where(sql`${leads.attachments} @> ${JSON.stringify([{ id }])}::jsonb`)
          .limit(1);
        if (!lead || !(leadTypesForRole(user.role) as string[]).includes(lead.type)) throw new ApiError(403, "You do not have access to this attachment.");
        await audit({ user, action: "download", entity: "leads", entityId: lead.reference, summary: `Downloaded attachment ${file.meta.name}`, req });
      } else if (kind === "resume") {
        if (!user || !can(user.role, "applications")) throw new ApiError(user ? 403 : 401, "Sign in to download this file.");
        const [app] = await db.select({ reference: applications.reference }).from(applications).where(sql`${applications.resume}->>'id' = ${id}`).limit(1);
        await audit({ user, action: "download", entity: "applications", entityId: app?.reference ?? "", summary: `Downloaded CV ${file.meta.name}`, req });
      } else {
        throw new ApiError(403, "This file is not available.");
      }
    }

    const ascii = file.meta.name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
    const forceDownload = new URL(req.url).searchParams.has("download");
    return new Response(file.data as unknown as BodyInit, {
      headers: {
        "Content-Type": file.meta.mime,
        "Content-Length": String(file.data.length),
        "Content-Disposition": `${file.inline && !forceDownload ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.meta.name)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": isPublic && FILE_KINDS[kind]?.public ? "public, max-age=31536000, immutable" : "private, no-store",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
