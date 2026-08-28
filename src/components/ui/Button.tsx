/**
 * Executive Angler — Unified Button System
 *
 * Canonical button primitives on the §4 button spec (.ea-btn family in
 * globals.css): 32/40/48 tall, radius-md, Inter 14–15/500, no shadows,
 * no transforms. All new code MUST use these components instead of
 * inline Tailwind on <button> / <Link>.
 *
 * Variants (legacy names kept; all resolve to the token language):
 *  - "solid" / "brand"          → primary (accent fill)
 *  - "outline" / "neutral" / "glass" / "hero" → secondary (hairline border)
 *  - "ghost"                    → ghost (borderless)
 *  - "destructive"              → danger fill
 *  - "pill"                     → accent-soft tag CTA (radius-md — pill
 *                                 radius is reserved for chips and tags)
 *  - "tile"                     → nav tile w/ badge — see <ButtonTile/>
 *  - "stat"                     → compact stat tag — see <StatPill/>
 *  - "split"                    → primary + dropdown — see <SplitButton/>
 *
 * Sizes: "sm" | "md" | "lg"
 * Renders as <button> by default, or <a>/<Link> when `href` is provided.
 */

import Link from "next/link";
import * as React from "react";
import type { LucideIcon } from "@/icons";

type Size = "sm" | "md" | "lg";
type Variant =
  | "solid"
  | "outline"
  | "brand"
  | "neutral"
  | "pill"
  | "ghost"
  | "glass"
  | "hero"
  | "destructive";

interface CommonProps {
  size?: Size;
  variant?: Variant;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
  /** Opt into uppercase + tracking. Default is sentence case (field-journal voice). */
  loud?: boolean;
}

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    target?: string;
    rel?: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const SIZE_CLASSES: Record<Size, string> = {
  sm: "ea-btn-sm",
  md: "",
  lg: "ea-btn-lg",
};

const ICON_SIZE: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
};

function variantClasses(variant: Variant): string {
  switch (variant) {
    case "solid":
    case "brand":
      return "ea-btn-primary";
    case "outline":
    case "neutral":
    case "glass":
    case "hero":
      return "ea-btn-secondary";
    case "ghost":
      return "ea-btn-ghost";
    case "destructive":
      return "ea-btn-danger";
    case "pill":
      return "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface))]";
  }
}

