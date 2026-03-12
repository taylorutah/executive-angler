interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function DryFlyIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Hook */}
      <path d="M14 4 L14 16 Q14 20 10 20 Q7 20 7 17" />
      {/* Body wrap segments */}
      <line x1="12" y1="9" x2="16" y2="9" />
      <line x1="12" y1="11" x2="16" y2="11" />
      <line x1="12" y1="13" x2="16" y2="13" />
      {/* Hackle radiating lines */}
      <line x1="14" y1="7" x2="10" y2="4" />
      <line x1="14" y1="7" x2="9" y2="6" />
      <line x1="14" y1="7" x2="9" y2="8" />
      <line x1="14" y1="7" x2="18" y2="4" />
      <line x1="14" y1="7" x2="19" y2="6" />
      <line x1="14" y1="7" x2="19" y2="8" />
      {/* Tail fibers */}
      <line x1="14" y1="16" x2="18" y2="19" />
      <line x1="14" y1="16" x2="19" y2="16" />
      <line x1="14" y1="16" x2="18" y2="13" />
    </svg>
  );
}
