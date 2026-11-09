import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, RichText } from "@/components/ui";
import { getPage, getPages } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await getPage((await params).slug);
  if (!p) return { title: "Page not found" };
  return pageMeta({ title: p.seoTitle || p.title, description: p.seoDescription || p.summary || p.title, path: `/legal/${p.slug}` });
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const [page, pages] = await Promise.all([getPage(slug), getPages()]);
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow="Policies" title={page.title} intro={page.summary} crumbs={[{ label: page.title }]} />
      <section className="section bg-white">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_280px]">
          <article className="max-w-3xl">
            <p className="mb-8 text-sm text-charcoal/60">Last updated {formatDate(page.updatedAt)}</p>
            <RichText text={page.body} />
          </article>
          <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/50">Policies & terms</h2>
            <ul className="mt-4 space-y-1">
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/legal/${p.slug}`} aria-current={p.slug === page.slug ? "page" : undefined} className={`flex min-h-11 items-center rounded-lg px-3 text-sm ${p.slug === page.slug ? "bg-navy font-semibold text-white" : "text-charcoal/80 hover:bg-mist"}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
