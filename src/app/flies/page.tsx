/**
 * /flies — public Water Desk plate (Figma 76:3).
 *
 * Logged-in hub tabs still redirect:
 *   - ?tab=patterns|workspace|boxes|shared → /flybox
 *   - ?tab=workbench → /flies/workbench
 *   - ?tab=tie-next → /flies/tie-next
 *
 * No tab: The plate. The bench index is /flies/library.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import FliesDeskPage from "./FliesDeskPage";

export const metadata: Metadata = {
  title: brandedTitle("The plate — flies on the water this week"),
  description:
    "Twelve patterns on the water this week. The bench is every fly we keep. Not a catalog.",
  alternates: { canonical: `${SITE_URL}/flies` },
};

export const dynamic = "force-dynamic";

type SearchParams = { tab?: string; [k: string]: string | undefined };

const TAB_TO_ROUTE: Record<string, string> = {
  patterns: "/flybox",
  workspace: "/flybox",
  boxes: "/flybox",
  workbench: "/flies/workbench",
  "tie-next": "/flies/tie-next",
  shared: "/flybox",
};

export default async function FliesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tabTarget = TAB_TO_ROUTE[sp.tab ?? ""];
  if (tabTarget) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/login?redirect=${encodeURIComponent(`/flies?tab=${sp.tab}`)}`);
    }

    const carry = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "tab" || v === undefined) continue;
      carry.set(k, v);
    }
    const qs = carry.toString();
    redirect(qs ? `${tabTarget}?${qs}` : tabTarget);
  }

  return <FliesDeskPage />;
}
