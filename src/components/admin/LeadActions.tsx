"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/site";
import { api, ApiClientError } from "./api";

export function LeadActions({ id, status, assignedTo, staff, canDelete }: { id: number; status: string; assignedTo: number | null; staff: { id: number; name: string }[]; canDelete: boolean }) {
  const router = useRouter();
  const [next, setNext] = useState(status);
  const [owner, setOwner] = useState(assignedTo ? String(assignedTo) : "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const changed = next !== status || owner !== (assignedTo ? String(assignedTo) : "") || note.trim() !== "";

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!changed) return;
    setBusy(true);
    setMsg(null);
    try {
      await api(`/api/admin/crm/${id}`, { method: "PATCH", body: { status: next, assignedTo: owner === "" ? null : Number(owner), note } });
      setNote("");
      setMsg({ ok: true, text: "Lead updated and recorded in the activity history." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiClientError ? err.message : "Could not update the lead." });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/admin/leads/${id}`, { method: "DELETE" });
      router.push("/admin/leads");
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiClientError ? err.message : "Could not delete the lead." });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="a-card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-navy">Manage lead</h2>
      <div>
        <label htmlFor="lead-status" className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select id="lead-status" value={next} onChange={(e) => setNext(e.target.value)} className="a-input">
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="lead-owner" className="mb-1 block text-sm font-medium text-slate-700">Assigned to</label>
        <select id="lead-owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="a-input">
          <option value="">Unassigned</option>
          {staff.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="lead-note" className="mb-1 block text-sm font-medium text-slate-700">Add a note</label>
        <textarea id="lead-note" rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Call summary, next step, quotation reference…" className="a-input resize-y" />
      </div>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {msg.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />} {msg.text}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={busy || !changed} className="a-btn-primary">{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save update</button>
        {canDelete &&
          (confirm ? (
            <span className="flex items-center gap-2">
              <button type="button" onClick={remove} disabled={busy} className="a-btn bg-red-600 text-white hover:bg-red-700">Delete permanently</button>
              <button type="button" onClick={() => setConfirm(false)} className="a-btn-light">Cancel</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="a-btn-danger"><Trash2 className="h-4 w-4" aria-hidden /> Delete lead</button>
          ))}
      </div>
    </form>
  );
}
