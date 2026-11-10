import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { hashPassword } from "./auth";
import { LEAD_STATUS_LABELS, slugify, type LeadStatus } from "./site";
import * as d from "./seed-data";

/** Fallback email for the first admin when ADMIN_EMAIL is not set. The password is never hard-coded. */
export const DEFAULT_ADMIN_EMAIL = "admin@ahemcorporation.com";

/** Generates a random temporary password for first-run when ADMIN_PASSWORD is not set. */
function generateTemporaryPassword(): string {
  return randomBytes(18).toString("base64url");
}

/**
 * Inserts the first Super Admin and the demonstration content, once.
 * Guarded by a transaction-level advisory lock so concurrent server instances cannot double-seed.
 */
export async function seedIfEmpty() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(72747301)`);
    const existing = await tx.select({ id: t.users.id }).from(t.users).limit(1);
    if (existing.length) return;

    const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
    const customPassword = process.env.ADMIN_PASSWORD?.trim() || undefined;
    // No password is hard-coded or published. Without ADMIN_PASSWORD a random
    // temporary password is generated, printed once to the server logs, and
    // the dashboard forces a change on first sign-in.
    const temporaryPassword = customPassword ? undefined : generateTemporaryPassword();
    await tx.insert(t.users).values({
      name: process.env.ADMIN_NAME || "Site Administrator",
      email,
      passwordHash: await hashPassword(customPassword || temporaryPassword!),
      role: "super_admin",
      mustChangePassword: !customPassword,
    });
    if (temporaryPassword) {
      console.log(
        `[seed] Initial admin created for ${email}. Temporary password (change immediately after sign-in): ${temporaryPassword}`,
      );
    }

    await tx.insert(t.services).values(
      d.SERVICES.map(([title, icon, image, summary, description, capabilities], i) => ({
        slug: slugify(title),
        title,
        icon,
        image: d.px(image),
        summary,
        description,
        capabilities,
        sortOrder: i + 1,
        published: true,
        isSample: false,
      })),
    );

    await tx.insert(t.projects).values(
      d.PROJECTS.map((p) => ({
        slug: slugify(p.title),
        title: p.title,
        category: p.category,
        summary: p.summary,
        description: p.description,
        scope: p.scope,
        clientName: p.clientName,
        clientPublic: p.clientPublic,
        city: p.city,
        province: p.province,
        value: p.value,
        valuePublic: p.valuePublic,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        coverImage: d.px(p.cover),
        gallery: p.gallery.map(d.px),
        videoUrl: "videoUrl" in p ? (p.videoUrl as string) : null,
        featured: p.featured,
        published: true,
        isSample: true,
      })),
    );

    await tx.insert(t.tenders).values(
      d.TENDERS.map((x) => ({ ...x, slug: slugify(`${x.title} ${x.reference}`), published: true, isSample: true })),
    );

    await tx.insert(t.clients).values(
      d.CLIENTS.map(([name, type, description], i) => ({
        name: name!,
        type: type!,
        description: description!,
        authorized: true,
        published: true,
        isSample: true,
        sortOrder: i + 1,
      })),
    );

    await tx.insert(t.certifications).values(
      d.CERTIFICATIONS.map(([title, category], i) => ({
        title: title!,
        category: category!,
        description: "Placeholder entry — upload the official document and add the issuer, number and validity in Admin → Certifications.",
        visibility: "on_request",
        published: true,
        isSample: true,
        sortOrder: i + 1,
      })),
    );

    await tx.insert(t.jobs).values(
      d.JOBS.map((j) => ({ ...j, slug: slugify(j.title), employmentType: "Full-time", closingDate: d.day(30), published: true, isSample: true })),
    );

    await tx.insert(t.news).values(
      d.NEWS.map((n) => ({
        slug: slugify(n.title),
        title: n.title,
        category: n.category,
        excerpt: n.excerpt,
        body: n.body,
        coverImage: d.px(n.cover),
        publishedOn: d.day(n.offset),
        published: true,
        isSample: true,
      })),
    );

    await tx.insert(t.testimonials).values(
      d.TESTIMONIALS.map(([quote, author, role, organization], i) => ({
        quote: quote!,
        author: author!,
        role: role!,
        organization: organization!,
        authorized: true,
        published: true,
        isSample: true,
        sortOrder: i + 1,
      })),
    );

    await tx.insert(t.pages).values(d.PAGES);

    for (const l of d.SAMPLE_LEADS) {
      const createdAt = new Date(Date.now() + l.offset * 86_400_000);
      const { trail, offset: _offset, ...lead } = l;
      void _offset;
      const [row] = await tx
        .insert(t.leads)
        .values({ ...lead, details: lead.details as Record<string, string>, isSample: true, source: "sample-data", createdAt, updatedAt: createdAt })
        .returning({ id: t.leads.id });
      const acts = [{ leadId: row!.id, actor: "Website", action: "Submission received", note: "Sample record created by the seed script.", createdAt }];
      trail.forEach((s, i) =>
        acts.push({
          leadId: row!.id,
          actor: "Site Administrator",
          action: `Status changed to ${LEAD_STATUS_LABELS[s as LeadStatus]}`,
          note: "",
          createdAt: new Date(createdAt.getTime() + (i + 1) * 36 * 3_600_000),
        }),
      );
      await tx.insert(t.leadActivities).values(acts);
    }

    await tx.insert(t.auditLogs).values({
      actor: "System",
      action: "seed",
      entity: "database",
      summary: "Initial administrator and sample content created.",
    });
    console.log(`[seed] database seeded. Admin login: ${email}`);
  });
}
