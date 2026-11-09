import { lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Best-effort client IP. Behind a trusted reverse proxy the first X-Forwarded-For hop is the client. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim().slice(0, 64);
  return (req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

export function isHttps(req: Request): boolean {
  // The Origin header is set by the browser, so an https Origin means the browser connection is TLS.
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (origin?.startsWith("https://")) return true;
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0]!.trim() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Fixed-window rate limiter backed by PostgreSQL, so limits hold across
 * multiple server instances. Returns false when the limit is exceeded.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });
  if (Math.random() < 0.02) {
    await db.delete(rateLimits).where(lt(rateLimits.windowStart, now - 86_400)).catch(() => undefined);
  }
  return (row?.count ?? 1) <= limit;
}

export async function enforceRateLimit(req: Request, bucket: string, limit: number, windowSeconds: number) {
  const ok = await rateLimit(`${bucket}:${clientIp(req)}`, limit, windowSeconds);
  if (!ok) throw new ApiError(429, "Too many requests. Please wait a few minutes and try again.");
}

/** CSRF defence for cookie-authenticated and form endpoints.
 *  1. A custom header that cross-site HTML forms cannot set (and CORS is never enabled).
 *  2. Fetch Metadata: browsers label cross-site requests, which are rejected outright. */
export function assertSameOrigin(req: Request) {
  if (req.headers.get("x-ahem-csrf") !== "1") throw new ApiError(403, "Request blocked: missing anti-forgery header.");
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") throw new ApiError(403, "Request blocked: cross-site requests are not allowed.");
}

/** Only allow safe URL schemes for stored links and images. */
export function safeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
  } catch {
    /* fall through */
  }
  return null;
}

export function jsonError(e: unknown): Response {
  if (e instanceof ApiError) {
    return Response.json({ error: e.message, fields: e.fields }, { status: e.status });
  }
  console.error("[api] unexpected error", e);
  return Response.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
}
