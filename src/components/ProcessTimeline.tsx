import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Compass, HardHat, Ruler, ShieldCheck, Wrench } from "lucide-react";
import { Reveal } from "./Motion";
import { SectionHead } from "./ui";

/**
 * The seven-step project lifecycle. Shared by the homepage stepper and the
 * full timeline on /process so both always agree.
 */
export const PROCESS_STEPS = [
  {
    icon: Compass,
    title: "Planning & Tendering",
    text: "We review tender documents, drawings and BOQ, confirm eligibility and capacity, then price the works from first principles and submit with method statements, HSE and quality plans.",
    points: ["Tender review, site visits and clarifications", "BOQ pricing, rate analysis and baseline programme", "Method statements, ITPs and HSE plans"],
  },
  {
    icon: Ruler,
    title: "Engineering & Design",
    text: "Our engineers coordinate design intent with buildability — reviewing drawings, preparing shop drawings and resolving technical queries before work starts on site.",
    points: ["Design review and constructability input", "Shop drawings and material submittals", "Value engineering and technical queries"],
  },
  {
    icon: HardHat,
    title: "Foundations & Civil Works",
    text: "Setting out, excavation, groundworks and reinforced-concrete foundations establish the structure — surveyed, tested and signed off before the superstructure rises.",
    points: ["Setting out, excavation and bulk earthworks", "Piling, foundations and substructure concrete", "Drainage, utilities and buried services"],
  },
  {
    icon: Building2,
    title: "Structural Construction",
    text: "Superstructure works proceed under approved method statements with inspection hold points, sequenced by look-ahead plans and verified as they are built.",
    points: ["Concrete frames, steel and masonry", "Formwork, reinforcement and precast erection", "Weekly progress, quality and HSE reporting"],
  },
  {
    icon: Wrench,
    title: "MEP & Installation",
    text: "Electrical, mechanical, plumbing and HVAC systems are installed to coordinated drawings, tested progressively and prepared for commissioning.",
    points: ["Electrical, plumbing and HVAC installation", "Containment, risers and plant-room works", "Progressive testing against ITPs"],
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    text: "Inspection and test plans govern every activity: materials are approved and tested, hold points are notified, and non-conformances are closed out with records.",
    points: ["Material approvals, sampling and laboratory testing", "Inspection requests and consultant hold points", "Traceable records and NCR close-out"],
  },
  {
    icon: BadgeCheck,
    title: "Testing & Handover",
    text: "Systems are commissioned, snags are closed out with the client and consultant, and the full handover dossier is issued before defects-liability care begins.",
    points: ["Commissioning, MEP testing and snagging", "As-builts, O&M manuals and warranties", "Practical completion and defects liability"],
  },
] as const;

/** Compact 7-step visual stepper used on the homepage. */
export function ProcessStepper() {
  return (
    <div className="mt-14">
      {/* Desktop rail */}
      <ol className="relative hidden lg:block">
        <span aria-hidden className="absolute left-0 right-0 top-7 h-px bg-line" />
        <div className="relative grid grid-cols-7 gap-3">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.title} className="group text-center">
              <Reveal delay={i * 0.07}>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white font-display text-sm font-bold text-navy shadow-sm transition duration-500 group-hover:-translate-y-1 group-hover:border-gold group-hover:bg-gold group-hover:text-charcoal group-hover:shadow-[0_14px_30px_-14px_rgba(232,154,56,0.8)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <step.icon className="mx-auto mt-4 h-5 w-5 text-concrete transition group-hover:text-gold-600" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-2 font-display text-[0.95rem] font-semibold leading-snug text-navy">{step.title}</h3>
              </Reveal>
            </li>
          ))}
        </div>
      </ol>

      {/* Mobile rail */}
      <ol className="relative space-y-6 lg:hidden">
        <span aria-hidden className="absolute bottom-4 left-6 top-4 w-px bg-line" />
        {PROCESS_STEPS.map((step, i) => (
          <li key={step.title} className="relative flex gap-5">
            <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-white font-display text-xs font-bold text-navy">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="pt-1.5">
              <h3 className="font-display text-base font-semibold text-navy">{step.title}</h3>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Full vertical timeline used on /process — numbered nodes on a continuous rail. */
export function ProcessTimeline() {
  return (
    <ol className="relative mx-auto mt-14 max-w-4xl">
      <span aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-line sm:left-7" />
      {PROCESS_STEPS.map((step, i) => (
        <li key={step.title} className="relative pb-12 last:pb-0">
          <span className="absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white font-display text-sm font-bold text-navy sm:left-1">
            <span className="absolute inset-0 -z-10 rounded-full bg-gold/0 transition group-hover:bg-gold/20" aria-hidden />
            {String(i + 1).padStart(2, "0")}
          </span>
          <Reveal delay={0.05} className="ml-16 sm:ml-20">
            <div className="card group p-7 transition duration-500 hover:border-gold/60 hover:shadow-[0_26px_54px_-32px_rgba(20,43,64,0.4)]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold transition duration-500 group-hover:bg-gold group-hover:text-charcoal">
                  <step.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="font-display text-xl font-semibold text-navy">{step.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-charcoal/75 sm:text-[0.95rem]">{step.text}</p>
              <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-charcoal/80">
                {step.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

/** Homepage section wrapper: heading + stepper + link to /process. */
export function ProcessSection() {
  return (
    <div className="wrap">
      <Reveal>
        <SectionHead
          eyebrow="Our process"
          title="Seven steps from tender to handover."
          intro="The same disciplined sequence applies to public tenders and private commissions — planned, engineered, built, tested and handed over with full documentation."
        />
      </Reveal>
      <ProcessStepper />
      <Reveal delay={0.1} className="mt-12 text-center">
        <Link href="/process" className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
          <span className="link-underline">See our full delivery process</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      </Reveal>
    </div>
  );
}
