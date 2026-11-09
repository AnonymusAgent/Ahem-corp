import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ProjectCard } from "@/components/cards";
import { LeadForm } from "@/components/Forms";
import { Reveal } from "@/components/Motion";
import { PageHero, RichText, SectionHead, ServiceIcon } from "@/components/ui";
import { getProjects, getService, getServices } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const s = await getService((await params).slug);
  if (!s) return { title: "Service not found" };
  return pageMeta({ title: s.seoTitle || `${s.title} Services`, description: s.seoDescription || s.summary, path: `/services/${s.slug}`, image: s.image });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, services, projects, SITE_URL] = await Promise.all([getService(slug), getServices(), getProjects(), getSiteUrl()]);
  if (!service) notFound();
  const related = projects.filter((p) => p.category === service.title).slice(0, 3);
  const examples = related.length ? related : projects.filter((p) => p.featured).slice(0, 3);
  const schema = { "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.summary, provider: { "@id": `${SITE_URL}/#organization` }, url: `${SITE_URL}/services/${service.slug}` };
  return (
    <>
      <PageHero eyebrow="Service" title={service.title} intro={service.summary} image={service.image} crumbs={[{ label: "Services", href: "/services" }, { label: service.title }]}>
        <a href="#inquiry" className="btn-gold">Discuss your project</a>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal>
            <SectionHead eyebrow="Overview" title={`How we deliver ${service.title.toLowerCase()}`} />
            <RichText text={service.description} className="mt-7" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-navy p-8 text-white sm:p-10">
              <ServiceIcon name={service.icon} className="h-10 w-10 text-gold" />
              <h2 className="mt-6 font-display text-2xl font-semibold">Capabilities</h2>
              <ul className="mt-6 space-y-3.5">
                {service.capabilities.map((c) => (
                  <li key={c} className="flex gap-3 text-white/85"><Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />{c}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {examples.length > 0 && (
        <section className="section bg-mist">
          <div className="wrap">
            <Reveal><SectionHead eyebrow="Project examples" title={related.length ? `${service.title} projects` : "Selected projects"} /></Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}><ProjectCard p={p} /></Reveal>
              ))}
            </div>
            <Link href={`/projects${related.length ? `?category=${encodeURIComponent(service.title)}` : ""}`} className="btn-outline mt-10">View all projects</Link>
          </div>
        </section>
      )}

      <section id="inquiry" className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHead eyebrow="Inquiry" title={`Need ${service.title.toLowerCase()}?`} intro="Send your requirement, request a quotation or invite us to bid. Attach drawings, specifications and BOQs — you will receive a reference number immediately." />
            <nav aria-label="Other services" className="mt-10">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/50">Other services</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {services.filter((x) => x.id !== service.id).map((x) => (
                  <li key={x.id}><Link href={`/services/${x.slug}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-3.5 text-sm text-charcoal/80 transition hover:border-navy hover:text-navy">{x.title}</Link></li>
                ))}
              </ul>
            </nav>
          </Reveal>
          <Reveal delay={0.1} className="card p-6 sm:p-9">
            <LeadForm initialType="project-requirement" only={["project-requirement", "quotation", "tender-invitation"]} prefill={{ category: service.title }} />
          </Reveal>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </>
  );
}
