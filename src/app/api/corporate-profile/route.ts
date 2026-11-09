import { getServices } from "@/lib/data";
import { corporateProfilePdf } from "@/lib/pdf";
import { enforceRateLimit, jsonError } from "@/lib/security";
import { getSettings } from "@/lib/settings";
import { readFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Corporate profile download: the uploaded official PDF when present, otherwise a PDF generated from live site content. */
export async function GET(req: Request) {
  try {
    await enforceRateLimit(req, "profile-pdf", 20, 60);
    const s = await getSettings();
    const headers = {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Ahem-Corporation-Corporate-Profile.pdf"',
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    };
    if (s.profile.file?.id) {
      const uploaded = await readFile(s.profile.file.id);
      if (uploaded) return new Response(uploaded.data as unknown as BodyInit, { headers });
    }
    const pdf = await corporateProfilePdf(s, await getServices());
    return new Response(pdf as unknown as BodyInit, { headers });
  } catch (e) {
    return jsonError(e);
  }
}
