import { Quote } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CtaBand, Img, PageHero, SampleTag, SectionHead } from "@/components/ui";
import { getClients, getTestimonials } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { CLIENT_TYPES, initials } from "@/lib/site";

export const metadata = pageMeta({
  title: "Our Clients & Partners",
  description: "Government departments, private-sector clients, corporate partners, consultants and suppliers working with Ahem Corporation.",
  path: "/clients",
});

export default async function ClientsPage() {
  const [clients, testimonials] = await Promise.all([getClients(), getTestimonials()]);
  const groups = (Object.keys(CLIENT_TYPES) as (keyof typeof CLIENT_TYPES)[]).map((type) => ({ type, items: clients.filter((c) => c.type === type) })).filter((g) => g.items.length);
  return (
    <>
      <PageHero eyebrow="Clients & partners" title="Relationships built on delivery." intro="We list only clients, partners and endorsements that have been approved for publication." crumbs={[{ label: "Clients & partners" }]} />
      <section className="section bg-white">
        <div className="wrap space-y-16">
          {groups.length === 0 && <p className="rounded-2xl border border-dashed border-navy/20 bg-mist p-12 text-center text-charcoal/70">Authorised client and partner listings will be published here.</p>}
          {groups.map((g) => (
            <div key={g.type}>
              <Reveal><SectionHead eyebrow={CLIENT_TYPES[g.type]} title={CLIENT_TYPES[g.type]} /></Reveal>
              <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((c, i) => (
                  <li key={c.id}>
                    <Reveal delay={(i % 3) * 0.07} className="card flex h-full items-start gap-5 p-6">
                      {c.logo ? (
                        <Img src={c.logo} alt={`${c.name} logo`} w={160} className="h-14 w-14 shrink-0 rounded-xl object-contain" />
                      ) : (
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy font-display text-lg font-semibold text-gold" aria-hidden>{initials(c.name)}</span>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-navy">{c.name}</h3>
                          {c.isSample && <SampleTag />}
                        </div>
                        {c.description && <p className="mt-1.5 text-sm leading-relaxed text-charcoal/70">{c.description}</p>}
                        {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-navy underline underline-offset-4">Visit website</a>}
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      {testimonials.length > 0 && (
        <section className="section bg-mist">
          <div className="wrap">
            <Reveal><SectionHead center eyebrow="Client testimonials" title="In our clients’ words." /></Reveal>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((x, i) => (
                <Reveal key={x.id} delay={(i % 3) * 0.08}>
                  <figure className="card flex h-full flex-col p-8">
                    <div className="flex items-start justify-between"><Quote className="h-8 w-8 text-gold" aria-hidden />{x.isSample && <SampleTag label="Sample testimonial" />}</div>
                    <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-navy">“{x.quote}”</blockquote>
                    <figcaption className="mt-7 border-t border-line pt-5 text-sm"><span className="font-semibold text-navy">{x.author}</span><span className="block text-charcoal/65">{[x.role, x.organization].filter(Boolean).join(" · ")}</span></figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
