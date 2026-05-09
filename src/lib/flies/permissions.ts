/**
 * Permission helpers for fly_patterns_v2 editing.
 *
 * One source of truth used by both UI gates (hide the Edit button) and
 * server actions (return 403 on attempted mutation). Mirrors the RLS
 * policies in 20260509_pattern_edit_rls.sql.
 *
 * Rules:
 *   - Canonical pattern (owner_user_id IS NULL) → admin only
 *   - Personal pattern (owner_user_id = auth.uid()) → owner or admin
 *   - Anyone else → no
 */
import { isAdmin } from "@/lib/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface EditableUser {
  id: string;
  email?: string | null;
}

export interface EditablePattern {
  owner_user_id: string | null;
}

/** Synchronous check usable in client components and server-rendered gates. */
export function canEditPattern(
  pattern: EditablePattern | null | undefined,
  user: EditableUser | null | undefined,
): boolean {
  if (!pattern || !user) return false;
  if (pattern.owner_user_id === null) return isAdmin(user.email ?? null);
  return pattern.owner_user_id === user.id || isAdmin(user.email ?? null);
}

/**
 * Server-side guard: load the pattern, check the current user's permission,
 * and return a discriminated result. Use this at the top of every server
 * action that mutates fly_patterns_v2 (or its photos/redirects).
 */
export async function assertCanEditPattern(
  // Loosened type — both the cookie-aware client and the static client work
  // here, and the strict generated types differ between callers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>,
  patternId: string,
): Promise<
  | { ok: true; user: { id: string; email: string | null }; pattern: { id: string; owner_user_id: string | null; slug: string | null } }
  | { ok: false; error: string; status: 401 | 403 | 404 }
> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in.", status: 401 };

  const { data: row, error } = await supabase
    .from("fly_patterns_v2")
    .select("id, owner_user_id, slug")
    .eq("id", patternId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 404 };
  if (!row) return { ok: false, error: "Pattern not found.", status: 404 };

  const pattern = row as { id: string; owner_user_id: string | null; slug: string | null };
  if (!canEditPattern(pattern, { id: user.id, email: user.email })) {
    return { ok: false, error: "You don't have permission to edit this pattern.", status: 403 };
  }
  return {
    ok: true,
    user: { id: user.id, email: user.email ?? null },
    pattern,
  };
}
