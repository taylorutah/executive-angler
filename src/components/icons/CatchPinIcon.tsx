interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function CatchPinIcon({
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
      {/* Pin shape */}
      <path d="M12 2 C8 2, 5 5, 5 9 C5 14, 12 22, 12 22 C12 22, 19 14, 19 9 C19 5, 16 2, 12 2Z" />
      {/* Small fish inside pin */}
      <path d="M9 9 C10 7.5, 12 7.5, 13 9 C12 10.5, 10 10.5, 9 9Z" />
      <path d="M13 9 L15 7.5" />
      <path d="M13 9 L15 10.5" />
    </svg>
  );
}
