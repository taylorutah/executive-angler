"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, FileText, Table, CheckCircle } from "lucide-react";

interface Session {
  id: string;
  date: string;
  river_name: string | null;
  total_fish: number | null;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  notes: string | null;
  section: string | null;
  location: string | null;
}

interface Catch {
  id: string;
  session_id: string;
  species: string | null;
  length_inches: number | null;
  fly_size: string | null;
  time_caught: string | null;
  notes: string | null;
  flyPatternName: string | null;
}

type Format = "csv" | "pdf";

export default function ExportClient({
  sessions,
  catches,
}: {
  sessions: Session[];
  catches: Catch[];
}) {
  const [format, setFormat] = useState<Format>("csv");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  function dateStamp() {
    return new Date().toISOString().split("T")[0];
  }

  function csvEscape(val: string): string {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }

  function formatDate(d: string): string {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function generateCSV(): string {
    const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));

    let csv = "Session Date,River,Section,Fish Count,Weather,Water Temp (°F),Water Clarity,Location,Notes\n";
    for (const s of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
      csv += [
        s.date,
        csvEscape(s.river_name || ""),
        csvEscape(s.section || ""),
        String(s.total_fish || 0),
        csvEscape(s.weather || ""),
        s.water_temp_f != null ? String(Math.round(s.water_temp_f)) : "",
        csvEscape(s.water_clarity || ""),
        csvEscape(s.location || ""),
        csvEscape((s.notes || "").replace(/\n/g, " ")),
      ].join(",") + "\n";
    }

    csv += "\n\nCatch Date,River,Species,Length (in),Fly Pattern,Fly Size,Notes\n";
    for (const c of catches) {
      const s = sessionMap[c.session_id];
      csv += [
        s?.date || "",
        csvEscape(s?.river_name || ""),
        csvEscape(c.species || "Unknown"),
        c.length_inches != null ? c.length_inches.toFixed(1) : "",
        csvEscape(c.flyPatternName || ""),
        csvEscape(c.fly_size || ""),
        csvEscape((c.notes || "").replace(/\n/g, " ")),
      ].join(",") + "\n";
    }

    return csv;
  }

  function generatePDFHTML(): string {
    const sessionCatches = new Map<string, Catch[]>();
    catches.forEach(c => {
      const arr = sessionCatches.get(c.session_id) || [];
      arr.push(c);
      sessionCatches.set(c.session_id, arr);
    });

    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Executive Angler — Trip Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
  .session { border-top: 1px solid #ddd; padding: 16px 0; }
  .session-header { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  .session-meta { color: #888; font-size: 13px; margin-bottom: 8px; }
  .catch-row { font-size: 13px; color: #444; padding: 2px 0 2px 12px; }
  .notes { font-size: 12px; color: #666; font-style: italic; margin-top: 6px; }
  @media print { body { padding: 20px; } }
</style></head><body>`;

    html += `<h1>Executive Angler — Trip Report</h1>`;
    html += `<p class="subtitle">Exported ${dateStamp()} · ${sessions.length} sessions · ${catches.length} catches</p>`;

    for (const s of sorted) {
      html += `<div class="session">`;
      html += `<div class="session-header">${s.river_name || "Unknown River"} — ${formatDate(s.date)}</div>`;

      const meta: string[] = [];
      meta.push(`${s.total_fish || 0} fish`);
      if (s.weather) meta.push(s.weather);
      if (s.water_temp_f) meta.push(`${Math.round(s.water_temp_f)}°F water`);
      if (s.water_clarity) meta.push(s.water_clarity);
      html += `<div class="session-meta">${meta.join(" · ")}</div>`;

      const myCatches = sessionCatches.get(s.id) || [];
      for (const c of myCatches) {
        let line = `• ${c.species || "Unknown"}`;
        if (c.length_inches) line += ` — ${c.length_inches.toFixed(1)}"`;
        if (c.flyPatternName) line += ` on ${c.flyPatternName}`;
        if (c.fly_size) line += ` #${String(c.fly_size).replace(/^#/, "")}`;
        html += `<div class="catch-row">${line}</div>`;
      }

      if (s.notes) {
        const truncated = s.notes.length > 200 ? s.notes.slice(0, 200) + "..." : s.notes;
        html += `<div class="notes">${truncated}</div>`;
      }
      html += `</div>`;
    }

    html += `</body></html>`;
    return html;
  }

  async function handleExport() {
    setExporting(true);
    setExported(false);

    try {
      if (format === "csv") {
        const csv = generateCSV();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        downloadBlob(blob, `executive-angler-export-${dateStamp()}.csv`);
      } else {
        const html = generatePDFHTML();
        const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
        // Open in new tab for printing as PDF
        const url = URL.createObjectURL(blob);
        const w = window.open(url, "_blank");
        if (w) {
          w.onload = () => {
            setTimeout(() => w.print(), 500);
          };
        }
      }
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      console.error("Export failed:", e);
    }

    setExporting(false);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Download className="h-6 w-6 text-[#0BA5C7]" />
            <h1 className="font-serif text-2xl text-[#F0F6FC]">Export Data</h1>
          </div>
        </div>

        {/* Data summary */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#A8B2BD] uppercase tracking-wider mb-1">Sessions</p>
              <p className="text-2xl font-bold text-[#F0F6FC] font-mono">{sessions.length}</p>
            </div>
            <div>
              <p className="text-xs text-[#A8B2BD] uppercase tracking-wider mb-1">Catches</p>
              <p className="text-2xl font-bold text-[#F0F6FC] font-mono">{catches.length}</p>
            </div>
          </div>
          {sessions.length > 0 && (
            <p className="text-xs text-[#6E7681] mt-3">
              {sessions[sessions.length - 1].date} → {sessions[0].date}
            </p>
          )}
        </div>

        {/* Format picker */}
        <div className="mb-6">
          <p className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Format</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("csv")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                format === "csv"
                  ? "bg-[#E8923A]/10 border-[#E8923A] text-[#E8923A]"
                  : "bg-[#161B22] border-[#21262D] text-[#A8B2BD] hover:border-[#6E7681]"
              }`}
            >
              <Table className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold text-sm">CSV</p>
                <p className="text-[11px] opacity-70">Spreadsheet-ready</p>
              </div>
            </button>

            <button
              onClick={() => setFormat("pdf")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                format === "pdf"
                  ? "bg-[#0BA5C7]/10 border-[#0BA5C7] text-[#0BA5C7]"
                  : "bg-[#161B22] border-[#21262D] text-[#A8B2BD] hover:border-[#6E7681]"
              }`}
            >
              <FileText className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold text-sm">PDF</p>
                <p className="text-[11px] opacity-70">Formatted trip report</p>
              </div>
            </button>
          </div>
        </div>

        {/* What's included */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 mb-6">
          <p className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Includes</p>
          <ul className="space-y-2 text-sm text-[#F0F6FC]">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#2EA44F] shrink-0" />
              All sessions with date, river, fish count, weather, water data
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#2EA44F] shrink-0" />
              Individual catches with species, length, fly pattern, fly size
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#2EA44F] shrink-0" />
              Session notes and location data
            </li>
          </ul>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exporting || sessions.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E8923A] text-white text-base font-bold rounded-xl hover:bg-[#F0A65A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Exporting...
            </>
          ) : exported ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Exported!
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Export {format.toUpperCase()}
            </>
          )}
        </button>

        {format === "pdf" && (
          <p className="text-xs text-[#6E7681] mt-3 text-center">
            Opens a formatted report in a new tab — use your browser&apos;s Print → Save as PDF
          </p>
        )}
      </div>
    </div>
  );
}
