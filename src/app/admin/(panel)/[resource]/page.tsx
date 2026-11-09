import { notFound } from "next/navigation";
import { Check, Lock, Minus } from "lucide-react";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { requireUser } from "@/lib/auth";
import { smtpConfigured } from "@/lib/email";
import { getResourceDef } from "@/lib/resources";
import { can, LEAD_TYPE_LABELS, PERMISSIONS, ROLE_LABELS, ROLES, type LeadType, type Permission } from "@/lib/site";

type Props = { params: Promise<{ resource: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props) {
  return { title: getResourceDef((await params).resource)?.label ?? "Not found" };
}

const MODULE_LABELS: Record<Permission, string> = {
  dashboard: "Dashboard", projects: "Projects", services: "Services", tenders: "Tender management", leads: "Leads & CRM (by lead type)", clients: "Clients & partners",
  certifications: "Certifications & documents", jobs: "Job openings", applications: "Job applications", news: "News & blog", media: "Media library", testimonials: "Testimonials",
  pages: "Website pages", settings: "Settings, SEO & email", emails: "Email log", users: "Users & roles", audit: "Audit log", backup: "Data export",
};

export default async function ResourcePage({ params, searchParams }: Props) {
  const [{ resource }, sp] = await Promise.all([params, searchParams]);
  const def = getResourceDef(resource);
  if (!def || resource === "media") notFound();
  const user = await requireUser(def.permission);
  const initial: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") initial[k] = v;

  const leadType = resource === "leads" && initial.f_type && initial.f_type in LEAD_TYPE_LABELS ? (initial.f_type as LeadType) : null;
  const title = leadType ? `${LEAD_TYPE_LABELS[leadType]}s` : undefined;
  const note =
    leadType === "tender_invitation"
      ? "Confidential invitations to bid received through the website. These are never published and are visible only to the tender desk and administrators."
      : leadType === "project_requirement"
        ? "Project requirements submitted by private clients, developers and organizations."
        : leadType === "contact"
          ? "General messages sent through the contact form."
          : undefined;

  return (
    <div className="space-y-6">
      {leadType === "tender_invitation" && (
        <p className="flex items-center gap-2 rounded-xl border border-navy/15 bg-navy/5 px-4 py-3 text-sm text-navy"><Lock className="h-4 w-4 shrink-0" aria-hidden /> Confidential records — do not copy invitation details into the public Tender management module without the issuer’s authorisation.</p>
      )}
      {resource === "emails" && !smtpConfigured() && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Outgoing email is not configured, so messages are recorded here but <strong>not delivered</strong>. Set <code className="rounded bg-white px-1">SMTP_HOST</code>, <code className="rounded bg-white px-1">SMTP_USER</code>, <code className="rounded bg-white px-1">SMTP_PASS</code> and <code className="rounded bg-white px-1">EMAIL_FROM</code> on the server (see README).
        </p>
      )}
      <ResourceManager key={JSON.stringify(initial)} def={def} initial={initial} canDelete={resource !== "leads" || can(user.role, "settings")} title={title} note={note} />

      {resource === "users" && (
        <section className="a-card overflow-hidden" aria-labelledby="matrix">
          <div className="px-5 py-4">
            <h2 id="matrix" className="font-display text-lg font-semibold text-navy">Role permissions</h2>
            <p className="mt-1 text-sm text-slate-600">Permissions are enforced on the server for every page and API request. Tender Managers see only tender invitations; Project Managers see project requirements, quotations and proposals.</p>
          </div>
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Module</th>
                  {ROLES.map((r) => <th key={r} scope="col" className="px-3 py-3 text-center font-semibold">{ROLE_LABELS[r]}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(PERMISSIONS) as Permission[]).map((p) => (
                  <tr key={p}>
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-800">{MODULE_LABELS[p]}</th>
                    {ROLES.map((r) => (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {can(r, p) ? <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Allowed" /> : <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Not allowed" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
