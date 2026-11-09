import { db } from "@/db";
import { leadActivities, leads } from "@/db/schema";
import { ensureDb } from "@/lib/bootstrap";
import { notifyAdmins, sendEmail } from "@/lib/email";
import { cleanText, LEAD_CORE_FIELDS, leadFormBySlug, validateForm } from "@/lib/forms";
import { ApiError, assertSameOrigin, enforceRateLimit, jsonError } from "@/lib/security";
import { getSettings } from "@/lib/settings";
import { saveUploads } from "@/lib/storage";
import { makeReference } from "@/lib/reference";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await ensureDb();
    await enforceRateLimit(req, "lead", 8, 600);
    if (Number(req.headers.get("content-length") || 0) > 60 * 1024 * 1024) throw new ApiError(413, "The upload is too large.");
    const form = await req.formData();
    // Honeypot: real visitors never see or fill this field.
    if (cleanText(form.get("fax_number"))) return Response.json({ ok: true, reference: "RECEIVED", emailSent: false });

    const config = leadFormBySlug(String(form.get("type") || ""));
    if (!config) throw new ApiError(400, "Unknown form type.");
    const raw: Record<string, unknown> = {};
    for (const f of config.fields) raw[f.name] = form.get(f.name);
    const { errors, values } = validateForm(config.fields, raw);
    if (Object.keys(errors).length) throw new ApiError(422, "Please correct the highlighted fields.", errors);

    const uploads = config.attachments ? form.getAll("attachments").filter((f): f is File => typeof f === "object" && f !== null) : [];
    const attachments = await saveUploads(uploads, "lead", 5);

    const details: Record<string, string> = {};
    for (const f of config.fields) {
      if (!LEAD_CORE_FIELDS.includes(f.name) && f.name !== "consent" && values[f.name]) details[f.name] = values[f.name]!;
    }
    const reference = makeReference(config.code);
    const [lead] = await db
      .insert(leads)
      .values({
        reference,
        type: config.type,
        name: values.name || "",
        organization: values.organization || "",
        designation: values.designation || "",
        email: values.email || "",
        phone: values.phone || "",
        sector: values.sector || "",
        subject: values.subject || config.short,
        message: values.message || "",
        details,
        attachments,
        source: cleanText(form.get("source")).slice(0, 200),
      })
      .returning({ id: leads.id });
    await db.insert(leadActivities).values({
      leadId: lead!.id,
      actor: "Website",
      action: "Submission received",
      note: attachments.length ? `${attachments.length} attachment(s) uploaded.` : "",
    });

    const s = await getSettings();
    const who = [values.name, values.organization].filter(Boolean).join(", ");
    const enabled =
      config.type === "tender_invitation"
        ? s.email.notifyTender
        : ["project_requirement", "quotation", "proposal"].includes(config.type)
          ? s.email.notifyProject
          : s.email.notifyContact;
    await notifyAdmins({
      type: config.type,
      title: `New ${config.short.toLowerCase()}: ${values.subject || who}`,
      body: `Reference: ${reference}\nFrom: ${who}\nEmail: ${values.email}${values.phone ? `\nPhone: ${values.phone}` : ""}\n\n${(values.message || "").slice(0, 600)}`,
      link: `/admin/leads/${lead!.id}`,
      reference,
      recipients: s.email.notifyEmails,
      emailEnabled: enabled,
    });

    let emailSent = false;
    if (s.email.sendConfirmations && values.email) {
      const result = await sendEmail({
        to: values.email,
        subject: `We have received your ${config.short.toLowerCase()} — ${reference}`,
        text: `Dear ${values.name || "Sir / Madam"},\n\nThank you for contacting ${s.general.companyName}. Your ${config.short.toLowerCase()} has been received and registered under reference ${reference}.\n\nOur team will review it and respond to you. Please quote the reference number in any follow-up correspondence.\n\n${config.type === "tender_invitation" ? "Your invitation and any attached documents are treated as confidential and are accessible only to our tender desk.\n\n" : ""}Regards,\n${s.general.companyName}`,
        reference,
      });
      emailSent = result === "sent";
    }
    return Response.json({ ok: true, reference, emailSent });
  } catch (e) {
    return jsonError(e);
  }
}
