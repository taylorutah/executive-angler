"use client";

import { useState } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { EuroLeaderSection } from "@/types/gear";

interface Props {
  sections: EuroLeaderSection[];
  onChange: (sections: EuroLeaderSection[]) => void;
}

const ROLES: { value: EuroLeaderSection["role"]; label: string }[] = [
  { value: "butt", label: "Butt" },
  { value: "sighter", label: "Sighter" },
  { value: "tippet-ring-section", label: "Tippet-ring section" },
  { value: "tippet", label: "Tippet" },
];

const MATERIALS: { value: EuroLeaderSection["material"]; label: string }[] = [
  { value: "mono", label: "Mono" },
  { value: "fluoro", label: "Fluoro" },
  { value: "bicolor-mono", label: "Bicolor Mono" },
  { value: "coated", label: "Coated" },
];

const DEFAULT_SECTIONS: EuroLeaderSection[] = [
  { role: "butt", material: "mono", color: "clear", length_ft: 12, diameter_mm: 0.28 },
  { role: "sighter", material: "bicolor-mono", color: "hot pink / yellow", length_ft: 3, diameter_mm: 0.2 },
  { role: "tippet-ring-section", material: "mono", color: "clear", length_ft: 0.5, diameter_mm: 0.18 },
  { role: "tippet", material: "fluoro", color: "clear", length_ft: 3, x_size: "4X" },
];

const inputCls =
  "bg-[#0D1117] border border-[#21262D] rounded-lg px-2 py-1.5 text-[#F0F6FC] text-xs focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";

function newSection(): EuroLeaderSection {
  return { role: "tippet", material: "fluoro", color: "clear", length_ft: 2 };
}

export default function EuroLeaderBuilder({ sections: propSections, onChange }: Props) {
  const sections = propSections.length > 0 ? propSections : DEFAULT_SECTIONS;

  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function updateSection(idx: number, patch: Partial<EuroLeaderSection>) {
    const next = sections.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange(next);
  }

  function deleteSection(idx: number) {
    onChange(sections.filter((_, i) => i !== idx));
  }

  function addSection() {
    onChange([...sections, newSection()]);
  }

  function handleDragStart(idx: number) {
    setDragging(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOver(idx);
  }

  function handleDrop(idx: number) {
    if (dragging === null || dragging === idx) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    const next = [...sections];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDragging(null);
    setDragOver(null);
  }

  const totalFt = sections.reduce((s, sec) => s + (sec.length_ft || 0), 0);

  return (
    <div className="rounded-xl border border-[#21262D] bg-[#0D1117] p-4">
      <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wide mb-3">
        Euro Leader Sections
      </p>

      <div className="space-y-2 mb-3">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
              dragOver === idx
                ? "border-[#E8923A] bg-[#E8923A]/5"
                : dragging === idx
                ? "border-[#21262D] opacity-40"
                : "border-[#21262D] bg-[#161B22]"
            }`}
          >
            {/* Drag handle */}
            <GripVertical className="h-4 w-4 text-[#484F58] flex-shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Role */}
            <select
              value={sec.role}
              onChange={(e) => updateSection(idx, { role: e.target.value as EuroLeaderSection["role"] })}
              className={inputCls + " flex-shrink-0 w-[130px]"}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            {/* Material */}
            <select
              value={sec.material}
              onChange={(e) => updateSection(idx, { material: e.target.value as EuroLeaderSection["material"] })}
              className={inputCls + " flex-shrink-0 w-[120px]"}
            >
              {MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Color */}
            <input
              type="text"
              placeholder="Color"
              value={sec.color || ""}
              onChange={(e) => updateSection(idx, { color: e.target.value })}
              className={inputCls + " w-[90px]"}
            />

            {/* Length */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="ft"
                value={sec.length_ft || ""}
                onChange={(e) => updateSection(idx, { length_ft: parseFloat(e.target.value) || 0 })}
                className={inputCls + " w-[56px]"}
              />
              <span className="text-[10px] text-[#484F58] flex-shrink-0">ft</span>
            </div>

            {/* Diameter / X */}
            {sec.role === "tippet" ? (
              <input
                type="text"
                placeholder="e.g. 4X"
                value={sec.x_size || ""}
                onChange={(e) => updateSection(idx, { x_size: e.target.value })}
                className={inputCls + " w-[60px]"}
              />
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="mm"
                  value={sec.diameter_mm || ""}
                  onChange={(e) => updateSection(idx, { diameter_mm: parseFloat(e.target.value) || undefined })}
                  className={inputCls + " w-[60px]"}
                />
                <span className="text-[10px] text-[#484F58] flex-shrink-0">mm</span>
              </div>
            )}

            {/* Delete */}
            <button
              type="button"
              onClick={() => deleteSection(idx)}
              className="ml-auto flex-shrink-0 p-1 rounded text-[#484F58] hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-1.5 text-xs text-[#00B4D8] hover:text-[#00B4D8]/80 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Section
        </button>
        <span className="text-xs text-[#8B949E] font-medium">
          Total:{" "}
          <span className="text-[#E8923A] font-bold">{totalFt.toFixed(1)} ft</span>
        </span>
      </div>
    </div>
  );
}
