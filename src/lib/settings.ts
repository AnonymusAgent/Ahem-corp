import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings as settingsTable, type FileRef } from "@/db/schema";
import { ensureDb } from "./bootstrap";
import { cleanText } from "./forms";

const P = "https://images.pexels.com/photos";

export const DEFAULT_SETTINGS = {
  general: {
    companyName: "Ahem Corporation",
    tagline: "Building Infrastructure. Engineering Tomorrow.",
    description:
      "Ahem Corporation is a construction, engineering and infrastructure company delivering public works, commercial, industrial and residential projects for government departments and private-sector clients.",
    footerNote: "Construction · Engineering · Infrastructure · Project Development",
  },
  contact: {
    email: "info@ahemcorporation.example",
    tendersEmail: "tenders@ahemcorporation.example",
    careersEmail: "careers@ahemcorporation.example",
    phone: "+00 000 000 0000",
    whatsapp: "",
    address: "Head Office, 00 Sample Boulevard, Business District, Capital City 00000",
    hours: "Monday – Friday | 9:00 – 18:00\nSaturday | 9:00 – 14:00\nSunday | Closed",
    mapQuery: "",
    isSample: true,
  },
  social: { linkedin: "", facebook: "", instagram: "", x: "", youtube: "" },
  home: {
    heroEyebrow: "Construction · Engineering · Infrastructure",
    heroHeadline: "Building Infrastructure. Engineering Tomorrow.",
    heroSub:
      "From highways, bridges and public facilities to commercial, industrial and residential developments — Ahem Corporation plans, engineers and builds projects for government and private-sector clients with disciplined delivery, safety and quality.",
    heroImage: `${P}/34519252/pexels-photo-34519252.jpeg`,
    introTitle: "One accountable partner from tender to handover.",
    introBody:
      "Ahem Corporation brings engineering, construction and project management together under one roof. Our teams work to documented procedures for planning, procurement, quality control and site safety — so public authorities and private owners get predictable programmes, transparent reporting and durable assets.",
    introImage: `${P}/8961070/pexels-photo-8961070.jpeg`,
    stats: "120 | + | Projects delivered\n18 | + | Years of experience\n350 | + | Engineers & site staff\n14 |  | Construction disciplines",
    statsAreSample: true,
    showSampleNotice: true,
    showServices: true,
    showProjects: true,
    showStats: true,
    showDelivery: true,
    showIndustries: true,
    showWhy: true,
    showSectors: true,
    showCertifications: true,
    showTestimonials: true,
    showTenders: true,
  },
  about: {
    overview:
      "Ahem Corporation is a construction, engineering and project development company. We deliver civil works, buildings and infrastructure for public authorities, and commercial, industrial and residential projects for private owners.\n\nWe combine in-house engineering with experienced site management, a vetted supply chain and documented management systems for quality, safety and environmental performance.",
    mission:
      "To deliver safe, durable and well-engineered infrastructure and buildings — on programme, within budget and to the specified standard — for every client we serve.",
    vision:
      "To be a trusted first-choice contractor for public and private clients, recognised for technical competence, integrity in procurement and consistent delivery.",
    history:
      "Milestone 01 | Foundation | Company established as a general contractor delivering building and civil works.\nMilestone 02 | Public works | Expansion into roads, drainage and public-sector infrastructure contracts.\nMilestone 03 | Diversification | Commercial, industrial and MEP divisions added alongside in-house engineering.\nMilestone 04 | Today | An integrated construction, engineering and project management organization.",
    values:
      "Integrity | We compete fairly, document transparently and honour our commitments.\nSafety first | No programme or cost target is more important than people going home safe.\nEngineering quality | We build to specification and verify it with inspection and testing.\nAccountability | One team, clear responsibilities, honest reporting.\nPartnership | We work openly with clients, consultants, suppliers and communities.\nSustainability | We reduce waste, protect sites and build assets that last.",
    leadership:
      "Name to be published | Chief Executive Officer | Leads corporate strategy, governance and client relationships.\nName to be published | Director, Engineering & Projects | Oversees design coordination, planning and delivery across all projects.\nName to be published | Director, Tenders & Contracts | Leads bidding, estimation, procurement and contract administration.\nName to be published | Head of HSE & Quality | Responsible for safety, environmental and quality management systems.",
    capabilities:
      "Structural & civil design coordination | Review and coordination of drawings, shop drawings and method statements.\nPlanning & project controls | Baseline programmes, progress measurement and cost control.\nEstimation & quantity surveying | BOQ pricing, rate analysis, valuations and variations.\nPlant & equipment | Earthmoving, concrete, lifting and paving equipment through owned and contracted fleets.\nMaterials testing | Sampling, laboratory and field testing with documented results.\nMEP engineering | Electrical, mechanical, plumbing and HVAC installation and commissioning.",
    hse:
      "Health, safety and the environment are managed as line responsibilities on every Ahem Corporation site. Each project starts with a site-specific HSE plan covering risk assessments, permits to work, emergency response and environmental controls.\n\n- Site inductions and daily toolbox talks\n- Mandatory PPE and work-at-height controls\n- Incident reporting, investigation and corrective action\n- Waste, dust, noise and water management plans\n- Regular HSE inspections and management reviews",
    qaqc:
      "Quality is planned before work starts and verified as it proceeds. Every project runs under a Project Quality Plan with inspection and test plans (ITPs) for each activity.\n\n- Material approvals and source inspections\n- Inspection requests and hold points with the consultant\n- Field and laboratory testing with traceable records\n- Non-conformance reporting and corrective action\n- As-built documentation and handover dossiers",
    image: `${P}/7937659/pexels-photo-7937659.jpeg`,
    isSample: true,
  },
  seo: {
    defaultTitle: "Ahem Corporation — Construction, Civil Engineering & Infrastructure Contractor",
    description:
      "Ahem Corporation is a construction company and civil engineering contractor delivering infrastructure development, commercial construction and project management for government tenders and private clients.",
    keywords:
      "construction company, civil engineering contractor, infrastructure development, government construction tenders, commercial construction contractor, construction project management, private construction services",
    gaId: "",
    gscVerification: "",
  },
  email: {
    notifyEmails: "",
    sendConfirmations: true,
    notifyTender: true,
    notifyProject: true,
    notifyContact: true,
    notifyCareers: true,
  },
  profile: { file: null as FileRef | null },
};

