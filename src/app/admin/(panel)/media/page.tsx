import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  await requireUser("media");
  return <MediaLibrary />;
}
