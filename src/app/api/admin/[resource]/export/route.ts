import { listRows, toCsv } from "@/lib/admin-crud";
import { apiUser, audit } from "@/lib/auth";
import { jsonError } from "@/lib/security";

/** CSV export (UTF-8 with BOM, opens directly in Excel) of the current filtered view. */
export async function GET(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  try {
    const user = await apiUser(req, "dashboard");
    const { resource } = await ctx.params;
    const { rows } = await listRows(resource, user, new URL(req.url).searchParams, true);
    await audit({ user, action: "export", entity: resource, summary: `Exported ${rows.length} record(s) to CSV`, req });
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ahem-${resource}-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
