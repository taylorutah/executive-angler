interface Props {
  n: string;
  label: string;
}

/** Index in the margin — 01 / 02 / 03. Overline spec: 12px, 0.06em, --text-3. */
export default function SectionMark({ n, label }: Props) {
  return (
    <p className="ea-overline mb-5 flex items-center gap-3">
      <span className="text-[var(--text-1)]">{n}</span>
      <span aria-hidden className="h-px w-8 bg-[var(--border)]" />
      <span>{label}</span>
    </p>
  );
}
