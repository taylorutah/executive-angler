import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Crown } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Anglers — Executive Angler",
  description: "Discover fly anglers and follow their sessions.",
};

export const revalidate = 300;

export default async function AnglersPage() {
  const supabase = await createClient();

  const { data: anglers } = await supabase
    .from("angler_profiles")
    .select("user_id, username, display_name, home_location, bio, avatar_url")
    .or("is_private.is.null,is_private.eq.false")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch active crowns for all anglers (expires_at > now or null)
  const anglerUserIds = (anglers || []).map((a) => a.user_id);
  const { data: allCrowns } = anglerUserIds.length > 0
    ? await supabase
        .from("user_awards")
        .select("user_id, award_key, river_name, metadata, expires_at")
        .in("user_id", anglerUserIds)
        .eq("award_type", "river_milestone")
        .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    : { data: [] };

  type AwardRow = { user_id: string; award_key: string; river_name: string | null; metadata: Record<string, unknown>; expires_at: string | null };
  const crownsByUser = new Map<string, AwardRow[]>();
  (allCrowns || []).forEach((c) => {
    const row = c as AwardRow;
    if (!crownsByUser.has(row.user_id)) crownsByUser.set(row.user_id, []);
    crownsByUser.get(row.user_id)!.push(row);
  });

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-bold text-[#F0F6FC]">Anglers</h1>
          <p className="text-[#8B949E] mt-2">Discover fly anglers and follow their sessions.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {(!anglers || anglers.length === 0) ? (
          <div className="text-center py-16 text-[#484F58]">
            <p>No public angler profiles yet.</p>
            <p className="mt-2 text-sm">Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {anglers.map((a) => {
              const crowns = crownsByUser.get(a.user_id) || [];
              const initials = String((a.display_name || a.username || "A").charAt(0)).toUpperCase();
              return (
                <div key={a.user_id} className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {a.avatar_url ? (
                      <Image
                        src={a.avatar_url}
                        alt={a.display_name || a.username || "Angler"}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-lg font-bold text-[#E8923A]">{initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#F0F6FC]">{a.display_name || a.username}</p>
                      {crowns.slice(0, 3).map((c) => (
                        <span key={c.award_key + c.river_name} title={`${(c.metadata as { display_name?: string })?.display_name ?? c.award_key}${c.river_name ? ` — ${c.river_name}` : ""}`}>
                          <span className="text-sm">{(c.metadata as { badge_icon?: string })?.badge_icon ?? "🏆"}</span>
                        </span>
                      ))}
                      {crowns.length > 3 && (
                        <span className="text-[10px] text-[#484F58]">+{crowns.length - 3}</span>
                      )}
                    </div>
                    {a.username && (
                      <p className="text-xs text-[#484F58] mt-0.5">@{a.username}</p>
                    )}
                    {a.home_location && (
                      <p className="text-xs text-[#8B949E] mt-0.5">{a.home_location}</p>
                    )}
                    {a.bio && (
                      <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">{a.bio}</p>
                    )}
                    {crowns.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Crown className="h-3 w-3 text-[#E8923A]" />
                        <span className="text-[10px] text-[#484F58]">{crowns.length} award{crowns.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
