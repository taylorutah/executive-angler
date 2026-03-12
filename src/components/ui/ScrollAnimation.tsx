"use client";

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

  const initialX = direction === "left" ? -30 : direction === "right" ? 30 : 0;
  const initialY = direction === "up" ? 30 : 0;

  // If user prefers reduced motion, render immediately without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{
        once: true,
        // amount: trigger when just 1% of the element is visible (very sensitive)
        amount: 0.01,
        // margin: positive bottom margin pre-triggers animations 150px before
        // they scroll into view — critical for mobile iOS Safari reliability
        margin: "0px 0px 150px 0px",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
