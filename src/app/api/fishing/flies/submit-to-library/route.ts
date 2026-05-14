import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { checkSubmissionGate, logSubmission } from "@/lib/submission-gate";
import { mapTypeToCategory, promoteToCanonical } from "@/lib/flies/promote-canonical";

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

/**
 * Submit an existing personal fly_patterns row to the canonical library.
 * Used by the "Submit to library" button on /anglers/[username]/flies/[slug].
 *
 * Admin path → directly promote to canonical_flies.
 * User path → snapshot into fly_pattern_submissions with status='pending';
 *             admin reviews at /admin/flies/submissions.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    pattern_id?: string;
    turnstile_token?: string;
    website?: string; // honeypot
    notes_to_reviewer?: string;
  };
  const patternId = body.pattern_id;
  if (!patternId) return NextResponse.json({ error: "Missing pattern_id" }, { status: 400 });

  // Confirm ownership before snapshotting. Reads v2 (legacy fly_patterns is
  // gone post 2026-05-14 drop). Aggregates per-variant sizes/colors from
  // fly_variants since v2 hoisted those off the pattern level.
  const { data: patternV2, error: pErr } = await supabase
    .from("fly_patterns_v2")
    .select(
      "id, name, category, description, video_url, hero_image_url, promoted_to_canonical_id, owner_user_id, inspired_by_fly_id"
    )
    .eq("id", patternId)
    .eq("owner_user_id", user.id)
    .single();
  if (pErr || !patternV2) {
    return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  }
  const { data: variants } = await supabase
    .from("fly_variants")
    .select("size, body_color, bead_color")
    .eq("pattern_id", patternId);
  const sizesFromVariants = Array.from(
    new Set((variants ?? []).map((v) => v.size as string).filter(Boolean))
  );
  const colorsFromVariants = Array.from(
    new Set((variants ?? []).map((v) => v.body_color as string | null).filter((c): c is string => !!c))
  );
  const beadColorsFromVariants = Array.from(
    new Set((variants ?? []).map((v) => v.bead_color as string | null).filter((c): c is string => !!c))
  );
  const p: Record<string, unknown> = {
    id: patternV2.id,
    name: patternV2.name,
    type: patternV2.category, // category is the v2 vocabulary; promote helper maps it back
    size: sizesFromVariants.join(","),
    fly_color: colorsFromVariants.length ? colorsFromVariants : null,
    bead_color: beadColorsFromVariants.length ? beadColorsFromVariants : null,
    materials: null, // v2 stores materials per-variant or in base_materials JSONB — not surfaced here
    description: patternV2.description,
    video_url: patternV2.video_url,
    image_url: patternV2.hero_image_url,
    parent_canonical_id: patternV2.inspired_by_fly_id,
    promoted_to_canonical_id: patternV2.promoted_to_canonical_id,
    user_id: patternV2.owner_user_id,
  };

  if (p.promoted_to_canonical_id) {
    return NextResponse.json(
      { error: "This pattern is already in the library." },
      { status: 409 }
    );
  }

  // Admin path: promote directly without going through the queue.
  if (isAdmin(user.email)) {
    const result = await promoteToCanonical(service(), {
      sourcePatternId: patternId,
      proposed: {
        name: String(p.name ?? ""),
        type: (p.type as string | null) ?? null,
        description: (p.description as string | null) ?? null,
        materials: (p.materials as string | null) ?? null,
        videoUrl: (p.video_url as string | null) ?? null,
        heroImageUrl: (p.image_url as string | null) ?? null,
        sizes:
          typeof p.size === "string" && p.size
            ? (p.size as string).split(",").map((s) => s.trim()).filter(Boolean)
            : null,
        colors: Array.isArray(p.fly_color) ? (p.fly_color as string[]) : null,
        beadOptions: Array.isArray(p.bead_color) ? (p.bead_color as string[]) : null,
        parentCanonicalId: (p.parent_canonical_id as string | null) ?? null,
      },
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, canonical_id: result.canonicalId });
  }

  // User path: gate, then enqueue submission.
  const gate = await checkSubmissionGate({
    type: "fly_pattern",
    user,
    turnstileToken: body.turnstile_token ?? null,
    honeypot: body.website ?? null,
    request: req,
  });
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  // Already-submitted check: don't double-enqueue while a pending one exists.
  const { data: existing } = await service()
    .from("fly_pattern_submissions")
    .select("id, status")
    .eq("source_pattern_id", patternId)
    .in("status", ["pending", "needs_info"])
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "This pattern already has a pending submission." },
      { status: 409 }
    );
  }

  const submissionPayload = {
    user_id: user.id,
    source_pattern_id: patternId,
    parent_canonical_id: (p.parent_canonical_id as string | null) ?? null,
    name: String(p.name ?? ""),
    category: mapTypeToCategory((p.type as string | null) ?? null),
    description: (p.description as string | null) ?? null,
    materials_list: (p.materials as string | null) ?? null,
    video_url: (p.video_url as string | null) ?? null,
    hero_image_url: (p.image_url as string | null) ?? null,
    sizes:
      typeof p.size === "string" && p.size
        ? (p.size as string).split(",").map((s) => s.trim()).filter(Boolean)
        : null,
    colors: Array.isArray(p.fly_color) ? (p.fly_color as string[]) : null,
    bead_options: Array.isArray(p.bead_color) ? (p.bead_color as string[]) : null,
    notes_to_reviewer: body.notes_to_reviewer ?? null,
    status: "pending" as const,
  };

  const { error: insertErr } = await service()
    .from("fly_pattern_submissions")
    .insert(submissionPayload as never);
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  await logSubmission("fly_pattern", user.id, gate.ipHash);

  return NextResponse.json({ ok: true, status: "pending" });
}
