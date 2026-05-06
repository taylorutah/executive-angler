"use client";

import { useState } from "react";
import { X, Crosshair, Backpack, Archive, Folder, Loader2 } from "lucide-react";
import type { FlyBoxTier, FlyBoxWithStats } from "@/lib/db/fly-boxes";

interface Props {
  onClose: () => void;
  onCreated: (box: FlyBoxWithStats) => void;
  defaultTier?: FlyBoxTier;
}

const TIERS: {
  key: FlyBoxTier;
  label: string;
  description: string;
  icon: typeof Crosshair;
  emoji: string;
}[] = [
  {
    key: "kill",
    label: "Kill Box",
    description: "Chest-worn. Top 12-20 flies. No hesitation.",
    icon: Crosshair,
    emoji: "🎯",
  },
  {
    key: "support",
    label: "Support Box",
    description: "Pack/vest. Variations and situational patterns.",
    icon: Backpack,
    emoji: "🎒",
  },
  {
    key: "archive",
    label: "Archive",
    description: "Storage. Modular inserts you don't bring streamside.",
    icon: Archive,
    emoji: "📦",
  },
  {
    key: "custom",
    label: "Custom",
    description: "Trip, region, or theme — your own structure.",
    icon: Folder,
    emoji: "🗂️",
  },
];

export default function CreateBoxDialog({ onClose, onCreated, defaultTier }: Props) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<FlyBoxTier>(defaultTier ?? "kill");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/fly-boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tier,
          description: description.trim() || null,
          icon: icon.trim() || null,
          total_capacity: capacity === "" ? null : Number(capacity),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to create box");
        return;
      }
      const data = (await res.json()) as { box: FlyBoxWithStats };
      onCreated({
        ...data.box,
        fly_count: 0,
        total_quantity: 0,
      });
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#0D1117] border border-[#30363D] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#21262D] px-4 py-3">
          <h2 className="font-heading text-lg font-bold text-[#F0F6FC]">New fly box</h2>
          <button
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-4 p-4">
          {/* Tier picker */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-2">
              Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((t) => {
                const active = tier === t.key;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTier(t.key)}
                    className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-[#E8923A] bg-[#E8923A]/10"
                        : "border-[#21262D] bg-[#161B22] hover:border-[#E8923A]/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon
                        className={`h-3.5 w-3.5 ${active ? "text-[#E8923A]" : "text-[#A8B2BD]"}`}
                      />
                      <span
                        className={`text-xs font-semibold ${active ? "text-[#F0F6FC]" : "text-[#A8B2BD]"}`}
                      >
                        {t.label}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#6E7681] leading-tight">
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                tier === "kill"
                  ? "e.g. Trout Kill Box"
                  : tier === "support"
                    ? "e.g. Tailwater Support"
                    : tier === "archive"
                      ? "e.g. Streamer Archive"
                      : "e.g. Madison Trip"
              }
              autoFocus
              className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this box for?"
              rows={2}
              className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50 resize-none"
            />
          </div>

          {/* Icon + capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
                Icon (emoji, optional)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎯"
                maxLength={4}
                className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
                Capacity (optional)
              </label>
              <input
                type="number"
                min={1}
                value={capacity === "" ? "" : String(capacity)}
                onChange={(e) =>
                  setCapacity(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value, 10)))
                }
                placeholder="e.g. 24"
                className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-[#21262D] px-4 py-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create box
          </button>
        </footer>
      </div>
    </div>
  );
}
