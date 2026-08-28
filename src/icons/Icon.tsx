import { forwardRef, type CSSProperties, type SVGProps } from "react";
import { GLYPHS, type Optical } from "./glyphs";
import { iconMark, isIconName, type IconName } from "./names";

export type { IconName };

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
  title?: string;
  color?: string;
  fill?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
} & Omit<SVGProps<SVGSVGElement>, "name" | "color" | "fill" | "strokeWidth">;

const CLASS_SIZE: Array<[RegExp, number]> = [
  [/\bh-3(?:\.5)?\b/, 16],
  [/\bh-4\b/, 16],
  [/\bh-\[18px\]\b/, 20],
  [/\bh-5\b/, 20],
  [/\bh-6\b/, 24],
  [/\bh-7\b/, 24],
];

export function opticalFor(size: number | undefined, className?: string): Optical {
  let px = size;
  if (px == null && className) {
    for (const [re, value] of CLASS_SIZE) {
      if (re.test(className)) {
        px = value;
        break;
      }
    }
  }
  const resolved = px ?? 24;
  if (resolved <= 17) return 16;
  if (resolved <= 22) return 20;
  return 24;
}

function isFilled(filled: boolean | undefined, fill: string | undefined, className?: string): boolean {
  if (filled) return true;
  if (fill && fill !== "none") return true;
  return Boolean(className && /\bfill-current\b/.test(className));
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    name,
    size,
    className,
    filled,
    title,
    color,
    fill,
    style,
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const optical = opticalFor(size, className);
  const width = size ?? optical;
  const inked = isFilled(filled, fill, className);

  if (!isIconName(name) || !GLYPHS[name]) {
    const mark = iconMark(String(name));
    return (
      <span
        className={["ea-icon-mark inline-flex items-center justify-center font-ui uppercase tracking-[0.08em] leading-none", className]
          .filter(Boolean)
          .join(" ")}
        style={{
          width,
          height: width,
          fontSize: Math.max(8, width * 0.42),
          fontVariant: "small-caps",
          ...style,
        }}
        aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
        aria-label={ariaLabel}
        data-icon="missing"
        title={title ?? String(name)}
      >
        {mark}
      </span>
    );
  }

  const hidden = ariaHidden ?? (ariaLabel || title ? undefined : true);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox={`0 0 ${optical} ${optical}`}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={hidden}
      aria-label={ariaLabel}
      data-icon={name}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {GLYPHS[name](optical, inked)}
    </svg>
  );
});
