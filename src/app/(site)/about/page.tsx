import { Download, Eye, Target } from "lucide-react";
import { Parallax, Reveal } from "@/components/Motion";
import { CtaBand, Img, PageHero, RichText, SampleTag, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { initials, parseRows } from "@/lib/site";

export const metadata = pageMeta({
  title: "About Us — Construction & Engineering Company",
  description: "Company overview, mission, vision, history, leadership, engineering capabilities, HSE commitment and quality management at Ahem Corporation.",
  path: "/about",
});

export default async function AboutPage() {
  const s = await getSettings();
  const a = s.about;
  const history = parseRows(a.history, 3);
  const values = parseRows(a.values, 2);
  const leaders = parseRows(a.leadership, 3);
  const caps = parseRows(a.capabilities, 2);
  return (
    <>
      <PageHero eyebrow="About us" title="A contractor built on engineering discipline." intro={s.general.description} image={a.image} crumbs={[{ label: "About us" }]} />

      <section className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHead eyebrow="Company overview" title={`${s.general.companyName} at a glance`} />
            <RichText text={a.overview} className="mt-7" />
            <a href="/api/corporate-profile" className="btn-navy mt-9">
              <Download className="h-4 w-4" aria-hidden /> Download corporate profile (PDF)
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <Parallax amount={12} className="relative aspect-[4/5] rounded-3xl lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <Img src={a.image} alt="Ahem Corporation project team" w={1000} h={1200} className="h-full w-full object-cover" />
            </Parallax>
          </Reveal>
        </div>
      </section>

      <section className="section relative isolate bg-navy text-white">
        <div className="absolute inset-0 -z-10 bg-blueprint" />
        <div className="wrap grid gap-6 lg:grid-cols-2">
          {([["Our mission", a.mission, Target], ["Our vision", a.vision, Eye]] as const).map(([title, text, Icon], i) => (
            <Reveal key={title} delay={i * 0.1} className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-10">
              <Icon className="h-9 w-9 text-gold" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-6 font-display text-2xl font-semibold">{title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <Reveal>
              <SectionHead eyebrow="Company history" title="How we have grown.">
                {a.isSample && <SampleTag className="mt-4" label="Sample milestones" />}
              </SectionHead>
            </Reveal>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
              {history.map(([label, title, text], i) => (
                <li key={`${label}-${i}`} className="bg-white p-7">
                  <Reveal delay={i * 0.08}>
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">{label}</p>
                    <span className="mt-4 block h-px w-full bg-gradient-to-r from-gold to-transparent" aria-hidden />
                    <h3 className="mt-5 font-display text-xl font-semibold text-navy">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {values.length > 0 && (
        <section className="section bg-mist bg-blueprint-light">
          <div className="wrap">
            <Reveal><SectionHead eyebrow="Core values" title="What we hold ourselves to." /></Reveal>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {values.map(([title, text], i) => (
                <li key={title}>
                  <Reveal delay={(i % 3) * 0.07} className="card h-full p-7">
                    <span className="font-display text-sm font-semibold text-gold-700">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-navy">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {leaders.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <Reveal>
              <SectionHead eyebrow="Leadership & management" title="The team accountable for delivery.">
                {a.isSample && <SampleTag className="mt-4" label="Sample profiles — names to be published" />}
              </SectionHead>
            </Reveal>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {leaders.map(([name, role, bio], i) => (
                <li key={`${role}-${i}`}>
                  <Reveal delay={i * 0.07} className="card h-full p-7">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-navy font-display text-xl font-semibold text-gold" aria-hidden>
                      {initials(role || name)}
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-navy">{name}</h3>
                    <p className="text-sm font-medium text-gold-700">{role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{bio}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {caps.length > 0 && (
        <section className="section bg-navy-900 text-white">
          <div className="wrap">
            <Reveal><SectionHead light eyebrow="Engineering & technical capabilities" title="In-house expertise behind every bid and every pour." /></Reveal>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {caps.map(([title, text], i) => (
                <li key={title} className="bg-navy-900 p-7">
                  <Reveal delay={(i % 3) * 0.06}>
                    <h3 className="font-display text-lg font-semibold text-gold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section bg-white">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-line p-8 sm:p-10">
            <p className="eyebrow text-gold-700">HSE commitment</p>
            <h2 className="mt-5 font-display text-2xl font-semibold text-navy sm:text-3xl">Health, safety & environment</h2>
            <RichText text={a.hse} className="mt-6" />
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-mist p-8 sm:p-10">
            <p className="eyebrow text-gold-700">QA / QC</p>
            <h2 className="mt-5 font-display text-2xl font-semibold text-navy sm:text-3xl">Quality assurance & quality control</h2>
            <RichText text={a.qaqc} className="mt-6" />
          </Reveal>
        </div>
      </section>
      <CtaBand title="Request our corporate profile and pre-qualification documents." text="Download the profile now, or ask our team for the complete pre-qualification pack for your vendor registration." />
    </>
  );
}
