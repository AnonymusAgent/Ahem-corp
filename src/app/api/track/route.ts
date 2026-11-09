import { createHash } from "node:crypto";
import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { cleanText } from "@/lib/forms";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";
import { todayISO } from "@/lib/site";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|axios/i;

/**
 * First-party, cookie-less page-view counter.
 * Stores the path and a daily-rotating hash of IP + user agent — never the IP itself —
 * so unique visitors can be counted without identifying anyone.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ua = req.headers.get("user-agent") || "";
    const body = (await req.json().catch(() => ({}))) as { path?: unknown };
    const path = cleanText(body.path).split("?")[0]!.slice(0, 200);
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api") || BOT.test(ua)) {
      return new Response(null, { status: 204 });
    }
    const ip = clientIp(req);
    if (!(await rateLimit(`track:${ip}`, 120, 60))) return new Response(null, { status: 204 });
    const day = todayISO();
    const secret = process.env.SESSION_SECRET || process.env.DATABASE_URL || "ahem";
    const visitorHash = createHash("sha256").update(`${day}|${ip}|${ua}|${secret}`).digest("hex").slice(0, 32);
    await db.insert(pageViews).values({ path, visitorHash, day });
  } catch {
    /* analytics must never break the page */
  }
  return new Response(null, { status: 204 });
}
