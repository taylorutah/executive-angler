"use client";
/**
 * ResponsiveDrawer — same API surface, different presentation per breakpoint.
 *
 *   Desktop (≥ md): right-side Radix Dialog drawer with slide-in animation.
 *   Mobile (< md):  vaul bottom sheet with drag-to-dismiss.
 *
 * Used by CloneDrawer + future "add to box" / "edit version" affordances.
 */
import * as Dialog from "@radix-ui/react-dialog";
import { Drawer as Vaul } from "vaul";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Footer slot (action buttons). Pinned to bottom on mobile. */
  footer?: ReactNode;
  /** Width on desktop. Defaults to 480px. */
  desktopWidth?: number;
}

export default function ResponsiveDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  desktopWidth = 480,
}: Props) {
  // Use a media query rather than CSS so the two implementations don't
  // both mount.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile) {
    return (
      <Vaul.Root open={open} onOpenChange={onOpenChange}>
        <Vaul.Portal>
          <Vaul.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Vaul.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[92vh] flex-col rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl">
            <Vaul.Title className="sr-only">{title}</Vaul.Title>
            {description && (
              <Vaul.Description className="sr-only">{description}</Vaul.Description>
            )}
            <div className="mx-auto my-2 h-1.5 w-12 rounded-full bg-[var(--color-border)]" aria-hidden />
            <div className="flex items-center justify-between px-4 pb-2">
              <h2 className="font-heading text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
            {footer && (
              <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                {footer}
              </div>
            )}
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          style={{ width: desktopWidth }}
          className="fixed right-0 top-0 bottom-0 z-50 flex max-w-[95vw] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl outline-none"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer && (
            <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
