"use client";

import { useState, useEffect } from "react";
import type { GearItem, GearType } from "@/types/gear";
import GearForm from "./GearForm";

interface Props {
  type: GearType;
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
}

const TYPE_LABELS: Record<GearType, string> = {
  rod: "Rod",
  reel: "Reel",
  line: "Line",
  leader: "Leader",
  tippet: "Tippet",
  net: "Net",
  waders: "Waders",
  other: "Other",
};

const selectCls =
  "w-full rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-2.5 text-[#F0F6FC] text-sm focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";

export default function GearPicker({ type, value, onChange, label }: Props) {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function fetchItems() {
    try {
      const res = await fetch(`/api/gear?type=${type}&active=true`);
      if (res.ok) {
        const data: GearItem[] = await res.json();
        setItems(data.filter((i) => i.is_active));
      }
    } catch {
      // API may not exist yet — fail silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, [type]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === "__add__") {
      setFormOpen(true);
    } else {
      onChange(v === "" ? null : v);
    }
  }

  function handleSaved(item: GearItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
    onChange(item.id);
    setFormOpen(false);
  }

  return (
    <>
      <div>
        {label && (
          <label className="block text-xs font-semibold text-[#8B949E] mb-1 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          value={value ?? ""}
          onChange={handleChange}
          disabled={loading}
          className={selectCls}
        >
          <option value="">— None —</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {[item.maker, item.name].filter(Boolean).join(" · ")}
              {item.is_default ? " ⭐" : ""}
            </option>
          ))}
          <option value="__add__">＋ Add new {TYPE_LABELS[type].toLowerCase()}…</option>
        </select>
      </div>

      <GearForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        initialType={type}
        isFirstOfType={items.length === 0}
      />
    </>
  );
}
