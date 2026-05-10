"use client";

/**
 * Confirmation toast after adding a fly to one or more boxes. Auto-dismisses
 * after 5s, includes a deep link to the destination box.
 */

import { useEffect } from "react";
import Link from "next/link";
import { Check, Box as BoxIcon } from "lucide-react";

export interface ToastInfo {
  flyName: string;
  variantLabel: string;
  boxNames: string[];
  firstBoxId?: string;
}

interface Props {
  info: ToastInfo | null;
  onDone: () => void;
}

const DISMISS_MS = 5000;

export default function AddToBoxToast({ info, onDone }: Props) {
  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => onDone(), DISMISS_MS);
    return () => clearTimeout(t);
  }, [info, onDone]);

  if (!info) return null;

  const boxLabel =
    info.boxNames.length === 0
      ? "your box"
      : info.boxNames.length === 1
      ? info.boxNames[0]
      : `${info.boxNames.length} boxes`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[calc(100%-2rem)] pointer-events-none">
      <div className="pointer-events-auto rounded-lg border border-[#21262D] bg-[#161B22] shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2EA44F]/15 text-[#2EA44F] flex-shrink-0">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="text-[#F0F6FC] text-sm truncate">
            Added{" "}
            <span className="text-[#E8923A]">{info.flyName}</span>
            {info.variantLabel && info.variantLabel !== info.flyName && (
              <span className="text-[#A8B2BD] text-xs">
                {" "}
                · {info.variantLabel}
              </span>
            )}{" "}
            <span className="text-[#A8B2BD]">→ {boxLabel}</span>
          </span>
        </div>
        {info.firstBoxId && (
          <Link
            href={`/flies/boxes/${info.firstBoxId}`}
            className="inline-flex items-center gap-1 rounded-md border border-[#30363D] px-2.5 py-1 text-xs font-medium text-[#A8B2BD] hover:bg-[#1F2937] hover:text-[#F0F6FC] transition-colors flex-shrink-0"
            onClick={onDone}
          >
            <BoxIcon className="h-3 w-3" />
            View
          </Link>
        )}
      </div>
    </div>
  );
}
