import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Building, CalendarClock, Check, Download, Droplets, Factory, FileCheck2, GraduationCap,
  HardHat, House, Landmark, Lock, Quote, Route, ShieldCheck, Users, Wallet, Zap,
} from "lucide-react";
import { FeaturedWork } from "@/components/FeaturedWork";
import { ProcessSection } from "@/components/ProcessTimeline";
import { ServiceCard, TenderRow } from "@/components/cards";
import Hero3D, { BlueprintSketch } from "@/components/Hero3D";
import { LogoMark } from "@/components/Logo";
import { Counter, Parallax, Reveal, Tilt } from "@/components/Motion";
import { ArrowLink, CtaBand, Img, SampleTag, SectionHead } from "@/components/ui";
import { getCertifications, getProjects, getServices, getTenders, getTestimonials } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { CERT_CATEGORIES, parseRows, tenderStatus } from "@/lib/site";

export const metadata = { alternates: { canonical: "/" } };

const INDUSTRIES = [
  [Landmark, "Government & public sector", "Departments, authorities and municipalities."],
  [Route, "Transport & highways", "Roads, bridges, interchanges and urban mobility."],
  [Droplets, "Water & utilities", "Supply, drainage, flood protection and networks."],
  [Building, "Commercial & real estate", "Offices, retail, hospitality and mixed-use."],
  [Factory, "Industrial & logistics", "Plants, warehouses and process facilities."],
  [House, "Residential developers", "Housing schemes, apartments and communities."],
  [GraduationCap, "Institutions & NGOs", "Education, healthcare and development programmes."],
  [Zap, "Energy & infrastructure", "Substations, plant buildings and service corridors."],
] as const;

const WHY = [
  [ShieldCheck, "Safety without compromise", "Site-specific HSE plans, permits to work and daily briefings on every project."],
  [BadgeCheck, "Verified quality", "Inspection and test plans, material approvals and traceable records for each activity."],
  [CalendarClock, "Programme discipline", "Baseline schedules, look-ahead planning and honest progress reporting."],
  [Wallet, "Commercial transparency", "Clear BOQ pricing, documented variations and open-book reporting where required."],
  [Users, "Integrated team", "Engineering, construction, MEP and project management under one accountable management."],
  [FileCheck2, "Tender-ready compliance", "Organised pre-qualification documents, registrations and method statements."],
] as const;

