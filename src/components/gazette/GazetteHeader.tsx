"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/notifications/NotificationDropdown";
import { MessageIcon } from "@/components/notifications/MessageIcon";
import HeronMark from "@/components/brand/HeronMark";
import MobileNavSheet from "@/components/layout/nav/MobileNavSheet";
import { FOCUS_VISIBLE, MEMBER_NOUNS, PUBLIC_NOUNS, isSectionActive } from "@/components/layout/nav/links";
import { useRouteChangeReset } from "@/components/layout/nav/useRouteChangeReset";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

function stationReportLabel(pathname: string): string | null {
  const match = pathname.match(/^\/rivers\/([^/]+)$/);
  if (!match) return null;
  return match[1].replace(/-/g, " ");
}

/**
 * Identity lockup: etched heron + two-line EXECUTIVE / ANGLER (stills 2 + 5).
 * River detail uses the still-3 masthead: mark, centered station title, EST. 1987.
 */
export default function GazetteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const station = stationReportLabel(pathname);

  useRouteChangeReset(() => {
    setMobileOpen(false);
    setPlusOpen(false);
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nouns = user ? MEMBER_NOUNS : PUBLIC_NOUNS;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--paper)]">
        {station ? (
          <div className="grid h-[var(--header-h)] grid-cols-[auto_minmax(0,1fr)_auto] items-center px-3 sm:px-6">
            <Link
              href={user ? POST_LOGIN_PATH : "/"}
              className="ea-focus-ring flex min-w-0 flex-shrink-0 cursor-pointer select-none items-center gap-2"
              aria-label="Executive Angler — home"
            >
              <HeronMark className="ea-lockup-heron h-14 w-8 md:h-[4.75rem] md:w-[2.625rem]" aria-hidden />
              <span className="ea-wordmark md:hidden">
                Executive
                <br />
                Angler
              </span>
            </Link>
            <div className="hidden min-w-0 text-center md:block">
              <p className="font-display text-[15px] font-semibold uppercase tracking-[0.28em] text-[var(--ink)]">
                Executive Angler
              </p>
              <p className="mt-1 font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                {station} station report
              </p>
            </div>
            <div className="flex items-center justify-self-end gap-3">
              <p className="hidden font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)] md:block">
                Est. 1987
              </p>
              {user ? (
                <div className="hidden items-center gap-1 md:flex">
                  <NotificationBell />
                  <MessageIcon />
                </div>
              ) : null}
              <button
                ref={menuButtonRef}
                onClick={() => setMobileOpen(true)}
                aria-expanded={mobileOpen}
                aria-haspopup="dialog"
                aria-label="Menu"
                className={`ea-focus-ring ${FOCUS_VISIBLE} inline-flex h-11 w-11 items-center justify-center text-[var(--copper)]`}
              >
                <Icon name="menu" className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid h-[var(--header-h)] grid-cols-[minmax(0,1fr)_auto] items-center px-3 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Link
              href={user ? POST_LOGIN_PATH : "/"}
              className="ea-focus-ring flex min-w-0 flex-shrink-0 cursor-pointer select-none items-center gap-2"
              aria-label="Executive Angler — home"
            >
              <HeronMark className="ea-lockup-heron h-14 w-8 md:h-[4.75rem] md:w-[2.625rem]" aria-hidden />
              <span className="ea-wordmark">
                Executive
                <br />
                Angler
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden h-[var(--header-h)] items-stretch justify-center md:flex">
              {nouns.map((item) => {
                const active = isSectionActive(pathname, item.section);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="ea-nav-link ea-focus-ring"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-self-end gap-1">
              {user ? (
                <div className="hidden items-center gap-1 md:flex">
                  <NotificationBell />
                  <MessageIcon />
                  <Link
                    href="/account"
                    aria-label="Your account"
                    className="ea-focus-ring ml-1 flex items-center"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--paper-deep)]">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.displayName || "Your account"}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-ui text-[12px] font-medium text-[var(--text-2)]">
                          {(user.displayName || user.email || "A")[0].toUpperCase()}
                        </span>
                      )}
                    </span>
                  </Link>
                  <div ref={plusRef} className="relative ml-1">
                    <button
                      onClick={() => setPlusOpen(!plusOpen)}
                      aria-label="Quick actions"
                      aria-expanded={plusOpen}
                      aria-haspopup="menu"
                      className={`ea-focus-ring flex h-8 w-8 items-center justify-center bg-[var(--accent)] text-[var(--on-action)] ${
                        plusOpen ? "rotate-45" : ""
                      }`}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                    </button>
                    {plusOpen && (
                      <div
                        role="menu"
                        aria-label="Quick actions"
                        className="absolute right-0 top-full z-50 mt-2 w-52 border border-[var(--border)] bg-[var(--paper)]"
                      >
                        <Link
                          href="/journal/new"
                          role="menuitem"
                          className="ea-focus-ring flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
                        >
                          Log a session
                        </Link>
                        <div className="mx-4 h-px bg-[var(--border)]" />
                        <Link
                          href="/journal/flies/new"
                          role="menuitem"
                          className="ea-focus-ring flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
                        >
                          New fly recipe
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <button
                ref={menuButtonRef}
                onClick={() => setMobileOpen(true)}
                aria-expanded={mobileOpen}
                aria-haspopup="dialog"
                aria-label="Menu"
                className={`ea-focus-ring ${FOCUS_VISIBLE} inline-flex h-11 w-11 items-center justify-center text-[var(--copper)]`}
              >
                <Icon name="menu" className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      <MobileNavSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
