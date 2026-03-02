"use client";

import { motion } from "framer-motion";

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
  const initialX = direction === "left" ? -30 : direction === "right" ? 30 : 0;
  const initialY = direction === "up" ? 30 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "0px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
