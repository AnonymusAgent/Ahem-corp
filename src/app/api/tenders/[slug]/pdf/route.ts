import { getTender } from "@/lib/data";
import { tenderNoticePdf } from "@/lib/pdf";
import { ApiError, enforceRateLimit, jsonError } from "@/lib/security";

/** Downloadable tender notice (PDF) generated from the published tender record. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    await enforceRateLimit(req, "tender-pdf", 30, 60);
    const { slug } = await ctx.params;
    const tender = await getTender(slug);
    if (!tender) throw new ApiError(404, "Tender not found.");
    const pdf = await tenderNoticePdf(tender);
    const name = `Tender-${tender.reference.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
    return new Response(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
