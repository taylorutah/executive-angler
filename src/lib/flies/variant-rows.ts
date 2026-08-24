import type { OptionEnvelope } from "@/types/flies";

export type PublicVariantRow = {
  key: string;
  size: string;
  bead: string;
  body: string;
};

function formatSize(n: number | string): string {
  const s = String(n).trim();
  if (!s) return "";
  return s.startsWith("#") ? s : `#${s}`;
}

function beadLabel(envelope: OptionEnvelope): string {
  const sizes = envelope.bead?.sizes_mm ?? [];
  const materials = envelope.bead?.materials ?? [];
  const colors = envelope.bead?.colors ?? [];
  const sizePart =
    sizes.length === 0
      ? ""
      : sizes.length === 1
        ? `${sizes[0]}mm`
        : `${sizes[0]}–${sizes[sizes.length - 1]}mm`;
  const mat = materials[0] ?? "";
  const color = colors[0] ?? "";
  return [sizePart, mat, color].filter(Boolean).join(" · ") || "—";
}

/** Public variant rows from the fly's option envelope. One row per hook size. */
export function publicVariantRows(envelope: OptionEnvelope | null | undefined): PublicVariantRow[] {
  const env = envelope ?? {};
  const sizes = env.sizes ?? [];
  const bead = beadLabel(env);
  const body = env.colors?.body?.[0] ?? "—";
  if (sizes.length === 0) {
    return [{ key: "standard", size: "—", bead, body }];
  }
  return sizes.map((n) => ({
    key: String(n),
    size: formatSize(n),
    bead,
    body,
  }));
}

export function normalizeSizeKey(raw: string | null | undefined): string {
  return (raw ?? "").replace(/^#/, "").trim().toLowerCase();
}
