// Public read models. Everything returned from here is safe to render on the public website:
// unpublished records are excluded and unauthorised client names / contract values are removed.
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

export async function getServices(): Promise<Service[]> {
  await ensureDb();
  return db.select().from(t.services).where(eq(t.services.published, true)).orderBy(asc(t.services.sortOrder), asc(t.services.title));
}

export async function getService(slug: string): Promise<Service | null> {
  await ensureDb();
  const [row] = await db.select().from(t.services).where(and(eq(t.services.slug, slug), eq(t.services.published, true))).limit(1);
  return row ?? null;
}

export async function getProjects(): Promise<PublicProject[]> {
  await ensureDb();
  const rows = await db
    .select()
    .from(t.projects)
    .where(eq(t.projects.published, true))
    .orderBy(desc(t.projects.featured), sql`${t.projects.endDate} desc nulls last`, desc(t.projects.id));
  return rows.map(publicProject);
}

export async function getProject(slug: string): Promise<PublicProject | null> {
  await ensureDb();
  const [row] = await db.select().from(t.projects).where(and(eq(t.projects.slug, slug), eq(t.projects.published, true))).limit(1);
  return row ? publicProject(row) : null;
}

export async function getTenders(): Promise<Tender[]> {
  await ensureDb();
  return db.select().from(t.tenders).where(eq(t.tenders.published, true)).orderBy(sql`${t.tenders.deadline} desc nulls last`);
}

export async function getTender(slug: string): Promise<Tender | null> {
  await ensureDb();
  const [row] = await db.select().from(t.tenders).where(and(eq(t.tenders.slug, slug), eq(t.tenders.published, true))).limit(1);
  return row ?? null;
}

export async function getClients() {
  await ensureDb();
  return db
    .select()
    .from(t.clients)
    .where(and(eq(t.clients.published, true), eq(t.clients.authorized, true)))
    .orderBy(asc(t.clients.sortOrder), asc(t.clients.name));
}

export async function getTestimonials() {
  await ensureDb();
  return db
    .select()
    .from(t.testimonials)
    .where(and(eq(t.testimonials.published, true), eq(t.testimonials.authorized, true)))
    .orderBy(asc(t.testimonials.sortOrder));
}

/** Certifications for the public page. Internal documents are excluded; files are exposed only for public documents. */
export async function getCertifications() {
  await ensureDb();
  const rows = await db
    .select()
    .from(t.certifications)
    .where(and(eq(t.certifications.published, true), ne(t.certifications.visibility, "internal")))
    .orderBy(asc(t.certifications.sortOrder), asc(t.certifications.title));
  return rows.map((c) => ({ ...c, file: c.visibility === "public" ? c.file : null, hasFile: !!c.file }));
}

export async function getJobs(): Promise<Job[]> {
  await ensureDb();
  return db.select().from(t.jobs).where(eq(t.jobs.published, true)).orderBy(desc(t.jobs.createdAt), asc(t.jobs.id));
}

export async function getJob(slug: string): Promise<Job | null> {
  await ensureDb();
  const [row] = await db.select().from(t.jobs).where(and(eq(t.jobs.slug, slug), eq(t.jobs.published, true))).limit(1);
  return row ?? null;
}

export async function getNews(): Promise<NewsItem[]> {
  await ensureDb();
  return db.select().from(t.news).where(eq(t.news.published, true)).orderBy(sql`${t.news.publishedOn} desc nulls last`, desc(t.news.id));
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  await ensureDb();
  const [row] = await db.select().from(t.news).where(and(eq(t.news.slug, slug), eq(t.news.published, true))).limit(1);
  return row ?? null;
}

export async function getPage(slug: string) {
  await ensureDb();
  const [row] = await db.select().from(t.pages).where(and(eq(t.pages.slug, slug), eq(t.pages.published, true))).limit(1);
  return row ?? null;
}

export async function getPages() {
  await ensureDb();
  return db.select({ slug: t.pages.slug, title: t.pages.title, updatedAt: t.pages.updatedAt }).from(t.pages).where(eq(t.pages.published, true)).orderBy(asc(t.pages.title));
}
