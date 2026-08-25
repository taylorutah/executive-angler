"use client";

import { FishingSession, SessionRig } from "@/types/fishing-log";
import { ChevronLeftIcon, ChevronRightIcon, Fish, MapPin } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { parseLocalDate } from "@/lib/date";
import { SessionCard } from "./SessionCard";

interface CalendarViewProps {
  sessions: FishingSession[];
  rigsMap: Map<string, SessionRig[]>;
}

interface DaySession {
  session: FishingSession;
  rigs: SessionRig[];
}

export function CalendarView({ sessions, rigsMap }: CalendarViewProps) {
  const today = new Date();

  // Find the most recent session to default to that month
  const mostRecentDate = useMemo(() => {
    if (sessions.length === 0) return today;
    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    return parseLocalDate(sorted[0].date);
  }, [sessions]);

  const [currentYear, setCurrentYear] = useState(mostRecentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(mostRecentDate.getMonth());
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Group sessions by date (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    return sessions.reduce((acc, session) => {
      const dateKey = session.date.split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push({ session, rigs: rigsMap.get(session.id) || [] });
      return acc;
    }, {} as Record<string, DaySession[]>);
  }, [sessions, rigsMap]);

  // Sessions in current month
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthSessionCount = useMemo(() => {
    return Object.keys(sessionsByDate).filter(k => k.startsWith(currentMonthKey)).reduce(
      (sum, k) => sum + sessionsByDate[k].length, 0
    );
  }, [sessionsByDate, currentMonthKey]);

  const monthFishCount = useMemo(() => {
    return Object.keys(sessionsByDate).filter(k => k.startsWith(currentMonthKey)).reduce(
      (sum, k) => sum + sessionsByDate[k].reduce((s, d) => s + (d.session.total_fish || 0), 0), 0
    );
  }, [sessionsByDate, currentMonthKey]);

  // Available years (from sessions)
  const availableYears = useMemo(() => {
    return Array.from(new Set(sessions.map(s => parseLocalDate(s.date).getFullYear()))).sort((a, b) => b - a);
  }, [sessions]);

  // Months with sessions for current year (for month indicator dots)
  const monthsWithSessions = useMemo(() => {
    const months = new Set<number>();
    sessions.forEach(s => {
      const d = parseLocalDate(s.date);
      if (d.getFullYear() === currentYear) {
        months.add(d.getMonth());
      }
    });
    return months;
  }, [sessions, currentYear]);

  // Calendar grid helpers
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();
  const monthName = firstDayOfMonth.toLocaleDateString("en-US", { month: "long" });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setExpandedDate(null);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setExpandedDate(null);
  }, [currentMonth]);

  const handleYearClick = useCallback((year: number) => {
    setCurrentYear(year);
    setExpandedDate(null);
    // Navigate to the most recent session month in that year
    const yearSessions = sessions
      .filter(s => parseLocalDate(s.date).getFullYear() === year)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (yearSessions.length > 0) {
      setCurrentMonth(parseLocalDate(yearSessions[0].date).getMonth());
    }
  }, [sessions]);

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const getDateKey = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // Fish intensity for heat coloring (0-1 scale based on max fish in visible month)
  const maxFishInMonth = useMemo(() => {
    let max = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = getDateKey(d);
      const total = (sessionsByDate[dk] || []).reduce((s, ds) => s + (ds.session.total_fish || 0), 0);
      if (total > max) max = total;
    }
    return max;
  }, [sessionsByDate, daysInMonth, currentYear, currentMonth]);

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth} className="rounded-lg p-2 hover:bg-[var(--surface-card)] transition-colors" aria-label="Previous month">
            <ChevronLeftIcon className="h-5 w-5 text-[var(--text-body)]" />
          </button>
          <div className="min-w-[200px] text-center">
            <h2 className="font-serif text-2xl text-[var(--action)]">{monthName} {currentYear}</h2>
            {monthSessionCount > 0 && (
              <p className="text-xs text-[var(--text-body)] mt-0.5">
                {monthSessionCount} session{monthSessionCount !== 1 ? "s" : ""} &middot; {monthFishCount} fish
              </p>
            )}
          </div>
          <button onClick={handleNextMonth} className="rounded-lg p-2 hover:bg-[var(--surface-card)] transition-colors" aria-label="Next month">
            <ChevronRightIcon className="h-5 w-5 text-[var(--text-body)]" />
          </button>
        </div>

        {/* Year pills */}
        <div className="flex gap-2 flex-wrap">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                year === currentYear
                  ? "bg-[var(--action)] text-white"
                  : "bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--border-rule)]"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month navigation dots — show which months have sessions */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: 12 }, (_, i) => {
          const monthAbbr = new Date(currentYear, i, 1).toLocaleDateString("en-US", { month: "short" });
          const hasSession = monthsWithSessions.has(i);
          const isCurrent = i === currentMonth;
          return (
            <button
              key={i}
              onClick={() => { setCurrentMonth(i); setExpandedDate(null); }}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                isCurrent
                  ? "bg-[var(--action)] text-white font-semibold"
                  : hasSession
                    ? "text-[var(--signal-live)] hover:bg-[var(--surface-card)] font-medium"
                    : "text-[var(--text-meta)] hover:bg-[var(--surface-card)]"
              }`}
              title={`${monthAbbr} ${currentYear}`}
            >
              {monthAbbr}
            </button>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--border-rule)] bg-[var(--surface-page)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-body)]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx}>
            <div className="grid grid-cols-7 border-b border-[var(--border-rule)] last:border-b-0">
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return <div key={dayIdx} className="border-r border-[var(--border-rule)] last:border-r-0 p-2 min-h-[90px] bg-[var(--surface-page)]/30" />;
                }

                const dateKey = getDateKey(day);
                const daySessions = sessionsByDate[dateKey] || [];
                const totalFish = daySessions.reduce((sum, { session }) => sum + (session.total_fish || 0), 0);
                const hasSession = daySessions.length > 0;
                const isExpanded = expandedDate === dateKey;

                // Get unique river names for the day
                const rivers = [...new Set(daySessions.map(ds => ds.session.river_name).filter(Boolean))];

                // Intensity for background
                const intensity = hasSession && maxFishInMonth > 0
                  ? Math.max(0.08, totalFish / maxFishInMonth * 0.25)
                  : 0;

                return (
                  <button
                    key={dayIdx}
                    onClick={() => hasSession && setExpandedDate(isExpanded ? null : dateKey)}
                    className={`border-r border-[var(--border-rule)] last:border-r-0 p-1.5 sm:p-2 min-h-[90px] text-left transition-all relative ${
                      hasSession ? "cursor-pointer hover:bg-[var(--surface-page)]" : "cursor-default"
                    } ${isToday(day) ? "ring-2 ring-inset ring-[var(--signal-live)]/40" : ""} ${
                      isExpanded ? "bg-[var(--surface-page)] border-b-2 border-b-[var(--action)]" : ""
                    }`}
                    style={hasSession ? { backgroundColor: `rgba(11, 165, 199, ${intensity})` } : undefined}
                  >
                    <div className="flex flex-col h-full gap-1">
                      {/* Day number */}
                      <span className={`text-xs font-medium ${
                        isToday(day) ? "text-[var(--signal-live)] font-bold" : hasSession ? "text-[var(--text-primary)]" : "text-[var(--text-meta)]"
                      }`}>
                        {day}
                      </span>

                      {hasSession && (
                        <div className="flex flex-col gap-0.5 mt-auto">
                          {/* River names */}
                          {rivers.slice(0, 2).map((river, i) => (
                            <div key={i} className="flex items-center gap-0.5 min-w-0">
                              <MapPin className="h-2 w-2 text-[var(--action)] shrink-0" />
                              <span className="text-[9px] text-[var(--text-primary)] truncate leading-tight font-medium">
                                {river}
                              </span>
                            </div>
                          ))}
                          {rivers.length > 2 && (
                            <span className="text-[8px] text-[var(--text-meta)]">+{rivers.length - 2} more</span>
                          )}

                          {/* Fish count + session count */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {totalFish > 0 && (
                              <div className="flex items-center gap-0.5">
                                <Fish className="h-2.5 w-2.5 text-[var(--signal-live)]" />
                                <span className="text-[10px] font-bold text-[var(--signal-live)] font-mono">{totalFish}</span>
                              </div>
                            )}
                            {daySessions.length > 1 && (
                              <span className="text-[9px] text-[var(--text-body)]">
                                {daySessions.length} trips
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded session detail below the week row */}
            {expandedDate && week.some(day => day !== null && getDateKey(day) === expandedDate) && (
              <div className="border-b border-[var(--border-rule)] bg-[var(--surface-page)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--action)]">
                    {parseLocalDate(expandedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => setExpandedDate(null)}
                    className="text-xs text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Quick summary */}
                {sessionsByDate[expandedDate] && (
                  <div className="flex items-center gap-4 mb-3 text-xs text-[var(--text-body)]">
                    <span>{sessionsByDate[expandedDate].length} session{sessionsByDate[expandedDate].length !== 1 ? "s" : ""}</span>
                    <span>&middot;</span>
                    <span>{sessionsByDate[expandedDate].reduce((s, d) => s + (d.session.total_fish || 0), 0)} fish total</span>
                    <span>&middot;</span>
                    <span>
                      {[...new Set(sessionsByDate[expandedDate].map(d => d.session.river_name).filter(Boolean))].join(", ")}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {sessionsByDate[expandedDate]?.map(({ session }) => (
                    <SessionCard
                      key={session.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      session={session as any}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty month state */}
      {monthSessionCount === 0 && (
        <div className="text-center py-8 text-[var(--text-body)]">
          <Fish className="h-8 w-8 mx-auto mb-2 text-[var(--text-meta)]" />
          <p className="text-sm">No sessions in {monthName} {currentYear}</p>
          {monthsWithSessions.size > 0 && (
            <p className="text-xs text-[var(--text-meta)] mt-1">
              Try {[...monthsWithSessions].map(m =>
                new Date(currentYear, m, 1).toLocaleDateString("en-US", { month: "short" })
              ).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
