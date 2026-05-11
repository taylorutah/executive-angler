/**
 * flyPermalink — single source of truth for fly URLs across the app.
 *
 * The fly identity model has three layers (see project_fly_identity_model.md):
 *   - canonical (`fly_patterns_v2` with owner null, mirrored to `canonical_flies`)
 *       → /flies/[slug]
 *   - personal pattern (`fly_patterns_v2` with owner set, or legacy `fly_patterns`)
 *       → /anglers/[username]/flies/[slug]   (public view)
 *       → /journal/flies/[id]/edit            (owner's edit view)
 *   - legacy personal that has been PROMOTED to canonical
 *       → /flies/[promoted-canonical-slug]
 *
 * Callers pass whichever fields they have. The helper degrades gracefully and
 * falls back to the by-id resolver only when nothing better is known — the
 * resolver route exists for deep links from email, iOS, and pre-migration
 * shares, NOT as the everyday link shape inside the app.
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
  /** Public username of the owner — needed for /anglers/<u>/flies/<slug>. */
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
  // 3. Canonical row with a slug.
  if (row.isCanonical && row.slug) {
    return `/flies/${row.slug}`;
  }
  // 4. Owner viewing their own personal pattern → edit page.
  if (row.viewerIsOwner && row.id) {
    return `/journal/flies/${row.id}/edit`;
  }
  // 5. Someone else's personal pattern (public/shared) — needs username.
  if (row.ownerUsername && row.slug) {
    return `/anglers/${row.ownerUsername}/flies/${row.slug}`;
  }
  // 6. Last resort: the by-id resolver.
  if (row.id) {
    return `/flies/by-id/${row.id}`;
  }
  return "/flies";
}

/**
 * Convenience for the common case: a legacy `fly_patterns` row owned by the
 * current viewer. Most My Flies / Tie Next / dashboard surfaces use this.
 */
export function ownerPatternPermalink(pattern: {
  id: string;
  promoted_to_canonical_id?: string | null;
  promotedCanonicalSlug?: string | null;
}): string {
  return flyPermalink({
    id: pattern.id,
    promoted_to_canonical_id: pattern.promoted_to_canonical_id ?? null,
    promotedCanonicalSlug: pattern.promotedCanonicalSlug ?? null,
    viewerIsOwner: true,
  });
}
