"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock } from "@/icons";
import type { GearItem, GearType, RodSpecs, ReelSpecs, LineSpecs, LeaderSpecs, TippetSpecs } from "@/types/gear";
import EuroLeaderBuilder from "./EuroLeaderBuilder";
import type { EuroLeaderSection } from "@/types/gear";
import MakerCombobox from "./MakerCombobox";

export interface PresetProduct {
  productId: string;
  category: GearType;
  brandName: string;
  modelName: string;  // brand-stripped, e.g. "R8 Core" when brand is "Sage"
  defaultName: string; // e.g. "Sage R8 Core"
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (item: GearItem) => void;
  initialType?: GearType;
  editItem?: GearItem | null;
  isFirstOfType?: boolean;
  presetProduct?: PresetProduct | null;
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
  "w-full rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--action)] focus:outline-none focus:ring-1 focus:ring-[var(--action)]";
const labelCls = "block text-xs font-semibold text-[var(--text-body)] mb-1 uppercase tracking-wide";
const selectCls = inputCls;

export default function GearForm({ open, onClose, onSaved, initialType = "rod", editItem = null, isFirstOfType = false, presetProduct = null }: Props) {
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
    } else if (presetProduct) {
      // Seeded from catalog product — pre-fill identity, leave SKU specs for user
      setType(presetProduct.category);
      setName(presetProduct.defaultName);
      setMaker(presetProduct.brandName);
      setModel(presetProduct.modelName);
      setNotes("");
      setIsDefault(isFirstOfType);
      setRodLength(""); setRodWeight(""); setRodAction(""); setRodPieces("");
      setReelSize(""); setReelDrag("");
      setLineWeight(""); setLineTaper(""); setLineDensity("");
      setLeaderLength(""); setLeaderTippetX(""); setLeaderStyle(""); setEuroSections([]);
      setTippetMaterial(""); setTippetX(""); setTippetDiameter("");
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
  }, [open, editItem, initialType, isFirstOfType, presetProduct]);

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
      gear_product_id: presetProduct?.productId,
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
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-rule)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-rule)] sticky top-0 bg-[var(--surface-raised)] z-10">
          <h2 className="font-heading font-bold text-[var(--text-primary)] text-lg">
            {editItem
              ? `Edit ${TYPE_LABELS[type]}`
              : presetProduct
                ? `Add ${presetProduct.brandName} ${presetProduct.modelName}`
                : `Add ${TYPE_LABELS[initialType]}`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-page)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Catalog context banner */}
          {presetProduct && !editItem && (
            <div className="rounded-lg bg-[var(--action)]/10 border border-[var(--action)]/20 px-3 py-2.5 flex items-start gap-2.5">
              <Lock className="h-3.5 w-3.5 text-[var(--action)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--text-body)] leading-relaxed">
                From the <span className="text-[var(--text-primary)] font-semibold">{presetProduct.brandName} {presetProduct.modelName}</span> catalog page.
                Fill in <span className="text-[var(--text-primary)] font-semibold">your</span> SKU&apos;s length, weight, and pieces below so we can track it with your sessions.
              </p>
            </div>
          )}

          {/* Type (only show if adding, not editing, and not preset from catalog) */}
          {!editItem && !presetProduct && (
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
              <MakerCombobox
                value={maker}
                onChange={setMaker}
                disabled={!!presetProduct}
                placeholder="e.g. Sage"
              />
            </div>
            <div>
              <label className={labelCls}>Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!!presetProduct}
                className={`${inputCls} ${presetProduct ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="e.g. R8"
              />
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
              className="mt-0.5 rounded border-[var(--border-rule)] accent-[var(--action)]"
            />
            <span>
              <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">
                Set as default for new sessions
              </span>
              <span className="block text-xs text-[var(--text-meta)] mt-0.5">
                Like Strava&apos;s gear — this {TYPE_LABELS[type].toLowerCase()} will auto-attach whenever you log a new session.
              </span>
            </span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[var(--border-rule)] py-2.5 text-sm text-[var(--text-body)] hover:text-[var(--text-primary)] hover:border-[var(--text-meta)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-[var(--action)] py-2.5 text-sm font-semibold text-white hover:bg-[#d07e31] disabled:opacity-60 transition-colors">
              {saving ? "Saving…" : editItem ? "Save Changes" : "Add Gear"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
