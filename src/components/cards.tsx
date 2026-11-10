import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { NewsItem, PublicProject, Service, Tender } from "@/lib/data";
import { daysUntil, formatDate, NEWS_CATEGORIES, PROJECT_STATUSES, TENDER_SECTORS, TENDER_STATUSES, tenderStatus } from "@/lib/site";
import { Img, SampleTag, ServiceIcon, StatusPill } from "./ui";

export function ProjectCard({ p, tall = false }: { p: PublicProject; tall?: boolean }) {
  const place = [p.city, p.province].filter(Boolean).join(", ");
  return (
    <Link href={`/projects/${p.slug}`} className="group relative block h-full overflow-hidden rounded-2xl bg-navy-900 focus-visible:outline-offset-4">
      <div className={`${tall ? "aspect-[4/5] sm:aspect-[16/11]" : "aspect-[4/3]"} h-full w-full overflow-hidden`}>
        <Img src={p.coverImage} alt={p.title} w={900} h={675} className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.06]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-5">
        <div className="flex flex-wrap gap-2">
          <StatusPill status={p.status} label={PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES] ?? p.status} />
          {p.isSample && <SampleTag />}
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-gold text-navy opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{p.category}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-white">{p.title}</h3>
        {place && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {place}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ServiceCard({ s, index }: { s: Service; index: number }) {
  return (
    <Link
      href={`/services/${s.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-500 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_30px_60px_-30px_rgba(20,43,64,0.4)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <Img
          src={s.image}
          alt={s.title}
          w={800}
          h={500}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/15 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex h-8 items-center rounded-full bg-charcoal/70 px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-charcoal shadow-lg transition duration-500 group-hover:scale-110">
          <ServiceIcon name={s.icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-semibold text-navy transition group-hover:text-gold-700">{s.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">{s.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
          Explore service
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function TenderRow({ t }: { t: Tender }) {
  const status = tenderStatus(t);
  const left = daysUntil(t.deadline);
  return (
    <Link href={`/tenders/${t.slug}`} className="group grid gap-5 rounded-2xl border border-line bg-white p-6 transition duration-300 hover:border-navy/40 hover:shadow-[0_24px_50px_-30px_rgba(20,43,64,0.4)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={status} label={TENDER_STATUSES[status]} />
          <span className={`pill ${t.sector === "government" ? "bg-navy text-white" : "bg-gold-100 text-gold-700"}`}>{TENDER_SECTORS[t.sector as keyof typeof TENDER_SECTORS] ?? t.sector}</span>
          {t.isSample && <SampleTag />}
          <span className="font-mono text-xs text-charcoal/60">{t.reference}</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-navy group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">{t.title}</h3>
        <p className="mt-2 text-sm text-charcoal/70">
          {t.issuer} · {t.category}
          {(t.city || t.province) && <> · {[t.city, t.province].filter(Boolean).join(", ")}</>}
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-line pt-4 sm:block sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0 sm:text-right">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-charcoal/50">Submission deadline</p>
          <p className="mt-1 flex items-center gap-1.5 font-display text-base font-semibold text-navy sm:justify-end">
            <CalendarDays className="h-4 w-4 text-gold-600" aria-hidden /> {formatDate(t.deadline)}
          </p>
          {(status === "open" || status === "closing_soon") && left !== null && (
            <p className={`mt-0.5 text-xs ${status === "closing_soon" ? "font-semibold text-amber-700" : "text-charcoal/60"}`}>{left} day{left === 1 ? "" : "s"} left</p>
          )}
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition group-hover:bg-navy group-hover:text-white sm:mt-3">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function NewsCard({ n }: { n: NewsItem }) {
  return (
    <Link href={`/news/${n.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-500 hover:shadow-[0_30px_60px_-30px_rgba(20,43,64,0.35)]">
      <div className="aspect-[16/10] overflow-hidden bg-navy">
        <Img src={n.coverImage} alt="" w={800} h={500} className="h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-gold-700">{NEWS_CATEGORIES[n.category as keyof typeof NEWS_CATEGORIES] ?? n.category}</span>
          <span className="text-charcoal/50">· {formatDate(n.publishedOn)}</span>
          {n.isSample && <SampleTag />}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-navy">{n.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">{n.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
          Read more <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
