import { headers } from "next/headers";
import { SITE_URL } from "./site";

/**
 * Public origin of the site.
 * NEXT_PUBLIC_SITE_URL is authoritative. If it has not been configured, the origin is derived from the
 * current request so canonical URLs, Open Graph tags and the sitemap never point at localhost by mistake.
 */
export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return SITE_URL;
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]!.trim();
    if (!/^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) return SITE_URL;
    const local = /^(localhost|127\.|\[::1\])/.test(host);
    const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || (local ? "http" : "https");
    return `${proto === "https" ? "https" : "http"}://${host}`;
  } catch {
    return SITE_URL;
  }
}