export function Button(props: ButtonProps) {
  const {
    size = "md",
    variant = "solid",
    icon: Icon,
    iconRight: IconRight,
    children,
    className = "",
    fullWidth,
    loading,
    loud,
    ...rest
  } = props as CommonProps & Record<string, unknown>;

  const classes = [
    "ea-btn ea-focus-ring",
    variantClasses(variant),
    SIZE_CLASSES[size],
    loud ? "uppercase tracking-[0.04em]" : "",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {loading ? (
        <span
          aria-hidden
          className={`${ICON_SIZE[size]} animate-spin rounded-full border-2 border-current border-r-transparent`}
        />
      ) : Icon ? (
        <Icon className={ICON_SIZE[size]} aria-hidden />
      ) : null}
      {children}
      {IconRight ? <IconRight className={ICON_SIZE[size]} aria-hidden /> : null}
    </>
  );

  if ("href" in props && props.href != null) {
    const { href, target, rel, ...anchorRest } = rest as {
      href: string;
      target?: string;
      rel?: string;
    } & Record<string, unknown>;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...(anchorRest as Record<string, unknown>)}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={(rest as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
      className={classes}
      disabled={(rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled || loading}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {inner}
    </button>
  );
}

/* ───────────────────────── ButtonTile ───────────────────────── */

interface ButtonTileProps {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  sub?: string;
  badge?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ButtonTile({
  href,
  onClick,
  icon: Icon,
  iconColor = "var(--accent)",
  label,
  sub,
  badge,
  size = "md",
  className = "",
}: ButtonTileProps) {
  const padding =
    size === "sm" ? "p-2.5" : size === "lg" ? "p-4" : "px-3.5 py-3";
  const minWidth =
    size === "sm" ? "min-w-[78px]" : size === "lg" ? "min-w-[120px]" : "min-w-[92px]";
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const classes =
    `relative inline-flex flex-col items-start gap-1.5 ${padding} ${minWidth} ` +
    "bg-[var(--surface)] text-[var(--text-1)] border border-[var(--border)] rounded-[var(--radius-card)] " +
    "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors " +
    "ea-focus-ring cursor-pointer " +
    "motion-reduce:transition-none " +
    className;

  const inner = (
    <>
      <Icon className={iconSize} style={{ color: iconColor }} aria-hidden />
      <div className="text-[13px] font-medium leading-tight">{label}</div>
      {sub && <div className="text-[12px] text-[var(--text-2)] leading-tight">{sub}</div>}
      {badge != null && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 bg-[var(--accent)] text-[var(--on-action)] text-[12px] font-medium rounded-full inline-flex items-center justify-center border-2 border-[var(--paper)] num leading-none"
        >
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

/* ───────────────────────── StatPill ───────────────────────── */

interface StatPillProps {
  href?: string;
  onClick?: () => void;
  value: React.ReactNode;
  label: string;
  accent?: "copper" | "teal" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatPill({
  href,
  onClick,
  value,
  label,
  accent = "copper",
  size = "md",
  className = "",
}: StatPillProps) {
  const accentColor =
    accent === "white"
      ? "text-[var(--text-1)]"
      : "text-[var(--accent)]";
  const padding =
    size === "sm" ? "px-2.5 py-1 text-[12px]" : size === "lg" ? "px-4 py-2.5 text-[14px]" : "px-3 py-1.5 text-[12px]";

  const classes =
    `inline-flex items-center gap-2 ${padding} ` +
    "bg-[var(--surface)] text-[var(--text-1)] border border-[var(--border)] rounded-full " +
    "hover:border-[var(--accent)] hover:bg-[var(--paper-deep)] transition-colors cursor-pointer " +
    "ea-focus-ring " +
    "motion-reduce:transition-none " +
    className;

  const inner = (
    <>
      <span className={`${accentColor} font-semibold num`}>{value}</span>
      <span className="text-[var(--text-2)] lowercase">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

/* ───────────────────────── SplitButton ─────────────────────── */

import { ChevronDown } from "@/icons";

interface SplitButtonProps {
  primaryHref?: string;
  onPrimary?: () => void;
  onCaret?: () => void;
  icon?: LucideIcon;
  label: string;
  size?: Size;
  className?: string;
}

export function SplitButton({
  primaryHref,
  onPrimary,
  onCaret,
  icon: Icon,
  label,
  size = "md",
  className = "",
}: SplitButtonProps) {
  const padding =
    size === "sm" ? "h-8 px-3.5 text-sm" : size === "lg" ? "h-12 px-5 text-[15px]" : "h-10 px-4 text-sm";
  const caretPadding =
    size === "sm" ? "h-8 px-2" : size === "lg" ? "h-12 px-3" : "h-10 px-2.5";
  const iconSize = ICON_SIZE[size];

  const wrap =
    `inline-flex items-stretch rounded-[var(--radius-md)] border border-[var(--accent)] overflow-hidden ${className}`;
  const primaryCls =
    `${padding} bg-[var(--accent)] text-[var(--on-action)] font-medium inline-flex items-center gap-2 hover:bg-[var(--accent-hover)] cursor-pointer transition-colors`;
  const caretCls =
    `${caretPadding} bg-[var(--accent)] text-[var(--on-action)] border-l border-[var(--accent-hover)] inline-flex items-center hover:bg-[var(--accent-hover)] cursor-pointer transition-colors`;

  return (
    <div className={wrap}>
      {primaryHref ? (
        <Link href={primaryHref} className={primaryCls}>
          {Icon && <Icon className={iconSize} aria-hidden />}
          {label}
        </Link>
      ) : (
        <button type="button" onClick={onPrimary} className={primaryCls}>
          {Icon && <Icon className={iconSize} aria-hidden />}
          {label}
        </button>
      )}
      <button type="button" onClick={onCaret} className={`ea-focus-ring ${caretCls}`} aria-label="More options">
        <ChevronDown className={iconSize} aria-hidden />
      </button>
    </div>
  );
}
