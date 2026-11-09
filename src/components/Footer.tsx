import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { isValidPhone } from "@/lib/site";
import { Logo } from "./Logo";
import { SampleTag } from "./ui";

export function Footer({ settings: s, services }: { settings: SiteSettings; services: { label: string; href: string }[] }) {
  const socials = (
    [
      ["LinkedIn", s.social.linkedin],
      ["Facebook", s.social.facebook],
      ["Instagram", s.social.instagram],
      ["X", s.social.x],
      ["YouTube", s.social.youtube],
    ] as const
  ).filter(([, url]) => /^https?:\/\//.test(url));
  const head = "text-xs font-semibold uppercase tracking-[0.2em] text-gold";
  const a = "text-sm text-white/70 transition hover:text-gold";

  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-white">
      <div className="absolute inset-0 -z-10 bg-blueprint opacity-60" />
      <div className="wrap grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo size={44} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">{s.general.description}</p>
          <a href="/api/corporate-profile" className="btn-ghost mt-7 !min-h-11 !px-5">
            Download corporate profile (PDF)
          </a>
        </div>

        <nav aria-label="Company" className="lg:col-span-2">
          <h2 className={head}>Company</h2>
          <ul className="mt-5 space-y-3">
            {[["About us", "/about"], ["Projects", "/projects"], ["Clients & partners", "/clients"], ["Certifications", "/certifications"], ["Careers", "/careers"], ["News & updates", "/news"], ["Contact", "/contact"]].map(([label, href]) => (
              <li key={href}><Link href={href!} className={a}>{label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services" className="lg:col-span-3">
          <h2 className={head}>Services</h2>
          <ul className="mt-5 space-y-3">
            {services.slice(0, 7).map((x) => (
              <li key={x.href}><Link href={x.href} className={a}>{x.label}</Link></li>
            ))}
            <li><Link href="/services" className="text-sm font-semibold text-gold">All services →</Link></li>
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={head}>Tenders & business</h2>
          <ul className="mt-5 space-y-3">
            {[["Tenders & procurement", "/tenders"], ["Invite us to bid", "/inquiry?type=tender-invitation"], ["Submit a project requirement", "/inquiry?type=project-requirement"], ["Request a quotation", "/inquiry?type=quotation"], ["Schedule a meeting", "/inquiry?type=meeting"]].map(([label, href]) => (
              <li key={href}><Link href={href!} className={a}>{label}</Link></li>
            ))}
          </ul>
          <address className="mt-8 space-y-3 text-sm not-italic text-white/70">
            {s.contact.isSample && <SampleTag label="Sample contact details" />}
            {s.contact.address && (
              <p className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />{s.contact.address}</p>
            )}
            {s.contact.phone && (
              <p className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                {isValidPhone(s.contact.phone) ? <a href={`tel:${s.contact.phone.replace(/[^+\d]/g, "")}`} className="hover:text-gold">{s.contact.phone}</a> : s.contact.phone}
              </p>
            )}
            {s.contact.email && (
              <p className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /><a href={`mailto:${s.contact.email}`} className="break-all hover:text-gold">{s.contact.email}</a></p>
            )}
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-4 py-6 text-xs text-white/50 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {s.general.companyName}. {s.general.footerNote}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {socials.map(([label, url]) => (
              <li key={label}><a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{label}</a></li>
            ))}
            <li><Link href="/legal/privacy-policy" className="hover:text-gold">Privacy</Link></li>
            <li><Link href="/legal/cookie-policy" className="hover:text-gold">Cookies</Link></li>
            <li><Link href="/legal/data-handling" className="hover:text-gold">Data handling</Link></li>
            <li><Link href="/legal/terms" className="hover:text-gold">Terms</Link></li>
            <li><Link href="/brand" className="hover:text-gold">Brand</Link></li>
            <li><Link href="/admin" className="hover:text-gold">Staff sign-in</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
