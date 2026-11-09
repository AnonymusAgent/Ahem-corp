"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { FileRef } from "@/db/schema";
import type { AdminColumn, AdminField, ResourceDef } from "@/lib/resources";
import { formatBytes, formatDate, formatDateTime } from "@/lib/site";
import { api, ApiClientError } from "./api";
import { FileField, FilesField, ImageField } from "./fields";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function Cell({ col, row }: { col: AdminColumn; row: Row }): ReactNode {
  const v = row[col.name];
  if (col.kind === "bool") return v ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Yes</span> : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">No</span>;
  if (v == null || v === "") return <span className="text-slate-400">—</span>;
  if (col.kind === "badge") return <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{col.map?.[v] ?? String(v).replace(/_/g, " ")}</span>;
  if (col.kind === "date") return <span className="whitespace-nowrap">{formatDate(v)}</span>;
  if (col.kind === "datetime") return <span className="whitespace-nowrap">{formatDateTime(v)}</span>;
  if (col.kind === "size") return formatBytes(Number(v));
  if (col.kind === "file") return v?.id ? <a href={`/api/files/${v.id}?download`} className="inline-flex items-center gap-1 font-medium text-navy hover:underline"><Download className="h-3.5 w-3.5" aria-hidden />Download</a> : <span className="text-slate-400">—</span>;
  return <span className="line-clamp-2 max-w-xs">{String(v)}</span>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-navy-950/60" onClick={onClose} />
      <div className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-md"}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function initialValue(f: AdminField, row: Row | null): any {
  const v = row?.[f.name];
  if (f.type === "list" || f.type === "images") return Array.isArray(v) ? v.join("\n") : "";
  if (f.type === "files") return Array.isArray(v) ? v : [];
  if (f.type === "file") return v ?? null;
  if (f.type === "boolean") return row ? !!v : f.name === "active";
  if (f.type === "number") return v ?? 0;
  if (f.type === "password") return "";
  if (f.type === "select" && !row && f.required) return f.options?.[0]?.[0] ?? "";
  return v ?? "";
}

