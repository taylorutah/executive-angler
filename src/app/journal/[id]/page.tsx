import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import SessionDetail from "./SessionDetail";

// Never cache — always fetch fresh data from Supabase
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: "Session | Executive Angler", description: `Fishing session ${id.slice(0, 8)}` };
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/journal");

  // Allow viewing if user owns it OR session is public.
  // RLS already enforces this at the row level, so no extra filter is
  // needed — but we fetch the row and then check ownership to render
  // the right edit/share affordances in SessionDetail.
  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !session) notFound();

  const isOwner = session.user_id === user.id;
  if (!isOwner && session.privacy !== "public") {
    // Belt & suspenders: RLS would have already filtered, but if anything
    // ever slips through, 404 rather than leak private data.
    notFound();
  }

  const { data: catches } = await supabase
    .from("catches")
    .select("*, fly_pattern:fly_patterns(name, type, image_url)")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  // Flies used in this session (from fly_patterns table, matched by catch)
  const flyPatternIds = (catches || [])
    .map((c: { fly_pattern_id?: string }) => c.fly_pattern_id)
    .filter(Boolean);

  const { data: flies } = flyPatternIds.length > 0
    ? await supabase.from("fly_patterns").select("id, name, type, image_url").in("id", flyPatternIds)
    : { data: [] };

  const { data: sessionPhotos } = await supabase
    .from("session_photos")
    .select("id, url, caption, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return (
    <SessionDetail
      session={session}
      catches={(catches || []) as Parameters<typeof SessionDetail>[0]["catches"]}
      flies={(flies || []) as Parameters<typeof SessionDetail>[0]["flies"]}
      sessionPhotos={sessionPhotos ?? []}
      isOwner={isOwner}
    />
  );
}
