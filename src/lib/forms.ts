// Single source of truth for public form definitions.
// The same definitions drive the client UI and the server-side validation.
import { SERVICE_NAMES, type LeadType } from "./site";

export type FormField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "date" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  half?: boolean;
  max?: number;
  help?: string;
};

export type LeadFormConfig = {
  type: LeadType;
  slug: string;
  code: string;
  title: string;
  short: string;
  intro: string;
  submitLabel: string;
  fields: FormField[];
  attachments?: { label: string; help: string };
};

/** Columns stored directly on the lead; every other field is stored in `details`. */
export const LEAD_CORE_FIELDS = ["name", "organization", "designation", "email", "phone", "sector", "subject", "message"];

const SECTORS = [
  "Government department",
  "Semi-government / public authority",
  "Private company",
  "Real estate developer",
  "Industrial / commercial organization",
  "NGO / institution",
  "International development organization",
  "Consultant / architect / engineer",
  "Individual",
];

const BUDGETS = ["Not yet defined", "Small works", "Medium-scale project", "Large-scale project", "Programme / multi-package"];

const who: FormField[] = [
  { name: "name", label: "Full name", type: "text", required: true, half: true, max: 120 },
  { name: "organization", label: "Organization / department", type: "text", half: true, max: 160 },
  { name: "email", label: "Email address", type: "email", required: true, half: true, max: 160 },
  { name: "phone", label: "Phone number", type: "tel", required: true, half: true, max: 30 },
];
const consent: FormField = {
  name: "consent",
  label: "I agree that Ahem Corporation may process the information I submit in order to respond to this request, as described in the Privacy Policy.",
  type: "checkbox",
  required: true,
};

