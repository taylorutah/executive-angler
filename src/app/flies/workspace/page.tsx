/**
 * /flies/workspace — the new Flies Workspace, behind a feature flag.
 *
 * Phase 1 scope: render the unified data set (configs + created-by-me) as a
 * simple grid using the default "All my flies" virtual view. No filter UI,
 * no view switcher, no saved-view CRUD yet — those are Phase 2.
 *
 * Goal of Phase 1: prove the query layer feeds a real page, validate the
 * persistent sub-nav with Boxes/Workbench/Tie Next/Shared, and ship behind
 * a flag so we can iterate without touching the live Patterns tab.
 *
 * Feature flag: NEXT_PUBLIC_FLIES_WORKSPACE=1 (env var or local dev override).
 *   - When unset/0: redirect to /flies?tab=patterns so accidental URL visits
 *     don't dead-end on an empty page in prod.
 *   - When 1: render the workspace.
 *
 * iOS contract: this page is web-only. iOS continues hitting its existing
 * data paths.
 */
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listFlyWorkspaceRows } from "@/lib/db/fly-workspace";
import { getVirtualView } from "@/lib/flies/workspace-shared";
import WorkspaceClient from "./WorkspaceClient";

export const metadata: Metadata = {
  title: "Flies Workspace",
  description: "Your unified fly collection — search, filter, and switch views in one place.",
};

export const dynamic = "force-dynamic";

const FEATURE_FLAG_ON = process.env.NEXT_PUBLIC_FLIES_WORKSPACE === "1";

type SearchParams = {
  view?: string;
  source?: string;
  cat?: string;
  box?: string;
  tag?: string;
  search?: string;
  sort?: string;
  display?: string;
};

export default async function FlyWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (!FEATURE_FLAG_ON) {
    // Soft fall-back to the existing hub. We don't 404 because the flag may
    // flip on for a single user via cookie in a future iteration.
    redirect("/flies?tab=patterns");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/flies/workspace");
  }

  const params = await searchParams;
  const viewId = params.view ?? "all";

  // For Phase 1 we only resolve virtual views. Saved views land in Phase 2
  // once the `user_fly_views` table is in place.
  const view = getVirtualView(viewId);
  if (!view) {
    notFound();
  }

  // Merge URL params over the view's defaults. URL wins so users can tweak
  // a saved view in-place without losing the diff.
  const filter = {
    ...view.filter,
    source:
      params.source === "custom" || params.source === "canonical"
        ? params.source
        : view.filter.source,
    categories: params.cat?.split(",").filter(Boolean) ?? view.filter.categories,
    box_ids: params.box?.split(",").filter(Boolean) ?? view.filter.box_ids,
    tags: (params.tag?.split(",").filter(Boolean) ??
      view.filter.tags) as typeof view.filter.tags,
    search: params.search ?? view.filter.search,
  };

  // For Phase 1, always sort + display the view's defaults. URL overrides
  // for sort/display are wired in Phase 2.
  const rows = await listFlyWorkspaceRows(filter, view.sort);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <WorkspaceClient
      rows={rows}
      activeViewId={view.id}
      viewerUserId={user.id}
      viewerUsername={(profile?.username as string | undefined) ?? null}
    />
  );
}
