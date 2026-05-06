"use client";

/**
 * QuickAddFliesSheet — bulk-add personal flies to a fly box. The user has
 * hundreds of flies in their physical boxes that aren't in the canonical
 * library; this sheet lets them rapidly record them.
 *
 * Two modes:
 *   • Single — guided form (one fly at a time, careful entry)
 *   • Paste  — multi-line textarea, parses each line into a fly entry
 *
 * Each created entry produces:
 *   - a fly_patterns row (private, no canonical parent)
 *   - a user_fly_box row pointing at it (with quantity_by_size if provided)
 *   - a fly_box_membership row in the target box
 */
import { useState } from "react";
import { X, Plus, Loader2, Sparkles, Trash2 } from "lucide-react";

interface Props {
  boxId: string;
  boxName: string;
  onClose: () => void;
  onSuccess: (createdCount: number) => void;
}

interface ParsedEntry {
  name: string;
  type?: string;
  sizes?: string[];
  quantity_by_size?: Record<string, number>;
  fly_color?: string;
  personal_notes?: string;
}

const TYPE_OPTIONS = [
  "Nymph",
  "Dry Fly",
  "Streamer",
  "Wet Fly",
  "Emerger",
  "Terrestrial",
  "Egg",
  "Midge",
  "Other",
];

/**
 * Parse a line like:
 *   "Perdigon"
 *   "Pheasant Tail | nymph | 14,16,18 | olive"
 *   "Silver Bullet | nymph | 14x4 16x4 18x4 | silver | best in low light"
 */
