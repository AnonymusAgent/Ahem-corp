import { Clock, Hash, Lock, Mail, Phone } from "lucide-react";
import { LeadForm } from "@/components/Forms";
import { PageHero, SampleTag } from "@/components/ui";
import { leadFormBySlug } from "@/lib/forms";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const metadata = pageMeta({
  title: "Submit a Tender Invitation or Project Inquiry",
  description: "Invite Ahem Corporation to bid, request a quotation, submit a construction project proposal, request the company profile or schedule a meeting.",
  path: "/inquiry",
});

export default async function InquiryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [sp, s] = await Promise.all([searchParams, getSettings()]);
  const initial = leadFormBySlug(sp.type)?.slug ?? "project-requirement";
  return (
    <>
      <PageHero eyebrow="Business inquiries" title="Submit your tender or project inquiry." intro="Choose the type of request. Every submission is stored securely, receives a unique reference number and is routed to the responsible team." crumbs={[{ label: "Inquiry" }]} />
      <section className="section bg-mist">
        <div className="wrap grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="card p-6 sm:p-10">
            <LeadForm key={initial} initialType={initial} />
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-navy p-7 text-white">
              <h2 className="font-display text-xl font-semibold">What happens next</h2>
              <ul className="mt-5 space-y-4 text-sm text-white/80">
                <li className="flex gap-3"><Hash className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />You receive a unique reference number on screen as soon as you submit.</li>
                <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />The request is assigned to our tender desk or project team for review.</li>
                <li className="flex gap-3"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />Documents you attach are confidential and accessible only to authorised staff.</li>
              </ul>
            </div>
            <div className="card p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-navy">Prefer to talk?</h2>
                {s.contact.isSample && <SampleTag />}
              </div>
              <ul className="mt-4 space-y-3 text-sm text-charcoal/80">
                {s.contact.phone && <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{s.contact.phone}</li>}
                {s.contact.tendersEmail && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden /><a className="break-all hover:text-navy" href={`mailto:${s.contact.tendersEmail}`}>{s.contact.tendersEmail}</a></li>}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
