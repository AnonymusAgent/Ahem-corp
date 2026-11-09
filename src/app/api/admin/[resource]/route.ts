import { createRow, listRows } from "@/lib/admin-crud";
import { apiUser } from "@/lib/auth";
import { jsonError } from "@/lib/security";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const user = await apiUser(req, "dashboard");
    const { resource } = await ctx.params;
    const { rows, total, page, pageSize, sort, dir } = await listRows(resource, user, new URL(req.url).searchParams);
    return Response.json({ rows, total, page, pageSize, sort, dir });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await apiUser(req, "dashboard");
    const { resource } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const row = await createRow(resource, user, body, req);
    return Response.json({ row }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
