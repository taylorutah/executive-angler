"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Check, Loader2 } from "lucide-react";

interface AddToFlyBoxButtonProps {
  canonicalFlyId: string;
  flyName: string;
  compact?: boolean;
}

export default function AddToFlyBoxButton({
  canonicalFlyId,
  flyName,
  compact = false,
}: AddToFlyBoxButtonProps) {
  const [isInBox, setIsInBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) setChecking(false);
          return;
        }
        if (!cancelled) setIsAuthenticated(true);

        // After the multi-variant migration there can be 2+ rows per
        // (user_id, canonical_fly_id), so `.maybeSingle()` would throw and
        // leave the spinner spinning forever. Use `.limit(1)` instead and
        // treat any row as "in box".
        const { data } = await supabase
          .from("user_fly_box")
          .select("id")
          .eq("user_id", user.id)
          .eq("canonical_fly_id", canonicalFlyId)
          .limit(1);

        if (!cancelled) {
          setIsInBox((data?.length ?? 0) > 0);
        }
      } catch (e) {
        // Network or schema error — don't leave the spinner hanging.
        console.warn("[AddToFlyBoxButton] status check failed:", e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [canonicalFlyId]);

  async function handleAdd() {
    if (!isAuthenticated) {
      window.location.href = "/login?redirect=/flies";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/fly-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canonical_fly_id: canonicalFlyId }),
      });

      if (res.status === 403) {
        setError("Upgrade to Pro for unlimited flies");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add");
        return;
      }

      setIsInBox(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#21262D] bg-[#161B22] text-[#6E7681] ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm font-medium w-full"}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {!compact && "Checking..."}
      </button>
    );
  }

  if (isInBox) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8923A]/30 bg-[#E8923A]/10 text-[#E8923A] ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm font-medium w-full"}`}
      >
        <Check className="h-4 w-4" />
        {compact ? "In Box" : "In Your Fly Box"}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8923A] text-[#E8923A] hover:bg-[#E8923A] hover:text-white transition-colors ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm font-medium w-full"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {compact ? "Add" : "Add to Fly Box"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
