import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

/**
 * GET /api/reviews?entityType=lodge&entityId=<uuid>
 * Public — returns all reviews for an entity, most recent first.
 */
export async function GET(req: NextRequest) {
  const entityType = req.nextUrl.searchParams.get("entityType");
  const entityId = req.nextUrl.searchParams.get("entityId");
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Resolve display names from angler_profiles
  const userIds = [...new Set((reviews ?? []).map((r: Record<string, unknown>) => r.user_id as string))];
  let profileMap: Record<string, { display_name: string; avatar_url?: string }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("angler_profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);
    if (profiles) {
      for (const p of profiles) {
        profileMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
      }
    }
  }

  const enriched = (reviews ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    author_name: profileMap[r.user_id as string]?.display_name || "Angler",
    author_avatar: profileMap[r.user_id as string]?.avatar_url || null,
  }));

  return NextResponse.json(enriched);
}

/**
 * POST /api/reviews
 * Auth required. Body: { entityType, entityId, rating, title?, body, visitDate? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { entityType, entityId, rating, title, body: reviewBody, visitDate } = body;

  if (!entityType || !entityId || !rating || !reviewBody) {
    return NextResponse.json({ error: "entityType, entityId, rating, and body required" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  // Check for existing review by this user on this entity
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this. Edit your existing review instead." }, { status: 409 });
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      rating: Number(rating),
      title: title || null,
      body: reviewBody,
      visit_date: visitDate || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(review, { status: 201 });
}

/**
 * PUT /api/reviews?id=<uuid>
 * Auth required — update own review.
 */
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();
  const { rating, title, body: reviewBody, visitDate } = body;

  const update: Record<string, unknown> = {};
  if (rating !== undefined) update.rating = Number(rating);
  if (title !== undefined) update.title = title || null;
  if (reviewBody !== undefined) update.body = reviewBody;
  if (visitDate !== undefined) update.visit_date = visitDate || null;

  const { data: review, error } = await supabase
    .from("reviews")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(review);
}

/**
 * DELETE /api/reviews?id=<uuid>
 * Auth required — delete own review.
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
