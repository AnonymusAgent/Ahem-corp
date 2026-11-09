import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { ensureDb } from "@/lib/bootstrap";
import { notifyAdmins, sendEmail } from "@/lib/email";
import { APPLICATION_FIELDS, cleanText, validateForm } from "@/lib/forms";
import { ApiError, assertSameOrigin, enforceRateLimit, jsonError } from "@/lib/security";
import { getSettings } from "@/lib/settings";
import { todayISO } from "@/lib/site";
import { deleteFile, saveUpload } from "@/lib/storage";
import { makeReference } from "@/lib/reference";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await ensureDb();
    await enforceRateLimit(req, "application", 5, 600);
    if (Number(req.headers.get("content-length") || 0) > 8 * 1024 * 1024) throw new ApiError(413, "The upload is too large.");
    const form = await req.formData();
    if (cleanText(form.get("fax_number"))) return Response.json({ ok: true, reference: "RECEIVED", emailSent: false });

    const raw: Record<string, unknown> = {};
    for (const f of APPLICATION_FIELDS) raw[f.name] = form.get(f.name);
    const { errors, values } = validateForm(APPLICATION_FIELDS, raw);
    const resume = form.get("resume");
    const hasResume = typeof resume === "object" && resume !== null && resume.size > 0;
    if (!hasResume) errors.resume = "Please attach your CV (PDF or Word).";
    if (Object.keys(errors).length) throw new ApiError(422, "Please correct the highlighted fields.", errors);

    let jobId: number | null = null;
    let jobTitle = "General application";
    const requested = Number(form.get("jobId"));
    if (Number.isInteger(requested) && requested > 0) {
      const [job] = await db.select().from(jobs).where(and(eq(jobs.id, requested), eq(jobs.published, true))).limit(1);
      if (!job) throw new ApiError(404, "This vacancy is no longer available.");
      if (job.closingDate && job.closingDate < todayISO()) throw new ApiError(400, "Applications for this vacancy have closed.");
      jobId = job.id;
      jobTitle = job.title;
    }

    const file = await saveUpload(resume as File, "resume");
    const reference = makeReference("JA");
    let id: number;
    try {
      const [row] = await db
        .insert(applications)
        .values({
          reference,
          jobId,
          jobTitle,
          name: values.name!,
          email: values.email!,
          phone: values.phone || "",
          location: values.location || "",
          currentRole: values.currentRole || "",
          experienceYears: values.experienceYears || "",
          coverLetter: values.coverLetter || "",
          resume: file,
        })
        .returning({ id: applications.id });
      id = row!.id;
    } catch (e) {
      await deleteFile(file.id);
      throw e;
    }

    const s = await getSettings();
    await notifyAdmins({
      type: "application",
      title: `New job application: ${jobTitle}`,
      body: `Reference: ${reference}\nApplicant: ${values.name}\nEmail: ${values.email}\nExperience: ${values.experienceYears} years`,
      link: `/admin/applications?q=${reference}`,
      reference,
      recipients: s.email.notifyEmails,
      emailEnabled: s.email.notifyCareers,
    });
    void id;
    let emailSent = false;
    if (s.email.sendConfirmations) {
      const result = await sendEmail({
        to: values.email!,
        subject: `Application received — ${jobTitle} (${reference})`,
        text: `Dear ${values.name},\n\nThank you for applying to ${s.general.companyName} for the position of ${jobTitle}. Your application has been registered under reference ${reference}.\n\nOur HR team will review your application and contact shortlisted candidates.\n\nRegards,\n${s.general.companyName}`,
        reference,
      });
      emailSent = result === "sent";
    }
    return Response.json({ ok: true, reference, emailSent });
  } catch (e) {
    return jsonError(e);
  }
}