function parseLine(line: string): ParsedEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("|").map((p) => p.trim());
  const name = parts[0];
  if (!name) return null;
  const entry: ParsedEntry = { name };
  if (parts[1]) entry.type = parts[1];
  if (parts[2]) {
    // sizes can be "14,16,18" (just sizes) or "14x4 16x4" (with counts)
    const sizesStr = parts[2];
    const tokens = sizesStr.split(/[,\s]+/).filter(Boolean);
    const qty: Record<string, number> = {};
    const sizes: string[] = [];
    let hasQty = false;
    for (const tok of tokens) {
      const m = tok.match(/^(\d+(?:\.\d+)?)\s*[x*×]\s*(\d+)$/i);
      if (m) {
        const size = m[1];
        const count = parseInt(m[2], 10);
        if (count > 0) {
          qty[size] = count;
          sizes.push(size);
          hasQty = true;
        }
      } else if (/^\d/.test(tok)) {
        sizes.push(tok.replace(/^#/, ""));
      }
    }
    if (sizes.length) entry.sizes = sizes;
    if (hasQty) entry.quantity_by_size = qty;
  }
  if (parts[3]) entry.fly_color = parts[3];
  if (parts[4]) entry.personal_notes = parts[4];
  return entry;
}

function looksLikeType(value: string): string | undefined {
  const v = value.toLowerCase();
  for (const t of TYPE_OPTIONS) {
    if (t.toLowerCase() === v) return t;
  }
  // Fuzzy: "nymph", "dry", "streamer"
  if (v.startsWith("nymph")) return "Nymph";
  if (v.startsWith("dry")) return "Dry Fly";
  if (v.startsWith("strea")) return "Streamer";
  if (v.startsWith("wet")) return "Wet Fly";
  if (v.startsWith("emerg")) return "Emerger";
  if (v.startsWith("terr")) return "Terrestrial";
  if (v === "egg") return "Egg";
  if (v === "midge") return "Midge";
  return undefined;
}

export default function QuickAddFliesSheet({
  boxId,
  boxName,
  onClose,
  onSuccess,
}: Props) {
  const [tab, setTab] = useState<"single" | "paste">("single");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single mode state
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("");
  const [sizesText, setSizesText] = useState("");
  const [quantityBySize, setQuantityBySize] = useState<Record<string, number>>({});
  const [flyColor, setFlyColor] = useState("");
  const [hook, setHook] = useState("");
  const [notes, setNotes] = useState("");

  // Paste mode state
  const [pasteText, setPasteText] = useState("");

  function singleSizes(): string[] {
    return sizesText
      .split(/[,\s]+/)
      .map((s) => s.replace(/^#/, "").trim())
      .filter(Boolean);
  }

  async function submitSingle() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const sizes = singleSizes();
    const qty: Record<string, number> = {};
    for (const [k, v] of Object.entries(quantityBySize)) {
      if (typeof v === "number" && v > 0 && sizes.includes(k)) qty[k] = v;
    }
    const entry: ParsedEntry = {
      name: name.trim(),
      type: type || undefined,
      sizes: sizes.length ? sizes : undefined,
      quantity_by_size: Object.keys(qty).length ? qty : undefined,
      fly_color: flyColor.trim() || undefined,
      personal_notes: notes.trim() || undefined,
    };
    await postEntries([{ ...entry, hook: hook.trim() || undefined } as ParsedEntry & { hook?: string }], 1);
  }

  async function submitPaste() {
    const lines = pasteText.split("\n");
    const entries: ParsedEntry[] = [];
    for (const line of lines) {
      const parsed = parseLine(line);
      if (parsed) {
        if (parsed.type) {
          const guess = looksLikeType(parsed.type);
          if (guess) parsed.type = guess;
        }
        entries.push(parsed);
      }
    }
    if (entries.length === 0) {
      setError("No valid lines found. Each line needs at least a name.");
      return;
    }
    if (entries.length > 200) {
      setError(`Too many entries (${entries.length}). Maximum 200 per batch — paste in chunks.`);
      return;
    }
    await postEntries(entries, entries.length);
  }

  async function postEntries(entries: unknown[], count: number) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/quick-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box_id: boxId, entries }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        created?: number;
        errors?: { index: number; name: string; error: string }[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      const created = typeof data.created === "number" ? data.created : 0;
      const errCount = (data.errors ?? []).length;
      if (errCount > 0 && created === 0) {
        setError(
          `0 of ${count} created. First error: ${data.errors?.[0]?.error ?? "unknown"}`,
        );
        return;
      }
      if (errCount > 0) {
        setError(`${created} created, ${errCount} failed.`);
      }
      onSuccess(created);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const previewEntries = pasteText
    .split("\n")
    .map((l) => parseLine(l))
    .filter((e): e is ParsedEntry => !!e);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-[#0D1117] border border-[#30363D] shadow-2xl flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between border-b border-[#21262D] px-4 py-3">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold text-[#F0F6FC] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8923A]" /> Quick add flies
            </h2>
            <p className="text-xs text-[#6E7681] truncate">
              Adding to <span className="text-[#A8B2BD]">{boxName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC] flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3">
          <button
            onClick={() => {
              setTab("single");
              setError(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === "single"
                ? "bg-[#E8923A] text-white"
                : "text-[#A8B2BD] hover:bg-[#161B22]"
            }`}
          >
            One at a time
          </button>
          <button
            onClick={() => {
              setTab("paste");
              setError(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === "paste"
                ? "bg-[#E8923A] text-white"
                : "text-[#A8B2BD] hover:bg-[#161B22]"
            }`}
          >
            Paste a list
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "single" ? (
            <SingleForm
              name={name}
              setName={setName}
              type={type}
              setType={setType}
              sizesText={sizesText}
              setSizesText={setSizesText}
              quantityBySize={quantityBySize}
              setQuantityBySize={setQuantityBySize}
              flyColor={flyColor}
              setFlyColor={setFlyColor}
              hook={hook}
              setHook={setHook}
              notes={notes}
              setNotes={setNotes}
              singleSizes={singleSizes}
            />
          ) : (
            <PasteForm
              pasteText={pasteText}
              setPasteText={setPasteText}
              previewEntries={previewEntries}
            />
          )}

          {error && (
            <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-[#21262D] px-4 py-3">
          <p className="text-[10px] text-[#6E7681]">
            Created as private patterns. Edit later in{" "}
            <span className="text-[#A8B2BD]">My Flies</span> or{" "}
            <span className="text-[#A8B2BD]">Workbench</span>.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={tab === "single" ? submitSingle : submitPaste}
              disabled={
                saving ||
                (tab === "single" && !name.trim()) ||
                (tab === "paste" && previewEntries.length === 0)
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {tab === "single"
                ? "Add to box"
                : `Add ${previewEntries.length} ${previewEntries.length === 1 ? "fly" : "flies"} to box`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SingleForm(props: {
  name: string;
  setName: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  sizesText: string;
  setSizesText: (v: string) => void;
  quantityBySize: Record<string, number>;
  setQuantityBySize: (
    next:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>),
  ) => void;
  flyColor: string;
  setFlyColor: (v: string) => void;
  hook: string;
  setHook: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  singleSizes: () => string[];
}) {
  const sizes = props.singleSizes();
  return (
    <div className="space-y-3">
      <Field label="Name" required>
        <input
          type="text"
          value={props.name}
          onChange={(e) => props.setName(e.target.value)}
          placeholder="e.g. Walt's Worm"
          autoFocus
          className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select
            value={props.type}
            onChange={(e) => props.setType(e.target.value)}
            className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]/50"
          >
            <option value="">— pick a type —</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Color (optional)">
          <input
            type="text"
            value={props.flyColor}
            onChange={(e) => props.setFlyColor(e.target.value)}
            placeholder="olive, black, etc."
            className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
          />
        </Field>
      </div>
      <Field label="Sizes (comma-separated)">
        <input
          type="text"
          value={props.sizesText}
          onChange={(e) => props.setSizesText(e.target.value)}
          placeholder="14, 16, 18"
          className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
      </Field>
      {sizes.length > 0 && (
        <Field label="Stock by size">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sizes.map((s) => {
              const n = props.quantityBySize[s] ?? 0;
              return (
                <div
                  key={s}
                  className="flex items-center gap-2 rounded-lg border border-[#21262D] bg-[#161B22] px-2 py-1.5"
                >
                  <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[2.25rem] rounded-md bg-[#0D1117] px-1.5 py-0.5 text-[11px] font-semibold text-[#0BA5C7]">
                    #{s}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      props.setQuantityBySize((prev) => ({
                        ...prev,
                        [s]: Math.max(0, (prev[s] ?? 0) - 1),
                      }))
                    }
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] disabled:opacity-30"
                    disabled={n === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={n}
                    onChange={(e) => {
                      const v =
                        e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                      props.setQuantityBySize((prev) => ({
                        ...prev,
                        [s]: Math.max(0, isNaN(v) ? 0 : v),
                      }));
                    }}
                    className="w-10 bg-transparent text-center text-sm text-[#F0F6FC] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      props.setQuantityBySize((prev) => ({
                        ...prev,
                        [s]: (prev[s] ?? 0) + 1,
                      }))
                    }
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D]"
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </Field>
      )}
      <Field label="Hook (optional)">
        <input
          type="text"
          value={props.hook}
          onChange={(e) => props.setHook(e.target.value)}
          placeholder="e.g. Hanak 400 BL"
          className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
        />
      </Field>
      <Field label="Notes (optional)">
        <textarea
          value={props.notes}
          onChange={(e) => props.setNotes(e.target.value)}
          placeholder="What's special about this version?"
          rows={2}
          className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50 resize-none"
        />
      </Field>
    </div>
  );
}

function PasteForm({
  pasteText,
  setPasteText,
  previewEntries,
}: {
  pasteText: string;
  setPasteText: (v: string) => void;
  previewEntries: ParsedEntry[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
          Paste a list — one fly per line
        </p>
        <p className="text-[10px] text-[#6E7681] leading-relaxed mb-2">
          Format: <code className="text-[#E8923A]">name</code> or{" "}
          <code className="text-[#E8923A]">name | type | sizes | color | notes</code>.
          Sizes can include counts: <code className="text-[#E8923A]">14x4 16x4 18x2</code>.
          Type can be Nymph, Dry, Streamer, etc.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={10}
          autoFocus
          placeholder={`Walt's Worm\nPheasant Tail | nymph | 14,16,18 | natural\nSilver Bullet | nymph | 14x4 16x4 18x4 | silver | best low light\nPerdigon Olive | nymph | 16x4 18x4 | olive\nHigh-Vis Parachute Adams | dry | 14,16,18 | gray`}
          className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-xs font-mono text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50 resize-none"
        />
      </div>

      {previewEntries.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0BA5C7] mb-1.5">
            Preview — {previewEntries.length}{" "}
            {previewEntries.length === 1 ? "fly" : "flies"} ready
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-[#21262D] bg-[#161B22] p-2">
            {previewEntries.map((e, i) => (
              <PreviewRow key={i} entry={e} />
            ))}
          </div>
        </div>
      )}
      {/* Suppress lint for unused imports referenced via fallback */}
      <span className="hidden">
        <Plus />
        <Trash2 />
      </span>
    </div>
  );
}

function PreviewRow({ entry }: { entry: ParsedEntry }) {
  const sizesPreview =
    entry.quantity_by_size && Object.keys(entry.quantity_by_size).length > 0
      ? Object.entries(entry.quantity_by_size)
          .map(([s, n]) => `${n}×#${s}`)
          .join(" ")
      : entry.sizes && entry.sizes.length > 0
        ? entry.sizes.map((s) => `#${s}`).join(" ")
        : "";
  return (
    <div className="flex items-baseline gap-2 py-0.5 text-xs">
      <span className="text-[#F0F6FC] font-medium truncate">{entry.name}</span>
      {entry.type && <span className="text-[#0BA5C7]">{entry.type}</span>}
      {sizesPreview && <span className="text-[#E8923A]">{sizesPreview}</span>}
      {entry.fly_color && <span className="text-[#A8B2BD]">{entry.fly_color}</span>}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
        {label}
        {required && <span className="text-[#E8923A] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
