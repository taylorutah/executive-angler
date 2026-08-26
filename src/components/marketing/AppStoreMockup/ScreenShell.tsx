// Shared "phone screen" shell used by every App Store mockup.
//
// Renders a 1320×2868 viewport (iPhone 16/17 Pro Max native resolution)
// with status bar + Dynamic Island + content slot + tab bar + home indicator.
// Consumers provide the content between the status bar and the tab bar.

import type { ReactNode } from "react";
import { Home, BookOpen, Mountain, Bug, Fish } from "lucide-react";
import { COPPER_400 } from "@/lib/palette";

// Brand palette — must match globals.css and native EAColors.
const C = {
  bg: "#0D1117",
  bgMid: "#161B22",
  border: "#21262D",
  copper: COPPER_400,
  teal: "#0BA5C7",
  chalk: "#F0F6FC",
  slate: "#A8B2BD",
  slateDim: "#6E7681",
};

export type TabId = "home" | "journal" | "rivers" | "flies" | "me";

interface Props {
  children: ReactNode;
  activeTab: TabId;
  /** Optional copper glow color override for the ambient background. */
  glow?: "copper" | "teal" | "both";
}

export default function ScreenShell({ children, activeTab, glow = "both" }: Props) {
  return (
    <div
      className="relative overflow-hidden font-['DM_Sans']"
      style={{
        width: 1320,
        height: 2868,
        backgroundColor: C.bg,
      }}
    >
      {/* Ambient brand glow — subtle radial gradients to give the screen depth */}
      {(glow === "copper" || glow === "both") && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: -200,
            right: -200,
            width: 900,
            height: 900,
            background: "radial-gradient(circle, rgba(232,146,58,0.10), transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      )}
      {(glow === "teal" || glow === "both") && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -200,
            left: -200,
            width: 900,
            height: 900,
            background: "radial-gradient(circle, rgba(11,165,199,0.08), transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      )}

      {/* Dynamic Island */}
      <div
        className="absolute rounded-full z-30"
        style={{
          top: 52,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 110,
          backgroundColor: "#000",
        }}
      />

      {/* Status bar */}
      <div
        className="absolute flex items-center justify-between z-20"
        style={{ top: 68, left: 0, right: 0, paddingLeft: 100, paddingRight: 100 }}
      >
        <span
          className="font-['IBM_Plex_Mono'] font-semibold"
          style={{ color: C.chalk, fontSize: 48 }}
        >
          9:41
        </span>
        <div className="flex items-center" style={{ gap: 16 }}>
          {/* Signal */}
          <svg width="68" height="44" viewBox="0 0 68 44" fill={C.chalk}>
            <rect x="0" y="30" width="10" height="14" rx="2" />
            <rect x="16" y="22" width="10" height="22" rx="2" />
            <rect x="32" y="12" width="10" height="32" rx="2" />
            <rect x="48" y="0" width="10" height="44" rx="2" />
          </svg>
          {/* Wifi */}
          <svg width="62" height="44" viewBox="0 0 62 44" fill="none">
            <path
              d="M4 16 Q31 -8 58 16"
              stroke={C.chalk}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M12 26 Q31 10 50 26"
              stroke={C.chalk}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M20 36 Q31 26 42 36"
              stroke={C.chalk}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
          {/* Battery */}
          <svg width="100" height="44" viewBox="0 0 100 44" fill="none">
            <rect
              x="1"
              y="3"
              width="86"
              height="38"
              rx="12"
              stroke={C.chalk}
              strokeOpacity="0.5"
              strokeWidth="3"
            />
            <rect x="90" y="14" width="7" height="16" rx="2" fill={C.chalk} fillOpacity="0.5" />
            <rect x="6" y="8" width="76" height="28" rx="7" fill={C.chalk} />
          </svg>
        </div>
      </div>

      {/* Content area — everything lives between the status bar and the tab bar */}
      <div
        className="absolute"
        style={{ top: 190, left: 0, right: 0, bottom: 220 }}
      >
        {children}
      </div>

      {/* Bottom tab bar */}
      <TabBar activeTab={activeTab} />

      {/* Home indicator */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: 38,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 12,
          backgroundColor: C.chalk,
          opacity: 0.6,
        }}
      />
    </div>
  );
}

function TabBar({ activeTab }: { activeTab: TabId }) {
  const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "rivers", label: "Rivers", icon: Mountain },
    { id: "flies", label: "Flies", icon: Bug },
    { id: "me", label: "Me", icon: Fish },
  ];

  return (
    <div
      className="absolute backdrop-blur"
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        height: 220,
        backgroundColor: "rgba(13,17,23,0.95)",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        className="grid grid-cols-5"
        style={{ height: 156, paddingTop: 28 }}
      >
        {TABS.map((t) => {
          const active = activeTab === t.id;
          const Icon = t.icon;
          return (
            <div key={t.id} className="flex flex-col items-center" style={{ gap: 12 }}>
              <Icon
                width={58}
                height={58}
                strokeWidth={active ? 2.4 : 1.75}
                color={active ? C.copper : C.slateDim}
              />
              <span
                style={{
                  fontSize: 26,
                  fontWeight: active ? 600 : 500,
                  color: active ? C.copper : C.slateDim,
                  letterSpacing: 0.3,
                }}
              >
                {t.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { C as Colors };
