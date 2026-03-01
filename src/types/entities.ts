export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  country: string;
  state?: string;
  tagline?: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl?: string;
  latitude: number;
  longitude: number;
  bestMonths: string[];
  primarySpecies: string[];
  licenseInfo?: string;
  elevationRange?: string;
  climateNotes?: string;
  regulationsSummary?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  sortOrder?: number;
}

export interface River {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl?: string;
  lengthMiles?: number;
  flowType: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  wadingType: "wade" | "float" | "both";
  primarySpecies: string[];
  regulations?: string;
  accessPoints: AccessPoint[];
  bestMonths: string[];
  latitude: number;
  longitude: number;
  mapBounds?: { sw: [number, number]; ne: [number, number] };
  hatchChart?: HatchMonth[];
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
}

export interface AccessPoint {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  parking: boolean;
}

export interface HatchMonth {
  month: string;
  hatches: HatchEntry[];
}

export interface HatchEntry {
  insect: string;
  size: string;
  pattern: string;
  timeOfDay?: string;
  intensity?: "sparse" | "moderate" | "heavy";
}

export interface Lodge {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl?: string;
  galleryUrls: string[];
  websiteUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude: number;
  longitude: number;
  priceRange?: string;
  priceTier: number;
  seasonStart?: string;
  seasonEnd?: string;
  capacity?: number;
  amenities: string[];
  nearbyRiverIds: string[];
  averageRating?: number;
  reviewCount: number;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleReviewsUrl?: string;
  featuredReviews?: GoogleReview[];
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
}

export interface Guide {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  bio: string;
  specialties: string[];
  yearsExperience?: number;
  photoUrl?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  riverIds: string[];
  dailyRate?: string;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleReviewsUrl?: string;
  featuredReviews?: GoogleReview[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface FlyShop {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  description: string;
  heroImageUrl?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  websiteUrl?: string;
  hours?: Record<string, string>;
  services: string[];
  brandsCarried: string[];
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleReviewsUrl?: string;
  featuredReviews?: GoogleReview[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  category: "technique" | "destination" | "gear" | "conservation" | "culture" | "species";
  heroImageUrl: string;
  thumbnailUrl?: string;
  excerpt: string;
  content: string;
  readingTimeMinutes: number;
  tags: string[];
  relatedDestinationIds: string[];
  relatedRiverIds: string[];
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
}

export interface Species {
  id: string;
  slug: string;
  commonName: string;
  scientificName?: string;
  family?: "trout" | "salmon" | "char" | "grayling" | "saltwater" | "warmwater" | "pike";
  description?: string;
  imageUrl?: string;
  illustrationUrl?: string;
  nativeRange?: string;
  introducedRange?: string;
  averageSize?: string;
  recordSize?: string;
  recordDetails?: string;
  preferredHabitat?: string;
  preferredFlies: string[];
  taxonomy?: {
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  conservationStatus?: string;
  diet?: string;
  spawningInfo?: string;
  spawningMonths?: string[];
  spawningTempF?: string;
  lifespan?: string;
  waterTemperatureRange?: string;
  flyFishingTips?: string;
  tackleRecommendations?: string;
  funFacts?: string[];
  relatedDestinationIds: string[];
  relatedRiverIds: string[];
  distributionCoordinates?: { name: string; latitude: number; longitude: number }[];
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
}

export interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  profilePhotoUrl?: string;
  time: number;
}

export interface PhotoSubmission {
  id: string;
  entityType: "destination" | "river" | "lodge" | "guide" | "fly-shop" | "species";
  entityId: string;
  submitterName: string;
  submitterEmail: string;
  photoUrl: string;
  caption?: string;
  cameraBody?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  visitDate?: string;
  createdAt: string;
}