export type SiteSettings = typeof DEFAULT_SETTINGS;
export type SettingsGroup = keyof SiteSettings;

export type SettingField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "rows" | "file" | "image";
  help?: string;
  max?: number;
};

/** Describes the editable settings. Drives both the admin form and server-side validation. */
export const SETTINGS_SCHEMA: { group: SettingsGroup; label: string; description: string; fields: SettingField[] }[] = [
  {
    group: "general",
    label: "Branding",
    description: "Company name and descriptions used across the website, emails and the generated corporate profile.",
    fields: [
      { name: "companyName", label: "Company name", type: "text", max: 80 },
      { name: "tagline", label: "Tagline", type: "text", max: 120 },
      { name: "description", label: "Short company description", type: "textarea", max: 600 },
      { name: "footerNote", label: "Footer line", type: "text", max: 160 },
    ],
  },
  {
    group: "contact",
    label: "Contact details",
    description: "Shown in the header, footer, contact page and structured data. WhatsApp, map and social links appear on the site only once filled in.",
    fields: [
      { name: "email", label: "General email", type: "text", max: 160 },
      { name: "tendersEmail", label: "Tenders email", type: "text", max: 160 },
      { name: "careersEmail", label: "Careers email", type: "text", max: 160 },
      { name: "phone", label: "Phone", type: "text", max: 40 },
      { name: "whatsapp", label: "WhatsApp number (international format)", type: "text", max: 40, help: "Example: +44 20 1234 5678. Leave empty to hide WhatsApp buttons." },
      { name: "address", label: "Office address", type: "textarea", max: 300 },
      { name: "hours", label: "Office hours", type: "rows", help: "One per line: Days | Hours" },
      { name: "mapQuery", label: "Google Maps location", type: "text", max: 200, help: "Address or place name to show on the embedded Google Map. Leave empty to hide the map." },
      { name: "isSample", label: "These are sample contact details (shows a “Sample” label on the site)", type: "boolean" },
    ],
  },
  {
    group: "social",
    label: "Social media",
    description: "Full profile URLs. Empty links are hidden.",
    fields: [
      { name: "linkedin", label: "LinkedIn URL", type: "text", max: 200 },
      { name: "facebook", label: "Facebook URL", type: "text", max: 200 },
      { name: "instagram", label: "Instagram URL", type: "text", max: 200 },
      { name: "x", label: "X (Twitter) URL", type: "text", max: 200 },
      { name: "youtube", label: "YouTube URL", type: "text", max: 200 },
    ],
  },
  {
    group: "home",
    label: "Homepage",
    description: "Edit the hero, introduction and statistics, and switch homepage sections on or off — no code changes required.",
    fields: [
      { name: "heroEyebrow", label: "Hero eyebrow", type: "text", max: 120 },
      { name: "heroHeadline", label: "Hero headline", type: "text", max: 120 },
      { name: "heroSub", label: "Hero supporting text", type: "textarea", max: 500 },
      { name: "heroImage", label: "Hero background image", type: "image" },
      { name: "introTitle", label: "Introduction title", type: "text", max: 160 },
      { name: "introBody", label: "Introduction text", type: "textarea", max: 1200 },
      { name: "introImage", label: "Introduction image", type: "image" },
      { name: "stats", label: "Statistics", type: "rows", help: "One per line: Number | Suffix | Label (e.g. 120 | + | Projects delivered)" },
      { name: "statsAreSample", label: "Statistics are sample figures (shows a note under the counters)", type: "boolean" },
      { name: "showSampleNotice", label: "Show the site-wide “demonstration content” notice", type: "boolean" },
      { name: "showServices", label: "Section: Core services", type: "boolean" },
      { name: "showProjects", label: "Section: Featured projects", type: "boolean" },
      { name: "showStats", label: "Section: Achievements & statistics", type: "boolean" },
      { name: "showDelivery", label: "Section: Interactive delivery model", type: "boolean" },
      { name: "showIndustries", label: "Section: Industries served", type: "boolean" },
      { name: "showWhy", label: "Section: Why choose Ahem Corporation", type: "boolean" },
      { name: "showSectors", label: "Section: Government & private capabilities", type: "boolean" },
      { name: "showCertifications", label: "Section: Certifications", type: "boolean" },
      { name: "showTestimonials", label: "Section: Client testimonials", type: "boolean" },
      { name: "showTenders", label: "Section: Latest tenders", type: "boolean" },
    ],
  },
  {
    group: "about",
    label: "About page",
    description: "Company overview, mission, history, values, leadership and management-system statements.",
    fields: [
      { name: "overview", label: "Company overview", type: "textarea", max: 3000 },
      { name: "mission", label: "Mission", type: "textarea", max: 800 },
      { name: "vision", label: "Vision", type: "textarea", max: 800 },
      { name: "history", label: "Company history", type: "rows", help: "One per line: Year or label | Title | Description" },
      { name: "values", label: "Core values", type: "rows", help: "One per line: Value | Description" },
      { name: "leadership", label: "Leadership & management team", type: "rows", help: "One per line: Name | Position | Short bio" },
      { name: "capabilities", label: "Engineering & technical capabilities", type: "rows", help: "One per line: Capability | Description" },
      { name: "hse", label: "HSE commitment", type: "textarea", max: 3000, help: "Start lines with “- ” for bullet points." },
      { name: "qaqc", label: "Quality assurance & quality control", type: "textarea", max: 3000, help: "Start lines with “- ” for bullet points." },
      { name: "image", label: "About page image", type: "image" },
      { name: "isSample", label: "History and leadership are sample content (shows a “Sample” label)", type: "boolean" },
    ],
  },
  {
    group: "profile",
    label: "Corporate profile",
    description: "Upload the official corporate profile PDF. Until one is uploaded, the website generates a profile PDF from your settings and services.",
    fields: [{ name: "file", label: "Corporate profile (PDF)", type: "file" }],
  },
  {
    group: "seo",
    label: "SEO & analytics",
    description: "Default metadata, Google Analytics and Search Console verification. Individual projects, services, news and pages have their own SEO fields.",
    fields: [
      { name: "defaultTitle", label: "Default page title", type: "text", max: 120 },
      { name: "description", label: "Default meta description", type: "textarea", max: 300 },
      { name: "keywords", label: "Keywords", type: "textarea", max: 400 },
      { name: "gaId", label: "Google Analytics measurement ID", type: "text", max: 30, help: "Example: G-XXXXXXXXXX. Loaded only after the visitor accepts analytics cookies." },
      { name: "gscVerification", label: "Google Search Console verification code", type: "text", max: 120, help: "The content value of the google-site-verification meta tag." },
    ],
  },
  {
    group: "email",
    label: "Email notifications",
    description: "Who is notified about new submissions, and whether submitters receive an automatic confirmation. Requires SMTP to be configured on the server.",
    fields: [
      { name: "notifyEmails", label: "Notification recipients", type: "text", max: 400, help: "Comma-separated email addresses." },
      { name: "sendConfirmations", label: "Send automatic confirmation emails to submitters", type: "boolean" },
      { name: "notifyTender", label: "Notify on tender invitations", type: "boolean" },
      { name: "notifyProject", label: "Notify on project requirements, quotations and proposals", type: "boolean" },
      { name: "notifyContact", label: "Notify on contact, meeting, profile and business inquiries", type: "boolean" },
      { name: "notifyCareers", label: "Notify on job applications", type: "boolean" },
    ],
  },
];

