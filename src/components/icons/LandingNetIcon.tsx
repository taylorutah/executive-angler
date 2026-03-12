interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function LandingNetIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Net frame — D shape */}
      <path d="M7 5 Q12 2, 17 5 Q20 8, 20 12 Q20 17, 17 19 L7 19 Z" />
      {/* Handle */}
      <line x1="7" y1="19" x2="3" y2="23" />
      <line x1="7" y1="5" x2="7" y2="19" />
      {/* Net mesh lines vertical */}
      <line x1="11" y1="5" x2="11" y2="19" />
      <line x1="15" y1="6" x2="15" y2="19" />
      {/* Net mesh lines horizontal */}
      <line x1="7" y1="10" x2="20" y2="10" />
      <line x1="7" y1="14" x2="20" y2="14" />
    </svg>
  );
}
