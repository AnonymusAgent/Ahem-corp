import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { LOGO } from "./logo";
import type { SiteSettings } from "./settings";
import type { Service, Tender } from "./data";
import { formatDate, parseRows, SITE_URL, TENDER_SECTORS, TENDER_STATUSES, tenderStatus } from "./site";

const NAVY = rgb(0x10 / 255, 0x24 / 255, 0x3a / 255);
const GOLD = rgb(0xd6 / 255, 0xa8 / 255, 0x4b / 255);
const INK = rgb(0.145, 0.169, 0.196);
const GREY = rgb(0.42, 0.45, 0.5);
const WHITE = rgb(1, 1, 1);
const W = 595.28;
const H = 841.89;
const M = 56;

/** Standard PDF fonts only cover Latin-1, so typographic characters are normalised. */
const safe = (s: string) =>
  (s || "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\*\*/g, "")
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of safe(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

function drawLogo(page: PDFPage, x: number, y: number, scale: number, primary: RGB) {
  const o = { x, y, scale };
  page.drawSvgPath(LOGO.beamLeft, { ...o, color: GOLD });
  page.drawSvgPath(LOGO.beamRight, { ...o, color: primary });
  page.drawSvgPath(LOGO.towerLeft, { ...o, color: primary });
  page.drawSvgPath(LOGO.towerCentre, { ...o, color: GOLD });
  page.drawSvgPath(LOGO.towerRight, { ...o, color: primary });
  page.drawSvgPath(LOGO.ground, { ...o, color: GOLD });
}

class Writer {
  page!: PDFPage;
  y = 0;
  constructor(
    public doc: PDFDocument,
    public regular: PDFFont,
    public bold: PDFFont,
    public running: string,
    public footer: string,
  ) {}

  newPage() {
    this.page = this.doc.addPage([W, H]);
    drawLogo(this.page, M, H - 30, 0.36, NAVY);
    this.page.drawText("AHEM CORPORATION", { x: M + 30, y: H - 48, size: 9, font: this.bold, color: NAVY });
    const rw = this.regular.widthOfTextAtSize(this.running, 8);
    this.page.drawText(this.running, { x: W - M - rw, y: H - 48, size: 8, font: this.regular, color: GREY });
    this.page.drawRectangle({ x: M, y: H - 62, width: W - 2 * M, height: 0.75, color: GOLD });
    this.page.drawText(safe(this.footer), { x: M, y: 34, size: 7.5, font: this.regular, color: GREY });
    const n = String(this.doc.getPageCount());
    this.page.drawText(n, { x: W - M - this.regular.widthOfTextAtSize(n, 8), y: 34, size: 8, font: this.regular, color: GREY });
    this.y = H - 92;
  }

  ensure(h: number) {
    if (this.y - h < 64) this.newPage();
  }

  text(str: string, o: { size?: number; font?: PDFFont; color?: RGB; indent?: number; gap?: number } = {}) {
    const size = o.size ?? 10.5;
    const font = o.font ?? this.regular;
    const indent = o.indent ?? 0;
    for (const line of wrap(str, font, size, W - 2 * M - indent)) {
      this.ensure(size * 1.5);
      if (line) this.page.drawText(line, { x: M + indent, y: this.y - size, size, font, color: o.color ?? INK });
      this.y -= size * 1.5;
    }
    this.y -= o.gap ?? 6;
  }

  heading(str: string) {
    this.ensure(60);
    this.y -= 10;
    this.page.drawRectangle({ x: M, y: this.y - 14, width: 3, height: 16, color: GOLD });
    this.page.drawText(safe(str), { x: M + 12, y: this.y - 13, size: 15, font: this.bold, color: NAVY });
    this.y -= 30;
  }

  bullets(items: string[]) {
    for (const item of items) {
      const lines = wrap(item, this.regular, 10.5, W - 2 * M - 16);
      this.ensure(lines.length * 15.75);
      this.page.drawRectangle({ x: M + 2, y: this.y - 8, width: 4, height: 4, color: GOLD });
      for (const line of lines) {
        this.page.drawText(line, { x: M + 16, y: this.y - 10.5, size: 10.5, font: this.regular, color: INK });
        this.y -= 15.75;
      }
      this.y -= 2;
    }
    this.y -= 6;
  }

  /** Renders the lightweight markup used across the site ("- " bullets, "## " headings, paragraphs). */
  rich(str: string) {
    for (const block of (str || "").split(/\n{2,}/)) {
      const lines = block.split("\n").filter((l) => l.trim());
      if (!lines.length) continue;
      if (lines.every((l) => l.trim().startsWith("- "))) this.bullets(lines.map((l) => l.trim().slice(2)));
      else if (lines[0]!.startsWith("## ")) {
        this.text(lines[0]!.slice(3), { font: this.bold, size: 11.5, color: NAVY, gap: 2 });
        if (lines.length > 1) this.rich(lines.slice(1).join("\n"));
      } else {
        const paras = lines.filter((l) => !l.trim().startsWith("- "));
        const bl = lines.filter((l) => l.trim().startsWith("- "));
        if (paras.length) this.text(paras.join(" "));
        if (bl.length) this.bullets(bl.map((l) => l.trim().slice(2)));
      }
    }
  }

  kv(label: string, value: string) {
    const lines = wrap(value || "-", this.regular, 10.5, W - 2 * M - 160);
    this.ensure(lines.length * 15.75 + 8);
    this.page.drawText(safe(label).toUpperCase(), { x: M, y: this.y - 10, size: 7.5, font: this.bold, color: GREY });
    for (const line of lines) {
      this.page.drawText(line, { x: M + 160, y: this.y - 10.5, size: 10.5, font: this.regular, color: INK });
      this.y -= 15.75;
    }
    this.y -= 4;
    this.page.drawRectangle({ x: M, y: this.y, width: W - 2 * M, height: 0.4, color: rgb(0.88, 0.9, 0.92) });
    this.y -= 8;
  }
}

async function setup(running: string, footer: string, title: string) {
  const doc = await PDFDocument.create();
  doc.setTitle(safe(title));
  doc.setAuthor("Ahem Corporation");
  doc.setCreator("Ahem Corporation website");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  return new Writer(doc, regular, bold, running, footer);
}

export async function corporateProfilePdf(s: SiteSettings, services: Service[]): Promise<Uint8Array> {
  const draft = s.contact.isSample || s.about.isSample;
  const w = await setup("Corporate Profile", `${s.general.companyName} - ${SITE_URL.replace(/^https?:\/\//, "")}${draft ? " - Draft: contains sample content pending official company data" : ""}`, `${s.general.companyName} - Corporate Profile`);

  // Cover
  const cover = w.doc.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NAVY });
  for (let i = 1; i < 11; i++) cover.drawRectangle({ x: (W / 11) * i, y: 0, width: 0.3, height: H, color: rgb(0.13, 0.22, 0.32) });
  for (let i = 1; i < 15; i++) cover.drawRectangle({ x: 0, y: (H / 15) * i, width: W, height: 0.3, color: rgb(0.13, 0.22, 0.32) });
  drawLogo(cover, M, H - 90, 1.6, WHITE);
  cover.drawText(safe(s.general.companyName).toUpperCase(), { x: M, y: 420, size: 34, font: w.bold, color: WHITE });
  cover.drawRectangle({ x: M, y: 400, width: 72, height: 3, color: GOLD });
  cover.drawText("CORPORATE PROFILE", { x: M, y: 368, size: 13, font: w.bold, color: GOLD });
  let cy = 330;
  for (const line of wrap(s.general.tagline, w.regular, 16, W - 2 * M)) {
    cover.drawText(line, { x: M, y: cy, size: 16, font: w.regular, color: WHITE });
    cy -= 22;
  }
  cover.drawText(safe(s.general.footerNote), { x: M, y: 70, size: 9, font: w.regular, color: rgb(0.72, 0.78, 0.84) });
  cover.drawText(String(new Date().getFullYear()), { x: W - M - 28, y: 70, size: 9, font: w.bold, color: GOLD });

  w.newPage();
  w.heading("Company overview");
  w.rich(s.about.overview);
  w.heading("Mission");
  w.rich(s.about.mission);
  w.heading("Vision");
  w.rich(s.about.vision);
  w.heading("Core values");
  for (const [title, text] of parseRows(s.about.values, 2)) {
    w.text(title!, { font: w.bold, color: NAVY, gap: 0 });
    w.text(text!, { gap: 8 });
  }

  w.newPage();
  w.heading("Services");
  for (const svc of services) {
    w.ensure(48);
    w.text(svc.title, { font: w.bold, color: NAVY, gap: 0 });
    w.text(svc.summary, { gap: 9 });
  }

  w.newPage();
  w.heading("Engineering & technical capabilities");
  for (const [title, text] of parseRows(s.about.capabilities, 2)) {
    w.text(title!, { font: w.bold, color: NAVY, gap: 0 });
    w.text(text!, { gap: 8 });
  }
  w.heading("Health, safety & environment");
  w.rich(s.about.hse);
  w.heading("Quality assurance & quality control");
  w.rich(s.about.qaqc);

  w.heading("Contact");
  if (s.contact.isSample) w.text("Contact details shown are sample values pending confirmation.", { color: GREY, size: 9 });
  w.kv("Address", s.contact.address);
  w.kv("Phone", s.contact.phone);
  w.kv("Email", s.contact.email);
  w.kv("Tenders", s.contact.tendersEmail);
  w.kv("Website", SITE_URL);
  return w.doc.save();
}

