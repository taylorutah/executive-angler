"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, FishSymbol, Bug, Bell, MessageSquare, Heart, User, Package, Users } from "@/icons";
import { APP_STORE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import type { AuthUser } from "@/lib/auth-context";
import { EXPLORE_ITEMS, FOCUS_VISIBLE, LEARN_LINK, MOTION_SAFE, PUBLIC_NOUNS, isSectionActive } from "./links";
import { useModalChrome } from "./useModalChrome";

type Props = {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MEMBER_UTILITIES = [
  { label: "Feed", href: "/feed", icon: Users },
  { label: "Gear locker", href: "/account/gear", icon: Package },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

/** Full-height sheet, not a drawer. Categories read as rows with a descriptor. */
export default function MobileNavSheet({ open, onClose, user, triggerRef }: Props) {
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement>(null);

  useModalChrome({ open, containerRef: sheetRef, onClose, returnFocusTo: triggerRef });

  if (!open) return null;

  const rowClass = (active: boolean) =>
    `ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} flex h-14 items-center justify-between gap-4 px-5 text-[16px] transition-colors duration-[120ms] ease-out ${
      active ? "text-[var(--text-primary)]" : "text-[var(--text-body)]"
    }`;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="lg:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[var(--surface-page)]"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-rule)] px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-meta)]">
          Menu
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className={`ea-focus-ring ${FOCUS_VISIBLE} -mr-2 flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-body)]`}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <nav aria-label="Site" className="py-2">
        {(user ? EXPLORE_ITEMS : PUBLIC_NOUNS).map((item) => {
          const active = isSectionActive(pathname, item.section);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onClose}
              className={rowClass(active)}
            >
              <span className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                {item.descriptor && (
                  <span className="text-[13px] text-[var(--text-meta)]">{item.descriptor}</span>
                )}
              </span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--action)]" aria-hidden />
              )}
            </Link>
          );
        })}

        {!user && (
          <>
            <div className="mx-5 my-2 h-px bg-[var(--border-rule)]" />
            <Link
              href={LEARN_LINK.href}
              aria-current={isSectionActive(pathname, LEARN_LINK.section) ? "page" : undefined}
              onClick={onClose}
              className={rowClass(isSectionActive(pathname, LEARN_LINK.section))}
            >
              <span className="font-medium">{LEARN_LINK.label}</span>
            </Link>
            <div className="mx-5 my-2 h-px bg-[var(--border-rule)]" />
            <div className="space-y-3 px-5 py-3">
              <Link
                href="/login"
                onClick={onClose}
                className={`ea-focus-ring ${FOCUS_VISIBLE} block text-[16px] font-medium text-[var(--text-body)]`}
              >
                Sign in
              </Link>
              <Button
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="solid"
                size="md"
                fullWidth
                onClick={onClose}
              >
                Get the app
              </Button>
            </div>
          </>
        )}

        {user && (
          <>
            <div className="mx-5 my-2 h-px bg-[var(--border-rule)]" />
            <Link
              href="/journal/new"
              onClick={onClose}
              className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 items-center gap-3 px-5 text-[16px] font-medium text-[var(--text-primary)]`}
            >
              <FishSymbol className="h-5 w-5 text-[var(--action)]" aria-hidden />
              Log a session
            </Link>
            <Link
              href="/journal/flies/new"
              onClick={onClose}
              className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 items-center gap-3 px-5 text-[16px] text-[var(--text-body)]`}
            >
              <Bug className="h-5 w-5 text-[var(--action)]" aria-hidden />
              New fly recipe
            </Link>
            <div className="mx-5 my-2 h-px bg-[var(--border-rule)]" />
            {MEMBER_UTILITIES.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 items-center gap-3 px-5 text-[16px] text-[var(--text-body)]`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  );
}
