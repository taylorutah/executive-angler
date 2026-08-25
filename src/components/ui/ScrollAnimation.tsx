"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  /** Legacy seconds-style delay from older call sites. Mapped to stagger index. */
  delay?: number;
  /** Sibling index. Wrapped to 0–5 so late-fold cards do not wait seconds. */
  index?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}

function staggerIndex(delay?: number, index?: number): number {
  if (typeof index === "number") return ((index % 6) + 6) % 6;
  if (typeof delay === "number" && delay > 0) {
    return Math.min(5, Math.max(0, Math.round(delay / 0.06)));
  }
  return 0;
}

/**
 * Staged entrance: fade + rise 12px, 60ms sibling stagger, 500ms, once.
 * IntersectionObserver only. Entirely absent under prefers-reduced-motion.
 */
export default function ScrollAnimation({
  children,
  delay,
  index,
  className = "",
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const i = staggerIndex(delay, index);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-entered");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    el.classList.add("enter-pending");
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`enter-block ${className}`.trim()}
      style={{ "--enter-i": i } as CSSProperties}
    >
      {children}
    </div>
  );
}
