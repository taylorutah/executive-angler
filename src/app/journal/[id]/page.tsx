import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { FishingSession, SessionRig, Catch } from "@/types/fishing-log";
import { CalendarIcon, MapPinIcon, ThermometerIcon, CloudIcon, DropletIcon, ArrowLeftIcon, PencilIcon } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Session ${id.slice(0, 8)} | Fishing Journal | Executive Angler`,
    description: "Fishing session details, catches, and rig setup.",
  };
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/journal");
  }

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  // Fetch rigs
  const { data: rigs } = await supabase
    .from("session_rigs")
    .select("*, fly_pattern:fly_patterns(*)")
    .eq("session_id", id)
    .order("position", { ascending: true });

  // Fetch catches
  const { data: catches } = await supabase
    .from("catches")
    .select("*, fly_pattern:fly_patterns(*)")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  const sessionData = session as FishingSession;
  const rigsData = (rigs || []) as SessionRig[];
  const catchesData = (catches || []) as Catch[];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest-dark text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-sm text-cream hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Journal
            </Link>

            <Link
              href={`/journal/${sessionData.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Entry
            </Link>
          </div>

          <h1 className="mt-4 font-heading text-4xl font-bold">
            {sessionData.river_name || "Fishing Session"}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-cream">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{new Date(sessionData.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}</span>
            </div>

            {sessionData.total_fish > 0 && (
              <div className="rounded-full bg-river px-4 py-1 text-sm font-medium text-white">
                {sessionData.total_fish} {sessionData.total_fish === 1 ? "fish" : "fish"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Conditions */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-semibold text-forest-dark">Conditions</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {sessionData.weather && (
              <div className="flex items-center gap-3">
                <CloudIcon className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Weather</p>
                  <p className="font-medium text-slate-900">{sessionData.weather}</p>
                </div>
              </div>
            )}

            {sessionData.water_temp_f !== undefined && sessionData.water_temp_f !== null && (
              <div className="flex items-center gap-3">
                <ThermometerIcon className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Water Temp</p>
                  <p className="font-medium text-slate-900">{sessionData.water_temp_f}°F</p>
                </div>
              </div>
            )}

            {sessionData.water_clarity && (
              <div className="flex items-center gap-3">
                <DropletIcon className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Water Clarity</p>
                  <p className="font-medium text-slate-900">{sessionData.water_clarity}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rig Setup */}
        {rigsData.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-forest-dark">Rig Setup</h2>

            <div className="mt-4 space-y-3">
              {rigsData.map((rig: SessionRig) => (
                <div key={rig.id} className="flex items-center gap-4 rounded-md bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
                    {rig.position}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {rig.fly_pattern?.name || rig.fly_name || "Unknown Fly"}
                    </p>
                    {rig.fly_pattern && (
                      <div className="mt-1 flex gap-2 text-xs text-slate-600">
                        {rig.fly_pattern.type && <span>{rig.fly_pattern.type}</span>}
                        {rig.fly_pattern.size && <span>• Size {rig.fly_pattern.size}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catches */}
        {catchesData.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-forest-dark">
              Fish Caught ({catchesData.length})
            </h2>

            <div className="mt-4 space-y-4">
              {catchesData.map((catchItem: Catch) => (
                <div key={catchItem.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {catchItem.species || "Unknown Species"}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                        {catchItem.length_inches !== undefined &&
                          catchItem.length_inches !== null && (
                            <span>Length: {catchItem.length_inches}"</span>
                          )}

                        {catchItem.time && (
                          <span>Time: {catchItem.time}</span>
                        )}

                        {(catchItem.fly_pattern?.name || catchItem.fly_name) && (
                          <span className="rounded-md bg-forest/10 px-2 py-1 font-medium text-forest">
                            {catchItem.fly_pattern?.name || catchItem.fly_name}
                          </span>
                        )}
                      </div>

                      {catchItem.notes && (
                        <p className="mt-2 text-sm text-slate-700">{catchItem.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {sessionData.notes && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-forest-dark">Notes</h2>
            <p className="mt-4 whitespace-pre-wrap text-slate-700">{sessionData.notes}</p>
          </div>
        )}

        {/* Tags */}
        {sessionData.tags && sessionData.tags.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2">
              {sessionData.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-full bg-forest/10 px-4 py-2 text-sm font-medium text-forest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
