"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { PublicProject, Tender } from "@/lib/data";
import { daysUntil, PROJECT_STATUSES, TENDER_STATUSES, tenderStatus } from "@/lib/site";
import { ProjectCard, TenderRow } from "./cards";

const uniq = (list: (string | null | undefined)[]) => [...new Set(list.filter((x): x is string => !!x))].sort();

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-wider text-charcoal/60">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field !py-2.5">
        <option value="">All</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" aria-hidden />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field !py-2.5 !pl-11" />
    </label>
  );
}

function Empty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-mist px-6 py-16 text-center">
      <SlidersHorizontal className="mx-auto h-8 w-8 text-navy/40" aria-hidden />
      <p className="mt-4 font-display text-lg font-semibold text-navy">No results match these filters</p>
      <p className="mt-1 text-sm text-charcoal/70">Try removing a filter or searching for something else.</p>
      <button type="button" onClick={onClear} className="btn-outline mt-6">Clear filters</button>
    </div>
  );
}

export function ProjectExplorer({ projects, initialCategory = "" }: { projects: PublicProject[]; initialCategory?: string }) {
  const [f, setF] = useState({ q: "", category: initialCategory, province: "", status: "" });
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const clear = () => setF({ q: "", category: "", province: "", status: "" });
  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!f.category || p.category === f.category) &&
        (!f.province || p.province === f.province) &&
        (!f.status || p.status === f.status) &&
        (!q || `${p.title} ${p.summary} ${p.city} ${p.province} ${p.category}`.toLowerCase().includes(q)),
    );
  }, [projects, f]);
  const dirty = f.q || f.category || f.province || f.status;

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_20px_50px_-35px_rgba(16,36,58,0.4)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="self-end"><SearchBox value={f.q} onChange={set("q")} placeholder="Search projects" /></div>
          <Select label="Category" value={f.category} onChange={set("category")} options={uniq(projects.map((p) => p.category)).map((c) => [c, c])} />
          <Select label="Province / region" value={f.province} onChange={set("province")} options={uniq(projects.map((p) => p.province)).map((c) => [c, c])} />
          <Select label="Completion status" value={f.status} onChange={set("status")} options={Object.entries(PROJECT_STATUSES)} />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-charcoal/70">
          <p aria-live="polite">{list.length} project{list.length === 1 ? "" : "s"}</p>
          {dirty && (
            <button type="button" onClick={clear} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy">
              <X className="h-4 w-4" aria-hidden /> Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        {list.length === 0 ? (
          <Empty onClear={clear} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                  <ProjectCard p={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export function TenderExplorer({ tenders }: { tenders: Tender[] }) {
  const [f, setF] = useState({ q: "", sector: "", category: "", province: "", status: "", deadline: "" });
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const clear = () => setF({ q: "", sector: "", category: "", province: "", status: "", deadline: "" });
  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return tenders
      .filter((t) => {
        const status = tenderStatus(t);
        const left = daysUntil(t.deadline);
        const live = status === "open" || status === "closing_soon";
        if (f.sector && t.sector !== f.sector) return false;
        if (f.category && t.category !== f.category) return false;
        if (f.province && t.province !== f.province && t.city !== f.province) return false;
        if (f.status === "active" && !live) return false;
        if (f.status === "inactive" && live) return false;
        if (f.status && !["active", "inactive"].includes(f.status) && status !== f.status) return false;
        if (f.deadline === "7" && !(live && left !== null && left <= 7)) return false;
        if (f.deadline === "30" && !(live && left !== null && left <= 30)) return false;
        if (f.deadline === "past" && !(left !== null && left <= 0)) return false;
        return !q || `${t.title} ${t.reference} ${t.issuer} ${t.city} ${t.province}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const la = ["open", "closing_soon"].includes(tenderStatus(a)) ? 0 : 1;
        const lb = ["open", "closing_soon"].includes(tenderStatus(b)) ? 0 : 1;
        if (la !== lb) return la - lb;
        return la === 0 ? (a.deadline || "9").localeCompare(b.deadline || "9") : (b.deadline || "").localeCompare(a.deadline || "");
      });
  }, [tenders, f]);
  const dirty = Object.values(f).some(Boolean);
  const places = uniq([...tenders.map((t) => t.province), ...tenders.map((t) => t.city)]);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_20px_50px_-35px_rgba(16,36,58,0.4)] sm:p-6">
        <div role="group" aria-label="Sector" className="mb-5 inline-flex rounded-full bg-mist p-1">
          {[["", "All tenders"], ["government", "Government"], ["private", "Private"]].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={f.sector === v} onClick={() => set("sector")(v!)} className={`min-h-11 rounded-full px-4 text-sm font-semibold transition sm:px-5 ${f.sector === v ? "bg-navy text-white shadow" : "text-charcoal/70 hover:text-navy"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="self-end sm:col-span-2 lg:col-span-1"><SearchBox value={f.q} onChange={set("q")} placeholder="Title or reference" /></div>
          <Select label="Construction category" value={f.category} onChange={set("category")} options={uniq(tenders.map((t) => t.category)).map((c) => [c, c])} />
          <Select label="Province / city" value={f.province} onChange={set("province")} options={places.map((c) => [c, c])} />
          <Select label="Open / closed" value={f.status} onChange={set("status")} options={[["active", "Open (all)"], ["closing_soon", TENDER_STATUSES.closing_soon], ["inactive", "Closed / awarded"], ["closed", TENDER_STATUSES.closed], ["awarded", TENDER_STATUSES.awarded]]} />
          <Select label="Deadline" value={f.deadline} onChange={set("deadline")} options={[["7", "Within 7 days"], ["30", "Within 30 days"], ["past", "Deadline passed"]]} />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-charcoal/70">
          <p aria-live="polite">{list.length} tender{list.length === 1 ? "" : "s"}</p>
          {dirty && (
            <button type="button" onClick={clear} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy">
              <X className="h-4 w-4" aria-hidden /> Clear filters
            </button>
          )}
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {list.length === 0 ? <Empty onClear={clear} /> : list.map((t) => <TenderRow key={t.id} t={t} />)}
      </div>
    </div>
  );
}
