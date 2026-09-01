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

/**
 * T7O4R chrome. Logged-out: heron, wordmark, five nouns, one willow button.
 * No search field, Explore, Sign in, bell, or plus. Logged-in utilities
 * sit on the right without changing that composition.
 */
export default function GazetteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--paper)]">
        <div className="mx-auto grid h-[var(--header-h)] max-w-[72rem] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
          <Link
            href={user ? POST_LOGIN_PATH : "/"}
            className="ea-focus-ring flex flex-shrink-0 cursor-pointer select-none items-center gap-2.5 justify-self-start"
            aria-label="Executive Angler — home"
          >
            <HeronMark className="h-[30px] w-[22px] text-[var(--copper)]" aria-hidden />
            <span className="ea-wordmark hidden sm:block">
              Executive
              <br />
              Angler
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden h-[var(--header-h)] items-stretch md:flex">
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

          <div className="flex items-center justify-self-end gap-2">
            {isLoading ? (
              <div className="hidden h-8 w-28 bg-[var(--paper-deep)] md:block" />
            ) : user ? (
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
            ) : (
              <Link
                href="/signup"
                className="hidden bg-[var(--accent)] px-3.5 py-2 font-ui text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--on-action)] md:inline-flex"
              >
                Create account
              </Link>
            )}

            <button
              ref={menuButtonRef}
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
              className={`ea-focus-ring ${FOCUS_VISIBLE} inline-flex h-11 items-center gap-2 px-2 font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-2)] md:hidden`}
            >
              Menu
            </button>
          </div>
        </div>
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
