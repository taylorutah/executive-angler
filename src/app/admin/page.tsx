import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin Dashboard — Executive Angler",
  description: "Admin metrics and management.",
};

const ADMIN_EMAILS = ["taylor@executiveangler.com", "taylorwarnick@gmail.com"];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) redirect("/dashboard");

  // Total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Total sessions
  const { count: totalSessions } = await supabase
    .from("fishing_sessions")
    .select("*", { count: "exact", head: true });

  // Total catches
  const { count: totalCatches } = await supabase
    .from("catches")
    .select("*", { count: "exact", head: true });

  // Total fly patterns
  const { count: totalFlies } = await supabase
    .from("fly_patterns")
    .select("*", { count: "exact", head: true });

  // Sessions in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const { count: sessionsLast7d } = await supabase
    .from("fishing_sessions")
    .select("*", { count: "exact", head: true })
    .gte("date", sevenDaysAgo);

  // Users who signed up in last 7 days
  const sevenDaysAgoISO = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count: newUsersLast7d } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgoISO);

  // Top 10 rivers by session count
  const { data: riverStats } = await supabase
    .from("fishing_sessions")
    .select("river_name")
    .not("river_name", "is", null);

  const riverCounts: Record<string, number> = {};
  (riverStats || []).forEach(s => {
    if (s.river_name) riverCounts[s.river_name] = (riverCounts[s.river_name] || 0) + 1;
  });
  const topRivers = Object.entries(riverCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Recent sessions (last 10)
  const { data: recentSessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, user_id, profiles(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  // Active follows count
  const { count: totalFollows } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <AdminClient
      metrics={{
        totalUsers: totalUsers ?? 0,
        totalSessions: totalSessions ?? 0,
        totalCatches: totalCatches ?? 0,
        totalFlies: totalFlies ?? 0,
        totalFollows: totalFollows ?? 0,
        sessionsLast7d: sessionsLast7d ?? 0,
        newUsersLast7d: newUsersLast7d ?? 0,
      }}
      topRivers={topRivers}
      recentSessions={(recentSessions || []) as any}
    />
  );
}
