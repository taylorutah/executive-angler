import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Old bookmarks and interim chrome ("Today" → /dashboard) land here. */
export default function DashboardPage() {
  permanentRedirect("/today");
}
