"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  Upload,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
} from "@/icons";
import { HEADERS, WATER_CLARITY_VALUES, FLY_POSITION_VALUES } from "@/lib/import/csv-schema";
import PageHeader from "@/components/ui/PageHeader";

type PreviewCatch = {
  rowIndex: number;
  species: string | null;
  length_inches: number | null;
  fly_name: string | null;
  fly_size: string | null;
  fly_position: string | null;
  quantities: number;
};

type PreviewSession = {
  date: string;
  title: string | null;
  river_name: string | null;
  river_match: "exact" | "unmatched" | "none";
  location: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  weather: string | null;
  // Imported sessions never broadcast — owner can opt in per session
  // after import. Field kept on the type for transitional safety; the
  // import route ignores it and always writes broadcast_presence=false.
  duplicate: boolean;
  rowIndices: number[];
  catches: PreviewCatch[];
};

type Issue = {
  row: number;
  severity: "error" | "warning";
  column?: string;
  message: string;
};

type PreviewResponse = {
  mode: "preview";
  summary: {
    sessions: number;
    sessionsReady: number;
    duplicates: number;
    catches: number;
    errors: number;
    warnings: number;
  };
  unknownHeaders: string[];
  exampleRowsSkipped: number;
  sessions: PreviewSession[];
  issues: Issue[];
};

type CommitResponse = {
  mode: "commit";
  summary: {
    sessionsCreated: number;
    catchesCreated: number;
    duplicatesSkipped: number;
    errorsSkipped: number;
    failed: { row: number; error: string }[];
  };
  issues: Issue[];
};

const AI_PROMPT = `You're helping me migrate my fly fishing journal into Executive Angler.

I'll share my data from: [paste/describe source — old notebook photos, Excel file, Notion export, Apple Notes dump, guide's trip log, etc.]

Please transform it into a CSV with EXACTLY these 27 columns:

${HEADERS.join(", ")}

Rules:
- session_date in YYYY-MM-DD format (only required field)
- One row per fish caught; repeat session columns on every row
- For sessions with no fish caught, leave all catch columns blank
- water_clarity: one of ${WATER_CLARITY_VALUES.map((v) => `"${v}"`).join(", ")}
- fly_position: one of ${FLY_POSITION_VALUES.map((v) => `"${v}"`).join(", ")}
- Skip any field you don't have — all are optional except session_date
- Use consistent river names ("Madison River" not "Madison")
- Wrap values containing commas in double quotes

Output just the CSV with the header row, nothing else.`;

