import { can, leadTypesForRole, type LeadType, type Permission } from "./site";

export type NavItem = { label: string; href: string; icon: string; permission: Permission; leadType?: LeadType };
export type NavGroup = { group: string; items: NavItem[] };

/** The 20 admin modules. Items are filtered per role on the server before being sent to the browser. */
export const ADMIN_NAV: NavGroup[] = [
  { group: "Overview", items: [{ label: "Dashboard & analytics", href: "/admin", icon: "dashboard", permission: "dashboard" }] },
  {
    group: "Tenders & leads",
    items: [
      { label: "Tender invitations", href: "/admin/leads?f_type=tender_invitation", icon: "gavel", permission: "leads", leadType: "tender_invitation" },
      { label: "Project inquiries", href: "/admin/leads?f_type=project_requirement", icon: "inbox", permission: "leads", leadType: "project_requirement" },
      { label: "Leads & CRM", href: "/admin/leads", icon: "crm", permission: "leads" },
      { label: "Contact submissions", href: "/admin/leads?f_type=contact", icon: "message", permission: "leads", leadType: "contact" },
      { label: "Tender management", href: "/admin/tenders", icon: "file", permission: "tenders" },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "Projects", href: "/admin/projects", icon: "projects", permission: "projects" },
      { label: "Services", href: "/admin/services", icon: "services", permission: "services" },
      { label: "News & blog", href: "/admin/news", icon: "news", permission: "news" },
      { label: "Clients & partners", href: "/admin/clients", icon: "clients", permission: "clients" },
      { label: "Testimonials", href: "/admin/testimonials", icon: "quote", permission: "testimonials" },
      { label: "Certifications & documents", href: "/admin/certifications", icon: "shield", permission: "certifications" },
      { label: "Website pages", href: "/admin/pages", icon: "pages", permission: "pages" },
      { label: "Media library", href: "/admin/media", icon: "media", permission: "media" },
    ],
  },
  {
    group: "Careers",
    items: [
      { label: "Job openings", href: "/admin/jobs", icon: "jobs", permission: "jobs" },
      { label: "Job applications", href: "/admin/applications", icon: "applicants", permission: "applications" },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Website settings", href: "/admin/settings", icon: "settings", permission: "settings" },
      { label: "SEO management", href: "/admin/settings?tab=seo", icon: "seo", permission: "settings" },
      { label: "Email notifications", href: "/admin/settings?tab=email", icon: "mail", permission: "settings" },
      { label: "Email log", href: "/admin/emails", icon: "maillog", permission: "emails" },
      { label: "Users & roles", href: "/admin/users", icon: "users", permission: "users" },
      { label: "Audit log", href: "/admin/audit", icon: "audit", permission: "audit" },
    ],
  },
];

export function navForRole(role: string): NavGroup[] {
  const types = leadTypesForRole(role);
  return ADMIN_NAV.map((g) => ({
    group: g.group,
    items: g.items.filter((i) => can(role, i.permission) && (!i.leadType || types.includes(i.leadType))),
  })).filter((g) => g.items.length);
}
