import type { CSSProperties, SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  title?: string;
};

const MARK_MASK: CSSProperties = {
  backgroundColor: "currentColor",
  WebkitMaskImage: "url(/brand/heron-mark.svg)",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  WebkitMaskSize: "contain",
  maskImage: "url(/brand/heron-mark.svg)",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  maskSize: "contain",
};

/**
 * Copperplate heron etching from /brand/heron-mark.svg.
 * Color comes from currentColor — header sets oxidized copper.
 * Do not invent a bird. Do not put this in a circle.
 */
export default function HeronMark({
  title = "Executive Angler heron mark",
  className,
  style,
  ...props
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1584 2882"
      role="img"
      aria-label={title}
      className={className}
      style={{ ...MARK_MASK, ...style }}
      {...props}
    >
      <title>{title}</title>
    </svg>
  );
}
