import type { Guide } from "@/types/entities";

export const guides: Guide[] = [
  {
    id: "guide-bud-lillys",
    slug: "bud-lillys-guide-service",
    name: "Bud Lilly's Trout Shop Guide Service",
    destinationId: "dest-montana",
    bio:
      "Bud Lilly's Trout Shop is one of the most legendary names in American fly fishing, a West Yellowstone institution that has been at the heart of Montana's fly fishing culture since the 1950s. Founded by Bud Lilly himself, a pioneering angler, conservationist, and guide who is widely credited with helping to popularize catch-and-release fishing in the West, the shop and its guide service have introduced generations of anglers to the extraordinary waters of the Greater Yellowstone Ecosystem. Bud Lilly was among the first outfitters to recognize the tourism potential of Montana's trout streams, and his tireless advocacy for wild trout management and river conservation helped shape the fisheries that draw anglers to the region today.\n\nThe guide service that carries Bud Lilly's name continues to uphold the standards of excellence and river stewardship that he established over seven decades ago. The current team of guides represents some of the most experienced and knowledgeable professionals working the waters of southwestern Montana, with deep expertise across the Madison, Gallatin, and Yellowstone rivers as well as the streams and spring creeks inside Yellowstone National Park. Whether an angler is looking to master the technical art of dry fly fishing on a spring creek, learn euro nymphing techniques in the pocket water of the Gallatin Canyon, or swing streamers for trophy brown trout on the lower Madison, Bud Lilly's guides bring a depth of local knowledge and teaching ability that is second to none.\n\nBeyond guided fishing trips, Bud Lilly's Trout Shop remains a full-service fly shop in West Yellowstone, offering expert advice on current conditions, fly selection, and trip planning. The shop stocks a carefully curated selection of flies, leaders, tippet, and accessories specifically chosen for local waters, and the staff's daily fishing reports are considered essential reading for any angler fishing the region. Booking a guided trip through Bud Lilly's is not just hiring a fishing guide; it is connecting with a living piece of Montana fly fishing history.",
    specialties: [
      "Dry fly fishing",
      "Nymphing",
      "Streamer fishing",
      "Spring creek fishing",
      "Walk-wade trips",
      "Float trips",
      "Yellowstone Park waters",
      "Beginner instruction",
    ],
    yearsExperience: 70,
    photoUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80", // PLACEHOLDER
    websiteUrl: "https://www.budlillys.com",
    riverIds: ["river-madison", "river-gallatin", "river-yellowstone"],
    dailyRate: "$650/day (1-2 anglers)",
    metaTitle: "Bud Lilly's Guide Service | West Yellowstone Fly Fishing Guides",
    metaDescription:
      "Book a guided fly fishing trip with the legendary Bud Lilly's Trout Shop in West Yellowstone, Montana. Over 70 years of guiding excellence on the Madison, Gallatin, and Yellowstone rivers.",
  },
  {
    id: "guide-montana-troutfitters",
    slug: "montana-troutfitters",
    name: "Montana Troutfitters",
    destinationId: "dest-montana",
    bio:
      "Montana Troutfitters is a Bozeman-based guide service and fly shop that has been helping anglers discover the outstanding trout fishing of southwestern Montana for over four decades. Operating from their shop on Main Street in downtown Bozeman, Troutfitters provides guided float and wade trips on the Gallatin, Yellowstone, and Madison rivers, as well as lesser-known streams and spring creeks in the region. Their team of guides combines deep local knowledge with a genuine passion for teaching, making them an excellent choice for anglers of all experience levels.\n\nThe Troutfitters guiding philosophy emphasizes education alongside catching fish. Guides take the time to explain insect identification, reading water, casting technique, and fly selection, ensuring that clients leave each trip as better anglers than when they arrived. Their proximity to the Gallatin Canyon makes them particularly well-suited for anglers looking to wade fish the canyon's beautiful pocket water, while their float trips on the Yellowstone through Paradise Valley are consistently productive and scenic. The shop itself is a hub for fishing information in Bozeman, with detailed daily reports and a knowledgeable staff ready to help visiting anglers plan their time on the water.",
    specialties: [
      "Float trips",
      "Wade fishing",
      "Dry fly fishing",
      "Nymphing",
      "Beginner instruction",
      "Multi-day trip planning",
    ],
    yearsExperience: 40,
    photoUrl:
      "https://images.unsplash.com/photo-1545062080-2167ac0c4d72?w=400&q=80", // PLACEHOLDER
    websiteUrl: "https://www.troutfitters.com",
    riverIds: ["river-gallatin", "river-yellowstone", "river-madison"],
    dailyRate: "$600/day (1-2 anglers)",
    metaTitle: "Montana Troutfitters Guide Service | Bozeman Fly Fishing",
    metaDescription:
      "Guided fly fishing trips from Bozeman, Montana with Montana Troutfitters. Expert guides on the Gallatin, Yellowstone, and Madison rivers.",
  },
];
