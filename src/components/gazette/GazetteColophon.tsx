import HeronMark from "@/components/brand/HeronMark";

/** Broken hairline with a small heron — still 3 footer ornament. */
export default function GazetteColophon() {
  return (
    <div className="ea-colophon" aria-hidden>
      <span className="ea-colophon-rule" />
      <HeronMark className="h-8 w-[18px] text-[var(--copper)]" />
      <span className="ea-colophon-rule" />
    </div>
  );
}
