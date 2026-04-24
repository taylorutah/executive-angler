"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AddToGearButtonProps {
  productId: string;
  productName: string;
  brandName: string;
  category: "rod" | "reel" | "waders";
}

export default function AddToGearButton({
  productId,
}: AddToGearButtonProps) {
  const [inLocker, setInLocker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkInLocker();
  }, [productId]);

  async function checkInLocker() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReady(true);
      return;
    }

    const { data } = await supabase
      .from("gear_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("gear_product_id", productId)
      .maybeSingle();

    setInLocker(!!data);
    setReady(true);
  }

  async function toggle() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setLoading(true);

    const method = inLocker ? "DELETE" : "POST";
    const response = await fetch("/api/gear/add-to-locker", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });

    if (response.ok) {
      setInLocker(!inLocker);
    }

    setLoading(false);
  }

  if (!ready) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161B22] text-[#6E7681] text-sm font-semibold"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
        inLocker
          ? "bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/40 hover:bg-[#E8923A]/20"
          : "bg-[#E8923A] text-[#0D1117] hover:bg-[#E8923A]/90"
      }`}
      aria-label={inLocker ? "Remove from my gear" : "Add to my gear"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : inLocker ? (
        <Check className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {inLocker ? "In Your Gear" : "Add to My Gear"}
    </button>
  );
}
