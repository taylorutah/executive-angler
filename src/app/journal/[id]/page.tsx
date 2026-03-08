import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  CalendarIcon, MapPinIcon, ThermometerIcon, CloudIcon,
  DropletIcon, ArrowLeftIcon, PencilIcon, FishIcon, ClockIcon,
} from "lucide-react";
import SessionMap from "./SessionMap";

interface CatchRecord {
  id: string;
  species?: string;
  length_inches?: string;
  quantities?: number;
  fly_position?: string;
  fly_size?: string;
  bead_size?: string;
  time_caught?: string;
  fish_image_url?: string;
  fish_location_image_url?: string;
  fly_image_url?: string;
  fly_pattern?: { name?: string; type?: string } | null;
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Session | Fishing Journal | Executive Angler`,
    description: `Fishing session ${id.slice(0, 8)}`,
  };
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/journal");

  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) notFound();

  const { data: catches } = await supabase
    .from("catches")
    .select("*, fly_pattern:fly_patterns(name, type)")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  const catchList = (catches || []) as CatchRecord[];
  const totalFish = catchList.reduce((sum: number, c) => sum + (c.quantities || 1), 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest-dark text-white pt-20">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/journal" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
              <ArrowLeftIcon className="h-4 w-4" /> Back to Journal
            </Link>
            <Link href={`/journal/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
              <PencilIcon className="h-4 w-4" /> Edit Entry
            </Link>
          </div>

          <h1 className="mt-6 font-heading text-3xl sm:text-4xl font-bold">
            {session.title || session.river_name || "Fishing Session"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              {new Date(session.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            {session.location && (
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" />
                {session.river_name && session.river_name !== session.title ? `${session.river_name} — ` : ""}{session.location}
              </div>
            )}
            {totalFish > 0 && (
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 font-semibold text-emerald-300">
                🐟 {totalFish} {totalFish === 1 ? "fish" : "fish"}
              </span>
            )}
          </div>

          {(session.trip_tags || session.tags || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(session.trip_tags || session.tags || []).map((tag: string) => (
                <span key={tag} className="text-xs bg-white/10 rounded-full px-3 py-1 text-white/70">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">

        {/* Conditions */}
        {(session.weather || session.water_temp_f || session.water_clarity) && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-forest-dark mb-4">Conditions</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {session.weather && (
                <div className="flex items-center gap-3">
                  <CloudIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Weather</p>
                    <p className="font-medium text-slate-900">{session.weather}</p>
                  </div>
                </div>
              )}
              {session.water_temp_f && (
                <div className="flex items-center gap-3">
                  <ThermometerIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Water Temp</p>
                    <p className="font-medium text-slate-900">{session.water_temp_f}</p>
                  </div>
                </div>
              )}
              {session.water_clarity && (
                <div className="flex items-center gap-3">
                  <DropletIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Water Clarity</p>
                    <p className="font-medium text-slate-900">{session.water_clarity}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flies / Rig Notes */}
        {session.flies_notes && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-forest-dark mb-3">Rig Setup</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{session.flies_notes}</p>
          </div>
        )}

        {/* Catches */}
        {catchList.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-forest-dark mb-4">
              Fish Caught <span className="text-slate-400 font-normal text-base">({totalFish})</span>
            </h2>
            <div className="space-y-4">
              {catchList.map((c) => (
                <div key={c.id as string} className="rounded-lg border border-slate-100 overflow-hidden">
                  {/* Fish photo if present */}
                  {c.fish_image_url && (
                    <div className="relative h-48 sm:h-64 w-full">
                      <Image src={c.fish_image_url as string} alt="Fish" fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-lg">
                            {(c.species as string) || "Unknown Species"}
                          </span>
                          {c.length_inches && (
                            <span className="text-sm text-slate-500">{c.length_inches}&quot;</span>
                          )}
                          {(c.quantities as number) > 1 && (
                            <span className="text-xs bg-slate-100 rounded-full px-2 py-0.5 text-slate-600">×{c.quantities as number}</span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm">
                          {c.fly_position && (
                            <span className="bg-forest/10 text-forest rounded px-2 py-0.5 font-medium">{c.fly_position as string}</span>
                          )}
                          {(c.fly_pattern as {name?: string} | null)?.name && (
                            <span className="bg-amber-50 text-amber-800 rounded px-2 py-0.5">{(c.fly_pattern as {name: string}).name}</span>
                          )}
                          {c.fly_size && (
                            <span className="bg-slate-100 text-slate-700 rounded px-2 py-0.5">Size {c.fly_size as string}</span>
                          )}
                          {c.bead_size && (
                            <span className="bg-slate-100 text-slate-700 rounded px-2 py-0.5">{c.bead_size as string} bead</span>
                          )}
                          {c.time_caught && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <ClockIcon className="h-3.5 w-3.5" />{c.time_caught as string}
                            </span>
                          )}
                        </div>
                      </div>
                      <FishIcon className="h-6 w-6 text-slate-300 flex-shrink-0 mt-1" />
                    </div>
                    {/* Location photo */}
                    {c.fish_location_image_url && (
                      <div className="mt-3 relative h-36 w-full rounded-lg overflow-hidden">
                        <Image src={c.fish_location_image_url as string} alt="Location" fill className="object-cover" />
                        <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white rounded px-2 py-0.5">📍 Location</div>
                      </div>
                    )}
                    {/* Fly photo */}
                    {c.fly_image_url && (
                      <div className="mt-3 relative h-36 w-full rounded-lg overflow-hidden">
                        <Image src={c.fly_image_url as string} alt="Fly used" fill className="object-cover" />
                        <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white rounded px-2 py-0.5">🪰 Fly</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <SessionMap riverName={session.river_name} location={session.location} catches={catchList} />

        {/* Session Notes */}
        {session.notes && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-forest-dark mb-3">Session Notes</h2>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
