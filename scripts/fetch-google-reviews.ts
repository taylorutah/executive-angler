/**
 * Fetch Google Reviews data for businesses missing review data.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=<key> npx tsx scripts/fetch-google-reviews.ts
 *
 * Uses Google Places API:
 *   1. Text Search to find the business and get place_id
 *   2. Place Details to get rating, review_count, reviews, and URL
 *
 * Outputs JSON that can be used to update src/data/*.ts files.
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error("ERROR: GOOGLE_PLACES_API_KEY env var required");
  process.exit(1);
}

interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
}

interface BusinessResult {
  name: string;
  slug: string;
  type: "lodge" | "guide" | "fly-shop";
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleReviewsUrl: string | null;
  featuredReviews: GoogleReview[];
  error?: string;
}

// Businesses that need Google Reviews data
const BUSINESSES = [
  // Lodge
  { name: "Firehole Ranch", query: "Firehole Ranch West Yellowstone Montana", slug: "firehole-ranch", type: "lodge" as const },

  // Guide (needs featured reviews only — already has rating/count)
  { name: "Alistair Grant - Spey Ghillie", query: "Craigellachie fishing ghillie River Spey Scotland", slug: "spey-ghillie", type: "guide" as const },

  // Fly shops
  { name: "South Branch Outfitters", query: "South Branch Outfitters fly shop Califon NJ", slug: "south-branch-outfitters", type: "fly-shop" as const },
  { name: "Tight Lines Fly Fishing", query: "Tight Lines Fly Fishing Co De Pere Wisconsin", slug: "tight-lines-fly-fishing", type: "fly-shop" as const },
  { name: "Golden Stone Outfitters", query: "Golden Stone Outfitters Lafayette NJ fly shop", slug: "golden-stone-outfitters", type: "fly-shop" as const },
  { name: "Orvis Doylestown", query: "Orvis Doylestown Pennsylvania", slug: "orvis-doylestown", type: "fly-shop" as const },
  { name: "The Sporting Gentleman", query: "The Sporting Gentleman fly shop Media PA", slug: "the-sporting-gentleman", type: "fly-shop" as const },
  { name: "Jackson Hole Fly Company", query: "Jackson Hole Fly Company Wyoming", slug: "jackson-hole-fly-company", type: "fly-shop" as const },
  { name: "Westbank Anglers", query: "Westbank Anglers Jackson Hole Wyoming fly shop", slug: "westbank-anglers", type: "fly-shop" as const },
  { name: "Grand Teton Fly Fishing", query: "Grand Teton Fly Fishing Jackson Wyoming", slug: "grand-teton-fly-fishing", type: "fly-shop" as const },
  { name: "JD High Country Outfitters", query: "JD High Country Outfitters Jackson Hole Wyoming", slug: "jd-high-country-outfitters", type: "fly-shop" as const },
  { name: "Orvis Jackson Hole", query: "Orvis Jackson Hole Wyoming", slug: "orvis-jackson-hole", type: "fly-shop" as const },
  { name: "Snake River Angler", query: "Snake River Angler Jackson Hole Wyoming fly shop", slug: "snake-river-angler", type: "fly-shop" as const },
  { name: "Teton Fly Fishing", query: "Teton Fly Fishing Driggs Idaho", slug: "teton-fly-fishing", type: "fly-shop" as const },
  { name: "Lost River Outfitters", query: "Lost River Outfitters Ketchum Idaho fly shop", slug: "lost-river-outfitters", type: "fly-shop" as const },
  { name: "Sun Valley Outfitters", query: "Sun Valley Outfitters Ketchum Idaho fly fishing", slug: "sun-valley-outfitters", type: "fly-shop" as const },
  { name: "Idaho Angling Service", query: "Idaho Angling Service Sun Valley fly shop", slug: "idaho-angling-service", type: "fly-shop" as const },
  { name: "Picabo Angler", query: "Picabo Angler fly shop Idaho", slug: "picabo-angler", type: "fly-shop" as const },
];

async function searchPlace(query: string): Promise<{ placeId: string; name: string } | null> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as any;

  if (data.status !== "OK" || !data.results?.length) {
    return null;
  }

  return {
    placeId: data.results[0].place_id,
    name: data.results[0].name,
  };
}

async function getPlaceDetails(placeId: string): Promise<{
  rating: number | null;
  reviewCount: number | null;
  url: string | null;
  reviews: GoogleReview[];
}> {
  const fields = "rating,user_ratings_total,url,reviews";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as any;

  if (data.status !== "OK" || !data.result) {
    return { rating: null, reviewCount: null, url: null, reviews: [] };
  }

  const result = data.result;
  const reviews: GoogleReview[] = (result.reviews || []).slice(0, 3).map((r: any) => ({
    authorName: r.author_name || "Anonymous",
    rating: r.rating || 5,
    text: r.text || "",
    relativeTimeDescription: r.relative_time_description || "",
    time: r.time || Math.floor(Date.now() / 1000),
  }));

  return {
    rating: result.rating || null,
    reviewCount: result.user_ratings_total || null,
    url: result.url || null,
    reviews,
  };
}

async function processBusiness(biz: typeof BUSINESSES[number]): Promise<BusinessResult> {
  try {
    console.log(`  Searching: ${biz.name}...`);
    const place = await searchPlace(biz.query);

    if (!place) {
      return {
        name: biz.name,
        slug: biz.slug,
        type: biz.type,
        googlePlaceId: null,
        googleRating: null,
        googleReviewCount: null,
        googleReviewsUrl: null,
        featuredReviews: [],
        error: "Place not found",
      };
    }

    console.log(`  Found: ${place.name} (${place.placeId})`);
    const details = await getPlaceDetails(place.placeId);

    return {
      name: biz.name,
      slug: biz.slug,
      type: biz.type,
      googlePlaceId: place.placeId,
      googleRating: details.rating,
      googleReviewCount: details.reviewCount,
      googleReviewsUrl: details.url,
      featuredReviews: details.reviews,
    };
  } catch (err: any) {
    return {
      name: biz.name,
      slug: biz.slug,
      type: biz.type,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
      googleReviewsUrl: null,
      featuredReviews: [],
      error: err.message,
    };
  }
}

async function main() {
  console.log(`\nFetching Google Reviews for ${BUSINESSES.length} businesses...\n`);

  const results: BusinessResult[] = [];

  // Process sequentially to avoid rate limits
  for (const biz of BUSINESSES) {
    const result = await processBusiness(biz);
    results.push(result);

    // Small delay to be respectful of API rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Group by type
  const lodges = results.filter(r => r.type === "lodge");
  const guides = results.filter(r => r.type === "guide");
  const shops = results.filter(r => r.type === "fly-shop");

  console.log("\n========================================");
  console.log("RESULTS");
  console.log("========================================\n");

  const successCount = results.filter(r => r.googleRating !== null).length;
  const failCount = results.filter(r => r.googleRating === null).length;
  console.log(`Success: ${successCount} | Failed: ${failCount}\n`);

  for (const r of results) {
    if (r.error) {
      console.log(`❌ ${r.name}: ${r.error}`);
    } else {
      console.log(`✅ ${r.name}: ${r.googleRating}⭐ (${r.googleReviewCount} reviews, ${r.featuredReviews.length} featured)`);
    }
  }

  // Output full JSON for use in data updates
  console.log("\n========================================");
  console.log("JSON OUTPUT");
  console.log("========================================\n");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
