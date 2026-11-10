import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { getJobs, getNews, getPages, getProjects, getServices, getTenders } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Sitemap",
  description: "A complete index of the Ahem Corporation website — company pages, services, projects, tenders, careers, news and policies.",
  path: "/sitemap",
});

const STATIC_GROUPS: { title: string; links: [string, string][] }[] = [
  {
    title: "Company",
    links: [
      ["Home", "/"], ["About us", "/about"], ["Our process", "/process"], ["Sustainability & HSE", "/sustainability"],
      ["Clients & partners", "/clients"], ["Certifications & compliance", "/certifications"], ["Careers", "/careers"],
      ["News & updates", "/news"], ["Contact", "/contact"], ["FAQ", "/faq"], ["Downloads", "/downloads"], ["Brand", "/brand"],
    ],
  },
  {
    title: "Business",
    links: [
      ["Services", "/services"], ["Projects", "/projects"], ["Tenders & procurement", "/tenders"], ["Inquiry hub", "/inquiry"],
      ["Suppliers & subcontractors", "/suppliers"], ["Invite us to bid", "/inquiry?type=tender-invitation"],
      ["Submit a project requirement", "/inquiry?type=project-requirement"], ["Request a quotation", "/inquiry?type=quotation"],
      ["Schedule a meeting", "/inquiry?type=meeting"], ["Request company profile", "/inquiry?type=company-profile"],
    ],
  },
];

function LinkList({ links }: { links: [string, string][] }) {
  return (
    <ul className="mt-6 space-y-1">
      {links.map(([label, href]) => (
        <li key={`${href}-${label}`}>
          <Link href={href} className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-charcoal/80 transition hover:bg-mist hover:text-navy">
            {label}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function SitemapPage() {
  const [services, projects, tenders, jobs, news, pages] = await Promise.all([
    getServices(), getProjects(), getTenders(), getJobs(), getNews(), getPages(),
  ]);
  return (
    <>
      <PageHero
        eyebrow="Sitemap"
        title="Every page, in one place."
        intro="A visitor-friendly index of the website. For search engines, the XML sitemap is available at /sitemap.xml."
        crumbs={[{ label: "Sitemap" }]}
      />

      <section className="section bg-white">
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-2">
            {STATIC_GROUPS.map((group) => (
              <Reveal key={group.title}>
                <SectionHead eyebrow={group.title} title={group.title} />
                <div className="card mt-6 p-3">
                  <LinkList links={group.links} />
                </div>
              </Reveal>
            ))}
          </div>

          {services.length > 0 && (
            <Reveal className="mt-14">
              <SectionHead eyebrow="Services" title="Service detail pages" />
              <div className="card mt-6 p-3">
                <LinkList links={services.map((s) => [s.title, `/services/${s.slug}`] as [string, string])} />
              </div>
            </Reveal>
          )}

          {projects.length > 0 && (
            <Reveal className="mt-14">
              <SectionHead eyebrow="Projects" title="Project detail pages" />
              <div className="card mt-6 p-3">
                <LinkList links={projects.map((p) => [p.title, `/projects/${p.slug}`] as [string, string])} />
              </div>
            </Reveal>
          )}

          {tenders.length > 0 && (
            <Reveal className="mt-14">
              <SectionHead eyebrow="Tenders" title="Tender detail pages" />
              <div className="card mt-6 p-3">
                <LinkList links={tenders.map((t) => [`${t.title} (${t.reference})`, `/tenders/${t.slug}`] as [string, string])} />
              </div>
            </Reveal>
          )}

          {jobs.length > 0 && (
            <Reveal className="mt-14">
              <SectionHead eyebrow="Careers" title="Vacancy detail pages" />
              <div className="card mt-6 p-3">
                <LinkList links={jobs.map((j) => [j.title, `/careers/${j.slug}`] as [string, string])} />
              </div>
            </Reveal>
          )}

          {news.length > 0 && (
            <Reveal className="mt-14">
              <SectionHead eyebrow="News" title="Article detail pages" />
              <div className="card mt-6 p-3">
                <LinkList links={news.map((n) => [n.title, `/news/${n.slug}`] as [string, string])} />
              </div>
            </Reveal>
          )}

          {pages.length > 0 && (
            <Reveal className="mt-14">
              <SectionHead eyebrow="Policies" title="Privacy, cookies and terms" />
              <div className="card mt-6 p-3">
                <LinkList links={pages.map((p) => [p.title, `/legal/${p.slug}`] as [string, string])} />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
