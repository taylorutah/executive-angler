import Link from "next/link";

export const CONTRIBUTE_BODY =
  "If something here is thin or wrong, add what you know. It goes to review before it publishes.";

interface Props {
  heading?: string;
  body?: string;
  href: string;
  buttonLabel: string;
}

export default function ContributeStrip({
  heading = "Contribute",
  body = CONTRIBUTE_BODY,
  href,
  buttonLabel,
}: Props) {
  return (
    <section className="mt-16 border-t border-[var(--border)] pt-10" aria-labelledby="contribute-heading">
      <h2 id="contribute-heading" className="font-display text-[length:var(--text-24)] font-semibold leading-[1.2] text-[var(--text-1)]">
        {heading}
      </h2>
      <p className="mt-3 max-w-[var(--prose)] text-[length:var(--text-16)] leading-[1.55] text-[var(--text-2)]">{body}</p>
      <Link href={href} className="ea-btn ea-btn-secondary mt-6 inline-flex">{buttonLabel}</Link>
    </section>
  );
}
