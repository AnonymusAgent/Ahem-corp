"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { api, ApiClientError } from "./api";

export function SampleCleanup({ samples }: { samples: { key: string; label: string; n: number }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  async function remove(entity: string) {
    setBusy(entity);
    setMessage("");
    try {
      const res = await api<{ removed: number }>(`/api/admin/sample-data?entity=${entity}`, { method: "DELETE" });
      setMessage(`Removed ${res.removed} sample record${res.removed === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof ApiClientError ? e.message : "Could not remove sample records.");
    } finally {
      setBusy("");
      setConfirm("");
    }
  }

  if (samples.length === 0) {
    return (
      <p className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> No sample records remain.
      </p>
    );
  }

  const Row = ({ entity, label, n }: { entity: string; label: string; n?: number }) => (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-slate-800">
        {label} {n !== undefined && <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">{n}</span>}
      </span>
      {confirm === entity ? (
        <span className="flex items-center gap-2">
          <button type="button" onClick={() => remove(entity)} disabled={!!busy} className="a-btn-danger !py-1.5">
            {busy === entity ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />} Confirm delete
          </button>
          <button type="button" onClick={() => setConfirm("")} className="a-btn-light !py-1.5">Cancel</button>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirm(entity)} disabled={!!busy} className="a-btn-light !py-1.5">Remove samples</button>
      )}
    </li>
  );

  return (
    <>
      <ul className="mt-4 divide-y divide-slate-100">
        {samples.map((s) => <Row key={s.key} entity={s.key} label={s.label} n={s.n} />)}
        <Row entity="all" label="All sample records" />
      </ul>
      {message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}
    </>
  );
}
