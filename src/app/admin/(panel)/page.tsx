import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Circle, Eye, FileText, FolderKanban, Gavel, Inbox, TrendingUp, Users } from "lucide-react";
import { SampleCleanup } from "@/components/admin/SampleCleanup";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { can, formatDateTime, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS, type LeadType } from "@/lib/site";

export const metadata = { title: "Dashboard" };

const STATUS_COLOR: Record<string, string> = {
  new: "bg-sky-500", under_review: "bg-indigo-500", contacted: "bg-violet-500", quotation_submitted: "bg-amber-500", negotiation: "bg-orange-500", won: "bg-emerald-500", lost: "bg-slate-400",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("dashboard");
  const [d, sp] = await Promise.all([getDashboard(user), searchParams]);
  const maxMonth = Math.max(1, ...d.months.map((m) => m.n));
  const maxStatus = Math.max(1, ...Object.values(d.byStatus));

  const cards = [
    { label: "Website visitors", value: d.visitors30, note: `Unique, last 30 days · ${d.views30} page views`, icon: Eye, show: true, href: undefined },
    { label: "Total inquiries", value: d.totalLeads, note: d.sampleLeads ? `Includes ${d.sampleLeads} sample record${d.sampleLeads === 1 ? "" : "s"}` : "All submissions", icon: Inbox, show: d.seesLeads, href: "/admin/leads" },
    { label: "New tender invitations", value: d.newTenderInvitations, note: "Awaiting first review", icon: Gavel, show: can(user.role, "leads") && d.byType.tender_invitation !== undefined && (user.role !== "project_manager"), href: "/admin/leads?f_type=tender_invitation&f_status=new" },
    { label: "Project inquiries", value: d.projectInquiries, note: "Requirements, quotations, proposals", icon: Users, show: d.seesLeads && user.role !== "tender_manager", href: "/admin/leads?f_type=project_requirement" },
    { label: "Active tenders", value: d.activeTenders, note: "Published and open", icon: FileText, show: true, href: can(user.role, "tenders") ? "/admin/tenders" : undefined },
    { label: "Open job applications", value: d.openApplications, note: "New, shortlisted, interview", icon: Briefcase, show: can(user.role, "applications"), href: "/admin/applications" },
    { label: "Published projects", value: d.publishedProjects, note: "Visible in the portfolio", icon: FolderKanban, show: true, href: can(user.role, "projects") ? "/admin/projects" : undefined },
    { label: "Lead conversion", value: d.conversion === null ? "—" : `${d.conversion}%`, note: d.conversion === null ? "No won or lost leads yet" : `${d.won} won · ${d.lost} lost · ${d.inPipeline} in pipeline`, icon: TrendingUp, show: d.seesLeads, href: undefined },
  ].filter((c) => c.show);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Welcome back, {user.name}. All figures are calculated live from the database.</p>
      </div>
      {sp.denied && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Your role does not have access to that module.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const body = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{c.label}</p>
                <c.icon className="h-5 w-5 text-gold-600" aria-hidden />
              </div>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-navy">{c.value}</p>
              <p className="mt-1 text-xs text-slate-500">{c.note}</p>
            </>
          );
          return (
            <li key={c.label}>
              {c.href ? <Link href={c.href} className="a-card block h-full p-5 transition hover:border-navy/40 hover:shadow-md">{body}</Link> : <div className="a-card h-full p-5">{body}</div>}
            </li>
          );
        })}
      </ul>

      {d.seesLeads && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="a-card p-5 sm:p-6" aria-labelledby="chart-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="chart-title" className="font-display text-lg font-semibold text-navy">Monthly inquiries</h2>
              <p className="text-xs text-slate-500">Last 12 months{d.sampleLeads ? " · includes sample records" : ""}</p>
            </div>
            {d.totalLeads === 0 ? (
              <p className="mt-8 rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">No inquiries yet. Submissions from the website forms will be charted here.</p>
            ) : (
              <div className="mt-6 flex h-56 items-end gap-1.5 sm:gap-3" role="img" aria-label={`Inquiries per month: ${d.months.map((m) => `${m.label} ${m.n}`).join(", ")}`}>
                {d.months.map((m) => (
                  <div key={m.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[0.7rem] font-semibold tabular-nums text-slate-600">{m.n || ""}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-navy to-navy-600 transition-all" style={{ height: `${Math.max(m.n ? 6 : 1.5, (m.n / maxMonth) * 78)}%`, opacity: m.n ? 1 : 0.25 }} />
                    <span className="text-[0.65rem] uppercase tracking-wide text-slate-500">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="a-card p-5 sm:p-6" aria-labelledby="pipeline-title">
            <h2 id="pipeline-title" className="font-display text-lg font-semibold text-navy">Lead pipeline</h2>
            <ul className="mt-5 space-y-3">
              {LEAD_STATUSES.map((s) => (
                <li key={s}>
                  <Link href={`/admin/leads?f_status=${s}`} className="group block">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 group-hover:text-navy group-hover:underline">{LEAD_STATUS_LABELS[s]}</span>
                      <span className="font-semibold tabular-nums text-navy">{d.byStatus[s] ?? 0}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${STATUS_COLOR[s]}`} style={{ width: `${((d.byStatus[s] ?? 0) / maxStatus) * 100}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {d.seesLeads && (
          <section className="a-card overflow-hidden" aria-labelledby="recent-leads">
            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
              <h2 id="recent-leads" className="font-display text-lg font-semibold text-navy">Latest submissions</h2>
              <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:underline">All leads <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            {d.recentLeads.length === 0 ? (
              <p className="border-t border-slate-100 px-6 py-10 text-center text-sm text-slate-500">Nothing received yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {d.recentLeads.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 sm:px-6">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{l.subject || l.name}</p>
                        <p className="truncate text-xs text-slate-500">{LEAD_TYPE_LABELS[l.type as LeadType] ?? l.type} · {l.organization || l.name} · {formatDateTime(l.createdAt)}</p>
                      </div>
                      {l.isSample && <span className="rounded border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-amber-800">Sample</span>}
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{LEAD_STATUS_LABELS[l.status as keyof typeof LEAD_STATUS_LABELS] ?? l.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="a-card overflow-hidden" aria-labelledby="recent-activity">
          <div className="flex items-center justify-between px-5 py-4 sm:px-6">
            <h2 id="recent-activity" className="font-display text-lg font-semibold text-navy">Recent activity</h2>
            {can(user.role, "audit") && <Link href="/admin/audit" className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:underline">Audit log <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
          </div>
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {d.recent.length === 0 && <li className="px-6 py-10 text-center text-sm text-slate-500">No activity recorded yet.</li>}
            {d.recent.map((a) => (
              <li key={a.id} className="px-5 py-3 sm:px-6">
                <p className="text-sm text-slate-800"><span className="font-medium">{a.actor.split(" <")[0]}</span> · <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">{a.action.replace(/_/g, " ")}</span> {a.entity && <span className="text-slate-500">{a.entity}</span>}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{a.summary} · {formatDateTime(a.createdAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {d.checklist.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="a-card p-5 sm:p-6" aria-labelledby="checklist">
            <h2 id="checklist" className="font-display text-lg font-semibold text-navy">Go-live checklist</h2>
            <p className="mt-1 text-sm text-slate-600">{d.checklist.filter((c) => c.done).length} of {d.checklist.length} complete</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {d.checklist.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="flex items-start gap-3 py-3 hover:bg-slate-50">
                    {c.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-label="Done" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" aria-label="To do" />}
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-medium ${c.done ? "text-slate-500 line-through" : "text-slate-900"}`}>{c.label}</span>
                      {!c.done && <span className="block text-xs text-slate-500">{c.hint}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="a-card p-5 sm:p-6" aria-labelledby="samples">
            <h2 id="samples" className="font-display text-lg font-semibold text-navy">Sample content</h2>
            <p className="mt-1 text-sm text-slate-600">Demonstration records are labelled “Sample” on the website. Remove them once your real content is in place.</p>
            <SampleCleanup samples={d.samples} />
          </section>
        </div>
      )}
    </div>
  );
}
