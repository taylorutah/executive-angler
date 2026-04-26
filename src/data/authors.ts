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
    name: "Taylor Warnick",
    articleAuthorName: "Executive Angler Staff",
    role: "Founder & Editor-in-Chief",
    bio: `Taylor Warnick is the founder of Executive Angler, a fly fishing intelligence platform built for serious anglers. He designed and built the product himself — web, iOS, and the data systems behind it — out of a simple idea: the things anglers actually care about (flows, hatches, sessions, flies) deserve to be treated as data worth keeping.

He lives in Sandy, Utah, and spends most of his time on the water euro nymphing the region's rivers. Executive Angler is the tool he wished existed.`,
    shortBio:
      "Founder of Executive Angler. Based in Sandy, Utah — mostly on regional rivers, mostly euro nymphing.",
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
