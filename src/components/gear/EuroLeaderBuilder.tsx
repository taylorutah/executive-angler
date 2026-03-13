"use client";

import { useState } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { EuroLeaderSection } from "@/types/gear";

interface Props {
  sections: EuroLeaderSection[];
  onChange: (sections: EuroLeaderSection[]) => void;
}

const ROLES: { value: EuroLeaderSection["role"]; label: string }[] = [
  { value: "butt",        label: "Butt" },
  { value: "level",       label: "Level" },
  { value: "sighter",     label: "Sighter" },
  { value: "tippet-ring", label: "Tippet Ring" },
  { value: "tippet",      label: "Tippet" },
];

const TIPPET_MATERIALS: { value: string; label: string }[] = [
  { value: "fluoro",      label: "Fluorocarbon" },
  { value: "mono",        label: "Mono" },
  { value: "bicolor-mono",label: "Bicolor Mono" },
  { value: "coated",      label: "Coated" },
];

const DEFAULT_SECTIONS: EuroLeaderSection[] = [
  { role: "butt",        material_name: "Maxima Chameleon", length_ft: 1,    lb_test: 6 },
  { role: "sighter",     material_name: "Pierre Sempe",     length_ft: 14,   diameter_mm: 0.20, color: "Fluo color of choice" },
  { role: "sighter",     material_name: "Pierre Sempe",     length_ft: 1.5,  diameter_mm: 0.18, color: "Fluo contrasting (sighter)" },
  { role: "tippet-ring", ring_size: "small" },
  { role: "tippet",      material: "fluoro",                length_ft: 5,    x_size: "4X" },
];

const cls =
  "bg-[#0D1117] border border-[#21262D] rounded-lg px-2 py-1.5 text-[#F0F6FC] text-xs focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";
const lbl = "text-[10px] text-[#484F58] flex-shrink-0";

function newSection(): EuroLeaderSection {
  return { role: "tippet", material: "fluoro", length_ft: 2 };
}

/** Migrate old role names from pre-refactor data */
function normalizeRole(role: string): EuroLeaderSection["role"] {
  if (role === "tippet-ring-section") return "tippet-ring";
  return role as EuroLeaderSection["role"];
}

export default function EuroLeaderBuilder({ sections: propSections, onChange }: Props) {
  const raw = propSections.length > 0 ? propSections : DEFAULT_SECTIONS;
  const sections = raw.map((s) => ({ ...s, role: normalizeRole(s.role) }));

  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver,  setDragOver]  = useState<number | null>(null);

  function update(idx: number, patch: Partial<EuroLeaderSection>) {
    onChange(sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }
  function remove(idx: number) { onChange(sections.filter((_, i) => i !== idx)); }
  function add()               { onChange([...sections, newSection()]); }

  function handleDrop(idx: number) {
    if (dragging === null || dragging === idx) { setDragging(null); setDragOver(null); return; }
    const next = [...sections];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDragging(null); setDragOver(null);
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
            onDragStart={() => setDragging(idx)}
            onDragOver={(e) => { e.preventDefault(); setDragOver(idx); }}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 transition-all ${
              dragOver === idx   ? "border-[#E8923A] bg-[#E8923A]/5"
              : dragging === idx ? "border-[#21262D] opacity-40"
                                 : "border-[#21262D] bg-[#161B22]"
            }`}
          >
            {/* Drag handle */}
            <GripVertical className="h-4 w-4 text-[#484F58] flex-shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Role selector */}
            <select
              value={sec.role}
              onChange={(e) => update(idx, { role: e.target.value as EuroLeaderSection["role"] })}
              className={cls + " flex-shrink-0 w-[110px]"}
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            {/* ─── Tippet Ring: ring size only ─── */}
            {sec.role === "tippet-ring" && (
              <input
                type="text"
                placeholder="Ring size (e.g. small, #12)"
                value={sec.ring_size || ""}
                onChange={(e) => update(idx, { ring_size: e.target.value })}
                className={cls + " flex-1 min-w-[160px]"}
              />
            )}

            {/* ─── Tippet: material + length + X size ─── */}
            {sec.role === "tippet" && (
              <>
                <select
                  value={sec.material || "fluoro"}
                  onChange={(e) => update(idx, { material: e.target.value as EuroLeaderSection["material"] })}
                  className={cls + " flex-shrink-0 w-[120px]"}
                >
                  {TIPPET_MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number" step="0.5" min="0" placeholder="ft"
                    value={sec.length_ft || ""}
                    onChange={(e) => update(idx, { length_ft: parseFloat(e.target.value) || 0 })}
                    className={cls + " w-[52px]"}
                  />
                  <span className={lbl}>ft</span>
                </div>
                <input
                  type="text" placeholder="e.g. 4X"
                  value={sec.x_size || ""}
                  onChange={(e) => update(idx, { x_size: e.target.value })}
                  className={cls + " w-[52px]"}
                />
              </>
            )}

            {/* ─── Butt / Level / Sighter: material name + length + lb (butt) or color (level/sighter) + diameter ─── */}
            {(sec.role === "butt" || sec.role === "level" || sec.role === "sighter") && (
              <>
                {/* Material brand name */}
                <input
                  type="text"
                  placeholder={sec.role === "butt" ? "e.g. Maxima Chameleon" : "e.g. Pierre Sempe"}
                  value={sec.material_name || ""}
                  onChange={(e) => update(idx, { material_name: e.target.value })}
                  className={cls + " flex-1 min-w-[130px]"}
                />

                {/* Length */}
                <div className="flex items-center gap-1">
                  <input
                    type="number" step="0.5" min="0" placeholder="ft"
                    value={sec.length_ft || ""}
                    onChange={(e) => update(idx, { length_ft: parseFloat(e.target.value) || 0 })}
                    className={cls + " w-[52px]"}
                  />
                  <span className={lbl}>ft</span>
                </div>

                {/* Butt: lb test */}
                {sec.role === "butt" && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number" step="0.5" min="0" placeholder="lb"
                      value={sec.lb_test || ""}
                      onChange={(e) => update(idx, { lb_test: parseFloat(e.target.value) || undefined })}
                      className={cls + " w-[46px]"}
                    />
                    <span className={lbl}>lb</span>
                  </div>
                )}

                {/* Level / Sighter: color */}
                {(sec.role === "level" || sec.role === "sighter") && (
                  <input
                    type="text" placeholder="Color"
                    value={sec.color || ""}
                    onChange={(e) => update(idx, { color: e.target.value })}
                    className={cls + " w-[90px]"}
                  />
                )}

                {/* Diameter mm */}
                <div className="flex items-center gap-1">
                  <input
                    type="number" step="0.01" min="0" placeholder="mm"
                    value={sec.diameter_mm || ""}
                    onChange={(e) => update(idx, { diameter_mm: parseFloat(e.target.value) || undefined })}
                    className={cls + " w-[55px]"}
                  />
                  <span className={lbl}>mm</span>
                </div>
              </>
            )}

            {/* Delete */}
            <button
              type="button"
              onClick={() => remove(idx)}
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
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-[#00B4D8] hover:text-[#00B4D8]/80 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Section
        </button>
        <span className="text-xs text-[#8B949E] font-medium">
          Total: <span className="text-[#E8923A] font-bold">{totalFt.toFixed(1)} ft</span>
        </span>
      </div>
    </div>
  );
}
