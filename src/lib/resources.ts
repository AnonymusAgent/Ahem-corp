import type { PgTable } from "drizzle-orm/pg-core";
import * as t from "@/db/schema";
import {
  APPLICATION_STATUSES,
  CERT_CATEGORIES,
  CERT_VISIBILITY,
  CLIENT_TYPES,
  LEAD_STATUS_LABELS,
  LEAD_TYPE_LABELS,
  NEWS_CATEGORIES,
  PROJECT_STATUSES,
  ROLE_LABELS,
  SERVICE_NAMES,
  TENDER_SECTORS,
  type Permission,
} from "./site";

export type Option = [value: string, label: string];
export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "boolean" | "select" | "date"
  | "list" | "image" | "images" | "file" | "files" | "email" | "url" | "password";

export type AdminField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];
  help?: string;
  max?: number;
  half?: boolean;
  fileKind?: string;
  /** Shown for context in the edit dialog but never written. */
  readOnly?: boolean;
  /** Editable when creating only. */
  lockOnEdit?: boolean;
};

export type AdminColumn = {
  name: string;
  label: string;
  kind?: "text" | "date" | "datetime" | "bool" | "badge" | "file" | "size";
  map?: Record<string, string>;
};

/** Fully serialisable description of an admin module. Passed to the client as props. */
export type ResourceDef = {
  key: string;
  permission: Permission;
  label: string;
  singular: string;
  description: string;
  fields: AdminField[];
  columns: AdminColumn[];
  search: string[];
  filters: { name: string; label: string; options: Option[] }[];
  sort: [column: string, dir: "asc" | "desc"];
  titleField: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  publishable: boolean;
  slugFrom?: string;
  publicPath?: string;
  rowLink?: string;
  hidden?: string[];
};

const opts = (o: Record<string, string>): Option[] => Object.entries(o);
const names = (a: readonly string[]): Option[] => a.map((v) => [v, v]);
const YESNO: Option[] = [["true", "Yes"], ["false", "No"]];
const published: AdminField = { name: "published", label: "Published on the website", type: "boolean" };
const sample: AdminField = { name: "isSample", label: "Sample / demonstration record (shows a “Sample” label)", type: "boolean" };
const slug: AdminField = { name: "slug", label: "URL slug", type: "text", max: 80, half: true, help: "Leave empty to generate from the title." };
const seo: AdminField[] = [
  { name: "seoTitle", label: "SEO title", type: "text", max: 120, help: "Optional. Defaults to the title." },
  { name: "seoDescription", label: "SEO meta description", type: "textarea", max: 300, help: "Optional. Defaults to the summary." },
];
const pubFilter = { name: "published", label: "Published", options: YESNO };
const ICONS = names(["hardhat", "compass", "building", "landmark", "road", "bridge", "office", "factory", "home", "hammer", "bolt", "air", "clipboard", "wrench"]);

const base = { canCreate: true, canEdit: true, canDelete: true, publishable: true, filters: [] as ResourceDef["filters"] };

