"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Search, Users, Fish, Calendar, Feather } from "lucide-react";

interface User {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  sessions: number;
  catches: number;
  flies: number;
  lastSession: string | null;
}

type SortKey = "created" | "sessions" | "catches" | "lastActive";

export default function UsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("created");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = users;
    if (q) {
      list = list.filter(u =>
        (u.username || "").toLowerCase().includes(q) ||
        (u.displayName || "").toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "sessions": return b.sessions - a.sessions;
        case "catches": return b.catches - a.catches;
        case "lastActive": return (b.lastSession || "").localeCompare(a.lastSession || "");
        default: return (b.createdAt || "").localeCompare(a.createdAt || "");
      }
    });
    return list;
  }, [users, search, sortBy]);

  const activeUsers = users.filter(u => u.sessions > 0).length;
  const thisWeek = users.filter(u => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return d > new Date(Date.now() - 7 * 86400000);
  }).length;

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-[#8B949E] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-[#E8923A]" />
            <h1 className="font-serif text-2xl text-[#F0F6FC]">User Management</h1>
          </div>
          <span className="ml-auto text-sm text-[#8B949E] font-mono">{users.length} total</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#F0F6FC] font-mono">{users.length}</p>
            <p className="text-[10px] text-[#8B949E] uppercase tracking-wider">Total Users</p>
          </div>
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#2EA44F] font-mono">{activeUsers}</p>
            <p className="text-[10px] text-[#8B949E] uppercase tracking-wider">Active (1+ sessions)</p>
          </div>
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#E8923A] font-mono">{thisWeek}</p>
            <p className="text-[10px] text-[#8B949E] uppercase tracking-wider">New This Week</p>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484F58]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by username, display name, or user ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2.5 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]"
          >
            <option value="created">Newest First</option>
            <option value="sessions">Most Sessions</option>
            <option value="catches">Most Catches</option>
            <option value="lastActive">Last Active</option>
          </select>
        </div>

        {/* User list */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_80px_80px_80px_100px] gap-3 px-4 py-3 border-b border-[#21262D] text-[10px] text-[#8B949E] uppercase tracking-wider font-bold">
            <div className="w-10" />
            <div>User</div>
            <div className="text-center">Sessions</div>
            <div className="text-center">Catches</div>
            <div className="text-center">Flies</div>
            <div className="text-right">Last Active</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#484F58]">
              No users match your search
            </div>
          ) : (
            filtered.map(u => (
              <Link
                key={u.userId}
                href={`/admin/users/${u.userId}`}
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_80px_80px_80px_100px] gap-3 px-4 py-3 border-b border-[#21262D] last:border-0 hover:bg-[#1F2937]/50 transition-colors items-center cursor-pointer"
              >
                {/* Avatar */}
                <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-full overflow-hidden bg-[#E8923A]/15 items-center justify-center">
                  {u.avatarUrl ? (
                    <Image
                      src={u.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover w-10 h-10"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#E8923A]">
                      {(u.displayName || u.username || "?")[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Name + meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F0F6FC] truncate">
                      {u.displayName || u.username || "No name"}
                    </span>
                    {u.username && (
                      <span className="text-xs text-[#E8923A]">@{u.username}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#484F58]">
                    <span>Joined {formatDate(u.createdAt)}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline text-[#484F58] font-mono truncate">{u.userId.slice(0, 8)}...</span>
                  </div>
                </div>

                {/* Stats — mobile inline, desktop columns */}
                <div className="sm:text-center">
                  <span className="sm:hidden text-xs text-[#8B949E]">Sessions: </span>
                  <span className={`text-sm font-mono ${u.sessions > 0 ? "text-[#F0F6FC]" : "text-[#484F58]"}`}>
                    {u.sessions}
                  </span>
                </div>
                <div className="sm:text-center">
                  <span className="sm:hidden text-xs text-[#8B949E]">Catches: </span>
                  <span className={`text-sm font-mono ${u.catches > 0 ? "text-[#F0F6FC]" : "text-[#484F58]"}`}>
                    {u.catches}
                  </span>
                </div>
                <div className="sm:text-center">
                  <span className="sm:hidden text-xs text-[#8B949E]">Flies: </span>
                  <span className={`text-sm font-mono ${u.flies > 0 ? "text-[#F0F6FC]" : "text-[#484F58]"}`}>
                    {u.flies}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="sm:hidden text-xs text-[#8B949E]">Last active: </span>
                  <span className="text-xs text-[#8B949E]">
                    {u.lastSession ? formatDate(u.lastSession) : "Never"}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d.includes("T") ? d : d + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
