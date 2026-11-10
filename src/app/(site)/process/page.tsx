import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, FileSearch, HardHat, Landmark, Building, ShieldCheck } from "lucide-react";
import { BuildStack } from "@/components/BuildStack";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Our Process — How We Deliver Construction Projects",
  description: "From tender invitation and estimation through mobilisation, construction, quality control, testing and handover — how Ahem Corporation plans, builds and hands over projects.",
  path: "/process",
});

const STAGES = [
  {
    icon: FileSearch,
    title: "Inquiry, pre-qualification & site review",
    text: "We review your tender documents, drawings and BOQ, confirm eligibility and capacity, and visit the site where needed. For private projects we clarify scope, programme and budget expectations before committing to a price.",
    points: ["Tender document review and clarification questions", "Site visit, access and logistics assessment", "Pre-qualification and compliance check"],
  },
  {
    icon: ClipboardCheck,
    title: "Estimation, programme & bid submission",
    text: "Quantity surveyors price the BOQ from first principles with rate analysis. Planners build the baseline programme and resource plan, and the bid is submitted with method statements, HSE and quality plans.",
    points: ["BOQ pricing and rate analysis", "Baseline programme and resource loading", "Method statements, ITPs and HSE plans"],
  },
  {
    icon: HardHat,
    title: "Mobilisation & enabling works",
    text: "Once awarded, we mobilise site management, plant and labour, establish site facilities, surveys and setting-out, and complete enabling works — compounds, temporary services, dewatering and protection of existing assets.",
    points: ["Site establishment and setting-out", "Temporary works and enabling works", "Permits, inductions and site-specific HSE plan"],
  },
  {
    icon: ShieldCheck,
    title: "Construction with inspection & testing",
    text: "Works proceed under inspection and test plans with hold points for the consultant. Materials are approved and tested, progress is measured and reported weekly, and variations are documented as they arise.",
    points: ["Inspection requests and hold points", "Material approvals, sampling and laboratory testing", "Weekly progress, cost and HSE reporting"],
  },
  {
    icon: Check,
    title: "Testing, commissioning & snagging",
    text: "MEP systems are tested and commissioned, finishes are inspected room by room, and snags are closed out with the client and consultant before practical completion is requested.",
    points: ["MEP testing and commissioning", "Snagging and punch-list close-out", "Pre-handover inspections"],
  },
  {
    icon: Landmark,
    title: "Handover, as-builts & defects care",
    text: "We hand over a complete dossier — as-built drawings, test records, O&M manuals and warranties — and remain responsible through the defects liability period with a planned response to any issues.",
    points: ["As-built documentation and handover dossier", "O&M manuals, warranties and training", "Defects liability and aftercare"],
  },
] as const;

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Our process"
        title="How we deliver — from tender to handover."
        intro="Every project is built in layers and managed as one. This page explains the six stages we follow on every contract, and how the two procurement routes — government and private — differ."
        crumbs={[{ label: "Our process" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/inquiry" className="btn-gold">Start with an inquiry <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link href="/services" className="btn-ghost">Explore our services</Link>
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="The delivery stack" title="Five layers of work, one accountable team." intro="Select a stage to see how responsibility carries through from the tender to the handover dossier." />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <BuildStack />
          </Reveal>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="Stage by stage" title="Six stages, documented at every step." intro="The same discipline applies whether the contract is a public tender or a private commission." />
          </Reveal>
          <ol className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {STAGES.map((stage, i) => (
              <li key={stage.title}>
                <Reveal delay={(i % 3) * 0.07} className="card flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                      <stage.icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="font-display text-sm font-semibold text-navy/25">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-navy">{stage.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">{stage.text}</p>
                  <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm text-charcoal/80">
                    {stage.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="Two procurement routes" title="Government tenders and private commissions, handled differently — delivered to one standard." />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal className="relative isolate overflow-hidden rounded-3xl bg-navy p-8 text-white sm:p-10">
              <div className="absolute inset-0 -z-10 bg-blueprint" />
              <Landmark className="h-9 w-9 text-gold" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-6 font-display text-2xl font-semibold">Government & public-sector</h3>
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
              <h3 className="mt-6 font-display text-2xl font-semibold text-navy">Private & corporate</h3>
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

      <CtaBand title="Ready to start at stage one?" text="Send your tender documents or project requirement today. You will receive a reference number immediately and a response from the responsible team." />
    </>
  );
}
