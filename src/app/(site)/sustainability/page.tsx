import Link from "next/link";
import { ArrowRight, Check, HardHat, Leaf, Recycle, Users, Building2 } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Sustainability, HSE & Community",
  description: "How Ahem Corporation manages health, safety and environment, reduces waste, supports local employment and builds durable assets that last.",
  path: "/sustainability",
});

const PILLARS = [
  {
    icon: HardHat,
    title: "Safety first",
    text: "Every site runs on a site-specific HSE plan, risk assessments, permits to work and daily toolbox talks. Anyone on site has the authority to stop unsafe work, and incidents are investigated to prevent recurrence.",
    points: ["Site inductions and daily briefings", "Work-at-height and lifting controls", "Incident reporting and corrective action"],
  },
  {
    icon: Leaf,
    title: "Environmental protection",
    text: "Environmental controls are planned before mobilisation — dust, noise, water and spill management, protection of watercourses and trees, and restoration of temporary works areas on completion.",
    points: ["Dust, noise and water management plans", "Spill prevention and response", "Site restoration and reinstatement"],
  },
  {
    icon: Recycle,
    title: "Waste & materials",
    text: "We segregate waste on site, reuse excavated material where suitable, and source materials through approved suppliers with traceable documentation. Ordering is planned to reduce over-supply and waste.",
    points: ["Waste segregation and licensed disposal", "Reuse of excavated material", "Approved suppliers and material traceability"],
  },
  {
    icon: Users,
    title: "People & local content",
    text: "We recruit locally where possible, invest in training for site teams, and work fairly with subcontractors and suppliers. Community liaison is part of every project — traffic, access and working hours are agreed in advance.",
    points: ["Local recruitment and skills training", "Fair treatment of subcontractors", "Community liaison and traffic management"],
  },
  {
    icon: Building2,
    title: "Durable assets",
    text: "The most sustainable building is the one that lasts. We build to specification with verified materials, documented testing and complete as-built records, so owners can maintain assets efficiently for decades.",
    points: ["Specification compliance and testing", "As-built records and O&M documentation", "Maintainable, energy-aware design coordination"],
  },
] as const;

export default function SustainabilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Sustainability & HSE"
        title="Building safely, protecting the environment, serving communities."
        intro="Health, safety and the environment are managed as line responsibilities on every Ahem Corporation site — planned before work starts, verified while it proceeds, and reviewed when it finishes."
        crumbs={[{ label: "Sustainability & HSE" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/certifications" className="btn-gold">Certifications & compliance</Link>
          <Link href="/about" className="btn-ghost">About our HSE & quality systems</Link>
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="Our approach" title="Five commitments on every project." intro="These are the standards our site teams are measured against — not aspirations, but documented procedures with inspections and records." />
          </Reveal>
          <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <li key={pillar.title} className={i === PILLARS.length - 1 ? "md:col-span-2 xl:col-span-1" : ""}>
                <Reveal delay={(i % 3) * 0.07} className="card flex h-full flex-col p-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                    <pillar.icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-navy">{pillar.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">{pillar.text}</p>
                  <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm text-charcoal/80">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
            <li>
              <Reveal delay={0.14} className="flex h-full flex-col justify-between rounded-2xl bg-navy p-7 text-white">
                <div>
                  <h3 className="font-display text-lg font-semibold">Work with us to this standard</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Clients, consultants and suppliers are expected to meet the same HSE and environmental requirements on our sites. Tell us about your project and we will share the relevant plans.</p>
                </div>
                <Link href="/inquiry?type=project-requirement" className="btn-gold mt-6 self-start">Submit a project requirement <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </Reveal>
            </li>
          </ul>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHead eyebrow="How it is verified" title="Plans, inspections and records." intro="Commitments are only meaningful when they are checked. Our HSE and quality systems produce the evidence clients and consultants rely on." />
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-charcoal/80">
              {[
                "Site-specific HSE and environmental plans approved before mobilisation",
                "Regular HSE inspections with corrective-action tracking",
                "Material approvals, field and laboratory testing with traceable records",
                "Non-conformance reporting and documented close-out",
                "Management reviews of safety, environmental and quality performance",
              ].map((x) => (
                <li key={x} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-white p-8 sm:p-10">
            <h3 className="font-display text-xl font-semibold text-navy">For procurement and pre-qualification</h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/75">Our registrations, management-system certificates and insurance documents are maintained by the compliance team and shared with procurement authorities. Placeholder categories are listed on the Certifications page until official documents are uploaded.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/certifications" className="btn-navy">View certifications</Link>
              <Link href="/inquiry?type=company-profile" className="btn-outline">Request documents</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Build to a standard you can defend." text="Invite us to bid or submit your project requirement — and hold us to the HSE, environmental and quality commitments on this page." />
    </>
  );
}
