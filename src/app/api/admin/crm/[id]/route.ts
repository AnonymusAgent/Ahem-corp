import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { leadActivities, leads, users } from "@/db/schema";
import { getRow } from "@/lib/admin-crud";
import { apiUser, audit } from "@/lib/auth";
import { cleanText } from "@/lib/forms";
import { ApiError, jsonError } from "@/lib/security";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/site";

/** CRM actions on a lead: change status, assign an owner, add a note. Each action is appended to the activity history. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(req, "leads");
    const { id: rawId } = await ctx.params;
    const { row, id } = await getRow("leads", user, rawId);
    const leadId = id as number;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const acts: { action: string; note: string }[] = [];
    const set: Partial<typeof leads.$inferInsert> = {};

    if (typeof body.status === "string" && body.status !== row.status) {
      if (!(LEAD_STATUSES as readonly string[]).includes(body.status)) throw new ApiError(400, "Unknown status.");
      set.status = body.status;
      acts.push({
        action: `Status changed to ${LEAD_STATUS_LABELS[body.status as LeadStatus]}`,
        note: `Previously ${LEAD_STATUS_LABELS[row.status as LeadStatus] ?? row.status}.`,
      });
    }
    if ("assignedTo" in body) {
      const target = body.assignedTo === null || body.assignedTo === "" ? null : Number(body.assignedTo);
      if (target !== (row.assignedTo ?? null)) {
        if (target === null) {
          set.assignedTo = null;
          acts.push({ action: "Unassigned", note: "" });
        } else {
          const [assignee] = await db.select().from(users).where(and(eq(users.id, target), eq(users.active, true))).limit(1);
          if (!assignee) throw new ApiError(400, "Unknown user.");
          set.assignedTo = assignee.id;
          acts.push({ action: `Assigned to ${assignee.name}`, note: "" });
        }
      }
    }
    const note = cleanText(body.note, true).slice(0, 2000);
    if (note) acts.push({ action: "Note added", note });
    if (!acts.length) throw new ApiError(400, "Nothing to update.");

    await db.transaction(async (tx) => {
      await tx.update(leads).set({ ...set, updatedAt: new Date() }).where(eq(leads.id, leadId));
      await tx.insert(leadActivities).values(acts.map((a) => ({ leadId, userId: user.id, actor: user.name, ...a })));
    });
    await audit({ user, action: "update", entity: "leads", entityId: String(row.reference), summary: acts.map((a) => a.action).join("; "), req });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
