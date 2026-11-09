import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { ApplicationForm } from "@/components/ApplicationForm";
import { PageHero, RichText, SampleTag } from "@/components/ui";
import { getJob } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { formatDate, todayISO } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const j = await getJob((await params).slug);
  if (!j) return { title: "Vacancy not found" };
  return pageMeta({ title: `${j.title} — Careers`, description: j.description, path: `/careers/${j.slug}` });
}

export default async function JobPage({ params }: Props) {
  const [j, SITE_URL] = await Promise.all([getJob((await params).slug), getSiteUrl()]);
  if (!j) notFound();
  const closed = !!j.closingDate && j.closingDate < todayISO();
  // Structured data is emitted for genuine vacancies only — never for sample records.
  const schema = !j.isSample && !closed && {
    "@context": "https://schema.org", "@type": "JobPosting", title: j.title, description: j.description, datePosted: j.createdAt.toISOString().slice(0, 10),
    ...(j.closingDate ? { validThrough: j.closingDate } : {}), employmentType: j.employmentType, hiringOrganization: { "@id": `${SITE_URL}/#organization` },
    jobLocation: { "@type": "Place", address: j.location },
  };
  const facts = [["Department", j.department], ["Location", j.location], ["Employment type", j.employmentType], ["Experience", j.experience], ["Closing date", formatDate(j.closingDate)]].filter(([, v]) => v && v !== "—");
  return (
    <>
      <PageHero eyebrow="Careers" title={j.title} intro={j.description} crumbs={[{ label: "Careers", href: "/careers" }, { label: j.title }]}>
        <div className="flex flex-wrap items-center gap-3">
          {!closed && <a href="#apply" className="btn-gold">Apply for this position</a>}
          {j.isSample && <SampleTag label="Sample vacancy" />}
        </div>
      </PageHero>
      <section className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="space-y-12">
            <div>
              <h2 className="font-display text-2xl font-semibold text-navy">Job description</h2>
              <RichText text={j.description} className="mt-5" />
            </div>
            {([["Responsibilities", j.responsibilities], ["Position requirements", j.requirements]] as const).map(([title, items]) => items.length > 0 && (
              <div key={title}>
                <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>
                <ul className="mt-5 space-y-3">
                  {items.map((x) => <li key={x} className="flex gap-3 text-charcoal/85"><Check className="mt-1 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="overflow-hidden rounded-3xl border border-line">
              <div className="bg-navy px-7 py-5 font-display text-lg font-semibold text-white">Position details</div>
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 border-t border-line px-7 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal/55">{k}</dt>
                  <dd className="text-right text-sm font-medium text-navy">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/careers" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy"><ArrowLeft className="h-4 w-4" aria-hidden /> All vacancies</Link>
          </aside>
        </div>
      </section>
      <section id="apply" className="section bg-mist">
        <div className="wrap max-w-4xl">
          <div className="card p-6 sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-navy">Apply for {j.title}</h2>
            {closed ? (
              <p className="mt-4 text-charcoal/75">Applications for this position closed on {formatDate(j.closingDate)}. See our <Link href="/careers" className="font-semibold text-navy underline underline-offset-4">current vacancies</Link>.</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-charcoal/70">Complete the form and attach your CV. You will receive an application reference number.</p>
                <div className="mt-8"><ApplicationForm jobId={j.id} /></div>
              </>
            )}
          </div>
        </div>
      </section>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
    </>
  );
}
