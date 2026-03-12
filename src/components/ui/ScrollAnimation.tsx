"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}

export default function ScrollAnimation({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: ScrollAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // iOS Safari has a known IntersectionObserver rootMargin bug that
    // causes whileInView elements to stay at opacity:0 forever on mobile.
    // Skip scroll animations on mobile entirely — content shows immediately.
    setIsMobile(window.innerWidth < 768);
  }, []);

  const initialX = direction === "left" ? -30 : direction === "right" ? 30 : 0;
  const initialY = direction === "up" ? 30 : 0;

  // No animation on mobile or reduced-motion preference
  if (isMobile || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.05 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
