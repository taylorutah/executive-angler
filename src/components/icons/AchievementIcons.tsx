// Custom achievement icons for Executive Angler
// All icons use currentColor — they inherit badge color automatically

interface IconProps {
  className?: string;
}

// First Timer — dry fly with water ripples
export function IconFirstTimer({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left wing */}
      <path d="M12 10C11 8.5 8.5 7.5 8 9C7.5 10.5 9.5 11 12 10Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      {/* Right wing */}
      <path d="M12 10C13 8.5 15.5 7.5 16 9C16.5 10.5 14.5 11 12 10Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      {/* Body */}
      <ellipse cx="12" cy="10.4" rx="1.3" ry="0.7" fill="currentColor"/>
      {/* Tail fibers */}
      <path d="M13.2 10.6L15 12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12.8 11L14.2 13.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12.3 11.1L13.2 13.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      {/* Hook */}
      <path d="M11.8 11.1Q11.5 13.5 10 14.5Q9 15 9 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      {/* Water ripples */}
      <path d="M5 18C7.5 17 9.5 16.5 12 17C14.5 17.5 16.5 17 19 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4 20C6.5 19 9 18.5 12 19C15 19.5 17.5 19 20 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.55"/>
    </svg>
  );
}

// Regular — fly rod with arc line
export function IconRegular({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cork grip */}
      <rect x="3" y="18" width="4.5" height="2" rx="1" fill="currentColor" fillOpacity="0.5" transform="rotate(-40 3 18)"/>
      {/* Reel */}
      <circle cx="5.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="5.5" cy="17.5" r="0.5" fill="currentColor"/>
      {/* Rod — tapers toward tip */}
      <path d="M7.5 16L20.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M10 13.5L20.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4"/>
      {/* Fly line arc */}
      <path d="M20.5 4Q22 10 18 15Q15.5 18 12.5 20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Fly at end of line */}
      <circle cx="12" cy="20.5" r="0.9" fill="currentColor"/>
      <path d="M11 20L10 19" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M13 20L14 19" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    </svg>
  );
}

// Veteran — wading boot profile
export function IconVeteran({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Boot outline */}
      <path
        d="M7 5L7 14C7 14 7.5 15.5 10 16L16 16C18 16 19 17 19 18.5C19 19.5 18 20 17 20L5.5 20C4.5 20 4 19.5 4 18.5L4 5C4 4 5 3.5 5.5 3.5C6.5 3.5 7 4 7 5Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
      {/* Sole */}
      <path d="M4 20L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Boot stitching detail */}
      <path d="M5.5 7L6 12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.5"/>
      {/* Lace area */}
      <path d="M4.5 6.5L7 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
      <path d="M4.5 8.5L7 8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
      <path d="M4.5 10.5L7 10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  );
}

// Legend — trout leaping over water
export function IconLegend({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Water surface */}
      <path d="M2 17.5C5 16.5 7.5 17.5 10 17S15 16.5 22 17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      {/* Trout body arc */}
      <path
        d="M6 16C6.5 13 8 10 11 8C14 6 17 7 18.5 9C20 11 19.5 14.5 18 16"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      {/* Trout body fill */}
      <path
        d="M6.5 15.5C7 13 8.5 10.5 11 8.5C13.5 6.5 16.5 7.5 18 9.5C19.5 11.5 18.5 15 17.5 15.5"
        fill="currentColor" fillOpacity="0.2"
      />
      {/* Tail fin */}
      <path d="M18 16L20.5 14L19.5 17Z" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
      {/* Dorsal fin */}
      <path d="M11 8.5L12 6L13.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Eye */}
      <circle cx="7.5" cy="14.5" r="0.8" fill="currentColor"/>
      {/* Spots */}
      <circle cx="12" cy="10" r="0.5" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="14.5" cy="10.5" r="0.5" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="10" cy="11" r="0.4" fill="currentColor" fillOpacity="0.6"/>
      {/* Splash */}
      <path d="M5.5 17L4.5 15.5M7 17L6.5 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7"/>
    </svg>
  );
}

