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
    default: "bg-[var(--surface-raised)] text-[var(--text-body)]",
    forest: "bg-[var(--action)]/10 text-[var(--action)]",
    river: "bg-[var(--signal-live)]/10 text-[var(--signal-live)]",
    gold: "bg-[var(--action)]/10 text-[var(--action)]",
    outline: "border border-[var(--border-rule)] text-[var(--text-body)]",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-control ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
