"use client";

/**
 * FlyCardModal — branded printable/shareable recipe card.
 *
 * Renders a light-themed Executive Angler card for a fly pattern in a modal.
 * The card itself is real DOM (cream/copper/forest palette) and is converted
 * to a PNG on demand for download, clipboard copy, native share, or print.
 */

import { useEffect, useRef, useState } from "react";
import { X, Download, Copy, Share2, Printer, Loader2 } from "lucide-react";
import { domToBlob } from "modern-screenshot";

type FlyForCard = {
  id?: string;
  name?: string;
  type?: string;
  size?: string;
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  bead_material?: string;
  bead_size_mm?: string | number | null;
  fly_color?: string;
  body_color?: string;
  body_material?: string;
  tail_color?: string;
  thorax_color?: string;
  collar_color?: string;
  rib_material?: string;
  wing_material?: string;
  materials?: string;
  description?: string;
  tags?: string;
  image_url?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  fly: FlyForCard;
  imageUrl?: string | null;
  username?: string | null;
};

const CARD_BG = "#F7F3EC";
const CARD_INK = "#1F2937";
const CARD_INK_MUTED = "#6B7280";
const CARD_BORDER = "#D4CBB8";
const CARD_COPPER = "#D4751F";
const CARD_FOREST = "#1F3A2E";

const BEAD_MATERIAL_LABEL: Record<string, string> = {
  none: "None",
  brass: "Brass",
  tungsten: "Tungsten",
  slotted_tungsten: "Slotted tungsten",
  copper: "Copper",
  other: "Other",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fly-recipe";
}

function formatBead(fly: FlyForCard): string | null {
  const parts: string[] = [];
  if (fly.bead_material) {
    parts.push(BEAD_MATERIAL_LABEL[fly.bead_material] ?? fly.bead_material);
  }
  if (fly.bead_size_mm !== null && fly.bead_size_mm !== undefined && fly.bead_size_mm !== "") {
    parts.push(`${fly.bead_size_mm}mm`);
  } else if (fly.bead_size) {
    parts.push(fly.bead_size);
  }
  if (fly.bead_color) parts.push(fly.bead_color);
  return parts.length ? parts.join(" · ") : null;
}

function formatBody(fly: FlyForCard): string | null {
  const parts: string[] = [];
  if (fly.body_color) parts.push(fly.body_color);
  if (fly.body_material) parts.push(fly.body_material);
  return parts.length ? parts.join(" · ") : null;
}

