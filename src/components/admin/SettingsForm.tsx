"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { FileRef } from "@/db/schema";
import type { SettingField } from "@/lib/settings";
import { api, ApiClientError } from "./api";
import { FileField, ImageField } from "./fields";

export function SettingsForm({ group, label, description, fields, values: initial }: { group: string; label: string; description: string; fields: SettingField[]; values: Record<string, unknown> }) {
  const router = useRouter();
  const uid = useId();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (name: string, v: unknown) => {
    setValues((x) => ({ ...x, [name]: v }));
    setMsg(null);
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/settings", { method: "PUT", body: { group, values } });
      setMsg({ ok: true, text: "Settings saved. The website now shows the new values." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiClientError ? err.message : "Could not save settings." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="a-card">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-navy">{label}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-2">
        {fields.map((f) => {
          const id = `${uid}-${f.name}`;
          const v = values[f.name];
          if (f.type === "boolean") {
            return (
              <label key={f.name} htmlFor={id} className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
                <input id={id} type="checkbox" checked={!!v} onChange={(e) => set(f.name, e.target.checked)} className="mt-0.5 h-4 w-4 accent-navy" />
                <span className="text-slate-800">{f.label}</span>
              </label>
            );
          }
          const wide = f.type !== "text";
          return (
            <div key={f.name} className={wide ? "lg:col-span-2" : ""}>
              <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              {f.type === "image" ? (
                <ImageField id={id} value={String(v ?? "")} onChange={(x) => set(f.name, x)} />
              ) : f.type === "file" ? (
                <FileField value={(v as FileRef | null) ?? null} onChange={(x) => set(f.name, x)} kind="profile" accept=".pdf" />
              ) : f.type === "text" ? (
                <input id={id} type="text" value={String(v ?? "")} maxLength={f.max} onChange={(e) => set(f.name, e.target.value)} className="a-input" />
              ) : (
                <textarea id={id} rows={f.type === "rows" ? 6 : 4} value={String(v ?? "")} maxLength={f.max} onChange={(e) => set(f.name, e.target.value)} className={`a-input resize-y ${f.type === "rows" ? "font-mono text-[0.8rem]" : ""}`} />
              )}
              {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <button type="submit" disabled={busy} className="a-btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save {label.toLowerCase()}</button>
        {msg && (
          <p role={msg.ok ? "status" : "alert"} className={`flex items-center gap-2 text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>
            {msg.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertCircle className="h-4 w-4" aria-hidden />} {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
