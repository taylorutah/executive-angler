import type { SVGProps } from "react";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function TroutIcon({ size = 24, color = "currentColor", strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Body */}
      <path d="M2 12 C3 8, 7 5, 12 6 C16 6.5, 18 8, 19 12 C18 16, 16 17.5, 12 18 C7 19, 3 16, 2 12Z" />
      {/* Forked tail */}
      <path d="M19 12 L23 8" />
      <path d="M19 12 L23 16" />
      {/* Dorsal fin */}
      <path d="M9 6 C10 3.5, 13 3, 15 5.5" />
      {/* Pectoral fin */}
      <path d="M8 12 L6 15" />
      {/* Eye */}
      <circle cx="5.5" cy="11.5" r="0.75" fill={color} stroke="none" />
      {/* Spots */}
      <circle cx="11" cy="10" r="0.5" fill={color} stroke="none" />
      <circle cx="14" cy="11" r="0.5" fill={color} stroke="none" />
      <circle cx="12" cy="13" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}
