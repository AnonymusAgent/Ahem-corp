"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Copy, FileText, Loader2, Lock, Paperclip, X } from "lucide-react";
import { LEAD_FORMS, leadFormBySlug, validateForm, type FormField } from "@/lib/forms";
import { formatBytes } from "@/lib/site";

type FileSpec = { name: string; label: string; help: string; accept: string; multiple?: boolean; required?: boolean; maxMb: number; maxFiles: number };
type Result = { reference: string; emailSent: boolean };

/** Generic, accessible form bound to a JSON/multipart API endpoint. Validates on the client and again on the server. */
export function PublicForm({
  endpoint,
  fields,
  hidden = {},
  initial = {},
  file,
  submitLabel,
  successTitle = "Submission received",
}: {
  endpoint: string;
  fields: FormField[];
  hidden?: Record<string, string>;
  initial?: Record<string, string>;
  file?: FileSpec;
  submitLabel: string;
  successTitle?: string;
}) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  function addFiles(list: FileList | null) {
    if (!list || !file) return;
    const next = file.multiple ? [...files] : [];
    let problem = "";
    for (const f of Array.from(list)) {
      if (f.size > file.maxMb * 1024 * 1024) problem = `"${f.name}" is larger than ${file.maxMb} MB.`;
      else if (next.length >= file.maxFiles) problem = `You can attach up to ${file.maxFiles} file${file.maxFiles > 1 ? "s" : ""}.`;
      else if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
    setErrors((e) => ({ ...e, [file.name]: problem }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    const check = validateForm(fields, values);
    const errs = { ...check.errors };
    if (file?.required && files.length === 0) errs[file.name] = "Please attach the required file.";
    setErrors(errs);
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) {
      setFormError("Please correct the highlighted fields.");
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setState("submitting");
    setFormError("");
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(hidden)) fd.append(k, v);
      for (const f of fields) fd.append(f.name, check.values[f.name] ?? "");
      if (file) for (const f of files) fd.append(file.name, f);
      fd.append("fax_number", trap);
      fd.append("source", window.location.pathname);
      const res = await fetch(endpoint, { method: "POST", headers: { "x-ahem-csrf": "1" }, body: fd });
      const data = (await res.json().catch(() => ({}))) as { reference?: string; emailSent?: boolean; error?: string; fields?: Record<string, string> };
      if (!res.ok || !data.reference) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error || "We could not submit the form. Please try again.");
        setState("idle");
        return;
      }
      setResult({ reference: data.reference, emailSent: !!data.emailSent });
      setState("success");
    } catch {
      setFormError("Network error — please check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "success" && result) {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-7 sm:p-10">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
        <h3 className="mt-5 font-display text-2xl font-semibold text-navy">{successTitle}</h3>
        <p className="mt-2 text-charcoal/75">Your submission has been registered. Please quote this reference number in any follow-up.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <code className="rounded-xl bg-navy px-5 py-3 font-mono text-lg font-semibold tracking-wider text-gold">{result.reference}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(result.reference).then(() => setCopied(true)).catch(() => undefined)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/20 px-4 text-sm font-semibold text-navy hover:bg-white"
          >
            <Copy className="h-4 w-4" aria-hidden /> {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-5 text-sm text-charcoal/70">
          {result.emailSent
            ? `A confirmation email has been sent to ${values.email}.`
            : "Please save the reference number now — our team will contact you using the details you provided."}
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(initial);
            setFiles([]);
            setResult(null);
            setState("idle");
          }}
          className="btn-outline mt-7"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `${uid}-${f.name}`;
        const err = errors[f.name];
        const common = {
          id,
          name: f.name,
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? `${id}-err` : f.help ? `${id}-help` : undefined,
          required: f.required,
        };
        if (f.type === "checkbox") {
          return (
            <div key={f.name} className="sm:col-span-2">
              <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-charcoal/80">
                <input {...common} type="checkbox" checked={values[f.name] === "yes"} onChange={(e) => set(f.name, e.target.checked ? "yes" : "")} className="mt-1 h-5 w-5 shrink-0 rounded border-line accent-navy" />
                <span>
                  {f.label} {f.name === "consent" && <Link href="/legal/privacy-policy" target="_blank" className="font-medium text-navy underline underline-offset-4">Read the policy</Link>}
                </span>
              </label>
              {err && <p id={`${id}-err`} className="mt-1.5 text-sm text-red-600">{err}</p>}
            </div>
          );
        }
        return (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={id} className="field-label">
              {f.label} {f.required && <span className="text-red-600" aria-hidden>*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={5} maxLength={f.max ?? 5000} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} className="field resize-y" />
            ) : f.type === "select" ? (
              <select {...common} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} className="field">
                <option value="">Select…</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                {...common}
                type={f.type}
                maxLength={f.max ?? 200}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.name === "name" ? "name" : f.name === "organization" ? "organization" : "off"}
                className="field"
              />
            )}
            {f.help && !err && <p id={`${id}-help`} className="mt-1.5 text-xs text-charcoal/60">{f.help}</p>}
            {err && <p id={`${id}-err`} className="mt-1.5 text-sm text-red-600">{err}</p>}
          </div>
        );
      })}

      {file && (
        <div className="sm:col-span-2">
          <span className="field-label">
            {file.label} {file.required && <span className="text-red-600" aria-hidden>*</span>}
          </span>
          <label htmlFor={`${uid}-file`} className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition hover:border-navy hover:bg-mist ${errors[file.name] ? "border-red-400" : "border-navy/25"}`}>
            <Paperclip className="h-5 w-5 text-navy" aria-hidden />
            <span className="text-sm font-medium text-navy">Choose file{file.multiple ? "s" : ""} to attach</span>
            <span className="text-xs text-charcoal/60">{file.help}</span>
            <input
              id={`${uid}-file`}
              name={file.name}
              type="file"
              accept={file.accept}
              multiple={file.multiple}
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg bg-mist px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-navy" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-xs text-charcoal/60">{formatBytes(f.size)}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors[file.name] && <p className="mt-1.5 text-sm text-red-600">{errors[file.name]}</p>}
        </div>
      )}

      <div className="hidden" aria-hidden>
        <label>
          Fax number
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>

      <div className="sm:col-span-2">
        {formError && (
          <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {formError}
          </p>
        )}
        <button type="submit" disabled={state === "submitting"} className="btn-navy w-full sm:w-auto">
          {state === "submitting" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {state === "submitting" ? "Submitting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

const LEAD_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.csv,.txt,.dwg,.dxf,.zip";

/** Lead capture: tender invitations, project requirements, quotations, proposals, meetings and messages. */
export function LeadForm({ initialType = "project-requirement", lockType = false, only, prefill = {} }: { initialType?: string; lockType?: boolean; only?: string[]; prefill?: Record<string, string> }) {
  const [slug, setSlug] = useState(leadFormBySlug(initialType)?.slug ?? "project-requirement");
  const config = leadFormBySlug(slug)!;
  const choices = LEAD_FORMS.filter((f) => !only || only.includes(f.slug));
  return (
    <div>
      {!lockType && (
        <div role="tablist" aria-label="Type of request" className="mb-8 flex flex-wrap gap-2">
          {choices.map((f) => (
            <button
              key={f.slug}
              role="tab"
              type="button"
              aria-selected={f.slug === slug}
              onClick={() => setSlug(f.slug)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium transition ${f.slug === slug ? "border-navy bg-navy text-white" : "border-line bg-white text-charcoal/80 hover:border-navy"}`}
            >
              {f.short}
            </button>
          ))}
        </div>
      )}
      <h3 className="font-display text-2xl font-semibold text-navy">{config.title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/70">{config.intro}</p>
      {config.type === "tender_invitation" && (
        <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-navy/5 px-4 py-3 text-sm text-navy">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Confidential: visible only to our tender desk and administrators. Never published.
        </p>
      )}
      <div className="mt-7">
        <PublicForm
          key={config.slug}
          endpoint="/api/leads"
          fields={config.fields}
          hidden={{ type: config.slug }}
          initial={prefill}
          submitLabel={config.submitLabel}
          successTitle={`${config.short} received`}
          file={config.attachments ? { name: "attachments", label: config.attachments.label, help: config.attachments.help, accept: LEAD_ACCEPT, multiple: true, maxMb: 10, maxFiles: 5 } : undefined}
        />
      </div>
    </div>
  );
}
