import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import SessionDetail from "./SessionDetail";

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

  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) notFound();

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
    />
  );
}
