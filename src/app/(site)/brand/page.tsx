import { Download } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PageHero, SectionHead } from "@/components/ui";
import { BRAND } from "@/lib/logo";
import { pageMeta } from "@/lib/seo";

export const metadata = { ...pageMeta({ title: "Brand Identity & Logo", description: "Ahem Corporation logo variations, brand colours and typography.", path: "/brand" }), robots: { index: false } };

const FILES = [
  ["Horizontal", "ahem-logo-horizontal.svg"], ["Horizontal — reversed", "ahem-logo-horizontal-reversed.svg"], ["Vertical", "ahem-logo-vertical.svg"],
  ["Vertical — reversed", "ahem-logo-vertical-reversed.svg"], ["Icon", "ahem-icon.svg"], ["Icon — transparent", "ahem-icon-transparent.svg"],
  ["Monochrome navy", "ahem-logo-mono-navy.svg"], ["Monochrome white", "ahem-logo-mono-white.svg"], ["Monochrome black", "ahem-logo-mono-black.svg"],
];

export default function BrandPage() {
  const tile = "flex min-h-56 items-center justify-center rounded-2xl p-8";
  return (
    <>
      <PageHero eyebrow="Brand identity" title="The Ahem Corporation mark." intro="An A-frame of two structural members rising from a ground line and enclosing a three-tower skyline — structure, buildings and infrastructure in a single symbol." crumbs={[{ label: "Brand" }]} />
      <section className="section bg-white">
        <div className="wrap">
          <SectionHead eyebrow="Logo variations" title="Horizontal, vertical, icon and monochrome." intro="Every variation works on light and dark backgrounds and scales from a favicon to site signage, equipment livery and tender documents." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className={`${tile} bg-navy`}><Logo size={56} /></div>
            <div className={`${tile} border border-line bg-white`}><Logo tone="dark" size={56} /></div>
            <div className={`${tile} bg-mist`}><Logo variant="vertical" tone="dark" size={48} /></div>
            <div className={`${tile} bg-navy-900`}><Logo variant="vertical" size={48} /></div>
            <div className={`${tile} gap-8 bg-charcoal text-white`}><Logo variant="icon" size={84} /><Logo variant="icon" tone="mono" size={84} /></div>
            <div className={`${tile} gap-8 border border-line bg-white text-navy`}><Logo tone="mono" size={48} /></div>
          </div>
          <h2 className="mt-16 font-display text-2xl font-semibold text-navy">Download logo files (SVG)</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FILES.map(([label, file]) => (
              <li key={file}>
                <a href={`/brand/${file}`} download className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line px-5 text-sm font-medium text-navy transition hover:border-navy">
                  {label} <Download className="h-4 w-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section bg-mist">
        <div className="wrap grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Colour" title="Brand palette" />
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {([["Deep Navy", BRAND.navy, "text-white"], ["Construction Gold", BRAND.gold, "text-navy"], ["Charcoal", BRAND.charcoal, "text-white"], ["White", BRAND.white, "text-navy"], ["Light Grey", BRAND.grey, "text-navy"]] as const).map(([name, hex, text]) => (
                <li key={hex} className={`flex aspect-square flex-col justify-end rounded-2xl border border-line p-4 ${text}`} style={{ background: hex }}>
                  <span className="font-display text-sm font-semibold">{name}</span>
                  <span className="font-mono text-xs opacity-80">{hex}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow="Typography" title="Plus Jakarta Sans & Inter" />
            <div className="mt-10 space-y-6">
              <p className="font-display text-5xl font-semibold text-navy">Aa — Building Infrastructure.</p>
              <p className="text-sm uppercase tracking-[0.2em] text-charcoal/60">Plus Jakarta Sans · headlines</p>
              <p className="max-w-lg text-lg leading-relaxed text-charcoal/80">Inter is used for body copy, forms and data — chosen for clarity at small sizes in tender documents and dashboards alike.</p>
              <p className="text-sm uppercase tracking-[0.2em] text-charcoal/60">Inter · body text</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
