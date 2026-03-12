interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function FlyRodIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Rod — thick at base, tapers to tip */}
      <line x1="3" y1="21" x2="21" y2="3" />
      {/* Reel at base */}
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="5" cy="19" r="1" />
      {/* Grip above reel */}
      <line x1="7" y1="17" x2="9" y2="15" strokeWidth={strokeWidth * 2} />
      {/* Guides along rod */}
      <path d="M12 12 Q13 11, 14 12" />
      <path d="M15 9 Q16 8, 17 9" />
      <path d="M18 6 Q18.5 5.5, 19 6" />
    </svg>
  );
}
