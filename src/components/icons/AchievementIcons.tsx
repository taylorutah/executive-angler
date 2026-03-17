// Custom achievement icons for Executive Angler
// 48x48 viewBox — bold, clean, recognizable at badge sizes
// All use currentColor — inherit badge color automatically

interface IconProps {
  className?: string;
}

// First Timer — single fly fishing cast: angler silhouette casting a loop
export function IconFirstTimer({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fly line loop in air */}
      <path d="M8 12 Q20 4 32 8 Q38 10 36 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Rod */}
      <path d="M36 18 L40 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      {/* Grip/handle */}
      <rect x="38" y="32" width="5" height="10" rx="2.5" fill="currentColor" fillOpacity="0.6" transform="rotate(15 38 32)"/>
      {/* Reel */}
      <circle cx="38" cy="33" r="3" stroke="currentColor" strokeWidth="2"/>
      {/* Fly at end of line */}
      <circle cx="8" cy="12" r="2" fill="currentColor"/>
      <path d="M6 10 Q4 8 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 10 Q12 8 11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Water line */}
      <path d="M4 42 Q12 39 20 41 Q28 43 36 40 Q42 38 46 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fillOpacity="0.4"/>
    </svg>
  );
}

// Regular — fly rod with classic S-curve cast
export function IconRegular({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rod — tapered */}
      <line x1="6" y1="42" x2="44" y2="6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="18" y1="30" x2="44" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35"/>
      {/* Cork grip */}
      <rect x="4" y="38" width="8" height="6" rx="3" fill="currentColor" fillOpacity="0.5" transform="rotate(-45 4 38)"/>
      {/* Reel seat */}
      <circle cx="10" cy="36" r="5" stroke="currentColor" strokeWidth="2.2"/>
      <circle cx="10" cy="36" r="1.5" fill="currentColor"/>
      {/* Fly line — classic S-curve roll cast */}
      <path d="M44 6 Q52 18 40 24 Q30 30 38 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Fly */}
      <path d="M36 40 Q34 38 32 40 Q34 42 36 40Z" fill="currentColor"/>
      <path d="M36 38 Q38 36 40 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Veteran — wading boots pair, side profile
export function IconVeteran({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left boot */}
      <path
        d="M8 8 L8 28 Q8 32 12 33 L22 33 Q26 33 28 31 L28 29 Q26 28 24 29 L14 29 Q12 29 12 28 L12 8 Q12 6 10 6 Q8 6 8 8Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
      />
      {/* Boot sole */}
      <path d="M8 33 L28 33" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Laces */}
      <line x1="9" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="20" x2="13" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>

      {/* Right boot (slightly behind/offset) */}
      <path
        d="M22 12 L22 30 Q22 34 26 35 L36 35 Q40 35 42 33 L42 31 Q40 30 38 31 L28 31 Q26 31 26 30 L26 12 Q26 10 24 10 Q22 10 22 12Z"
        fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.5"
      />
      <path d="M22 35 L42 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  );
}

// Legend — leaping trout, clear silhouette
export function IconLegend({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Water line */}
      <path d="M2 36 Q10 33 18 35 Q26 37 34 34 Q40 32 46 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Trout body — large sweeping arc */}
      <path
        d="M14 34 Q10 24 14 16 Q18 8 26 6 Q34 4 38 12 Q42 20 38 30"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Forked tail */}
      <path d="M38 30 L44 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 30 L44 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Dorsal fin */}
      <path d="M22 8 L20 2 L28 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Eye */}
      <circle cx="16" cy="26" r="2.5" fill="currentColor"/>
      <circle cx="16" cy="26" r="1" fill="currentColor" fillOpacity="0.3"/>
      {/* Spots */}
      <circle cx="26" cy="12" r="1.8" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="30" cy="16" r="1.5" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="24" cy="18" r="1.5" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="32" cy="22" r="1.3" fill="currentColor" fillOpacity="0.6"/>
      {/* Splash droplets */}
      <circle cx="10" cy="32" r="1" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="8" cy="29" r="0.8" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="13" cy="28" r="0.8" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  );
}

