/**
 * A pull quote is one of only two things allowed to interrupt a field note's
 * prose column. It sets the piece's own words at display scale — it never
 * introduces text the article did not already carry.
 */
export default function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="my-10 border-l-2 border-[var(--action)] pl-6">
      <blockquote className="font-display text-2xl sm:text-[1.75rem] leading-[1.3] text-[var(--text-primary)]">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-3 font-ui text-[13px] text-[var(--text-meta)]">
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
