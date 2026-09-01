import type { Article } from "@/types/entities";
import { authors, getAuthorBySlug, type Author } from "@/data/authors";

/**
 * Articles carry a plain `author` string. `src/data/authors.ts` carries the
 * curated profiles. The two were only joined on `articleAuthorName`, so a
 * byline of "Taylor Warnick" — the same person the "Executive Angler Staff"
 * row already describes — resolved to nothing and rendered as dead text.
 *
 * One slug rule fixes it: slugify the byline, then let a curated row claim
 * that slug either by its own slug or by its `articleAuthorName`. Bylines with
 * no curated row still get a working page from the name alone.
 */

export interface ResolvedAuthor {
  slug: string;
  name: string;
  /** The curated profile, when there is one. */
  profile?: Author;
  role?: string;
  shortBio?: string;
  imageUrl?: string;
}

/**
 * The house byline carries no visible attribution anywhere on the site —
 * it is assumed (client ruling 2026-08-28). Named authors keep theirs.
 * JSON-LD and metadata still resolve the author either way.
 */
export const HOUSE_BYLINE = "Executive Angler Staff";

/** Legal name of the house editor. Never render on a public page. */
const PRIVATE_PERSON_NAMES = ["Taylor Warnick"] as const;

function normalizePersonName(name: string): string {
  return name.trim().toLowerCase();
}

export function isHouseByline(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed === HOUSE_BYLINE) return true;
  return PRIVATE_PERSON_NAMES.some((n) => normalizePersonName(n) === normalizePersonName(trimmed));
}

/** True when a public string would name the house person. */
export function namesPrivatePerson(text: string | null | undefined): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PRIVATE_PERSON_NAMES.some((n) => lower.includes(n.toLowerCase()));
}

/** Photo credits that would name the house person stay off the page. */
export function publicImageCredit(credit?: string | null): string | undefined {
  if (!credit?.trim()) return undefined;
  if (isHouseByline(credit) || namesPrivatePerson(credit)) return undefined;
  return credit;
}

/**
 * Entity pages (river / lodge / destination) never print a bare name
 * under the title — that reads as a byline. Remaining photographer
 * credits keep a Photo: label.
 */
export function labeledPhotoCredit(credit?: string | null): string | undefined {
  const safe = publicImageCredit(credit);
  if (!safe) return undefined;
  if (/^photo\b/i.test(safe)) return safe;
  return `Photo: ${safe}`;
}

/**
 * True when a resolved masthead entry stands in for the house byline —
 * either it IS the bare house name, or its curated profile claims the
 * house byline via `articleAuthorName`.
 */
export function isHouseAuthor(author: ResolvedAuthor): boolean {
  if (isHouseByline(author.name)) return true;
  return author.profile ? isHouseByline(author.profile.articleAuthorName) : false;
}

export function slugifyAuthor(name: string): string {
  return name
    .toLowerCase()
    .replace(/['\u2018\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The curated row that owns this byline, if any. */
function curatedFor(name: string): Author | undefined {
  const slug = slugifyAuthor(name);
  return authors.find(
    (a) => a.slug === slug || slugifyAuthor(a.articleAuthorName) === slug,
  );
}

export function authorSlugForByline(name: string): string {
  return curatedFor(name)?.slug ?? slugifyAuthor(name);
}

export function resolveAuthorByline(name: string): ResolvedAuthor {
  const profile = curatedFor(name);
  if (profile) {
    return {
      slug: profile.slug,
      name: profile.name,
      profile,
      role: profile.role,
      shortBio: profile.shortBio,
      imageUrl: profile.imageUrl,
    };
  }
  return { slug: slugifyAuthor(name), name: name.trim() };
}

/**
 * Resolve an `/authors/[slug]` route. A curated row wins; otherwise the slug is
 * accepted if some article's byline produces it, so a contributor without a
 * profile still has a real page rather than a 404.
 */
export function resolveAuthorSlug(
  slug: string,
  articles: Article[],
): ResolvedAuthor | undefined {
  const curated = getAuthorBySlug(slug);
  if (curated) return resolveAuthorByline(curated.name);

  const byline = articles.find((a) => authorSlugForByline(a.author) === slug);
  return byline ? resolveAuthorByline(byline.author) : undefined;
}

export function articlesByAuthorSlug(
  slug: string,
  articles: Article[],
): Article[] {
  return articles.filter((a) => authorSlugForByline(a.author) === slug);
}

/**
 * Every author with a page: the curated roster plus any byline in the corpus
 * that no curated row claims. A curated author with nothing published still
 * appears — the roster is the masthead, not a leaderboard.
 */
export function listAuthors(articles: Article[]): ResolvedAuthor[] {
  const bySlug = new Map<string, ResolvedAuthor>();
  for (const a of authors) {
    bySlug.set(a.slug, resolveAuthorByline(a.name));
  }
  for (const article of articles) {
    const resolved = resolveAuthorByline(article.author);
    if (!bySlug.has(resolved.slug)) bySlug.set(resolved.slug, resolved);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}
