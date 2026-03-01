import type { River } from "@/types/entities";

export const rivers: River[] = [
  {
    id: "river-madison",
    slug: "madison-river",
    name: "Madison River",
    destinationId: "dest-montana",
    description:
      "The Madison River is the crown jewel of Montana fly fishing and one of the most storied trout streams in the world. Born at the confluence of the Firehole and Gibbon rivers in the heart of Yellowstone National Park, the Madison flows north and west through three distinct sections, each offering a fundamentally different fishing experience. The upper Madison inside Yellowstone Park provides easy wading on broad, shallow riffles with abundant rainbow trout and the occasional brown. Between Hebgen Lake and Quake Lake, the river takes on a tailwater character with cooler temperatures and larger fish. Below Quake Lake, the river enters the famous fifty-mile riffle that defines Madison River fishing for most anglers, a continuous stretch of fast, productive water that rarely exceeds chest depth and holds staggering numbers of rainbow and brown trout.\n\nThe lower Madison below Ennis Lake, flowing through the dramatic Beartrap Canyon before joining the Jefferson and Gallatin to form the Missouri River at Three Forks, offers a completely different experience. The canyon section is remote, rugged, and holds trophy-sized brown trout that see very little pressure. Between Ennis and the canyon, the broad valley section known as the lower Madison provides outstanding hopper fishing in summer and consistent nymphing through the shoulder seasons. The river's annual salmonfly hatch in late May and early June is one of the great spectacles in American fly fishing, as enormous stoneflies blanket the water and even the largest, most wary trout abandon caution to feed on these protein-rich insects.\n\nWhat makes the Madison truly special is its accessibility and its forgiving nature. The river's broad, relatively uniform depth makes it ideal for wade fishing, and its aggressive trout population rewards good technique without demanding the hair-fine tippets and perfect presentations required on technical spring creeks. Whether drifting dry flies through the riffles on a July afternoon, swinging soft hackles through the evening caddis hatch, or bouncing nymphs along the bottom during a March bluebird day, the Madison delivers consistent, high-quality fly fishing throughout its long season. It is the river that has introduced more anglers to Montana fly fishing than any other, and it continues to earn its reputation as one of the finest trout streams on Earth.",
    heroImageUrl: "/images/madison-river-three-dollar-bridge.jpg",
    thumbnailUrl: "/images/madison-river-three-dollar-bridge.jpg",
    lengthMiles: 183,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Mountain Whitefish"],
    regulations:
      "Check Montana FWP for current regulations. Catch-and-release on sections. Barbless hooks recommended. Specific gear restrictions apply on certain sections. The section inside Yellowstone National Park requires a separate Yellowstone fishing permit.",
    accessPoints: [
      {
        name: "Quake Lake",
        latitude: 44.8406,
        longitude: -111.4261,
        description:
          "Upper access near the slide. Walk-in only. Rugged terrain but excellent fishing in a less-pressured area.",
        parking: true,
      },
      {
        name: "Lyons Bridge FAS",
        latitude: 44.9383,
        longitude: -111.5906,
        description:
          "Popular put-in for float trips. Boat ramp and parking. Good wade access upstream and downstream of the bridge.",
        parking: true,
      },
      {
        name: "McAtee Bridge FAS",
        latitude: 45.0833,
        longitude: -111.65,
        description:
          "Good wade access with parking available. A solid midpoint access for both float and wade anglers working the upper sections.",
        parking: true,
      },
      {
        name: "Varney Bridge FAS",
        latitude: 45.2083,
        longitude: -111.6833,
        description:
          "Major access point for both float and wade fishing. Popular takeout for upper float trips and launch point for the lower section to Ennis.",
        parking: true,
      },
      {
        name: "Ennis Bridge FAS",
        latitude: 45.35,
        longitude: -111.7333,
        description:
          "Town of Ennis access. Good wade fishing both upstream and downstream. Close to shops and services in town.",
        parking: true,
      },
      {
        name: "Valley Garden FAS",
        latitude: 45.4167,
        longitude: -111.75,
        description:
          "Lower Madison access below Ennis. Good wade fishing with easier wading than the upper sections. Less pressure than bridge access points.",
        parking: true,
      },
      {
        name: "Beartrap Canyon",
        latitude: 45.5167,
        longitude: -111.65,
        description:
          "Remote canyon section. Advanced anglers only. No boat access. Steep hike in with challenging terrain but outstanding fishing for large brown trout.",
        parking: false,
      },
    ],
    bestMonths: [
      "June",
      "July",
      "August",
      "September",
      "October",
    ],
    latitude: 45.1,
    longitude: -111.65,
    mapBounds: {
      sw: [44.8, -111.8],
      ne: [45.6, -111.3],
    },
    hatchChart: [
      {
        month: "March",
        hatches: [
          {
            insect: "Blue-winged Olive (Baetis)",
            size: "#16-20",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
          {
            insect: "Midges",
            size: "#18-22",
            pattern: "Zebra Midge, Griffith's Gnat, Mercury Midge",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "April",
        hatches: [
          {
            insect: "Blue-winged Olive (Baetis)",
            size: "#16-20",
            pattern: "Parachute BWO, Pheasant Tail, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
          {
            insect: "Midges",
            size: "#18-22",
            pattern: "Zebra Midge, Griffith's Gnat",
            timeOfDay: "morning",
            intensity: "moderate",
          },
          {
            insect: "March Brown",
            size: "#10-14",
            pattern: "March Brown Nymph, March Brown Emerger",
            timeOfDay: "afternoon",
            intensity: "sparse",
          },
        ],
      },
      {
        month: "May",
        hatches: [
          {
            insect: "Mother's Day Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis, Goddard Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Salmonfly",
            size: "#4-8",
            pattern: "Chubby Chernobyl, Pat's Rubber Legs, Norm Wood Special",
            timeOfDay: "late May, all day",
            intensity: "heavy",
          },
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "morning",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Salmonfly",
            size: "#4-8",
            pattern: "Chubby Chernobyl, Pat's Rubber Legs, Norm Wood Special",
            timeOfDay: "all day, early June",
            intensity: "heavy",
          },
          {
            insect: "Golden Stonefly",
            size: "#6-10",
            pattern: "Yellow Stimulator, Golden Stone Nymph, Yellow Sally",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Pale Morning Dun (PMD)",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple, Pheasant Tail",
            timeOfDay: "morning to early afternoon",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, Peacock Caddis, CDC Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Pale Morning Dun (PMD)",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple, Pheasant Tail",
            timeOfDay: "morning",
            intensity: "moderate",
          },
          {
            insect: "Yellow Sally Stonefly",
            size: "#14-16",
            pattern: "Yellow Sally, Yellow Stimulator",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
          {
            insect: "Trico",
            size: "#18-22",
            pattern: "Trico Spinner, Trico Dun, Parachute Trico",
            timeOfDay: "early morning spinner fall",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "evening",
            intensity: "moderate",
          },
          {
            insect: "Hoppers",
            size: "#8-12",
            pattern: "Chubby Chernobyl, Morrish Hopper, Dave's Hopper",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "August",
        hatches: [
          {
            insect: "Hoppers",
            size: "#6-12",
            pattern: "Chubby Chernobyl, Morrish Hopper, Dave's Hopper, Parachute Hopper",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Trico",
            size: "#18-22",
            pattern: "Trico Spinner, CDC Trico",
            timeOfDay: "early morning",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, Goddard Caddis",
            timeOfDay: "evening",
            intensity: "moderate",
          },
          {
            insect: "Ants and Beetles",
            size: "#14-18",
            pattern: "Fur Ant, Flying Ant, Foam Beetle, Crowe Beetle",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Blue-winged Olive (Baetis)",
            size: "#16-20",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Hoppers (fading)",
            size: "#10-14",
            pattern: "Chubby Chernobyl, Morrish Hopper",
            timeOfDay: "warm afternoons",
            intensity: "sparse",
          },
          {
            insect: "October Caddis",
            size: "#6-10",
            pattern: "Orange Stimulator, October Caddis, Goddard Caddis",
            timeOfDay: "late afternoon to evening",
            intensity: "moderate",
          },
          {
            insect: "Mahogany Dun",
            size: "#14-16",
            pattern: "Mahogany Dun, Mahogany Sparkle Dun, Pheasant Tail",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "October",
        hatches: [
          {
            insect: "Blue-winged Olive (Baetis)",
            size: "#16-20",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "October Caddis",
            size: "#6-10",
            pattern: "Orange Stimulator, October Caddis Pupa",
            timeOfDay: "afternoon to evening",
            intensity: "moderate",
          },
          {
            insect: "Midges",
            size: "#18-22",
            pattern: "Zebra Midge, Griffith's Gnat, Mercury Midge",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "November",
        hatches: [
          {
            insect: "Blue-winged Olive (Baetis)",
            size: "#18-22",
            pattern: "Parachute BWO, RS2, WD-40",
            timeOfDay: "midday on warmer days",
            intensity: "sparse",
          },
          {
            insect: "Midges",
            size: "#20-24",
            pattern: "Zebra Midge, Mercury Midge, Griffith's Gnat",
            timeOfDay: "late morning to afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Madison River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Complete guide to fly fishing the Madison River in Montana. Access points, hatch charts, best flies, and tips for this legendary trout stream.",
    featured: true,
  },
  {
    id: "river-gallatin",
    slug: "gallatin-river",
    name: "Gallatin River",
    destinationId: "dest-montana",
    description:
      "The Gallatin River is a fly fishing gem that carves its way through one of Montana's most dramatic canyons before emerging into the broad Gallatin Valley near Bozeman. Originating in Yellowstone National Park at Gallatin Lake, the river flows northwest through the Gallatin Canyon, a steep-walled corridor flanked by towering peaks where the rushing water tumbles over boulders and through pocket water that holds eager cutthroat, rainbow, and brown trout. This canyon section is almost exclusively wade-fishing water, and the intimate scale of the river makes it an outstanding dry fly stream where a well-placed Elk Hair Caddis or Stimulator dropped into the foam line behind a boulder can produce explosive strikes from trout that have only a split second to decide before the current sweeps the fly away.\n\nBelow the canyon, the Gallatin enters a broad agricultural valley where the river slows, widens, and takes on a different character. The lower Gallatin holds larger brown trout that are best targeted with nymphs and streamers, particularly during the fall months when spawning browns become more aggressive. The river's proximity to Big Sky Resort and Bozeman makes it one of the most accessible quality trout streams in Montana, yet the canyon section's roadside access means that anglers who hike even a short distance from pullouts can find themselves fishing in relative solitude with stunning mountain scenery as their backdrop.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80", // PLACEHOLDER
    lengthMiles: 120,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "wade",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
    regulations:
      "Check Montana FWP for current regulations. Some sections have catch-and-release restrictions. The section within Yellowstone National Park requires a separate park fishing permit.",
    accessPoints: [
      {
        name: "Greek Creek Campground",
        latitude: 45.3833,
        longitude: -111.2333,
        description:
          "Upper canyon access with good pocket water. Campground parking and short walks to prime water.",
        parking: true,
      },
      {
        name: "Moose Creek Flat",
        latitude: 45.45,
        longitude: -111.25,
        description:
          "Mid-canyon access point. Excellent wade fishing in a section with a good mix of pools and riffles.",
        parking: true,
      },
      {
        name: "Gallatin Gateway (Squaw Creek Bridge)",
        latitude: 45.5667,
        longitude: -111.2333,
        description:
          "Lower canyon access near Gallatin Gateway. Good water for both dry flies and nymphs. Easy roadside parking.",
        parking: true,
      },
    ],
    bestMonths: [
      "June",
      "July",
      "August",
      "September",
      "October",
    ],
    latitude: 45.4833,
    longitude: -111.2167,
    mapBounds: {
      sw: [45.2, -111.4],
      ne: [45.7, -111.0],
    },
    metaTitle: "Gallatin River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Fly fishing the Gallatin River in Montana. Canyon pocket water, access points, and tips for this beautiful freestone trout stream near Big Sky and Bozeman.",
    featured: false,
  },
  {
    id: "river-yellowstone",
    slug: "yellowstone-river",
    name: "Yellowstone River",
    destinationId: "dest-montana",
    description:
      "The Yellowstone River holds the remarkable distinction of being the longest undammed river in the contiguous United States, flowing 692 miles from its headwaters in the Absaroka Range of Wyoming through Yellowstone National Park, north through Paradise Valley, past Livingston, and eventually across the plains of eastern Montana to join the Missouri River near the North Dakota border. For fly anglers, the most prized section is the stretch through Paradise Valley between Yellowstone National Park's northern boundary at Gardiner and the city of Livingston, where the river courses through a broad, spectacular valley flanked by the Absaroka Range to the east and the Gallatin Range to the west. This section holds outstanding populations of Yellowstone cutthroat trout, rainbow trout, and brown trout, with fish averaging 14 to 18 inches and specimens well over 20 inches taken regularly.\n\nThe Yellowstone is primarily a float-fishing river through Paradise Valley, with drift boats providing access to miles of water between public access points. However, productive wade fishing can be found at every bridge and fishing access site, particularly in the braided channels and side channels that form along the valley floor. The river's annual runoff is typically later and more prolonged than other Montana rivers due to the high-elevation snowpack in Yellowstone Park, which means prime dry fly fishing often doesn't begin until mid-July. Once conditions stabilize, though, the Yellowstone rewards anglers with superb hopper fishing through August and September, followed by excellent fall streamer fishing as large brown trout move up from the lower river to spawn. The combination of wild fish, stunning scenery, and the powerful, unrestrained current of an undammed river makes the Yellowstone a bucket-list experience for any serious fly angler.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&q=80", // PLACEHOLDER
    lengthMiles: 692,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Cutthroat Trout", "Rainbow Trout", "Brown Trout"],
    regulations:
      "Check Montana FWP for current regulations. Yellowstone cutthroat trout are catch-and-release only on many sections. The section within Yellowstone National Park requires a separate park fishing permit.",
    accessPoints: [
      {
        name: "Carbella FAS",
        latitude: 45.6667,
        longitude: -110.6167,
        description:
          "Upper Paradise Valley access. Good boat launch and wade access to braided channels with excellent cutthroat fishing.",
        parking: true,
      },
      {
        name: "Mallard's Rest FAS",
        latitude: 45.5833,
        longitude: -110.55,
        description:
          "Mid-valley access with boat ramp. Popular float trip put-in and takeout. Good wade fishing in side channels nearby.",
        parking: true,
      },
      {
        name: "Loch Leven FAS (Emigrant area)",
        latitude: 45.4833,
        longitude: -110.5667,
        description:
          "Near Emigrant, MT. Excellent wade access to productive riffles and runs. Close to Chico Hot Springs for post-fishing relaxation.",
        parking: true,
      },
    ],
    bestMonths: [
      "July",
      "August",
      "September",
      "October",
    ],
    latitude: 45.6,
    longitude: -110.55,
    mapBounds: {
      sw: [45.3, -110.8],
      ne: [45.8, -110.3],
    },
    metaTitle: "Yellowstone River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Fly fishing the Yellowstone River in Montana's Paradise Valley. The longest undammed river in the lower 48 with cutthroat, rainbow, and brown trout.",
    featured: false,
  },
  {
    id: "river-missouri",
    slug: "missouri-river",
    name: "Missouri River",
    destinationId: "dest-montana",
    description:
      "The Missouri River below Holter Dam near the small town of Craig, Montana, is widely regarded as one of the finest tailwater trout fisheries in the world. The dam-controlled flows provide remarkably consistent water temperatures and levels, creating an environment where trout thrive year-round and grow to impressive sizes. This 35-mile stretch from Holter Dam downstream to the town of Cascade produces rainbow and brown trout that average 16 to 18 inches, with fish over 20 inches common and genuine trophies exceeding 24 inches taken each season. The river's rich insect life, fueled by the nutrient-laden waters released from Holter Lake, supports prolific hatches of midges, blue-winged olives, pale morning duns, caddis, and tricos that keep trout looking up throughout the fishing season.\n\nWhat sets the Missouri apart from Montana's freestone rivers is its technical nature. The clear, slow-to-moderate flows and educated trout demand precise presentations, fine tippets, and accurate fly selection, particularly during the prolific midge and trico hatches that draw anglers from across the country. Dry fly fishing here can be both frustrating and extraordinarily rewarding, with pods of large trout sipping tiny insects in flat water requiring delicate casts and drag-free drifts measured in inches. The Missouri is primarily a float-fishing river, with drift boats being the most effective way to cover the long, productive runs, though wade anglers find excellent water near every access point. The tailwater's consistent flows mean the Missouri fishes well earlier in spring and later in fall than most Montana rivers, extending the prime season significantly for visiting anglers.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=400&q=80", // PLACEHOLDER
    lengthMiles: 2341,
    flowType: "tailwater",
    difficulty: "advanced",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout"],
    regulations:
      "Check Montana FWP for current regulations. Specific regulations apply to the tailwater section below Holter Dam. Some sections are catch-and-release only. Barbless hooks recommended.",
    accessPoints: [
      {
        name: "Holter Dam",
        latitude: 46.9833,
        longitude: -112.0333,
        description:
          "Immediately below the dam. Very productive water with heavy insect life. Can be crowded during peak hatches. Boat launch available.",
        parking: true,
      },
      {
        name: "Craig FAS (Craig Bridge)",
        latitude: 46.9333,
        longitude: -112.05,
        description:
          "Town of Craig access. Primary takeout for upper float trips and put-in for lower trips. Good wade fishing upstream and downstream. Fly shops nearby.",
        parking: true,
      },
      {
        name: "Mountain Palace FAS",
        latitude: 46.8833,
        longitude: -112.0167,
        description:
          "Below Craig with good wade access to productive runs and riffles. Less crowded than the Craig and Holter Dam access points.",
        parking: true,
      },
    ],
    bestMonths: [
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
    ],
    latitude: 46.95,
    longitude: -112.05,
    mapBounds: {
      sw: [46.8, -112.2],
      ne: [47.1, -111.9],
    },
    metaTitle: "Missouri River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Fly fishing the Missouri River tailwater near Craig, Montana. One of the world's finest tailwater trout fisheries with trophy rainbows and browns.",
    featured: false,
  },
  {
    id: "river-big-hole",
    slug: "big-hole-river",
    name: "Big Hole River",
    destinationId: "dest-montana",
    description:
      "The Big Hole River is one of Montana's most beloved and ecologically significant trout streams, flowing through the remote and sparsely populated Big Hole Valley in the southwestern part of the state. Known as the River of 10,000 Casts, the Big Hole is the last river in the lower 48 states to support a fluvial population of Arctic grayling, making it a destination of both sporting and conservation importance. The river offers outstanding fishing for brown and rainbow trout, with brook trout found in the upper reaches, and its famous salmonfly hatch in June draws anglers from across the country to fish enormous dry flies to aggressive, bank-feeding trout.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // PLACEHOLDER
    lengthMiles: 155,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: [
      "Brown Trout",
      "Rainbow Trout",
      "Brook Trout",
      "Arctic Grayling",
    ],
    regulations:
      "Check Montana FWP for current Big Hole River regulations. Special regulations protect Arctic grayling. Hoot-owl restrictions may apply during hot summer months to protect fish from warm water stress.",
    accessPoints: [
      {
        name: "Divide Bridge FAS",
        latitude: 45.7667,
        longitude: -112.75,
        description:
          "Good access to the mid-river section near the town of Divide. Boat ramp and wade access.",
        parking: true,
      },
      {
        name: "Maiden Rock FAS",
        latitude: 45.7333,
        longitude: -113.0,
        description:
          "Upper river access with scenic canyon setting. Good wade fishing in pocket water.",
        parking: true,
      },
    ],
    bestMonths: [
      "June",
      "July",
      "August",
      "September",
    ],
    latitude: 45.75,
    longitude: -113.0,
    mapBounds: {
      sw: [45.5, -113.3],
      ne: [46.0, -112.5],
    },
    metaTitle: "Big Hole River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Fly fishing the Big Hole River in Montana. Home to the last fluvial Arctic grayling population in the lower 48 and outstanding trout fishing.",
    featured: false,
  },
];
