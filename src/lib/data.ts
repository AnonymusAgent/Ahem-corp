// Public read models. Everything returned from here is safe to render on the public website:
// unpublished records are excluded and unauthorised client names / contract values are removed.
//
// Every getter degrades gracefully (empty list / null) when the database is
// unavailable, so marketing pages render their empty states instead of a 500.
// Admin code paths use their own strict queries and still require the database.
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ensureDb } from "./bootstrap";

export type Service = typeof t.services.$inferSelect;
export type Tender = typeof t.tenders.$inferSelect;
export type Job = typeof t.jobs.$inferSelect;
export type NewsItem = typeof t.news.$inferSelect;
export type PublicProject = Omit<typeof t.projects.$inferSelect, "clientPublic" | "valuePublic">;

function publicProject(p: typeof t.projects.$inferSelect): PublicProject {
  const { clientPublic, valuePublic, ...rest } = p;
  return { ...rest, clientName: clientPublic ? p.clientName : null, value: valuePublic ? p.value : null };
}

async function safe<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    await ensureDb();
    return await fn();
  } catch (e) {
    console.error(`[data] ${label} unavailable, returning empty result`, e);
    return fallback;
  }
}

export function getServices(): Promise<Service[]> {
  return safe("services", [], () =>
    db.select().from(t.services).where(eq(t.services.published, true)).orderBy(asc(t.services.sortOrder), asc(t.services.title)),
  );
}

export function getService(slug: string): Promise<Service | null> {
  return safe("service", null, async () => {
    const [row] = await db.select().from(t.services).where(and(eq(t.services.slug, slug), eq(t.services.published, true))).limit(1);
    return row ?? null;
  });
}

export function getProjects(): Promise<PublicProject[]> {
  return safe("projects", [], async () => {
    const rows = await db
      .select()
      .from(t.projects)
      .where(eq(t.projects.published, true))
      .orderBy(desc(t.projects.featured), sql`${t.projects.endDate} desc nulls last`, desc(t.projects.id));
    return rows.map(publicProject);
  });
}

export function getProject(slug: string): Promise<PublicProject | null> {
  return safe("project", null, async () => {
    const [row] = await db.select().from(t.projects).where(and(eq(t.projects.slug, slug), eq(t.projects.published, true))).limit(1);
    return row ? publicProject(row) : null;
  });
}

export function getTenders(): Promise<Tender[]> {
  return safe("tenders", [], () =>
    db.select().from(t.tenders).where(eq(t.tenders.published, true)).orderBy(sql`${t.tenders.deadline} desc nulls last`),
  );
}

export function getTender(slug: string): Promise<Tender | null> {
  return safe("tender", null, async () => {
    const [row] = await db.select().from(t.tenders).where(and(eq(t.tenders.slug, slug), eq(t.tenders.published, true))).limit(1);
    return row ?? null;
  });
}

export function getClients() {
  return safe("clients", [], () =>
    db
      .select()
      .from(t.clients)
      .where(and(eq(t.clients.published, true), eq(t.clients.authorized, true)))
      .orderBy(asc(t.clients.sortOrder), asc(t.clients.name)),
  );
}

export function getTestimonials() {
  return safe("testimonials", [], () =>
    db
      .select()
      .from(t.testimonials)
      .where(and(eq(t.testimonials.published, true), eq(t.testimonials.authorized, true)))
      .orderBy(asc(t.testimonials.sortOrder)),
  );
}

/** Certifications for the public page. Internal documents are excluded; files are exposed only for public documents. */
export function getCertifications() {
  return safe("certifications", [], async () => {
    const rows = await db
      .select()
      .from(t.certifications)
      .where(and(eq(t.certifications.published, true), ne(t.certifications.visibility, "internal")))
      .orderBy(asc(t.certifications.sortOrder), asc(t.certifications.title));
    return rows.map((c) => ({ ...c, file: c.visibility === "public" ? c.file : null, hasFile: !!c.file }));
  });
}

export function getJobs(): Promise<Job[]> {
  return safe("jobs", [], () =>
    db.select().from(t.jobs).where(eq(t.jobs.published, true)).orderBy(desc(t.jobs.createdAt), asc(t.jobs.id)),
  );
}

export function getJob(slug: string): Promise<Job | null> {
  return safe("job", null, async () => {
    const [row] = await db.select().from(t.jobs).where(and(eq(t.jobs.slug, slug), eq(t.jobs.published, true))).limit(1);
    return row ?? null;
  });
}

export function getNews(): Promise<NewsItem[]> {
  return safe("news", [], () =>
    db.select().from(t.news).where(eq(t.news.published, true)).orderBy(sql`${t.news.publishedOn} desc nulls last`, desc(t.news.id)),
  );
}

export function getNewsItem(slug: string): Promise<NewsItem | null> {
  return safe("news item", null, async () => {
    const [row] = await db.select().from(t.news).where(and(eq(t.news.slug, slug), eq(t.news.published, true))).limit(1);
    return row ?? null;
  });
}

export function getPage(slug: string) {
  return safe("page", null, async () => {
    const [row] = await db.select().from(t.pages).where(and(eq(t.pages.slug, slug), eq(t.pages.published, true))).limit(1);
    return row ?? null;
  });
}

export function getPages() {
  return safe("pages", [], () =>
    db.select({ slug: t.pages.slug, title: t.pages.title, updatedAt: t.pages.updatedAt }).from(t.pages).where(eq(t.pages.published, true)).orderBy(asc(t.pages.title)),
  );
}
