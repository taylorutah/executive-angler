"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Mountain, Bug, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type TabUser = {
  avatarUrl?: string;
  displayName?: string;
  email?: string;
} | null;

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home, match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/") },
  { href: "/journal", label: "Journal", icon: BookOpen, match: (p: string) => p === "/journal" || p.startsWith("/journal/") },
  { href: "/rivers", label: "Rivers", icon: Mountain, match: (p: string) => p === "/rivers" || p.startsWith("/rivers/") },
  { href: "/flies", label: "Flies", icon: Bug, match: (p: string) => p === "/flies" || p.startsWith("/flies/") },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<TabUser>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setUser(null); setReady(true); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("user_id", authUser.id)
        .maybeSingle();

      setUser({
        email: authUser.email ?? undefined,
        avatarUrl: profile?.avatar_url || undefined,
        displayName: profile?.display_name || authUser.user_metadata?.display_name || undefined,
      });
      setReady(true);
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { setUser(null); return; }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  if (!ready || !user) return null;

  // Hide on deep-create flows where bottom chrome fights a form
  if (pathname === "/journal/new" || pathname === "/journal/flies/new") return null;

  const accountActive = pathname === "/account" || pathname.startsWith("/account/");
  const avatarInitial = (user.displayName || user.email || "A")[0].toUpperCase();

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D1117]/95 backdrop-blur-md border-t border-[#21262D] pb-[env(safe-area-inset-bottom)]"
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
                  active ? "text-[#E8923A]" : "text-[#A8B2BD] hover:text-[#F0F6FC]"
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
              accountActive ? "text-[#E8923A]" : "text-[#A8B2BD] hover:text-[#F0F6FC]"
            }`}
          >
            {user.avatarUrl ? (
              <div className={`h-6 w-6 rounded-full overflow-hidden ring-2 ${accountActive ? "ring-[#E8923A]" : "ring-transparent"}`}>
                <Image src={user.avatarUrl} alt={`${user.displayName || "Your"} avatar`} width={24} height={24} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className={`h-6 w-6 rounded-full bg-[#1F2937] flex items-center justify-center ring-2 ${accountActive ? "ring-[#E8923A]" : "ring-transparent"}`}>
                <span className="text-[10px] font-bold text-[#A8B2BD]">{avatarInitial}</span>
              </div>
            )}
            <span>Me</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
