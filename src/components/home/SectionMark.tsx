interface Props {
  n: string;
  label: string;
}

/** Copper index in the margin — 01 / 02 / 03. */
export default function SectionMark({ n, label }: Props) {
  return (
    <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
      <span className="text-[var(--action)]">{n}</span>
      <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
      <span>{label}</span>
    </p>
  );
}
