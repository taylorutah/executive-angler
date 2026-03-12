interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function LogCatchIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Fish body */}
      <path d="M2 12 C3 9, 6 7, 10 8 C13 8.5, 15 9.5, 16 12 C15 14.5, 13 15.5, 10 16 C6 17, 3 15, 2 12Z" />
      {/* Tail */}
      <path d="M16 12 L20 9" />
      <path d="M16 12 L20 15" />
      {/* Eye */}
      <circle cx="5.5" cy="11.5" r="0.6" fill={color} stroke="none" />
      {/* Check mark overlay (top right) */}
      <circle cx="18" cy="6" r="4" fill="none" stroke={color} strokeWidth={strokeWidth * 0.8} />
      <path d="M15.5 6 L17.5 8 L20.5 4" strokeWidth={strokeWidth * 0.8} />
    </svg>
  );
}
