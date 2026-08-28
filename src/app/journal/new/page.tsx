"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import GearPicker from "@/components/gear/GearPicker";
import SessionPrivacyToggle, { SessionPrivacy } from "@/components/journal/SessionPrivacyToggle";
import PageHeader from "@/components/ui/PageHeader";

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
  const [riverOpen, setRiverOpen] = useState(false);
  const [riverFilter, setRiverFilter] = useState("");
  const [riverValue, setRiverValue] = useState("");
  const [privacy, setPrivacy] = useState<SessionPrivacy>("private");

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
      privacy,
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
    <div className="min-h-screen bg-[var(--paper)] pt-6 pb-12">
      <div className="mx-auto max-w-[var(--prose)] px-4">
        <PageHeader eyebrow="Journal" title="Log a session" />


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="ea-label"
            >
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="ea-input"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="sessionDate"
              className="ea-label"
            >
              Date
            </label>
            <input
              type="date"
              id="sessionDate"
              name="sessionDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="ea-input"
            />
          </div>

          {/* River */}
          <div>
            <label
              htmlFor="river"
              className="ea-label"
            >
              River
            </label>
            <div className="relative">
              <input
                type="text"
                id="river"
                name="river"
                required
                value={riverValue}
                onChange={(e) => { setRiverValue(e.target.value); setRiverFilter(e.target.value); setRiverOpen(true); }}
                onFocus={() => setRiverOpen(true)}
                onBlur={() => setTimeout(() => setRiverOpen(false), 150)}
                autoComplete="off"
                className="ea-input"
              />
              {riverOpen && rivers.filter(r => r.toLowerCase().includes(riverValue.toLowerCase())).length > 0 && (
                <ul className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-float)]">
                  {rivers
                    .filter(r => !riverValue || r.toLowerCase().includes(riverValue.toLowerCase()))
                    .slice(0, 20)
                    .map(r => (
                      <li
                        key={r}
                        onMouseDown={() => { setRiverValue(r); setRiverOpen(false); }}
                        className="px-4 py-2 text-[var(--text-1)] hover:bg-[var(--paper-deep)] cursor-pointer text-sm"
                      >
                        {r}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="ea-label"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              list="locations"
              required
              className="ea-input"
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
              className="ea-label"
            >
              Water Temp (optional)
            </label>
            <input
              type="text"
              id="waterTemp"
              name="waterTemp"
              placeholder="e.g. 52°F"
              className="ea-input"
            />
          </div>

          {/* Water Clarity */}
          <div>
            <label
              htmlFor="waterClarity"
              className="ea-label"
            >
              Water Clarity (optional)
            </label>
            <select
              id="waterClarity"
              name="waterClarity"
              className="ea-input"
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
              className="ea-label"
            >
              Weather (optional)
            </label>
            <input
              type="text"
              id="weather"
              name="weather"
              className="ea-input"
            />
          </div>

          {/* Flies Notes */}
          <div>
            <label
              htmlFor="fliesNotes"
              className="ea-label"
            >
              Flies Notes (optional)
            </label>
            <textarea
              id="fliesNotes"
              name="fliesNotes"
              rows={3}
              placeholder="Rig notes, setup..."
              className="ea-input"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="ea-label"
            >
              Tags (optional)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="utah, provo, spring"
              className="ea-input"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="ea-label"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={6}
              className="ea-input"
            />
          </div>

          {/* Privacy */}
          <div className="ea-card">
            <SessionPrivacyToggle value={privacy} onChange={setPrivacy} />
          </div>

          {/* Gear */}
          <div className="ea-card">
            <h2 className="ea-overline mb-4 flex items-center gap-2">
              Gear
              <span className="text-xs font-normal text-[var(--text-3)] normal-case tracking-normal">Pre-filled from your defaults</span>
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
            className="ea-btn ea-btn-primary ea-btn-lg w-full"
          >
            {loading ? "Saving..." : "Save Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
