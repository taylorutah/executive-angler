"use client";

import { FishingSession, SessionRig } from "@/types/fishing-log";
import { ChevronLeftIcon, ChevronRightIcon, Fish, MapPin } from "@/icons";
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

  // Fish intensity for heat coloring (share of max fish in visible month)
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
    <div className="flex flex-col gap-4">
      {/* Calendar header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-surface p-2 text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
            aria-label="Previous month"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <div className="min-w-52 text-center">
            <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">{monthName} {currentYear}</h2>
            {monthSessionCount > 0 && (
              <p className="mt-1 text-13 text-[var(--text-2)] num">
                {monthSessionCount} session{monthSessionCount !== 1 ? "s" : ""} &middot; {monthFishCount} fish
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-surface p-2 text-[var(--text-2)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)]"
            aria-label="Next month"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>

        {/* Year toggles */}
        <div className="flex flex-wrap gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleYearClick(year)}
              aria-pressed={year === currentYear}
              className={`ea-chip transition-colors ${
                year === currentYear
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "hover:text-[var(--text-1)]"
              }`}
            >
              <span className="num">{year}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Month shortcuts — which months hold sessions */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 12 }, (_, i) => {
          const monthAbbr = new Date(currentYear, i, 1).toLocaleDateString("en-US", { month: "short" });
          const hasSession = monthsWithSessions.has(i);
          const isCurrent = i === currentMonth;
          return (
            <button
              key={i}
              type="button"
              onClick={() => { setCurrentMonth(i); setExpandedDate(null); }}
              aria-pressed={isCurrent}
              className={`rounded-instrument px-1 py-1 text-xs transition-colors ${
                isCurrent
                  ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                  : hasSession
                    ? "font-medium text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
                    : "text-[var(--text-3)] hover:bg-[var(--paper-deep)]"
              }`}
              title={`${monthAbbr} ${currentYear}`}
            >
              {monthAbbr}
            </button>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-card border border-[var(--border)] bg-[var(--surface)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--paper)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="ea-overline p-2 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx}>
            <div className="grid grid-cols-7 border-b border-[var(--border)] last:border-b-0">
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return <div key={dayIdx} className="min-h-24 border-r border-[var(--border)] p-2 last:border-r-0 bg-[var(--paper)]" />;
                }

                const dateKey = getDateKey(day);
                const daySessions = sessionsByDate[dateKey] || [];
                const totalFish = daySessions.reduce((sum, { session }) => sum + (session.total_fish || 0), 0);
                const hasSession = daySessions.length > 0;
                const isExpanded = expandedDate === dateKey;

                // Get unique river names for the day
                const rivers = [...new Set(daySessions.map(ds => ds.session.river_name).filter(Boolean))];

                // Heat: flat accent tint per cell, 10–30% by share of the month's best day
                const heatPct = hasSession && maxFishInMonth > 0
                  ? Math.max(10, Math.round((totalFish / maxFishInMonth) * 30))
                  : 0;

                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => hasSession && setExpandedDate(isExpanded ? null : dateKey)}
                    className={`relative min-h-24 border-r border-[var(--border)] p-2 text-left last:border-r-0 transition-colors ${
                      hasSession ? "cursor-pointer hover:bg-[var(--paper-deep)]" : "cursor-default"
                    } ${isToday(day) ? "ring-2 ring-inset ring-[var(--accent)]" : ""} ${
                      isExpanded ? "border-b-2 border-b-[var(--accent)]" : ""
                    }`}
                    style={hasSession ? { backgroundColor: `color-mix(in srgb, var(--accent) ${heatPct}%, var(--surface))` } : undefined}
                  >
                    <div className="flex h-full flex-col gap-1">
                      {/* Day number */}
                      <span className={`text-xs font-medium num ${
                        isToday(day) ? "font-semibold text-[var(--accent)]" : hasSession ? "text-[var(--text-1)]" : "text-[var(--text-3)]"
                      }`}>
                        {day}
                      </span>

                      {hasSession && (
                        <div className="mt-auto flex flex-col gap-1">
                          {/* River names */}
                          {rivers.slice(0, 2).map((river, i) => (
                            <div key={i} className="flex min-w-0 items-center gap-1">
                              <MapPin size={12} className="shrink-0 text-[var(--accent)]" />
                              <span className="truncate text-xs font-medium leading-tight text-[var(--text-1)]">
                                {river}
                              </span>
                            </div>
                          ))}
                          {rivers.length > 2 && (
                            <span className="text-xs text-[var(--text-3)]">+{rivers.length - 2} more</span>
                          )}

                          {/* Fish count + session count */}
                          <div className="mt-1 flex items-center gap-2">
                            {totalFish > 0 && (
                              <div className="flex items-center gap-1">
                                <Fish size={12} className="text-[var(--text-2)]" />
                                <span className="text-xs font-semibold text-[var(--text-1)] num">{totalFish}</span>
                              </div>
                            )}
                            {daySessions.length > 1 && (
                              <span className="text-xs text-[var(--text-3)]">
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
              <div className="border-b border-[var(--border)] bg-[var(--paper)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text-1)]">
                    {parseLocalDate(expandedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setExpandedDate(null)}
                    className="text-xs text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
                  >
                    Close
                  </button>
                </div>

                {/* Quick summary */}
                {sessionsByDate[expandedDate] && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-2)] num">
                    <span>{sessionsByDate[expandedDate].length} session{sessionsByDate[expandedDate].length !== 1 ? "s" : ""}</span>
                    <span aria-hidden className="text-[var(--text-3)]">&middot;</span>
                    <span>{sessionsByDate[expandedDate].reduce((s, d) => s + (d.session.total_fish || 0), 0)} fish total</span>
                    <span aria-hidden className="text-[var(--text-3)]">&middot;</span>
                    <span>
                      {[...new Set(sessionsByDate[expandedDate].map(d => d.session.river_name).filter(Boolean))].join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
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
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--text-2)]">No sessions in {monthName} {currentYear}.</p>
          {monthsWithSessions.size > 0 && (
            <p className="mt-1 text-xs text-[var(--text-3)]">
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
