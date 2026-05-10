import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { promoteToCanonical } from "@/lib/flies/promote-canonical";

let _service: ReturnType<typeof createServiceClient> | null = null;
function service() {
  if (!_service) {
    _service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _service;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status") ?? "pending";

  const { data, error } = await service()
    .from("fly_pattern_submissions")
    .select(
      "id, user_id, source_pattern_id, parent_canonical_id, name, category, description, tying_steps, materials_list, sizes, colors, bead_options, hero_image_url, video_url, status, admin_notes, reviewed_at, promoted_canonical_id, created_at"
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pull submitter display info in a second query (no FK relation declared).
  const userIds = Array.from(new Set((data ?? []).map((r) => (r as { user_id: string }).user_id)));
  let submitterMap: Record<string, { username: string | null; display_name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await service()
      .from("angler_profiles")
      .select("user_id, username, display_name")
      .in("user_id", userIds);
    submitterMap = Object.fromEntries(
      (profiles ?? []).map((p) => {
        const row = p as { user_id: string; username: string | null; display_name: string | null };
        return [row.user_id, { username: row.username, display_name: row.display_name }];
      })
    );
  }

  return NextResponse.json({
    submissions: (data ?? []).map((r) => {
      const row = r as { user_id: string } & Record<string, unknown>;
      return { ...row, submitter: submitterMap[row.user_id] ?? null };
    }),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    id?: string;
    action?: "approve" | "reject" | "needs_info";
    admin_notes?: string;
    // Allow admin to edit fields before approving (e.g. fix typo'd name).
    edits?: Record<string, unknown>;
  };
  const { id, action, admin_notes, edits } = body;
  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  const sb = service();
  const { data: subRow, error: fetchErr } = await sb
    .from("fly_pattern_submissions")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr || !subRow) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  const sub = subRow as Record<string, unknown>;

  if (sub.status !== "pending" && sub.status !== "needs_info") {
    return NextResponse.json(
      { error: `Submission is already ${sub.status}` },
      { status: 409 }
    );
  }

  if (action === "reject") {
    const { error } = await sb
      .from("fly_pattern_submissions")
      .update({
        status: "rejected",
        admin_notes: admin_notes ?? null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "needs_info") {
    const { error } = await sb
      .from("fly_pattern_submissions")
      .update({
        status: "needs_info",
        admin_notes: admin_notes ?? null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Approve: merge admin edits onto submission snapshot, promote to canonical,
  // mark submission approved.
  const merged = { ...sub, ...(edits ?? {}) } as Record<string, unknown>;

  const promoteResult = await promoteToCanonical(sb, {
    sourcePatternId: (sub.source_pattern_id as string | null) ?? null,
    proposed: {
      name: String(merged.name ?? ""),
      category: (merged.category as string | null) ?? null,
      description: (merged.description as string | null) ?? null,
      tagline: (merged.tagline as string | null) ?? null,
      history: (merged.history as string | null) ?? null,
      tyingOverview: (merged.tying_overview as string | null) ?? null,
      fishingTips: (merged.fishing_tips as string | null) ?? null,
      materialsList: merged.materials_list ?? null,
      tyingSteps: merged.tying_steps ?? null,
      videoUrl: (merged.video_url as string | null) ?? null,
      heroImageUrl: (merged.hero_image_url as string | null) ?? null,
      sizes: (merged.sizes as string[] | null) ?? null,
      colors: (merged.colors as string[] | null) ?? null,
      beadOptions: (merged.bead_options as string[] | null) ?? null,
      imitates: (merged.imitates as string[] | null) ?? null,
      effectiveSpecies: (merged.effective_species as string[] | null) ?? null,
      waterTypes: (merged.water_types as string[] | null) ?? null,
      originCredit: (merged.origin_credit as string | null) ?? null,
      parentCanonicalId: (sub.parent_canonical_id as string | null) ?? null,
    },
  });

  if (!promoteResult.ok) {
    return NextResponse.json({ error: promoteResult.error }, { status: 500 });
  }

  const { error: updateErr } = await sb
    .from("fly_pattern_submissions")
    .update({
      status: "approved",
      admin_notes: admin_notes ?? null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      promoted_canonical_id: promoteResult.canonicalId,
    } as never)
    .eq("id", id);

  if (updateErr) {
    // Canonical row was created. Submission status update failed — log and
    // return success with a warning so admin can see canonical_id.
    console.error("Submission status update failed after promote:", updateErr);
  }

  return NextResponse.json({ ok: true, canonical_id: promoteResult.canonicalId });
}
