import type { EntityConfig, FieldConfig } from "./field-types";

// ---------------------------------------------------------------------------
// Shared image-field builders — every table uses the same alt/credit columns,
// only the primary URL column differs.
// ---------------------------------------------------------------------------

function heroImageField(urlColumn: string, opts: {
  key?: string;
  label?: string;
  required?: boolean;
  aspectRatio?: number;
} = {}): FieldConfig {
  return {
    key: opts.key ?? "heroImageUrl",
    dbColumn: urlColumn,
    label: opts.label ?? "Hero Image",
    type: "image",
    required: opts.required,
    fullWidth: true,
    aspectRatio: opts.aspectRatio ?? 21 / 9,
    altKey: "heroImageAlt",
    creditKey: "heroImageCredit",
    creditUrlKey: "heroImageCreditUrl",
  };
}

const heroImageMetaHidden: FieldConfig[] = [
  { key: "heroImageAlt", dbColumn: "hero_image_alt", label: "Hero Image Alt", type: "hidden" },
  { key: "heroImageCredit", dbColumn: "hero_image_credit", label: "Hero Image Credit", type: "hidden" },
  { key: "heroImageCreditUrl", dbColumn: "hero_image_credit_url", label: "Hero Image Credit URL", type: "hidden" },
];

function simpleImageField(key: string, dbColumn: string, label: string, aspectRatio = 1): FieldConfig {
  return {
    key,
    dbColumn,
    label,
    type: "image",
    aspectRatio,
  };
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------
const destinationsConfig: EntityConfig = {
  table: "destinations",
  label: "Destinations",
  labelSingular: "Destination",
  slug: "destinations",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "region", dbColumn: "region", label: "Region", type: "text", required: true, tableColumn: true },
    { key: "country", dbColumn: "country", label: "Country", type: "text", required: true },
    { key: "state", dbColumn: "state", label: "State", type: "text" },
    { key: "tagline", dbColumn: "tagline", label: "Tagline", type: "text" },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    heroImageField("hero_image_url", { required: true }),
    ...heroImageMetaHidden,
    simpleImageField("thumbnailUrl", "thumbnail_url", "Thumbnail"),
    { key: "latitude", dbColumn: "latitude", label: "Latitude", type: "number", required: true },
    { key: "longitude", dbColumn: "longitude", label: "Longitude", type: "number", required: true },
    { key: "bestMonths", dbColumn: "best_months", label: "Best Months", type: "string-array", placeholder: "e.g. June, July, August" },
    { key: "primarySpecies", dbColumn: "primary_species", label: "Primary Species", type: "string-array", placeholder: "e.g. Rainbow Trout, Brown Trout" },
    { key: "licenseInfo", dbColumn: "license_info", label: "License Info", type: "textarea", fullWidth: true },
    { key: "elevationRange", dbColumn: "elevation_range", label: "Elevation Range", type: "text" },
    { key: "climateNotes", dbColumn: "climate_notes", label: "Climate Notes", type: "textarea", fullWidth: true },
    { key: "regulationsSummary", dbColumn: "regulations_summary", label: "Regulations Summary", type: "textarea", fullWidth: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
    { key: "sortOrder", dbColumn: "sort_order", label: "Sort Order", type: "number" },
  ],
};

