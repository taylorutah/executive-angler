/**
 * OptionEnvelopeChips — renders the recommended sizes / bead specs / colors
 * as compact informational chips at the top of a fly recipe. Not enforced —
 * just editorial guidance.
 */
import type { OptionEnvelope } from "@/types/flies";

interface Props { envelope: OptionEnvelope; }

export default function OptionEnvelopeChips({ envelope }: Props) {
  const sizes = envelope.sizes ?? [];
  const beadSizes = envelope.bead?.sizes_mm ?? [];
  const beadColors = envelope.bead?.colors ?? [];
  const bodyColors = envelope.colors?.body ?? [];

  if (!sizes.length && !beadSizes.length && !beadColors.length && !bodyColors.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--color-text-muted)]">
      {sizes.length > 0 && <Row label="Sizes"      values={sizes.map((n) => `#${n}`)} />}
      {beadSizes.length > 0 && <Row label="Beads"  values={beadSizes.map((n) => `${n}mm`)} />}
      {beadColors.length > 0 && <Row label="Bead colors" values={beadColors} />}
      {bodyColors.length > 0 && <Row label="Body"  values={bodyColors} />}
    </div>
  );
}

function Row({ label, values }: { label: string; values: (string | number)[] }) {
  if (!values.length) return null;
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="uppercase tracking-wide text-[10px]">{label}</span>
      <span>{values.join(" · ")}</span>
    </span>
  );
}