// Centurion — landing net, clean and bold
export function IconCenturion({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Net hoop — bold circle */}
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="3"/>
      {/* Net mesh — clean grid clipped to circle */}
      <path d="M6 14 L34 14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M5 20 L35 20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M6 26 L34 26" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M14 5 L14 35" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M20 5 L20 35" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M26 5 L26 35" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* Fish silhouette in net */}
      <path d="M14 20 Q17 16 22 17 Q26 18 26 21 Q26 24 22 24 Q17 25 14 21Z" fill="currentColor" fillOpacity="0.5"/>
      <path d="M14 20 L11 18 L11 23Z" fill="currentColor" fillOpacity="0.7"/>
      {/* Handle */}
      <path d="M30 30 L44 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="30" cy="30" r="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Master Angler — large detailed trout, side profile
export function IconMasterAngler({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path
        d="M6 24 Q8 16 16 13 Q24 10 34 14 Q40 17 40 24 Q40 31 34 34 Q24 38 16 35 Q8 32 6 24Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Forked tail */}
      <path d="M40 20 L46 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M40 28 L46 33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Dorsal fin */}
      <path d="M18 13 L18 7 L26 8 L26 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Adipose fin — signature trout feature */}
      <path d="M34 16 Q36 12 38 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Pectoral fin */}
      <path d="M16 24 Q12 28 10 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Anal fin */}
      <path d="M22 34 Q22 38 18 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Eye */}
      <circle cx="9" cy="23" r="2.5" fill="currentColor"/>
      <circle cx="9" cy="23" r="1" fill="currentColor" fillOpacity="0.25"/>
      {/* Lateral line */}
      <path d="M14 22 Q24 20 38 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" strokeDasharray="3 2"/>
      {/* Spots — characteristic trout pattern */}
      <circle cx="20" cy="17" r="2" fill="currentColor" fillOpacity="0.8"/>
      <circle cx="26" cy="15" r="1.8" fill="currentColor" fillOpacity="0.8"/>
      <circle cx="30" cy="18" r="1.8" fill="currentColor" fillOpacity="0.75"/>
      <circle cx="22" cy="22" r="1.5" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="28" cy="24" r="1.5" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="34" cy="20" r="1.5" fill="currentColor" fillOpacity="0.65"/>
      <circle cx="18" cy="27" r="1.3" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="32" cy="28" r="1.3" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  );
}

// Species Hunter — three distinct fish, clearly different sizes/shapes
export function IconSpeciesHunter({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Large trout — top, horizontal */}
      <path d="M4 10 Q8 6 16 6 Q24 6 28 10 Q24 14 16 14 Q8 14 4 10Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M28 10 L34 6 L34 14Z" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="8" cy="10" r="2" fill="currentColor"/>
      <circle cx="16" cy="8" r="1.2" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="21" cy="9" r="1" fill="currentColor" fillOpacity="0.7"/>

      {/* Medium whitefish — middle, rounder snout */}
      <path d="M10 24 Q13 20 20 20 Q28 20 30 24 Q28 28 20 28 Q13 28 10 24Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M30 24 L36 20 L36 28Z" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="13" cy="24" r="1.8" fill="currentColor"/>

      {/* Small brook trout — bottom right, small and plump */}
      <path d="M22 38 Q25 34 31 34 Q38 34 40 38 Q38 42 31 42 Q25 42 22 38Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M40 38 L46 35 L46 41Z" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="25" cy="38" r="1.5" fill="currentColor"/>
      <circle cx="32" cy="36" r="0.9" fill="currentColor" fillOpacity="0.7"/>
    </svg>
  );
}

// Consistent Producer — rising trend with fly at peak
export function IconConsistentProducer({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base line */}
      <path d="M4 42 L44 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.3"/>
      {/* Bars — rising left to right */}
      <rect x="5" y="32" width="7" height="10" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="15" y="26" width="7" height="16" rx="1.5" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="25" y="18" width="7" height="24" rx="1.5" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="35" y="8" width="7" height="34" rx="1.5" fill="currentColor" fillOpacity="0.85" stroke="currentColor" strokeWidth="1.8"/>
      {/* Trend arrow line */}
      <path d="M8.5 32 L18.5 26 L28.5 18 L38.5 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Arrow head */}
      <path d="M34 6 L42 6 L42 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Tiny fly at peak */}
      <path d="M39 4 Q37 2 36 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M39 4 Q41 2 42 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="39.5" cy="4.5" r="1.2" fill="currentColor"/>
    </svg>
  );
}
