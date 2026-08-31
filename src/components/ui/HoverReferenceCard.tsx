import Link from "next/link";
import type { CardData } from "@/types/list-config";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { MOTION_SAFE } from "@/components/layout/nav/links";

/**
 * Listing card with a desktop-only hover/focus reference panel.
 * Default face matches EntityCard (photo, name, one key line).
 * The panel crossfades the whole card to paper-deep: the name stays
 * visible, one live measure can lead, then labeled facts, a sans brief,
 * and a footer. Mobile never shows the panel.
 */

const FEATURED_LABELS = new Set(["Now", "Flow"]);

function splitMeasure(value: string): { amount: string; unit: string } {
  const match = value.trim().match(/^(.+?)\s+([A-Za-zµ%\/°]+)$/);
  if (!match) return { amount: value, unit: "" };
  return { amount: match[1], unit: match[2] };
}

export default function HoverReferenceCard({
  href,
  imageUrl,
  imageAlt,
  title,
  kicker,
  subtitle,
  meta,
  badges,
  hoverPanel,
  imageContain,
}: CardData) {
  const chips = hoverPanel?.chips ?? [];
  const brief = hoverPanel?.brief?.trim() ?? "";
  const footer = hoverPanel?.footer?.trim() ?? "";
  const showPanel = chips.length > 0 || brief || footer;
  const featured = chips.find((chip) => FEATURED_LABELS.has(chip.label));
  const factChips = featured ? chips.filter((chip) => chip !== featured) : chips;
  const measure = featured ? splitMeasure(featured.value) : null;
  const factCols =
    factChips.length === 2 || factChips.length > 3
      ? "grid-cols-2"
      : factChips.length <= 1
        ? "grid-cols-1"
        : "grid-cols-3";

  return (
    <Link
      href={href}
      className="group relative block card-hover overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <div className={`relative h-44 overflow-hidden${imageContain ? " bg-[var(--paper-deep)]" : ""}`}>
        <SafeEntityImage
          src={imageUrl}
          alt={imageAlt}
          title={title}
          meta={[meta, subtitle].filter(Boolean).join(" · ") || undefined}
          contain={imageContain}
          loading="eager"
          className={imageContain ? "object-contain p-3" : "ea-photo"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="rounded-[var(--radius-sm)] bg-[var(--ink)] px-2 py-1 text-xs font-medium text-[var(--paper)]">
              {badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--text-2)] line-clamp-2">{subtitle}</p>
        )}
        {meta && (
          <p className="ea-overline mt-2">
            {meta}
          </p>
        )}
      </div>
      {showPanel && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 hidden flex-col bg-[var(--paper-deep)] p-6 opacity-0 transition-opacity duration-200 ease-standard md:flex group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:group-hover:opacity-0 ${MOTION_SAFE}`}
        >
          <div
            data-excerpt-rule
            className="mb-[var(--space-3)] h-[2px] w-[var(--space-6)] bg-[var(--accent)]"
          />
          {kicker && <p className="ea-overline">{kicker}</p>}
          <p className={`font-heading [font-size:var(--text-18)] font-semibold leading-[1.2] text-[var(--text-1)] line-clamp-2 ${kicker ? "mt-1" : ""}`}>
            {title}
          </p>
          {featured && measure && (
            <div className="mt-3">
              <p className="ea-stat-label">{featured.label}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="num font-heading [font-size:var(--text-18)] font-semibold leading-none text-[var(--text-1)]">
                  {measure.amount}
                </span>
                {measure.unit ? (
                  <span className="ea-overline">{measure.unit}</span>
                ) : null}
              </p>
            </div>
          )}
          {factChips.length > 0 && (
            <dl className={`mt-3 grid shrink-0 gap-x-3 gap-y-2 ${factCols}`}>
              {factChips.map((chip, i) => (
                <div key={`${chip.label}:${chip.value}:${i}`} className="min-w-0">
                  <dt className="ea-stat-label truncate">{chip.label}</dt>
                  <dd className="mt-0.5 font-medium [font-size:var(--text-14)] leading-tight text-[var(--text-1)] truncate">
                    {chip.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {brief && (
            <p className={`min-h-0 flex-1 font-sans [font-size:var(--text-14)] leading-[1.45] text-[var(--text-2)] ${featured ? "mt-3 line-clamp-2" : "mt-3 line-clamp-3"}`}>
              {brief}
            </p>
          )}
          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            {footer ? (
              <p className="ea-overline min-w-0 line-clamp-2">{footer}</p>
            ) : (
              <span />
            )}
            <p className="ea-overline shrink-0 text-[var(--accent)]">Open</p>
          </div>
        </div>
      )}
    </Link>
  );
}
