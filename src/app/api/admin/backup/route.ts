import { db } from "@/db";
import * as t from "@/db/schema";
import { apiUser, audit } from "@/lib/auth";
import { jsonError } from "@/lib/security";

/**
 * Content & data export (JSON) for Super Admins.
 * Excludes credentials, sessions and file bytes. Full database backups (including uploads)
 * should be taken with pg_dump — see README "Backups".
 */
export async function GET(req: Request) {
  try {
    const user = await apiUser(req, "backup");
    const tables = {
      settings: t.settings, services: t.services, projects: t.projects, tenders: t.tenders, clients: t.clients,
      certifications: t.certifications, jobs: t.jobs, applications: t.applications, news: t.news, testimonials: t.testimonials,
      pages: t.pages, leads: t.leads, leadActivities: t.leadActivities, files: t.files, notifications: t.notifications,
      auditLogs: t.auditLogs, emailLog: t.emailLog,
    };
    const data: Record<string, unknown> = {};
    for (const [name, table] of Object.entries(tables)) data[name] = await db.select().from(table);
    const userRows = await db.select({ id: t.users.id, name: t.users.name, email: t.users.email, role: t.users.role, active: t.users.active, createdAt: t.users.createdAt }).from(t.users);
    await audit({ user, action: "export", entity: "backup", summary: "Downloaded JSON data export", req });
    return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), note: "Excludes password hashes, sessions and file contents.", users: userRows, ...data }, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="ahem-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