export default function FlyCardModal({ open, onClose, fly, imageUrl, username }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseDownOnBackdropRef = useRef(false);
  const [busy, setBusy] = useState<null | "download" | "copy" | "share" | "print">(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" &&
        typeof (navigator as Navigator).canShare === "function" &&
        typeof (navigator as Navigator).share === "function",
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  // Inject print stylesheet so window.print() only outputs the card
  useEffect(() => {
    if (!open) return;
    const style = document.createElement("style");
    style.setAttribute("data-fly-card-print", "1");
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #ea-fly-card-printable, #ea-fly-card-printable * { visibility: visible !important; }
        #ea-fly-card-printable {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          box-shadow: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [open]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2400);
    return () => clearTimeout(t);
  }, [status]);

  function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  }
  function handleBackdropMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    const wasBackdropDown = mouseDownOnBackdropRef.current;
    mouseDownOnBackdropRef.current = false;
    if (wasBackdropDown && e.target === e.currentTarget && !busy) {
      onClose();
    }
  }

  async function generateBlob(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const render = domToBlob(cardRef.current, {
      scale: 2,
      backgroundColor: CARD_BG,
      type: "image/png",
      features: { removeControlCharacter: true },
    });
    const timeout = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Image render timed out")), 15000)
    );
    return await Promise.race([render, timeout]);
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error("No card to render");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(fly.name || "fly-recipe")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Defer revoke so the browser has time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus({ kind: "ok", msg: "Saved" });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Download failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    setBusy("copy");
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error("No card to render");
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("Clipboard images not supported in this browser");
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus({ kind: "ok", msg: "Copied to clipboard" });
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Copy failed" });
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error("No card to render");
      const file = new File([blob], `${slugify(fly.name || "fly-recipe")}.png`, { type: "image/png" });
      const data: ShareData = {
        files: [file],
        title: fly.name || "Fly recipe",
        text: `${fly.name || "Fly"} — Executive Angler`,
      };
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share(data);
        setStatus({ kind: "ok", msg: "Shared" });
      } else {
        throw new Error("Share not supported on this device");
      }
    } catch (err) {
      // ignore user-cancel
      if (err instanceof Error && err.name === "AbortError") {
        setBusy(null);
        return;
      }
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Share failed" });
    } finally {
      setBusy(null);
    }
  }

  function handlePrint() {
    setBusy("print");
    try {
      window.print();
    } finally {
      setBusy(null);
    }
  }

  if (!open) return null;

  const hookSizes = (fly.size || "").trim();
  const beadStr = formatBead(fly);
  const bodyStr = formatBody(fly);
  const tagList = (fly.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);

  type SpecRow = { label: string; value: string };
  const specRows: SpecRow[] = [];
  if (fly.hook) specRows.push({ label: "Hook", value: fly.hook });
  if (beadStr) specRows.push({ label: "Bead", value: beadStr });
  if (bodyStr) specRows.push({ label: "Body", value: bodyStr });
  if (fly.tail_color) specRows.push({ label: "Tail", value: fly.tail_color });
  if (fly.thorax_color) specRows.push({ label: "Thorax", value: fly.thorax_color });
  if (fly.collar_color) specRows.push({ label: "Collar", value: fly.collar_color });
  if (fly.rib_material) specRows.push({ label: "Rib", value: fly.rib_material });
  if (fly.wing_material) specRows.push({ label: "Wing", value: fly.wing_material });

  const recipe = (fly.materials || "").trim();
  const notes = (fly.description || "").trim();

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0D1117]/85 backdrop-blur-sm p-0 sm:p-4"
        onMouseDown={handleBackdropMouseDown}
        onMouseUp={handleBackdropMouseUp}
        role="presentation"
      >
        <div
          className="w-full sm:max-w-xl bg-[#161B22] border border-[#21262D] sm:rounded-2xl rounded-t-2xl max-h-[94vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Recipe card for ${fly.name || "fly pattern"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[#21262D]">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#6E7681]">Recipe Card</p>
              <h2 className="font-heading text-base font-bold text-[#F0F6FC] truncate">
                {fly.name || "Untitled fly"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#6E7681] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Card preview area (scrollable on tall content) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0D1117]/60 flex justify-center items-start">
            <div
              ref={cardRef}
              id="ea-fly-card-printable"
              className="w-full max-w-[560px] shadow-2xl"
              style={{
                background: CARD_BG,
                color: CARD_INK,
                borderRadius: 16,
                overflow: "hidden",
                fontFamily:
                  "var(--font-sans), 'DM Sans', system-ui, -apple-system, sans-serif",
              }}
            >
              {/* Brand header strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: `1px solid ${CARD_BORDER}`,
                  background: "#FFFFFF",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    aria-hidden
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: CARD_FOREST,
                      color: CARD_BG,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily:
                        "var(--font-heading), system-ui, sans-serif",
                      fontSize: 17,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    EA
                  </div>
                  <div style={{ lineHeight: 1.1 }}>
                    <div
                      style={{
                        fontFamily:
                          "var(--font-heading), system-ui, sans-serif",
                        fontSize: 14,
                        color: CARD_FOREST,
                        letterSpacing: "0.01em",
                      }}
                    >
                      Executive Angler
                    </div>
                    <div
                      style={{
                        fontSize: 9.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: CARD_INK_MUTED,
                        marginTop: 1,
                      }}
                    >
                      Fly Recipe
                    </div>
                  </div>
                </div>
                {fly.type && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: CARD_COPPER,
                      border: `1px solid ${CARD_COPPER}66`,
                      background: "#D4751F14",
                      padding: "4px 9px",
                      borderRadius: 999,
                    }}
                  >
                    {fly.type}
                  </div>
                )}
              </div>

              {/* Hero block — photo + name + chips */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 20,
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    width: 132,
                    height: 132,
                    flexShrink: 0,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#EDE8DF",
                    border: `1px solid ${CARD_BORDER}`,
                    position: "relative",
                  }}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={fly.name || ""}
                      crossOrigin="anonymous"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: CARD_INK_MUTED,
                        fontSize: 28,
                      }}
                    >
                      🪰
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <h1
                    style={{
                      fontFamily:
                        "var(--font-heading), system-ui, sans-serif",
                      fontSize: 26,
                      lineHeight: 1.1,
                      fontWeight: 400,
                      color: CARD_FOREST,
                      margin: 0,
                      wordBreak: "break-word",
                    }}
                  >
                    {fly.name || "Untitled fly"}
                  </h1>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {hookSizes && (
                      <SpecChip label="Sizes" value={hookSizes} />
                    )}
                    {fly.fly_color && (
                      <SpecChip label="Color" value={fly.fly_color} />
                    )}
                  </div>

                  {tagList.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
                      {tagList.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 10,
                            color: CARD_INK_MUTED,
                            background: "#EDE8DF",
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Spec grid */}
              {specRows.length > 0 && (
                <div
                  style={{
                    padding: "0 20px 16px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 20px",
                  }}
                >
                  {specRows.map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        paddingTop: 8,
                        borderTop: `1px solid ${CARD_BORDER}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: CARD_INK_MUTED,
                          fontWeight: 600,
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: CARD_INK,
                          lineHeight: 1.35,
                          wordBreak: "break-word",
                        }}
                      >
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recipe notes */}
              {recipe && (
                <div
                  style={{
                    margin: "0 20px 16px 20px",
                    padding: 14,
                    background: "#FFFFFF",
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: CARD_COPPER,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Tying Recipe
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace",
                      fontSize: 11.5,
                      lineHeight: 1.55,
                      color: CARD_INK,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {recipe.length > 900 ? `${recipe.slice(0, 900).trimEnd()}…` : recipe}
                  </div>
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div
                  style={{
                    margin: recipe ? "0 20px 16px 20px" : "0 20px 16px 20px",
                    padding: "0 2px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: CARD_INK_MUTED,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Notes
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      color: CARD_INK,
                      fontStyle: "italic",
                    }}
                  >
                    {notes.length > 320 ? `${notes.slice(0, 320).trimEnd()}…` : notes}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  borderTop: `1px solid ${CARD_BORDER}`,
                  padding: "10px 20px 14px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: CARD_FOREST,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}
                >
                  executiveangler.com
                </div>
                <div style={{ fontSize: 10.5, color: CARD_INK_MUTED }}>
                  {username ? `Tied by @${username}` : "Personal fly box"}
                </div>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="border-t border-[#21262D] px-4 py-3 bg-[#0D1117]">
            {status && (
              <p
                className={`text-xs mb-2 ${status.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}
                role="status"
              >
                {status.msg}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <ActionButton
                label="Save"
                Icon={Download}
                onClick={handleDownload}
                busy={busy === "download"}
                disabled={busy !== null}
                primary
              />
              <ActionButton
                label="Copy"
                Icon={Copy}
                onClick={handleCopy}
                busy={busy === "copy"}
                disabled={busy !== null}
              />
              {canShare && (
                <ActionButton
                  label="Share"
                  Icon={Share2}
                  onClick={handleShare}
                  busy={busy === "share"}
                  disabled={busy !== null}
                />
              )}
              <ActionButton
                label="Print"
                Icon={Printer}
                onClick={handlePrint}
                busy={busy === "print"}
                disabled={busy !== null}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 5,
        background: "#FFFFFF",
        border: `1px solid ${CARD_BORDER}`,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11.5,
        color: CARD_INK,
      }}
    >
      <span
        style={{
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: CARD_INK_MUTED,
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </span>
  );
}

function ActionButton({
  label,
  Icon,
  onClick,
  busy,
  disabled,
  primary,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  busy: boolean;
  disabled: boolean;
  primary?: boolean;
}) {
  const cls = primary
    ? "bg-[#E8923A] text-[#0D1117] hover:bg-[#F0A45A] disabled:opacity-50"
    : "border border-[#21262D] bg-[#161B22] text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 disabled:opacity-50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${cls}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
