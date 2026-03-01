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
    default: "bg-slate-100 text-slate-700",
    forest: "bg-forest/10 text-forest-dark",
    river: "bg-river/10 text-river-dark",
    gold: "bg-gold/10 text-gold",
    outline: "border border-slate-300 text-slate-600",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
