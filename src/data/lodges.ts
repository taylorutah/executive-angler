import type { Lodge } from "@/types/entities";

export const lodges: Lodge[] = [
  {
    id: "lodge-firehole-ranch",
    slug: "firehole-ranch",
    name: "Firehole Ranch",
    destinationId: "dest-montana",
    description:
      "Firehole Ranch is one of the most exclusive and celebrated fly fishing lodges in the American West, situated on the shores of Hebgen Lake just minutes from the western entrance to Yellowstone National Park. The ranch has been welcoming discerning anglers for decades, offering an intimate, all-inclusive experience that combines world-class guided fly fishing with the understated luxury of a premier wilderness retreat. With direct access to the Madison, Gallatin, and Yellowstone rivers as well as the waters inside Yellowstone Park, guests at Firehole Ranch can fish a different piece of legendary water each day of their stay without ever driving more than an hour from the lodge.\n\nThe accommodations at Firehole Ranch reflect a philosophy of refined rustic elegance. Individual log cabins are thoughtfully appointed with handcrafted furniture, stone fireplaces, and private porches overlooking the lake and surrounding mountains. The culinary program features gourmet meals prepared with locally sourced ingredients, served family-style in the historic main lodge where anglers share stories of the day's fishing over fine wine and craft cocktails. The guiding staff represents some of the most experienced and knowledgeable fly fishing professionals in Montana, capable of tailoring each day's outing to the interests and ability of every guest, whether that means technical dry fly fishing on a spring creek or casting streamers from a drift boat for trophy brown trout.\n\nBeyond the fishing, Firehole Ranch offers horseback riding, hiking, wildlife viewing, and relaxation in a setting of extraordinary natural beauty. The ranch's location at the doorstep of Yellowstone provides opportunities to explore the park's geothermal features, observe grizzly bears and wolves, and experience one of America's greatest natural treasures. For the angler seeking a complete Montana experience that extends well beyond the river, Firehole Ranch delivers at the highest level.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80", // PLACEHOLDER
    ],
    websiteUrl: "https://www.fireholeranch.com",
    latitude: 44.7106,
    longitude: -111.3475,
    priceRange: "$1,500-2,500/night",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "October",
    capacity: 20,
    amenities: [
      "Guided fly fishing",
      "All meals included",
      "Private waters",
      "Fly shop",
      "Casting instruction",
      "Horseback riding",
      "Wildlife viewing",
      "Individual log cabins",
      "Wine and cocktail service",
      "Yellowstone Park access",
    ],
    nearbyRiverIds: ["river-madison", "river-gallatin"],
    averageRating: 4.9,
    reviewCount: 47,
    metaTitle: "Firehole Ranch | Premier Montana Fly Fishing Lodge",
    metaDescription:
      "Firehole Ranch near West Yellowstone offers world-class guided fly fishing, luxury accommodations, and all-inclusive dining on the doorstep of Yellowstone National Park.",
    featured: true,
  },
  {
    id: "lodge-lone-mountain-ranch",
    slug: "lone-mountain-ranch",
    name: "Lone Mountain Ranch",
    destinationId: "dest-montana",
    description:
      "Lone Mountain Ranch is a historic Montana dude ranch that has seamlessly blended its Western heritage with a dedicated fly fishing program, creating one of the most versatile and family-friendly fishing lodge experiences in the state. Located in the Big Sky area at the base of Lone Mountain, the ranch provides easy access to the Gallatin River's canyon section as well as guided trips to the Madison, Yellowstone, and other nearby waters. The fishing program caters to all skill levels, from complete beginners taking their first casting lessons on the ranch's private pond to experienced anglers looking for expert guiding on technical water.\n\nThe ranch's accommodations range from historic log cabins to more modern lodge rooms, all set against a breathtaking backdrop of mountain peaks and alpine meadows. The dining program emphasizes farm-to-table cuisine, and the ranch offers a full calendar of activities beyond fishing, including horseback riding, mountain biking, hiking, and a renowned naturalist program that explores the ecology and wildlife of the Greater Yellowstone Ecosystem. For anglers traveling with non-fishing partners or families, Lone Mountain Ranch provides the ideal balance of serious fly fishing opportunity and broader mountain vacation experiences.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80", // PLACEHOLDER
    ],
    websiteUrl: "https://www.lonemountainranch.com",
    latitude: 45.2617,
    longitude: -111.3964,
    priceRange: "$800-1,500/night",
    priceTier: 4,
    seasonStart: "June",
    seasonEnd: "September",
    capacity: 80,
    amenities: [
      "Guided fly fishing",
      "Horseback riding",
      "All meals included",
      "Spa",
      "Family friendly",
      "Casting instruction",
      "Mountain biking",
      "Hiking",
      "Naturalist program",
      "Private fishing pond",
    ],
    nearbyRiverIds: ["river-gallatin", "river-madison", "river-yellowstone"],
    averageRating: 4.7,
    reviewCount: 112,
    metaTitle: "Lone Mountain Ranch | Big Sky Montana Fly Fishing & Guest Ranch",
    metaDescription:
      "Lone Mountain Ranch in Big Sky, Montana offers guided fly fishing, horseback riding, and luxury accommodations in the heart of the Greater Yellowstone Ecosystem.",
    featured: true,
  },
  {
    id: "lodge-craig-montana-lodge",
    slug: "craig-montana-lodge",
    name: "Craig Montana Lodge",
    destinationId: "dest-montana",
    description:
      "Craig Montana Lodge provides comfortable, angler-focused accommodations in the small town of Craig, the epicenter of Missouri River tailwater fly fishing. Positioned within walking distance of the river and local fly shops, the lodge caters specifically to fly fishers seeking proximity to one of the finest tailwater trout fisheries in the world. Simple, clean rooms and a communal atmosphere make it a popular base camp for guided float trips on the Missouri.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 46.9333,
    longitude: -112.05,
    priceRange: "$200-400/night",
    priceTier: 2,
    seasonStart: "March",
    seasonEnd: "November",
    capacity: 24,
    amenities: [
      "River proximity",
      "Gear storage",
      "Guided trip coordination",
      "Communal kitchen",
      "Fly tying stations",
    ],
    nearbyRiverIds: ["river-missouri"],
    averageRating: 4.3,
    reviewCount: 28,
    metaTitle: "Craig Montana Lodge | Missouri River Fishing Accommodations",
    metaDescription:
      "Angler-focused lodging in Craig, Montana, steps from the legendary Missouri River tailwater. Comfortable rooms and easy access to world-class trout fishing.",
    featured: false,
  },
];
