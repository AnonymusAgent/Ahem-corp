import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, FileText, Info } from "lucide-react";
import { LeadForm } from "@/components/Forms";
import { Reveal } from "@/components/Motion";
import { PageHero, RichText, SampleTag, StatusPill } from "@/components/ui";
import { getTender } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { daysUntil, formatBytes, formatDate, TENDER_SECTORS, TENDER_STATUSES, tenderStatus } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const t = await getTender((await params).slug);
  if (!t) return { title: "Tender not found" };
  return pageMeta({ title: `${t.title} (${t.reference})`, description: `${TENDER_SECTORS[t.sector as keyof typeof TENDER_SECTORS] ?? ""} tender — ${t.issuer}. ${t.description}`, path: `/tenders/${t.slug}` });
}

export default async function TenderPage({ params }: Props) {
  const t = await getTender((await params).slug);
  if (!t) notFound();
  const status = tenderStatus(t);
  const live = status === "open" || status === "closing_soon";
  const left = daysUntil(t.deadline);
  const facts: [string, string][] = [
    ["Reference number", t.reference],
    ["Issuing organization", t.issuer],
    ["Sector", TENDER_SECTORS[t.sector as keyof typeof TENDER_SECTORS] ?? t.sector],
    ["Category", t.category],
    ["Location", [t.city, t.province].filter(Boolean).join(", ") || "—"],
    ["Publication date", formatDate(t.publishedOn)],
    ["Submission deadline", formatDate(t.deadline)],
    ...(t.estimatedValue ? ([["Estimated value", t.estimatedValue]] as [string, string][]) : []),
  ];
  return (
    <>
      <PageHero eyebrow={`Tender · ${t.reference}`} title={t.title} crumbs={[{ label: "Tenders", href: "/tenders" }, { label: t.reference }]}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={status} label={TENDER_STATUSES[status]} />
          <span className="pill bg-white/10 text-white">{TENDER_SECTORS[t.sector as keyof typeof TENDER_SECTORS] ?? t.sector}</span>
          {t.isSample && <SampleTag label="Sample tender" />}
          {live && left !== null && <span className="text-sm text-white/70">{left} day{left === 1 ? "" : "s"} until the deadline</span>}
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="space-y-14">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-navy">Tender description</h2>
              <RichText text={t.description} className="mt-5" />
            </Reveal>
            {t.eligibility.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-semibold text-navy">Eligibility requirements</h2>
                <ul className="mt-5 space-y-3">
                  {t.eligibility.map((x) => <li key={x} className="flex gap-3 text-charcoal/85"><Check className="mt-1 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}</li>)}
                </ul>
              </Reveal>
            )}
            {t.requiredDocs.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-semibold text-navy">Required documentation</h2>
                <ul className="mt-5 space-y-3">
                  {t.requiredDocs.map((x) => <li key={x} className="flex gap-3 text-charcoal/85"><FileText className="mt-1 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}</li>)}
                </ul>
              </Reveal>
            )}
            {t.instructions && (
              <Reveal>
                <h2 className="font-display text-2xl font-semibold text-navy">Application / inquiry instructions</h2>
                <RichText text={t.instructions} className="mt-5" />
              </Reveal>
            )}
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-navy">Tender documents</h2>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href={`/api/tenders/${t.slug}/pdf`} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-navy">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold"><Download className="h-5 w-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold text-navy">Tender notice summary (PDF)</span><span className="text-xs text-charcoal/60">Generated from this listing</span></span>
                  </a>
                </li>
                {t.attachments.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/files/${f.id}?download`} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-navy">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-navy"><FileText className="h-5 w-5" aria-hidden /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-navy">{f.name}</span>{f.size ? <span className="text-xs text-charcoal/60">{formatBytes(f.size)}</span> : null}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
            <dl className="overflow-hidden rounded-3xl border border-line">
              <div className="bg-navy px-7 py-5 font-display text-lg font-semibold text-white">Tender details</div>
              {facts.map(([k, v]) => (
                <div key={k} className="border-t border-line px-7 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal/55">{k}</dt>
                  <dd className="mt-1 text-sm font-medium text-navy">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 flex gap-3 rounded-2xl bg-mist p-5 text-sm leading-relaxed text-charcoal/75">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden />
              This listing is an information summary. Deadlines, eligibility and requirements must be confirmed against the official documents issued by the procuring organization.
            </p>
            <Link href="/tenders" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy"><ArrowLeft className="h-4 w-4" aria-hidden /> All tenders</Link>
          </Reveal>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="wrap max-w-4xl">
          <div className="card p-6 sm:p-10">
            <LeadForm initialType="business-inquiry" only={["business-inquiry", "tender-invitation"]} prefill={{ subject: `${t.reference} — ${t.title}`.slice(0, 200) }} />
          </div>
        </div>
      </section>
    </>
  );
}
