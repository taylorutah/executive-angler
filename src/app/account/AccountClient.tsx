"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Fish, MapPin, Feather, Trophy, LogOut, Save, Heart, Camera } from "lucide-react";
import { formatDate } from "@/lib/date";
import Image from "next/image";

interface Props {
  user: { id: string; email: string; displayName: string; avatarUrl?: string };
  feedDisplay: "collage" | "map";
  stats: {
    totalSessions: number;
    totalFish: number;
    totalRivers: number;
    totalFlies: number;
    totalFavorites: number;
    biggestFish: number | null;
    bestSession: { river_name: string; date: string; total_fish: number; location?: string } | null;
  };
}

export default function AccountClient({ user, feedDisplay: initialFeedDisplay, stats }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [feedDisplay, setFeedDisplay] = useState<"collage" | "map">(initialFeedDisplay);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [email] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setAvatarUrl(data.url);
    setAvatarUploading(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { display_name: displayName } });
    await supabase.from("angler_profiles").upsert({ user_id: user.id, feed_display: feedDisplay }, { onConflict: "user_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match"); return; }
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPwError(error.message); return; }
    setNewPassword(""); setConfirmPassword("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  const statCards = [
    { icon: BookOpen, label: "Sessions", value: stats.totalSessions, color: "text-forest" },
    { icon: Fish, label: "Fish Caught", value: stats.totalFish, color: "text-blue-600" },
    { icon: MapPin, label: "Rivers Fished", value: stats.totalRivers, color: "text-amber-600" },
    { icon: Feather, label: "Fly Patterns", value: stats.totalFlies, color: "text-purple-600" },
    { icon: Heart, label: "Favorites", value: stats.totalFavorites, color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-shrink-0">
            <label className="cursor-pointer group">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-forest/10 border-2 border-white shadow-md flex items-center justify-center">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl font-bold text-forest">{(displayName || user.email)[0].toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading ? (
                  <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-forest-dark text-2xl font-bold truncate">{displayName || "Angler"}</h1>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <button onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <Icon className={`h-6 w-6 mx-auto mb-1 ${color}`} />
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Personal Bests */}
        {(stats.biggestFish || stats.bestSession) && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-heading text-lg font-semibold text-forest-dark flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" /> Personal Bests
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {stats.biggestFish && (
                <div className="rounded-lg bg-cream p-4">
                  <p className="text-xs text-slate-500 mb-1">Biggest Fish</p>
                  <p className="text-2xl font-bold text-forest-dark">{stats.biggestFish}&quot;</p>
                </div>
              )}
              {stats.bestSession && (
                <div className="rounded-lg bg-cream p-4">
                  <p className="text-xs text-slate-500 mb-1">Best Day</p>
                  <p className="text-lg font-bold text-forest-dark">{stats.bestSession.total_fish} fish</p>
                  <p className="text-sm text-slate-600">
                    {stats.bestSession.river_name} · {formatDate(stats.bestSession.date, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Link href="/journal"
            className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <BookOpen className="h-5 w-5 text-forest" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Fishing Journal</p>
              <p className="text-xs text-slate-500">{stats.totalSessions} sessions</p>
            </div>
          </Link>
          <Link href="/journal/flies"
            className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xl leading-none">🪰</span>
            <div>
              <p className="font-medium text-slate-900 text-sm">Fly Patterns</p>
              <p className="text-xs text-slate-500">{stats.totalFlies} patterns</p>
            </div>
          </Link>
          <Link href="/favorites"
            className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Favorites</p>
              <p className="text-xs text-slate-500">{stats.totalFavorites} saved</p>
            </div>
          </Link>
        </div>

        {/* Profile settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-heading text-lg font-semibold text-forest-dark mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={labelCls}>Display Name</label>
              <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls + " opacity-60"} value={email} disabled />
              <p className="text-xs text-slate-400 mt-1">Contact support to change your email.</p>
            </div>
            <div>
              <label className={labelCls}>Journal Feed Display</label>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setFeedDisplay("collage")}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "collage" ? "border-forest bg-forest text-white" : "border-slate-200 text-slate-600 hover:border-forest"}`}>
                  🐟 Fish + Flies Collage
                </button>
                <button type="button" onClick={() => setFeedDisplay("map")}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "map" ? "border-forest bg-forest text-white" : "border-slate-200 text-slate-600 hover:border-forest"}`}>
                  📍 Map Location
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Controls what shows in your journal feed cards.</p>
            </div>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-white text-sm font-medium hover:bg-forest-dark disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-forest-dark mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelCls}>New Password</label>
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div>
              <label className={labelCls}>Confirm Password</label>
              <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
            <button type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 text-white text-sm font-medium hover:bg-slate-900">
              {pwSaved ? "Password Updated ✓" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
