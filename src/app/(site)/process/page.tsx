import Link from "next/link";
import { ArrowRight, Building, Check, Landmark } from "lucide-react";
import { BuildStack } from "@/components/BuildStack";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Our Process — How We Deliver Construction Projects",
  description: "Seven stages from planning and tendering through engineering, construction, MEP, quality assurance and testing to handover — how Ahem Corporation plans, builds and hands over projects.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Our process"
        title="How we deliver — from tender to handover."
        intro="Every project follows the same seven-stage lifecycle, whether the contract is a public tender or a private commission. Each stage is documented, inspected and reported."
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
            <SectionHead
              eyebrow="Stage by stage"
              title="Seven stages, documented at every step."
              intro="The same discipline applies from the first tender document to the final handover dossier — planned, engineered, built, tested and verified."
            />
          </Reveal>
          <ProcessTimeline />
        </div>
      </section>

      <section className="section bg-mist">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="The delivery stack" title="Five layers of work, one accountable team." intro="Select a stage to see how responsibility carries through from the tender to the handover dossier." />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <BuildStack />
          </Reveal>
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
