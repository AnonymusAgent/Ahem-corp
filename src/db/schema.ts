import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  primaryKey,
  index,
  customType,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

const created = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updated = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export type FileRef = { id: string; name: string; size?: number };

/* ----------------------------- Auth & access ----------------------------- */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("content_editor"),
  active: boolean("active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: created(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ip: text("ip"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: created(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

/* -------------------------------- Content -------------------------------- */

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]),
  image: text("image"),
  icon: text("icon").notNull().default("building"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  isSample: boolean("is_sample").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: created(),
  updatedAt: updated(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  scope: jsonb("scope").$type<string[]>().notNull().default([]),
  clientName: text("client_name"),
  clientPublic: boolean("client_public").notNull().default(false),
  city: text("city"),
  province: text("province"),
  value: text("value"),
  valuePublic: boolean("value_public").notNull().default(false),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: text("status").notNull().default("ongoing"),
  coverImage: text("cover_image"),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  videoUrl: text("video_url"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: created(),
  updatedAt: updated(),
});

export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  reference: text("reference").notNull(),
  title: text("title").notNull(),
  sector: text("sector").notNull().default("government"),
  issuer: text("issuer").notNull(),
  category: text("category").notNull(),
  province: text("province"),
  city: text("city"),
  publishedOn: date("published_on"),
  deadline: date("deadline"),
  estimatedValue: text("estimated_value"),
  description: text("description").notNull().default(""),
  eligibility: jsonb("eligibility").$type<string[]>().notNull().default([]),
  requiredDocs: jsonb("required_docs").$type<string[]>().notNull().default([]),
  instructions: text("instructions").notNull().default(""),
  attachments: jsonb("attachments").$type<FileRef[]>().notNull().default([]),
  status: text("status").notNull().default("open"),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: created(),
  updatedAt: updated(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("private"),
  description: text("description").notNull().default(""),
  logo: text("logo"),
  website: text("website"),
  authorized: boolean("authorized").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: created(),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("other"),
  issuer: text("issuer"),
  number: text("number"),
  issuedOn: date("issued_on"),
  validUntil: date("valid_until"),
  description: text("description").notNull().default(""),
  file: jsonb("file").$type<FileRef | null>(),
  visibility: text("visibility").notNull().default("on_request"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: created(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  department: text("department").notNull().default(""),
  location: text("location").notNull().default(""),
  employmentType: text("employment_type").notNull().default("Full-time"),
  experience: text("experience").notNull().default(""),
  description: text("description").notNull().default(""),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  closingDate: date("closing_date"),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: created(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  jobTitle: text("job_title").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  location: text("location").notNull().default(""),
  currentRole: text("current_role").notNull().default(""),
  experienceYears: text("experience_years").notNull().default(""),
  coverLetter: text("cover_letter").notNull().default(""),
  resume: jsonb("resume").$type<FileRef | null>(),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  createdAt: created(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull().default("announcement"),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  coverImage: text("cover_image"),
  author: text("author").notNull().default("Ahem Corporation"),
  publishedOn: date("published_on"),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: created(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  role: text("role").notNull().default(""),
  organization: text("organization").notNull().default(""),
  authorized: boolean("authorized").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: created(),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  body: text("body").notNull().default(""),
  published: boolean("published").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: updated(),
});

/* ------------------------------ Leads / CRM ------------------------------ */

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    type: text("type").notNull(),
    status: text("status").notNull().default("new"),
    name: text("name").notNull(),
    organization: text("organization").notNull().default(""),
    designation: text("designation").notNull().default(""),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    sector: text("sector").notNull().default(""),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull().default(""),
    details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
    attachments: jsonb("attachments").$type<FileRef[]>().notNull().default([]),
    assignedTo: integer("assigned_to").references(() => users.id, { onDelete: "set null" }),
    source: text("source").notNull().default(""),
    isSample: boolean("is_sample").notNull().default(false),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [index("leads_type_idx").on(t.type), index("leads_status_idx").on(t.status)],
);

export const leadActivities = pgTable(
  "lead_activities",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    actor: text("actor").notNull().default("System"),
    action: text("action").notNull(),
    note: text("note").notNull().default(""),
    createdAt: created(),
  },
  (t) => [index("lead_activities_lead_idx").on(t.leadId)],
);

/* --------------------------------- Files --------------------------------- */

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  kind: text("kind").notNull().default("media"),
  alt: text("alt").notNull().default(""),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: created(),
});

export const fileBlobs = pgTable("file_blobs", {
  fileId: text("file_id")
    .primaryKey()
    .references(() => files.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
});

/* ------------------------- System / observability ------------------------ */

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  link: text("link").notNull().default(""),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: created(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    actor: text("actor").notNull().default("System"),
    action: text("action").notNull(),
    entity: text("entity").notNull().default(""),
    entityId: text("entity_id").notNull().default(""),
    summary: text("summary").notNull().default(""),
    ip: text("ip").notNull().default(""),
    createdAt: created(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull().default(""),
  status: text("status").notNull(),
  error: text("error").notNull().default(""),
  reference: text("reference").notNull().default(""),
  createdAt: created(),
});

export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    day: date("day").notNull(),
    createdAt: created(),
  },
  (t) => [index("page_views_day_idx").on(t.day)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: updated(),
});
