/**
 * /flies/tie-next — tie-next kanban (was /flies?tab=tie-next).
 */
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listMyConfigurationsWithFly } from "@/lib/db/fly-model";
import TieNextHub from "@/components/flies-v3/TieNextHub";
import FliesShell from "../_components/FliesShell";

export const metadata: Metadata = { title: "Tie Next" };
export const dynamic = "force-dynamic";

export default async function FliesTieNextPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/flies/tie-next");

  const [{ data: profile }, configurations] = await Promise.all([
    supabase
      .from("profiles")
      .select("ties_own_flies")
      .eq("user_id", user.id)
      .maybeSingle(),
    listMyConfigurationsWithFly({ tieNextOnly: true }),
  ]);
  const tiesOwnFlies = profile?.ties_own_flies !== false;

  const activeCount = configurations.filter(
    (c) =>
      c.tie_next_status === "wanted" || c.tie_next_status === "at_vise",
  ).length;

  return (
    <FliesShell
      active="tie-next"
      counts={{ tieNext: activeCount }}
      showWorkbench={tiesOwnFlies}
    >
      <TieNextHub configurations={configurations} />
    </FliesShell>
  );
}
