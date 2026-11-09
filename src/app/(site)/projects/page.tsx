import { ProjectExplorer } from "@/components/Explorer";
import { CtaBand, PageHero } from "@/components/ui";
import { getProjects } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Projects & Portfolio",
  description: "Completed, ongoing and upcoming construction and infrastructure projects by Ahem Corporation — filter by category, location and status.",
  path: "/projects",
});

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [projects, sp] = await Promise.all([getProjects(), searchParams]);
  const category = projects.some((p) => p.category === sp.category) ? sp.category! : "";
  return (
    <>
      <PageHero eyebrow="Projects" title="A portfolio of infrastructure, buildings and industrial works." intro="Filter by category, location and completion status. Client names and contract values are shown only where publication has been authorised." crumbs={[{ label: "Projects" }]} />
      <section className="bg-mist pb-24 pt-12 sm:pb-32">
        <div className="wrap">
          <ProjectExplorer projects={projects} initialCategory={category} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
