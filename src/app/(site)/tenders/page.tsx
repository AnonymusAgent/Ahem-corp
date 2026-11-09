import Link from "next/link";
import { Globe2, Lock } from "lucide-react";
import { TenderExplorer } from "@/components/Explorer";
import { LeadForm } from "@/components/Forms";
import { Reveal } from "@/components/Motion";
import { PageHero, SectionHead } from "@/components/ui";
import { getTenders } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Government & Private Tenders — Procurement Portal",
  description: "Latest government construction tenders and private procurement opportunities. Invite Ahem Corporation to bid or submit a private project requirement.",
  path: "/tenders",
});

export default async function TendersPage() {
  const tenders = await getTenders();
  return (
    <>
      <PageHero eyebrow="Tenders & procurement" title="Government & private tender portal." intro="Public tender announcements and procurement opportunities — and a direct, confidential channel for organizations that want Ahem Corporation to bid." crumbs={[{ label: "Tenders" }]}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#invite" className="btn-gold">Invite Ahem Corporation to Bid</a>
          <Link href="/inquiry?type=project-requirement" className="btn-ghost">Submit a Project Requirement</Link>
        </div>
      </PageHero>

      <section className="bg-white py-14">
        <div className="wrap grid gap-5 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-line p-7">
            <Globe2 className="h-7 w-7 text-gold-600" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-4 font-display text-xl font-semibold text-navy">Public tender announcements</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">Listed below. These are summaries of tenders and procurement opportunities that are authorised for publication. The official documents issued by the procuring organization always prevail.</p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-2xl border border-navy/15 bg-navy p-7 text-white">
            <Lock className="h-7 w-7 text-gold" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-4 font-display text-xl font-semibold">Confidential tender invitations</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">Invitations and documents you send us through the form are never published. They are stored securely and are visible only to our tender desk and administrators.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20" aria-labelledby="announcements">
        <div className="wrap">
          <SectionHead eyebrow="Public announcements" title="Latest tenders and procurement opportunities" />
          <h2 id="announcements" className="sr-only">Tender announcements</h2>
          <div className="mt-10">
            {tenders.length ? <TenderExplorer tenders={tenders} /> : <p className="rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center text-charcoal/70">No tender announcements are published at the moment.</p>}
          </div>
        </div>
      </section>

      <section id="invite" className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHead eyebrow="Send us an opportunity" title="Invite us to bid, or tell us what you need to build." intro="Procurement authorities and departments can invite us to participate in a tender. Private clients can submit a project requirement with drawings and BOQs." />
            <ol className="mt-9 space-y-5 text-sm text-charcoal/80">
              {[["Submit", "Complete the form and attach tender documents, BOQs or drawings."], ["Reference number", "You immediately receive a unique reference for follow-up."], ["Review", "Our tender desk or project team reviews the submission and responds."]].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-semibold text-gold">{i + 1}</span>
                  <span><strong className="block font-display text-base font-semibold text-navy">{t}</strong>{d}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1} className="card p-6 sm:p-9">
            <LeadForm initialType="tender-invitation" only={["tender-invitation", "project-requirement"]} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
