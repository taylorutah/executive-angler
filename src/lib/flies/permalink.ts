/**
 * flyPermalink — single source of truth for fly URLs across the app.
 *
 * Every fly has one canonical public URL at /flies/[slug].
 * /anglers/[username]/flies/[slug] remains as a bookmark redirect only
 * (see src/app/anglers/[username]/flies/[slug]/page.tsx) and must not be
 * minted as a permalink.
 *
 * Fallbacks:
 *   - promoted_to_canonical_id without joined slug → /flies/by-id/[id]
 *   - owner viewing a personal row without slug → /journal/flies/[id]/edit
 *   - last resort → /flies/by-id/[id] or /flies
 */
export type FlyPermalinkRow = {
  /** Row id — required to fall back to the by-id resolver. */
  id?: string;
  /** Canonical or personal slug. */
  slug?: string | null;
  /** True for `canonical_flies` rows or `fly_patterns_v2` with owner_user_id null. */
  isCanonical?: boolean;
  /** Set on legacy `fly_patterns` rows when promoted to a canonical. */
  promoted_to_canonical_id?: string | null;
  /** Joined slug of the promoted canonical (avoids a redirect). */
  promotedCanonicalSlug?: string | null;
  /** Owner of the row (null for canonical, uuid for personal). */
  ownerUserId?: string | null;
  /** Retained for callers; unused — personal flies no longer have public profile URLs. */
  ownerUsername?: string | null;
  /** True when the current viewer authored this row. */
  viewerIsOwner?: boolean;
};

export function flyPermalink(row: FlyPermalinkRow): string {
  // 1. Legacy pattern was promoted to canonical and we have the slug joined.
  if (row.promotedCanonicalSlug) {
    return `/flies/${row.promotedCanonicalSlug}`;
  }
  // 2. Legacy pattern was promoted but slug wasn't joined — fall back to the
  //    resolver which will follow the lineage and 302 to the canonical.
  if (row.promoted_to_canonical_id && row.id) {
    return `/flies/by-id/${row.id}`;
  }
  // 3. Any row with a slug — canonical library URL.
  if (row.slug) {
    return `/flies/${row.slug}`;
  }
  // 4. Owner viewing their own personal pattern but slug missing —
  //    fall back to the edit form so they can still reach it.
  if (row.viewerIsOwner && row.id) {
    return `/journal/flies/${row.id}/edit`;
  }
  // 5. Last resort: the by-id resolver.
  if (row.id) {
    return `/flies/by-id/${row.id}`;
  }
  return "/flies";
}

/**
 * Convenience for the common case: a legacy `fly_patterns` row owned by the
 * current viewer. Most My Flies / Tie Next / dashboard surfaces use this.
 *
 * Pass `slug` whenever available so the link routes to /flies/[slug];
 * without it the helper falls back to the edit form.
 */
export function ownerPatternPermalink(pattern: {
  id: string;
  slug?: string | null;
  ownerUsername?: string | null;
  promoted_to_canonical_id?: string | null;
  promotedCanonicalSlug?: string | null;
}): string {
  return flyPermalink({
    id: pattern.id,
    slug: pattern.slug ?? null,
    ownerUsername: pattern.ownerUsername ?? null,
    promoted_to_canonical_id: pattern.promoted_to_canonical_id ?? null,
    promotedCanonicalSlug: pattern.promotedCanonicalSlug ?? null,
    viewerIsOwner: true,
  });
}
