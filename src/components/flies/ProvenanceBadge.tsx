/**
 * ProvenanceBadge — tiny "YOURS" pill rendered next to recipe values that
 * came from the viewer's personalization rather than the canonical default.
 * Visual contract: copper text, uppercase, monospace-ish letterspacing, sits
 * next to the value at the same baseline as the slot label.
 */
export default function ProvenanceBadge({
  size = "sm",
  label = "Yours",
}: {
  size?: "xs" | "sm";
  label?: string;
}) {
  const cls =
    size === "xs"
      ? "text-[8.5px] px-1 py-px"
      : "text-[9.5px] px-1.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-[0.12em] rounded-control bg-[var(--action)]/10 text-[var(--action)] border border-[var(--action)]/30 ${cls}`}
    >
      {label}
    </span>
  );
}
