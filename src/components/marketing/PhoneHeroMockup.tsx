import { Home, BookOpen, Mountain, Bug, Fish } from "lucide-react";

const SESSIONS = [
  {
    river: "Green River",
    location: "Utah",
    time: "Today • 7:42 AM",
    fish: 14,
    duration: "3h 12m",
    best: "18\"",
    tags: ["54°F", "#18 RS2", "1,240 cfs"],
  },
  {
    river: "Madison River",
    location: "Montana",
    time: "Mar 15 • 2:10 PM",
    fish: 9,
    duration: "2h 48m",
    best: "16\"",
    tags: ["52°F", "PMD #16", "1,450 cfs"],
  },
];

export default function PhoneHeroMockup() {
  return (
    <div className="relative mx-auto" style={{ width: "300px", maxWidth: "100%" }} aria-hidden="true">
      {/* Ambient glow behind phone */}
      <div
        className="absolute -inset-8 -z-10 rounded-[64px] opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(232,146,58,0.35), transparent 60%), radial-gradient(circle at 70% 80%, rgba(11,165,199,0.3), transparent 60%)",
        }}
      />

      {/* Phone body */}
      <div
        className="relative bg-[#0A0D11] rounded-[44px] p-[10px] shadow-[var(--elev-4)]"
        style={{ transform: "rotate(-2deg)" }}
      >
        {/* Screen */}
        <div className="bg-[var(--surface-page)] rounded-[36px] overflow-hidden relative" style={{ height: "600px" }}>
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-2.5 pb-1.5 relative z-10">
            <span className="text-[var(--text-primary)] text-[11px] font-semibold font-['IBM_Plex_Mono']">9:41</span>
            <div className="flex items-center gap-1">
              {/* Signal */}
              <svg className="h-2.5 w-3.5 text-[var(--text-primary)]" viewBox="0 0 16 10" fill="currentColor">
                <rect x="0" y="6" width="2.5" height="4" rx="0.5" />
                <rect x="4" y="4" width="2.5" height="6" rx="0.5" />
                <rect x="8" y="2" width="2.5" height="8" rx="0.5" />
                <rect x="12" y="0" width="2.5" height="10" rx="0.5" />
              </svg>
              {/* Battery */}
              <svg className="h-2.5 w-5 text-[var(--text-primary)]" viewBox="0 0 24 12" fill="none">
                <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" opacity="0.5" />
                <rect x="22" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
                <rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading text-[var(--text-primary)] text-xl leading-none">Home</h2>
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--action)] to-[#d17d28] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">T</span>
              </div>
            </div>
            <p className="font-['IBM_Plex_Mono'] text-[var(--text-meta)] text-[10px] uppercase tracking-widest">
              Good morning, Taylor
            </p>
          </div>

          {/* Stats strip */}
          <div className="mx-5 mb-3 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-['IBM_Plex_Mono'] text-[var(--action)] text-xl leading-none">47</div>
                <div className="text-[var(--text-meta)] text-[9px] uppercase tracking-wider mt-0.5">Fish YTD</div>
              </div>
              <div className="h-8 w-px bg-[var(--border-rule)]" />
              <div>
                <div className="font-['IBM_Plex_Mono'] text-[var(--action)] text-xl leading-none">18</div>
                <div className="text-[var(--text-meta)] text-[9px] uppercase tracking-wider mt-0.5">Sessions</div>
              </div>
              <div className="h-8 w-px bg-[var(--border-rule)]" />
              <div>
                <div className="font-['IBM_Plex_Mono'] text-[var(--action)] text-xl leading-none">21"</div>
                <div className="text-[var(--text-meta)] text-[9px] uppercase tracking-wider mt-0.5">PB</div>
              </div>
            </div>
          </div>

          {/* Section label */}
          <div className="px-5 mb-2 flex items-center justify-between">
            <p className="font-['IBM_Plex_Mono'] text-[var(--action)] text-[9px] uppercase tracking-[0.2em]">Recent Sessions</p>
            <span className="font-['IBM_Plex_Mono'] text-[var(--signal-live)] text-[9px]">View all</span>
          </div>

          {/* Session feed */}
          <div className="px-5 space-y-2.5">
            {SESSIONS.map((s) => (
              <div key={s.river} className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-2xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-heading text-[var(--text-primary)] text-[15px] leading-tight">{s.river}</h3>
                    <p className="font-['IBM_Plex_Mono'] text-[var(--text-meta)] text-[9px] mt-0.5">{s.time}</p>
                  </div>
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[var(--text-meta)]">{s.location}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-['IBM_Plex_Mono'] text-[var(--action)] text-lg leading-none">{s.fish}</div>
                    <div className="text-[var(--text-meta)] text-[8px] uppercase tracking-wider mt-0.5">Fish</div>
                  </div>
                  <div>
                    <div className="font-['IBM_Plex_Mono'] text-[var(--text-primary)] text-lg leading-none">{s.duration}</div>
                    <div className="text-[var(--text-meta)] text-[8px] uppercase tracking-wider mt-0.5">Time</div>
                  </div>
                  <div>
                    <div className="font-['IBM_Plex_Mono'] text-[var(--text-primary)] text-lg leading-none">{s.best}</div>
                    <div className="text-[var(--text-meta)] text-[8px] uppercase tracking-wider mt-0.5">Best</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-['IBM_Plex_Mono'] text-[9px] bg-[rgba(11,165,199,0.1)] border border-[rgba(11,165,199,0.2)] text-[var(--signal-live)] rounded-full px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Gradient fade at bottom to blend into tab bar */}
          <div className="absolute left-0 right-0 bottom-[52px] h-10 bg-gradient-to-b from-transparent to-[var(--surface-page)] pointer-events-none" />

          {/* Bottom tab bar */}
          <div className="absolute left-0 right-0 bottom-0 bg-[var(--surface-page)]/95 backdrop-blur border-t border-[var(--border-rule)]">
            <div className="grid grid-cols-5 h-[52px]">
              {[
                { icon: Home, label: "Home", active: true },
                { icon: BookOpen, label: "Journal" },
                { icon: Mountain, label: "Rivers" },
                { icon: Bug, label: "Flies" },
                { icon: Fish, label: "Me" },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center justify-center gap-0.5">
                  <t.icon
                    className={`h-4 w-4 ${t.active ? "text-[var(--action)]" : "text-[var(--text-meta)]"}`}
                    strokeWidth={t.active ? 2.25 : 2}
                  />
                  <span
                    className={`text-[8px] font-medium ${t.active ? "text-[var(--action)]" : "text-[var(--text-meta)]"}`}
                  >
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Home indicator */}
            <div className="flex justify-center pb-1.5 pt-0.5">
              <div className="h-1 w-24 rounded-full bg-[var(--text-primary)]/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
