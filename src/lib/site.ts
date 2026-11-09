// Shared, client-safe constants and helpers (no server-only imports).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/* --------------------------------- Roles --------------------------------- */

export const ROLES = [
  "super_admin",
  "administrator",
  "tender_manager",
  "project_manager",
  "content_editor",
  "hr_manager",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  tender_manager: "Tender Manager",
  project_manager: "Project Manager",
  content_editor: "Content Editor",
  hr_manager: "HR Manager",
};

const ALL: Role[] = [...ROLES];
const ADMINS: Role[] = ["super_admin", "administrator"];

/** Permission matrix: which roles may use each admin module. Enforced on the server. */
export const PERMISSIONS = {
  dashboard: ALL,
  projects: [...ADMINS, "project_manager", "content_editor"],
  services: [...ADMINS, "content_editor"],
  tenders: [...ADMINS, "tender_manager"],
  leads: [...ADMINS, "tender_manager", "project_manager"],
  clients: [...ADMINS, "content_editor"],
  certifications: ADMINS,
  jobs: [...ADMINS, "hr_manager"],
  applications: [...ADMINS, "hr_manager"],
  news: [...ADMINS, "content_editor"],
  media: [...ADMINS, "content_editor", "project_manager", "tender_manager", "hr_manager"],
  testimonials: [...ADMINS, "content_editor"],
  pages: [...ADMINS, "content_editor"],
  settings: ADMINS,
  emails: ADMINS,
  users: ["super_admin"],
  audit: ADMINS,
  backup: ["super_admin"],
} satisfies Record<string, Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export function can(role: string | undefined | null, permission: Permission): boolean {
  return !!role && (PERMISSIONS[permission] as string[]).includes(role);
}

/* --------------------------------- Leads --------------------------------- */

export const LEAD_TYPES = [
  "tender_invitation",
  "project_requirement",
  "quotation",
  "proposal",
  "company_profile",
  "meeting",
  "business_inquiry",
  "contact",
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  tender_invitation: "Tender invitation",
  project_requirement: "Project requirement",
  quotation: "Quotation request",
  proposal: "Project proposal",
  company_profile: "Company profile request",
  meeting: "Meeting request",
  business_inquiry: "Business inquiry",
  contact: "Contact message",
};

export const LEAD_STATUSES = [
  "new",
  "under_review",
  "contacted",
  "quotation_submitted",
  "negotiation",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  under_review: "Under Review",
  contacted: "Contacted",
  quotation_submitted: "Quotation Submitted",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

/** Lead types each role may see. Confidential tender invitations are limited to the tender desk and admins. */
export function leadTypesForRole(role: string): LeadType[] {
  if (role === "super_admin" || role === "administrator") return [...LEAD_TYPES];
  if (role === "tender_manager") return ["tender_invitation"];
  if (role === "project_manager") return ["project_requirement", "quotation", "proposal"];
  return [];
}

/* ------------------------------ Vocabularies ------------------------------ */

export const SERVICE_NAMES = [
  "General Construction",
  "Civil Engineering",
  "Building Construction",
  "Infrastructure Development",
  "Road Construction",
  "Bridges and Structures",
  "Commercial Construction",
  "Industrial Construction",
  "Residential Construction",
  "Renovation and Rehabilitation",
  "Electrical and Mechanical Works",
  "Plumbing and HVAC",
  "Project Management and Consultancy",
  "Maintenance and Facility Management",
];

export const PROJECT_STATUSES = { completed: "Completed", ongoing: "Ongoing", upcoming: "Upcoming" } as const;
export const TENDER_STATUSES = { open: "Open", closing_soon: "Closing Soon", closed: "Closed", awarded: "Awarded" } as const;
export const TENDER_SECTORS = { government: "Government", private: "Private" } as const;

export const CLIENT_TYPES = {
  government: "Government departments",
  private: "Private-sector clients",
  corporate_partner: "Corporate partners",
  consultant: "Consultants",
  supplier: "Suppliers",
} as const;

export const CERT_CATEGORIES = {
  company_registration: "Company registration",
  tax: "Tax registration",
  contractor: "Contractor registration",
  engineering: "Engineering & regulatory registrations",
  safety: "Health & safety",
  quality: "Quality management",
  insurance: "Insurance",
  other: "Other compliance documents",
} as const;

export const CERT_VISIBILITY = {
  public: "Public download",
  on_request: "Available on request",
  internal: "Internal only",
} as const;

export const NEWS_CATEGORIES = {
  announcement: "Company announcement",
  project_update: "Project update",
  industry: "Industry news",
  tender_update: "Tender update",
  event: "Corporate event",
  insight: "Article & insight",
} as const;

export const APPLICATION_STATUSES = {
  new: "New",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
} as const;

/* --------------------------------- Helpers -------------------------------- */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(value: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value.length === 10 ? `${value}T00:00:00Z` : value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC", ...opts });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateISO: string | null | undefined): number | null {
  if (!dateISO) return null;
  const ms = new Date(`${dateISO}T23:59:59Z`).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

/** Effective tender status: Open tenders become "Closing Soon" within 7 days and "Closed" after the deadline. */
export function tenderStatus(t: { status: string; deadline: string | null }): keyof typeof TENDER_STATUSES {
  if (t.status === "awarded") return "awarded";
  if (t.status === "closed") return "closed";
  const d = daysUntil(t.deadline);
  if (d !== null && d <= 0) return "closed";
  if (d !== null && d <= 7) return "closing_soon";
  return "open";
}

/** Adds responsive sizing params to stock image URLs; other URLs are returned untouched. */
export function img(url: string | null | undefined, w = 1200, h?: number): string {
  if (!url) return "";
  if (url.includes("images.pexels.com") && !url.includes("?")) {
    return `${url}?auto=compress&cs=tinysrgb&fit=crop&w=${w}${h ? `&h=${h}` : ""}`;
  }
  return url;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function isValidPhone(v: string | undefined | null): boolean {
  if (!v) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && !/^0+$/.test(digits);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Parses "a | b | c" lines (used for editable lists in settings). */
export function parseRows(text: string | undefined | null, cols: number): string[][] {
  return (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split("|").map((p) => p.trim());
      while (parts.length < cols) parts.push("");
      return parts;
    });
}
