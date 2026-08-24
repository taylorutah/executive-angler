"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Renders children only when near the viewport so heavy widgets stay off LCP. */
export default function LazyHydrate({
  children,
  minHeight = 280,
  className,
}: {
  children: ReactNode;
  minHeight?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {show ? children : <div className="rounded-xl bg-[var(--surface-card)]" style={{ minHeight }} aria-hidden />}
    </div>
  );
}
