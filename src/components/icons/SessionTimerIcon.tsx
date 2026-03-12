interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function SessionTimerIcon({
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
      {/* Stem */}
      <line x1="12" y1="2" x2="12" y2="4" />
      {/* Crown buttons */}
      <line x1="10" y1="2" x2="14" y2="2" />
      {/* Watch face */}
      <circle cx="12" cy="13" r="8" />
      {/* Tick marks */}
      <line x1="12" y1="6" x2="12" y2="7.5" />
      <line x1="19" y1="13" x2="17.5" y2="13" />
      <line x1="12" y1="20" x2="12" y2="18.5" />
      <line x1="5" y1="13" x2="6.5" y2="13" />
      {/* Hands */}
      <line x1="12" y1="13" x2="12" y2="8" />
      <line x1="12" y1="13" x2="15.5" y2="15" />
      {/* Center dot */}
      <circle cx="12" cy="13" r="0.75" fill={color} stroke="none" />
    </svg>
  );
}
