"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import type { FileRef } from "@/db/schema";
import { formatBytes } from "@/lib/site";
import { api, ApiClientError } from "./api";

export async function uploadFile(file: File, kind: string): Promise<{ file: FileRef; url: string }> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  return api<{ file: FileRef; url: string }>("/api/admin/upload", { method: "POST", form });
}

function UploadButton({ kind, accept, multiple, onDone, label = "Upload" }: { kind: string; accept?: string; multiple?: boolean; onDone: (r: { file: FileRef; url: string }[]) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className="a-btn-light">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />} {busy ? "Uploading…" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const list = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!list.length) return;
          setBusy(true);
          setError("");
          const done: { file: FileRef; url: string }[] = [];
          try {
            for (const f of list) done.push(await uploadFile(f, kind));
          } catch (err) {
            setError(err instanceof ApiClientError ? err.message : "Upload failed.");
          }
          if (done.length) onDone(done);
          setBusy(false);
        }}
      />
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </span>
  );
}

export function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.includes("images.pexels.com") && !value.includes("?") ? `${value}?auto=compress&w=160` : value} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-slate-200 object-cover" />
      ) : (
        <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">No image</span>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <input id={id} type="text" inputMode="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" className="a-input" />
        <UploadButton kind="media" accept=".png,.jpg,.jpeg,.webp" onDone={(r) => onChange(r[0]!.url)} label="Upload image" />
      </div>
    </div>
  );
}

function FileRow({ f, onRemove }: { f: FileRef; onRemove?: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <a href={`/api/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-medium text-navy hover:underline">{f.name}</a>
      {f.size ? <span className="shrink-0 text-xs text-slate-500">{formatBytes(f.size)}</span> : null}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${f.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </li>
  );
}

export function FileField({ value, onChange, kind, accept, readOnly }: { value: FileRef | null; onChange?: (v: FileRef | null) => void; kind: string; accept?: string; readOnly?: boolean }) {
  return (
    <div className="space-y-2">
      {value ? <ul><FileRow f={value} onRemove={readOnly ? undefined : () => onChange?.(null)} /></ul> : <p className="text-sm text-slate-500">No file attached.</p>}
      {!readOnly && <UploadButton kind={kind} accept={accept} onDone={(r) => onChange?.(r[0]!.file)} label={value ? "Replace file" : "Upload file"} />}
    </div>
  );
}

export function FilesField({ value, onChange, kind, accept }: { value: FileRef[]; onChange: (v: FileRef[]) => void; kind: string; accept?: string }) {
  return (
    <div className="space-y-2">
      {value.length > 0 && <ul className="space-y-2">{value.map((f) => <FileRow key={f.id} f={f} onRemove={() => onChange(value.filter((x) => x.id !== f.id))} />)}</ul>}
      <UploadButton kind={kind} accept={accept} multiple onDone={(r) => onChange([...value, ...r.map((x) => x.file)])} label="Upload files" />
    </div>
  );
}
