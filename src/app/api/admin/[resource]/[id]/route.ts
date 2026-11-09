import { deleteRow, getRow, updateRow } from "@/lib/admin-crud";
import { apiUser } from "@/lib/auth";
import { jsonError } from "@/lib/security";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const user = await apiUser(req, "dashboard");
    const { resource, id } = await ctx.params;
    const { row, ctx: r } = await getRow(resource, user, id);
    for (const h of r.def.hidden ?? []) delete row[h];
    return Response.json({ row });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await apiUser(req, "dashboard");
    const { resource, id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return Response.json({ row: await updateRow(resource, user, id, body, req) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const user = await apiUser(req, "dashboard");
    const { resource, id } = await ctx.params;
    await deleteRow(resource, user, id, req);
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
