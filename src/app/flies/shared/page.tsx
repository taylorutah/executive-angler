/**
 * /flies/shared — flies shared with the viewer (was /flies?tab=shared).
 *
 * The shared-fly model isn't fully migrated post-2026-05-15 reset, so this
 * page renders the SharedPanel's empty state. Keeping the route in place
 * preserves the nav slot and lets a future incoming-share rollout land
 * without touching the sub-nav.
 */
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SharedPanel from "../tabs/SharedPanel";
import FliesShell from "../_components/FliesShell";

export const metadata: Metadata = { title: "Shared Flies" };
export const dynamic = "force-dynamic";

export default async function FliesSharedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/flies/shared");

  const { data: profile } = await supabase
    .from("profiles")
    .select("ties_own_flies")
    .eq("user_id", user.id)
    .maybeSingle();
  const tiesOwnFlies = profile?.ties_own_flies !== false;

  return (
    <FliesShell active="shared" counts={{ shared: 0 }} showWorkbench={tiesOwnFlies}>
      <SharedPanel shared={[]} ownerUsernames={{}} />
    </FliesShell>
  );
}
