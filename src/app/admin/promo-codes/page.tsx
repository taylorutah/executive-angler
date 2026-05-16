import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import PromoCodesClient from "./PromoCodesClient";

export const metadata = { title: "Promo Codes — Admin" };
export const dynamic = "force-dynamic";

function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface PromoCodeRow {
  id: string;
  code: string;
  campaign_source: string;
  max_redemptions: number;
  duration_days: number;
  active_from: string;
  active_until: string | null;
  created_at: string;
  total_redeemed: number;
  currently_active: number;
  remaining: number;
}

export interface PromoRedemptionRow {
  id: string;
  code: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  redeemed_at: string;
  premium_until: string;
  is_active: boolean;
}

export default async function AdminPromoCodesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const admin = getAdminSupabase();
  if (!admin) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] p-8">
        <p>Server misconfigured — SUPABASE_SERVICE_ROLE_KEY missing.</p>
      </div>
    );
  }

  const nowIso = new Date().toISOString();

  const { data: codes, error: codesErr } = await admin
    .from("promo_codes")
    .select(
      "id, code, campaign_source, max_redemptions, duration_days, active_from, active_until, created_at"
    )
    .order("created_at", { ascending: false });

  if (codesErr) {
    console.error("[admin/promo-codes] codes query:", codesErr.message);
  }

  const codeIds = (codes ?? []).map((c) => c.id);

  const { data: redemptions } = codeIds.length
    ? await admin
        .from("promo_redemptions")
        .select("id, code_id, user_id, redeemed_at, premium_until")
        .in("code_id", codeIds)
        .order("redeemed_at", { ascending: false })
    : { data: [] as Array<{
        id: string;
        code_id: string;
        user_id: string;
        redeemed_at: string;
        premium_until: string;
      }> };

  const redRows = redemptions ?? [];

  const profileIds = [...new Set(redRows.map((r) => r.user_id))];
  const profileMap = new Map<
    string,
    { display_name: string | null; username: string | null }
  >();
  if (profileIds.length) {
    const { data: profs } = await admin
      .from("profiles")
      .select("user_id, display_name, username")
      .in("user_id", profileIds);
    (profs ?? []).forEach((p) =>
      profileMap.set(p.user_id, {
        display_name: p.display_name,
        username: p.username,
      })
    );
  }

  const emailMap = new Map<string, string>();
  if (profileIds.length) {
    const { data: authList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const idSet = new Set(profileIds);
    (authList?.users ?? []).forEach((u) => {
      if (idSet.has(u.id)) emailMap.set(u.id, u.email || "");
    });
  }

  const rowsByCode = new Map<string, typeof redRows>();
  redRows.forEach((r) => {
    const list = rowsByCode.get(r.code_id) ?? [];
    list.push(r);
    rowsByCode.set(r.code_id, list);
  });

  const codeRows: PromoCodeRow[] = (codes ?? []).map((c) => {
    const rs = rowsByCode.get(c.id) ?? [];
    const active = rs.filter((r) => r.premium_until > nowIso).length;
    return {
      id: c.id,
      code: c.code,
      campaign_source: c.campaign_source,
      max_redemptions: c.max_redemptions,
      duration_days: c.duration_days,
      active_from: c.active_from,
      active_until: c.active_until,
      created_at: c.created_at,
      total_redeemed: rs.length,
      currently_active: active,
      remaining: Math.max(0, c.max_redemptions - rs.length),
    };
  });

  const codeById = new Map(codeRows.map((c) => [c.id, c.code]));
  const redemptionRows: PromoRedemptionRow[] = redRows.map((r) => {
    const prof = profileMap.get(r.user_id);
    return {
      id: r.id,
      code: codeById.get((r as unknown as { code_id: string }).code_id) ?? "—",
      user_id: r.user_id,
      display_name: prof?.display_name ?? null,
      username: prof?.username ?? null,
      email: emailMap.get(r.user_id) ?? null,
      redeemed_at: r.redeemed_at,
      premium_until: r.premium_until,
      is_active: r.premium_until > nowIso,
    };
  });

  return <PromoCodesClient codes={codeRows} redemptions={redemptionRows} />;
}