// ---------------------------------------------------------------------------
// Rivers
// ---------------------------------------------------------------------------
const riversConfig: EntityConfig = {
  table: "rivers",
  label: "Rivers",
  labelSingular: "River",
  slug: "rivers",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "destinationId", dbColumn: "destination_id", label: "Destination", type: "relation", required: true, relationTable: "destinations", relationLabelKey: "name", tableColumn: true },
    { key: "additionalDestinationIds", dbColumn: "additional_destination_ids", label: "Additional Destinations", type: "string-array" },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    heroImageField("hero_image_url", { required: true }),
    ...heroImageMetaHidden,
    simpleImageField("thumbnailUrl", "thumbnail_url", "Thumbnail"),
    { key: "lengthMiles", dbColumn: "length_miles", label: "Length (miles)", type: "number" },
    { key: "flowType", dbColumn: "flow_type", label: "Flow Type", type: "select", required: true, options: ["freestone", "tailwater", "spring creek", "limestone"] },
    { key: "difficulty", dbColumn: "difficulty", label: "Difficulty", type: "select", required: true, options: ["beginner", "intermediate", "advanced"] },
    { key: "wadingType", dbColumn: "wading_type", label: "Wading Type", type: "select", required: true, options: ["wade", "float", "both"] },
    { key: "primarySpecies", dbColumn: "primary_species", label: "Primary Species", type: "string-array", placeholder: "e.g. Rainbow Trout, Brown Trout" },
    { key: "regulations", dbColumn: "regulations", label: "Regulations", type: "textarea", fullWidth: true },
    { key: "accessPoints", dbColumn: "access_points", label: "Access Points", type: "json", fullWidth: true },
    { key: "bestMonths", dbColumn: "best_months", label: "Best Months", type: "string-array", placeholder: "e.g. June, July, August" },
    { key: "latitude", dbColumn: "latitude", label: "Latitude", type: "number", required: true },
    { key: "longitude", dbColumn: "longitude", label: "Longitude", type: "number", required: true },
    { key: "mapBounds", dbColumn: "map_bounds", label: "Map Bounds", type: "json", fullWidth: true },
    { key: "hatchChart", dbColumn: "hatch_chart", label: "Hatch Chart", type: "json", fullWidth: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "usgsGaugeId", dbColumn: "usgs_gauge_id", label: "USGS Gauge ID", type: "text", placeholder: "e.g. 06041000" },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
  ],
};

// ---------------------------------------------------------------------------
// Species
// ---------------------------------------------------------------------------
const speciesConfig: EntityConfig = {
  table: "species",
  label: "Species",
  labelSingular: "Species",
  slug: "species",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "commonName", dbColumn: "common_name", label: "Common Name", type: "text", required: true, tableColumn: true },
    { key: "scientificName", dbColumn: "scientific_name", label: "Scientific Name", type: "text" },
    { key: "family", dbColumn: "family", label: "Family", type: "select", options: ["trout", "salmon", "char", "grayling", "saltwater", "warmwater", "pike"], tableColumn: true },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", fullWidth: true },
    heroImageField("image_url", { key: "imageUrl", label: "Photo" }),
    ...heroImageMetaHidden,
    simpleImageField("illustrationUrl", "illustration_url", "Illustration"),
    { key: "nativeRange", dbColumn: "native_range", label: "Native Range", type: "text" },
    { key: "introducedRange", dbColumn: "introduced_range", label: "Introduced Range", type: "text" },
    { key: "averageSize", dbColumn: "average_size", label: "Average Size", type: "text" },
    { key: "recordSize", dbColumn: "record_size", label: "Record Size", type: "text" },
    { key: "recordDetails", dbColumn: "record_details", label: "Record Details", type: "text" },
    { key: "preferredHabitat", dbColumn: "preferred_habitat", label: "Preferred Habitat", type: "textarea", fullWidth: true },
    { key: "preferredFlies", dbColumn: "preferred_flies", label: "Preferred Flies", type: "string-array", placeholder: "e.g. Elk Hair Caddis, Pheasant Tail Nymph" },
    { key: "taxonomy", dbColumn: "taxonomy", label: "Taxonomy", type: "json", fullWidth: true },
    { key: "conservationStatus", dbColumn: "conservation_status", label: "Conservation Status", type: "text" },
    { key: "diet", dbColumn: "diet", label: "Diet", type: "textarea", fullWidth: true },
    { key: "spawningInfo", dbColumn: "spawning_info", label: "Spawning Info", type: "textarea", fullWidth: true },
    { key: "spawningMonths", dbColumn: "spawning_months", label: "Spawning Months", type: "string-array", placeholder: "e.g. October, November" },
    { key: "spawningTempF", dbColumn: "spawning_temp_f", label: "Spawning Temp (F)", type: "text" },
    { key: "lifespan", dbColumn: "lifespan", label: "Lifespan", type: "text" },
    { key: "waterTemperatureRange", dbColumn: "water_temperature_range", label: "Water Temperature Range", type: "text" },
    { key: "flyFishingTips", dbColumn: "fly_fishing_tips", label: "Fly Fishing Tips", type: "textarea", fullWidth: true },
    { key: "tackleRecommendations", dbColumn: "tackle_recommendations", label: "Tackle Recommendations", type: "textarea", fullWidth: true },
    { key: "funFacts", dbColumn: "fun_facts", label: "Fun Facts", type: "string-array" },
    { key: "relatedDestinationIds", dbColumn: "related_destination_ids", label: "Related Destinations", type: "string-array" },
    { key: "relatedRiverIds", dbColumn: "related_river_ids", label: "Related Rivers", type: "string-array" },
    { key: "distributionCoordinates", dbColumn: "distribution_coordinates", label: "Distribution Coordinates", type: "json", fullWidth: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
  ],
};

