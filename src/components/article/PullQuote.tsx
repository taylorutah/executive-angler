/**
 * A pull quote is one of only two things allowed to interrupt a field note's
 * prose column. It sets the piece's own words at display scale — it never
 * introduces text the article did not already carry.
 *
 * Lives on the prose column — same left/right edges as body
 * paragraphs. No hanging indent, no UA figure margin.
 */
export default function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="article-pullquote">
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
