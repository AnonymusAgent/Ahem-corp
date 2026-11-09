"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiClientError } from "./api";

export function AccountForm() {
  const router = useRouter();
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setDone(false);
    if (v.next !== v.confirm) return setErrors({ confirm: "The new passwords do not match." });
    setBusy(true);
    setErrors({});
    try {
      await api("/api/auth/password", { method: "POST", body: { current: v.current, next: v.next } });
      setV({ current: "", next: "", confirm: "" });
      setDone(true);
      router.refresh();
    } catch (err) {
      setErrors(err instanceof ApiClientError ? (err.fields ?? { form: err.message }) : { form: "Could not change the password." });
    } finally {
      setBusy(false);
    }
  }

  const field = (name: "current" | "next" | "confirm", label: string, auto: string, help?: string) => (
    <div>
      <label htmlFor={`pw-${name}`} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input id={`pw-${name}`} type="password" autoComplete={auto} required value={v[name]} onChange={(e) => setV({ ...v, [name]: e.target.value })} className="a-input" aria-invalid={!!errors[name]} />
      {help && !errors[name] && <p className="mt-1 text-xs text-slate-500">{help}</p>}
      {errors[name] && <p className="mt-1 text-xs font-medium text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="a-card space-y-4 p-5 sm:p-6" noValidate>
      <h2 className="font-display text-lg font-semibold text-navy">Change password</h2>
      {field("current", "Current password", "current-password")}
      {field("next", "New password", "new-password", "At least 10 characters, including letters and numbers.")}
      {field("confirm", "Confirm new password", "new-password")}
      {errors.form && <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" aria-hidden />{errors.form}</p>}
      {done && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" aria-hidden />Password changed. Other signed-in sessions have been signed out.</p>}
      <button type="submit" disabled={busy || !v.current || !v.next || !v.confirm} className="a-btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Update password</button>
    </form>
  );
}
