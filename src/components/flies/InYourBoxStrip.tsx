"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit3, Loader2, Check, ListChecks } from "lucide-react";
import PersonalizeSheet, { type Personalizations, type PersonalizeSheetCanonicalFly } from "./PersonalizeSheet";

/**
 * The In Your Box strip — replaces the older "Add to Fly Box" button on the
 * canonical fly page. Three states:
 *
 * 1. Anonymous: prompt sign-in
 * 2. Signed in, not in box: "Add to Fly Box" → opens PersonalizeSheet
 * 3. Signed in, in box: shows the personalization summary + "Edit" button
 *    that re-opens the sheet
 */

interface Props {
  fly: PersonalizeSheetCanonicalFly;
}

interface BoxRow {
  id: string;
  personalizations: Personalizations | null;
  preferred_sizes: string[] | null;
  is_favorite: boolean;
  is_tie_next: boolean;
}

export default function InYourBoxStrip({ fly }: Props) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [row, setRow] = useState<BoxRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthed(false);
      setRow(null);
      setLoading(false);
      return;
    }
    setAuthed(true);
    const { data } = await supabase
      .from("user_fly_box")
      .select("id, personalizations, preferred_sizes, is_favorite, is_tie_next")
      .eq("user_id", user.id)
      .eq("canonical_fly_id", fly.id)
      .maybeSingle();
    setRow((data as BoxRow | null) ?? null);
    setLoading(false);
  }, [fly.id]);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex items-center gap-2 text-sm text-[#6E7681]">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your fly box…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-[#A8B2BD]">Save flies, queue what to tie, log catches against this pattern.</p>
        <a
          href={`/login?redirect=/flies`}
          className="px-4 py-1.5 rounded-lg bg-[#E8923A] text-white text-sm font-semibold hover:bg-[#F0A65A] transition-colors"
        >
          Sign in
        </a>
      </div>
    );
  }

  if (!row) {
    return (
      <>
        <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-[#A8B2BD]">Save this fly with your specs — hook, bead, thread, the sizes you tie.</p>
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E8923A] text-white text-sm font-semibold hover:bg-[#F0A65A] transition-colors"
          >
            <Plus className="h-4 w-4" /> Add to Fly Box
          </button>
        </div>
        <PersonalizeSheet
          open={sheetOpen}
          fly={fly}
          isInBox={false}
          onClose={() => setSheetOpen(false)}
          onSaved={refresh}
        />
      </>
    );
  }

  const summary = formatPersonalizations(row.personalizations, row.preferred_sizes);

  return (
    <>
      <div className="rounded-xl border border-[#E8923A]/30 bg-[#E8923A]/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E8923A]">
                <Check className="h-3 w-3" /> In your fly box
              </span>
              {row.is_tie_next && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0BA5C7]">
                  <ListChecks className="h-3 w-3" /> Queued to tie
                </span>
              )}
            </div>
            <p className="text-sm text-[#F0F6FC] truncate" title={summary || undefined}>
              {summary || "No specs saved yet — tap Edit to record your hook, bead, thread."}
            </p>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8923A]/40 bg-[#E8923A]/10 text-[#E8923A] text-xs font-semibold hover:bg-[#E8923A]/20 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
        </div>
      </div>
      <PersonalizeSheet
        open={sheetOpen}
        fly={fly}
        isInBox={true}
        initialPersonalizations={row.personalizations ?? {}}
        initialPreferredSizes={row.preferred_sizes ?? []}
        onClose={() => setSheetOpen(false)}
        onSaved={refresh}
      />
    </>
  );
}

function formatPersonalizations(p: Personalizations | null, sizes: string[] | null): string {
  const parts: string[] = [];
  if (sizes && sizes.length > 0) parts.push(sizes.join(", "));
  if (!p) return parts.join(" · ");

  // Cherry-pick the most useful slots in display order.
  const order = ["hook", "bead", "thread", "body", "tail", "wing", "hackle"];
  for (const slot of order) {
    const v = p[slot];
    if (!v) continue;
    const bits = [v.style, v.size, v.color, v.brand, v.denier, v.model].filter(Boolean);
    if (bits.length === 0) continue;
    parts.push(`${slot} ${bits.join(" ")}`);
  }
  return parts.join(" · ");
}
