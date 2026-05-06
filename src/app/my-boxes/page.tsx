/**
 * /my-boxes — index page showing the user's named, tier-grouped fly boxes.
 *
 * Tier sections render in this order (from the user's article):
 *   Tier 1 — Kill   (chest-worn, top confidence)
 *   Tier 2 — Support (pack/vest, variations)
 *   Tier 3 — Archive (truck/garage, modular inserts)
 *   Custom         (anything else)
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBoxes } from "@/lib/db/fly-boxes";
import MyBoxesClient from "./MyBoxesClient";

export const metadata = {
  title: "My Boxes — Executive Angler",
  description: "Your personal fly boxes, organized by tier.",
};

export default async function MyBoxesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-boxes");

  const boxes = await getMyBoxes(user.id);
  return <MyBoxesClient initialBoxes={boxes} />;
}
