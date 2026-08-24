"use client";

import { Eye, Lock } from "lucide-react";

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
      <h2 className="text-sm font-bold text-[var(--text-body)] mb-3 flex items-center gap-2">
        {broadcasting ? <Eye className="h-4 w-4 text-[var(--action)]" /> : <Lock className="h-4 w-4 text-[var(--action)]" />}
        Show on the Feed
      </h2>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-rule)] bg-[var(--surface-page)] p-1">
        <button
          type="button"
          onClick={() => onChange("private")}
          aria-pressed={privateMode}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-semibold transition-colors ${
            privateMode
              ? "bg-[var(--action)] text-white"
              : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Lock className="h-4 w-4" />
          Keep Private
        </button>

        <button
          type="button"
          onClick={() => onChange("public")}
          aria-pressed={broadcasting}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-semibold transition-colors ${
            broadcasting
              ? "bg-[var(--action)] text-white"
              : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Eye className="h-4 w-4" />
          Broadcast
        </button>
      </div>

      <p className="text-xs text-[var(--text-meta)] mt-2 leading-relaxed">
        {broadcasting
          ? "You appear on the feed with river, section, and weather only. Fish counts, GPS, catches, and notes stay private — always."
          : "Default. Nothing about this session is shared. Logged to your journal only."}
      </p>
    </div>
  );
}
