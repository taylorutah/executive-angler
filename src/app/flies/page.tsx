/**
 * /flies — root of the authenticated flies hub.
 *
 * Logged-in users: redirect to the appropriate sibling route.
 *   - default / no params       → /flies/workspace
 *   - ?tab=patterns             → /flies/workspace  (legacy alias)
 *   - ?tab=boxes                → /flies/boxes
 *   - ?tab=workbench            → /flies/workbench
 *   - ?tab=tie-next             → /flies/tie-next
 *   - ?tab=shared               → /flies/shared
 *
 * Logged-out users: redirect to /flies/library (public canonical catalog).
 */
import { permanentRedirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = { tab?: string; [k: string]: string | undefined };

const TAB_TO_ROUTE: Record<string, string> = {
  patterns: "/flies/workspace",
  workspace: "/flies/workspace",
  boxes: "/flies/boxes",
  workbench: "/flies/workbench",
  "tie-next": "/flies/tie-next",
  shared: "/flies/shared",
};

export default async function FliesHubRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) permanentRedirect("/flies/library");

  const sp = await searchParams;
  const target = TAB_TO_ROUTE[sp.tab ?? ""] ?? "/flies/workspace";

  // Forward any non-tab params (clone, view, sort, etc.) onto the
  // destination so deep links keep working.
  const carry = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "tab" || v === undefined) continue;
    carry.set(k, v);
  }
  const qs = carry.toString();
  permanentRedirect(qs ? `${target}?${qs}` : target);
}
