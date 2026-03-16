"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Fish, MapPin, Feather, Trophy, LogOut, Save, Heart, Camera, Package, X } from "lucide-react";
import { formatDate } from "@/lib/date";
import Image from "next/image";
import AvatarCropModal from "@/components/AvatarCropModal";

interface Props {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    username?: string;
    bio?: string;
    homeLocation?: string;
    isPrivate?: boolean;
  };
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
  welcome?: boolean;
}

export default function AccountClient({ user, feedDisplay: initialFeedDisplay, stats, welcome }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [homeLocation, setHomeLocation] = useState(user.homeLocation || "");
  const [isPrivate, setIsPrivate] = useState(user.isPrivate ?? false);
  const [feedDisplay, setFeedDisplay] = useState<"collage" | "map">(initialFeedDisplay);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [showWelcome, setShowWelcome] = useState(welcome ?? false);

  // Username availability state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(
    async (val: string) => {
      const clean = val.trim().toLowerCase();
      if (!clean || clean.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      if (clean === (user.username || "").toLowerCase()) {
        setUsernameAvailable(true);
        return;
      }
      setUsernameChecking(true);
      try {
        const res = await fetch(
          `/api/user/username/check?username=${encodeURIComponent(clean)}&current=${encodeURIComponent((user.username || "").toLowerCase())}`
        );
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    },
    [user.username]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!username) {
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      checkUsername(username);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, checkUsername]);

  // Step 1: file selected → show crop modal
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Step 2: crop confirmed → upload blob
  async function handleCropSave(blob: Blob) {
    setCropSrc(null);
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", blob, "avatar.jpg");
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload avatar");
        return;
      }
      if (data.url) setAvatarUrl(data.url + `?t=${Date.now()}`);
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  }

  const saveDisabled =
    saving ||
    (username.length >= 3 && usernameAvailable === false) ||
    usernameChecking;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (saveDisabled) return;
    setSaving(true);
    const supabase = createClient();

    const cleanUsername = username.trim().toLowerCase() || null;

    await supabase.auth.updateUser({ data: { display_name: displayName } });

    await supabase.from("angler_profiles").upsert(
      {
        user_id: user.id,
        display_name: displayName,
        username: cleanUsername,
        bio: bio || null,
        home_location: homeLocation || null,
        is_private: isPrivate,
        feed_display: feedDisplay,
      },
      { onConflict: "user_id" }
    );

    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        username: cleanUsername,
        display_name: displayName,
        bio: bio || null,
        is_private: isPrivate,
      },
      { onConflict: "user_id" }
    );

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

  const inputCls = "w-full rounded-lg border border-[#21262D] bg-[#161B22] px-4 py-3 text-[#F0F6FC] focus:border-[#E8923A] focus:outline-none focus:ring-1 focus:ring-[#E8923A]";
  const labelCls = "block text-sm font-medium text-[#8B949E] mb-1";

  const statCards = [
    { icon: BookOpen, label: "Sessions", value: stats.totalSessions, color: "text-[#E8923A]" },
    { icon: Fish, label: "Fish Caught", value: stats.totalFish, color: "text-blue-600" },
    { icon: MapPin, label: "Rivers Fished", value: stats.totalRivers, color: "text-amber-600" },
    { icon: Feather, label: "Fly Patterns", value: stats.totalFlies, color: "text-purple-600" },
    { icon: Heart, label: "Favorites", value: stats.totalFavorites, color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Avatar crop modal */}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onSave={handleCropSave}
          onCancel={() => { setCropSrc(null); }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Welcome banner */}
        {showWelcome && (
          <div className="bg-[#E8923A] text-[#0D1117] rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="font-medium">Welcome to Executive Angler! Complete your profile below.</p>
            <button onClick={() => setShowWelcome(false)} className="text-[#0D1117] hover:text-[#161B22] transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-shrink-0">
            <label className="cursor-pointer group">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-[#E8923A]/10 border-2 border-white shadow-md flex items-center justify-center">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl font-bold text-[#E8923A]">{(displayName || user.email)[0].toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading ? (
                  <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-[#E8923A] text-2xl font-bold truncate">{displayName || "Angler"}</h1>
            {username && (
              <p className="text-sm text-[#8B949E] truncate">@{username}</p>
            )}
            <p className="text-sm text-[#484F58] truncate">{user.email}</p>
          </div>
          <button onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-sm text-[#484F58] hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#161B22] rounded-xl p-4 shadow-sm text-center">
              <Icon className={`h-6 w-6 mx-auto mb-1 ${color}`} />
              <p className="text-2xl font-bold text-[#F0F6FC]">{value}</p>
              <p className="text-xs text-[#8B949E]">{label}</p>
            </div>
          ))}
        </div>

        {/* Personal Bests */}
        {(stats.biggestFish || stats.bestSession) && (
          <div className="bg-[#161B22] rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-heading text-lg font-semibold text-[#E8923A] flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" /> Personal Bests
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {stats.biggestFish && (
                <div className="rounded-lg bg-[#0D1117] p-4">
                  <p className="text-xs text-[#8B949E] mb-1">Biggest Fish</p>
                  <p className="text-2xl font-bold text-[#E8923A]">{stats.biggestFish?.toFixed(1)}&quot;</p>
                </div>
              )}
              {stats.bestSession && (
                <div className="rounded-lg bg-[#0D1117] p-4">
                  <p className="text-xs text-[#8B949E] mb-1">Best Day</p>
                  <p className="text-lg font-bold text-[#E8923A]">{stats.bestSession.total_fish} fish</p>
                  <p className="text-sm text-[#8B949E]">
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
            className="flex items-center gap-3 bg-[#161B22] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <BookOpen className="h-5 w-5 text-[#E8923A]" />
            <div>
              <p className="font-medium text-[#F0F6FC] text-sm">Fishing Journal</p>
              <p className="text-xs text-[#8B949E]">{stats.totalSessions} sessions</p>
            </div>
          </Link>
          <Link href="/journal/flies"
            className="flex items-center gap-3 bg-[#161B22] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xl leading-none">🪰</span>
            <div>
              <p className="font-medium text-[#F0F6FC] text-sm">Fly Patterns</p>
              <p className="text-xs text-[#8B949E]">{stats.totalFlies} patterns</p>
            </div>
          </Link>
          <Link href="/favorites"
            className="flex items-center gap-3 bg-[#161B22] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-[#F0F6FC] text-sm">Favorites</p>
              <p className="text-xs text-[#8B949E]">{stats.totalFavorites} saved</p>
            </div>
          </Link>
          <Link href="/account/gear"
            className="flex items-center gap-3 bg-[#161B22] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
            <Package className="h-5 w-5 text-[#00B4D8]" />
            <div>
              <p className="font-medium text-[#F0F6FC] text-sm">Gear Locker</p>
              <p className="text-xs text-[#8B949E]">Rods, reels &amp; more</p>
            </div>
          </Link>
        </div>

        {/* Profile settings */}
        <div className="bg-[#161B22] rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={labelCls}>Display Name</label>
              <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>

            {/* Username (optional) */}
            <div>
              <label className={labelCls}>Username (optional)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#8B949E] pointer-events-none select-none">@</span>
                <input
                  className={inputCls + " pl-8 pr-10"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                  placeholder="yourhandle"
                  maxLength={30}
                />
                {username.length >= 3 && (
                  <span className="absolute right-3 text-sm pointer-events-none">
                    {usernameChecking ? (
                      <span className="text-[#8B949E]">…</span>
                    ) : usernameAvailable === true ? (
                      <span className="text-green-500">✓</span>
                    ) : usernameAvailable === false ? (
                      <span className="text-red-500">✗</span>
                    ) : null}
                  </span>
                )}
              </div>
              {username.length >= 3 && usernameAvailable === false && (
                <p className="text-xs text-red-500 mt-1">That username is taken.</p>
              )}
              <p className="text-xs text-[#484F58] mt-1">Set a custom handle, e.g. @taylorutah. Leave blank to use your name.</p>
            </div>

            {/* Bio */}
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                className={inputCls + " resize-none"}
                rows={3}
                maxLength={160}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other anglers about yourself…"
              />
              <p className="text-xs text-[#484F58] mt-1 text-right">{bio.length}/160</p>
            </div>

            {/* Home Location */}
            <div>
              <label className={labelCls}>Home Location</label>
              <input
                className={inputCls}
                value={homeLocation}
                onChange={(e) => setHomeLocation(e.target.value)}
                placeholder="e.g. Salt Lake City, UT"
              />
            </div>

            {/* Profile Visibility */}
            <div>
              <label className={labelCls}>Profile Visibility</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${!isPrivate ? "border-[#E8923A] bg-[#E8923A] text-white" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]"}`}
                >
                  🌐 Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${isPrivate ? "border-[#E8923A] bg-[#E8923A] text-white" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]"}`}
                >
                  🔒 Private
                </button>
              </div>
              <p className="text-xs text-[#484F58] mt-1">Public profiles appear on the Anglers page.</p>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls + " opacity-60"} value={email} disabled />
              <p className="text-xs text-[#484F58] mt-1">Contact support to change your email.</p>
            </div>

            <div>
              <label className={labelCls}>Journal Feed Display</label>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setFeedDisplay("collage")}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "collage" ? "border-[#E8923A] bg-[#E8923A] text-white" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]"}`}>
                  🐟 Fish + Flies Collage
                </button>
                <button type="button" onClick={() => setFeedDisplay("map")}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${feedDisplay === "map" ? "border-[#E8923A] bg-[#E8923A] text-white" : "border-[#21262D] text-[#8B949E] hover:border-[#E8923A]"}`}>
                  📍 Map Location
                </button>
              </div>
              <p className="text-xs text-[#484F58] mt-1">Controls what shows in your journal feed cards.</p>
            </div>

            <button type="submit" disabled={saveDisabled}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E8923A] px-5 py-2.5 text-white text-sm font-medium hover:bg-[#0D1117] disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-[#161B22] rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-heading text-lg font-semibold text-[#E8923A] mb-4">Change Password</h2>
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
              className="inline-flex items-center gap-2 rounded-lg bg-[#1F2937] px-5 py-2.5 text-white text-sm font-medium hover:bg-[#161B22]">
              {pwSaved ? "Password Updated ✓" : "Update Password"}
            </button>
          </form>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-800 text-red-400 px-5 py-3 text-sm font-medium hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
