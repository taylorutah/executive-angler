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
    <figure className="my-10 border-l-2 border-[var(--accent)] pl-6">
      <blockquote className="font-display text-[var(--text-24)] sm:text-[var(--text-30)] font-medium leading-[1.2] text-[var(--text-1)]">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-3 text-[var(--text-13)] text-[var(--text-3)]">
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
