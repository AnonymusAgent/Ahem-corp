import Link from "next/link";
import { ArrowRight, Check, ClipboardList, FileCheck2, Handshake, PackageCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Suppliers, Subcontractors & Vendor Registration",
  description: "Register as a supplier or subcontractor with Ahem Corporation — categories we procure, pre-qualification documents, and how to submit your registration through the business inquiry form.",
  path: "/suppliers",
});

const CATEGORIES = [
  { icon: PackageCheck, title: "Materials & supplies", text: "Cement, steel, aggregates, blocks, timber, finishes, electrical and plumbing materials, and general site supplies." },
  { icon: Truck, title: "Plant & equipment hire", text: "Earthmoving, concrete, lifting, paving and transport equipment with operators, on owned and contracted fleets." },
  { icon: Handshake, title: "Subcontract trades", text: "Specialist trades including MEP, façade, roofing, waterproofing, joinery, painting and testing & commissioning." },
  { icon: ClipboardList, title: "Consultants & services", text: "Design, surveying, testing laboratories, transport, security, catering and other professional services." },
] as const;

const STEPS = [
  { title: "Submit a business inquiry", text: "Use the business-inquiry form and select “Supplier registration” or “Subcontractor registration” as your area of interest. Attach your company profile and supporting documents." },
  { title: "Pre-qualification review", text: "Our procurement team reviews your registrations, track record, capacity and HSE documentation against the requirements for the category you want to supply." },
  { title: "Approval & onboarding", text: "Approved vendors are added to our supplier register with agreed terms, delivery and quality requirements, and HSE expectations for site attendance." },
  { title: "Ongoing performance", text: "Delivery, quality and safety performance are monitored on every package. Consistent performance leads to repeat orders and framework opportunities." },
] as const;

const DOCUMENTS = [
  "Company registration and tax documents",
  "Company profile with track record and references",
  "Relevant licences, certifications and insurance",
  "HSE policy and safe-work documentation (for site attendance)",
  "Price lists or rate schedules for your category",
  "Bank and compliance details for onboarding (shared securely on request)",
] as const;

export default function SuppliersPage() {
  return (
    <>
      <PageHero
        eyebrow="Suppliers & subcontractors"
        title="Supply with us. Build with us."
        intro="Ahem Corporation delivers through a vetted supply chain. This page explains what we procure, how pre-qualification works, and how to register — whether you supply materials, hire plant, or deliver specialist trades."
        crumbs={[{ label: "Suppliers & subcontractors" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/inquiry?type=business-inquiry" className="btn-gold">Register as a supplier <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link href="/inquiry?type=proposal" className="btn-ghost">Submit a proposal</Link>
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead eyebrow="What we procure" title="Four categories, one register." intro="Tell us your category in the business-inquiry form so your registration reaches the right procurement team." />
          </Reveal>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => (
              <li key={cat.title}>
                <Reveal delay={i * 0.07} className="card flex h-full flex-col p-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                    <cat.icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-navy">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{cat.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHead eyebrow="How registration works" title="Four steps to the supplier register." />
            <ol className="mt-10 space-y-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-navy">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-white p-8 sm:p-10 lg:self-start">
            <FileCheck2 className="h-8 w-8 text-gold-600" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-5 font-display text-xl font-semibold text-navy">Documents to prepare</h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">Prepare these before you submit. Sensitive details (bank information) are requested separately through secure channels — never send them in the public form.</p>
            <ul className="mt-6 space-y-3 text-sm text-charcoal/85">
              {DOCUMENTS.map((doc) => (
                <li key={doc} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{doc}</li>
              ))}
            </ul>
            <Link href="/inquiry?type=business-inquiry" className="btn-navy mt-8">Start your registration</Link>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead center eyebrow="Our commitments" title="Fair, documented and prompt." intro="Suppliers and subcontractors can expect clear scopes, documented orders, and the same HSE and quality standards we apply to our own teams." />
          </Reveal>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {["Clear scopes and documented orders", "HSE requirements agreed before site attendance", "Performance feedback on every package"].map((x) => (
              <li key={x} className="flex items-start gap-3 rounded-2xl border border-line bg-mist px-5 py-4 text-sm font-medium text-navy">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Ready to join the supply chain?" text="Submit a business inquiry with your company profile and category. Our procurement team will review your registration and respond with next steps." />
    </>
  );
}
