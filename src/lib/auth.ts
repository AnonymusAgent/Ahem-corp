import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { and, eq, gt, ne } from "drizzle-orm";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { db } from "@/db";
import { auditLogs, sessions, users } from "@/db/schema";
import { can, type Permission, type Role } from "./site";
import { ApiError, assertSameOrigin, clientIp } from "./security";

export const SESSION_COOKIE = "ahem_session";
const SESSION_DAYS = 7;
const SCRYPT = { N: 16384, r: 8, p: 1 };

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

/* ------------------------------- Passwords ------------------------------- */

function derive(password: string, salt: Buffer, N: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N, r, p }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, SCRYPT.N, SCRYPT.r, SCRYPT.p);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  try {
    const expected = Buffer.from(parts[5]!, "base64");
    const key = await derive(password, Buffer.from(parts[4]!, "base64"), Number(parts[1]), Number(parts[2]), Number(parts[3]));
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 200) return "Password is too long.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Password must include letters and numbers.";
  return null;
}

/* -------------------------------- Sessions ------------------------------- */

const sha = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(
  userId: number,
  opts: { ip: string; userAgent: string; https: boolean; embedded: boolean },
) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  // Only a SHA-256 digest of the token is stored, so a database leak cannot be replayed as a session.
  await db.insert(sessions).values({
    tokenHash: sha(token),
    userId,
    ip: opts.ip,
    userAgent: opts.userAgent.slice(0, 300),
    expiresAt,
  });
  // When the admin is opened inside a cross-site iframe (hosted previews), browsers only accept
  // SameSite=None + Secure (+ Partitioned) cookies. Everywhere else the stricter Lax policy is used.
  const thirdParty = opts.https && opts.embedded;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: opts.https,
    sameSite: thirdParty ? "none" : "lax",
    partitioned: thirdParty ? true : undefined,
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha(token)));
  jar.delete(SESSION_COOKIE);
}

export async function destroyOtherSessions(userId: number) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db
    .delete(sessions)
    .where(token ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, sha(token))) : eq(sessions.userId, userId));
}

export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      mustChangePassword: users.mustChangePassword,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha(token)), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
    .limit(1);
  const row = rows[0];
  return row ? { ...row, role: row.role as Role } : null;
});

/** For server components / pages: redirects when not signed in or not permitted. */
export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

/** For route handlers: verifies CSRF protections on mutations, the session and the permission. */
export async function apiUser(req: Request, permission: Permission): Promise<SessionUser> {
  if (req.method !== "GET" && req.method !== "HEAD") assertSameOrigin(req);
  const user = await getUser();
  if (!user) throw new ApiError(401, "Your session has expired. Please sign in again.");
  if (!can(user.role, permission)) throw new ApiError(403, "You do not have permission to do this.");
  return user;
}

/* -------------------------------- Audit log ------------------------------ */

export async function audit(entry: {
  user?: SessionUser | null;
  actor?: string;
  action: string;
  entity?: string;
  entityId?: string | number;
  summary?: string;
  req?: Request;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: entry.user?.id ?? null,
      actor: entry.user ? `${entry.user.name} <${entry.user.email}>` : entry.actor || "System",
      action: entry.action,
      entity: entry.entity || "",
      entityId: entry.entityId != null ? String(entry.entityId) : "",
      summary: (entry.summary || "").slice(0, 500),
      ip: entry.req ? clientIp(entry.req) : "",
    });
  } catch (e) {
    console.error("[audit] failed to write audit entry", e);
  }
}