export const LEAD_FORMS: LeadFormConfig[] = [
  {
    type: "tender_invitation",
    slug: "tender-invitation",
    code: "TI",
    title: "Invite Ahem Corporation to Bid",
    short: "Tender invitation",
    intro:
      "For procurement authorities, government departments and organizations inviting us to participate in a tender. Invitations are confidential — they are routed only to our tender desk and are never published on this website.",
    submitLabel: "Submit tender invitation",
    fields: [
      { name: "organization", label: "Issuing organization / department", type: "text", required: true, half: true, max: 160 },
      { name: "sector", label: "Organization type", type: "select", options: SECTORS, required: true, half: true },
      { name: "name", label: "Contact person", type: "text", required: true, half: true, max: 120 },
      { name: "designation", label: "Designation", type: "text", half: true, max: 120 },
      { name: "email", label: "Official email", type: "email", required: true, half: true, max: 160 },
      { name: "phone", label: "Phone number", type: "tel", required: true, half: true, max: 30 },
      { name: "subject", label: "Tender title", type: "text", required: true, max: 200 },
      { name: "tenderReference", label: "Tender / reference number", type: "text", half: true, max: 80 },
      { name: "category", label: "Work category", type: "select", options: SERVICE_NAMES, half: true },
      { name: "location", label: "Project location (province / city)", type: "text", half: true, max: 160 },
      { name: "deadline", label: "Submission deadline", type: "date", half: true },
      { name: "estimatedValue", label: "Estimated value (optional)", type: "text", half: true, max: 80 },
      { name: "procurementMethod", label: "Procurement method", type: "select", options: ["Open tender", "Limited / restricted tender", "Request for quotation", "Request for proposal", "Direct invitation", "Pre-qualification"], half: true },
      { name: "message", label: "Scope summary and instructions to bidders", type: "textarea", required: true, max: 5000 },
      consent,
    ],
    attachments: { label: "Tender documents, BOQ and drawings", help: "PDF, Word, Excel, images, DWG or ZIP · up to 5 files · 10 MB each" },
  },
  {
    type: "project_requirement",
    slug: "project-requirement",
    code: "PR",
    title: "Submit a Project Requirement",
    short: "Project requirement",
    intro:
      "For private clients, developers, companies and institutions planning a construction or engineering project. Tell us what you need and our team will respond with next steps.",
    submitLabel: "Submit project requirement",
    fields: [
      ...who,
      { name: "sector", label: "You are a", type: "select", options: SECTORS, half: true },
      { name: "category", label: "Type of work", type: "select", options: SERVICE_NAMES, required: true, half: true },
      { name: "subject", label: "Project name / title", type: "text", required: true, max: 200 },
      { name: "location", label: "Project location", type: "text", half: true, max: 160 },
      { name: "budget", label: "Indicative scale", type: "select", options: BUDGETS, half: true },
      { name: "timeline", label: "Expected start / timeline", type: "text", half: true, max: 120, placeholder: "e.g. Q3, within 6 months" },
      { name: "stage", label: "Current stage", type: "select", options: ["Idea / feasibility", "Design in progress", "Design complete", "Ready to build", "Works in progress"], half: true },
      { name: "message", label: "Describe your requirement", type: "textarea", required: true, max: 5000 },
      consent,
    ],
    attachments: { label: "Specifications, BOQ and drawings", help: "PDF, Word, Excel, images, DWG or ZIP · up to 5 files · 10 MB each" },
  },
  {
    type: "quotation",
    slug: "quotation",
    code: "QT",
    title: "Request a Quotation",
    short: "Quotation",
    intro: "Share your scope, quantities and drawings and we will prepare a priced quotation.",
    submitLabel: "Request quotation",
    fields: [
      ...who,
      { name: "category", label: "Type of work", type: "select", options: SERVICE_NAMES, required: true, half: true },
      { name: "location", label: "Site location", type: "text", half: true, max: 160 },
      { name: "subject", label: "Quotation subject", type: "text", required: true, max: 200 },
      { name: "requiredBy", label: "Quotation required by", type: "date", half: true },
      { name: "budget", label: "Indicative scale", type: "select", options: BUDGETS, half: true },
      { name: "message", label: "Scope of work and quantities", type: "textarea", required: true, max: 5000 },
      consent,
    ],
    attachments: { label: "BOQ, specifications and drawings", help: "PDF, Word, Excel, images, DWG or ZIP · up to 5 files · 10 MB each" },
  },
  {
    type: "proposal",
    slug: "proposal",
    code: "PP",
    title: "Submit a Construction Project Proposal",
    short: "Project proposal",
    intro: "Propose a joint venture, development partnership or turnkey project for our review.",
    submitLabel: "Submit proposal",
    fields: [
      ...who,
      { name: "sector", label: "Organization type", type: "select", options: SECTORS, half: true },
      { name: "proposalType", label: "Proposal type", type: "select", options: ["Joint venture", "Subcontract / partnership", "Design & build", "Turnkey / EPC", "Development partnership", "Other"], half: true },
      { name: "subject", label: "Proposal title", type: "text", required: true, max: 200 },
      { name: "location", label: "Project location", type: "text", half: true, max: 160 },
      { name: "timeline", label: "Proposed timeline", type: "text", half: true, max: 120 },
      { name: "message", label: "Proposal summary", type: "textarea", required: true, max: 5000 },
      consent,
    ],
    attachments: { label: "Proposal documents", help: "PDF, Word, Excel, images, DWG or ZIP · up to 5 files · 10 MB each" },
  },
  {
    type: "company_profile",
    slug: "company-profile",
    code: "CP",
    title: "Request Our Company Profile",
    short: "Company profile",
    intro: "Request the corporate profile and pre-qualification documents for your vendor registration or evaluation.",
    submitLabel: "Request company profile",
    fields: [
      ...who,
      { name: "sector", label: "Organization type", type: "select", options: SECTORS, half: true },
      { name: "purpose", label: "Purpose", type: "select", options: ["Vendor / contractor registration", "Pre-qualification", "Tender evaluation", "Partnership review", "General information"], half: true },
      { name: "message", label: "Documents required / notes", type: "textarea", max: 3000 },
      consent,
    ],
  },
  {
    type: "meeting",
    slug: "meeting",
    code: "MT",
    title: "Schedule a Meeting",
    short: "Meeting",
    intro: "Request a meeting with our business development or technical team. We will confirm the time by email.",
    submitLabel: "Request meeting",
    fields: [
      ...who,
      { name: "preferredDate", label: "Preferred date", type: "date", required: true, half: true },
      { name: "preferredTime", label: "Preferred time", type: "select", options: ["Morning", "Midday", "Afternoon"], half: true },
      { name: "mode", label: "Meeting format", type: "select", options: ["In person at our office", "At your office / site", "Online video call", "Phone call"], required: true, half: true },
      { name: "subject", label: "Meeting subject", type: "text", required: true, half: true, max: 200 },
      { name: "message", label: "Agenda / notes", type: "textarea", max: 3000 },
      consent,
    ],
  },
  {
    type: "business_inquiry",
    slug: "business-inquiry",
    code: "BI",
    title: "Business Inquiry",
    short: "Business inquiry",
    intro: "For partnerships, supplier and subcontractor registration, and other commercial matters.",
    submitLabel: "Send business inquiry",
    fields: [
      ...who,
      { name: "sector", label: "Organization type", type: "select", options: SECTORS, half: true },
      { name: "interest", label: "Area of interest", type: "select", options: ["Partnership / joint venture", "Supplier registration", "Subcontractor registration", "Consultancy services", "Media / press", "Other"], half: true },
      { name: "subject", label: "Subject", type: "text", required: true, max: 200 },
      { name: "message", label: "Message", type: "textarea", required: true, max: 5000 },
      consent,
    ],
    attachments: { label: "Supporting documents (optional)", help: "PDF, Word, Excel or images · up to 5 files · 10 MB each" },
  },
  {
    type: "contact",
    slug: "contact",
    code: "CT",
    title: "Send Us a Message",
    short: "General message",
    intro: "General questions and feedback.",
    submitLabel: "Send message",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, half: true, max: 120 },
      { name: "email", label: "Email address", type: "email", required: true, half: true, max: 160 },
      { name: "phone", label: "Phone number (optional)", type: "tel", half: true, max: 30 },
      { name: "subject", label: "Subject", type: "text", required: true, half: true, max: 200 },
      { name: "message", label: "Message", type: "textarea", required: true, max: 5000 },
      consent,
    ],
  },
];