// Centurion — landing net (100 fish)
export function IconCenturion({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Net hoop */}
      <circle cx="11" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* Net mesh — horizontal lines */}
      <path d="M4.8 7.5L17.2 7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
      <path d="M4.5 10L17.5 10" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
      <path d="M4.8 12.5L17.2 12.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
      {/* Net mesh — vertical lines */}
      <path d="M8 3.5L8 16.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
      <path d="M11 3.5L11 16.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
      <path d="M14 3.5L14 16.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5"/>
      {/* Handle joint */}
      <path d="M11 16.5L11 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Handle */}
      <path d="M11 17.5L15 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Small fish in net */}
      <path d="M9 9.5C10 8.5 13 8.5 13.5 10S11 11.5 9 10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M9 10.5L7.5 9.5L7.5 11Z" fill="currentColor"/>
    </svg>
  );
}

// Master Angler — detailed trout profile
export function IconMasterAngler({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path
        d="M4 12C4 12 5 8 10 7C14 6 18 8 19.5 11C20.5 13 20 15 18 16C15 17.5 9 17 6 15C4.5 14 4 13 4 12Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
      {/* Tail — forked */}
      <path d="M19.5 11L22.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19.5 12L22.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Dorsal fin */}
      <path d="M10 7L10 4.5L13.5 5L14 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Adipose fin — key trout feature */}
      <path d="M17 8.5Q18 7.5 18.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      {/* Pectoral fin */}
      <path d="M8 13Q7 15 6 14.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Ventral fin */}
      <path d="M11.5 16.5Q11.5 18 10 17.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      {/* Eye */}
      <circle cx="5.8" cy="11.5" r="1" fill="currentColor"/>
      <circle cx="5.8" cy="11.5" r="0.35" fill="currentColor" fillOpacity="0.3" style={{mixBlendMode: "screen"}}/>
      {/* Lateral line */}
      <path d="M8 11.5Q13 10.5 18.5 11.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" strokeDasharray="1.5 1.5"/>
      {/* Spots */}
      <circle cx="10" cy="10.5" r="0.7" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="13" cy="9.8" r="0.65" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="15.5" cy="10.5" r="0.55" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="11.5" cy="12.5" r="0.55" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="14" cy="13" r="0.5" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  );
}

// Species Hunter — three distinct fish silhouettes
export function IconSpeciesHunter({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trout — top, large, torpedo shape */}
      <path
        d="M3 7C3 7 5 5 8.5 5C12 5 14 7 14 7C14 7 12 9 8.5 9C5 9 3 7 3 7Z"
        fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
      <path d="M14 7L16.5 5L16.5 9Z" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="4.5" cy="7" r="0.7" fill="currentColor"/>

      {/* Whitefish — middle, humped back, rounder */}
      <path
        d="M7 13C7 13 8.5 11 11 11C13.5 11 15.5 12.5 15.5 13.5C15.5 14.5 14 16 11 16C8 16 7 14.5 7 13Z"
        fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
      <path d="M15.5 13L18 11.5L18 15Z" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="8.5" cy="13" r="0.7" fill="currentColor"/>

      {/* Small brooky — bottom right, small and plump */}
      <path
        d="M12 20C12 20 13.5 18.5 16 18.5C18.5 18.5 20 20 20 20.5C20 21 18.5 22 16 22C13.5 22 12 21 12 20Z"
        fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
      <path d="M20 20L22 19L22 21Z" fill="currentColor" fillOpacity="0.7"/>
      <circle cx="13.5" cy="20" r="0.6" fill="currentColor"/>
    </svg>
  );
}

// Consistent Producer — upward trend with fly
export function IconConsistentProducer({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rising trend bars */}
      <rect x="3" y="16" width="3" height="5" rx="0.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="7.5" y="13" width="3" height="8" rx="0.5" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="12" y="9.5" width="3" height="11.5" rx="0.5" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="16.5" y="5.5" width="3" height="15.5" rx="0.5" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="1.1"/>
      {/* Trend line */}
      <path d="M4.5 16L9 13L13.5 9.5L18 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0"/>
      {/* Fly at peak */}
      <path d="M16.5 4.5C17 3.5 19 3 19.5 4C20 5 18.5 5.5 17 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M16.5 4.5C16 3.5 14.5 3.5 14.5 4.5C14.5 5.5 16 5.5 17 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <ellipse cx="17" cy="5" rx="0.7" ry="0.4" fill="currentColor"/>
    </svg>
  );
}
