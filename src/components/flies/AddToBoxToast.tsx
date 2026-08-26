"use client";

/**
 * Confirmation toast after adding a fly to one or more boxes. Auto-dismisses
 * after 5s, includes a deep link to the destination box.
 */

import { useEffect } from "react";
import Link from "next/link";
import { Check, Box as BoxIcon } from "@/icons";

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
      <div className="pointer-events-auto rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--state-positive)]/15 text-[var(--state-positive)] flex-shrink-0">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="text-[var(--text-primary)] text-sm truncate">
            Added{" "}
            <span className="text-[var(--action)]">{info.flyName}</span>
            {info.variantLabel && info.variantLabel !== info.flyName && (
              <span className="text-[var(--text-body)] text-xs">
                {" "}
                · {info.variantLabel}
              </span>
            )}{" "}
            <span className="text-[var(--text-body)]">→ {boxLabel}</span>
          </span>
        </div>
        {info.firstBoxId && (
          <Link
            href={`/flies/boxes/${info.firstBoxId}`}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border-strong)] px-2.5 py-1 text-xs font-medium text-[var(--text-body)] hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
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
