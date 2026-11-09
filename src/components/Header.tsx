"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

type Item = { label: string; href: string };

const COMPANY: Item[] = [
  { label: "About us", href: "/about" },
  { label: "Clients & partners", href: "/clients" },
  { label: "Certifications & compliance", href: "/certifications" },
  { label: "Careers", href: "/careers" },
  { label: "News & updates", href: "/news" },
];

export function Header({ services }: { services: Item[] }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(80);
  const headerRef = useRef<HTMLElement>(null);

  function toggle() {
    // The panel starts exactly below the header, wherever the header currently sits.
    if (!open && headerRef.current) setMenuTop(Math.max(0, Math.round(headerRef.current.getBoundingClientRect().bottom)));
    setOpen((v) => !v);
  }

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const link = (href: string, on = active(href)) =>
    `relative inline-flex h-20 items-center gap-1 px-1 text-sm font-medium transition-colors ${on ? "text-gold" : "text-white/85 hover:text-white"}`;
  const panel =
    "invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 rounded-2xl border border-white/10 bg-navy-900/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100";
  const drop = "block rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-gold";

  return (
    <>
    <header ref={headerRef} className={`sticky top-0 z-50 h-20 transition-[background-color,box-shadow] duration-500 ${solid || open ? "bg-navy-900/92 shadow-[0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl" : "bg-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy">
        Skip to content
      </a>
      <div className="wrap flex h-20 items-center justify-between gap-6">
        <Link href="/" aria-label="Ahem Corporation — home" className="shrink-0">
          <Logo size={38} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          <div className="group relative">
            <Link href="/services" className={link("/services")} aria-haspopup="true">
              Services <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden />
            </Link>
            <div className={`${panel} grid w-[560px] grid-cols-2 gap-x-2`}>
              {services.map((s) => (
                <Link key={s.href} href={s.href} className={drop}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/projects" className={link("/projects")}>Projects</Link>
          <Link href="/tenders" className={link("/tenders")}>Tenders</Link>
          <div className="group relative">
            <button type="button" className={link("", COMPANY.some((c) => active(c.href)))} aria-haspopup="true">
              Company <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden />
            </button>
            <div className={`${panel} w-64`}>
              {COMPANY.map((c) => (
                <Link key={c.href} href={c.href} className={drop}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/contact" className={link("/contact")}>Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/inquiry" className="btn-gold hidden !min-h-11 !px-5 sm:inline-flex">
            Submit inquiry
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

    </header>

      {/* Rendered outside <header>: an ancestor with backdrop-filter would become the containing block of this fixed panel. */}
      <div
        id="mobile-menu"
        data-lenis-prevent
        style={{ top: menuTop }}
        className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-navy-900 transition-opacity duration-300 lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <nav aria-label="Mobile" className="wrap flex flex-col py-6">
          {[{ label: "Services", href: "/services" }, { label: "Projects", href: "/projects" }, { label: "Tenders", href: "/tenders" }, ...COMPANY, { label: "Contact", href: "/contact" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 items-center border-b border-white/10 font-display text-xl font-medium ${active(item.href) ? "text-gold" : "text-white"}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-8 grid gap-3">
            <Link href="/inquiry?type=tender-invitation" className="btn-gold">Invite us to bid</Link>
            <Link href="/inquiry?type=project-requirement" className="btn-ghost">Submit a project requirement</Link>
          </div>
        </nav>
      </div>
    </>
  );
}
