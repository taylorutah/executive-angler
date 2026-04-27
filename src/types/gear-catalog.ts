export type GearProductCategory =
  | "rod"
  | "reel"
  | "waders"
  | "wading-boots"
  | "line"
  | "leader"
  | "tippet"
  | "pack"
  | "net";

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

export interface WadingBootSpecs {
  soleType?: "felt" | "rubber" | "studded-rubber" | "interchangeable";
  upperMaterial?: string;
  weightOzPerPair?: number;
  sizes?: string[];
  warranty?: string;
}

export interface LineSpecs {
  lineWeight?: number;
  taper?: "WF" | "DT" | "ST" | "Spey" | "Skagit" | "Scandi";
  density?: "floating" | "intermediate" | "sinking" | "sink-tip" | "multi-density";
  color?: string;
  lengthFt?: number;
  coreType?: string;
  application?: string;
}

export interface LeaderSpecs {
  lengthFt?: number;
  tippetX?: string;
  butt?: string;
  style?: "knotless" | "knotted" | "furled" | "euro" | "salt" | "spey";
  material?: "monofilament" | "fluorocarbon" | "copolymer";
}

export interface TippetSpecs {
  material?: "fluorocarbon" | "nylon" | "copolymer";
  xSize?: string;
  diameterMm?: number;
  lbTest?: number;
  spoolFt?: number;
}

export interface PackSpecs {
  type?: "sling" | "vest" | "chest" | "hip" | "backpack" | "wader-bag" | "boat-bag" | "duffel";
  capacityLiters?: number;
  waterproof?: boolean;
  material?: string;
  weightOz?: number;
}

export interface NetSpecs {
  hoopMaterial?: string;
  bagMaterial?: "rubber" | "ghost" | "knotless-nylon" | "clear-rubber";
  hoopLengthIn?: number;
  totalLengthIn?: number;
  weightOz?: number;
}

export type GearProductSpecs =
  | RodProductSpecs
  | ReelProductSpecs
  | WadersProductSpecs
  | WadingBootSpecs
  | LineSpecs
  | LeaderSpecs
  | TippetSpecs
  | PackSpecs
  | NetSpecs
  | Record<string, unknown>;

/**
 * Variant summary — one row per model in the catalog, with available
 * variants disclosed as arrays. Avoids splitting every SKU into its own
 * row while still giving anglers a clear picture of what's available.
 */
export interface VariantSummary {
  lineWeights?: number[];
  lengths?: string[];
  sizes?: string[];
  hand?: ("right" | "left")[];
  colors?: string[];
  notes?: string;
}

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
  variantSummary?: VariantSummary;
  useCases: string[];
  relatedRiverIds: string[];
  relatedSpeciesIds: string[];
  productUrl?: string;
  /**
   * Internal — source image URL on the brand's website, used by the ingest
   * pipeline (`scripts/ingest-gear-images.ts`) to download + rehost on
   * Supabase Storage. Not seeded to the database.
   */
  sourceImageUrl?: string;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}
