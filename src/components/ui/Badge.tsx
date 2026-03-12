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
    default: "bg-[#161B22] text-[#8B949E]",
    forest: "bg-[#E8923A]/10 text-[#E8923A]",
    river: "bg-[#00B4D8]/10 text-[#00B4D8]",
    gold: "bg-[#E8923A]/10 text-[#E8923A]",
    outline: "border border-[#21262D] text-[#8B949E]",
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
