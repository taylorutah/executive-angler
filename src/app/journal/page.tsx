import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FishingSession, SessionRig } from "@/types/fishing-log";
import { JournalClient } from "./JournalClient";

export const metadata: Metadata = {
  title: "My Fishing Journal | Executive Angler",
  description: "Your personal fishing log with sessions, catches, and river reports.",
};

export default async function JournalPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/journal");
  }

  // Fetch user's fishing sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
  }

  // Fetch all rigs for these sessions
  const sessionIds = sessions?.map((s) => s.id) || [];
  const { data: rigs, error: rigsError } = await supabase
    .from("session_rigs")
    .select("*, fly_pattern:fly_patterns(*)")
    .in("session_id", sessionIds)
    .order("position", { ascending: true });

  if (rigsError) {
    console.error("Error fetching rigs:", rigsError);
  }

  const sessionsData = (sessions || []) as FishingSession[];
  const rigsData = (rigs || []) as SessionRig[];

  return <JournalClient sessions={sessionsData} rigs={rigsData} />;
}
