"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rivers, setRivers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Fetch autocomplete data
  useEffect(() => {
    Promise.all([
      fetch("/api/fishing/session?autocomplete=rivers").then((r) => r.json()),
      fetch("/api/fishing/session?autocomplete=locations").then((r) => r.json()),
    ])
      .then(([riversData, locationsData]) => {
        setRivers(riversData || []);
        setLocations(locationsData || []);
      })
      .catch((err) => console.error("Failed to fetch autocomplete data:", err));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") || undefined,
      sessionDate: formData.get("sessionDate"),
      river: formData.get("river"),
      location: formData.get("location"),
      waterTemp: formData.get("waterTemp") || undefined,
      waterClarity: formData.get("waterClarity") || undefined,
      weather: formData.get("weather") || undefined,
      fliesNotes: formData.get("fliesNotes") || undefined,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      notes: formData.get("notes") || undefined,
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
    <div className="min-h-screen bg-[#0D1117] py-12">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8923A] text-white font-medium py-4 px-6 rounded-lg hover:bg-[#E8923A]-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? "Saving..." : "Save Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
