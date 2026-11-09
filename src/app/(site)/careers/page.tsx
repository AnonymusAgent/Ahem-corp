import Link from "next/link";
import { ArrowUpRight, Briefcase, CalendarDays, GraduationCap, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Reveal } from "@/components/Motion";
import { PageHero, SampleTag, SectionHead } from "@/components/ui";
import { getJobs } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { formatDate, todayISO } from "@/lib/site";

export const metadata = pageMeta({
  title: "Careers — Construction & Engineering Jobs",
  description: "Current vacancies at Ahem Corporation for engineers, quantity surveyors, HSE professionals and project managers. Apply online with your CV.",
  path: "/careers",
});

export default async function CareersPage() {
  const jobs = await getJobs();
  const today = todayISO();
  return (
    <>
      <PageHero eyebrow="Careers" title="Build your career on projects that matter." intro="Join a team of engineers, builders and managers delivering infrastructure and buildings for public and private clients." crumbs={[{ label: "Careers" }]}>
        <a href="#vacancies" className="btn-gold">View current vacancies</a>
      </PageHero>
      <section className="bg-white py-16">
        <ul className="wrap grid gap-5 md:grid-cols-3">
          {([[ShieldCheck, "Safety-first culture", "Every site runs on planning, briefing and the authority to stop unsafe work."], [GraduationCap, "Professional growth", "Structured exposure to planning, quality, contracts and site leadership."], [HeartHandshake, "Respect and fairness", "Merit-based recruitment and clear expectations for everyone on the team."]] as const).map(([Icon, t, d], i) => (
            <li key={t}>
              <Reveal delay={i * 0.08} className="card h-full p-7">
                <Icon className="h-8 w-8 text-gold-600" strokeWidth={1.5} aria-hidden />
                <h2 className="mt-4 font-display text-lg font-semibold text-navy">{t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{d}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <section id="vacancies" className="section bg-mist">
        <div className="wrap">
          <SectionHead eyebrow="Current vacancies" title="Open positions" />
          <ul className="mt-10 space-y-4">
            {jobs.length === 0 && <li className="rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center text-charcoal/70">There are no open positions right now. You are welcome to send a general application below.</li>}
            {jobs.map((j, i) => {
              const closed = !!j.closingDate && j.closingDate < today;
              return (
                <li key={j.id}>
                  <Reveal delay={i * 0.05}>
                    <Link href={`/careers/${j.slug}`} className="group flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 transition hover:border-navy/40 hover:shadow-[0_24px_50px_-30px_rgba(16,36,58,0.4)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-semibold text-navy">{j.title}</h3>
                          {j.isSample && <SampleTag label="Sample vacancy" />}
                          {closed && <span className="pill bg-slate-100 text-slate-700">Closed</span>}
                        </div>
                        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-charcoal/70">
                          <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" aria-hidden />{[j.department, j.employmentType].filter(Boolean).join(" · ")}</span>
                          {j.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{j.location}</span>}
                          {j.closingDate && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden />Closes {formatDate(j.closingDate)}</span>}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">View & apply <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section id="apply" className="section bg-white">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead eyebrow="General application" title="Don’t see your role?" intro="Send us your CV. We keep general applications on file and contact candidates when a suitable position opens." />
          <div className="card p-6 sm:p-9"><ApplicationForm /></div>
        </div>
      </section>
    </>
  );
}
