"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, Briefcase, ExternalLink, FileText, Files, FolderKanban, Gavel, Handshake, ImageIcon, Inbox, LayoutDashboard, LogOut, Mail, MailCheck,
  Menu, MessageSquare, Newspaper, Quote, ScrollText, Search, Settings, ShieldCheck, UserCheck, UserCog, UserRound, Users, Wrench, X, type LucideIcon,
} from "lucide-react";
import type { NavGroup } from "@/lib/admin-nav";
import { formatDateTime } from "@/lib/site";
import { LogoMark } from "../Logo";
import { api } from "./api";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, gavel: Gavel, inbox: Inbox, crm: Users, message: MessageSquare, file: FileText, projects: FolderKanban, services: Wrench,
  news: Newspaper, clients: Handshake, quote: Quote, shield: ShieldCheck, pages: Files, media: ImageIcon, jobs: Briefcase, applicants: UserCheck,
  settings: Settings, seo: Search, mail: Mail, maillog: MailCheck, users: UserCog, audit: ScrollText,
};

type Notice = { id: number; title: string; body: string; link: string; readAt: string | null; createdAt: string };

export function AdminShell({ user, nav, children }: { user: { name: string; email: string; role: string }; nav: NavGroup[]; children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"bell" | "user" | null>(null);
  const [notices, setNotices] = useState<{ items: Notice[]; unread: number }>({ items: [], unread: 0 });
  const bar = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    api<{ items: Notice[]; unread: number }>("/api/admin/notifications").then(setNotices).catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname, search]);

  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !bar.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  function isActive(href: string): boolean {
    const [path, query] = href.split("?") as [string, string | undefined];
    if (path === "/admin") return pathname === "/admin";
    if (query) return pathname === path && [...new URLSearchParams(query)].every(([k, v]) => search.get(k) === v);
    if (path === "/admin/leads") return pathname.startsWith(path) && !["tender_invitation", "project_requirement", "contact"].includes(search.get("f_type") ?? "");
    if (path === "/admin/settings") return pathname === path && !["seo", "email"].includes(search.get("tab") ?? "");
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/admin/login");
  }

  async function markRead() {
    await api("/api/admin/notifications", { method: "POST" }).catch(() => undefined);
    load();
  }

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col overflow-y-auto bg-navy-900 text-white">
      <Link href="/admin" className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <LogoMark size={30} />
        <span className="font-display text-sm font-bold tracking-[0.18em]">AHEM <span className="font-medium text-gold">ADMIN</span></span>
      </Link>
      <div className="flex-1 space-y-6 px-3 py-5">
        {nav.map((g) => (
          <div key={g.group}>
            <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">{g.group}</p>
            <ul className="mt-2 space-y-0.5">
              {g.items.map((item) => {
                const Icon = ICONS[item.icon] ?? FileText;
                const on = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={on ? "page" : undefined} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition ${on ? "bg-gold font-semibold text-navy-900" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                      <Icon className="h-4 w-4 shrink-0" aria-hidden /> {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <Link href="/" target="_blank" className="flex items-center gap-2 border-t border-white/10 px-6 py-4 text-sm text-white/60 hover:text-gold">
        <ExternalLink className="h-4 w-4" aria-hidden /> View website
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">{sidebar}</div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      <header ref={bar} className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden">
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <p className="hidden text-sm text-slate-500 lg:block">Ahem Corporation · Administration</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === "bell" ? null : "bell")} aria-expanded={menu === "bell"} aria-label={`Notifications${notices.unread ? `, ${notices.unread} unread` : ""}`} className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Bell className="h-5 w-5" aria-hidden />
              {notices.unread > 0 && <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold text-white">{notices.unread > 99 ? "99+" : notices.unread}</span>}
            </button>
            {menu === "bell" && (
              <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  {notices.unread > 0 && <button type="button" onClick={markRead} className="text-xs font-semibold text-navy hover:underline">Mark all read</button>}
                </div>
                <ul className="max-h-96 overflow-y-auto">
                  {notices.items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet. New submissions will appear here.</li>}
                  {notices.items.map((n) => (
                    <li key={n.id} className="border-b border-slate-100 last:border-0">
                      <Link href={n.link || "/admin"} className="block px-4 py-3 hover:bg-slate-50">
                        <p className="flex items-start gap-2 text-sm font-medium text-slate-900">
                          {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-600" aria-label="Unread" />}
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(n.createdAt)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === "user" ? null : "user")} aria-expanded={menu === "user"} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-sm hover:bg-slate-50">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[0.65rem] font-bold text-gold" aria-hidden>{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="hidden max-w-40 truncate font-medium sm:block">{user.name}</span>
            </button>
            {menu === "user" && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                  <p className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-600">{user.role}</p>
                </div>
                <Link href="/admin/account" className="flex min-h-11 items-center gap-2 px-4 text-sm hover:bg-slate-50"><UserRound className="h-4 w-4" aria-hidden /> My account & password</Link>
                <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-2 border-t border-slate-100 px-4 text-sm text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
