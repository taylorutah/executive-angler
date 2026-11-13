import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import UsersClient from "./UsersClient";

export const metadata = { title: "User Management — Admin" };
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

  const PROFILE_COLUMNS =
    "user_id, username, display_name, avatar_url, is_banned, ban_reason, banned_at, banned_by, created_at, home_state, home_location, last_login_at, last_login_country, last_login_region, last_login_city";

  type ProfileRow = {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_banned: boolean | null;
    ban_reason: string | null;
    banned_at: string | null;
    banned_by: string | null;
    created_at: string;
    home_state: string | null;
    home_location: string | null;
    last_login_at: string | null;
    last_login_country: string | null;
    last_login_region: string | null;
    last_login_city: string | null;
    last_active_at?: string | null;
  };

  let profiles: ProfileRow[] | null = null;
  const withLastActive = await supabase
    .from("profiles")
    .select(`${PROFILE_COLUMNS}, last_active_at`)
    .order("created_at", { ascending: false })
    .limit(500);

  // last_active_at ships in 20261112_profiles_last_active.sql. Until that
  // migration is applied, fall back so the users list still renders.
  if (withLastActive.error && /last_active_at/i.test(withLastActive.error.message ?? "")) {
    const fallback = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500);
    profiles = (fallback.data ?? []) as ProfileRow[];
  } else {
    profiles = (withLastActive.data ?? []) as ProfileRow[];
  }

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
      .from("fly_box_entries_v3")
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

  // auth.users for email + last_sign_in_at + signup provider + confirmation
  const emailMap: Record<string, string> = {};
  const lastSignInMap: Record<string, string | null> = {};
  const providerMap: Record<string, string> = {};
  const emailConfirmedMap: Record<string, boolean> = {};
  if (admin) {
    // listUsers is paginated — grab up to 2000 (4 pages × 500)
    for (let page = 1; page <= 4; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 500 });
      const users = data?.users ?? [];
      users.forEach((u) => {
        emailMap[u.id] = u.email || "";
        lastSignInMap[u.id] = u.last_sign_in_at ?? null;
        // Prefer the identities array (most accurate) and fall back to app_metadata.
        const identityProvider = u.identities?.[0]?.provider;
        providerMap[u.id] =
          (identityProvider as string) ||
          ((u.app_metadata as { provider?: string })?.provider) ||
          "email";
        emailConfirmedMap[u.id] = !!u.email_confirmed_at;
      });
      if (users.length < 500) break;
    }
  }

  function greatestIso(...values: (string | null | undefined)[]): string | null {
    let best: string | null = null;
    let bestMs = 0;
    for (const v of values) {
      if (!v) continue;
      const ms = new Date(v).getTime();
      if (Number.isFinite(ms) && ms > bestMs) {
        bestMs = ms;
        best = v;
      }
    }
    return best;
  }

  const enriched = (profiles || []).map((p) => {
    const profileLastActive = (p as { last_active_at?: string | null }).last_active_at ?? null;
    const lastSignIn = lastSignInMap[p.user_id] ?? null;
  return {
    ...p,
    email: emailMap[p.user_id] || null,
    last_sign_in_at: lastSignIn,
    last_active_at: profileLastActive,
    last_active_effective: greatestIso(profileLastActive, lastSignIn),
    last_session_at: lastSessionMap[p.user_id] ?? null,
    session_count: sessionCountMap[p.user_id] || 0,
    catch_count: catchCountMap[p.user_id] || 0,
    fly_box_count: flyBoxCountMap[p.user_id] || 0,
    photo_count: photoCountMap[p.user_id] || 0,
    review_count: reviewCountMap[p.user_id] || 0,
    active_promo: promoMap[p.user_id] ?? null,
    provider: providerMap[p.user_id] || "email",
    email_confirmed: emailConfirmedMap[p.user_id] ?? false,
  };
  });

  return <UsersClient users={enriched} adminId={user.id} adminEmail={user.email || ""} />;
}
