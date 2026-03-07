import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FishingSession } from "@/types/fishing-log";
import { CalendarIcon, MapPinIcon, FishIcon } from "lucide-react";

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
  const { data: sessions, error } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
  }

  // Calculate summary stats
  const totalSessions = sessions?.length || 0;
  const totalFish = sessions?.reduce((sum, s) => sum + (s.total_fish || 0), 0) || 0;
  const riversFished = new Set(sessions?.map((s) => s.river_name).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest-dark text-white">
        <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <h1 className="font-heading text-5xl font-bold">My Fishing Journal</h1>
          <p className="mt-4 text-xl text-cream">
            Track your fishing sessions, catches, and river reports
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-forest/10 p-3">
                <CalendarIcon className="h-6 w-6 text-forest" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Sessions</p>
                <p className="text-3xl font-bold text-forest">{totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-river/10 p-3">
                <FishIcon className="h-6 w-6 text-river" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Fish</p>
                <p className="text-3xl font-bold text-river">{totalFish}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-3">
                <MapPinIcon className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Rivers Fished</p>
                <p className="text-3xl font-bold text-gold">{riversFished}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="mt-12">
          <h2 className="font-heading text-3xl font-bold text-forest-dark">Recent Sessions</h2>

          {!sessions || sessions.length === 0 ? (
            <div className="mt-6 rounded-lg bg-white p-12 text-center shadow-sm">
              <FishIcon className="mx-auto h-16 w-16 text-slate-300" />
              <h3 className="mt-4 font-heading text-xl font-semibold text-slate-700">
                No sessions yet
              </h3>
              <p className="mt-2 text-slate-600">
                Your fishing sessions from Notion will appear here once imported.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {sessions.map((session: FishingSession) => (
                <Link
                  key={session.id}
                  href={`/journal/${session.id}`}
                  className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-heading text-2xl font-semibold text-forest-dark">
                          {session.river_name || "Unknown River"}
                        </h3>
                        {session.total_fish > 0 && (
                          <span className="rounded-full bg-river/10 px-3 py-1 text-sm font-medium text-river">
                            {session.total_fish} {session.total_fish === 1 ? "fish" : "fish"}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                        </div>

                        {session.weather && (
                          <span className="rounded-md bg-slate-100 px-2 py-1">
                            {session.weather}
                          </span>
                        )}

                        {session.water_temp_f !== undefined &&
                          session.water_temp_f !== null && (
                            <span className="rounded-md bg-slate-100 px-2 py-1">
                              {session.water_temp_f}°F
                            </span>
                          )}

                        {session.water_clarity && (
                          <span className="rounded-md bg-slate-100 px-2 py-1">
                            {session.water_clarity}
                          </span>
                        )}
                      </div>

                      {session.flies_notes && (
                        <div className="mt-3 text-sm text-slate-700">
                          <span className="font-medium">Flies:</span> {session.flies_notes}
                        </div>
                      )}

                      {session.tags && session.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {session.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
