"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GearForm, { type PresetProduct } from "@/components/gear/GearForm";
import type { GearType } from "@/types/gear";
import type { GearProductCategory } from "@/types/gear-catalog";

interface AddToGearButtonProps {
  productId: string;
  productName: string;
  brandName: string;
  category: GearProductCategory;
}

/**
 * Map catalog categories (9 total) onto the user-locker GearType enum (8
 * total). Categories that don't have a direct user-locker equivalent
 * (wading-boots, pack) collapse to "other".
 */
function catalogToGearType(category: GearProductCategory): GearType {
  switch (category) {
    case "rod":
    case "reel":
    case "line":
    case "leader":
    case "tippet":
    case "net":
    case "waders":
      return category;
    case "wading-boots":
    case "pack":
    default:
      return "other";
  }
}

function stripBrandPrefix(productName: string, brandName: string): string {
  const lowered = productName.toLowerCase();
  const brandLower = brandName.toLowerCase();
  if (lowered.startsWith(brandLower + " ")) {
    return productName.slice(brandName.length).trim();
  }
  return productName;
}

export default function AddToGearButton({
  productId,
  productName,
  brandName,
  category,
}: AddToGearButtonProps) {
  const [inLocker, setInLocker] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [ready, setReady] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isFirstOfType, setIsFirstOfType] = useState(false);
  const router = useRouter();

  const checkInLocker = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReady(true);
      return;
    }

    const [ownedRes, typeRes] = await Promise.all([
      supabase
        .from("gear_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("gear_product_id", productId)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("gear_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", category)
        .eq("is_active", true),
    ]);

    setInLocker(!!ownedRes.data);
    setIsFirstOfType((typeRes.count ?? 0) === 0);
    setReady(true);
  }, [productId, category]);

  useEffect(() => {
    checkInLocker();
  }, [checkInLocker]);

  async function handleClick() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    if (inLocker) {
      setRemoving(true);
      const response = await fetch("/api/gear/add-to-locker", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (response.ok) setInLocker(false);
      setRemoving(false);
      return;
    }

    setFormOpen(true);
  }

  const presetProduct: PresetProduct = {
    productId,
    category: catalogToGearType(category),
    brandName,
    modelName: stripBrandPrefix(productName, brandName),
    defaultName: productName,
  };

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
    <>
      <button
        onClick={handleClick}
        disabled={removing}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
          inLocker
            ? "bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/40 hover:bg-[#E8923A]/20"
            : "bg-[#E8923A] text-[#0D1117] hover:bg-[#E8923A]/90"
        }`}
        aria-label={inLocker ? "Remove from my gear" : "Add to my gear"}
      >
        {removing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : inLocker ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {inLocker ? "In Your Gear" : "Add to My Gear"}
      </button>

      <GearForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setInLocker(true);
          setFormOpen(false);
        }}
        initialType={category as GearType}
        presetProduct={presetProduct}
        isFirstOfType={isFirstOfType}
      />
    </>
  );
}
