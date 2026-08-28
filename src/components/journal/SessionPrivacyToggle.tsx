"use client";

import { Eye, Lock } from "@/icons";

export type SessionPrivacy = "public" | "private";

interface Props {
  value: SessionPrivacy;
  onChange: (v: SessionPrivacy) => void;
  className?: string;
}

export default function SessionPrivacyToggle({ value, onChange, className }: Props) {
  const broadcasting = value === "public";
  const privateMode = value === "private";

  return (
    <div className={className}>
      <h2 className="ea-overline mb-3 flex items-center gap-2">
        {broadcasting ? <Eye className="h-4 w-4 text-[var(--accent)]" /> : <Lock className="h-4 w-4 text-[var(--accent)]" />}
        Show on the Feed
      </h2>

      <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => onChange("private")}
          aria-pressed={privateMode}
          className={`flex items-center justify-center gap-2 rounded-[var(--radius-sm)] py-2.5 px-3 text-sm font-medium transition-colors ${
            privateMode
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-2)] hover:text-[var(--text-1)]"
          }`}
        >
          <Lock className="h-4 w-4" />
          Keep Private
        </button>

        <button
          type="button"
          onClick={() => onChange("public")}
          aria-pressed={broadcasting}
          className={`flex items-center justify-center gap-2 rounded-[var(--radius-sm)] py-2.5 px-3 text-sm font-medium transition-colors ${
            broadcasting
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-2)] hover:text-[var(--text-1)]"
          }`}
        >
          <Eye className="h-4 w-4" />
          Broadcast
        </button>
      </div>

      <p className="text-xs text-[var(--text-3)] mt-2 leading-relaxed">
        {broadcasting
          ? "You appear on the feed with river, section, and weather only. Fish counts, GPS, catches, and notes stay private — always."
          : "Default. Nothing about this session is shared. Logged to your journal only."}
      </p>
    </div>
  );
}
