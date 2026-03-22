import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import UsersClient from "./UsersClient";

export const metadata = { title: "User Management — Admin — Executive Angler" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_url, is_premium, is_banned, ban_reason, premium_granted_by, premium_granted_at, banned_at, banned_by, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  // Get session counts per user
  const { data: sessionRows } = await supabase
    .from("fishing_sessions")
    .select("user_id")
    .limit(10000);

  const sessionCountMap: Record<string, number> = {};
  (sessionRows || []).forEach((s: { user_id: string }) => {
    sessionCountMap[s.user_id] = (sessionCountMap[s.user_id] || 0) + 1;
  });

  // Get catch counts
  const { data: catchRows } = await supabase
    .from("catches")
    .select("user_id")
    .limit(10000);

  const catchCountMap: Record<string, number> = {};
  (catchRows || []).forEach((c: { user_id: string }) => {
    catchCountMap[c.user_id] = (catchCountMap[c.user_id] || 0) + 1;
  });

  const enriched = (profiles || []).map(p => ({
    ...p,
    session_count: sessionCountMap[p.user_id] || 0,
    catch_count: catchCountMap[p.user_id] || 0,
  }));

  return <UsersClient users={enriched} adminId={user.id} adminEmail={user.email || ""} />;
}