// ---------------------------------------------------------------------------
// Lodges
// ---------------------------------------------------------------------------
const lodgesConfig: EntityConfig = {
  table: "lodges",
  label: "Lodges",
  labelSingular: "Lodge",
  slug: "lodges",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "destinationId", dbColumn: "destination_id", label: "Destination", type: "relation", required: true, relationTable: "destinations", relationLabelKey: "name", tableColumn: true },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    heroImageField("hero_image_url", { required: true }),
    ...heroImageMetaHidden,
    simpleImageField("thumbnailUrl", "thumbnail_url", "Thumbnail"),
    { key: "galleryUrls", dbColumn: "gallery_urls", label: "Gallery URLs", type: "string-array" },
    { key: "websiteUrl", dbColumn: "website_url", label: "Website URL", type: "url" },
    { key: "phone", dbColumn: "phone", label: "Phone", type: "text" },
    { key: "email", dbColumn: "email", label: "Email", type: "email" },
    { key: "address", dbColumn: "address", label: "Address", type: "text" },
    { key: "latitude", dbColumn: "latitude", label: "Latitude", type: "number", required: true },
    { key: "longitude", dbColumn: "longitude", label: "Longitude", type: "number", required: true },
    { key: "priceRange", dbColumn: "price_range", label: "Price Range", type: "text" },
    { key: "priceTier", dbColumn: "price_tier", label: "Price Tier", type: "number", required: true },
    { key: "seasonStart", dbColumn: "season_start", label: "Season Start", type: "text" },
    { key: "seasonEnd", dbColumn: "season_end", label: "Season End", type: "text" },
    { key: "capacity", dbColumn: "capacity", label: "Capacity", type: "number" },
    { key: "amenities", dbColumn: "amenities", label: "Amenities", type: "string-array", placeholder: "e.g. Wi-Fi, Hot Tub, Fly Shop" },
    { key: "nearbyRiverIds", dbColumn: "nearby_river_ids", label: "Nearby River IDs", type: "string-array" },
    { key: "averageRating", dbColumn: "average_rating", label: "Average Rating", type: "number" },
    { key: "reviewCount", dbColumn: "review_count", label: "Review Count", type: "number" },
    { key: "googlePlaceId", dbColumn: "google_place_id", label: "Google Place ID", type: "text" },
    { key: "googleRating", dbColumn: "google_rating", label: "Google Rating", type: "number" },
    { key: "googleReviewCount", dbColumn: "google_review_count", label: "Google Review Count", type: "number" },
    { key: "googleReviewsUrl", dbColumn: "google_reviews_url", label: "Google Reviews URL", type: "url" },
    { key: "featuredReviews", dbColumn: "featured_reviews", label: "Featured Reviews", type: "json", fullWidth: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
  ],
};

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------
const guidesConfig: EntityConfig = {
  table: "guides",
  label: "Guides",
  labelSingular: "Guide",
  slug: "guides",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "destinationId", dbColumn: "destination_id", label: "Destination", type: "relation", required: true, relationTable: "destinations", relationLabelKey: "name", tableColumn: true },
    { key: "bio", dbColumn: "bio", label: "Bio", type: "textarea", required: true, fullWidth: true },
    { key: "specialties", dbColumn: "specialties", label: "Specialties", type: "string-array", placeholder: "e.g. Dry Fly, Nymphing, Streamer" },
    { key: "yearsExperience", dbColumn: "years_experience", label: "Years Experience", type: "number" },
    heroImageField("photo_url", { key: "photoUrl", label: "Photo", aspectRatio: 4 / 5 }),
    ...heroImageMetaHidden,
    { key: "websiteUrl", dbColumn: "website_url", label: "Website URL", type: "url" },
    { key: "phone", dbColumn: "phone", label: "Phone", type: "text" },
    { key: "email", dbColumn: "email", label: "Email", type: "email" },
    { key: "licenseNumber", dbColumn: "license_number", label: "License Number", type: "text" },
    { key: "riverIds", dbColumn: "river_ids", label: "River IDs", type: "string-array" },
    { key: "dailyRate", dbColumn: "daily_rate", label: "Daily Rate", type: "text", tableColumn: true },
    { key: "googlePlaceId", dbColumn: "google_place_id", label: "Google Place ID", type: "text" },
    { key: "googleRating", dbColumn: "google_rating", label: "Google Rating", type: "number" },
    { key: "googleReviewCount", dbColumn: "google_review_count", label: "Google Review Count", type: "number" },
    { key: "googleReviewsUrl", dbColumn: "google_reviews_url", label: "Google Reviews URL", type: "url" },
    { key: "featuredReviews", dbColumn: "featured_reviews", label: "Featured Reviews", type: "json", fullWidth: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
  ],
};

