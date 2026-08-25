/**
 * Executive Angler — Unified Button System
 *
 * Canonical button primitives mirroring the 10-style mockup PDF
 * (docs/design/button-mockups.pdf). All new code MUST use these
 * components instead of inline Tailwind on <button> / <Link>.
 *
 * Variants:
 *  - "solid"   (01) Strava-style copper slab, primary CTAs
 *  - "outline" (02) Copper-bordered ghost, secondary alongside a solid
 *  - "brand"   (03) Salesforce-style soft gradient for admin/forms
 *  - "neutral" (04) White surface with gray border, cancel/back
 *  - "pill"    (05) Soft-tint rounded-full chip CTA
 *  - "tile"    (06) Linear/Notion-style nav tile w/ badge — see <ButtonTile/>
 *  - "stat"    (07) Compact stat pill — see <StatPill/>
 *  - "glass"   (08) Frosted translucent surface for hero overlays
 *  - "hero"    (09) Heavy outline for landing CTAs
 *  - "split"   (10) Primary + dropdown — see <SplitButton/>
 *
 * Sizes: "sm" | "md" | "lg"
 * Renders as <button> by default, or <a>/<Link> when `href` is provided.
 */

import Link from "next/link";
import * as React from "react";
import type { LucideIcon } from "lucide-react";

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
  /** Opt into Strava-loud uppercase + tracking. Default is sentence case (field-journal voice). */
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

const SIZE_CLASSES: Record<Variant, Record<Size, string>> = {
  solid: {
    sm: "px-3.5 py-1.5 text-[11px]",
    md: "px-[18px] py-2.5 text-[13px]",
    lg: "px-6 py-3.5 text-[14px]",
  },
  outline: {
    sm: "px-3 py-1 text-[11px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-[22px] py-3 text-[14px]",
  },
  brand: {
    sm: "px-3.5 py-1 text-[12px]",
    md: "px-[18px] py-[7px] text-[13px]",
    lg: "px-[22px] py-2.5 text-[14px]",
  },
  neutral: {
    sm: "px-3 py-1 text-[12px]",
    md: "px-4 py-[7px] text-[13px]",
    lg: "px-5 py-2.5 text-[14px]",
  },
  pill: {
    sm: "px-3.5 py-1.5 text-[12px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-[22px] py-2.5 text-[14px]",
  },
  ghost: {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-5 py-2.5 text-[14px]",
  },
  glass: {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-[22px] py-3 text-[14px]",
  },
  hero: {
    sm: "px-5 py-3 text-[14px]",
    md: "px-7 py-4 text-[15px]",
    lg: "px-8 py-[18px] text-[16px]",
  },
  destructive: {
    sm: "px-3.5 py-1.5 text-[11px]",
    md: "px-[18px] py-2.5 text-[13px]",
    lg: "px-6 py-3.5 text-[14px]",
  },
};

const ICON_SIZE: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
};

function variantClasses(variant: Variant, loud: boolean | undefined): string {
  const caps = loud ? "uppercase tracking-[0.04em]" : "";
  switch (variant) {
    case "solid":
      return [
        "ea-btn-solid bg-[var(--action)] text-[var(--on-action)] border border-transparent",
        loud ? "font-bold" : "font-semibold",
        caps,
        "rounded hover:bg-[var(--action-hover)] active:bg-[var(--action-hover)]",
        "shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0",
      ].join(" ");
    case "outline":
      return [
        "bg-transparent text-[var(--action)] border-2 border-[var(--action)]",
        loud ? "font-bold" : "font-semibold",
        caps,
        "rounded hover:bg-[var(--action)] hover:text-white",
        "hover:shadow-md hover:-translate-y-px active:translate-y-0",
      ].join(" ");
    case "brand":
      return [
        "bg-gradient-to-b from-[color-mix(in_oklch,var(--action)_72%,white)] to-[var(--action)] text-[var(--on-action)]",
        "border border-[var(--action)] font-semibold",
        "rounded shadow-[var(--elev-inset)]",
        "hover:from-[var(--action)] hover:to-[var(--action-hover)]",
        "hover:shadow-md hover:-translate-y-px active:translate-y-0",
      ].join(" ");
    case "ghost":
      return [
        "bg-transparent text-[var(--text-body)] border border-[var(--border-rule)] font-medium",
        "rounded hover:text-[var(--text-primary)] hover:border-[var(--text-meta)]",
      ].join(" ");
    case "neutral":
      return [
        "bg-white text-[#1A1A1A] border border-[#C9CCD1] font-medium",
        "rounded shadow-[var(--elev-hairline)]",
        "hover:bg-[#F5F5F5]",
      ].join(" ");
    case "pill":
      return [
        "bg-[var(--action)]/[0.16] text-[var(--action)] border border-[var(--action)]/30 font-semibold",
        "rounded-full",
        "hover:bg-[var(--action)]/[0.24]",
      ].join(" ");
    case "glass":
      return [
        "bg-white/10 backdrop-blur-md text-white border border-white/25 font-semibold",
        "rounded-lg",
        "hover:bg-[var(--action)]/40 hover:border-[var(--action)]",
      ].join(" ");
    case "hero":
      return [
        "bg-transparent text-[var(--text-primary)] border-[1.5px] border-[var(--text-primary)] font-bold",
        "rounded-md",
        "hover:bg-[var(--action)] hover:border-[var(--action)] hover:text-white",
      ].join(" ");
    case "destructive":
      return [
        "bg-red-900/30 text-red-400 border border-red-800/50",
        loud ? "font-bold" : "font-semibold",
        caps,
        "rounded hover:bg-red-900/50 hover:text-red-300",
      ].join(" ");
  }
}

