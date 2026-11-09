import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { ProjectCard } from "@/components/cards";
import { Reveal } from "@/components/Motion";
import { CtaBand, Img, PageHero, RichText, SampleTag, SectionHead, StatusPill } from "@/components/ui";
import { getProject, getProjects } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { formatDate, img, PROJECT_STATUSES } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await getProject((await params).slug);
  if (!p) return { title: "Project not found" };
  return pageMeta({ title: p.seoTitle || `${p.title} — ${p.category} Project`, description: p.seoDescription || p.summary, path: `/projects/${p.slug}`, image: p.coverImage });
}

function video(url: string | null): { kind: "frame" | "file"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: "frame", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "frame", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/^(https:\/\/|\/)/.test(url)) return { kind: "file", src: url };
  return null;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [p, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!p) notFound();
  const v = video(p.videoUrl);
  const related = all.filter((x) => x.id !== p.id && x.category === p.category).concat(all.filter((x) => x.id !== p.id && x.category !== p.category)).slice(0, 3);
  const facts: [string, string][] = [
    ["Client / department", p.clientName || "Not disclosed"],
    ["Location", [p.city, p.province].filter(Boolean).join(", ") || "—"],
    ["Category", p.category],
    ["Project value", p.value || "Not disclosed"],
    ["Start date", formatDate(p.startDate, { day: undefined })],
    [p.status === "completed" ? "Completed" : "Planned completion", formatDate(p.endDate, { day: undefined })],
  ];
  return (
    <>
      <PageHero eyebrow={p.category} title={p.title} intro={p.summary} image={p.coverImage} crumbs={[{ label: "Projects", href: "/projects" }, { label: p.title }]}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={p.status} label={PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES] ?? p.status} />
          {p.isSample && <SampleTag label="Sample project" />}
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <Reveal>
              <SectionHead eyebrow="Project description" title="Overview" />
              <RichText text={p.description || p.summary} className="mt-7" />
            </Reveal>
            {p.scope.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="font-display text-2xl font-semibold text-navy">Scope of work</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {p.scope.map((x) => (
                    <li key={x} className="flex gap-3 rounded-xl bg-mist px-4 py-3.5 text-sm text-charcoal/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />{x}</li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
          <Reveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
            <dl className="overflow-hidden rounded-3xl border border-line">
              <div className="bg-navy px-7 py-5 font-display text-lg font-semibold text-white">Project facts</div>
              {facts.map(([k, val]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 border-t border-line px-7 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal/55">{k}</dt>
                  <dd className="text-right text-sm font-medium text-navy">{val}</dd>
                </div>
              ))}
            </dl>
            <Link href="/inquiry?type=project-requirement" className="btn-gold mt-6 w-full">Discuss a similar project</Link>
          </Reveal>
        </div>
      </section>

      {(p.gallery.length > 0 || v) && (
        <section className="section bg-mist">
          <div className="wrap">
            <Reveal><SectionHead eyebrow="Gallery" title="Project images and video" /></Reveal>
            {v && (
              <Reveal className="mt-12 overflow-hidden rounded-3xl bg-navy-900">
                {v.kind === "frame" ? (
                  <iframe src={v.src} title={`${p.title} video`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full" />
                ) : (
                  <video controls preload="none" playsInline poster={img(p.coverImage, 1600, 900)} className="aspect-video w-full bg-navy-900 object-cover">
                    <source src={v.src} />
                    Your browser does not support embedded video.
                  </video>
                )}
              </Reveal>
            )}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {p.gallery.map((src, i) => (
                <Reveal key={src} delay={(i % 3) * 0.07}>
                  <a href={img(src, 1800)} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl bg-navy" aria-label={`Open image ${i + 1} of ${p.title}`}>
                    <Img src={src} alt={`${p.title} — image ${i + 1}`} w={900} h={640} className="aspect-[7/5] w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section bg-white">
          <div className="wrap">
            <div className="flex items-end justify-between gap-6">
              <SectionHead eyebrow="More projects" title="Related work" />
              <Link href="/projects" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy"><ArrowLeft className="h-4 w-4" aria-hidden /> All projects</Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((x) => <ProjectCard key={x.id} p={x} />)}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
