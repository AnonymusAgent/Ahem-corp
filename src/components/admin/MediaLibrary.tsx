"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Copy, ExternalLink, FileText, Film, Loader2, Trash2, Upload } from "lucide-react";
import { formatBytes, formatDateTime } from "@/lib/site";
import { api, ApiClientError } from "./api";
import { uploadFile } from "./fields";

type MediaFile = { id: string; name: string; mime: string; size: number; createdAt: string };

export function MediaLibrary() {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [confirm, setConfirm] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api<{ rows: MediaFile[]; total: number }>("/api/admin/media?pageSize=100");
      setFiles(res.rows);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Could not load the media library.");
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onPick(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setError("");
    for (const f of Array.from(list)) {
      try {
        await uploadFile(f, "media");
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : `Could not upload ${f.name}.`);
      }
    }
    setBusy(false);
    await load();
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/media/${id}`, { method: "DELETE" });
      setConfirm("");
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Could not delete the file.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl font-semibold text-navy">Media library</h1>
          <p className="mt-1 text-sm text-slate-600">Upload images, videos and PDFs, then copy the URL into any image or link field. Accepted: PNG, JPG, WebP, MP4, WebM, PDF — up to 20 MB each. Files here are publicly accessible by URL.</p>
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="a-btn-primary shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />} {busy ? "Uploading…" : "Upload files"}
        </button>
        <input ref={input} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.mp4,.webm,.pdf" className="sr-only" tabIndex={-1} onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
      </div>
      {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden />{error}</p>}

      {files === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="a-card h-56 animate-pulse bg-slate-100" />)}</div>
      ) : files.length === 0 ? (
        <div className="a-card border-dashed px-6 py-20 text-center">
          <Upload className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
          <p className="mt-4 font-medium text-slate-800">The media library is empty</p>
          <p className="mt-1 text-sm text-slate-500">Upload project photos, videos and documents to use across the website.</p>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((f) => {
              const url = `/api/files/${f.id}`;
              return (
                <li key={f.id} className="a-card overflow-hidden">
                  <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                    {f.mime.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : f.mime.startsWith("video/") ? (
                      <Film className="h-10 w-10 text-slate-400" aria-hidden />
                    ) : (
                      <FileText className="h-10 w-10 text-slate-400" aria-hidden />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-slate-900" title={f.name}>{f.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(f.size)} · {formatDateTime(f.createdAt)}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <button type="button" onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopied(f.id); window.setTimeout(() => setCopied(""), 2000); }).catch(() => undefined)} className="a-btn-light flex-1 !px-2 !py-1.5 text-xs">
                        <Copy className="h-3.5 w-3.5" aria-hidden /> {copied === f.id ? "Copied" : "Copy URL"}
                      </button>
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${f.name}`} className="a-btn-light !px-2 !py-1.5"><ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>
                      {confirm === f.id ? (
                        <button type="button" onClick={() => remove(f.id)} className="a-btn bg-red-600 !px-2 !py-1.5 text-xs text-white">Confirm</button>
                      ) : (
                        <button type="button" onClick={() => setConfirm(f.id)} aria-label={`Delete ${f.name}`} className="a-btn-danger !px-2 !py-1.5"><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {total > files.length && <p className="text-sm text-slate-500">Showing the latest {files.length} of {total} files.</p>}
        </>
      )}
    </div>
  );
}