function RecordForm({ def, row, onClose, onSaved }: { def: ResourceDef; row: Row | null; onClose: () => void; onSaved: (message: string) => void }) {
  const uid = useId();
  const [values, setValues] = useState<Row>(() => Object.fromEntries(def.fields.map((f) => [f.name, initialValue(f, row)])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (name: string, v: any) => setValues((x) => ({ ...x, [name]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    const body: Row = {};
    for (const f of def.fields) {
      if (f.readOnly || (row && f.lockOnEdit)) continue;
      if (f.type === "password" && !values[f.name]) continue;
      body[f.name] = values[f.name];
    }
    try {
      await api(row ? `/api/admin/${def.key}/${row.id}` : `/api/admin/${def.key}`, { method: row ? "PATCH" : "POST", body });
      onSaved(row ? "Changes saved." : `New ${def.singular} created.`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        setErrors(err.fields ?? {});
      } else setError("Could not save. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2" data-lenis-prevent>
        {def.fields.map((f) => {
          const id = `${uid}-${f.name}`;
          const locked = f.readOnly || (!!row && f.lockOnEdit);
          const v = values[f.name];
          const err = errors[f.name];
          let control: ReactNode;
          if (f.type === "boolean") {
            return (
              <label key={f.name} htmlFor={id} className={`flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm ${f.half ? "" : "sm:col-span-2"}`}>
                <input id={id} type="checkbox" checked={!!v} disabled={locked} onChange={(e) => set(f.name, e.target.checked)} className="mt-0.5 h-4 w-4 accent-navy" />
                <span className="text-slate-800">{f.label}</span>
              </label>
            );
          } else if (f.type === "file") control = <FileField value={v as FileRef | null} onChange={(x) => set(f.name, x)} kind={f.fileKind ?? "media"} readOnly={locked} />;
          else if (f.type === "files") control = <FilesField value={v as FileRef[]} onChange={(x) => set(f.name, x)} kind={f.fileKind ?? "media"} />;
          else if (locked) control = <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800">{v === "" || v == null ? "—" : String(v)}</p>;
          else if (f.type === "image") control = <ImageField id={id} value={v ?? ""} onChange={(x) => set(f.name, x)} />;
          else if (f.type === "select")
            control = (
              <select id={id} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className="a-input" aria-invalid={!!err}>
                {!f.required && <option value="">—</option>}
                {f.options?.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            );
          else if (["textarea", "markdown", "list", "images"].includes(f.type))
            control = <textarea id={id} rows={f.type === "markdown" ? 10 : f.type === "textarea" ? 4 : 5} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className={`a-input resize-y ${f.type === "textarea" ? "" : "font-mono text-[0.8rem]"}`} aria-invalid={!!err} />;
          else
            control = (
              <input
                id={id}
                type={f.type === "password" ? "password" : f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
                value={v ?? ""}
                autoComplete={f.type === "password" ? "new-password" : "off"}
                onChange={(e) => set(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                className="a-input"
                aria-invalid={!!err}
              />
            );
          return (
            <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
              <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
                {f.label} {f.required && !locked && <span className="text-red-600" aria-hidden>*</span>}
              </label>
              {control}
              {f.type === "markdown" && <p className="mt-1 text-xs text-slate-500">Formatting: blank line = new paragraph · “## ” heading · “- ” bullet · **bold**</p>}
              {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
              {err && <p className="mt-1 text-xs font-medium text-red-600">{err}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
        {error && <p role="alert" className="mr-auto flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" aria-hidden />{error}</p>}
        <button type="button" onClick={onClose} className="a-btn-light">Cancel</button>
        <button type="submit" disabled={busy} className="a-btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{row ? "Save changes" : `Create ${def.singular}`}</button>
      </div>
    </form>
  );
}

export function ResourceManager({ def, initial, canDelete, title, note }: { def: ResourceDef; initial: Record<string, string>; canDelete: boolean; title?: string; note?: string }) {
  const [q, setQ] = useState(initial.q ?? "");
  const [filters, setFilters] = useState<Record<string, string>>(() => Object.fromEntries(def.filters.map((f) => [f.name, initial[`f_${f.name}`] ?? ""])));
  const [sort, setSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: def.sort[0], dir: def.sort[1] });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ rows: Row[]; total: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [toast, setToast] = useState("");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    for (const [k, v] of Object.entries(filters)) if (v) p.set(`f_${k}`, v);
    p.set("sort", sort.col);
    p.set("dir", sort.dir);
    return p.toString();
  }, [q, filters, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api<{ rows: Row[]; total: number; pageSize: number }>(`/api/admin/${def.key}?${query}&page=${page}`));
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Could not load records.");
    } finally {
      setLoading(false);
    }
  }, [def.key, query, page]);

  useEffect(() => {
    const id = window.setTimeout(load, 220);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function togglePublish(row: Row) {
    setBusyId(row.id);
    try {
      await api(`/api/admin/${def.key}/${row.id}`, { method: "PATCH", body: { published: !row.published } });
      setToast(row.published ? "Unpublished." : "Published.");
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: Row) {
    setBusyId(row.id);
    try {
      await api(`/api/admin/${def.key}/${row.id}`, { method: "DELETE" });
      setDeleting(null);
      setToast("Record deleted.");
      await load();
    } catch (e) {
      setDeleting(null);
      setError(e instanceof ApiClientError ? e.message : "Could not delete.");
    } finally {
      setBusyId(null);
    }
  }

  const closeForm = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const hasActions = def.canEdit || def.publishable || (def.canDelete && canDelete) || !!def.publicPath;
  const dirty = !!q || Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl font-semibold text-navy">{title ?? def.label}</h1>
          <p className="mt-1 text-sm text-slate-600">{note ?? def.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={`/api/admin/${def.key}/export?${query}`} className="a-btn-light"><Download className="h-4 w-4" aria-hidden /> Export CSV</a>
          {def.canCreate && <button type="button" onClick={() => setEditing("new")} className="a-btn-primary"><Plus className="h-4 w-4" aria-hidden /> Add {def.singular}</button>}
        </div>
      </div>

      <div className="a-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search {def.label}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={`Search ${def.label.toLowerCase()}…`} className="a-input !pl-9" />
          </label>
          <div className="flex flex-wrap gap-2">
            {def.filters.map((f) => (
              <label key={f.name} className="block">
                <span className="sr-only">{f.label}</span>
                <select value={filters[f.name] ?? ""} onChange={(e) => { setFilters((x) => ({ ...x, [f.name]: e.target.value })); setPage(1); }} className="a-input !w-auto">
                  <option value="">{f.label}: all</option>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            ))}
            {dirty && <button type="button" onClick={() => { setQ(""); setFilters(Object.fromEntries(def.filters.map((f) => [f.name, ""]))); setPage(1); }} className="a-btn-light"><X className="h-4 w-4" aria-hidden /> Clear</button>}
          </div>
        </div>

        {error && <p role="alert" className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" aria-hidden />{error}<button type="button" onClick={load} className="ml-auto font-semibold underline">Retry</button></p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {def.columns.map((c) => (
                  <th key={c.name} scope="col" className="px-4 py-3 font-semibold" aria-sort={sort.col === c.name ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                    <button type="button" onClick={() => setSort((s) => ({ col: c.name, dir: s.col === c.name && s.dir === "asc" ? "desc" : "asc" }))} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-navy">
                      {c.label}
                      {sort.col === c.name && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />)}
                    </button>
                  </th>
                ))}
                {hasActions && <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 ${loading && data ? "opacity-50" : ""}`}>
              {!data && loading && Array.from({ length: 6 }, (_, i) => (
                <tr key={i}><td colSpan={def.columns.length + 1} className="px-4 py-3.5"><div className="h-4 animate-pulse rounded bg-slate-100" /></td></tr>
              ))}
              {data?.rows.length === 0 && (
                <tr>
                  <td colSpan={def.columns.length + 1} className="px-4 py-16 text-center">
                    <p className="font-medium text-slate-700">{dirty ? "No records match your search or filters." : `No ${def.label.toLowerCase()} yet.`}</p>
                    {!dirty && def.canCreate && <button type="button" onClick={() => setEditing("new")} className="a-btn-primary mt-4"><Plus className="h-4 w-4" aria-hidden /> Add the first {def.singular}</button>}
                  </td>
                </tr>
              )}
              {data?.rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-slate-50/70">
                  {def.columns.map((c, i) => (
                    <td key={c.name} className={`px-4 py-3 text-slate-700 ${i === 0 ? "min-w-44" : ""}`}>
                      {i === 0 ? (
                        <span className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                          {def.rowLink ? <Link href={def.rowLink.replace("{id}", String(row.id))} className="text-navy hover:underline">{String(row[c.name] ?? "—")}</Link> : def.canEdit ? <button type="button" onClick={() => setEditing(row)} className="text-left text-navy hover:underline">{String(row[c.name] ?? "—")}</button> : <Cell col={c} row={row} />}
                          {row.isSample && <span className="rounded border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-amber-800">Sample</span>}
                        </span>
                      ) : (
                        <Cell col={c} row={row} />
                      )}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {def.publicPath && row.published !== false && row.slug && (
                          <a href={def.publicPath.replace("{slug}", row.slug)} target="_blank" rel="noopener noreferrer" title="View on website" aria-label="View on website" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy"><ExternalLink className="h-4 w-4" aria-hidden /></a>
                        )}
                        {def.publishable && (
                          <button type="button" disabled={busyId === row.id} onClick={() => togglePublish(row)} title={row.published ? "Unpublish" : "Publish"} aria-label={row.published ? "Unpublish" : "Publish"} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy">
                            {busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : row.published ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                          </button>
                        )}
                        {def.canEdit && <button type="button" onClick={() => setEditing(row)} title="Edit" aria-label="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy"><Pencil className="h-4 w-4" aria-hidden /></button>}
                        {def.canDelete && canDelete && <button type="button" onClick={() => setDeleting(row)} title="Delete" aria-label="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" aria-hidden /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <p aria-live="polite">{total === 0 ? "0 records" : `${(page - 1) * pageSize + 1}–${Math.min(total, page * pageSize)} of ${total}`}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="a-btn-light !px-2.5" aria-label="Previous page"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
            <span className="tabular-nums">Page {page} of {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="a-btn-light !px-2.5" aria-label="Next page"><ChevronRight className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
      </div>

      {editing && (
        <Modal title={editing === "new" ? `Add ${def.singular}` : `Edit ${def.singular}`} onClose={closeForm} wide>
          <RecordForm def={def} row={editing === "new" ? null : editing} onClose={closeForm} onSaved={(m) => { setEditing(null); setToast(m); load(); }} />
        </Modal>
      )}
      {deleting && (
        <Modal title={`Delete ${def.singular}?`} onClose={closeDelete}>
          <div className="px-5 py-5 text-sm text-slate-700">
            <p><strong className="text-slate-900">{String(deleting[def.titleField] ?? "This record")}</strong> will be permanently deleted. This cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
            <button type="button" onClick={closeDelete} className="a-btn-light">Cancel</button>
            <button type="button" disabled={busyId === deleting.id} onClick={() => remove(deleting)} className="a-btn bg-red-600 text-white hover:bg-red-700">{busyId === deleting.id && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Delete</button>
          </div>
        </Modal>
      )}
      {toast && <p role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 className="h-4 w-4 text-gold" aria-hidden />{toast}</p>}
    </div>
  );
}