const BASE =
  "inline-flex items-center justify-center gap-2 transition-all " +
  "disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[#0D1117] cursor-pointer select-none whitespace-nowrap";

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
    BASE,
    variantClasses(variant, loud),
    SIZE_CLASSES[variant][size],
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

/* ───────────────────────── ButtonTile (variant 06) ───────────────────────── */

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
  iconColor = "var(--action)",
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
    "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-rule)] rounded-xl " +
    "hover:border-[var(--action)] hover:bg-[var(--action)]/[0.08] transition-all " +
    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--action)] " +
    className;

  const inner = (
    <>
      <Icon className={iconSize} style={{ color: iconColor }} aria-hidden />
      <div className="text-[12.5px] font-semibold leading-tight">{label}</div>
      {sub && <div className="text-[10.5px] text-[var(--text-body)] leading-tight">{sub}</div>}
      {badge != null && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 bg-[var(--action)] text-[var(--on-action)] text-[10px] font-bold rounded-full inline-flex items-center justify-center border-2 border-[var(--surface-page)] font-mono leading-none"
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

/* ───────────────────────── StatPill (variant 07) ───────────────────────── */

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
    accent === "teal"
      ? "text-[var(--signal-live)]"
      : accent === "white"
        ? "text-[var(--text-primary)]"
        : "text-[var(--action)]";
  const padding =
    size === "sm" ? "px-2.5 py-1 text-[11px]" : size === "lg" ? "px-4 py-2.5 text-[14px]" : "px-3 py-1.5 text-[12px]";

  const classes =
    `inline-flex items-center gap-2 ${padding} font-mono ` +
    "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-rule)] rounded-full " +
    "hover:border-[var(--action)]/60 hover:bg-[#1F2630] transition-all cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] " +
    className;

  const inner = (
    <>
      <span className={`${accentColor} font-bold tabular-nums`}>{value}</span>
      <span className="text-[var(--text-body)] lowercase">{label}</span>
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

/* ───────────────────────── SplitButton (variant 10) ─────────────────────── */

import { ChevronDown } from "lucide-react";

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
    size === "sm" ? "px-3 py-1.5 text-[12px]" : size === "lg" ? "px-[22px] py-3 text-[14px]" : "px-4 py-2 text-[13px]";
  const caretPadding =
    size === "sm" ? "px-2 py-1.5" : size === "lg" ? "px-3 py-3" : "px-2.5 py-2";
  const iconSize = ICON_SIZE[size];

  const wrap =
    `inline-flex items-stretch rounded shadow-sm border border-[var(--action)] overflow-hidden ${className}`;
  const primaryCls =
    `${padding} ${iconSize ? "" : ""} bg-[var(--action)] text-[var(--on-action)] font-semibold inline-flex items-center gap-2 hover:bg-[var(--action-hover)] cursor-pointer transition-colors`;
  const caretCls =
    `${caretPadding} bg-[var(--action)] text-[var(--on-action)] border-l border-[var(--action)] inline-flex items-center hover:bg-[var(--action-hover)] cursor-pointer transition-colors`;

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
      <button type="button" onClick={onCaret} className={caretCls} aria-label="More options">
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}
