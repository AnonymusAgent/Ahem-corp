import Link from "next/link";
import { ArrowRight, Download, FileText, FolderDown, IdCard, Palette } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Downloads & Resources",
  description: "Download the Ahem Corporation corporate profile, tender notices, brand logo files, and request pre-qualification and certification documents.",
  path: "/downloads",
});

const BRAND_FILES = [
  ["Horizontal logo", "ahem-logo-horizontal.svg"],
  ["Horizontal logo — reversed", "ahem-logo-horizontal-reversed.svg"],
  ["Vertical logo", "ahem-logo-vertical.svg"],
  ["Vertical logo — reversed", "ahem-logo-vertical-reversed.svg"],
  ["Icon", "ahem-icon.svg"],
  ["Icon — transparent", "ahem-icon-transparent.svg"],
  ["Monochrome navy", "ahem-logo-mono-navy.svg"],
  ["Monochrome white", "ahem-logo-mono-white.svg"],
  ["Monochrome black", "ahem-logo-mono-black.svg"],
] as const;

export default function DownloadsPage() {
  return (
    <>
      <PageHero
        eyebrow="Downloads & resources"
        title="Documents, profiles and brand assets."
        intro="Everything you need for vendor registration, tender evaluation and partnership review — in one place. Documents marked “on request” are shared with procurement authorities after a short request."
        crumbs={[{ label: "Downloads" }]}
      >
        <a href="/api/corporate-profile" className="btn-gold"><Download className="h-4 w-4" aria-hidden /> Corporate profile (PDF)</a>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="Company documents" title="Corporate profile and tender documents." />
          </Reveal>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            <li>
              <Reveal className="card flex h-full flex-col p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                  <FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy">Corporate profile (PDF)</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">Company overview, services, capabilities and delivery approach. Generated from current website settings — or the official uploaded profile where one exists.</p>
                <a href="/api/corporate-profile" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
                  <Download className="h-4 w-4" aria-hidden /> <span className="link-underline">Download PDF</span>
                </a>
              </Reveal>
            </li>
            <li>
              <Reveal delay={0.07} className="card flex h-full flex-col p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                  <FolderDown className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy">Tender notices (PDF)</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">Each public tender announcement in the Tenders section has a downloadable PDF notice with the reference, issuer, deadline and scope summary.</p>
                <Link href="/tenders" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
                  <ArrowRight className="h-4 w-4" aria-hidden /> <span className="link-underline">Browse tenders</span>
                </Link>
              </Reveal>
            </li>
            <li>
              <Reveal delay={0.14} className="card flex h-full flex-col p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                  <IdCard className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy">Registrations & certificates</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">Company registration, tax, contractor and engineering registrations, safety and quality certificates, and insurance. Public documents download directly; others are shared on request.</p>
                <Link href="/certifications" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
                  <ArrowRight className="h-4 w-4" aria-hidden /> <span className="link-underline">View certifications</span>
                </Link>
              </Reveal>
            </li>
            <li>
              <Reveal delay={0.21} className="card flex h-full flex-col p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                  <Palette className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy">Brand assets</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">Logo variations in SVG for tender documents, signage and publications. See the Brand page for colours and typography.</p>
                <Link href="/brand" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
                  <ArrowRight className="h-4 w-4" aria-hidden /> <span className="link-underline">Open brand page</span>
                </Link>
              </Reveal>
            </li>
          </ul>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="Logo files (SVG)" title="Download the mark." intro="For print and digital use in tender documents and publications. Please do not alter the logo or use it in a way that implies endorsement." />
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BRAND_FILES.map(([label, file], i) => (
              <li key={file}>
                <Reveal delay={(i % 3) * 0.06}>
                  <a href={`/brand/${file}`} download className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 text-sm font-medium text-navy transition hover:border-navy">
                    {label} <Download className="h-4 w-4 shrink-0" aria-hidden />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-white">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <SectionHead eyebrow="Need the full pack?" title="Request pre-qualification documents." intro="For vendor registration and tender evaluation we provide the complete pack — registrations, certificates, insurance and company profile — through a single request." />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/inquiry?type=company-profile" className="btn-navy">Request company profile pack</Link>
            <Link href="/inquiry?type=meeting" className="btn-outline">Schedule a meeting</Link>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
