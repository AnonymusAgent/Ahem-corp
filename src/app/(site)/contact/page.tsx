import { Clock, Mail, MapPin, MapPinned, MessageCircle, Phone } from "lucide-react";
import { LeadForm } from "@/components/Forms";
import { Reveal } from "@/components/Motion";
import { PageHero, SampleTag, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { isValidPhone, parseRows } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact Us",
  description: "Contact Ahem Corporation — office address, phone, email, WhatsApp, office hours and business inquiry forms.",
  path: "/contact",
});

export default async function ContactPage() {
  const s = await getSettings();
  const c = s.contact;
  const hours = parseRows(c.hours, 2);
  const wa = isValidPhone(c.whatsapp) ? `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${s.general.companyName}, I would like to make an inquiry.`)}` : null;
  const socials = Object.entries(s.social).filter(([, url]) => /^https?:\/\//.test(url));
  const card = "card flex h-full gap-4 p-6";
  const icon = "mt-0.5 h-6 w-6 shrink-0 text-gold-600";
  return (
    <>
      <PageHero eyebrow="Contact us" title="Talk to our team." intro="For tenders, project inquiries, partnerships and general questions." crumbs={[{ label: "Contact" }]} />
      <section className="section bg-white">
        <div className="wrap">
          {c.isSample && <p className="mb-6"><SampleTag label="Sample contact details — update in Admin → Website settings" /></p>}
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <li><Reveal className={card}><MapPin className={icon} strokeWidth={1.5} aria-hidden /><div><h2 className="font-display font-semibold text-navy">Office address</h2><address className="mt-1.5 text-sm not-italic leading-relaxed text-charcoal/75">{c.address || "To be announced"}</address></div></Reveal></li>
            <li><Reveal delay={0.06} className={card}><Phone className={icon} strokeWidth={1.5} aria-hidden /><div><h2 className="font-display font-semibold text-navy">Phone</h2><p className="mt-1.5 text-sm text-charcoal/75">{isValidPhone(c.phone) ? <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="hover:text-navy hover:underline">{c.phone}</a> : c.phone || "To be announced"}</p>{wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1FAF54] px-4 text-sm font-semibold text-white hover:bg-[#17994a]"><MessageCircle className="h-4 w-4" aria-hidden />WhatsApp inquiry</a>}</div></Reveal></li>
            <li><Reveal delay={0.12} className={card}><Mail className={icon} strokeWidth={1.5} aria-hidden /><div className="min-w-0"><h2 className="font-display font-semibold text-navy">Email</h2><ul className="mt-1.5 space-y-1 text-sm text-charcoal/75">{([["General", c.email], ["Tenders", c.tendersEmail], ["Careers", c.careersEmail]] as const).filter(([, e]) => e).map(([l, e]) => <li key={l}><span className="text-charcoal/50">{l}: </span><a href={`mailto:${e}`} className="break-all hover:text-navy hover:underline">{e}</a></li>)}</ul></div></Reveal></li>
            <li><Reveal delay={0.18} className={card}><Clock className={icon} strokeWidth={1.5} aria-hidden /><div><h2 className="font-display font-semibold text-navy">Office hours</h2><dl className="mt-1.5 space-y-1 text-sm text-charcoal/75">{hours.map(([d, h]) => <div key={d} className="flex justify-between gap-4"><dt>{d}</dt><dd className="font-medium text-navy">{h}</dd></div>)}</dl></div></Reveal></li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-3xl border border-line">
            {c.mapQuery ? (
              <iframe title={`${s.general.companyName} office location on Google Maps`} src={`https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-[420px] w-full border-0" />
            ) : (
              <div className="bg-blueprint-light flex h-[320px] flex-col items-center justify-center bg-mist px-6 text-center">
                <MapPinned className="h-10 w-10 text-navy/40" strokeWidth={1.5} aria-hidden />
                <p className="mt-4 font-display text-lg font-semibold text-navy">Interactive Google Map</p>
                <p className="mt-1 max-w-md text-sm text-charcoal/70">The map is displayed here as soon as the office location is saved in Admin → Website settings → Contact details → Google Maps location.</p>
              </div>
            )}
          </div>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-3">
              {socials.map(([name, url]) => <li key={name}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold capitalize text-navy hover:border-navy">{name === "x" ? "X (Twitter)" : name}</a></li>)}
            </ul>
          )}
        </div>
      </section>
      <section className="section bg-mist">
        <div className="wrap grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal>
            <SectionHead eyebrow="Write to us" title="Contact and business inquiry forms." intro="Send a general message, a business inquiry, a meeting request or ask for our company profile. For tenders and project requirements, use the dedicated forms." />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href="/inquiry?type=tender-invitation" className="btn-navy">Invite us to bid</a>
              <a href="/inquiry?type=project-requirement" className="btn-outline">Submit a project requirement</a>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="card p-6 sm:p-9">
            <LeadForm initialType="contact" only={["contact", "business-inquiry", "meeting", "company-profile"]} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
