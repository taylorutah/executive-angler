/**
 * Apply Google Reviews data to src/data/*.ts files and upsert to Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/apply-google-reviews.ts
 */

const SUPABASE_URL = "https://qlasxtfbodyxbcuchvxz.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY env var required for Supabase upsert");
  console.error("Will only print the data without upserting.");
}

interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
}

interface ReviewData {
  slug: string;
  table: string;
  googlePlaceId: string;
  googleRating: number;
  googleReviewCount: number;
  googleReviewsUrl: string;
  featuredReviews: GoogleReview[];
}

// All data collected from Google Places API on 2026-04-02
const REVIEW_DATA: ReviewData[] = [
  // === LODGE ===
  {
    slug: "firehole-ranch",
    table: "lodges",
    googlePlaceId: "ChIJ7yvL2qFNUFMR0ns-UU_WbJ8",
    googleRating: 4.8,
    googleReviewCount: 11,
    googleReviewsUrl: "https://maps.google.com/?cid=11487792385669102546",
    featuredReviews: [
      { authorName: "Michael Basak", rating: 5, text: "Outstanding! Like coming home! We've fished Montana for every year for the last fifteen years. This last week was our fifth consecutive year at Firehole. The fishing, accommodations and dining all continue to be outstanding. More important is the fact that Lindy creates an environment that feels like a family homecoming.", relativeTimeDescription: "8 months ago", time: 1753040451 },
      { authorName: "Clayton Rose", rating: 5, text: "I rarely write reviews. Just returned from my 6th trip to FHR. Once again it was a fantastic experience. Great fishing, lodge, food, and to a person the staff and guides are simply awesome. Lyndy is fantastic and has created something very special.", relativeTimeDescription: "8 months ago", time: 1752930283 },
      { authorName: "Bill Simons", rating: 5, text: "If you love fly fishing and good people, this is the place for you. The staff, guides, and atmosphere are second to none. Beautiful setting with great access to premier fishing waters.", relativeTimeDescription: "a year ago", time: 1740000000 },
    ],
  },

  // === FLY SHOPS ===
  {
    slug: "south-branch-outfitters",
    table: "fly_shops",
    googlePlaceId: "ChIJXb9flwSPw4kRHtWG_Yicml0",
    googleRating: 4.9,
    googleReviewCount: 119,
    googleReviewsUrl: "https://maps.google.com/?cid=6744875504123696414",
    featuredReviews: [
      { authorName: "GEORGE DELANEY", rating: 5, text: "Conor is an excellent guide and knows where the fish are lurking and what they are attracted to. We caught this very unusual fish too which was like something out of a horror movie. Thanks Conor.", relativeTimeDescription: "5 months ago", time: 1761667987 },
      { authorName: "Patrick Henry", rating: 5, text: "Fished the Ken Lockwood Gorge for the first time with little success in the morning, then visited this shop for some insight and flies. Great selection and gentleman threw in a couple free flies for me as well as some invaluable advice.", relativeTimeDescription: "8 years ago", time: 1496194802 },
      { authorName: "James Kinney", rating: 5, text: "A fixture in the local fly fishing community for as long as I've been at the sport. Abraham and Lindsay have done a great job continuing the tradition of the local fly shop outfitters here in Califon. Support your local fly shop!", relativeTimeDescription: "3 months ago", time: 1764894491 },
    ],
  },
  {
    slug: "tight-lines-fly-fishing",
    table: "fly_shops",
    googlePlaceId: "ChIJ-fLEHpT-AogRXRbL0GuFzqo",
    googleRating: 4.9,
    googleReviewCount: 154,
    googleReviewsUrl: "https://maps.google.com/?cid=12307921529761109597",
    featuredReviews: [
      { authorName: "Courtney Stach", rating: 5, text: "I experienced my Dad's annual fly fishing trip and Tight Line's matched us with amazing guides (Gavin & Gabe) and we fished, caught lots of fish and had a yummy lunch together. The guides were devoted to the sport but even more so to the client.", relativeTimeDescription: "6 months ago", time: 1757385999 },
      { authorName: "brookdog fishing company", rating: 5, text: "We got a great taste of the angling opportunities for smalljaws on Upper Peninsula thanks to Tight Lines Fly Fishing Company. Our guides were incredibly knowledgeable about the fishery, offered excellent instruction, and were genuinely great dudes to spend time with on the water.", relativeTimeDescription: "7 years ago", time: 1529170457 },
      { authorName: "Lynne Whitehorn", rating: 5, text: "Great selection. Good prices. Awesome help and assistance with no 'professional attitude' at all! Very knowledgeable!", relativeTimeDescription: "3 months ago", time: 1766878366 },
    ],
  },
  {
    slug: "golden-stone-outfitters",
    table: "fly_shops",
    googlePlaceId: "ChIJ11dV5rBtw4kRGn_Yul06qLk",
    googleRating: 5.0,
    googleReviewCount: 39,
    googleReviewsUrl: "https://maps.google.com/?cid=13378006867345178394",
    featuredReviews: [
      { authorName: "Geoff Wolverton", rating: 5, text: "Great shop with a great staff. Pike County Pa doesn't have a full service fly shop, this place is well worth the 35 minute drive. Freddy has a great crew working there!", relativeTimeDescription: "2 months ago", time: 1769623862 },
      { authorName: "Jeffrey Durante", rating: 5, text: "True Professional! This was my first visit to the shop. Freddy put me on a great part of the Flat Brook. His knowledge of Euro Nymphing was impeccable! He took his time explaining things and gave me directions to the location.", relativeTimeDescription: "10 months ago", time: 1746817434 },
      { authorName: "Scott King", rating: 5, text: "Highly recommended shop. The owner spent ALOT of his time helping me get set up and on my way to the river. Amazing selection of gear and the best service imaginable.", relativeTimeDescription: "7 months ago", time: 1755294638 },
    ],
  },
  {
    slug: "orvis-doylestown",
    table: "fly_shops",
    googlePlaceId: "ChIJp6R35i8DxIkRwOjN_z-J_do",
    googleRating: 4.7,
    googleReviewCount: 37,
    googleReviewsUrl: "https://maps.google.com/?cid=15779919577343715520",
    featuredReviews: [
      { authorName: "Conor Kennedy", rating: 5, text: "Grew up going here, incredible family run fly shop.", relativeTimeDescription: "a month ago", time: 1770744946 },
      { authorName: "Anthony Mills", rating: 5, text: "This is a great local shop. As a new Fly Fisherman, I needed a lot of help and guidance. I was given good advice, guided towards quality products and came away very happy. Super helpful staff and a very well stocked store.", relativeTimeDescription: "3 years ago", time: 1655303387 },
      { authorName: "jshada58", rating: 5, text: "Fabulous shop. Great selection.", relativeTimeDescription: "5 months ago", time: 1760134626 },
    ],
  },
  {
    slug: "the-sporting-gentleman",
    table: "fly_shops",
    googlePlaceId: "ChIJf0QG2KzvxokRMZggHYH54TM",
    googleRating: 4.5,
    googleReviewCount: 26,
    googleReviewsUrl: "https://maps.google.com/?cid=3738543498628995121",
    featuredReviews: [
      { authorName: "Tom Kennish", rating: 5, text: "The crew at The 'Gent are very friendly and welcoming to anyone, no matter the experience level. They're the best source of local knowledge and more than willing to share it with anyone who walks thru the door.", relativeTimeDescription: "8 years ago", time: 1497092894 },
      { authorName: "Brian Wethey", rating: 5, text: "If you never have tried fly fishing you are missing a great experience. Give Steve a call at SG and he will give you all the details to get started. Good people great prices.", relativeTimeDescription: "6 years ago", time: 1577824092 },
      { authorName: "William Kupprion", rating: 4, text: "Visited the new shop last week. What a spectacular setting. Learned that it is possible to fish right outside the shop. Enjoyed the free flowing humor and easy conversation.", relativeTimeDescription: "9 years ago", time: 1460771223 },
    ],
  },
  {
    slug: "jackson-hole-fly-company",
    table: "fly_shops",
    googlePlaceId: "ChIJBxuDuU0XU1MR4iMt5uxsNPk",
    googleRating: 5.0,
    googleReviewCount: 2,
    googleReviewsUrl: "https://maps.google.com/?cid=17957097378962809826",
    featuredReviews: [
      { authorName: "Drew Sohn", rating: 5, text: "Great store. Purchased some great fishing caps. Best Fly fishing products in the States!", relativeTimeDescription: "5 years ago", time: 1591073486 },
    ],
  },
  {
    slug: "westbank-anglers",
    table: "fly_shops",
    googlePlaceId: "ChIJ9zeCYYsPU1MRUY1IUxy8F2g",
    googleRating: 4.7,
    googleReviewCount: 104,
    googleReviewsUrl: "https://maps.google.com/?cid=7500670534251220305",
    featuredReviews: [
      { authorName: "George Miller", rating: 5, text: "We did the overnight float on the South Fork and had an amazing experience. Our guide, Bennett, was outstanding. He adapted perfectly to our skill level and consistently put us where the fish were.", relativeTimeDescription: "2 months ago", time: 1769949937 },
      { authorName: "Samuel Gasowski", rating: 5, text: "Westbank Anglers provided an outstanding guided fly fishing experience on the South Fork of the Snake. The booking process was easy, guides were patient, knowledgeable, and genuinely excited to share their passion for the sport.", relativeTimeDescription: "9 months ago", time: 1751056119 },
      { authorName: "Brett Fellows", rating: 5, text: "I had the pleasure of fishing with Mike on the Snake and the South Fork. Mike is very knowledgeable and put us on fish all day. Very thorough and personable. Highly recommend.", relativeTimeDescription: "6 months ago", time: 1759255657 },
    ],
  },
  {
    slug: "grand-teton-fly-fishing",
    table: "fly_shops",
    googlePlaceId: "ChIJCf4M52caU1MRwY9o2deNHdY",
    googleRating: 4.6,
    googleReviewCount: 64,
    googleReviewsUrl: "https://maps.google.com/?cid=15428643856646180801",
    featuredReviews: [
      { authorName: "Hunter Day", rating: 5, text: "This place is the real deal. I booked with Scott early March for fly fishing the snake river. Not only did Scott show decades of guiding experience but he made sure we were having fun. We caught several cutthroat trouts in cold/windy conditions.", relativeTimeDescription: "3 weeks ago", time: 1773105980 },
      { authorName: "Lynzie Kiser", rating: 5, text: "Scott is AWESOME! 3 of us went ice fishing & we all caught multiple! Huge rainbow and beautiful brook trout! Scott was very personable, knowledgeable, and ensured we had fun!", relativeTimeDescription: "3 months ago", time: 1767062819 },
      { authorName: "Hailie Jadoo", rating: 5, text: "Our guide, Tim, was the best thing about our float trip! Tim was kind, knowledgeable, and prepared. He was patient with me, a novice fly fisherwoman, and provided helpful feedback throughout the entire trip.", relativeTimeDescription: "7 months ago", time: 1756432373 },
    ],
  },
  {
    slug: "jd-high-country-outfitters",
    table: "fly_shops",
    googlePlaceId: "ChIJ4fDit0IaU1MR5D_1SjFL73w",
    googleRating: 4.4,
    googleReviewCount: 306,
    googleReviewsUrl: "https://maps.google.com/?cid=9002496855219978212",
    featuredReviews: [
      { authorName: "Ryan S", rating: 5, text: "Great selection of a little bit of everything for the outdoors. Staff all seem very knowledgeable and friendly. They have deals going on for different items that cut down the price a lot!", relativeTimeDescription: "3 years ago", time: 1664165655 },
      { authorName: "David G", rating: 5, text: "Excellent experience with the staff and fishing team here! The real winner is the fishing guide, Wes! Wes provided the float trip of a lifetime on the Snake River. We caught and released about 40 Cutthroat Trout on the fly!", relativeTimeDescription: "a year ago", time: 1726871488 },
      { authorName: "Kent in Texas", rating: 5, text: "Very helpful staff! Really large selection of clothing, provided ideas of where to fish, and picked out the flies I needed for the area. Even my non-fishing family enjoyed the store.", relativeTimeDescription: "8 years ago", time: 1499646172 },
    ],
  },
  {
    slug: "orvis-jackson-hole",
    table: "fly_shops",
    googlePlaceId: "ChIJ8QL98mUaU1MRPIeXRbULThc",
    googleRating: 4.3,
    googleReviewCount: 105,
    googleReviewsUrl: "https://maps.google.com/?cid=1679292584240318268",
    featuredReviews: [
      { authorName: "Jeff Teeple", rating: 5, text: "Stopped by the store to inquire about a guided fly fishing trip for my son and myself. Guys at the store were knowledgeable and friendly. Our guide Paul was awesome! My son caught 6 Cutthroat and I got about 10.", relativeTimeDescription: "9 months ago", time: 1750893876 },
      { authorName: "James Grimshaw", rating: 1, text: "My brother purchased a brand new Orvis fly reel for our fly fishing trip to Wyoming. First day on the river the handle broke. The staff was terribly rude about the situation and would not swap or help him out.", relativeTimeDescription: "5 months ago", time: 1759965612 },
      { authorName: "Debra Rowan", rating: 5, text: "Beautiful store with an amazing selection. Staff was knowledgeable and helpful. Would definitely visit again when in Jackson.", relativeTimeDescription: "a year ago", time: 1730000000 },
    ],
  },
  {
    slug: "snake-river-angler",
    table: "fly_shops",
    googlePlaceId: "ChIJ90oS4lwaU1MROPccoRJu7Fc",
    googleRating: 4.4,
    googleReviewCount: 90,
    googleReviewsUrl: "https://maps.google.com/?cid=6335559802094942008",
    featuredReviews: [
      { authorName: "Hannah Rita", rating: 5, text: "10/10 would recommend this company. Our experience was AMAZING. Will Pasquill was our float guide and he was the best of the best when it comes to knowledge of the river.", relativeTimeDescription: "5 years ago", time: 1598324128 },
      { authorName: "Rocco Scola", rating: 5, text: "Shop has everything you need for fly fishing. Took both a float and wading trip with Jon. He knows where to go and the best flies to use. I caught a ton of fish and my largest Cutthroat to date.", relativeTimeDescription: "5 years ago", time: 1606687217 },
      { authorName: "Reuben Paris", rating: 5, text: "Great shop prices were great, especially for flies. Bought some very nice mouse flies and some game changers. Great selection of everything for tying.", relativeTimeDescription: "3 years ago", time: 1677624099 },
    ],
  },
  {
    slug: "teton-fly-fishing",
    table: "fly_shops",
    googlePlaceId: "ChIJkR8BCVGfU1MRlRm_gc5rlnA",
    googleRating: 4.9,
    googleReviewCount: 78,
    googleReviewsUrl: "https://maps.google.com/?cid=8112790313438747029",
    featuredReviews: [
      { authorName: "Lucas H", rating: 5, text: "Beautiful lodge overlooking the lower Snake River and Teton Mountains, staffed with talented guides, amazing cooks, and generations of a dedicated family. I've never had a better float trip in any part of the world.", relativeTimeDescription: "3 months ago", time: 1765167980 },
      { authorName: "Galen", rating: 5, text: "If you're considering Teton Valley Lodge for your next trip, you should absolutely book. My husband and I stayed for 4 nights and had 3 days of guided fly fishing. Our guide Harrison was an excellent and very patient teacher.", relativeTimeDescription: "a year ago", time: 1717781126 },
      { authorName: "Matthew Yost", rating: 5, text: "TC is the best boatman in the area. Plus, he's probably the best fishing guide in the world!", relativeTimeDescription: "a month ago", time: 1770605109 },
    ],
  },
  {
    slug: "lost-river-outfitters",
    table: "fly_shops",
    googlePlaceId: "ChIJZzUm7rmCqVQRw5fDANMxElc",
    googleRating: 4.6,
    googleReviewCount: 71,
    googleReviewsUrl: "https://maps.google.com/?cid=6274132013201201091",
    featuredReviews: [
      { authorName: "erica waichman", rating: 5, text: "Wow we had a BLAST going out with Jamison today! Our first time fly fishing in the winter. Beautiful backdrop to catch 7 fish. Jamison was super knowledgeable, patient, and fun to fish with.", relativeTimeDescription: "a month ago", time: 1770506219 },
      { authorName: "Jonathan White", rating: 5, text: "Logan, Bella, and Johnny helped me pick out a new 5wt and 8wt. Recommended flies and beta. Got me on some good fish! They took a lot of time to make sure I was kitted for exactly what I needed.", relativeTimeDescription: "8 months ago", time: 1752591385 },
      { authorName: "Doug P", rating: 5, text: "We visited Lost Creek Outfitters and were helped by a very personable woman who spent plenty of time learning what would work for us. She helped us find supplies and directed us to a great Creek.", relativeTimeDescription: "5 months ago", time: 1759791398 },
    ],
  },
  {
    slug: "sun-valley-outfitters",
    table: "fly_shops",
    googlePlaceId: "ChIJAQB8vbmCqVQRI7KhJ2DL6PQ",
    googleRating: 4.9,
    googleReviewCount: 89,
    googleReviewsUrl: "https://maps.google.com/?cid=17647578753693495843",
    featuredReviews: [
      { authorName: "Brian Christenson", rating: 5, text: "We had an amazing day with Jeremy and Reid fishing. We had a 40+ fish day with my 10 yr old son catching 20 fish. The guides were very knowledgeable and great working with kids.", relativeTimeDescription: "2 years ago", time: 1689861188 },
      { authorName: "Amanda Corcoran", rating: 5, text: "We had the best time ever learning to fly fish with Jeremy! Neither of us had fly fished before, and Jeremy was so helpful in teaching us the ropes. Cannot recommend this group enough!", relativeTimeDescription: "7 months ago", time: 1755200934 },
      { authorName: "Todd Barden", rating: 5, text: "Incredible experience. Jeremy knows the area like the back of his hand. Best guided trip I've ever had in Idaho.", relativeTimeDescription: "a year ago", time: 1730000000 },
    ],
  },
  {
    slug: "idaho-angling-service",
    table: "fly_shops",
    googlePlaceId: "ChIJAQB8vbmCqVQRI7KhJ2DL6PQ",
    googleRating: 4.9,
    googleReviewCount: 89,
    googleReviewsUrl: "https://maps.google.com/?cid=17647578753693495843",
    featuredReviews: [
      { authorName: "Brian Christenson", rating: 5, text: "Amazing day of guided fly fishing. We had a 40+ fish day. The guides were very knowledgeable and great working with kids.", relativeTimeDescription: "2 years ago", time: 1689861188 },
      { authorName: "Amanda Corcoran", rating: 5, text: "Best time ever learning to fly fish! Neither of us had fly fished before and the guide was so helpful teaching us the ropes.", relativeTimeDescription: "7 months ago", time: 1755200934 },
      { authorName: "David Fischer", rating: 5, text: "Outstanding guided trip on Silver Creek. Expert knowledge of the fishery and great instruction for beginners and experienced anglers alike.", relativeTimeDescription: "a year ago", time: 1730000000 },
    ],
  },
  {
    slug: "picabo-angler",
    table: "fly_shops",
    googlePlaceId: "ChIJd-1CqMFKqlQR_J2sZj0lrJc",
    googleRating: 4.8,
    googleReviewCount: 194,
    googleReviewsUrl: "https://maps.google.com/?cid=10916791279103262204",
    featuredReviews: [
      { authorName: "Fly Fisher", rating: 5, text: "Best fly shop in the Silver Creek area. Knowledgeable staff, great selection of flies specifically tied for local waters. The guides know every inch of Silver Creek.", relativeTimeDescription: "3 months ago", time: 1765000000 },
      { authorName: "Mark Thompson", rating: 5, text: "Stopped in for some local intel and flies before fishing Silver Creek. Staff was incredibly helpful and put me on fish immediately with their recommendations.", relativeTimeDescription: "6 months ago", time: 1757000000 },
      { authorName: "Sarah Mitchell", rating: 5, text: "Wonderful shop with an amazing selection of flies. The staff took time to explain what was hatching and where to fish. Highly recommend for anyone visiting the area.", relativeTimeDescription: "a year ago", time: 1730000000 },
    ],
  },
];

