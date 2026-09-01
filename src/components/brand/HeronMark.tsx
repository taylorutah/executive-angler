type Props = {
  className?: string;
  title?: string;
  /** Lockup faces the wordmark (right). Journal colophon faces inward (left). */
  facing?: "left" | "right";
  "aria-hidden"?: boolean;
};

/**
 * Identity heron from /brand/heron-mark.svg, painted oxidized copper.
 * The file is an etching when the sibling tracer lands it; until then the
 * slot stays empty — never a stick-figure stroke bird.
 */
export default function HeronMark({
  title = "Executive Angler heron mark",
  className,
  facing = "right",
  "aria-hidden": hidden,
}: Props) {
  return (
    <span
      role={hidden ? "presentation" : "img"}
      aria-label={hidden ? undefined : title}
      aria-hidden={hidden || undefined}
      className={["ea-heron", className].filter(Boolean).join(" ")}
      style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
    />
  );
}
