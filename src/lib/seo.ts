import type { Metadata } from "next";
import { img } from "./site";

export const DEFAULT_OG_IMAGE = "/opengraph-image";

/** Per-page metadata: unique title + description, canonical URL, Open Graph and Twitter cards. */
export function pageMeta(o: { title: string; description: string; path: string; image?: string | null; type?: "website" | "article" }): Metadata {
  const description = o.description.replace(/\s+/g, " ").trim().slice(0, 300);
  // Defining `openGraph` on a page replaces the inherited object, so the default share image is restated here.
  const images = [{ url: o.image ? img(o.image, 1200, 630) : DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: o.title }];
  return {
    title: o.title,
    description,
    alternates: { canonical: o.path },
    openGraph: { title: o.title, description, url: o.path, type: o.type ?? "website", siteName: "Ahem Corporation", images },
    twitter: { card: "summary_large_image", title: o.title, description, images: images.map((i) => i.url) },
  };
}
