import { ServiceCard } from "@/components/cards";
import { Reveal, Tilt } from "@/components/Motion";
import { CtaBand, PageHero } from "@/components/ui";
import { getServices } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Construction & Engineering Services",
  description: "General construction, civil engineering, building, infrastructure, roads, bridges, commercial, industrial, residential, renovation, MEP, HVAC, project management and maintenance services.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero eyebrow="Services" title="Construction and engineering services, end to end." intro="Each discipline is led by specialists and delivered under one management system for safety, quality and programme." crumbs={[{ label: "Services" }]} />
      <section className="section bg-mist">
        <div className="wrap grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.07} className="h-full">
              <Tilt className="h-full"><ServiceCard s={s} index={i} /></Tilt>
            </Reveal>
          ))}
          {services.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center text-charcoal/70">Services will be published here shortly.</p>}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
