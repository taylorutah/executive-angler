import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import UsersClient from "./UsersClient";

export const metadata: Metadata = {
  title: "User Management — Admin — Executive Angler",
  description: "Manage users, view profiles, and check account status.",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  // Fetch all profiles with session counts
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url, email_notify_follows, created_at")
    .order("created_at", { ascending: false });

  // Get session counts per user
  const { data: sessionCounts } = await supabase
    .from("fishing_sessions")
    .select("user_id");

  const userSessionMap: Record<string, number> = {};
  (sessionCounts || []).forEach(s => {
    userSessionMap[s.user_id] = (userSessionMap[s.user_id] || 0) + 1;
  });

  // Get catch counts per user
  const { data: catchCounts } = await supabase
    .from("catches")
    .select("user_id");

  const userCatchMap: Record<string, number> = {};
  (catchCounts || []).forEach(c => {
    userCatchMap[c.user_id] = (userCatchMap[c.user_id] || 0) + 1;
  });

  // Get fly pattern counts per user
  const { data: flyCounts } = await supabase
    .from("fly_patterns")
    .select("user_id");

  const userFlyMap: Record<string, number> = {};
  (flyCounts || []).forEach(f => {
    userFlyMap[f.user_id] = (userFlyMap[f.user_id] || 0) + 1;
  });

  // Get last session date per user
  const { data: lastSessions } = await supabase
    .from("fishing_sessions")
    .select("user_id, date")
    .order("date", { ascending: false });

  const lastSessionMap: Record<string, string> = {};
  (lastSessions || []).forEach(s => {
    if (!lastSessionMap[s.user_id]) lastSessionMap[s.user_id] = s.date;
  });

  const users = (profiles || []).map(p => ({
    userId: p.user_id,
    username: p.username,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    createdAt: p.created_at,
    sessions: userSessionMap[p.user_id] || 0,
    catches: userCatchMap[p.user_id] || 0,
    flies: userFlyMap[p.user_id] || 0,
    lastSession: lastSessionMap[p.user_id] || null,
  }));

  return <UsersClient users={users} />;
}
