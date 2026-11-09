import nodemailer, { type Transporter } from "nodemailer";
import { db } from "@/db";
import { emailLog, notifications } from "@/db/schema";
import { SITE_URL } from "./site";

export type EmailResult = "sent" | "not_configured" | "failed";

export function smtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.EMAIL_FROM);
}

let transporter: Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" } : undefined,
    });
  }
  return transporter;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function htmlBody(subject: string, text: string): string {
  const paragraphs = esc(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#F3F5F7;font-family:Arial,Helvetica,sans-serif;color:#252B32">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#10243A;padding:24px 32px;color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:2px">AHEM <span style="color:#D6A84B">CORPORATION</span></td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 20px;font-size:20px;color:#10243A">${esc(subject)}</h1>${paragraphs}</td></tr>
<tr><td style="padding:20px 32px;background:#F3F5F7;font-size:12px;color:#6b7280">This is an automated message from the Ahem Corporation website · ${esc(SITE_URL)}</td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Sends an email through SMTP and records the outcome in the email log.
 * Never throws: when SMTP is not configured the message is logged as "not_configured"
 * so nothing is silently lost and the admin can see exactly what would have been sent.
 */
export async function sendEmail(msg: { to: string; subject: string; text: string; reference?: string }): Promise<EmailResult> {
  let status: EmailResult = "not_configured";
  let error = "";
  if (smtpConfigured()) {
    try {
      await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        html: htmlBody(msg.subject, msg.text),
      });
      status = "sent";
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message.slice(0, 500) : "Unknown SMTP error";
      console.error("[email] send failed", error);
    }
  }
  try {
    await db.insert(emailLog).values({
      recipient: msg.to,
      subject: msg.subject,
      body: msg.text.slice(0, 8000),
      status,
      error,
      reference: msg.reference || "",
    });
  } catch (e) {
    console.error("[email] failed to write email log", e);
  }
  return status;
}

/** Creates an in-app admin notification and emails the configured recipients. */
export async function notifyAdmins(n: {
  type: string;
  title: string;
  body: string;
  link: string;
  reference?: string;
  recipients?: string;
  emailEnabled?: boolean;
}) {
  try {
    await db.insert(notifications).values({ type: n.type, title: n.title, body: n.body.slice(0, 500), link: n.link });
  } catch (e) {
    console.error("[notify] failed to create notification", e);
  }
  if (n.emailEnabled === false) return;
  const list = (n.recipients || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s))
    .slice(0, 10);
  for (const to of list) {
    await sendEmail({
      to,
      subject: n.title,
      text: `${n.body}\n\nOpen in the admin dashboard:\n${SITE_URL}${n.link}`,
      reference: n.reference,
    });
  }
}
