/**
 * Pass-through wrapper. Used to fade content in on scroll, but the effect
 * (a) hid content above the fold when IntersectionObserver didn't fire on
 * Next.js prerenders and (b) is a dated pattern that modern design
 * consensus has moved away from. Now it just renders children immediately.
 *
 * Kept as a component (not deleted) so the 19 call sites don't have to
 * change. The `delay` and `direction` props are accepted but ignored.
 */

interface ScrollAnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}

export default function ScrollAnimation({
  children,
  className = "",
}: ScrollAnimationProps) {
  return <div className={className}>{children}</div>;
}
