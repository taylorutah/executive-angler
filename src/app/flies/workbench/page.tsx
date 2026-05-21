/**
 * /flies/workbench — embedded tying workbench (was /flies?tab=workbench).
 *
 * Wraps the existing WorkbenchClient (which also drives the standalone
 * /journal/flies/workbench page) in the shared FliesShell. WorkbenchClient
 * accepts `embedded` so it skips its own header when rendered here.
 */
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import WorkbenchClient from "@/app/journal/flies/workbench/WorkbenchClient";
import FliesShell from "../_components/FliesShell";

export const metadata: Metadata = { title: "Workbench" };
export const dynamic = "force-dynamic";

export default async function FliesWorkbenchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/flies/workbench");

  const { data: profile } = await supabase
    .from("profiles")
    .select("ties_own_flies")
    .eq("user_id", user.id)
    .maybeSingle();
  const tiesOwnFlies = profile?.ties_own_flies !== false;
  // Users who flagged themselves as non-tiers can still access the page
  // directly, but we hide the chip in the sub-nav.

  return (
    <FliesShell active="workbench" showWorkbench={tiesOwnFlies || true}>
      <WorkbenchClient embedded viewerIsAdmin={isAdmin(user.email)} />
    </FliesShell>
  );
}
