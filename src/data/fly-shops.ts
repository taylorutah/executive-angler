import type { FlyShop } from "@/types/entities";

export const flyShops: FlyShop[] = [
  {
    id: "shop-blue-ribbon-flies",
    slug: "blue-ribbon-flies",
    name: "Blue Ribbon Flies",
    destinationId: "dest-montana",
    description:
      "Blue Ribbon Flies is one of the most respected and iconic fly shops in the American West, occupying a prime corner on Canyon Street in West Yellowstone, Montana, since 1982. Founded by Craig Mathews, a former Yellowstone National Park ranger turned fly fishing innovator, the shop has earned a reputation that extends far beyond its small-town storefront. Craig Mathews is the co-creator of the Sparkle Dun, X-Caddis, and Zelon series of fly patterns that have become staples in fly boxes across the world, and his approach to fly design, grounded in careful observation of natural insect behavior, permeates the shop's entire philosophy.\n\nBlue Ribbon Flies is far more than a retail store. It serves as a nerve center for fishing information in the Greater Yellowstone region, with staff members who spend their mornings on the water and their afternoons behind the counter, offering firsthand reports on current conditions across dozens of rivers, streams, and lakes. The shop's guided trip program connects visiting anglers with a handpicked roster of experienced local guides, while the fly selection, largely tied in-house or by regional tiers, reflects the specific patterns and sizes that are working on local waters that week. The rod repair service handles everything from broken tips to full rebuilds, and the fly tying materials department is one of the most comprehensive in the region. For any angler visiting West Yellowstone, a stop at Blue Ribbon Flies is not optional; it is the essential first step to a successful trip.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80", // PLACEHOLDER
    address: "315 Canyon St, West Yellowstone, MT 59758",
    latitude: 44.6621,
    longitude: -111.1001,
    phone: "(406) 646-7642",
    websiteUrl: "https://www.blue-ribbon-flies.com",
    hours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "7:00 AM - 7:00 PM",
      sunday: "7:00 AM - 6:00 PM",
      notes: "Summer hours (June-September). Reduced hours in off-season. Call ahead.",
    },
    services: [
      "Guided fly fishing trips",
      "Fly fishing gear and apparel",
      "Fly tying supplies and materials",
      "Rod repair",
      "Daily fishing reports",
      "Casting instruction",
      "Trip planning assistance",
      "Custom fly selection",
    ],
    brandsCarried: [
      "Simms",
      "Sage",
      "Scott",
      "Rio",
      "Scientific Anglers",
      "Umpqua",
      "Whiting Farms",
      "Renzetti",
      "Dr. Slick",
      "Fishpond",
    ],
    metaTitle: "Blue Ribbon Flies | West Yellowstone Fly Shop",
    metaDescription:
      "Blue Ribbon Flies in West Yellowstone, Montana. Iconic fly shop offering guided trips, expert advice, fly tying supplies, and daily fishing reports since 1982.",
  },
  {
    id: "shop-montana-troutfitters",
    slug: "montana-troutfitters-shop",
    name: "Montana Troutfitters",
    destinationId: "dest-montana",
    description:
      "Montana Troutfitters is a full-service fly shop and guide outfitter located on Main Street in downtown Bozeman, Montana. Serving as the retail counterpart to their well-known guide service, the shop provides a comprehensive selection of fly fishing gear, flies, and accessories tailored to the rivers of southwestern Montana. The knowledgeable staff offers detailed fishing reports, trip planning advice, and expert fly recommendations for the Gallatin, Yellowstone, Madison, and other nearby waters.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&q=80", // PLACEHOLDER
    address: "1716 W Main St, Bozeman, MT 59715",
    latitude: 45.6789,
    longitude: -111.0567,
    phone: "(406) 587-4707",
    websiteUrl: "https://www.troutfitters.com",
    hours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "8:00 AM - 6:00 PM",
      sunday: "9:00 AM - 5:00 PM",
      notes: "Year-round hours. Extended summer hours possible.",
    },
    services: [
      "Guided fly fishing trips",
      "Fly fishing gear and apparel",
      "Fly tying supplies",
      "Daily fishing reports",
      "Trip planning",
      "Casting lessons",
    ],
    brandsCarried: [
      "Simms",
      "Sage",
      "Orvis",
      "Rio",
      "Scientific Anglers",
      "Redington",
      "Fishpond",
      "Umpqua",
    ],
    metaTitle: "Montana Troutfitters Fly Shop | Bozeman, Montana",
    metaDescription:
      "Montana Troutfitters fly shop in Bozeman, MT. Full-service shop with guided trips, gear, flies, and expert advice for fishing the Gallatin, Yellowstone, and Madison rivers.",
  },
];
