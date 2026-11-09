import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { apiUser, audit } from "@/lib/auth";
import { ApiError, jsonError } from "@/lib/security";

const SAMPLE_TABLES = {
  projects: t.projects,
  tenders: t.tenders,
  clients: t.clients,
  certifications: t.certifications,
  jobs: t.jobs,
  news: t.news,
  testimonials: t.testimonials,
  leads: t.leads,
} as const;

/** Removes demonstration records (rows flagged is_sample) from one module or from all of them. */
export async function DELETE(req: Request) {
  try {
    const user = await apiUser(req, "settings");
    const entity = new URL(req.url).searchParams.get("entity") || "";
    const keys = entity === "all" ? Object.keys(SAMPLE_TABLES) : [entity];
    let removed = 0;
    for (const key of keys) {
      const table = SAMPLE_TABLES[key as keyof typeof SAMPLE_TABLES];
      if (!table) throw new ApiError(400, "Unknown module.");
      const rows = await db.delete(table).where(eq(table.isSample, true)).returning({ id: table.id });
      removed += rows.length;
    }
    await audit({ user, action: "delete", entity: "sample-data", entityId: entity, summary: `Removed ${removed} sample record(s) from ${entity}`, req });
    return Response.json({ ok: true, removed });
  } catch (e) {
    return jsonError(e);
  }
}
