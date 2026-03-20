export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  shortBio: string;
  imageUrl: string;
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
    bio: `Taylor Warnick is the founder of Executive Angler and a lifelong fly fisher who grew up chasing cutthroat trout in the mountain streams of Utah. With over two decades on the water — from spring creeks in the Intermountain West to saltwater flats in the Caribbean — Taylor combines deep angling experience with a background in software engineering and product design.

After building technology products for Fortune 500 companies, Taylor launched Executive Angler to create the definitive digital resource for serious fly fishers. His approach merges data-driven analysis with the kind of hard-won, on-the-water insight that only comes from thousands of hours spent reading currents, matching hatches, and refining technique.

Taylor holds certifications in fly casting instruction and is an active member of Trout Unlimited. When he's not writing or building the Executive Angler platform, you'll find him waist-deep in a freestone river somewhere in the Rocky Mountain West, probably euro nymphing.`,
    shortBio:
      "Founder of Executive Angler. Fly fisher, software engineer, and conservation advocate based in the Rocky Mountain West.",
    imageUrl: "/images/authors/taylor-warnick.jpg",
    expertise: [
      "Euro Nymphing",
      "Western Trout Fishing",
      "Fly Fishing Technology",
      "Destination Planning",
      "Gear Reviews",
      "Conservation",
    ],
    credentials: [
      "20+ years fly fishing experience",
      "Certified fly casting instructor",
      "Trout Unlimited member",
      "Software engineer & product designer",
      "Fished 15+ U.S. states and 4 countries",
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