export default async function HomePage() {
  const [s, services, projects, tenders, certs, testimonials] = await Promise.all([
    getSettings(), getServices(), getProjects(), getTenders(), getCertifications(), getTestimonials(),
  ]);
  const h = s.home;
  const [line1, ...rest] = h.heroHeadline.split(/(?<=\.)\s+/);
  const stats = parseRows(h.stats, 3).filter((r) => Number.isFinite(Number(r[0])));
  const live = tenders
    .filter((t) => ["open", "closing_soon"].includes(tenderStatus(t)))
    .sort((a, b) => (a.deadline || "9").localeCompare(b.deadline || "9"))
    .slice(0, 3);

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-charcoal pb-28 pt-28 text-white">
        <Parallax mode="hero" amount={20} className="absolute inset-0 -z-30">
          <Img src={h.heroImage} alt="" w={1920} h={1200} priority className="h-full w-full object-cover" />
        </Parallax>
        {/* Cinematic dark gradient: charcoal scrim left for legibility, vignette top/bottom */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-charcoal via-charcoal/85 to-navy-900/40" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-t from-charcoal via-transparent to-charcoal/70" />
        <div className="absolute inset-0 -z-10 bg-blueprint" />

        <div className="wrap grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="rise flex items-center gap-4">
              <LogoMark size={52} />
              <p className="eyebrow text-gold">{h.heroEyebrow}</p>
            </div>
            <h1 className="rise mt-7 font-display text-[2.75rem] font-semibold leading-[1.01] tracking-[-0.03em] sm:text-6xl xl:text-[4.75rem]" style={{ animationDelay: "120ms" }}>
              {line1}
              {rest.length > 0 && <span className="block text-gold">{rest.join(" ")}</span>}
            </h1>
            <p className="rise mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg" style={{ animationDelay: "240ms" }}>
              {h.heroSub}
            </p>
            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "360ms" }}>
              <Link href="/projects" className="btn-gold">
                Explore Our Projects <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/inquiry?type=project-requirement" className="btn-ghost">Discuss Your Project</Link>
            </div>
            <ul className="rise mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70" style={{ animationDelay: "480ms" }}>
              {["Government & public works", "Private & commercial projects", "Design–build & project management"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative hidden h-[560px] lg:block xl:h-[620px]">
            <Hero3D />
          </div>
        </div>
        <BlueprintSketch className="pointer-events-none absolute -right-6 bottom-0 -z-10 hidden h-72 w-80 opacity-40 sm:block lg:hidden" />

        <a href="#intro" className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60 transition hover:text-gold">
          Scroll
          <span className="scroll-cue relative block h-12 w-px overflow-hidden bg-white/25" aria-hidden />
        </a>
      </section>

      {/* ---------------------------- Introduction --------------------------- */}
      <section id="intro" className="section bg-white">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <Parallax amount={14} className="relative aspect-[4/5] rounded-3xl sm:aspect-[5/5]">
              <Img src={h.introImage} alt="Ahem Corporation engineers reviewing plans on site" w={1000} h={1150} className="h-full w-full object-cover" />
            </Parallax>
            <div className="absolute -bottom-6 left-5 right-5 rounded-2xl bg-navy p-6 text-white shadow-2xl sm:-right-6 sm:left-auto sm:w-72">
              <HardHat className="h-7 w-7 text-gold" aria-hidden />
              <p className="mt-3 font-display text-lg font-semibold leading-snug">Engineering, construction and project management in one team.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHead eyebrow="Who we are" title={h.introTitle} intro={h.introBody} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Civil works & infrastructure", "Buildings & structures", "MEP, plumbing & HVAC", "Project management & consultancy"].map((x) => (
                <li key={x} className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3.5 text-sm font-medium text-navy">
                  <span className="h-2 w-2 rotate-45 bg-gold" aria-hidden /> {x}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {([["Mission", s.about.mission], ["Vision", s.about.vision]] as const).map(([label, text]) => (
                <div key={label} className="rounded-2xl border border-line bg-mist p-5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-700">{label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/80">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/about" className="btn-navy">About Ahem Corporation</Link>
              <a href="/api/corporate-profile" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
                <Download className="h-4 w-4" aria-hidden /> <span className="link-underline">Corporate profile (PDF)</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- Statistics ---------------------------- */}
      {h.showStats && stats.length > 0 && (
        <section className="relative isolate overflow-hidden bg-navy py-16 text-white sm:py-20" aria-label="Company achievements">
          <div className="absolute inset-0 -z-10 bg-blueprint" />
          <div className="wrap">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {stats.map(([value, suffix, label], i) => (
                <Reveal key={label} delay={i * 0.08} className="border-l border-white/15 pl-5 sm:pl-7">
                  <dd className="font-display text-4xl font-semibold text-gold sm:text-6xl">
                    <Counter value={Number(value)} suffix={suffix} />
                  </dd>
                  <dt className="mt-2 text-sm text-white/70 sm:text-base">{label}</dt>
                </Reveal>
              ))}
            </dl>
            {h.statsAreSample && <p className="mt-8 text-xs text-white/50">Sample figures — update with verified company statistics in Admin → Website settings → Homepage.</p>}
          </div>
        </section>
      )}

      {/* ------------------------------ Services ----------------------------- */}
      {h.showServices && services.length > 0 && (
        <section className="section bg-mist">
          <div className="wrap">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Reveal>
                <SectionHead eyebrow="Core services" title="Complete construction and engineering capability." intro="Fourteen disciplines delivered by one accountable contractor — from earthworks and structures to building services and long-term maintenance." />
              </Reveal>
              <ArrowLink href="/services">View all {services.length} services</ArrowLink>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 8).map((svc, i) => (
                <Reveal key={svc.id} delay={(i % 4) * 0.07} className="h-full">
                  <Tilt className="h-full">
                    <ServiceCard s={svc} index={i} />
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------- Featured projects ------------------------- */}
      {h.showProjects && projects.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Reveal>
                <SectionHead eyebrow="Featured projects" title="Infrastructure and buildings, delivered." intro="A selection of completed, ongoing and upcoming work across public and private sectors — filter by category." />
              </Reveal>
              <ArrowLink href="/projects">Explore the full portfolio</ArrowLink>
            </div>
            <FeaturedWork projects={projects} />
          </div>
        </section>
      )}

      {/* --------------------------- Our process (7 steps) ------------------- */}
      {h.showDelivery && (
        <section className="section bg-mist bg-blueprint-light">
          <ProcessSection />
        </section>
      )}

      {/* ----------------------------- Industries ---------------------------- */}
      {h.showIndustries && (
        <section className="section bg-white">
          <div className="wrap">
            <Reveal>
              <SectionHead center eyebrow="Industries served" title="Trusted across public and private sectors." />
            </Reveal>
            <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {INDUSTRIES.map(([Icon, title, text], i) => (
                <li key={title} className="group bg-white p-7 transition duration-500 hover:bg-navy">
                  <Reveal delay={(i % 4) * 0.06}>
                    <Icon className="h-8 w-8 text-gold-600 transition group-hover:text-gold" strokeWidth={1.5} aria-hidden />
                    <h3 className="mt-5 font-display text-lg font-semibold text-navy transition group-hover:text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70 transition group-hover:text-white/70">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ----------------------------- Why choose ---------------------------- */}
      {h.showWhy && (
        <section className="section bg-mist bg-blueprint-light">
          <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal className="lg:sticky lg:top-32 lg:self-start">
              <SectionHead eyebrow="Why choose Ahem Corporation" title="The discipline that large projects demand." intro="Clients award work to contractors they can rely on. These are the commitments we organise our company around." />
              <Link href="/about" className="btn-outline mt-8">Our approach</Link>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2">
              {WHY.map(([Icon, title, text], i) => (
                <li key={title}>
                  <Reveal delay={(i % 2) * 0.08} className="card h-full p-7">
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7 text-gold-600" strokeWidth={1.5} aria-hidden />
                      <span className="font-display text-sm font-semibold text-navy/25">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-navy">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------- Government & private capabilities ----------------- */}
      {h.showSectors && (
        <section className="section bg-white">
          <div className="wrap">
            <Reveal>
              <SectionHead eyebrow="Government & private-sector capability" title="Two procurement worlds. One standard of delivery." />
            </Reveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <Reveal className="relative isolate overflow-hidden rounded-3xl bg-navy p-8 text-white sm:p-10">
                <div className="absolute inset-0 -z-10 bg-blueprint" />
                <Landmark className="h-9 w-9 text-gold" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-6 font-display text-2xl font-semibold">Government & public-sector projects</h3>
                <p className="mt-3 text-white/70">Structured for public procurement: compliant bids, documented quality and transparent reporting to departments and consultants.</p>
                <ul className="mt-6 space-y-3 text-sm text-white/85">
                  {["Open, limited and pre-qualification tenders", "Measured, lump-sum and item-rate contracts", "Compliance with bidding documents and public procurement rules", "Bid security, performance guarantees and insurance arrangements", "Consultant inspections, IPCs and as-built documentation"].map((x) => (
                    <li key={x} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>
                  ))}
                </ul>
                <Link href="/inquiry?type=tender-invitation" className="btn-gold mt-9">Invite Ahem Corporation to bid</Link>
              </Reveal>
              <Reveal delay={0.1} className="rounded-3xl border border-line bg-mist p-8 sm:p-10">
                <Building className="h-9 w-9 text-gold-600" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-6 font-display text-2xl font-semibold text-navy">Private & corporate projects</h3>
                <p className="mt-3 text-charcoal/75">Flexible engagement for developers, industrial owners and institutions — from early budgeting to turnkey delivery.</p>
                <ul className="mt-6 space-y-3 text-sm text-charcoal/85">
                  {["Design-and-build and turnkey delivery", "Early contractor involvement and value engineering", "Negotiated, lump-sum and cost-plus arrangements", "Fast-track programmes and phased handovers", "Fit-out, MEP upgrades and facility maintenance"].map((x) => (
                    <li key={x} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}</li>
                  ))}
                </ul>
                <Link href="/inquiry?type=project-requirement" className="btn-navy mt-9">Submit a project requirement</Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------- Certifications -------------------------- */}
      {h.showCertifications && certs.length > 0 && (
        <section className="section bg-mist">
          <div className="wrap">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Reveal>
                <SectionHead eyebrow="Certifications & accreditations" title="Compliance documents, ready for evaluation." intro="Registrations, licences, management-system certificates and insurance are maintained by our compliance team and shared with procurement authorities." />
              </Reveal>
              <ArrowLink href="/certifications">Certifications & compliance</ArrowLink>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {certs.slice(0, 8).map((c, i) => (
                <li key={c.id}>
                  <Reveal delay={(i % 4) * 0.06} className="card flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-2">
                      <ShieldCheck className="h-7 w-7 text-gold-600" strokeWidth={1.5} aria-hidden />
                      {c.isSample && <SampleTag label="Placeholder" />}
                    </div>
                    <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-wider text-charcoal/50">{CERT_CATEGORIES[c.category as keyof typeof CERT_CATEGORIES] ?? c.category}</p>
                    <h3 className="mt-1 font-display text-base font-semibold text-navy">{c.title}</h3>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------- Testimonials --------------------------- */}
      {h.showTestimonials && testimonials.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <Reveal>
              <SectionHead center eyebrow="Client testimonials" title="What clients say about working with us." />
            </Reveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((x, i) => (
                <Reveal key={x.id} delay={i * 0.08}>
                  <figure className="card flex h-full flex-col p-8">
                    <div className="flex items-start justify-between">
                      <Quote className="h-8 w-8 text-gold" aria-hidden />
                      {x.isSample && <SampleTag label="Sample testimonial" />}
                    </div>
                    <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-navy">“{x.quote}”</blockquote>
                    <figcaption className="mt-7 border-t border-line pt-5 text-sm">
                      <span className="font-semibold text-navy">{x.author}</span>
                      <span className="block text-charcoal/65">{[x.role, x.organization].filter(Boolean).join(" · ")}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------- Latest tenders -------------------------- */}
      {h.showTenders && (
        <section className="section bg-mist">
          <div className="wrap">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Reveal>
                <SectionHead eyebrow="Tenders & procurement" title="Latest tender and procurement opportunities." intro="Public tender announcements and Ahem Corporation subcontract and supply opportunities." />
              </Reveal>
              <ArrowLink href="/tenders">Open the tender portal</ArrowLink>
            </div>
            <div className="mt-12 space-y-4">
              {live.length > 0 ? (
                live.map((t, i) => (
                  <Reveal key={t.id} delay={i * 0.07}>
                    <TenderRow t={t} />
                  </Reveal>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-navy/20 bg-white px-6 py-12 text-center text-charcoal/70">There are no open tenders at the moment. Please check back soon.</p>
              )}
            </div>
            <p className="mt-8 flex items-start gap-2 text-sm text-charcoal/65">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden />
              Only public announcements are listed here. Tender invitations sent to us through the website are confidential and are never published.{" "}
              <Link href="/faq" className="font-semibold text-navy underline underline-offset-4">Read the FAQ</Link>
            </p>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
