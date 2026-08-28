interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "forest" | "river" | "gold" | "outline";
  size?: "sm" | "md";
}

export default function Badge({
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  const variants = {
    default: "bg-[var(--paper-deep)] text-[var(--text-2)]",
    forest: "bg-[var(--accent-soft)] text-[var(--accent)]",
    river: "bg-[var(--accent-soft)] text-[var(--accent)]",
    gold: "bg-[var(--accent-soft)] text-[var(--accent)]",
    outline: "border border-[var(--border)] text-[var(--text-2)]",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-chip ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
