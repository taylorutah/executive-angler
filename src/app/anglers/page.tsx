import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

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
    .not("username", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

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
            <p className="mt-2 text-sm">Get the app and set your username to appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {anglers.map((a) => (
              <div key={a.user_id} className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8923A]/10 flex items-center justify-center shrink-0 text-lg font-bold text-[#E8923A]">
                  {String(a.username?.charAt(0) ?? "A").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F0F6FC]">{a.display_name || a.username}</p>
                  {a.home_location && (
                    <p className="text-xs text-[#8B949E] mt-0.5">{a.home_location}</p>
                  )}
                  {a.bio && (
                    <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">{a.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
