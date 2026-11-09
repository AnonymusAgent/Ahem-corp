import { apiUser, audit } from "@/lib/auth";
import { ApiError, jsonError } from "@/lib/security";
import { saveSettingsGroup, SETTINGS_SCHEMA } from "@/lib/settings";

export async function PUT(req: Request) {
  try {
    const user = await apiUser(req, "settings");
    const body = (await req.json().catch(() => ({}))) as { group?: string; values?: Record<string, unknown> };
    const schema = SETTINGS_SCHEMA.find((g) => g.group === body.group);
    if (!schema || !body.values || typeof body.values !== "object") throw new ApiError(400, "Unknown settings group.");
    await saveSettingsGroup(schema.group, body.values);
    await audit({ user, action: "update", entity: "settings", entityId: schema.group, summary: `Updated ${schema.label} settings`, req });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
