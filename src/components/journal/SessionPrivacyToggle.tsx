"use client";

import Link from "next/link";
import { Globe, Lock } from "lucide-react";

export type SessionPrivacy = "public" | "private";

interface Props {
  value: SessionPrivacy;
  onChange: (v: SessionPrivacy) => void;
  isPremium: boolean;
  className?: string;
}

export default function SessionPrivacyToggle({ value, onChange, isPremium, className }: Props) {
  const publicActive = value === "public";
  const privateActive = value === "private";

  return (
    <div className={className}>
      <h2 className="text-sm font-bold text-[#A8B2BD] mb-3 flex items-center gap-2">
        {privateActive ? <Lock className="h-4 w-4 text-[#E8923A]" /> : <Globe className="h-4 w-4 text-[#E8923A]" />}
        Privacy
      </h2>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#21262D] bg-[#0D1117] p-1">
        <button
          type="button"
          onClick={() => onChange("public")}
          aria-pressed={publicActive}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-semibold transition-colors ${
            publicActive
              ? "bg-[#E8923A] text-white"
              : "text-[#A8B2BD] hover:text-[#F0F6FC]"
          }`}
        >
          <Globe className="h-4 w-4" />
          Public
        </button>

        {isPremium ? (
          <button
            type="button"
            onClick={() => onChange("private")}
            aria-pressed={privateActive}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-semibold transition-colors ${
              privateActive
                ? "bg-[#E8923A] text-white"
                : "text-[#A8B2BD] hover:text-[#F0F6FC]"
            }`}
          >
            <Lock className="h-4 w-4" />
            Only Me
          </button>
        ) : (
          <Link
            href="/pricing"
            aria-disabled="true"
            title="Private sessions are a Pro feature"
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-semibold text-[#6E7681] hover:text-[#E8923A] border border-dashed border-[#21262D]"
          >
            <Lock className="h-4 w-4" />
            Only Me
            <span className="ml-1 rounded-md bg-[#E8923A]/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#E8923A]">
              Pro
            </span>
          </Link>
        )}
      </div>

      <p className="text-xs text-[#6E7681] mt-2">
        {privateActive
          ? "Only you can see this session. It still counts toward your personal stats."
          : isPremium
            ? "Visible in the community feed and on your profile."
            : "Visible in the community feed. Upgrade to Pro to keep sessions private."}
      </p>
    </div>
  );
}
