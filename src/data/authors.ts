export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  shortBio: string;
  imageUrl?: string;
  expertise: string[];
  credentials: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  /** The display name used in the article `author` field (for matching) */
  articleAuthorName: string;
}

export const authors: Author[] = [
  {
    slug: "taylor-warnick",
    name: "Executive Angler Staff",
    articleAuthorName: "Executive Angler Staff",
    role: "Editorial",
    bio: `Field notes from Executive Angler — rivers, flies and hatches, documented, plus a private journal that remembers what you learned. The product exists so the things anglers actually care about (flows, hatches, sessions, flies) are treated as data worth keeping.`,
    shortBio:
      "Editorial staff. Rivers, flies, and hatches.",
    // imageUrl intentionally unset — AuthorAvatar renders initials fallback until a real photo is uploaded
    imageUrl: undefined,
    expertise: [
      "Euro Nymphing",
      "Western Trout Fishing",
      "Fly Fishing Technology",
      "Product Design & Engineering",
    ],
    credentials: [
      "Founder of Executive Angler",
      "Designed and built the web, iOS, and data platform",
      "Based in Sandy, Utah",
    ],
    socialLinks: {
      website: "https://www.executiveangler.com",
      instagram: "https://www.instagram.com/executiveangler",
      twitter: "https://x.com/executiveangler",
    },
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function getAuthorByArticleName(name: string): Author | undefined {
  return authors.find((a) => a.articleAuthorName === name);
}

export function getAllAuthors(): Author[] {
  return authors;
}
