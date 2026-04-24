import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBannedUserIds } from "@/lib/db/banned-users";

export type RiverPhoto = {
  id: string;
  type: "submission" | "catch";
  photoUrl: string;
  caption?: string;
  species?: string;
  lengthInches?: number;
  submitterName?: string;
  username?: string;
  submittedAt: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;
  const supabase = await createClient();
  const bannedUserIds = await getBannedUserIds();
  const bannedFilter =
    bannedUserIds.length > 0 ? `(${bannedUserIds.join(",")})` : null;

  // Community submissions — legacy uploads with a NULL user_id stay visible.
  let submissionsQuery = supabase
    .from("photo_submissions")
    .select("id, photo_url, caption, submitter_name, submitted_at")
    .eq("entity_type", "river")
    .eq("entity_id", riverId)
    .eq("status", "approved");

  if (bannedFilter) {
    submissionsQuery = submissionsQuery.or(
      `user_id.is.null,user_id.not.in.${bannedFilter}`
    );
  }

  const { data: submissions } = await submissionsQuery.order("submitted_at", {
    ascending: false,
  });

  // App catches (public sessions only) — filter through the embedded session
  // join so banned users' catches drop from the list.
  let catchesQuery = supabase
    .from("catches")
    .select(`
      id,
      fish_image_url,
      species,
      length_inches,
      created_at,
      fishing_sessions!inner(river_id, privacy, user_id),
      profiles(username)
    `)
    .eq("fishing_sessions.river_id", riverId)
    .eq("fishing_sessions.privacy", "public")
    .not("fish_image_url", "is", null);

  if (bannedFilter) {
    catchesQuery = catchesQuery.not(
      "fishing_sessions.user_id",
      "in",
      bannedFilter
    );
  }

  const { data: catches } = await catchesQuery
    .order("created_at", { ascending: false })
    .limit(50);

  const photos: RiverPhoto[] = [
    ...(submissions || []).map((s) => ({
      id: s.id,
      type: "submission" as const,
      photoUrl: s.photo_url,
      caption: s.caption || undefined,
      submitterName: s.submitter_name || undefined,
      submittedAt: s.submitted_at,
    })),
    ...(catches || []).map((c: any) => ({
      id: c.id,
      type: "catch" as const,
      photoUrl: c.fish_image_url,
      species: c.species || undefined,
      lengthInches: c.length_inches ? Number(c.length_inches) : undefined,
      username: c.profiles?.username || undefined,
      submittedAt: c.created_at,
    })),
  ].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return NextResponse.json({ photos });
}
