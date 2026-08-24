"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Leaf, Map } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/") },
  { href: "/journal", label: "Journal", icon: BookOpen, match: (p: string) => p === "/journal" || p.startsWith("/journal/") },
  { href: "/flies", label: "Flies", icon: Leaf, match: (p: string) => p === "/flies" || p.startsWith("/flies/") },
  { href: "/rivers", label: "Explore", icon: Map, match: (p: string) => p === "/rivers" || p.startsWith("/rivers/") },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  // Hide on deep-create flows where bottom chrome fights a form
  if (pathname === "/journal/new" || pathname === "/journal/flies/new") return null;

  const accountActive = pathname === "/account" || pathname.startsWith("/account/");
  const avatarInitial = (user.displayName || user.email || "A")[0].toUpperCase();

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-page)]/95 backdrop-blur-md border-t border-[var(--border-rule)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-[var(--action)]" : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/account"
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
              accountActive ? "text-[var(--action)]" : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
            }`}
          >
            {user.avatarUrl ? (
              <div className={`h-6 w-6 rounded-full overflow-hidden ring-2 ${accountActive ? "ring-[var(--action)]" : "ring-transparent"}`}>
                <Image src={user.avatarUrl} alt={`${user.displayName || "Your"} avatar`} width={24} height={24} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className={`h-6 w-6 rounded-full bg-[var(--surface-card)] flex items-center justify-center ring-2 ${accountActive ? "ring-[var(--action)]" : "ring-transparent"}`}>
                <span className="text-[10px] font-bold text-[var(--text-body)]">{avatarInitial}</span>
              </div>
            )}
            <span>Me</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
