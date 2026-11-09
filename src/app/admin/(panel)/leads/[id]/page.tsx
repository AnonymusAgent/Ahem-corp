import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { ArrowLeft, Building2, Download, Lock, Mail, Phone, UserRound } from "lucide-react";
import { LeadActions } from "@/components/admin/LeadActions";
import { db } from "@/db";
import { emailLog, leadActivities, leads, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { leadFormBySlug } from "@/lib/forms";
import { can, formatBytes, formatDateTime, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS, leadTypesForRole, type LeadStatus, type LeadType } from "@/lib/site";

export const metadata = { title: "Lead" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("leads");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  // Row-level scope: a role can only open lead types it is allowed to see.
  const [lead] = await db.select().from(leads).where(and(eq(leads.id, id), inArray(leads.type, leadTypesForRole(user.role)))).limit(1);
  if (!lead) notFound();
  const [activity, staff, emails] = await Promise.all([
    db.select().from(leadActivities).where(eq(leadActivities.leadId, id)).orderBy(desc(leadActivities.createdAt), desc(leadActivities.id)),
    db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(eq(users.active, true)).orderBy(asc(users.name)),
    db.select().from(emailLog).where(eq(emailLog.reference, lead.reference)).orderBy(desc(emailLog.createdAt)),
  ]);
  const assignable = staff.filter((u) => (leadTypesForRole(u.role) as string[]).includes(lead.type));
  const labels = Object.fromEntries((leadFormBySlug(lead.type)?.fields ?? []).map((f) => [f.name, f.label]));
  const details = Object.entries(lead.details);
  const row = "flex items-start gap-3 text-sm text-slate-700";

  return (
    <div className="space-y-6">
      <Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to leads</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-slate-500">{lead.reference}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-navy">{lead.subject || lead.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">{LEAD_TYPE_LABELS[lead.type as LeadType] ?? lead.type}</span>
            <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700">{LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}</span>
            {lead.isSample && <span className="rounded border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-amber-800">Sample record</span>}
            <span className="text-slate-500">Received {formatDateTime(lead.createdAt)}</span>
          </p>
        </div>
      </div>
      {lead.type === "tender_invitation" && <p className="flex items-center gap-2 rounded-xl border border-navy/15 bg-navy/5 px-4 py-3 text-sm text-navy"><Lock className="h-4 w-4 shrink-0" aria-hidden /> Confidential tender invitation — not published anywhere on the website.</p>}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Contact</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li className={row}><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden /><span>{lead.name}{lead.designation && <span className="block text-slate-500">{lead.designation}</span>}</span></li>
              {lead.organization && <li className={row}><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden /><span>{lead.organization}{lead.sector && <span className="block text-slate-500">{lead.sector}</span>}</span></li>}
              <li className={row}><Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden /><a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.subject} [${lead.reference}]`)}`} className="break-all font-medium text-navy hover:underline">{lead.email}</a></li>
              {lead.phone && <li className={row}><Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden /><a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className="font-medium text-navy hover:underline">{lead.phone}</a></li>}
            </ul>
          </section>

          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Submission</h2>
            {details.length > 0 && (
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {details.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labels[k] ?? k}</dt>
                    <dd className="mt-0.5 text-sm text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">{labels.message ?? "Message"}</h3>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{lead.message || "—"}</p>
            {lead.source && <p className="mt-4 text-xs text-slate-500">Submitted from: {lead.source}</p>}
          </section>

          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Attachments</h2>
            {lead.attachments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No BOQs, drawings or documents were attached.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lead.attachments.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/files/${f.id}?download`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:border-navy">
                      <Download className="h-4 w-4 shrink-0 text-navy" aria-hidden />
                      <span className="min-w-0 flex-1 truncate font-medium text-navy">{f.name}</span>
                      {f.size ? <span className="shrink-0 text-xs text-slate-500">{formatBytes(f.size)}</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">Downloads require sign-in and are recorded in the audit log.</p>
          </section>

          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Emails</h2>
            {emails.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No emails were generated for this reference.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {emails.map((e) => (
                  <li key={e.id} className="py-2.5 text-sm">
                    <p className="font-medium text-slate-800">{e.subject}</p>
                    <p className="text-xs text-slate-500">To {e.recipient} · {formatDateTime(e.createdAt)} · <span className={e.status === "sent" ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{e.status === "sent" ? "Sent" : e.status === "failed" ? `Failed: ${e.error}` : "Not delivered — SMTP not configured"}</span></p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <LeadActions id={lead.id} status={lead.status} assignedTo={lead.assignedTo} staff={assignable.map((u) => ({ id: u.id, name: u.name }))} canDelete={can(user.role, "settings")} />
          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Activity history</h2>
            <ol className="mt-5 space-y-5 border-l border-slate-200 pl-5">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-gold-600" aria-hidden />
                  <p className="text-sm font-medium text-slate-900">{a.action}</p>
                  {a.note && <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{a.note}</p>}
                  <p className="mt-1 text-xs text-slate-500">{a.actor} · {formatDateTime(a.createdAt)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
