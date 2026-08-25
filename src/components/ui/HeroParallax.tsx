"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 2–4px cursor parallax on a hero photograph. Never on text.
 * Disabled under prefers-reduced-motion and on touch.
 */
export default function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const isTouch = navigator.maxTouchPoints > 0 || !hover.matches || !fine.matches;

    if (reduce.matches || isTouch) return;

    const host =
      (el.closest("[data-hero-parallax-host]") as HTMLElement | null) ??
      el.parentElement;
    if (!host) return;

    const max = 3;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = host.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
      const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
      el.style.transform = `translate3d(${(-x * max).toFixed(2)}px, ${(-y * max).toFixed(2)}px, 0) scale(1.025)`;
    };
    const onLeave = () => {
      el.style.transform = "scale(1.025)";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="hero-parallax-layer absolute -inset-3 will-change-transform"
      style={{ transform: "scale(1.025)" }}
    >
      {children}
    </div>
  );
}