export async function tenderNoticePdf(tender: Tender): Promise<Uint8Array> {
  const w = await setup(
    `Tender notice - ${tender.reference}`,
    `Information summary generated ${formatDate(new Date())} from ${SITE_URL.replace(/^https?:\/\//, "")}. Official tender documents issued by the procuring organization prevail.`,
    `${tender.reference} - ${tender.title}`,
  );
  w.newPage();
  if (tender.isSample) w.text("SAMPLE TENDER - demonstration content, not a real procurement notice.", { font: w.bold, color: rgb(0.7, 0.2, 0.1), size: 9 });
  w.text(tender.reference, { font: w.bold, color: GREY, size: 9, gap: 2 });
  w.text(tender.title, { font: w.bold, color: NAVY, size: 18, gap: 14 });
  const status = tenderStatus(tender);
  w.kv("Status", TENDER_STATUSES[status]);
  w.kv("Sector", TENDER_SECTORS[tender.sector as keyof typeof TENDER_SECTORS] ?? tender.sector);
  w.kv("Issuing organization", tender.issuer);
  w.kv("Category", tender.category);
  w.kv("Location", [tender.city, tender.province].filter(Boolean).join(", "));
  w.kv("Publication date", formatDate(tender.publishedOn));
  w.kv("Submission deadline", formatDate(tender.deadline));
  if (tender.estimatedValue) w.kv("Estimated value", tender.estimatedValue);
  if (tender.description) {
    w.heading("Description");
    w.rich(tender.description);
  }
  if (tender.eligibility.length) {
    w.heading("Eligibility requirements");
    w.bullets(tender.eligibility);
  }
  if (tender.requiredDocs.length) {
    w.heading("Required documentation");
    w.bullets(tender.requiredDocs);
  }
  if (tender.instructions) {
    w.heading("Application / inquiry instructions");
    w.rich(tender.instructions);
  }
  return w.doc.save();
}
