interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function RiverIcon({
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
      <path d="M2 7 C5 5, 7 9, 10 7 C13 5, 15 9, 18 7 C20 6, 21 7, 22 7" />
      <path d="M2 12 C5 10, 7 14, 10 12 C13 10, 15 14, 18 12 C20 11, 21 12, 22 12" />
      <path d="M2 17 C5 15, 7 19, 10 17 C13 15, 15 19, 18 17 C20 16, 21 17, 22 17" />
    </svg>
  );
}
