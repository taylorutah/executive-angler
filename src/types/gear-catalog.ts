export type GearProductCategory = "rod" | "reel" | "waders";

export interface GearBrand {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroImageCredit?: string;
  heroImageCreditUrl?: string;
  websiteUrl?: string;
  country?: string;
  foundedYear?: number;
  headquarters?: string;
  specialties: string[];
  featured: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface RodProductSpecs {
  lengthFt?: number;
  lineWeight?: number;
  pieces?: number;
  action?: "extra-fast" | "fast" | "medium-fast" | "medium" | "slow";
  handle?: string;
  weightOz?: number;
  warranty?: string;
}

export interface ReelProductSpecs {
  size?: string;
  lineWeightRange?: string;
  dragType?: "disc" | "click-pawl";
  material?: string;
  weightOz?: number;
  arbor?: "large" | "mid" | "standard";
  warranty?: string;
}

export interface WadersProductSpecs {
  material?: string;
  layers?: string;
  footType?: "stockingfoot" | "bootfoot";
  sizes?: string[];
  warranty?: string;
}

export type GearProductSpecs =
  | RodProductSpecs
  | ReelProductSpecs
  | WadersProductSpecs
  | Record<string, unknown>;

export interface GearProduct {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  category: GearProductCategory;
  description: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroImageCredit?: string;
  heroImageCreditUrl?: string;
  galleryUrls: string[];
  msrpUsd?: number;
  specs: GearProductSpecs;
  useCases: string[];
  relatedRiverIds: string[];
  relatedSpeciesIds: string[];
  productUrl?: string;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}
