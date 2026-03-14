"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import GearPicker from "@/components/gear/GearPicker";

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rivers, setRivers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [gearRodId, setGearRodId] = useState<string | null>(null);
  const [gearReelId, setGearReelId] = useState<string | null>(null);
  const [gearLineId, setGearLineId] = useState<string | null>(null);
  const [gearLeaderId, setGearLeaderId] = useState<string | null>(null);
  const [gearTippetId, setGearTippetId] = useState<string | null>(null);

  // Fetch autocomplete data + gear defaults
  useEffect(() => {
    Promise.all([
      fetch("/api/fishing/session?autocomplete=rivers").then((r) => r.json()),
      fetch("/api/fishing/session?autocomplete=locations").then((r) => r.json()),
      fetch("/api/gear/defaults").then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([riversData, locationsData, defaults]) => {
        setRivers(riversData || []);
        setLocations(locationsData || []);
        if (defaults) {
          if (defaults.rod) setGearRodId(defaults.rod);
          if (defaults.reel) setGearReelId(defaults.reel);
          if (defaults.line) setGearLineId(defaults.line);
          if (defaults.leader) setGearLeaderId(defaults.leader);
          if (defaults.tippet) setGearTippetId(defaults.tippet);
        }
      })
      .catch((err) => console.error("Failed to fetch autocomplete data:", err));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") || undefined,
      date: formData.get("sessionDate"),
      river_name: formData.get("river"),
      location: formData.get("location"),
      water_temp_f: formData.get("waterTemp") || undefined,
      water_clarity: formData.get("waterClarity") || undefined,
      weather: formData.get("weather") || undefined,
      flies_notes: formData.get("fliesNotes") || undefined,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      notes: formData.get("notes") || undefined,
      gear_rod_id: gearRodId || undefined,
      gear_reel_id: gearReelId || undefined,
      gear_line_id: gearLineId || undefined,
      gear_leader_id: gearLeaderId || undefined,
      gear_tippet_id: gearTippetId || undefined,
    };

    try {
      const res = await fetch("/api/fishing/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const result = await res.json();
      router.push(`/journal/${result.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-[#E8923A] hover:text-[#E8923A] mb-6 text-sm font-medium"
        >
          ← Back to Journal
        </Link>

        <h1 className="text-4xl font-heading font-bold text-[#E8923A] mb-8">
          Log New Session
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="sessionDate"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Date
            </label>
            <input
              type="date"
              id="sessionDate"
              name="sessionDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* River */}
          <div>
            <label
              htmlFor="river"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              River
            </label>
            <input
              type="text"
              id="river"
              name="river"
              list="rivers"
              required
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
            <datalist id="rivers">
              {rivers.map((river) => (
                <option key={river} value={river} />
              ))}
            </datalist>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              list="locations"
              required
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
            <datalist id="locations">
              {locations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Water Temp */}
          <div>
            <label
              htmlFor="waterTemp"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Water Temp (optional)
            </label>
            <input
              type="text"
              id="waterTemp"
              name="waterTemp"
              placeholder="e.g. 52°F"
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* Water Clarity */}
          <div>
            <label
              htmlFor="waterClarity"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Water Clarity (optional)
            </label>
            <select
              id="waterClarity"
              name="waterClarity"
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            >
              <option value="">Select...</option>
              <option value="Clear">Clear</option>
              <option value="Slightly Cloudy">Slightly Cloudy</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Murky">Murky</option>
            </select>
          </div>

          {/* Weather */}
          <div>
            <label
              htmlFor="weather"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Weather (optional)
            </label>
            <input
              type="text"
              id="weather"
              name="weather"
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* Flies Notes */}
          <div>
            <label
              htmlFor="fliesNotes"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Flies Notes (optional)
            </label>
            <textarea
              id="fliesNotes"
              name="fliesNotes"
              rows={3}
              placeholder="Rig notes, setup..."
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Tags (optional)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="utah, provo, spring"
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-[#E8923A] mb-2"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={6}
              className="w-full px-4 py-3 border border-[#21262D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8923A]"
            />
          </div>

          {/* Gear */}
          <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-5">
            <h2 className="text-sm font-bold text-[#E8923A] mb-4 flex items-center gap-2">
              🎣 Gear
              <span className="text-xs font-normal text-[#484F58] normal-case">Pre-filled from your defaults</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GearPicker type="rod" label="Rod" value={gearRodId} onChange={setGearRodId} />
              <GearPicker type="reel" label="Reel" value={gearReelId} onChange={setGearReelId} />
              <GearPicker type="line" label="Line" value={gearLineId} onChange={setGearLineId} />
              <GearPicker type="leader" label="Leader" value={gearLeaderId} onChange={setGearLeaderId} />
              <GearPicker type="tippet" label="Tippet" value={gearTippetId} onChange={setGearTippetId} />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8923A] text-white font-medium py-4 px-6 rounded-lg hover:bg-[#0D1117] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? "Saving..." : "Save Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
