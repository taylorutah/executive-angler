export interface BestWindow {
  flowMin: number | null;
  flowMax: number | null;
  sessionCount: number;
}

export interface DailyOutlook {
  date: string;
  weekday: string;
  tempHighF: number | null;
  weatherLabel: string;
  /** Honest read — never invents flow we do not have. */
  note: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function wmoLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Clouds";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Storms";
  return "Mixed";
}

/** Five calendar days starting today (America/Denver). */
export function buildFiveDayOutlook(
  daily: {
    time: string[];
    temperature_2m_max?: (number | null)[];
    weather_code?: (number | null)[];
  } | null,
  best: BestWindow | null,
  currentCfs: number | null,
  riverName: string,
  now: Date = new Date(),
): DailyOutlook[] {
  const times =
    daily?.time?.length && daily.time.length > 0
      ? daily.time.slice(0, 5)
      : Array.from({ length: 5 }, (_, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() + i);
          return d.toISOString().slice(0, 10);
        });

  return times.map((iso, i) => {
    const d = new Date(`${iso}T12:00:00`);
    const temp = daily?.temperature_2m_max?.[i] ?? null;
    const code = daily?.weather_code?.[i] ?? 0;
    const weatherLabel = wmoLabel(typeof code === "number" ? code : 0);

    let note = "";
    if (best && best.sessionCount >= 3 && best.flowMin != null && best.flowMax != null && currentCfs != null) {
      const inWindow = currentCfs >= best.flowMin && currentCfs <= best.flowMax;
      if (i === 0) {
        note = inWindow
          ? `Flow is inside your logged range on the ${riverName} (${best.flowMin.toLocaleString("en-US")}–${best.flowMax.toLocaleString("en-US")} cfs).`
          : `Flow is outside your logged range on the ${riverName} (${best.flowMin.toLocaleString("en-US")}–${best.flowMax.toLocaleString("en-US")} cfs).`;
      } else {
        note = inWindow
          ? `Weather shifts; flow is still in your logged range today. We do not forecast cfs five days out.`
          : `Weather shifts; today's flow is outside your logged range. We do not forecast cfs five days out.`;
      }
    } else if (best && best.sessionCount > 0 && best.sessionCount < 3) {
      note = `Log ${3 - best.sessionCount} more ${best.sessionCount === 2 ? "day" : "days"} on the ${riverName} and this line will read your window.`;
    } else {
      note = `No sessions logged on the ${riverName} yet. This line reads your own history, not a crowd forecast.`;
    }

    return {
      date: iso,
      weekday: WEEKDAYS[d.getDay()],
      tempHighF: temp != null ? Math.round(temp) : null,
      weatherLabel,
      note,
    };
  });
}

/** Flow band from the top third of sessions by fish logged — matches insights API. */
export function deriveBestWindow(
  sessions: Array<{ river_flow_cfs: number | null; total_fish?: number | null }>,
): BestWindow {
  if (sessions.length < 3) {
    return { flowMin: null, flowMax: null, sessionCount: sessions.length };
  }
  const sorted = [...sessions].sort(
    (a, b) => (b.total_fish ?? 0) - (a.total_fish ?? 0),
  );
  const topCount = Math.max(1, Math.ceil(sorted.length * 0.33));
  const topFlows = sorted
    .slice(0, topCount)
    .map((s) => s.river_flow_cfs)
    .filter((f): f is number => f != null && Number.isFinite(f));
  if (topFlows.length === 0) {
    return { flowMin: null, flowMax: null, sessionCount: sessions.length };
  }
  return {
    flowMin: Math.min(...topFlows),
    flowMax: Math.max(...topFlows),
    sessionCount: sessions.length,
  };
}
