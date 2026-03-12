"use client";

import { FishingSession, SessionRig } from "@/types/fishing-log";
import { ChevronLeftIcon, ChevronRightIcon, FishIcon } from "lucide-react";
import { useState } from "react";
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
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Group sessions by date (YYYY-MM-DD)
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = session.date.split("T")[0]; // Get YYYY-MM-DD part
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push({
      session,
      rigs: rigsMap.get(session.id) || [],
    });
    return acc;
  }, {} as Record<string, DaySession[]>);

  // Get all available years
  const availableYears = Array.from(
    new Set(sessions.map((s) => parseLocalDate(s.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Calendar helpers
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const monthName = firstDayOfMonth.toLocaleDateString("en-US", { month: "long" });

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setExpandedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setExpandedDate(null);
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getDateKey = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${month}-${dayStr}`;
  };

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDate(expandedDate === dateKey ? null : dateKey);
  };

  // Group days by week for expansion
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 hover:bg-[#1F2937]"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#8B949E]" />
          </button>
          <h2 className="font-heading text-2xl font-semibold text-[#E8923A] min-w-[200px] text-center">
            {monthName} {currentYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 hover:bg-[#1F2937]"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-5 w-5 text-[#8B949E]" />
          </button>
        </div>

        {/* Year pills */}
        <div className="flex gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => {
                setCurrentYear(year);
                setExpandedDate(null);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                year === currentYear
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#1F2937] text-[#8B949E] hover:bg-[#21262D]"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-[#21262D] bg-[#161B22]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#21262D] bg-[#0D1117]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold uppercase text-[#8B949E]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx}>
            <div className="grid grid-cols-7 border-b border-[#21262D] last:border-b-0">
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return <div key={dayIdx} className="border-r border-[#21262D] last:border-r-0 p-2 min-h-[80px]" />;
                }

                const dateKey = getDateKey(day);
                const daySessions = sessionsByDate[dateKey] || [];
                const totalFish = daySessions.reduce(
                  (sum, { session }) => sum + (session.total_fish || 0),
                  0
                );

                return (
                  <button
                    key={dayIdx}
                    onClick={() => {
                      if (daySessions.length > 0) {
                        toggleDateExpansion(dateKey);
                      }
                    }}
                    className={`border-r border-[#21262D] last:border-r-0 p-2 min-h-[80px] text-left transition-colors ${
                      daySessions.length > 0
                        ? "cursor-pointer hover:bg-[#0D1117]"
                        : "cursor-default"
                    } ${isToday(day) ? "bg-[#00B4D8]/5 ring-2 ring-inset ring-[#00B4D8]/30" : ""}`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-sm font-medium ${
                          isToday(day)
                            ? "text-[#00B4D8] font-semibold"
                            : "text-[#F0F6FC]"
                        }`}
                      >
                        {day}
                      </span>
                      {daySessions.length > 0 && (
                        <div className="mt-auto flex items-center justify-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#00B4D8]" />
                          {totalFish > 0 && (
                            <span className="text-xs font-semibold text-[#00B4D8]">
                              {totalFish}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded sessions for this week */}
            {expandedDate &&
              week.some((day) => day !== null && getDateKey(day) === expandedDate) && (
                <div className="border-b border-[#21262D] bg-[#0D1117] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#E8923A]">
                    Sessions on{" "}
                    {parseLocalDate(expandedDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
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
    </div>
  );
}
