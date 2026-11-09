import Link from "next/link";
import { Download, FileLock2, Info, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SampleTag } from "@/components/ui";
import { getCertifications } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { CERT_CATEGORIES, formatDate } from "@/lib/site";

export const metadata = pageMeta({
  title: "Certifications & Compliance",
  description: "Company registration, tax registration, contractor and engineering registrations, safety and quality certifications and insurance documentation.",
  path: "/certifications",
});

export default async function CertificationsPage() {
  const certs = await getCertifications();
  const groups = (Object.keys(CERT_CATEGORIES) as (keyof typeof CERT_CATEGORIES)[]).map((cat) => ({ cat, items: certs.filter((c) => c.category === cat) })).filter((g) => g.items.length);
  const hasSample = certs.some((c) => c.isSample);
  return (
    <>
      <PageHero eyebrow="Certifications & compliance" title="Registrations, certifications and compliance documents." intro="Documents are published by our compliance team. Some can be downloaded directly; others are shared with procurement authorities on request." crumbs={[{ label: "Certifications" }]} />
      <section className="section bg-white">
        <div className="wrap">
          {hasSample && (
            <p className="mb-12 flex gap-3 rounded-2xl border border-dashed border-gold-600/50 bg-gold-100 p-5 text-sm leading-relaxed text-gold-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Entries marked “Placeholder” show the document categories this page will hold. They are not statements that a registration or certificate has been issued — details and files appear once the official documents are uploaded.
            </p>
          )}
          {groups.length === 0 && <p className="rounded-2xl border border-dashed border-navy/20 bg-mist p-12 text-center text-charcoal/70">Compliance documents will be published here.</p>}
          <div className="space-y-14">
            {groups.map((g) => (
              <div key={g.cat}>
                <h2 className="flex items-center gap-3 font-display text-xl font-semibold text-navy"><span className="h-px w-8 bg-gold" aria-hidden />{CERT_CATEGORIES[g.cat]}</h2>
                <ul className="mt-6 grid gap-5 md:grid-cols-2">
                  {g.items.map((c, i) => (
                    <li key={c.id}>
                      <Reveal delay={(i % 2) * 0.07} className="card flex h-full flex-col p-7">
                        <div className="flex items-start justify-between gap-3">
                          <ShieldCheck className="h-8 w-8 text-gold-600" strokeWidth={1.5} aria-hidden />
                          {c.isSample && <SampleTag label="Placeholder" />}
                        </div>
                        <h3 className="mt-4 font-display text-lg font-semibold text-navy">{c.title}</h3>
                        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          {c.issuer && <><dt className="text-charcoal/55">Issuing authority</dt><dd className="text-navy">{c.issuer}</dd></>}
                          {c.number && <><dt className="text-charcoal/55">Number</dt><dd className="font-mono text-navy">{c.number}</dd></>}
                          {c.issuedOn && <><dt className="text-charcoal/55">Issued</dt><dd className="text-navy">{formatDate(c.issuedOn)}</dd></>}
                          {c.validUntil && <><dt className="text-charcoal/55">Valid until</dt><dd className="text-navy">{formatDate(c.validUntil)}</dd></>}
                        </dl>
                        {c.description && <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal/70">{c.description}</p>}
                        <div className="mt-6">
                          {c.file ? (
                            <a href={`/api/files/${c.file.id}?download`} className="btn-navy !min-h-11 !px-5"><Download className="h-4 w-4" aria-hidden /> Download document</a>
                          ) : c.hasFile ? (
                            <Link href="/inquiry?type=company-profile" className="btn-outline !min-h-11 !px-5"><FileLock2 className="h-4 w-4" aria-hidden /> Request this document</Link>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm text-charcoal/60"><FileLock2 className="h-4 w-4" aria-hidden /> Document not yet uploaded</span>
                          )}
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Need our pre-qualification documents?" text="Request the company profile and compliance pack for vendor registration or tender evaluation." />
    </>
  );
}
