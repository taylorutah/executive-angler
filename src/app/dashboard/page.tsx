import { redirect } from "next/navigation";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

export const dynamic = "force-dynamic";

/** `/dashboard` is the old stats grid. The briefing lives at `/today`. */
export default function DashboardPage() {
  redirect(POST_LOGIN_PATH);
}