// ---------------------------------------------------------------------------
// Fly Shops
// ---------------------------------------------------------------------------
const flyShopsConfig: EntityConfig = {
  table: "fly_shops",
  label: "Fly Shops",
  labelSingular: "Fly Shop",
  slug: "fly-shops",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "destinationId", dbColumn: "destination_id", label: "Destination", type: "relation", required: true, relationTable: "destinations", relationLabelKey: "name", tableColumn: true },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    heroImageField("hero_image_url"),
    ...heroImageMetaHidden,
    { key: "address", dbColumn: "address", label: "Address", type: "text", required: true },
    { key: "latitude", dbColumn: "latitude", label: "Latitude", type: "number", required: true },
    { key: "longitude", dbColumn: "longitude", label: "Longitude", type: "number", required: true },
    { key: "phone", dbColumn: "phone", label: "Phone", type: "text" },
    { key: "websiteUrl", dbColumn: "website_url", label: "Website URL", type: "url" },
    { key: "hours", dbColumn: "hours", label: "Hours", type: "json", fullWidth: true },
    { key: "services", dbColumn: "services", label: "Services", type: "string-array", placeholder: "e.g. Guided Trips, Fly Tying Classes, Rod Repair" },
    { key: "brandsCarried", dbColumn: "brands_carried", label: "Brands Carried", type: "string-array", placeholder: "e.g. Simms, Orvis, Sage" },
    { key: "googlePlaceId", dbColumn: "google_place_id", label: "Google Place ID", type: "text" },
    { key: "googleRating", dbColumn: "google_rating", label: "Google Rating", type: "number" },
    { key: "googleReviewCount", dbColumn: "google_review_count", label: "Google Review Count", type: "number" },
    { key: "googleReviewsUrl", dbColumn: "google_reviews_url", label: "Google Reviews URL", type: "url" },
    { key: "featuredReviews", dbColumn: "featured_reviews", label: "Featured Reviews", type: "json", fullWidth: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
  ],
};

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------
const articlesConfig: EntityConfig = {
  table: "articles",
  label: "Articles",
  labelSingular: "Article",
  slug: "articles",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "title", dbColumn: "title", label: "Title", type: "text", required: true, tableColumn: true },
    { key: "subtitle", dbColumn: "subtitle", label: "Subtitle", type: "text" },
    { key: "author", dbColumn: "author", label: "Author", type: "text", required: true },
    { key: "category", dbColumn: "category", label: "Category", type: "select", required: true, options: ["technique", "destination", "gear", "conservation", "culture", "species"], tableColumn: true },
    heroImageField("hero_image_url", { required: true }),
    ...heroImageMetaHidden,
    simpleImageField("thumbnailUrl", "thumbnail_url", "Thumbnail"),
    { key: "excerpt", dbColumn: "excerpt", label: "Excerpt", type: "textarea", required: true, fullWidth: true },
    { key: "content", dbColumn: "content", label: "Content", type: "richtext", required: true, fullWidth: true },
    { key: "readingTimeMinutes", dbColumn: "reading_time_minutes", label: "Reading Time (min)", type: "number", required: true },
    { key: "tags", dbColumn: "tags", label: "Tags", type: "string-array", placeholder: "e.g. dry-fly, beginner, montana" },
    { key: "relatedDestinationIds", dbColumn: "related_destination_ids", label: "Related Destinations", type: "string-array" },
    { key: "relatedRiverIds", dbColumn: "related_river_ids", label: "Related Rivers", type: "string-array" },
    { key: "publishedAt", dbColumn: "published_at", label: "Published At", type: "date", required: true },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
  ],
};

