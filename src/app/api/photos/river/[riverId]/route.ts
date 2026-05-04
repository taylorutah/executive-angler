import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBannedUserIds } from "@/lib/db/banned-users";

/**
 * Public river photo gallery — opt-in submissions only.
 *
 * Privacy overhaul: catch photos joined from `catches` are no longer
 * exposed here. Catch photos are owner-only (live on the journal/session
 * page). The river page surfaces only photos that anglers explicitly
 * submitted via the photo_submissions flow.
 */

export type RiverPhoto = {
  id: string;
  type: "submission";
  photoUrl: string;
  caption?: string;
  submitterName?: string;
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

  const { data: submissions } = await submissionsQuery
    .order("submitted_at", { ascending: false })
    .limit(50);

  const photos: RiverPhoto[] = (submissions || []).map((s) => ({
    id: s.id,
    type: "submission" as const,
    photoUrl: s.photo_url,
    caption: s.caption || undefined,
    submitterName: s.submitter_name || undefined,
    submittedAt: s.submitted_at,
  }));

  return NextResponse.json({ photos });
}
