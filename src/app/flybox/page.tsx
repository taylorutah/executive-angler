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
import FlyboxEmpty from "./FlyboxEmpty";

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
      {boxes.length === 0 ? (
        <div className="px-4 py-8 sm:px-6">
          <h1 className="font-heading text-4xl text-[var(--text-primary)]">Fly box</h1>
          <FlyboxEmpty />
        </div>
      ) : (
        <BoxesManager
          initialBoxes={boxes}
          initialStats={boxStats}
          initialTierDefinitions={tierDefinitions}
        />
      )}
    </FliesShell>
  );
}