function merge(stored: Record<string, unknown> | undefined): SiteSettings {
  const out = structuredClone(DEFAULT_SETTINGS) as Record<string, Record<string, unknown>>;
  for (const group of Object.keys(out)) {
    const s = stored?.[group];
    if (s && typeof s === "object") Object.assign(out[group]!, s);
  }
  return out as unknown as SiteSettings;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    await ensureDb();
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "site")).limit(1);
    return merge(row?.value);
  } catch (e) {
    console.error("[settings] falling back to defaults", e);
    return merge(undefined);
  }
});

/** Validates one settings group against the schema and persists it. */
export async function saveSettingsGroup(group: string, input: Record<string, unknown>) {
  const schema = SETTINGS_SCHEMA.find((g) => g.group === group);
  if (!schema) throw new Error("Unknown settings group");
  const clean: Record<string, unknown> = {};
  for (const f of schema.fields) {
    const v = input[f.name];
    if (f.type === "boolean") clean[f.name] = v === true || v === "true";
    else if (f.type === "file") {
      const ref = v as FileRef | null;
      clean[f.name] = ref && typeof ref === "object" && /^[a-f0-9]{32}$/.test(String(ref.id)) ? { id: ref.id, name: cleanText(ref.name).slice(0, 160) } : null;
    } else {
      const multi = f.type === "textarea" || f.type === "rows";
      const text = cleanText(v, multi).slice(0, f.max ?? (multi ? 4000 : 400));
      if (f.type === "image" && text && !/^(https?:\/\/|\/(?!\/))/.test(text)) continue;
      clean[f.name] = text;
    }
  }
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "site")).limit(1);
  const value = { ...(row?.value || {}), [group]: clean };
  await db
    .insert(settingsTable)
    .values({ key: "site", value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
}
