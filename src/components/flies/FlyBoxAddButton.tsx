"use client";

/**
 * FlyBoxAddButton — universal "+ Add to Fly Box" trigger.
 *
 * One component, four visual variants, used on every surface where a fly
 * appears (catalog cards, hatch tables, search results, river fly mentions,
 * etc.). Clicking opens <QuickAddToBoxSheet>, which handles size / bead /
 * color / box selection in one screen.
 *
 * Variants:
 *   icon     — 28x28 round, for tight rows (hatch chart, chips, lists)
 *   pill     — compact pill, default for catalog cards
 *   full     — large block button, for detail pages or empty states
 *   menu     — menu-item style, for use inside dropdowns or kebabs
 *
 * Status states:
 *   - Anonymous → opens sheet anyway; sheet shows sign-in prompt
 *   - Loading auth → spinner
 *   - Has variants of this fly → "In Box · N" with subtle accent (still
 *     clickable to add another variant)
 *   - Default → "Add"
 */

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import QuickAddToBoxSheet, { type QuickAddFly } from "./QuickAddToBoxSheet";
import AddToBoxToast, { type ToastInfo } from "./AddToBoxToast";
import { Button } from "@/components/ui/Button";

type Variant = "icon" | "pill" | "full" | "menu";

interface Props {
  fly: QuickAddFly;
  variant?: Variant;
  /**
   * Stop click events from bubbling — useful when the trigger lives inside
   * a card whose root is a <Link>.
   */
  stopPropagation?: boolean;
  className?: string;
}

export default function FlyBoxAddButton({
  fly,
  variant = "pill",
  stopPropagation = false,
  className,
}: Props) {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [variantCount, setVariantCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Lightweight existing-variant count. Pure read for UI state; the sheet
  // does its own load on open.
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setVariantCount(0);
      setChecking(false);
      return;
    }
    let cancelled = false;
    async function check() {
      try {
        const supabase = createClient();
        const col = fly.kind === "personal" ? "fly_pattern_id" : "canonical_fly_id";
        const { count } = await supabase
          .from("fly_box_entries_v3")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq(col, fly.id);
        if (!cancelled) setVariantCount(count ?? 0);
      } catch (e) {
        console.warn("[FlyBoxAddButton] count check failed:", e);
        if (!cancelled) setVariantCount(0);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user, fly.id, fly.kind]);

  function handleClick(e: React.MouseEvent) {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    setOpen(true);
  }

  // Render based on variant
  const inBox = (variantCount ?? 0) > 0;

  const Trigger = () => {
    if (variant === "icon") {
      return (
        <button
          type="button"
          onClick={handleClick}
          onMouseDown={stopPropagation ? (e) => e.stopPropagation() : undefined}
          aria-label={inBox ? `In box (${variantCount}) — add another variant` : "Add to fly box"}
          title={inBox ? `In your box · ${variantCount}` : "Add to fly box"}
          className={`inline-flex items-center justify-center h-7 w-7 rounded-full transition-colors ${
            inBox
              ? "bg-[#E8923A]/15 text-[#E8923A] border border-[#E8923A]/30 hover:bg-[#E8923A]/25"
              : "bg-[#161B22]/90 text-[#A8B2BD] border border-[#21262D] hover:text-[#E8923A] hover:border-[#E8923A]/50 backdrop-blur-sm"
          } ${className ?? ""}`}
        >
          {checking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : inBox ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      );
    }

    if (variant === "menu") {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full text-left px-3 py-2 text-sm text-[#F0F6FC] hover:bg-[#21262D] flex items-center gap-2 transition-colors ${className ?? ""}`}
        >
          <Plus className="h-4 w-4 text-[#E8923A]" />
          {inBox ? `Add another variant (${variantCount} in box)` : "Add to fly box"}
        </button>
      );
    }

    if (variant === "full") {
      return (
        <Button
          onClick={handleClick}
          onMouseDown={stopPropagation ? (e) => e.stopPropagation() : undefined}
          loading={checking}
          variant={inBox ? "outline" : "solid"}
          size="md"
          icon={!checking ? (inBox ? Check : Plus) : undefined}
          fullWidth
         
          className={className}
        >
          {inBox ? `In Your Box · ${variantCount} · Add another` : "Add to Fly Box"}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleClick}
        onMouseDown={stopPropagation ? (e) => e.stopPropagation() : undefined}
        loading={checking}
        variant="pill"
        size="sm"
        icon={!checking ? (inBox ? Check : Plus) : undefined}
       
        className={className}
        title={inBox ? `In your box (${variantCount}) — add another variant` : "Add to fly box"}
      >
        {inBox ? `In box · ${variantCount}` : "Add"}
      </Button>
    );
  };

  return (
    <>
      <Trigger />
      <QuickAddToBoxSheet
        open={open}
        fly={fly}
        onClose={() => setOpen(false)}
        onSaved={(result) => {
          setVariantCount((prev) => (prev ?? 0) + 1);
          setToast({
            flyName: fly.name,
            variantLabel: result.variantLabel,
            boxNames: result.boxNames,
            firstBoxId: result.boxIds[0],
          });
        }}
      />
      <AddToBoxToast info={toast} onDone={() => setToast(null)} />
    </>
  );
}
