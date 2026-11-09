import { desc, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { apiUser, type SessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/security";
import { can, leadTypesForRole } from "@/lib/site";

function visibleTypes(user: SessionUser): string[] {
  const types: string[] = [...leadTypesForRole(user.role)];
  if (can(user.role, "applications")) types.push("application");
  return types;
}

export async function GET(req: Request) {
  try {
    const user = await apiUser(req, "dashboard");
    const types = visibleTypes(user);
    if (!types.length) return Response.json({ items: [], unread: 0 });
    const items = await db.select().from(notifications).where(inArray(notifications.type, types)).orderBy(desc(notifications.createdAt)).limit(12);
    const [u] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(notifications)
      .where(sql`${inArray(notifications.type, types)} and ${isNull(notifications.readAt)}`);
    return Response.json({ items, unread: u?.n ?? 0 });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await apiUser(req, "dashboard");
    const types = visibleTypes(user);
    if (types.length) {
      await db.update(notifications).set({ readAt: new Date() }).where(sql`${inArray(notifications.type, types)} and ${isNull(notifications.readAt)}`);
    }
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
