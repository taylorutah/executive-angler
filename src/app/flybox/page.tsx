/**
 * /flybox — authenticated fly-box inventory.
 *
 * Canonical URL for the former /flies/boxes (and overlapping /my-boxes,
 * /my-flies, /flies/workspace, /flies/shared, /journal/flies surfaces).
 * Reuses BoxesManager; does not restyle the inventory UI.
 */
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listMyBoxes, listBoxStats } from "@/lib/db/fly-v2";
import { resolveTierDefinitions } from "@/lib/flies/tier-definitions";
import BoxesManager from "@/components/flies-v2/BoxesManager";
import FliesShell from "@/app/flies/_components/FliesShell";

export const metadata: Metadata = {
  title: "My Boxes",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function FlyboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/flybox");

  const [{ data: profile }, boxes] = await Promise.all([
    supabase
      .from("profiles")
      .select("ties_own_flies, tier_descriptions, tier_definitions")
      .eq("user_id", user.id)
      .maybeSingle(),
    listMyBoxes(),
  ]);
  const tiesOwnFlies = profile?.ties_own_flies !== false;
  const tierDefinitions = resolveTierDefinitions(
    profile?.tier_definitions,
    profile?.tier_descriptions as Record<string, string> | null,
  );
  const boxStats = await listBoxStats(boxes.map((b) => b.id));

  return (
    <FliesShell
      active="boxes"
      counts={{ boxes: boxes.length }}
      showWorkbench={tiesOwnFlies}
    >
      <BoxesManager
        initialBoxes={boxes}
        initialStats={boxStats}
        initialTierDefinitions={tierDefinitions}
      />
    </FliesShell>
  );
}
