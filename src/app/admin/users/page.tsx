import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import UsersClient from "./UsersClient";

export const metadata = { title: "User Management — Admin — Executive Angler" };
export const dynamic = "force-dynamic";

function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const admin = getAdminSupabase();

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "user_id, username, display_name, avatar_url, is_premium, is_banned, ban_reason, premium_granted_by, premium_granted_at, banned_at, banned_by, created_at, home_state, home_location, last_login_at, last_login_country, last_login_region, last_login_city"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  // Sessions: count + most recent date per user (engagement signal)
  const sessionCountMap: Record<string, number> = {};
  const lastSessionMap: Record<string, string> = {};
  if (admin) {
    const { data: sessionRows } = await admin
      .from("fishing_sessions")
      .select("user_id, date")
      .order("date", { ascending: false })
      .limit(20000);
    (sessionRows || []).forEach((s: { user_id: string; date: string | null }) => {
      sessionCountMap[s.user_id] = (sessionCountMap[s.user_id] || 0) + 1;
      if (s.date && !lastSessionMap[s.user_id]) {
        lastSessionMap[s.user_id] = s.date;
      }
    });
  }

  const catchCountMap: Record<string, number> = {};
  if (admin) {
    const { data: catchRows } = await admin
      .from("catches")
      .select("user_id")
      .limit(20000);
    (catchRows || []).forEach((c: { user_id: string }) => {
      catchCountMap[c.user_id] = (catchCountMap[c.user_id] || 0) + 1;
    });
  }

  // Fly box counts — uses service role to bypass RLS across users
  const flyBoxCountMap: Record<string, number> = {};
  if (admin) {
    const { data: flyRows } = await admin
      .from("user_fly_box")
      .select("user_id")
      .limit(20000);
    (flyRows || []).forEach((f: { user_id: string }) => {
      flyBoxCountMap[f.user_id] = (flyBoxCountMap[f.user_id] || 0) + 1;
    });
  }

  // Community photos approved (public contribution signal)
  const photoCountMap: Record<string, number> = {};
  if (admin) {
    const { data: photoRows } = await admin
      .from("photo_submissions")
      .select("user_id")
      .eq("status", "approved")
      .not("user_id", "is", null)
      .limit(20000);
    (photoRows || []).forEach((p: { user_id: string }) => {
      photoCountMap[p.user_id] = (photoCountMap[p.user_id] || 0) + 1;
    });
  }

  // Reviews written (power-user signal)
  const reviewCountMap: Record<string, number> = {};
  if (admin) {
    const { data: reviewRows } = await admin
      .from("reviews")
      .select("user_id")
      .limit(20000);
    (reviewRows || []).forEach((r: { user_id: string }) => {
      reviewCountMap[r.user_id] = (reviewCountMap[r.user_id] || 0) + 1;
    });
  }

  // Active promo entitlements (who claimed REDDIT30 etc.)
  const promoMap: Record<string, { code: string; until: string }> = {};
  if (admin) {
    const { data: promoRows } = await admin
      .from("subscriptions")
      .select("user_id, external_id, current_period_end")
      .eq("source", "promo")
      .eq("status", "active");
    (promoRows || []).forEach(
      (p: { user_id: string; external_id: string | null; current_period_end: string | null }) => {
        if (p.current_period_end) {
          promoMap[p.user_id] = {
            code: p.external_id || "—",
            until: p.current_period_end,
          };
        }
      }
    );
  }

  // auth.users for email + last_sign_in_at
  const emailMap: Record<string, string> = {};
  const lastSignInMap: Record<string, string | null> = {};
  if (admin) {
    // listUsers is paginated — grab up to 2000 (4 pages × 500)
    for (let page = 1; page <= 4; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 500 });
      const users = data?.users ?? [];
      users.forEach((u) => {
        emailMap[u.id] = u.email || "";
        lastSignInMap[u.id] = u.last_sign_in_at ?? null;
      });
      if (users.length < 500) break;
    }
  }

  const enriched = (profiles || []).map((p) => ({
    ...p,
    email: emailMap[p.user_id] || null,
    last_sign_in_at: lastSignInMap[p.user_id] ?? null,
    last_session_at: lastSessionMap[p.user_id] ?? null,
    session_count: sessionCountMap[p.user_id] || 0,
    catch_count: catchCountMap[p.user_id] || 0,
    fly_box_count: flyBoxCountMap[p.user_id] || 0,
    photo_count: photoCountMap[p.user_id] || 0,
    review_count: reviewCountMap[p.user_id] || 0,
    active_promo: promoMap[p.user_id] ?? null,
  }));

  return <UsersClient users={enriched} adminId={user.id} adminEmail={user.email || ""} />;
}
