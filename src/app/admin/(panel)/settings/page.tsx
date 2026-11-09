import Link from "next/link";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireUser } from "@/lib/auth";
import { smtpConfigured } from "@/lib/email";
import { getSettings, SETTINGS_SCHEMA } from "@/lib/settings";
import { can, SITE_URL } from "@/lib/site";

export const metadata = { title: "Website settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("settings");
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const tab = sp.tab === "data" ? "data" : (SETTINGS_SCHEMA.find((g) => g.group === sp.tab)?.group ?? "general");
  const schema = SETTINGS_SCHEMA.find((g) => g.group === tab);
  const status = (ok: boolean, yes: string, no: string) => (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${ok ? "text-emerald-700" : "text-amber-700"}`}>{ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}{ok ? yes : no}</span>
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy">Website settings</h1>
        <p className="mt-1 text-sm text-slate-600">Branding, contact details, homepage sections, About content, SEO and email notifications — all editable without code changes.</p>
      </div>
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {[...SETTINGS_SCHEMA.map((g) => [g.group, g.label] as const), ["data", "Data & system"] as const].map(([key, label]) => (
          <Link key={key} href={`/admin/settings?tab=${key}`} aria-current={tab === key ? "page" : undefined} className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium ${tab === key ? "border-gold-600 text-navy" : "border-transparent text-slate-500 hover:text-navy"}`}>
            {label}
          </Link>
        ))}
      </nav>

      {schema ? (
        <SettingsForm key={schema.group} group={schema.group} label={schema.label} description={schema.description} fields={schema.fields} values={s[schema.group] as Record<string, unknown>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">System status</h2>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-600">Public site URL</dt><dd className="truncate font-mono text-xs text-slate-800">{SITE_URL}</dd></div>
              <div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-600">Outgoing email (SMTP)</dt><dd>{status(smtpConfigured(), "Configured", "Not configured — emails are logged, not sent")}</dd></div>
              <div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-600">Notification recipients</dt><dd>{status(!!s.email.notifyEmails.trim(), "Set", "Not set")}</dd></div>
              <div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-600">Google Analytics</dt><dd>{status(!!s.seo.gaId, s.seo.gaId, "Not connected")}</dd></div>
              <div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-600">Clickjacking protection (FRAME_ANCESTORS)</dt><dd>{status(!!process.env.FRAME_ANCESTORS, "Enabled", "Not set")}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">Server-level values are set through environment variables — see <code>.env.example</code> and the README.</p>
          </section>
          <section className="a-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Data export & backups</h2>
            <p className="mt-2 text-sm text-slate-600">Download all website content, leads, applications and logs as JSON. Password hashes, sessions and file contents are excluded. For complete, restorable backups (including uploaded files) schedule <code className="rounded bg-slate-100 px-1">pg_dump</code> as described in the README.</p>
            {can(user.role, "backup") ? (
              <a href="/api/admin/backup" className="a-btn-primary mt-5"><Download className="h-4 w-4" aria-hidden /> Download data export (JSON)</a>
            ) : (
              <p className="mt-5 text-sm text-slate-500">Only Super Admins can download the data export.</p>
            )}
            <h3 className="mt-8 font-display text-base font-semibold text-navy">Brand assets</h3>
            <p className="mt-1 text-sm text-slate-600">Logo variations (horizontal, vertical, icon, monochrome), colours and typography.</p>
            <Link href="/brand" target="_blank" className="a-btn-light mt-3">Open brand page</Link>
          </section>
        </div>
      )}
    </div>
  );
}