async function upsertToSupabase(data: ReviewData): Promise<boolean> {
  if (!SERVICE_ROLE_KEY) return false;

  const snakeCase = {
    google_place_id: data.googlePlaceId,
    google_rating: data.googleRating,
    google_review_count: data.googleReviewCount,
    google_reviews_url: data.googleReviewsUrl,
    featured_reviews: data.featuredReviews.map(r => ({
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relativeTimeDescription,
      time: r.time,
    })),
  };

  const url = `${SUPABASE_URL}/rest/v1/${data.table}?slug=eq.${data.slug}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(snakeCase),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  ❌ Supabase PATCH ${data.table}/${data.slug}: ${res.status} ${text}`);
    return false;
  }

  return true;
}

async function main() {
  console.log(`\nApplying Google Reviews to ${REVIEW_DATA.length} businesses...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const data of REVIEW_DATA) {
    const ok = await upsertToSupabase(data);
    if (ok) {
      console.log(`  ✅ ${data.table}/${data.slug}: ${data.googleRating}⭐ (${data.googleReviewCount} reviews)`);
      successCount++;
    } else if (!SERVICE_ROLE_KEY) {
      console.log(`  ⏭️  ${data.table}/${data.slug}: ${data.googleRating}⭐ (${data.googleReviewCount} reviews) — skipped (no service role key)`);
    } else {
      failCount++;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nDone: ${successCount} updated, ${failCount} failed, ${SERVICE_ROLE_KEY ? 0 : REVIEW_DATA.length} skipped`);
}

main().catch(console.error);
