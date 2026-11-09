import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { audit, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { ensureDb } from "@/lib/bootstrap";
import { cleanText } from "@/lib/forms";
import { ApiError, assertSameOrigin, clientIp, enforceRateLimit, isHttps, jsonError, rateLimit } from "@/lib/security";

// Verified against when the account does not exist, so response time does not reveal valid emails.
let dummyHash: Promise<string> | null = null;

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = cleanText(body.email).toLowerCase().slice(0, 160);
    const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    if (!email || !password) throw new ApiError(400, "Enter your email and password.");
    await ensureDb();
    await enforceRateLimit(req, "login-ip", 30, 900);
    if (!(await rateLimit(`login:${email}`, 8, 900))) {
      throw new ApiError(429, "Too many sign-in attempts for this account. Please wait 15 minutes and try again.");
    }
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    dummyHash ??= hashPassword("not-a-real-password-0");
    const valid = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
    if (!user || !valid || !user.active) {
      await audit({ actor: email, action: "login_failed", entity: "auth", summary: "Failed sign-in attempt", req });
      throw new ApiError(401, "Incorrect email or password.");
    }
    await createSession(user.id, {
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent") || "",
      https: isHttps(req),
      embedded: body.embedded === true,
    });
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await audit({ actor: `${user.name} <${user.email}>`, action: "login", entity: "auth", entityId: user.id, summary: "Signed in", req });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