export function leadFormBySlug(slug: string | undefined | null): LeadFormConfig | undefined {
  return LEAD_FORMS.find((f) => f.slug === slug || f.type === slug);
}

export const APPLICATION_FIELDS: FormField[] = [
  { name: "name", label: "Full name", type: "text", required: true, half: true, max: 120 },
  { name: "email", label: "Email address", type: "email", required: true, half: true, max: 160 },
  { name: "phone", label: "Phone number", type: "tel", required: true, half: true, max: 30 },
  { name: "location", label: "Current city / location", type: "text", half: true, max: 120 },
  { name: "currentRole", label: "Current or most recent position", type: "text", half: true, max: 160 },
  { name: "experienceYears", label: "Years of relevant experience", type: "select", options: ["0–1", "2–4", "5–9", "10–14", "15+"], required: true, half: true },
  { name: "coverLetter", label: "Cover note", type: "textarea", max: 4000, help: "Briefly tell us why you are a strong fit for this role." },
  {
    name: "consent",
    label: "I confirm the information provided is accurate and consent to Ahem Corporation processing my application data for recruitment purposes.",
    type: "checkbox",
    required: true,
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Removes control characters and trims. Newlines are kept for multi-line text only. */
export function cleanText(value: unknown, multiline = false): string {
  if (typeof value !== "string") return "";
  const pattern = multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return value.replace(/\r\n/g, "\n").replace(pattern, " ").trim();
}

export function validateForm(
  fields: FormField[],
  raw: Record<string, unknown>,
): { errors: Record<string, string>; values: Record<string, string> } {
  const errors: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const f of fields) {
    const v = cleanText(raw[f.name], f.type === "textarea");
    const max = f.max ?? (f.type === "textarea" ? 5000 : 200);
    if (f.type === "checkbox") {
      const on = v === "yes" || v === "on" || v === "true";
      if (f.required && !on) errors[f.name] = "Please confirm to continue.";
      values[f.name] = on ? "yes" : "";
      continue;
    }
    if (!v) {
      if (f.required) errors[f.name] = "This field is required.";
      values[f.name] = "";
      continue;
    }
    if (v.length > max) errors[f.name] = `Please keep this under ${max} characters.`;
    else if (f.type === "email" && !EMAIL_RE.test(v)) errors[f.name] = "Enter a valid email address.";
    else if (f.type === "tel" && (!/^[+()\d\s.-]+$/.test(v) || v.replace(/\D/g, "").length < 6 || v.replace(/\D/g, "").length > 16))
      errors[f.name] = "Enter a valid phone number.";
    else if (f.type === "date" && (!DATE_RE.test(v) || Number.isNaN(new Date(v).getTime()))) errors[f.name] = "Enter a valid date.";
    else if (f.type === "select" && f.options && !f.options.includes(v)) errors[f.name] = "Choose one of the listed options.";
    values[f.name] = f.type === "email" ? v.toLowerCase() : v;
  }
  return { errors, values };
}
