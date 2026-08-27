import type { ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  delay?: number;
  index?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}

/**
 * Staged entrance is retired (v4.1 §14). Call sites stay valid; this
 * renders children with no motion.
 */
export default function ScrollAnimation({ children, className = "" }: ScrollAnimationProps) {
  if (className) return <div className={className}>{children}</div>;
  return children;
}
