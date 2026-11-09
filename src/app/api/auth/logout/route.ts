import { audit, destroySession, getUser } from "@/lib/auth";
import { assertSameOrigin, jsonError } from "@/lib/security";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await getUser();
    await destroySession();
    if (user) await audit({ user, action: "logout", entity: "auth", summary: "Signed out", req });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
