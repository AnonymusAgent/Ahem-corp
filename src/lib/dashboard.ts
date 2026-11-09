import { and, desc, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import type { SessionUser } from "./auth";
import { smtpConfigured } from "./email";
import { getSettings } from "./settings";
import { can, leadTypesForRole, LEAD_STATUSES, LEAD_TYPES, todayISO, type LeadType } from "./site";

const count = sql<number>`count(*)::int`;

/** All dashboard figures are computed live from the database — nothing here is hard-coded. */
export async function getDashboard(user: SessionUser) {
  const types = leadTypesForRole(user.role);
  const seesLeads = types.length > 0;
  const scope = inArray(t.leads.type, types);
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const admin = can(user.role, "settings");

  const [visitors] = await db
    .select({ unique: sql<number>`count(distinct ${t.pageViews.visitorHash})::int`, views: count })
    .from(t.pageViews)
    .where(gte(t.pageViews.day, since30));
  const [allViews] = await db.select({ n: count }).from(t.pageViews);

  const byStatus: Record<string, number> = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
  const byType: Record<string, number> = Object.fromEntries(LEAD_TYPES.map((s) => [s, 0]));
  let totalLeads = 0;
  let sampleLeads = 0;
  let newTenderInvitations = 0;
  const months: { key: string; label: string; n: number }[] = [];
  if (seesLeads) {
    const rows = await db
      .select({ status: t.leads.status, type: t.leads.type, sample: t.leads.isSample, n: count })
      .from(t.leads)
      .where(scope)
      .groupBy(t.leads.status, t.leads.type, t.leads.isSample);
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + r.n;
      byType[r.type] = (byType[r.type] ?? 0) + r.n;
      totalLeads += r.n;
      if (r.sample) sampleLeads += r.n;
      if (r.type === "tender_invitation" && r.status === "new") newTenderInvitations += r.n;
    }
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - 11);
    const monthly = await db
      .select({ m: sql<string>`to_char(date_trunc('month', ${t.leads.createdAt}), 'YYYY-MM')`, n: count })
      .from(t.leads)
      .where(and(scope, gte(t.leads.createdAt, start)))
      .groupBy(sql`1`);
    const map = new Map(monthly.map((r) => [r.m, r.n]));
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setUTCMonth(start.getUTCMonth() + i);
      const key = d.toISOString().slice(0, 7);
      months.push({ key, label: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }), n: map.get(key) ?? 0 });
    }
  }

  const [activeTenders] = await db
    .select({ n: count })
    .from(t.tenders)
    .where(and(eq(t.tenders.published, true), eq(t.tenders.status, "open"), or(isNull(t.tenders.deadline), gte(t.tenders.deadline, todayISO()))));
  const [openApplications] = await db.select({ n: count }).from(t.applications).where(inArray(t.applications.status, ["new", "shortlisted", "interview"]));
  const [publishedProjects] = await db.select({ n: count }).from(t.projects).where(eq(t.projects.published, true));

  const recent = can(user.role, "audit")
    ? await db.select().from(t.auditLogs).orderBy(desc(t.auditLogs.createdAt)).limit(10)
    : await db.select().from(t.auditLogs).where(eq(t.auditLogs.userId, user.id)).orderBy(desc(t.auditLogs.createdAt)).limit(10);

  const recentLeads = seesLeads
    ? await db
        .select({ id: t.leads.id, reference: t.leads.reference, type: t.leads.type, subject: t.leads.subject, organization: t.leads.organization, name: t.leads.name, status: t.leads.status, createdAt: t.leads.createdAt, isSample: t.leads.isSample })
        .from(t.leads)
        .where(scope)
        .orderBy(desc(t.leads.createdAt))
        .limit(6)
    : [];

  // Go-live checklist (administrators only), derived from real state.
  let checklist: { label: string; done: boolean; href: string; hint: string }[] = [];
  const samples: { key: string; label: string; n: number }[] = [];
  if (admin) {
    const s = await getSettings();
    const [defaults] = await db.select({ n: count }).from(t.users).where(eq(t.users.mustChangePassword, true));
    const sampleTables = [
      ["projects", "Projects", t.projects], ["tenders", "Tenders", t.tenders], ["clients", "Clients & partners", t.clients],
      ["certifications", "Certifications", t.certifications], ["jobs", "Job openings", t.jobs], ["news", "News", t.news],
      ["testimonials", "Testimonials", t.testimonials], ["leads", "Leads", t.leads],
    ] as const;
    for (const [key, label, table] of sampleTables) {
      const [r] = await db.select({ n: count }).from(table).where(eq(table.isSample, true));
      if (r?.n) samples.push({ key, label, n: r.n });
    }
    checklist = [
      { label: "Replace default / temporary passwords", done: (defaults?.n ?? 0) === 0, href: "/admin/account", hint: `${defaults?.n ?? 0} account(s) still use a temporary password.` },
      { label: "Set the public site URL (NEXT_PUBLIC_SITE_URL)", done: !!process.env.NEXT_PUBLIC_SITE_URL, href: "/admin/settings?tab=data", hint: "Used for canonical URLs, the sitemap and links in emails. Until set, the address of each request is used." },
      { label: "Enter real contact details", done: !s.contact.isSample, href: "/admin/settings?tab=contact", hint: "Phone, email, address, WhatsApp and map location." },
      { label: "Configure outgoing email (SMTP)", done: smtpConfigured(), href: "/admin/emails", hint: "Set SMTP_HOST and EMAIL_FROM on the server so confirmations and notifications are delivered." },
      { label: "Set notification recipients", done: !!s.email.notifyEmails.trim(), href: "/admin/settings?tab=email", hint: "Who should be emailed about new tender invitations and inquiries." },
      { label: "Replace sample content with real records", done: samples.length === 0, href: "/admin/projects", hint: `${samples.reduce((a, b) => a + b.n, 0)} sample record(s) remain.` },
      { label: "Upload genuine compliance documents", done: !samples.some((x) => x.key === "certifications"), href: "/admin/certifications", hint: "Registrations, licences, certificates and insurance." },
      { label: "Connect Google Analytics / Search Console", done: !!(s.seo.gaId || s.seo.gscVerification), href: "/admin/settings?tab=seo", hint: "Optional." },
    ];
  }

  const won = byStatus.won ?? 0;
  const lost = byStatus.lost ?? 0;
  return {
    visitors30: visitors?.unique ?? 0,
    views30: visitors?.views ?? 0,
    viewsAll: allViews?.n ?? 0,
    seesLeads,
    totalLeads,
    sampleLeads,
    newTenderInvitations,
    projectInquiries: (["project_requirement", "quotation", "proposal"] as LeadType[]).reduce((a, k) => a + (byType[k] ?? 0), 0),
    byStatus,
    byType,
    months,
    conversion: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null,
    won,
    lost,
    inPipeline: totalLeads - won - lost,
    activeTenders: activeTenders?.n ?? 0,
    openApplications: openApplications?.n ?? 0,
    publishedProjects: publishedProjects?.n ?? 0,
    recent,
    recentLeads,
    checklist,
    samples,
    smtp: smtpConfigured(),
  };
}
