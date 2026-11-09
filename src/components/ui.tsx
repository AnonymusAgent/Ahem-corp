import Link from "next/link";
import type { ReactNode } from "react";
import {
  AirVent, ArrowRight, Building, Building2, ChevronRight, ClipboardCheck, Construction, DraftingCompass, Factory,
  Hammer, HardHat, House, Landmark, Route, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import { img } from "@/lib/site";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  hardhat: HardHat, compass: DraftingCompass, building: Building2, landmark: Landmark, road: Route, bridge: Construction,
  office: Building, factory: Factory, home: House, hammer: Hammer, bolt: Zap, air: AirVent, clipboard: ClipboardCheck, wrench: Wrench,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name] ?? Building2;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}

/** Marks demonstration content. Shown wherever a sample record or sample setting is displayed. */
export function SampleTag({ className = "", label = "Sample" }: { className?: string; label?: string }) {
  return (
    <span title="Demonstration content — replace in the admin dashboard" className={`pill border border-dashed border-gold-600/60 bg-gold-100 text-gold-700 ${className}`}>
      {label}
    </span>
  );
}

/** Plain <img> with lazy loading and responsive sources for stock images. */
export function Img({ src, alt, className = "", w = 1200, h, priority = false }: { src: string | null | undefined; alt: string; className?: string; w?: number; h?: number; priority?: boolean }) {
  if (!src) return <div className={`bg-navy-700 bg-blueprint ${className}`} role="img" aria-label={alt} />;
  const stock = src.includes("images.pexels.com") && !src.includes("?");
  const ratio = h ? h / w : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img(src, w, h)}
      srcSet={stock ? [480, 800, w].map((x) => `${img(src, x, ratio ? Math.round(x * ratio) : undefined)} ${x}w`).join(", ") : undefined}
      sizes={stock ? `(max-width: 640px) 100vw, (max-width: 1024px) 60vw, ${Math.round(w / 1.6)}px` : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}

export function SectionHead({ eyebrow, title, intro, light = false, center = false, children }: { eyebrow?: string; title: string; intro?: string; light?: boolean; center?: boolean; children?: ReactNode }) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow ${light ? "text-gold" : "text-gold-700"} ${center ? "justify-center" : ""}`}>{eyebrow}</p>}
      <h2 className={`h2 mt-5 ${light ? "text-white" : "text-navy"}`}>{title}</h2>
      {intro && <p className={`mt-5 text-base leading-relaxed sm:text-lg ${light ? "text-white/70" : "text-charcoal/75"}`}>{intro}</p>}
      {children}
    </div>
  );
}

export function PageHero({ eyebrow, title, intro, image, crumbs = [], children }: { eyebrow?: string; title: string; intro?: string; image?: string | null; crumbs?: { label: string; href?: string }[]; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 pb-16 pt-40 text-white sm:pb-20 sm:pt-48">
      {image && <Img src={image} alt="" w={1600} h={700} priority className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900/85 via-navy-900/70 to-navy-900" />
      <div className="absolute inset-0 -z-10 bg-blueprint" />
      <div className="wrap">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
              <li>
                <Link href="/" className="hover:text-gold">Home</Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" aria-hidden />
                  {c.href ? <Link href={c.href} className="hover:text-gold">{c.label}</Link> : <span aria-current="page" className="text-white/85">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
        <h1 className="display mt-5 max-w-4xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{intro}</p>}
        {children && <div className="mt-9">{children}</div>}
      </div>
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  ongoing: "bg-amber-50 text-amber-800 ring-amber-600/25",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-600/20",
  open: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  closing_soon: "bg-amber-50 text-amber-900 ring-amber-600/30",
  closed: "bg-slate-100 text-slate-700 ring-slate-500/20",
  awarded: "bg-indigo-50 text-indigo-800 ring-indigo-600/20",
};

export function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span className={`pill ring-1 ring-inset ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 ring-slate-500/20"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="rounded bg-mist px-1.5 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>;
    return part;
  });
}

/** Safe renderer for the site's lightweight markup: "## " headings, "- " lists, **bold**, paragraphs. No raw HTML is ever injected. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = (text || "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-5 text-[1.02rem] leading-relaxed text-charcoal/80 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines[0]!.startsWith("## ")) {
          return (
            <div key={i} className="space-y-3 pt-4">
              <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">{lines[0]!.slice(3)}</h2>
              {lines.length > 1 && <RichText text={lines.slice(1).join("\n")} />}
            </div>
          );
        }
        const bullets = lines.filter((l) => l.startsWith("- "));
        const paras = lines.filter((l) => !l.startsWith("- "));
        return (
          <div key={i} className="space-y-3">
            {paras.length > 0 && <p>{inline(paras.join(" "))}</p>}
            {bullets.length > 0 && (
              <ul className="space-y-2.5">
                {bullets.map((b, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                    <span>{inline(b.slice(2))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ArrowLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex min-h-11 items-center gap-2 text-sm font-semibold ${light ? "text-gold" : "text-navy"}`}>
      <span className="link-underline">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

export function CtaBand({ title = "Have a tender or project to discuss?", text = "Invite us to bid, request a quotation or send your project requirement. Every submission receives a reference number and is routed to the right team." }: { title?: string; text?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 -z-10 bg-blueprint" />
      <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
      <div className="wrap flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="h2">{title}</h2>
          <p className="mt-4 text-white/70 sm:text-lg">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/inquiry?type=tender-invitation" className="btn-gold">Invite us to bid</Link>
          <Link href="/inquiry?type=project-requirement" className="btn-ghost">Submit a project requirement</Link>
        </div>
      </div>
    </section>
  );
}
