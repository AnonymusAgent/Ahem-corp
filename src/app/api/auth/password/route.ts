import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { apiUser, audit, destroyOtherSessions, hashPassword, passwordProblem, verifyPassword } from "@/lib/auth";
import { ApiError, enforceRateLimit, jsonError } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const user = await apiUser(req, "dashboard");
    await enforceRateLimit(req, "password", 10, 900);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const current = typeof body.current === "string" ? body.current : "";
    const next = typeof body.next === "string" ? body.next : "";
    const [row] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!row || !(await verifyPassword(current, row.passwordHash))) {
      throw new ApiError(422, "Please correct the highlighted fields.", { current: "Current password is incorrect." });
    }
    const problem = passwordProblem(next);
    if (problem) throw new ApiError(422, "Please correct the highlighted fields.", { next: problem });
    if (next === current) throw new ApiError(422, "Please correct the highlighted fields.", { next: "Choose a password you have not used before." });
    await db.update(users).set({ passwordHash: await hashPassword(next), mustChangePassword: false }).where(eq(users.id, user.id));
    await destroyOtherSessions(user.id);
    await audit({ user, action: "password_change", entity: "auth", entityId: user.id, summary: "Changed own password", req });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