export default function ImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [commit, setCommit] = useState<CommitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const copyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(AI_PROMPT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }, []);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/import/csv?mode=preview", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        setStage("upload");
        return;
      }
      setPreview(data as PreviewResponse);
      setStage("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStage("upload");
    } finally {
      setBusy(false);
    }
  }, []);

  const handleCommit = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setStage("importing");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/csv?mode=commit", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        setStage("preview");
        return;
      }
      setCommit(data as CommitResponse);
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setStage("preview");
    } finally {
      setBusy(false);
    }
  }, [file]);

  const resetAll = useCallback(() => {
    setFile(null);
    setPreview(null);
    setCommit(null);
    setError(null);
    setStage("upload");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--text-1)]">
      <div className="max-w-[var(--container)] mx-auto px-4 py-6 lg:py-8">
        <PageHeader
          eyebrow="Journal"
          title="Import sessions"
          meta="Old notebooks, spreadsheets, Notion pages — format into an EA-ready CSV with AI, upload, review, save."
        />


        {/* Stage: upload */}
        {stage === "upload" && (
          <div className="space-y-6">
            {/* Step 1 */}
            <StepCard
              number={1}
              title="Download the CSV template"
              subtitle="27 columns covering everything a session can hold. One row per fish caught."
            >
              <a
                href="/api/import/template"
                className="ea-btn ea-btn-secondary"
              >
                <Download className="h-4 w-4" /> Download Template (.csv)
              </a>
              <div className="mt-4 text-xs text-[var(--text-3)] space-y-1.5">
                <p>
                  The template includes one sample row as a formatting reference.
                  It&apos;s marked and will be ignored on upload — feel free to
                  leave it in place, or overwrite it with your first real session.
                </p>
                <p>
                  Already an Executive Angler user? Your{" "}
                  <a href="/api/export/csv" className="text-[var(--accent)] hover:underline">
                    CSV export
                  </a>{" "}
                  uses this same format — edit and re-import to make bulk changes.
                </p>
              </div>
            </StepCard>

            {/* Step 2 */}
            <StepCard
              number={2}
              title="Prepare your data with AI"
              subtitle="Paste this prompt into ChatGPT, Claude, or Gemini along with your notebook photos or old file. The AI will output a ready-to-upload CSV."
            >
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span className="font-semibold">AI Prompt Template</span>
                  </div>
                  <button
                    onClick={copyPrompt}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
                  >
                    {promptCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="px-4 py-3 text-xs text-[var(--text-2)] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {AI_PROMPT}
                </pre>
              </div>
              <div className="mt-3 text-xs text-[var(--text-3)]">
                Gear isn&apos;t part of import — once your journal is in, add rods,
                reels, lines and tippets from{" "}
                <Link href="/account/gear" className="text-[var(--accent)] hover:underline">
                  Gear Locker
                </Link>
                .
              </div>
            </StepCard>

            {/* Step 3 */}
            <StepCard
              number={3}
              title="Upload your CSV"
              subtitle="We'll parse it, validate every row, and show you exactly what will be imported before anything saves."
            >
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed py-10 px-6 cursor-pointer transition-colors ${
                  dragActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--accent)]"
                }`}
              >
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                {busy ? (
                  <>
                    <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin" />
                    <div className="text-sm font-semibold text-[var(--text-1)]">
                      Parsing your file…
                    </div>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-8 w-8 text-[var(--text-3)]" />
                    <div className="text-sm font-semibold text-[var(--text-1)]">
                      Drop CSV here or click to choose
                    </div>
                    <div className="text-xs text-[var(--text-3)]">
                      Max 5 MB · up to 10,000 rows
                    </div>
                  </>
                )}
              </label>
              {error && (
                <div className="mt-4 flex items-start gap-2 text-sm text-[var(--danger)] bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)] px-3 py-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </StepCard>
          </div>
        )}

        {/* Stage: preview */}
        {stage === "preview" && preview && (
          <PreviewPanel
            preview={preview}
            onCommit={handleCommit}
            onReset={resetAll}
            busy={busy}
          />
        )}

        {/* Stage: importing */}
        {stage === "importing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-10 w-10 text-[var(--accent)] animate-spin" />
            <div className="text-base font-semibold text-[var(--text-1)]">
              Importing your sessions…
            </div>
            <div className="text-sm text-[var(--text-2)]">This usually takes a few seconds.</div>
          </div>
        )}

        {/* Stage: done */}
        {stage === "done" && commit && (
          <DonePanel commit={commit} onReset={resetAll} />
        )}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ea-card">
      <div className="flex items-start gap-4 mb-5">
        <div className="num flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-semibold text-sm">
          {number}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-[var(--text-1)] mb-1">{title}</h2>
          <p className="text-sm text-[var(--text-2)]">{subtitle}</p>
        </div>
      </div>
      <div className="pl-12">{children}</div>
    </div>
  );
}

function PreviewPanel({
  preview,
  onCommit,
  onReset,
  busy,
}: {
  preview: PreviewResponse;
  onCommit: () => void;
  onReset: () => void;
  busy: boolean;
}) {
  const { summary, sessions, issues, unknownHeaders } = preview;
  const errorIssues = issues.filter((i) => i.severity === "error");
  const warnIssues = issues.filter((i) => i.severity === "warning");
  const commitDisabled = summary.sessionsReady === 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="ea-card">
        <h2 className="font-display text-lg font-semibold text-[var(--text-1)] mb-4">Preview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat label="Sessions" value={summary.sessions} />
          <Stat label="Catches" value={summary.catches} />
          <Stat
            label="Ready to import"
            value={summary.sessionsReady}
            tone="good"
          />
          <Stat
            label="Duplicates"
            value={summary.duplicates}
            tone={summary.duplicates > 0 ? "warn" : undefined}
          />
          <Stat
            label="Errors"
            value={summary.errors}
            tone={summary.errors > 0 ? "bad" : undefined}
          />
        </div>

        {unknownHeaders.length > 0 && (
          <div className="mt-4 flex items-start gap-2 text-xs text-[var(--text-2)] bg-[var(--paper-deep)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[var(--warning)]" />
            <span>
              Ignored {unknownHeaders.length} unknown column{unknownHeaders.length > 1 ? "s" : ""}: {unknownHeaders.join(", ")}
            </span>
          </div>
        )}

        {preview.exampleRowsSkipped > 0 && (
          <div className="mt-2 flex items-start gap-2 text-xs text-[var(--text-2)] bg-[var(--paper-deep)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2">
            <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[var(--success)]" />
            <span>
              Skipped {preview.exampleRowsSkipped} template example row{preview.exampleRowsSkipped > 1 ? "s" : ""}.
            </span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={onCommit}
            disabled={commitDisabled || busy}
            className="ea-btn ea-btn-primary"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Import {summary.sessionsReady} session{summary.sessionsReady !== 1 ? "s" : ""}
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onReset}
            className="ea-btn ea-btn-ghost"
          >
            Use a different file
          </button>
        </div>
      </div>

      {/* Issues */}
      {(errorIssues.length > 0 || warnIssues.length > 0) && (
        <div className="ea-card">
          <h3 className="font-display text-base font-semibold text-[var(--text-1)] mb-3">
            {errorIssues.length > 0
              ? `${errorIssues.length} error${errorIssues.length > 1 ? "s" : ""} will be skipped`
              : "Warnings"}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {[...errorIssues, ...warnIssues].map((i, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 text-xs rounded-[var(--radius-md)] px-3 py-2 ${
                  i.severity === "error"
                    ? "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)]"
                    : "bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)]"
                }`}
              >
                {i.severity === "error" ? (
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                )}
                <span>
                  <span className="num font-semibold">Row {i.row}</span>
                  {i.column && (
                    <span> · {i.column}</span>
                  )}
                  : {i.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="ea-card">
        <h3 className="font-display text-base font-semibold text-[var(--text-1)] mb-4">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} detected
        </h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {sessions.map((s, idx) => {
            const stateLabel = s.duplicate
              ? "Duplicate — will skip"
              : s.river_match === "unmatched"
                ? "Ready — river unmatched"
                : "Ready";
            const stateTone = s.duplicate
              ? "text-[var(--warning)] bg-[var(--warning)]/10"
              : s.river_match === "unmatched"
                ? "text-[var(--warning)] bg-[var(--warning)]/10"
                : "text-[var(--success)] bg-[var(--success)]/10";
            return (
              <div
                key={idx}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-3)] mb-1">
                      <span className="num">{s.date}</span>
                      {s.river_name && (
                        <>
                          <span>·</span>
                          <span className="truncate">{s.river_name}</span>
                        </>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-1)] truncate">
                      {s.title || "Untitled session"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-2)]">
                      {s.catches.length === 0 ? (
                        <span>No fish</span>
                      ) : (
                        <span>
                          {s.catches.reduce((sum, c) => sum + (c.quantities || 1), 0)} fish ·{" "}
                          {Array.from(new Set(s.catches.map((c) => c.species).filter(Boolean))).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-semibold rounded-[var(--radius-sm)] px-2 py-1 ${stateTone}`}>
                    {stateLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DonePanel({
  commit,
  onReset,
}: {
  commit: CommitResponse;
  onReset: () => void;
}) {
  const { summary } = commit;
  return (
    <div className="ea-card p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center mx-auto mb-4">
        <Check className="h-7 w-7 text-[var(--success)]" />
      </div>
      <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-2">Import complete</h2>
      <div className="text-sm text-[var(--text-2)] mb-6 space-y-1">
        <div>
          Created <span className="font-semibold text-[var(--text-1)]">{summary.sessionsCreated}</span> session
          {summary.sessionsCreated !== 1 ? "s" : ""} and{" "}
          <span className="font-semibold text-[var(--text-1)]">{summary.catchesCreated}</span> catch
          {summary.catchesCreated !== 1 ? "es" : ""}.
        </div>
        {summary.duplicatesSkipped > 0 && (
          <div>
            Skipped {summary.duplicatesSkipped} existing session
            {summary.duplicatesSkipped !== 1 ? "s" : ""}.
          </div>
        )}
        {summary.errorsSkipped > 0 && (
          <div>
            Skipped {summary.errorsSkipped} row{summary.errorsSkipped !== 1 ? "s" : ""} with errors.
          </div>
        )}
        {summary.failed.length > 0 && (
          <div className="text-[var(--danger)]">
            {summary.failed.length} session{summary.failed.length !== 1 ? "s" : ""} failed to save.
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/journal"
          className="ea-btn ea-btn-primary"
        >
          View Journal
        </Link>
        <button
          onClick={onReset}
          className="ea-btn ea-btn-ghost"
        >
          Import another file
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "warn" | "bad";
}) {
  const color =
    tone === "good"
      ? "text-[var(--success)]"
      : tone === "warn"
        ? "text-[var(--warning)]"
        : tone === "bad"
          ? "text-[var(--danger)]"
          : "text-[var(--text-1)]";
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--paper-deep)] border border-[var(--border)] px-3 py-2.5">
      <div className={`num text-xl font-semibold ${color}`}>{value}</div>
      <div className="ea-stat-label mt-0.5">{label}</div>
    </div>
  );
}
