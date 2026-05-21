/**
 * /flies/workspace — the unified Flies Workspace, behind a feature flag.
 *
 * Phase 2: filter pills, sort menu, view switcher, URL state, saved-view
 * CRUD via /api/fishing/fly-views, four display modes (Grid · Table ·
 * Kanban · Group-by-box).
 *
 * Feature flag: NEXT_PUBLIC_FLIES_WORKSPACE=1. When off, redirects to the
 * legacy hub so prod is untouched.
 */
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listFlyWorkspaceRows, listSavedFlyViews } from "@/lib/db/fly-workspace";
import { listMyBoxes } from "@/lib/db/fly-v2";
import {
  getVirtualView,
  VIRTUAL_VIEWS,
} from "@/lib/flies/workspace-shared";
import { decodeWorkspaceParams } from "@/lib/flies/workspace-url";
import WorkspaceClient from "./WorkspaceClient";

export const metadata: Metadata = {
  title: "Flies Workspace",
  description:
    "Your unified fly collection — search, filter, sort, and switch views in one place.",
};

export const dynamic = "force-dynamic";

// Workspace is the canonical patterns experience as of Phase 6 cutover —
// no feature flag.

export default async function FlyWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/flies/workspace");
  }

  const params = await searchParams;
  const decoded = decodeWorkspaceParams(params);

  // Resolve the active view: virtual first, then saved.
  const savedViews = await listSavedFlyViews();
  const view =
    getVirtualView(decoded.viewId) ??
    savedViews.find((v) => v.id === decoded.viewId) ??
    getVirtualView("all")!;

  // URL params override the view's defaults so users can tweak in place.
  const filter = {
    ...view.filter,
    ...decoded.filter,
  };
  const sort = decoded.sort ?? view.sort;
  const display = decoded.display ?? view.view_type;

  // For "group-by-box" we need the user's boxes too.
  const [rows, boxes, profile] = await Promise.all([
    listFlyWorkspaceRows(filter, sort),
    listMyBoxes(),
    supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!view) notFound();

  const allViews = [...VIRTUAL_VIEWS, ...savedViews];

  return (
    <WorkspaceClient
      rows={rows}
      boxes={boxes.map((b) => ({ id: b.id, name: b.name }))}
      allViews={allViews}
      activeViewId={view.id}
      activeFilter={filter}
      activeSort={sort}
      activeDisplay={display}
      viewerUserId={user.id}
      viewerUsername={(profile.data?.username as string | undefined) ?? null}
    />
  );
}
