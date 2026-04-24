"use client";

import { Globe, Lock } from "lucide-react";

export type SessionPrivacy = "public" | "private";

interface Props {
  value: SessionPrivacy;
  onChange: (v: SessionPrivacy) => void;
  className?: string;
}

export default function SessionPrivacyToggle({ value, onChange, className }: Props) {
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
      </div>

      <p className="text-xs text-[#6E7681] mt-2">
        {privateActive
          ? "Only you can see this session. It still counts toward your personal stats."
          : "Visible in the community feed and on your profile."}
      </p>
    </div>
  );
}
