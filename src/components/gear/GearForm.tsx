"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { GearItem, GearType, RodSpecs, ReelSpecs, LineSpecs, LeaderSpecs, TippetSpecs } from "@/types/gear";
import EuroLeaderBuilder from "./EuroLeaderBuilder";
import type { EuroLeaderSection } from "@/types/gear";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (item: GearItem) => void;
  initialType?: GearType;
  editItem?: GearItem | null;
  isFirstOfType?: boolean;
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

const inputCls =
  "w-full rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-2.5 text-[#F0F6FC] text-sm focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";
const labelCls = "block text-xs font-semibold text-[#8B949E] mb-1 uppercase tracking-wide";
const selectCls = inputCls;

export default function GearForm({ open, onClose, onSaved, initialType = "rod", editItem = null, isFirstOfType = false }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<GearType>(initialType);
  const [name, setName] = useState("");
  const [maker, setMaker] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Rod
  const [rodLength, setRodLength] = useState("");
  const [rodWeight, setRodWeight] = useState("");
  const [rodAction, setRodAction] = useState("");
  const [rodPieces, setRodPieces] = useState("");

  // Reel
  const [reelSize, setReelSize] = useState("");
  const [reelDrag, setReelDrag] = useState("");

  // Line
  const [lineWeight, setLineWeight] = useState("");
  const [lineTaper, setLineTaper] = useState("");
  const [lineDensity, setLineDensity] = useState("");

  // Leader
  const [leaderLength, setLeaderLength] = useState("");
  const [leaderTippetX, setLeaderTippetX] = useState("");
  const [leaderStyle, setLeaderStyle] = useState("");
  const [euroSections, setEuroSections] = useState<EuroLeaderSection[]>([]);

  // Tippet
  const [tippetMaterial, setTippetMaterial] = useState("");
  const [tippetX, setTippetX] = useState("");
  const [tippetDiameter, setTippetDiameter] = useState("");

  // Populate when editing
  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setName(editItem.name);
      setMaker(editItem.maker || "");
      setModel(editItem.model || "");
      setNotes(editItem.notes || "");
      setIsDefault(editItem.is_default);

      const s = editItem.specs || {};

      if (editItem.type === "rod") {
        const rs = s as RodSpecs;
        setRodLength(rs.length_ft?.toString() || "");
        setRodWeight(rs.weight_wt?.toString() || "");
        setRodAction(rs.action || "");
        setRodPieces(rs.pieces?.toString() || "");
      } else if (editItem.type === "reel") {
        const rs = s as ReelSpecs;
        setReelSize(rs.size || "");
        setReelDrag(rs.drag || "");
      } else if (editItem.type === "line") {
        const ls = s as LineSpecs;
        setLineWeight(ls.weight?.toString() || "");
        setLineTaper(ls.taper || "");
        setLineDensity(ls.density || "");
      } else if (editItem.type === "leader") {
        const ls = s as LeaderSpecs;
        setLeaderLength(ls.length_ft?.toString() || "");
        setLeaderTippetX(ls.tippet_x || "");
        setLeaderStyle(ls.style || "");
        setEuroSections(ls.sections || []);
      } else if (editItem.type === "tippet") {
        const ts = s as TippetSpecs;
        setTippetMaterial(ts.material || "");
        setTippetX(ts.x_size || "");
        setTippetDiameter(ts.diameter_mm?.toString() || "");
      }
    } else {
      // Reset form
      setType(initialType);
      setName(""); setMaker(""); setModel(""); setNotes("");
      setIsDefault(isFirstOfType);
      setRodLength(""); setRodWeight(""); setRodAction(""); setRodPieces("");
      setReelSize(""); setReelDrag("");
      setLineWeight(""); setLineTaper(""); setLineDensity("");
      setLeaderLength(""); setLeaderTippetX(""); setLeaderStyle(""); setEuroSections([]);
      setTippetMaterial(""); setTippetX(""); setTippetDiameter("");
    }
    setError("");
  }, [open, editItem, initialType, isFirstOfType]);

  function buildSpecs() {
    if (type === "rod") {
      const specs: RodSpecs = {
        length_ft: rodLength ? parseFloat(rodLength) : undefined,
        weight_wt: rodWeight ? parseFloat(rodWeight) : undefined,
        action: rodAction ? (rodAction as RodSpecs["action"]) : undefined,
        pieces: rodPieces ? parseInt(rodPieces) : undefined,
      };
      return specs;
    }
    if (type === "reel") {
      const specs: ReelSpecs = { size: reelSize || undefined, drag: reelDrag ? (reelDrag as ReelSpecs["drag"]) : undefined };
      return specs;
    }
    if (type === "line") {
      const specs: LineSpecs = {
        weight: lineWeight ? parseFloat(lineWeight) : undefined,
        taper: lineTaper ? (lineTaper as LineSpecs["taper"]) : undefined,
        density: lineDensity ? (lineDensity as LineSpecs["density"]) : undefined,
      };
      return specs;
    }
    if (type === "leader") {
      const specs: LeaderSpecs = {
        length_ft: leaderLength ? parseFloat(leaderLength) : undefined,
        tippet_x: leaderTippetX || undefined,
        style: leaderStyle ? (leaderStyle as LeaderSpecs["style"]) : undefined,
        sections: leaderStyle === "euro" ? euroSections : undefined,
      };
      return specs;
    }
    if (type === "tippet") {
      const specs: TippetSpecs = {
        material: tippetMaterial ? (tippetMaterial as TippetSpecs["material"]) : undefined,
        x_size: tippetX || undefined,
        diameter_mm: tippetDiameter ? parseFloat(tippetDiameter) : undefined,
      };
      return specs;
    }
    return {};
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");

    const payload = {
      type,
      name: name.trim(),
      maker: maker.trim() || undefined,
      model: model.trim() || undefined,
      specs: buildSpecs(),
      is_default: isDefault,
      notes: notes.trim() || undefined,
    };

    try {
      const url = editItem ? `/api/gear?id=${editItem.id}` : "/api/gear";
      const method = editItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save");
      }
      const saved: GearItem = await res.json();
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#161B22] border border-[#21262D] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D] sticky top-0 bg-[#161B22] z-10">
          <h2 className="font-heading font-bold text-[#F0F6FC] text-lg">
            {editItem ? `Edit ${TYPE_LABELS[type]}` : `Add ${TYPE_LABELS[initialType]}`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0D1117] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type (only show if adding, not editing) */}
          {!editItem && (
            <div>
              <label className={labelCls}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as GearType)} className={selectCls}>
                {(Object.keys(TYPE_LABELS) as GearType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          )}

          {/* Name */}
          <div>
            <label className={labelCls}>Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder={
              type === "rod" ? "e.g. Sage R8 9ft 5wt" :
              type === "reel" ? "e.g. Abel TR2" :
              type === "line" ? "e.g. Rio Gold WF5F" :
              type === "leader" ? "e.g. 9ft 5X Knotless" :
              type === "tippet" ? "e.g. Varivas 5X Fluoro" :
              "Short name"
            } />
          </div>

          {/* Maker + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Maker</label>
              <input type="text" value={maker} onChange={(e) => setMaker(e.target.value)} className={inputCls} placeholder="e.g. Sage" />
            </div>
            <div>
              <label className={labelCls}>Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className={inputCls} placeholder="e.g. R8" />
            </div>
          </div>

          {/* ---- Type-specific fields ---- */}
          {type === "rod" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Length (ft)</label>
                <input type="number" step="0.5" min="0" value={rodLength} onChange={(e) => setRodLength(e.target.value)} className={inputCls} placeholder="9" />
              </div>
              <div>
                <label className={labelCls}>Line Weight (wt)</label>
                <input type="number" step="1" min="1" max="14" value={rodWeight} onChange={(e) => setRodWeight(e.target.value)} className={inputCls} placeholder="5" />
              </div>
              <div>
                <label className={labelCls}>Action</label>
                <select value={rodAction} onChange={(e) => setRodAction(e.target.value)} className={selectCls}>
                  <option value="">Select…</option>
                  <option value="extra-fast">Extra Fast</option>
                  <option value="fast">Fast</option>
                  <option value="medium-fast">Medium Fast</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Pieces</label>
                <input type="number" step="1" min="1" value={rodPieces} onChange={(e) => setRodPieces(e.target.value)} className={inputCls} placeholder="4" />
              </div>
            </div>
          )}

          {type === "reel" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Size</label>
                <input type="text" value={reelSize} onChange={(e) => setReelSize(e.target.value)} className={inputCls} placeholder="e.g. 3-5" />
              </div>
              <div>
                <label className={labelCls}>Drag Type</label>
                <select value={reelDrag} onChange={(e) => setReelDrag(e.target.value)} className={selectCls}>
                  <option value="">Select…</option>
                  <option value="click-pawl">Click-Pawl</option>
                  <option value="disc">Disc</option>
                </select>
              </div>
            </div>
          )}

          {type === "line" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Weight</label>
                <input type="number" step="1" min="1" max="14" value={lineWeight} onChange={(e) => setLineWeight(e.target.value)} className={inputCls} placeholder="5" />
              </div>
              <div>
                <label className={labelCls}>Taper</label>
                <select value={lineTaper} onChange={(e) => setLineTaper(e.target.value)} className={selectCls}>
                  <option value="">Select…</option>
                  <option value="WF">WF</option>
                  <option value="DT">DT</option>
                  <option value="SH">SH</option>
                  <option value="running">Running</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Density</label>
                <select value={lineDensity} onChange={(e) => setLineDensity(e.target.value)} className={selectCls}>
                  <option value="">Select…</option>
                  <option value="floating">Floating</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="sinking">Sinking</option>
                  <option value="sink-tip">Sink-Tip</option>
                </select>
              </div>
            </div>
          )}

          {type === "leader" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Length (ft)</label>
                  <input type="number" step="0.5" min="0" value={leaderLength} onChange={(e) => setLeaderLength(e.target.value)} className={inputCls} placeholder="9" />
                </div>
                <div>
                  <label className={labelCls}>Tippet Size</label>
                  <input type="text" value={leaderTippetX} onChange={(e) => setLeaderTippetX(e.target.value)} className={inputCls} placeholder="5X" />
                </div>
                <div>
                  <label className={labelCls}>Style</label>
                  <select value={leaderStyle} onChange={(e) => setLeaderStyle(e.target.value)} className={selectCls}>
                    <option value="">Select…</option>
                    <option value="knotless">Knotless</option>
                    <option value="knotted">Knotted</option>
                    <option value="furled">Furled</option>
                    <option value="euro">Euro Nymph</option>
                  </select>
                </div>
              </div>
              {leaderStyle === "euro" && (
                <EuroLeaderBuilder sections={euroSections} onChange={setEuroSections} />
              )}
            </>
          )}

          {type === "tippet" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Material</label>
                <select value={tippetMaterial} onChange={(e) => setTippetMaterial(e.target.value)} className={selectCls}>
                  <option value="">Select…</option>
                  <option value="fluorocarbon">Fluorocarbon</option>
                  <option value="nylon">Nylon</option>
                  <option value="bicolor">Bicolor</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>X Size</label>
                <input type="text" value={tippetX} onChange={(e) => setTippetX(e.target.value)} className={inputCls} placeholder="5X" />
              </div>
              <div>
                <label className={labelCls}>Diameter (mm)</label>
                <input type="number" step="0.001" min="0" value={tippetDiameter} onChange={(e) => setTippetDiameter(e.target.value)} className={inputCls} placeholder="0.148" />
              </div>
            </div>
          )}

          {/* Notes — available for all gear types */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Any details about this gear…" />
          </div>

          {/* Default checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="mt-0.5 rounded border-[#21262D] accent-[#E8923A]"
            />
            <span>
              <span className="text-sm font-medium text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                Set as default for new sessions
              </span>
              <span className="block text-xs text-[#484F58] mt-0.5">
                Like Strava&apos;s gear — this {TYPE_LABELS[type].toLowerCase()} will auto-attach whenever you log a new session.
              </span>
            </span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[#21262D] py-2.5 text-sm text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#484F58] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-[#E8923A] py-2.5 text-sm font-semibold text-white hover:bg-[#d07e31] disabled:opacity-60 transition-colors">
              {saving ? "Saving…" : editItem ? "Save Changes" : "Add Gear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