// ---------------------------------------------------------------------------
// Gear Brands
// ---------------------------------------------------------------------------
const gearBrandsConfig: EntityConfig = {
  table: "gear_brands",
  label: "Gear Brands",
  labelSingular: "Gear Brand",
  slug: "gear-brands",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "tagline", dbColumn: "tagline", label: "Tagline", type: "text" },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    simpleImageField("logoUrl", "logo_url", "Logo"),
    heroImageField("hero_image_url"),
    ...heroImageMetaHidden,
    { key: "websiteUrl", dbColumn: "website_url", label: "Website URL", type: "url" },
    { key: "country", dbColumn: "country", label: "Country", type: "text" },
    { key: "foundedYear", dbColumn: "founded_year", label: "Founded Year", type: "number" },
    { key: "headquarters", dbColumn: "headquarters", label: "Headquarters", type: "text" },
    { key: "specialties", dbColumn: "specialties", label: "Specialties", type: "string-array", placeholder: "e.g. Fly Rods, Reels, Waders" },
    { key: "sortOrder", dbColumn: "sort_order", label: "Sort Order", type: "number" },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
  ],
};

// ---------------------------------------------------------------------------
// Gear Products
// ---------------------------------------------------------------------------
const gearProductsConfig: EntityConfig = {
  table: "gear_products",
  label: "Gear Products",
  labelSingular: "Gear Product",
  slug: "gear-products",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "brandId", dbColumn: "brand_id", label: "Brand", type: "relation", required: true, relationTable: "gear_brands", relationLabelKey: "name", tableColumn: true },
    { key: "category", dbColumn: "category", label: "Category", type: "select", required: true, options: ["rod", "reel", "waders"], tableColumn: true },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    heroImageField("hero_image_url"),
    ...heroImageMetaHidden,
    { key: "galleryUrls", dbColumn: "gallery_urls", label: "Gallery URLs", type: "string-array" },
    { key: "msrpUsd", dbColumn: "msrp_usd", label: "MSRP (USD)", type: "number" },
    { key: "specs", dbColumn: "specs", label: "Specs (JSON)", type: "json", fullWidth: true },
    { key: "useCases", dbColumn: "use_cases", label: "Use Cases", type: "string-array", placeholder: "e.g. Trout, Saltwater, Dry Fly" },
    { key: "relatedRiverIds", dbColumn: "related_river_ids", label: "Related River IDs", type: "string-array" },
    { key: "relatedSpeciesIds", dbColumn: "related_species_ids", label: "Related Species IDs", type: "string-array" },
    { key: "productUrl", dbColumn: "product_url", label: "Product URL", type: "url" },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
  ],
};

