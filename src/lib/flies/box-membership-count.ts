/** Result of counting fly_box_entries_v3 rows for a configuration. */
export type BoxMembershipCountResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

/** Fail closed: never treat a failed count as zero memberships. */
export function resolveBoxMembershipCount(
  count: number | null | undefined,
  error: { message?: string } | null,
): BoxMembershipCountResult {
  if (error) {
    return { ok: false, error: error.message ?? "Failed to count box memberships" };
  }
  return { ok: true, count: count ?? 0 };
}
