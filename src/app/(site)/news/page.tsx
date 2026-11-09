import Link from "next/link";
import { NewsCard } from "@/components/cards";
import { Reveal } from "@/components/Motion";
import { PageHero } from "@/components/ui";
import { getNews } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { NEWS_CATEGORIES } from "@/lib/site";

export const metadata = pageMeta({
  title: "News & Updates",
  description: "Company announcements, project updates, tender updates, corporate events, industry news and insights from Ahem Corporation.",
  path: "/news",
});

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [news, sp] = await Promise.all([getNews(), searchParams]);
  const category = sp.category && sp.category in NEWS_CATEGORIES ? sp.category : "";
  const list = category ? news.filter((n) => n.category === category) : news;
  const used = Object.entries(NEWS_CATEGORIES).filter(([k]) => news.some((n) => n.category === k));
  const pill = (on: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-charcoal/80 hover:border-navy"}`;
  return (
    <>
      <PageHero eyebrow="News & updates" title="Announcements, project updates and insights." crumbs={[{ label: "News" }]} />
      <section className="bg-mist pb-24 pt-12 sm:pb-32">
        <div className="wrap">
          <nav aria-label="News categories" className="flex flex-wrap gap-2">
            <Link href="/news" className={pill(!category)} aria-current={!category ? "page" : undefined}>All</Link>
            {used.map(([k, label]) => (
              <Link key={k} href={`/news?category=${k}`} className={pill(category === k)} aria-current={category === k ? "page" : undefined}>{label}</Link>
            ))}
          </nav>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((n, i) => (
              <Reveal key={n.id} delay={(i % 3) * 0.07} className="h-full"><NewsCard n={n} /></Reveal>
            ))}
            {list.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center text-charcoal/70">No articles have been published yet.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