export const RESOURCES: ResourceDef[] = [
  {
    ...base,
    key: "projects", permission: "projects", label: "Projects", singular: "project", titleField: "title", slugFrom: "title", publicPath: "/projects/{slug}",
    description: "Portfolio projects shown in the Projects gallery. Client names and contract values appear publicly only when their authorisation box is ticked.",
    fields: [
      { name: "title", label: "Project title", type: "text", required: true, max: 160 },
      slug,
      { name: "category", label: "Category", type: "select", options: names(SERVICE_NAMES), required: true, half: true },
      { name: "status", label: "Status", type: "select", options: opts(PROJECT_STATUSES), required: true, half: true },
      { name: "summary", label: "Summary", type: "textarea", max: 400 },
      { name: "description", label: "Description", type: "markdown", max: 8000 },
      { name: "scope", label: "Scope of work", type: "list", help: "One item per line." },
      { name: "clientName", label: "Client / department", type: "text", max: 160, half: true },
      { name: "clientPublic", label: "Client has authorised publication of their name", type: "boolean", half: true },
      { name: "value", label: "Project value", type: "text", max: 80, half: true },
      { name: "valuePublic", label: "Disclosure of project value is authorised", type: "boolean", half: true },
      { name: "city", label: "City / location", type: "text", max: 120, half: true },
      { name: "province", label: "Province / region", type: "text", max: 120, half: true },
      { name: "startDate", label: "Start date", type: "date", half: true },
      { name: "endDate", label: "Completion date", type: "date", half: true },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "gallery", label: "Gallery images", type: "images", help: "One image URL per line. Use the Media library to upload." },
      { name: "videoUrl", label: "Project video URL", type: "url", help: "YouTube, Vimeo or a direct .mp4 link." },
      { name: "featured", label: "Feature on the homepage", type: "boolean", half: true },
      published, sample, ...seo,
    ],
    columns: [
      { name: "title", label: "Project" },
      { name: "category", label: "Category" },
      { name: "status", label: "Status", kind: "badge", map: PROJECT_STATUSES },
      { name: "province", label: "Province" },
      { name: "published", label: "Published", kind: "bool" },
    ],
    search: ["title", "category", "city", "province", "clientName"],
    filters: [{ name: "status", label: "Status", options: opts(PROJECT_STATUSES) }, { name: "category", label: "Category", options: names(SERVICE_NAMES) }, pubFilter],
    sort: ["createdAt", "desc"],
  },
  {
    ...base,
    key: "services", permission: "services", label: "Services", singular: "service", titleField: "title", slugFrom: "title", publicPath: "/services/{slug}",
    description: "Service detail pages. Each published service gets its own page with capabilities, related projects and an inquiry form.",
    fields: [
      { name: "title", label: "Service name", type: "text", required: true, max: 120 },
      slug,
      { name: "icon", label: "Icon", type: "select", options: ICONS, half: true },
      { name: "summary", label: "Summary", type: "textarea", max: 300 },
      { name: "description", label: "Description", type: "markdown", max: 8000 },
      { name: "capabilities", label: "Capabilities", type: "list", help: "One item per line." },
      { name: "image", label: "Image", type: "image" },
      { name: "sortOrder", label: "Display order", type: "number", half: true },
      published, sample, ...seo,
    ],
    columns: [{ name: "sortOrder", label: "#" }, { name: "title", label: "Service" }, { name: "summary", label: "Summary" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["title", "summary"],
    filters: [pubFilter],
    sort: ["sortOrder", "asc"],
  },
  {
    ...base,
    key: "tenders", permission: "tenders", label: "Tenders", singular: "tender", titleField: "title", slugFrom: "title", publicPath: "/tenders/{slug}",
    description: "Public tender announcements and procurement opportunities. Publish only information that is authorised for public release — confidential invitations belong in Tender invitations, never here.",
    fields: [
      { name: "title", label: "Tender title", type: "text", required: true, max: 200 },
      { name: "reference", label: "Reference number", type: "text", required: true, max: 80, half: true },
      slug,
      { name: "sector", label: "Sector", type: "select", options: opts(TENDER_SECTORS), required: true, half: true },
      { name: "issuer", label: "Issuing department / organization", type: "text", required: true, max: 160, half: true },
      { name: "category", label: "Construction category", type: "select", options: names(SERVICE_NAMES), required: true, half: true },
      { name: "status", label: "Status", type: "select", options: [["open", "Open (auto: Closing Soon / Closed by deadline)"], ["closed", "Closed"], ["awarded", "Awarded"]], required: true, half: true },
      { name: "province", label: "Province", type: "text", max: 120, half: true },
      { name: "city", label: "City", type: "text", max: 120, half: true },
      { name: "publishedOn", label: "Publication date", type: "date", half: true },
      { name: "deadline", label: "Submission deadline", type: "date", half: true },
      { name: "estimatedValue", label: "Estimated value (optional)", type: "text", max: 80, half: true },
      { name: "description", label: "Description", type: "markdown", max: 8000 },
      { name: "eligibility", label: "Eligibility requirements", type: "list", help: "One item per line." },
      { name: "requiredDocs", label: "Required documentation", type: "list", help: "One item per line." },
      { name: "instructions", label: "Application / inquiry instructions", type: "textarea", max: 2000 },
      { name: "attachments", label: "Tender documents (public)", type: "files", fileKind: "tender", help: "Only upload documents authorised for public release. PDF, Word, Excel, images or ZIP, up to 15 MB each." },
      published, sample,
    ],
    columns: [
      { name: "reference", label: "Reference" },
      { name: "title", label: "Tender" },
      { name: "sector", label: "Sector", kind: "badge", map: TENDER_SECTORS },
      { name: "deadline", label: "Deadline", kind: "date" },
      { name: "status", label: "Status", kind: "badge", map: { open: "Open", closed: "Closed", awarded: "Awarded" } },
      { name: "published", label: "Published", kind: "bool" },
    ],
    search: ["title", "reference", "issuer", "province", "city"],
    filters: [{ name: "sector", label: "Sector", options: opts(TENDER_SECTORS) }, { name: "status", label: "Status", options: [["open", "Open"], ["closed", "Closed"], ["awarded", "Awarded"]] }, pubFilter],
    sort: ["deadline", "desc"],
  },
  {
    ...base,
    key: "leads", permission: "leads", label: "Leads & CRM", singular: "lead", titleField: "reference", canCreate: false, canEdit: false, publishable: false, rowLink: "/admin/leads/{id}",
    description: "Every submission from the public website: tender invitations, project requirements, quotations, proposals, meetings and messages. Open a record to update its status, assign it and add notes.",
    fields: [],
    columns: [
      { name: "reference", label: "Reference" },
      { name: "type", label: "Type", kind: "badge", map: LEAD_TYPE_LABELS },
      { name: "subject", label: "Subject" },
      { name: "organization", label: "Organization" },
      { name: "name", label: "Contact" },
      { name: "status", label: "Status", kind: "badge", map: LEAD_STATUS_LABELS },
      { name: "createdAt", label: "Received", kind: "datetime" },
    ],
    search: ["reference", "name", "organization", "email", "subject", "message"],
    filters: [{ name: "type", label: "Type", options: opts(LEAD_TYPE_LABELS) }, { name: "status", label: "Status", options: opts(LEAD_STATUS_LABELS) }, { name: "isSample", label: "Sample", options: YESNO }],
    sort: ["createdAt", "desc"],
  },
  {
    ...base,
    key: "clients", permission: "clients", label: "Clients & Partners", singular: "client or partner", titleField: "name",
    description: "Government departments, private clients, partners, consultants and suppliers. A record is displayed publicly only when it is both published and marked as authorised.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 160 },
      { name: "type", label: "Type", type: "select", options: opts(CLIENT_TYPES), required: true, half: true },
      { name: "sortOrder", label: "Display order", type: "number", half: true },
      { name: "description", label: "Short description", type: "textarea", max: 300 },
      { name: "logo", label: "Logo (only with the organization's permission)", type: "image" },
      { name: "website", label: "Website", type: "url" },
      { name: "authorized", label: "Display has been authorised by this client / partner", type: "boolean" },
      published, sample,
    ],
    columns: [{ name: "name", label: "Name" }, { name: "type", label: "Type", kind: "badge", map: CLIENT_TYPES }, { name: "authorized", label: "Authorised", kind: "bool" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["name", "description"],
    filters: [{ name: "type", label: "Type", options: opts(CLIENT_TYPES) }, pubFilter],
    sort: ["sortOrder", "asc"],
  },
  {
    ...base,
    key: "certifications", permission: "certifications", label: "Certifications & Documents", singular: "document", titleField: "title",
    description: "Registrations, licences, certificates and insurance. Record only genuine documents. Visibility controls whether the file can be downloaded publicly, requested, or kept internal.",
    fields: [
      { name: "title", label: "Document title", type: "text", required: true, max: 160 },
      { name: "category", label: "Category", type: "select", options: opts(CERT_CATEGORIES), required: true, half: true },
      { name: "visibility", label: "Access", type: "select", options: opts(CERT_VISIBILITY), required: true, half: true },
      { name: "issuer", label: "Issuing authority", type: "text", max: 160, half: true },
      { name: "number", label: "Registration / certificate number", type: "text", max: 80, half: true },
      { name: "issuedOn", label: "Issued on", type: "date", half: true },
      { name: "validUntil", label: "Valid until", type: "date", half: true },
      { name: "description", label: "Notes", type: "textarea", max: 600 },
      { name: "file", label: "Document file", type: "file", fileKind: "certification", help: "PDF or image, up to 15 MB. Downloadable by the public only when Access is “Public download” and the record is published." },
      { name: "sortOrder", label: "Display order", type: "number", half: true },
      published, sample,
    ],
    columns: [{ name: "title", label: "Document" }, { name: "category", label: "Category", kind: "badge", map: CERT_CATEGORIES }, { name: "visibility", label: "Access", kind: "badge", map: CERT_VISIBILITY }, { name: "file", label: "File", kind: "file" }, { name: "validUntil", label: "Valid until", kind: "date" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["title", "issuer", "number"],
    filters: [{ name: "category", label: "Category", options: opts(CERT_CATEGORIES) }, { name: "visibility", label: "Access", options: opts(CERT_VISIBILITY) }, pubFilter],
    sort: ["sortOrder", "asc"],
  },
  {
    ...base,
    key: "jobs", permission: "jobs", label: "Job Openings", singular: "job opening", titleField: "title", slugFrom: "title", publicPath: "/careers/{slug}",
    description: "Vacancies listed on the Careers page. Openings stop accepting applications after their closing date.",
    fields: [
      { name: "title", label: "Position title", type: "text", required: true, max: 160 },
      slug,
      { name: "department", label: "Department", type: "text", max: 120, half: true },
      { name: "location", label: "Location", type: "text", max: 120, half: true },
      { name: "employmentType", label: "Employment type", type: "select", options: names(["Full-time", "Part-time", "Contract", "Internship"]), half: true },
      { name: "experience", label: "Experience required", type: "text", max: 80, half: true },
      { name: "closingDate", label: "Closing date", type: "date", half: true },
      { name: "description", label: "Job description", type: "textarea", max: 4000 },
      { name: "responsibilities", label: "Responsibilities", type: "list", help: "One item per line." },
      { name: "requirements", label: "Requirements", type: "list", help: "One item per line." },
      published, sample,
    ],
    columns: [{ name: "title", label: "Position" }, { name: "department", label: "Department" }, { name: "location", label: "Location" }, { name: "closingDate", label: "Closes", kind: "date" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["title", "department", "location"],
    filters: [pubFilter],
    sort: ["createdAt", "desc"],
  },
  {
    ...base,
    key: "applications", permission: "applications", label: "Job Applications", singular: "application", titleField: "reference", canCreate: false, publishable: false,
    description: "Applications submitted through the Careers page. CVs can be downloaded only by HR and administrators.",
    fields: [
      { name: "reference", label: "Reference", type: "text", readOnly: true, half: true },
      { name: "jobTitle", label: "Position", type: "text", readOnly: true, half: true },
      { name: "name", label: "Applicant", type: "text", readOnly: true, half: true },
      { name: "email", label: "Email", type: "text", readOnly: true, half: true },
      { name: "phone", label: "Phone", type: "text", readOnly: true, half: true },
      { name: "location", label: "Location", type: "text", readOnly: true, half: true },
      { name: "currentRole", label: "Current position", type: "text", readOnly: true, half: true },
      { name: "experienceYears", label: "Experience (years)", type: "text", readOnly: true, half: true },
      { name: "coverLetter", label: "Cover note", type: "textarea", readOnly: true },
      { name: "resume", label: "CV / résumé", type: "file", readOnly: true },
      { name: "status", label: "Status", type: "select", options: opts(APPLICATION_STATUSES), required: true, half: true },
      { name: "notes", label: "Internal notes", type: "textarea", max: 4000 },
    ],
    columns: [{ name: "reference", label: "Reference" }, { name: "name", label: "Applicant" }, { name: "jobTitle", label: "Position" }, { name: "resume", label: "CV", kind: "file" }, { name: "status", label: "Status", kind: "badge", map: APPLICATION_STATUSES }, { name: "createdAt", label: "Received", kind: "datetime" }],
    search: ["reference", "name", "email", "jobTitle"],
    filters: [{ name: "status", label: "Status", options: opts(APPLICATION_STATUSES) }],
    sort: ["createdAt", "desc"],
  },
  {
    ...base,
    key: "news", permission: "news", label: "News & Blog", singular: "article", titleField: "title", slugFrom: "title", publicPath: "/news/{slug}",
    description: "Company announcements, project updates, tender updates, events and insights.",
    fields: [
      { name: "title", label: "Headline", type: "text", required: true, max: 200 },
      slug,
      { name: "category", label: "Category", type: "select", options: opts(NEWS_CATEGORIES), required: true, half: true },
      { name: "publishedOn", label: "Publication date", type: "date", half: true },
      { name: "author", label: "Author", type: "text", max: 120, half: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", max: 400 },
      { name: "body", label: "Article body", type: "markdown", max: 20000 },
      { name: "coverImage", label: "Cover image", type: "image" },
      published, sample, ...seo,
    ],
    columns: [{ name: "title", label: "Headline" }, { name: "category", label: "Category", kind: "badge", map: NEWS_CATEGORIES }, { name: "publishedOn", label: "Date", kind: "date" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["title", "excerpt"],
    filters: [{ name: "category", label: "Category", options: opts(NEWS_CATEGORIES) }, pubFilter],
    sort: ["publishedOn", "desc"],
  },
  {
    ...base,
    key: "testimonials", permission: "testimonials", label: "Testimonials", singular: "testimonial", titleField: "author",
    description: "Client statements. Publish only genuine testimonials that the client has approved — a testimonial is shown only when it is published and marked as authorised.",
    fields: [
      { name: "quote", label: "Statement", type: "textarea", required: true, max: 800 },
      { name: "author", label: "Name", type: "text", required: true, max: 120, half: true },
      { name: "role", label: "Position", type: "text", max: 120, half: true },
      { name: "organization", label: "Organization", type: "text", max: 160, half: true },
      { name: "sortOrder", label: "Display order", type: "number", half: true },
      { name: "authorized", label: "The client has approved this statement for publication", type: "boolean" },
      published, sample,
    ],
    columns: [{ name: "author", label: "Name" }, { name: "organization", label: "Organization" }, { name: "quote", label: "Statement" }, { name: "authorized", label: "Authorised", kind: "bool" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["author", "organization", "quote"],
    filters: [pubFilter],
    sort: ["sortOrder", "asc"],
  },
  {
    ...base,
    key: "pages", permission: "pages", label: "Website Pages", singular: "page", titleField: "title", slugFrom: "title", publicPath: "/legal/{slug}",
    description: "Policy and information pages (privacy, cookies, data handling, terms). Homepage and About content are edited under Website settings.",
    fields: [
      { name: "title", label: "Page title", type: "text", required: true, max: 160 },
      { ...slug, lockOnEdit: true, help: "Set when the page is created. Changing it later would break links." },
      { name: "summary", label: "Summary", type: "textarea", max: 300 },
      { name: "body", label: "Content", type: "markdown", max: 40000 },
      published, ...seo,
    ],
    columns: [{ name: "title", label: "Page" }, { name: "slug", label: "Slug" }, { name: "updatedAt", label: "Updated", kind: "datetime" }, { name: "published", label: "Published", kind: "bool" }],
    search: ["title", "slug"],
    sort: ["title", "asc"],
  },
  {
    ...base,
    key: "users", permission: "users", label: "Users & Roles", singular: "user", titleField: "email", publishable: false, hidden: ["passwordHash"],
    description: "Administrator accounts and their roles. Passwords are stored as salted scrypt hashes and can never be viewed.",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, max: 120, half: true },
      { name: "email", label: "Email (login)", type: "email", required: true, max: 160, half: true },
      { name: "role", label: "Role", type: "select", options: opts(ROLE_LABELS), required: true, half: true },
      { name: "active", label: "Account active", type: "boolean", half: true },
      { name: "password", label: "Password", type: "password", help: "At least 10 characters with letters and numbers. Leave empty to keep the current password." },
    ],
    columns: [{ name: "name", label: "Name" }, { name: "email", label: "Email" }, { name: "role", label: "Role", kind: "badge", map: ROLE_LABELS }, { name: "active", label: "Active", kind: "bool" }, { name: "lastLoginAt", label: "Last sign-in", kind: "datetime" }],
    search: ["name", "email"],
    filters: [{ name: "role", label: "Role", options: opts(ROLE_LABELS) }],
    sort: ["createdAt", "asc"],
  },
  {
    ...base,
    key: "audit", permission: "audit", label: "Audit Log", singular: "entry", titleField: "action", canCreate: false, canEdit: false, canDelete: false, publishable: false,
    description: "A permanent record of sign-ins and administrative changes.",
    fields: [],
    columns: [{ name: "createdAt", label: "When", kind: "datetime" }, { name: "actor", label: "User" }, { name: "action", label: "Action", kind: "badge" }, { name: "entity", label: "Module" }, { name: "summary", label: "Details" }, { name: "ip", label: "IP" }],
    search: ["actor", "action", "entity", "summary"],
    sort: ["createdAt", "desc"],
  },
  {
    ...base,
    key: "emails", permission: "emails", label: "Email Log", singular: "email", titleField: "subject", canCreate: false, canEdit: false, canDelete: false, publishable: false,
    description: "Every confirmation and notification email the website attempted to send, with its delivery outcome. “Not configured” means SMTP has not been set up, so the message was recorded but not sent.",
    fields: [],
    columns: [{ name: "createdAt", label: "When", kind: "datetime" }, { name: "recipient", label: "To" }, { name: "subject", label: "Subject" }, { name: "status", label: "Outcome", kind: "badge", map: { sent: "Sent", not_configured: "Not configured", failed: "Failed" } }, { name: "reference", label: "Reference" }, { name: "error", label: "Error" }],
    search: ["recipient", "subject", "reference"],
    filters: [{ name: "status", label: "Outcome", options: [["sent", "Sent"], ["not_configured", "Not configured"], ["failed", "Failed"]] }],
    sort: ["createdAt", "desc"],
  },
  {
    ...base,
    key: "media", permission: "media", label: "Media Library", singular: "file", titleField: "name", canCreate: false, canEdit: false, publishable: false,
    description: "Images, videos and PDFs for use across the website.",
    fields: [],
    columns: [{ name: "name", label: "File" }, { name: "mime", label: "Type" }, { name: "size", label: "Size", kind: "size" }, { name: "createdAt", label: "Uploaded", kind: "datetime" }],
    search: ["name"],
    sort: ["createdAt", "desc"],
  },
];

export const TABLES: Record<string, PgTable> = {
  projects: t.projects,
  services: t.services,
  tenders: t.tenders,
  leads: t.leads,
  clients: t.clients,
  certifications: t.certifications,
  jobs: t.jobs,
  applications: t.applications,
  news: t.news,
  testimonials: t.testimonials,
  pages: t.pages,
  users: t.users,
  audit: t.auditLogs,
  emails: t.emailLog,
  media: t.files,
};

export function getResourceDef(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key);
}