// ---------------------------------------------------------------------------
// Canonical Flies (The Trout Fly Library)
// ---------------------------------------------------------------------------
const canonicalFliesConfig: EntityConfig = {
  table: "flies",
  label: "Flies (Trout Fly Library)",
  labelSingular: "Fly",
  slug: "flies",
  fields: [
    { key: "id", dbColumn: "id", label: "ID", type: "hidden" },
    { key: "slug", dbColumn: "slug", label: "Slug", type: "text", required: true, tableColumn: true },
    { key: "name", dbColumn: "name", label: "Name", type: "text", required: true, tableColumn: true },
    { key: "category", dbColumn: "category", label: "Category", type: "select", required: true, options: ["dry", "nymph", "streamer", "emerger", "wet", "terrestrial", "egg", "midge"], tableColumn: true },
    { key: "tagline", dbColumn: "tagline", label: "Tagline", type: "text" },
    { key: "description", dbColumn: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
    { key: "history", dbColumn: "history", label: "History", type: "textarea", fullWidth: true },
    { key: "tyingOverview", dbColumn: "tying_overview", label: "Tying Overview", type: "textarea", fullWidth: true },
    { key: "tyingSteps", dbColumn: "tying_steps", label: "Tying Steps", type: "json", fullWidth: true },
    { key: "materialsList", dbColumn: "materials_list", label: "Materials List", type: "json", fullWidth: true },
    { key: "fishingTips", dbColumn: "fishing_tips", label: "Fishing Tips", type: "textarea", fullWidth: true },
    { key: "whenToUse", dbColumn: "when_to_use", label: "When to Use", type: "textarea", fullWidth: true },
    { key: "imitates", dbColumn: "imitates", label: "Imitates", type: "string-array", placeholder: "e.g. mayflies, midges" },
    { key: "effectiveSpecies", dbColumn: "effective_species", label: "Effective Species", type: "string-array", placeholder: "e.g. Rainbow Trout, Brown Trout" },
    { key: "waterTypes", dbColumn: "water_types", label: "Water Types", type: "string-array", placeholder: "e.g. tailwater, freestone, spring creek" },
    { key: "sizes", dbColumn: "sizes", label: "Sizes", type: "string-array", required: true, placeholder: "e.g. 14, 16, 18" },
    { key: "colors", dbColumn: "colors", label: "Colors", type: "string-array" },
    { key: "beadOptions", dbColumn: "bead_options", label: "Bead Options", type: "string-array" },
    { key: "hookStyles", dbColumn: "hook_styles", label: "Hook Styles", type: "string-array" },
    { key: "keyVariations", dbColumn: "key_variations", label: "Key Variations", type: "json", fullWidth: true },
    simpleImageField("heroImageUrl", "hero_image_url", "Hero Image"),
    { key: "galleryUrls", dbColumn: "gallery_urls", label: "Gallery URLs", type: "string-array" },
    simpleImageField("iconUrl", "icon_url", "Icon"),
    { key: "videoUrl", dbColumn: "video_url", label: "Primary Video URL", type: "url" },
    { key: "additionalVideos", dbColumn: "additional_videos", label: "Additional Videos", type: "json", fullWidth: true },
    { key: "relatedFlyIds", dbColumn: "related_fly_ids", label: "Related Fly IDs", type: "string-array" },
    { key: "relatedRiverIds", dbColumn: "related_river_ids", label: "Related River IDs", type: "string-array" },
    { key: "relatedDestinationIds", dbColumn: "related_destination_ids", label: "Related Destination IDs", type: "string-array" },
    { key: "hatchAssociations", dbColumn: "hatch_associations", label: "Hatch Associations", type: "json", fullWidth: true },
    { key: "affiliateLinks", dbColumn: "affiliate_links", label: "Affiliate Links", type: "json", fullWidth: true },
    { key: "flyShopIds", dbColumn: "fly_shop_ids", label: "Fly Shop IDs", type: "string-array" },
    { key: "originCredit", dbColumn: "origin_credit", label: "Origin Credit", type: "text" },
    { key: "metaTitle", dbColumn: "meta_title", label: "Meta Title", type: "text" },
    { key: "metaDescription", dbColumn: "meta_description", label: "Meta Description", type: "textarea", fullWidth: true },
    { key: "rank", dbColumn: "rank", label: "Display Rank", type: "number" },
    { key: "featured", dbColumn: "featured", label: "Featured", type: "boolean", tableColumn: true },
    { key: "isHeroPattern", dbColumn: "is_hero_pattern", label: "Hero Pattern", type: "boolean" },
  ],
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  destinations: destinationsConfig,
  rivers: riversConfig,
  species: speciesConfig,
  lodges: lodgesConfig,
  guides: guidesConfig,
  "fly-shops": flyShopsConfig,
  articles: articlesConfig,
  flies: canonicalFliesConfig,
  "gear-brands": gearBrandsConfig,
  "gear-products": gearProductsConfig,
};

export function getEntityConfig(slug: string): EntityConfig | undefined {
  return ENTITY_CONFIGS[slug];
}
