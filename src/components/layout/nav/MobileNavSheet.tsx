"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, FishSymbol, Bug, Bell, MessageSquare, Anchor, User, Package, Users, ChevronDown } from "@/icons";
import type { AuthUser } from "@/lib/auth-context";
import { EXPLORE_ITEMS, FOCUS_VISIBLE, LEARN_LINK, MEGA_MENU_LINKS, MOTION_SAFE, PUBLIC_NOUNS, isSectionActive } from "./links";
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
  { label: "Favorites", href: "/favorites", icon: Anchor },
  { label: "Account", href: "/account", icon: User },
];

/** Full-height sheet, not a drawer. Categories read as rows with a descriptor. */
export default function MobileNavSheet({ open, onClose, user, triggerRef }: Props) {
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);

  useModalChrome({ open, containerRef: sheetRef, onClose, returnFocusTo: triggerRef });

  if (!open) return null;

  const rowClass = (active: boolean) =>
    `ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} flex h-14 items-center justify-between gap-4 px-4 sm:px-6 text-[16px] transition-colors duration-150 ease-standard ${
      active ? "text-[var(--text-primary)]" : "text-[var(--text-body)]"
    }`;

  // Directory links the sheet's main list doesn't already carry (mega-menu
  // vocabulary, accordion pattern per the 2026-08-28 chrome ruling).
  const listed = new Set((user ? EXPLORE_ITEMS : PUBLIC_NOUNS).map((item) => item.href));
  if (!user) listed.add(LEARN_LINK.href);
  const directoryLinks = MEGA_MENU_LINKS.filter((item) => !listed.has(item.href));

  // Accordion child rows indent one step past the sheet's px-4/sm:px-6 rows.
  const subRowClass = (active: boolean) =>
    `ea-focus-ring ${FOCUS_VISIBLE} ${MOTION_SAFE} flex h-14 items-center justify-between gap-4 pl-8 pr-4 sm:pr-6 text-[16px] transition-colors duration-150 ease-standard ${
      active ? "text-[var(--text-primary)]" : "text-[var(--text-body)]"
    }`;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="md:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[var(--surface-page)]"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-[var(--border-rule)] px-4">
        <p className="ea-overline">
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
        <Link
          href="/search"
          onClick={onClose}
          className={rowClass(isSectionActive(pathname, "/search"))}
        >
          <span className="flex flex-col">
            <span className="font-medium">Search</span>
            <span className="text-[13px] text-[var(--text-meta)]">River, fly, hatch, destination</span>
          </span>
        </Link>

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
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
              )}
            </Link>
          );
        })}

        {directoryLinks.length > 0 && (
          <>
            <div className="mx-4 sm:mx-6 my-2 h-px bg-[var(--border-rule)]" />
            <button
              type="button"
              aria-expanded={directoryOpen}
              aria-controls="mobile-directory-links"
              onClick={() => setDirectoryOpen((value) => !value)}
              className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6 text-[16px] font-medium text-[var(--text-body)]`}
            >
              Directory
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-150 ease-standard ${MOTION_SAFE} ${directoryOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {directoryOpen && (
              <div id="mobile-directory-links">
                {directoryLinks.map((item) => {
                  const active = isSectionActive(pathname, item.section);
                  const href =
                    user && item.href === "/flies/library" ? "/flies" : item.href;
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={onClose}
                      className={subRowClass(active)}
                    >
                      <span className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        {item.descriptor && (
                          <span className="text-[13px] text-[var(--text-meta)]">{item.descriptor}</span>
                        )}
                      </span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!user && (
          <>
            <div className="mx-4 sm:mx-6 my-2 h-px bg-[var(--border-rule)]" />
            <Link
              href={LEARN_LINK.href}
              aria-current={isSectionActive(pathname, LEARN_LINK.section) ? "page" : undefined}
              onClick={onClose}
              className={rowClass(isSectionActive(pathname, LEARN_LINK.section))}
            >
              <span className="font-medium">{LEARN_LINK.label}</span>
            </Link>
            <div className="mx-4 sm:mx-6 my-2 h-px bg-[var(--border-rule)]" />
            <div className="space-y-3 px-4 sm:px-6 py-3">
              <Link
                href="/login"
                onClick={onClose}
                className={`ea-focus-ring ${FOCUS_VISIBLE} block text-[16px] font-medium text-[var(--text-body)]`}
              >
                Sign in
              </Link>
            </div>
          </>
        )}

        {user && (
          <>
            <div className="mx-4 sm:mx-6 my-2 h-px bg-[var(--border-rule)]" />
            <Link
              href="/journal/new"
              onClick={onClose}
              className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 items-center gap-3 px-4 sm:px-6 text-[16px] font-medium text-[var(--text-primary)]`}
            >
              <FishSymbol className="h-5 w-5 text-[var(--accent)]" aria-hidden />
              Log a session
            </Link>
            <Link
              href="/journal/flies/new"
              onClick={onClose}
              className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 items-center gap-3 px-4 sm:px-6 text-[16px] text-[var(--text-body)]`}
            >
              <Bug className="h-5 w-5 text-[var(--accent)]" aria-hidden />
              New fly recipe
            </Link>
            <div className="mx-4 sm:mx-6 my-2 h-px bg-[var(--border-rule)]" />
            {MEMBER_UTILITIES.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`ea-focus-ring ${FOCUS_VISIBLE} flex h-14 items-center gap-3 px-4 sm:px-6 text-[16px] text-[var(--text-body)]`}
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
