import Link from "next/link";

interface Props {
  kicker: string;
  title: string;
  href: string;
  label: string;
}

/** Desk landing → index bar. Copper action on the right. */
export default function DeskSeeAll({ kicker, title, href, label }: Props) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-[var(--border-rule)] pb-12 pt-10 sm:flex-row sm:items-end">
      <div className="max-w-[900px]">
        <p className="font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-meta)]">
          {kicker}
        </p>
        <p
          className="mt-2 font-heading text-[28px] font-semibold leading-[34px] text-[var(--text-primary)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          {title}
        </p>
      </div>
      <Link
        href={href}
        className="hover-copper ea-focus-ring shrink-0 font-ui text-[16px] font-medium text-[var(--action)]"
      >
        {label}
      </Link>
    </div>
  );
}
