"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { HelpCircle, Info } from "@/icons";
import type { ReactNode } from "react";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";

type Size = "sm" | "md";
type Icon = "help" | "info";

/**
 * Small "?" or "i" button that reveals contextual help on hover (desktop)
 * and tap (mobile). Use for labeling individual controls.
 *
 * <HelpHint label="What's structured recipe mode?">
 *   Structured mode lets you pick materials from the library so we can
 *   match them against your inventory. Simple mode is just a free-form
 *   list.
 * </HelpHint>
 */
export default function HelpHint({
  label,
  children,
  icon = "help",
  size = "sm",
  className = "",
}: {
  /** Accessible label announced to screen readers */
  label: string;
  /** Help content shown inside the popover (can be rich JSX) */
  children: ReactNode;
  icon?: Icon;
  size?: Size;
  className?: string;
}) {
  const Icn = icon === "info" ? Info : HelpCircle;
  const iconSize = size === "md" ? 16 : 14;
  const btnSize = size === "md" ? "h-6 w-6" : "h-5 w-5";

  return (
    <Tooltip.Provider delayDuration={200}>
      <Popover.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label={label}
                className={`ea-focus-ring ${FOCUS_VISIBLE} inline-flex ${btnSize} items-center justify-center rounded-full text-[var(--text-meta)] hover:text-[var(--action)] hover:bg-[var(--action)]/10 transition-colors motion-reduce:transition-none ${className}`}
              >
                <Icn size={iconSize} aria-hidden />
              </button>
            </Popover.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              align="center"
              sideOffset={4}
              className="z-50 rounded bg-[var(--surface-page)] border border-[var(--border-rule)] px-2 py-1 text-xs text-[var(--text-body)] shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:animate-out"
            >
              {label}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Popover.Portal>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={8}
            collisionPadding={16}
            className="z-50 max-w-xs rounded-lg bg-[var(--surface-page)] border border-[var(--border-rule)] p-3 text-sm text-[var(--text-body)] shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out"
          >
            <div className="space-y-1.5 leading-relaxed">{children}</div>
            <Popover.Arrow className="fill-[var(--border-rule)]" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Tooltip.Provider>
  );
}
