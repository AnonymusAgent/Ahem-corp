"use client";

import { APPLICATION_FIELDS } from "@/lib/forms";
import { PublicForm } from "./Forms";

export function ApplicationForm({ jobId }: { jobId?: number }) {
  return (
    <PublicForm
      endpoint="/api/applications"
      fields={APPLICATION_FIELDS}
      hidden={{ jobId: jobId ? String(jobId) : "" }}
      submitLabel="Submit application"
      successTitle="Application received"
      file={{ name: "resume", label: "CV / résumé", help: "PDF or Word document · up to 5 MB", accept: ".pdf,.doc,.docx", required: true, maxMb: 5, maxFiles: 1 }}
    />
  );
}
