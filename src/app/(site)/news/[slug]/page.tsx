import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NewsCard } from "@/components/cards";
import { Img, PageHero, RichText, SampleTag } from "@/components/ui";
import { getNews, getNewsItem } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { formatDate, img, NEWS_CATEGORIES } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const n = await getNewsItem((await params).slug);
  if (!n) return { title: "Article not found" };
  return pageMeta({ title: n.seoTitle || n.title, description: n.seoDescription || n.excerpt, path: `/news/${n.slug}`, image: n.coverImage, type: "article" });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [n, all, SITE_URL] = await Promise.all([getNewsItem(slug), getNews(), getSiteUrl()]);
  if (!n) notFound();
  const more = all.filter((x) => x.id !== n.id).slice(0, 3);
  const schema = !n.isSample && {
    "@context": "https://schema.org", "@type": "NewsArticle", headline: n.title, description: n.excerpt, datePublished: n.publishedOn ?? undefined,
    image: n.coverImage ? [img(n.coverImage, 1200, 630)] : undefined, author: { "@type": "Organization", name: n.author }, publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/news/${n.slug}`,
  };
  return (
    <>
      <PageHero eyebrow={NEWS_CATEGORIES[n.category as keyof typeof NEWS_CATEGORIES] ?? "News"} title={n.title} intro={n.excerpt} crumbs={[{ label: "News", href: "/news" }, { label: n.title }]}>
        <p className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <time dateTime={n.publishedOn ?? undefined}>{formatDate(n.publishedOn)}</time> · {n.author}
          {n.isSample && <SampleTag label="Sample article" />}
        </p>
      </PageHero>
      <article className="section bg-white">
        <div className="wrap max-w-3xl">
          {n.coverImage && <Img src={n.coverImage} alt="" w={1400} h={800} priority className="mb-12 aspect-[7/4] w-full rounded-3xl object-cover" />}
          <RichText text={n.body} className="text-lg" />
          <Link href="/news" className="mt-14 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy"><ArrowLeft className="h-4 w-4" aria-hidden /> All news</Link>
        </div>
      </article>
      {more.length > 0 && (
        <section className="section bg-mist">
          <div className="wrap">
            <h2 className="h2 text-navy">More updates</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.map((x) => <NewsCard key={x.id} n={x} />)}</div>
          </div>
        </section>
      )}
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
    </>
  );
}
