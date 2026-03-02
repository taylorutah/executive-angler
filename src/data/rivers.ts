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
  // ==========================================
  // MONTANA — Rock Creek
  // ==========================================
  {
    id: "river-rock-creek",
    slug: "rock-creek",
    name: "Rock Creek",
    destinationId: "dest-montana",
    description:
      "Rock Creek is one of Montana's classic freestone trout streams, flowing for roughly fifty miles through a timbered canyon east of Missoula before joining the Clark Fork River. Unlike the broad, valley-floor rivers of southwestern Montana, Rock Creek is an intimate, medium-sized stream that rewards careful wading and thoughtful fly selection. The creek holds healthy populations of westslope cutthroat trout, rainbow trout, brown trout, and bull trout, and its character shifts dramatically over its length, from tumbling pocket water in the upper reaches to long, glassy pools and sweeping runs in the lower canyon.\n\nWhat sets Rock Creek apart from many Montana rivers is its outstanding dry fly fishing during the skwala stonefly hatch in March and April, one of the earliest significant hatches in the state. When these large, dark stoneflies begin crawling to the banks, trout that have spent months subsisting on midges and nymphs suddenly key on surface food with reckless enthusiasm. The creek also produces excellent caddis hatches in late spring, followed by golden stoneflies and pale morning duns through the summer months. The combination of diverse trout species, varied water types, and a season that begins earlier than most Montana rivers makes Rock Creek an essential addition to any western Montana fishing itinerary. The road that follows the creek provides numerous pullouts and access points, though the best fishing is often found by hiking a short distance away from the most obvious parking areas.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400&q=80", // PLACEHOLDER
    lengthMiles: 52,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "wade",
    primarySpecies: ["Westslope Cutthroat Trout", "Rainbow Trout", "Brown Trout", "Bull Trout"],
    regulations:
      "Check Montana FWP for current regulations. Bull trout are catch-and-release only statewide. Specific gear restrictions may apply. Artificial flies and lures only on some sections.",
    accessPoints: [
      {
        name: "Rock Creek Road Bridge (Lower)",
        latitude: 46.7372,
        longitude: -113.6853,
        description:
          "Lower canyon access near the confluence with the Clark Fork. Easy parking and good wade fishing in deeper runs and pools.",
        parking: true,
      },
      {
        name: "Norton Campground",
        latitude: 46.5917,
        longitude: -113.5611,
        description:
          "Mid-creek access with campground facilities. Excellent pocket water upstream and long runs downstream.",
        parking: true,
      },
      {
        name: "Harry's Flat Campground",
        latitude: 46.4583,
        longitude: -113.4722,
        description:
          "Upper creek access in a more remote, timbered setting. Smaller water with eager cutthroat trout and less angling pressure.",
        parking: true,
      },
    ],
    bestMonths: ["March", "April", "May", "June", "July", "August", "September"],
    latitude: 46.6,
    longitude: -113.55,
    mapBounds: {
      sw: [-113.75, 46.35],
      ne: [-113.35, 46.8],
    },
    hatchChart: [
      {
        month: "March",
        hatches: [
          {
            insect: "Skwala Stonefly",
            size: "#8-10",
            pattern: "Skwala Dry, Olive Stimulator, Rubber Legs",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
          {
            insect: "Midges",
            size: "#18-22",
            pattern: "Zebra Midge, Griffith's Gnat",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "May",
        hatches: [
          {
            insect: "Mother's Day Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Salmonfly",
            size: "#4-8",
            pattern: "Chubby Chernobyl, Pat's Rubber Legs",
            timeOfDay: "all day, late May",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Golden Stonefly",
            size: "#6-10",
            pattern: "Yellow Stimulator, Golden Stone Dry",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, Pheasant Tail",
            timeOfDay: "morning to early afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "August",
        hatches: [
          {
            insect: "Hoppers",
            size: "#8-12",
            pattern: "Chubby Chernobyl, Dave's Hopper",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Ants and Beetles",
            size: "#14-18",
            pattern: "Foam Beetle, Fur Ant",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Rock Creek Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Fly fishing Rock Creek near Missoula, Montana. Classic freestone stream with westslope cutthroat, early skwala hatches, and outstanding canyon scenery.",
    featured: false,
  },
  // ==========================================
  // WYOMING
  // ==========================================
  {
    id: "river-snake-river",
    slug: "snake-river-wyoming",
    name: "Snake River (Wyoming)",
    destinationId: "dest-wyoming",
    description:
      "The Snake River in Wyoming is one of the most visually spectacular fly fishing destinations in the American West, flowing through Grand Teton National Park with the jagged Teton Range rising dramatically above its braided channels. The river's upper section between Jackson Lake Dam and the town of Wilson offers outstanding float fishing for fine-spotted Snake River cutthroat trout, a unique subspecies found only in this drainage. These beautifully marked fish are aggressive surface feeders, and during the prolific summer hatches of pale morning duns, green drakes, and caddis, the Snake provides dry fly fishing that is as good as anything in the Rocky Mountain West.\n\nThe Snake River's braided, multi-channel character creates an ever-shifting mosaic of side channels, gravel bars, and deep pools that provide habitat diversity few rivers can match. Float trips are the primary method of fishing the Snake, as the braided channels make wading difficult and the best water changes with each spring's runoff. The river's flow is heavily influenced by Jackson Lake Dam releases, with the most fishable conditions typically arriving in late June or early July after the spring runoff subsides. From that point through October, anglers enjoy exceptional fishing with the added bonus of encountering moose, bald eagles, osprey, and the occasional grizzly bear along the riverbanks. The Snake's combination of native cutthroat trout, world-class scenery, and abundant wildlife makes it one of the most memorable fly fishing experiences in the entire country.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
    lengthMiles: 60,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "float",
    primarySpecies: ["Snake River Cutthroat Trout", "Brown Trout", "Mountain Whitefish"],
    regulations:
      "Check Wyoming Game and Fish for current regulations. Some sections require barbless hooks. Cutthroat trout regulations vary by section. National Park sections require a free Yellowstone/Teton fishing permit.",
    accessPoints: [
      {
        name: "Deadman's Bar",
        latitude: 43.7833,
        longitude: -110.6333,
        description:
          "Popular put-in for float trips through Grand Teton National Park. Boat ramp with gravel access. Stunning Teton views.",
        parking: true,
      },
      {
        name: "Schwabacher Landing",
        latitude: 43.7167,
        longitude: -110.6667,
        description:
          "Iconic Teton access point. Limited wade fishing along braided channels. Popular photography and fishing spot.",
        parking: true,
      },
      {
        name: "Wilson Bridge",
        latitude: 43.4917,
        longitude: -110.875,
        description:
          "Major takeout for upper float trips and access to the South Fork. Good wade access near the bridge during lower flows.",
        parking: true,
      },
    ],
    bestMonths: ["July", "August", "September", "October"],
    latitude: 43.65,
    longitude: -110.7,
    mapBounds: {
      sw: [-110.95, 43.4],
      ne: [-110.5, 43.9],
    },
    hatchChart: [
      {
        month: "July",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning to early afternoon",
            intensity: "heavy",
          },
          {
            insect: "Green Drake",
            size: "#10-12",
            pattern: "Green Drake Paradrake, Green Drake Emerger",
            timeOfDay: "late morning",
            intensity: "moderate",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "August",
        hatches: [
          {
            insect: "Hoppers",
            size: "#8-12",
            pattern: "Chubby Chernobyl, Morrish Hopper",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Trico",
            size: "#18-22",
            pattern: "Trico Spinner, Parachute Trico",
            timeOfDay: "early morning",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "October Caddis",
            size: "#6-10",
            pattern: "Orange Stimulator, October Caddis",
            timeOfDay: "late afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Snake River Fly Fishing Guide — Wyoming | Executive Angler",
    metaDescription:
      "Fly fishing the Snake River beneath the Grand Tetons in Wyoming. Float trips for native cutthroat trout with world-class mountain scenery.",
    featured: true,
  },
  {
    id: "river-north-platte-wy",
    slug: "north-platte-wyoming",
    name: "North Platte River (Wyoming)",
    destinationId: "dest-wyoming",
    description:
      "The North Platte River in Wyoming offers some of the finest tailwater trout fishing between the Rockies and the Mississippi, with the Miracle Mile and Grey Reef sections producing trophy rainbow and brown trout that rival any tailwater in the West. The Miracle Mile, a 5.5-mile stretch between Seminoe and Pathfinder reservoirs, earned its name from the remarkable number of large trout it produces, with fish averaging 16 to 20 inches and occasional specimens exceeding ten pounds. The cold, nutrient-rich water released from the dams supports an extraordinary biomass of aquatic insects, scuds, and leeches that fuel rapid trout growth in this high-desert setting.\n\nFurther downstream, the Grey Reef section below Alcova Reservoir is equally impressive, offering slightly more technical fishing in a canyon setting where the river alternates between deep pools, gravel riffles, and long tailouts that hold pods of rising trout during prolific midge and baetis hatches. The Grey Reef trout are famously selective, and anglers accustomed to less pressured water will find themselves challenged by fish that have seen every fly pattern in the catalog. Wind is a constant companion on the North Platte, as the high plains geography funnels gusts through the river corridor, making casting technique as important as fly selection. Despite these challenges, the sheer quality of the fish and the uncrowded feel of this remote Wyoming landscape make the North Platte a destination that serious trout anglers return to year after year.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", // PLACEHOLDER
    lengthMiles: 30,
    flowType: "tailwater",
    difficulty: "advanced",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Walleye"],
    regulations:
      "Check Wyoming Game and Fish for current regulations. Special creel limits apply on Miracle Mile and Grey Reef sections. Artificial flies and lures only on some sections.",
    accessPoints: [
      {
        name: "Miracle Mile Access (Kortes Dam)",
        latitude: 42.1167,
        longitude: -106.8833,
        description:
          "Upper Miracle Mile access below Kortes Dam. Walk-in access along the reservoir spillway section. Outstanding nymphing water.",
        parking: true,
      },
      {
        name: "Grey Reef Access",
        latitude: 42.7667,
        longitude: -106.5833,
        description:
          "Primary access to the Grey Reef section below Alcova Reservoir. Boat ramp and wade access to technical tailwater fishing.",
        parking: true,
      },
      {
        name: "Lusby Public Access",
        latitude: 42.8167,
        longitude: -106.5333,
        description:
          "Lower Grey Reef access with good wade fishing along gravel bars and riffles. Less crowded than the upper access points.",
        parking: true,
      },
    ],
    bestMonths: ["March", "April", "May", "June", "September", "October", "November"],
    latitude: 42.45,
    longitude: -106.75,
    mapBounds: {
      sw: [-107.0, 42.0],
      ne: [-106.4, 42.9],
    },
    hatchChart: [
      {
        month: "March",
        hatches: [
          {
            insect: "Midges",
            size: "#18-24",
            pattern: "Zebra Midge, Mercury Midge, Griffith's Gnat",
            timeOfDay: "all day",
            intensity: "heavy",
          },
          {
            insect: "Blue-winged Olive",
            size: "#18-20",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "May",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning",
            intensity: "moderate",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, Peacock Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "October",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Midges",
            size: "#20-24",
            pattern: "Zebra Midge, Griffith's Gnat",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "North Platte River Fly Fishing Guide — Wyoming | Executive Angler",
    metaDescription:
      "Fly fishing the North Platte River in Wyoming. Miracle Mile and Grey Reef tailwater sections with trophy rainbow and brown trout.",
    featured: false,
  },
  {
    id: "river-firehole",
    slug: "firehole-river",
    name: "Firehole River",
    destinationId: "dest-wyoming",
    description:
      "The Firehole River is one of the most unique trout streams in the world, flowing through the geyser basins of Yellowstone National Park where boiling hot springs and erupting geysers line its banks. The geothermal influence gives the Firehole a character unlike any other trout river: its waters are warmed by thermal inputs, creating conditions that produce prolific insect hatches and active trout feeding earlier in the spring and later into fall than the park's other streams. The river holds brown, rainbow, and brook trout that have adapted to this extraordinary environment, feeding in clear, meadow-stream water while steam rises from the surrounding thermal features.\n\nThe Firehole's most celebrated stretch runs through the Biscuit Basin and Midway Geyser Basin areas, where the river meanders through broad, grassy meadows with undercut banks that shelter surprisingly large trout. The fishing here is technical and intimate, demanding careful approaches, delicate presentations, and small flies that match the river's prolific hatches of blue-winged olives, pale morning duns, and caddis. The Firehole is exclusively a wade-fishing river with easy access from the park road, and its relatively gentle gradient makes wading comfortable in most sections. Summer can be challenging because geothermal warming pushes water temperatures above the trout's comfort zone, effectively closing the river to ethical fishing from late June through mid-September. However, the spring and fall windows provide some of the most atmospheric and rewarding dry fly fishing available anywhere, with the sight of a trout rising to a mayfly while Old Faithful erupts in the background creating an experience that exists nowhere else on Earth.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558517259-165ae4b10f7f?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558517259-165ae4b10f7f?w=400&q=80", // PLACEHOLDER
    lengthMiles: 21,
    flowType: "spring creek",
    difficulty: "advanced",
    wadingType: "wade",
    primarySpecies: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
    regulations:
      "Yellowstone National Park fishing permit required (free). Catch-and-release only. Fly fishing only. Check current park regulations for seasonal closures and specific rules.",
    accessPoints: [
      {
        name: "Biscuit Basin Pullout",
        latitude: 44.4833,
        longitude: -110.8500,
        description:
          "Access to the meadow section near Biscuit Basin. Outstanding dry fly water with careful stalking required. Easy wading on gravel bottom.",
        parking: true,
      },
      {
        name: "Midway Geyser Basin",
        latitude: 44.5250,
        longitude: -110.8417,
        description:
          "Access near Grand Prismatic Spring area. Good runs and pools with rising trout visible from the road. Geothermal features nearby.",
        parking: true,
      },
      {
        name: "Firehole Canyon Drive",
        latitude: 44.5833,
        longitude: -110.8583,
        description:
          "Lower river canyon section with deeper pools and faster current. Fewer anglers and different character than the meadow sections.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "September", "October", "November"],
    latitude: 44.53,
    longitude: -110.85,
    mapBounds: {
      sw: [-110.92, 44.43],
      ne: [-110.78, 44.63],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, Sparkle Dun, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning",
            intensity: "heavy",
          },
          {
            insect: "Green Drake",
            size: "#10-12",
            pattern: "Green Drake Paradrake, Extended Body Drake",
            timeOfDay: "late morning to early afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "October",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2, WD-40",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Midges",
            size: "#20-24",
            pattern: "Griffith's Gnat, Zebra Midge",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Firehole River Fly Fishing Guide — Yellowstone | Executive Angler",
    metaDescription:
      "Fly fishing the Firehole River in Yellowstone National Park. Geothermal-fed trout stream with prolific hatches and utterly unique scenery.",
    featured: false,
  },
  // ==========================================
  // COLORADO
  // ==========================================
  {
    id: "river-south-platte",
    slug: "south-platte-river",
    name: "South Platte River",
    destinationId: "dest-colorado",
    description:
      "The South Platte River system is Colorado's most celebrated trout fishery, with several Gold Medal sections that produce exceptional numbers of large, well-conditioned trout in dramatic Front Range canyon settings. The most famous stretch is Cheesman Canyon, a rugged, hike-in section between Cheesman Dam and the town of Deckers where crystal-clear tailwater flows support a remarkable density of rainbow and brown trout in the 14- to 22-inch range. The canyon's restricted access and catch-and-release regulations have created a population of heavily educated fish that demand the finest leaders, smallest flies, and most careful presentations a trout angler can muster.\n\nBelow Deckers, the river flows through a broader canyon with easier access and somewhat less technical fishing, though the trout remain large and plentiful. The Eleven Mile Canyon section above Spinney Mountain Reservoir offers a different experience entirely, with freestone characteristics and a mix of browns, rainbows, and the occasional cutthroat trout in a setting that feels more like a mountain stream than a Front Range tailwater. What makes the South Platte exceptional is its proximity to Denver and Colorado Springs, providing world-class trout fishing within an hour of the state's major population centers. The river's midge hatches are legendary, with winter dry fly fishing on tiny Griffith's Gnats and RS2 patterns that would seem absurd on any other river but produce consistent action on the South Platte even in January. For anglers willing to embrace technical challenges and fine tippets, the South Platte rewards with some of the most satisfying dry fly fishing in the American West.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=400&q=80", // PLACEHOLDER
    lengthMiles: 50,
    flowType: "tailwater",
    difficulty: "advanced",
    wadingType: "wade",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
    regulations:
      "Check Colorado Parks and Wildlife for current regulations. Cheesman Canyon is catch-and-release only with artificial flies and lures only. Gold Medal water regulations apply on designated sections.",
    accessPoints: [
      {
        name: "Cheesman Canyon Trailhead",
        latitude: 39.2167,
        longitude: -105.2833,
        description:
          "Hike-in access to the famed Cheesman Canyon. Steep trail drops into the canyon. Technical dry fly water with large, selective trout.",
        parking: true,
      },
      {
        name: "Deckers Bridge",
        latitude: 39.2500,
        longitude: -105.2333,
        description:
          "Easy roadside access to productive riffles and runs below Cheesman Canyon. Good all-around fishing with both nymphing and dry fly opportunities.",
        parking: true,
      },
      {
        name: "Eleven Mile Canyon",
        latitude: 38.9333,
        longitude: -105.4500,
        description:
          "Upper South Platte access in a scenic canyon setting. Mixed freestone and tailwater character with excellent camping nearby.",
        parking: true,
      },
    ],
    bestMonths: ["March", "April", "May", "June", "July", "August", "September", "October"],
    latitude: 39.22,
    longitude: -105.27,
    mapBounds: {
      sw: [-105.5, 38.85],
      ne: [-105.15, 39.35],
    },
    hatchChart: [
      {
        month: "March",
        hatches: [
          {
            insect: "Midges",
            size: "#20-26",
            pattern: "Griffith's Gnat, RS2, Mercury Midge",
            timeOfDay: "late morning to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#16-20",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-18",
            pattern: "Elk Hair Caddis, CDC Caddis",
            timeOfDay: "evening",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Trico",
            size: "#20-24",
            pattern: "Trico Spinner, CDC Trico",
            timeOfDay: "early morning",
            intensity: "heavy",
          },
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
        ],
      },
    ],
    metaTitle: "South Platte River Fly Fishing Guide — Colorado | Executive Angler",
    metaDescription:
      "Fly fishing the South Platte River in Colorado. Cheesman Canyon Gold Medal water with technical tailwater trout fishing near Denver.",
    featured: true,
  },
  {
    id: "river-arkansas-co",
    slug: "arkansas-river-colorado",
    name: "Arkansas River (Colorado)",
    destinationId: "dest-colorado",
    description:
      "The Arkansas River in Colorado is one of the longest stretches of Gold Medal trout water in the state, flowing through the dramatic Arkansas River Valley from its headwaters near Leadville down through the Royal Gorge and into the high plains below Canon City. The river's upper reaches above Buena Vista offer outstanding freestone fishing for brown and rainbow trout in a classic mountain valley setting, with the Collegiate Peaks providing a stunning backdrop to every cast. Below the confluence with Lake Creek near Twin Lakes, the river gains volume and power, creating the kind of big-water runs and deep pools that hold genuinely large trout.\n\nThe Arkansas undergoes a remarkable transformation as it passes through the towns of Salida, Howard, and into the Royal Gorge. The canyon sections offer fewer but larger fish, with brown trout exceeding 20 inches a realistic possibility for anglers willing to work deep nymphs through the heavy water. The river's stonefly hatches are excellent, with salmonflies and golden stoneflies drawing fish to the surface in June, followed by prolific caddis activity through the summer. The Arkansas is also one of the premier whitewater rafting rivers in the country, which means fly anglers share the water with commercial raft traffic during peak summer months. Early morning fishing before the rafts launch, or targeting the quieter stretches between popular whitewater runs, are effective strategies for avoiding the crowds while still enjoying outstanding trout fishing in one of Colorado's most scenic river corridors.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80", // PLACEHOLDER
    lengthMiles: 102,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Brown Trout", "Rainbow Trout"],
    regulations:
      "Check Colorado Parks and Wildlife for current regulations. Gold Medal water from Leadville to Pueblo Reservoir. Specific sections have catch-and-release and artificial-only restrictions.",
    accessPoints: [
      {
        name: "Buena Vista River Park",
        latitude: 38.8422,
        longitude: -106.1311,
        description:
          "In-town access with easy wading on gravel bars. Good dry fly water through the meadow section. Shops and services in town.",
        parking: true,
      },
      {
        name: "Salida East Bridge",
        latitude: 38.5347,
        longitude: -105.9858,
        description:
          "Access to productive riffles and runs near Salida. Good wade fishing upstream and downstream. Less pressure than the Buena Vista stretch.",
        parking: true,
      },
      {
        name: "Pinnacle Rock (above Royal Gorge)",
        latitude: 38.4833,
        longitude: -105.3667,
        description:
          "Canyon access above the Royal Gorge. Deep runs and pools holding large brown trout. Advanced wading in heavier water.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    latitude: 38.65,
    longitude: -106.05,
    mapBounds: {
      sw: [-106.25, 38.4],
      ne: [-105.3, 38.9],
    },
    hatchChart: [
      {
        month: "June",
        hatches: [
          {
            insect: "Salmonfly",
            size: "#4-8",
            pattern: "Chubby Chernobyl, Pat's Rubber Legs",
            timeOfDay: "all day",
            intensity: "heavy",
          },
          {
            insect: "Golden Stonefly",
            size: "#6-10",
            pattern: "Yellow Stimulator, Golden Stone Dry",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, Goddard Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, Pheasant Tail",
            timeOfDay: "morning",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Hoppers",
            size: "#8-12",
            pattern: "Chubby Chernobyl, Dave's Hopper",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Arkansas River Fly Fishing Guide — Colorado | Executive Angler",
    metaDescription:
      "Fly fishing the Arkansas River in Colorado. Gold Medal trout water from Leadville through the Royal Gorge with excellent stonefly and caddis hatches.",
    featured: false,
  },
  {
    id: "river-frying-pan",
    slug: "frying-pan-river",
    name: "Frying Pan River",
    destinationId: "dest-colorado",
    description:
      "The Frying Pan River below Ruedi Reservoir is one of Colorado's premier tailwater fisheries and arguably the finest small-stream trout fishing in the state. This intimate river flows through a wooded canyon for roughly 14 miles before joining the Roaring Fork River at the town of Basalt, and its cold, clear, dam-regulated flows support an extraordinary density of rainbow and brown trout that grow to impressive sizes on a steady diet of midges, mayflies, and scuds. The upper two miles immediately below the dam are designated Gold Medal water and are managed under catch-and-release, artificial-only regulations that have produced a population of large, well-educated trout that challenge even the most experienced technical anglers.\n\nThe Frying Pan's character is defined by its glassy tailouts, deep green pools, and deceptively smooth currents that make achieving a drag-free drift both critical and difficult. Fish here feed heavily on subsurface organisms, particularly mysis shrimp that wash through the dam, and anglers who learn to dead-drift tiny mysis patterns through the deeper runs are often rewarded with the largest trout of their lives. The surface fishing can be equally rewarding during the river's prolific green drake hatch in late June and July, when normally cautious trout throw caution aside to inhale these large mayflies. The Frying Pan's proximity to the resort town of Aspen and the easier-to-fish Roaring Fork River makes it an ideal technical challenge for anglers looking to test their skills after warming up on broader, more forgiving water.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&q=80", // PLACEHOLDER
    lengthMiles: 14,
    flowType: "tailwater",
    difficulty: "advanced",
    wadingType: "wade",
    primarySpecies: ["Rainbow Trout", "Brown Trout"],
    regulations:
      "Check Colorado Parks and Wildlife for current regulations. Upper two miles below Ruedi Dam are Gold Medal, catch-and-release, artificial flies and lures only.",
    accessPoints: [
      {
        name: "Ruedi Dam Tailwater",
        latitude: 39.3667,
        longitude: -106.8167,
        description:
          "Immediately below Ruedi Dam. The most productive and most pressured section. Large, selective trout feeding on mysis shrimp and midges.",
        parking: true,
      },
      {
        name: "Little Maud Flat",
        latitude: 39.3833,
        longitude: -106.8500,
        description:
          "Mid-river access with good pocket water and riffles. Slightly less technical than the upper dam section with excellent caddis and mayfly fishing.",
        parking: true,
      },
      {
        name: "Basalt Confluence",
        latitude: 39.3667,
        longitude: -107.0333,
        description:
          "Lower river near the confluence with the Roaring Fork. Good brown trout water with deeper runs and pools. Easy town access.",
        parking: true,
      },
    ],
    bestMonths: ["April", "May", "June", "July", "August", "September", "October"],
    latitude: 39.375,
    longitude: -106.9,
    mapBounds: {
      sw: [-107.1, 39.33],
      ne: [-106.75, 39.42],
    },
    hatchChart: [
      {
        month: "April",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Midges",
            size: "#20-26",
            pattern: "Griffith's Gnat, Zebra Midge",
            timeOfDay: "all day",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Green Drake",
            size: "#10-12",
            pattern: "Green Drake Paradrake, Extended Body Drake",
            timeOfDay: "late morning to early afternoon",
            intensity: "heavy",
          },
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "October Caddis",
            size: "#6-10",
            pattern: "Orange Stimulator, October Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Frying Pan River Fly Fishing Guide — Colorado | Executive Angler",
    metaDescription:
      "Fly fishing the Frying Pan River near Basalt, Colorado. Gold Medal tailwater with trophy trout, green drake hatches, and technical dry fly challenges.",
    featured: false,
  },
  // ==========================================
  // IDAHO
  // ==========================================
  {
    id: "river-henry-s-fork",
    slug: "henrys-fork",
    name: "Henry's Fork of the Snake River",
    destinationId: "dest-idaho",
    description:
      "The Henry's Fork of the Snake River is widely considered the most technically demanding dry fly river in North America, a spring-fed masterpiece that flows through the broad, volcanic caldera of the Island Park region in eastern Idaho. The river's most famous section, Railroad Ranch in Harriman State Park, is a mile-wide meadow stream of incomprehensible clarity where large rainbow trout sip tiny mayflies in water so smooth and transparent that every imperfection in a cast or drift is immediately punished. Generations of fly anglers have tested themselves against the Henry's Fork's educated rainbows, and the river has produced some of the most innovative fly patterns and presentation techniques in the history of the sport.\n\nBeyond Railroad Ranch, the Henry's Fork offers remarkable diversity. The Box Canyon section below Island Park Dam delivers fast, powerful wade fishing in a deep basalt canyon where rainbow trout attack stonefly nymphs and streamers with an aggression that contrasts sharply with the delicate sipping of the ranch fish. Below Mesa Falls, the river enters a remote canyon accessible only by trail, providing solitude and excellent fishing for anglers willing to make the effort. The river's green drake hatch in late June is one of the seminal events in American fly fishing, drawing pilgrims from across the world to witness huge mayflies carpeting the water while trophy rainbows feed with abandon. The Henry's Fork is not a river that gives up its secrets easily, but for the angler who invests the time and patience to understand its rhythms, it delivers the most intellectually satisfying fly fishing experience available anywhere.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=400&q=80", // PLACEHOLDER
    lengthMiles: 65,
    flowType: "spring creek",
    difficulty: "advanced",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Brook Trout"],
    regulations:
      "Check Idaho Fish and Game for current regulations. Harriman State Park (Railroad Ranch) is catch-and-release, fly fishing only. Specific sections have varying regulations.",
    accessPoints: [
      {
        name: "Railroad Ranch (Harriman State Park)",
        latitude: 44.3667,
        longitude: -111.3500,
        description:
          "The legendary meadow section. Walk-in access through the state park. Technical dry fly fishing over large, educated rainbows in gin-clear water.",
        parking: true,
      },
      {
        name: "Box Canyon (Island Park Dam)",
        latitude: 44.4167,
        longitude: -111.3833,
        description:
          "Fast, deep canyon water below Island Park Dam. Powerful wade fishing with excellent nymphing. Completely different character from Railroad Ranch.",
        parking: true,
      },
      {
        name: "Last Chance Access",
        latitude: 44.3500,
        longitude: -111.3667,
        description:
          "Access near the small community of Last Chance. Good wade fishing and float trip put-in for the lower river. Close to fly shops and lodging.",
        parking: true,
      },
    ],
    bestMonths: ["June", "July", "August", "September", "October"],
    latitude: 44.38,
    longitude: -111.37,
    mapBounds: {
      sw: [-111.55, 44.25],
      ne: [-111.2, 44.5],
    },
    hatchChart: [
      {
        month: "June",
        hatches: [
          {
            insect: "Green Drake",
            size: "#10-12",
            pattern: "Green Drake Paradrake, Extended Body Drake, Flav",
            timeOfDay: "late morning to early afternoon",
            intensity: "heavy",
          },
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple, Rusty Spinner",
            timeOfDay: "morning to early afternoon",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Flavs (Drunella flavilinea)",
            size: "#12-14",
            pattern: "Flav Sparkle Dun, Flav Emerger",
            timeOfDay: "morning",
            intensity: "moderate",
          },
          {
            insect: "Callibaetis",
            size: "#14-16",
            pattern: "Callibaetis Spinner, Parachute Callibaetis",
            timeOfDay: "midday",
            intensity: "moderate",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Mahogany Dun",
            size: "#14-16",
            pattern: "Mahogany Sparkle Dun, Pheasant Tail",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
        ],
      },
    ],
    metaTitle: "Henry's Fork Fly Fishing Guide — Idaho | Executive Angler",
    metaDescription:
      "Fly fishing the Henry's Fork of the Snake River in Idaho. The most technically demanding dry fly river in North America with legendary green drake hatches.",
    featured: true,
  },
  {
    id: "river-silver-creek",
    slug: "silver-creek",
    name: "Silver Creek",
    destinationId: "dest-idaho",
    description:
      "Silver Creek in central Idaho is one of the most revered spring creeks in the world, a crystal-clear, spring-fed stream that flows through the broad, sagebrush-covered valley near the Sun Valley resort community of Ketchum. The creek's fame rests on the extraordinary challenge it presents to fly anglers: large rainbow and brown trout cruising in water so clear that every pebble on the bottom is visible at twenty feet, feeding selectively on tiny mayflies and midges with a caution born of constant exposure to skilled anglers. Silver Creek is where many of the techniques and fly patterns that define modern spring creek fishing were developed, and the preserve maintained by The Nature Conservancy along its most productive stretches ensures that this extraordinary fishery will endure for generations.\n\nThe fishing on Silver Creek requires patience, observation, and precision. Success begins with finding feeding fish, then studying their rhythm and position before making a single, accurate cast with the right fly on the right trajectory. The creek's prolific hatches of tricos, pale morning duns, and callibaetis provide regular opportunities for surface feeding, but the flat, slow currents demand flawless drag-free drifts and leaders long enough to keep the fly line well away from the trout's field of vision. The reward for this painstaking approach is the chance to catch genuinely large trout on dry flies in one of the most beautiful and tranquil settings in the American West. Silver Creek is not a numbers fishery; it is a place where the quality of each individual encounter matters more than the count, and where a single perfect cast to a difficult fish can make an entire day on the water feel triumphant.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=400&q=80", // PLACEHOLDER
    lengthMiles: 12,
    flowType: "spring creek",
    difficulty: "advanced",
    wadingType: "wade",
    primarySpecies: ["Rainbow Trout", "Brown Trout"],
    regulations:
      "Check Idaho Fish and Game for current regulations. The Nature Conservancy preserve section has specific access rules and seasonal restrictions. Catch-and-release, barbless hooks required on most sections.",
    accessPoints: [
      {
        name: "Silver Creek Preserve (TNC)",
        latitude: 43.3333,
        longitude: -114.0833,
        description:
          "The Nature Conservancy's Silver Creek Preserve. Walk-in access to the most famous spring creek water. Seasonal restrictions apply; check preserve hours.",
        parking: true,
      },
      {
        name: "Point of Rocks",
        latitude: 43.3167,
        longitude: -114.1000,
        description:
          "Access to the lower preserve section. Good visibility for sight-fishing to cruising trout. Deeper pools hold larger fish.",
        parking: true,
      },
      {
        name: "Kilpatrick Bridge",
        latitude: 43.3000,
        longitude: -114.1167,
        description:
          "Access below the preserve to public water. Slightly wider river with good hatches and less angling pressure than the preserve.",
        parking: true,
      },
    ],
    bestMonths: ["June", "July", "August", "September"],
    latitude: 43.32,
    longitude: -114.1,
    mapBounds: {
      sw: [-114.18, 43.27],
      ne: [-114.02, 43.37],
    },
    hatchChart: [
      {
        month: "June",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#16-20",
            pattern: "PMD Sparkle Dun, PMD Cripple, Rusty Spinner",
            timeOfDay: "morning to early afternoon",
            intensity: "heavy",
          },
          {
            insect: "Callibaetis",
            size: "#14-16",
            pattern: "Callibaetis Spinner, Parachute Callibaetis",
            timeOfDay: "midday",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Trico",
            size: "#20-24",
            pattern: "Trico Spinner, CDC Trico, Parachute Trico",
            timeOfDay: "early morning spinner fall",
            intensity: "heavy",
          },
          {
            insect: "Callibaetis",
            size: "#14-16",
            pattern: "Callibaetis Spinner, Gulper Special",
            timeOfDay: "midday",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Trico",
            size: "#20-24",
            pattern: "Trico Spinner, CDC Trico",
            timeOfDay: "early morning",
            intensity: "moderate",
          },
          {
            insect: "Mahogany Dun",
            size: "#14-16",
            pattern: "Mahogany Sparkle Dun, Pheasant Tail",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Silver Creek Fly Fishing Guide — Idaho | Executive Angler",
    metaDescription:
      "Fly fishing Silver Creek near Sun Valley, Idaho. One of the world's finest spring creeks with challenging sight fishing for large trout in crystal-clear water.",
    featured: false,
  },
  {
    id: "river-south-fork-boise",
    slug: "south-fork-boise",
    name: "South Fork of the Boise River",
    destinationId: "dest-idaho",
    description:
      "The South Fork of the Boise River is Idaho's most productive tailwater trout fishery, flowing through a remote, forested canyon below Anderson Ranch Dam in the Boise National Forest. This cold, clear tailwater supports an exceptional density of wild rainbow and brown trout, with studies documenting over 4,000 trout per mile in the most productive reaches. The fish are not the largest in Idaho, averaging 12 to 16 inches, but the sheer number of active, feeding trout makes for action-packed days that are difficult to replicate anywhere else in the state.\n\nThe South Fork's canyon setting provides a sense of seclusion that belies its relative proximity to Boise, Idaho's largest city. The winding dirt road that follows the river limits access to anglers willing to make the drive, and the payoff is a river that feels wild and uncrowded even during peak summer months. The river's insect life is remarkably diverse, with prolific hatches of golden stoneflies, pale morning duns, caddis, and blue-winged olives that keep trout feeding on the surface throughout the fishing season. The salmon fly hatch in early June is particularly noteworthy, transforming normally cautious trout into reckless surface feeders willing to attack enormous dry flies with abandon. For anglers based in Boise or traveling through southern Idaho, the South Fork represents an outstanding day trip or weekend destination that delivers consistent, high-quality trout fishing in a beautiful mountain setting.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1500049242364-5f500807cdd7?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1500049242364-5f500807cdd7?w=400&q=80", // PLACEHOLDER
    lengthMiles: 30,
    flowType: "tailwater",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Bull Trout", "Mountain Whitefish"],
    regulations:
      "Check Idaho Fish and Game for current regulations. Bull trout are catch-and-release only. Specific gear restrictions may apply on sections near the dam.",
    accessPoints: [
      {
        name: "Anderson Ranch Dam",
        latitude: 43.3500,
        longitude: -115.4667,
        description:
          "Upper access immediately below the dam. Cold, productive water with heavy nymph fishing. Boat ramp for drift boat access.",
        parking: true,
      },
      {
        name: "Danskin Bridge",
        latitude: 43.3833,
        longitude: -115.5333,
        description:
          "Mid-canyon access with good wade fishing on gravel bars. Popular float trip section with excellent dry fly opportunities.",
        parking: true,
      },
      {
        name: "Neal Bridge",
        latitude: 43.4000,
        longitude: -115.6167,
        description:
          "Lower canyon access point. Wider river with good riffle-pool sequences. Less crowded than the upper access points.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    latitude: 43.38,
    longitude: -115.55,
    mapBounds: {
      sw: [-115.7, 43.3],
      ne: [-115.35, 43.45],
    },
    hatchChart: [
      {
        month: "June",
        hatches: [
          {
            insect: "Salmonfly",
            size: "#4-8",
            pattern: "Chubby Chernobyl, Pat's Rubber Legs",
            timeOfDay: "all day",
            intensity: "heavy",
          },
          {
            insect: "Golden Stonefly",
            size: "#6-10",
            pattern: "Yellow Stimulator, Golden Stone Dry",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "October Caddis",
            size: "#6-10",
            pattern: "Orange Stimulator, October Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "South Fork Boise River Fly Fishing Guide — Idaho | Executive Angler",
    metaDescription:
      "Fly fishing the South Fork of the Boise River in Idaho. Prolific tailwater with over 4,000 trout per mile in a remote canyon setting.",
    featured: false,
  },
  // ==========================================
  // ALASKA
  // ==========================================
  {
    id: "river-kenai",
    slug: "kenai-river",
    name: "Kenai River",
    destinationId: "dest-alaska",
    description:
      "The Kenai River on Alaska's Kenai Peninsula is one of the most prolific anadromous fish rivers in the world and arguably the finest all-around fly fishing destination in the state for visiting anglers. The river flows from Kenai Lake through a stunning glacial valley to Cook Inlet, passing through two distinct sections that offer radically different fishing experiences. The upper Kenai between Kenai Lake and Skilak Lake is a turquoise-tinted, gin-clear river where trophy-sized rainbow trout gorge on salmon eggs and flesh patterns from July through October, growing to legendary proportions on the protein windfall delivered by millions of spawning sockeye, king, and silver salmon.\n\nThe lower Kenai below Skilak Lake is a broader, more powerful river that hosts the main salmon runs and supports a world-renowned king salmon fishery that draws anglers from every corner of the globe. While conventional tackle dominates the king salmon fishery, fly anglers find outstanding opportunities for sockeye salmon on the Russian River confluence, silver salmon throughout the lower river in August and September, and the remarkable late-season rainbow trout fishing that follows the salmon spawn. The Kenai's accessibility from Anchorage, roughly three hours by road, makes it the most convenient major Alaskan fishery for visiting anglers, and the surrounding infrastructure of lodges, guides, and fly shops ensures that both first-time Alaska visitors and seasoned veterans can find the right level of support for their fishing ambitions.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1531176175280-109da1a28f25?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531176175280-109da1a28f25?w=400&q=80", // PLACEHOLDER
    lengthMiles: 82,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "King Salmon", "Silver Salmon", "Sockeye Salmon", "Dolly Varden"],
    regulations:
      "Check Alaska Department of Fish and Game for current regulations. King salmon regulations are strictly managed with in-season emergency orders. Specific gear and bait restrictions vary by section and season.",
    accessPoints: [
      {
        name: "Jim's Landing (Upper Kenai)",
        latitude: 60.4833,
        longitude: -150.0333,
        description:
          "Upper Kenai access below Kenai Lake. Crystal-clear water with trophy rainbow trout. Drift boat recommended for this section.",
        parking: true,
      },
      {
        name: "Russian River Confluence",
        latitude: 60.4833,
        longitude: -149.9833,
        description:
          "Famous confluence where the Russian River meets the Kenai. Outstanding sockeye salmon fishing. Very crowded during peak runs but extraordinarily productive.",
        parking: true,
      },
      {
        name: "Soldotna Bridge",
        latitude: 60.4833,
        longitude: -150.1167,
        description:
          "Lower Kenai access near Soldotna. Good bank fishing for silver salmon and rainbow trout. Central location with full services.",
        parking: true,
      },
    ],
    bestMonths: ["June", "July", "August", "September", "October"],
    latitude: 60.49,
    longitude: -150.05,
    mapBounds: {
      sw: [-150.35, 60.35],
      ne: [-149.8, 60.6],
    },
    metaTitle: "Kenai River Fly Fishing Guide — Alaska | Executive Angler",
    metaDescription:
      "Fly fishing the Kenai River on Alaska's Kenai Peninsula. World-class rainbow trout and salmon fishing in a stunning glacial valley setting.",
    featured: true,
  },
  {
    id: "river-bristol-bay",
    slug: "bristol-bay",
    name: "Bristol Bay Rivers",
    destinationId: "dest-alaska",
    description:
      "The Bristol Bay region of southwestern Alaska is the holy grail of fly fishing, a vast, roadless wilderness where dozens of pristine rivers flow through tundra and boreal forest to the shores of Bristol Bay, supporting the largest wild sockeye salmon run on Earth and rainbow trout of almost mythical proportions. Rivers like the Alagnak, Naknek, Kvichak, Nushagak, and the small tributaries feeding Lake Iliamna offer a density and diversity of fly fishing opportunities that exist nowhere else. The rainbow trout here, commonly called leopard rainbows for their vivid spotting, feast on salmon eggs and flesh through the summer and fall, growing fat and powerful on a diet so rich that fish exceeding 28 inches are a genuine possibility on any given day.\n\nFishing Bristol Bay typically requires a fly-out lodge or float plane access, as the region has no road system and settlements are limited to a handful of small villages. This remoteness is central to the experience: anglers fish alongside brown bears, watch bald eagles patrol the riverbanks, and cast into water that may not have seen another fly angler all season. The fishing calendar begins with king salmon in late June, transitions to the sockeye and pink salmon runs of July, and reaches its zenith in August and September when rainbow trout stack up behind spawning salmon to feast on eggs drifting downstream. For the angler willing to invest the time and resources to reach Bristol Bay, the reward is the most abundant, unspoiled fly fishing experience remaining in North America.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80", // PLACEHOLDER
    lengthMiles: undefined,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "King Salmon", "Silver Salmon", "Sockeye Salmon", "Arctic Grayling", "Arctic Char"],
    regulations:
      "Check Alaska Department of Fish and Game for current regulations. Single barbless hooks required on many rivers. Catch-and-release for rainbow trout on most waters. Emergency orders may adjust salmon regulations in-season.",
    accessPoints: [
      {
        name: "King Salmon (Naknek River)",
        latitude: 58.6833,
        longitude: -156.6500,
        description:
          "Gateway town for Bristol Bay. Access to the Naknek River and floatplane services to surrounding rivers. The main staging point for most Bristol Bay fishing trips.",
        parking: true,
      },
      {
        name: "Alagnak River (Branch River)",
        latitude: 59.0333,
        longitude: -156.3333,
        description:
          "Fly-out access to one of Bristol Bay's premier rainbow trout rivers. Float trips through pristine wilderness with outstanding dry fly and streamer fishing.",
        parking: false,
      },
      {
        name: "Iliamna (Kvichak drainage)",
        latitude: 59.7500,
        longitude: -154.9167,
        description:
          "Access to Lake Iliamna and its tributary rivers. Hub for lodges and guides serving the upper Bristol Bay watershed. Fly-in only.",
        parking: false,
      },
    ],
    bestMonths: ["June", "July", "August", "September"],
    latitude: 59.0,
    longitude: -156.5,
    mapBounds: {
      sw: [-157.5, 58.3],
      ne: [-154.5, 59.9],
    },
    metaTitle: "Bristol Bay Rivers Fly Fishing Guide — Alaska | Executive Angler",
    metaDescription:
      "Fly fishing the rivers of Bristol Bay, Alaska. The world's greatest concentration of wild rainbow trout and Pacific salmon in pristine wilderness.",
    featured: true,
  },
  {
    id: "river-copper-river",
    slug: "copper-river-alaska",
    name: "Copper River",
    destinationId: "dest-alaska",
    description:
      "The Copper River is one of Alaska's great wilderness waterways, flowing nearly 300 miles from the Wrangell Mountains through the Chugach Range to the Gulf of Alaska near the town of Cordova. While the main stem Copper is a massive, glacially silted river too large and turbid for traditional fly fishing, its clear-water tributaries offer extraordinary fishing for all five species of Pacific salmon, Dolly Varden, and resident rainbow trout in a setting of unmatched wildness. The Gulkana River, Klutina River, and Tonsina River are among the most accessible of these tributaries, offering road-accessible fishing for king and sockeye salmon that run with the raw power that only Alaska's rivers can provide.\n\nThe Copper River system's remoteness and the sheer volume of returning salmon create fishing experiences that feel truly primordial. Anglers casting into the clear-water tributaries during the peak of the sockeye run in July find themselves surrounded by thousands of crimson fish pushing upstream, while Dolly Varden and rainbow trout trail behind, gorging on stray eggs. The king salmon runs in June draw anglers willing to swing large flies on heavy rods in heavy current, testing their tackle and their determination against fish that routinely exceed thirty pounds. The Copper River drainage remains one of the least-pressured major salmon systems in Alaska, offering a genuine wilderness fishing experience for anglers seeking something beyond the more established Bristol Bay and Kenai Peninsula fisheries.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80", // PLACEHOLDER
    lengthMiles: 290,
    flowType: "freestone",
    difficulty: "advanced",
    wadingType: "both",
    primarySpecies: ["King Salmon", "Sockeye Salmon", "Silver Salmon", "Dolly Varden", "Rainbow Trout"],
    regulations:
      "Check Alaska Department of Fish and Game for current regulations. King salmon regulations are strictly managed. Emergency in-season orders are common. Specific gear restrictions vary by tributary.",
    accessPoints: [
      {
        name: "Gulkana River (Sourdough Creek Access)",
        latitude: 62.2833,
        longitude: -145.4667,
        description:
          "Popular access to the Gulkana River, a major Copper River tributary. Good king and sockeye salmon fishing. Road-accessible from the Richardson Highway.",
        parking: true,
      },
      {
        name: "Klutina River (Copper Center)",
        latitude: 61.9500,
        longitude: -145.3000,
        description:
          "Access to the Klutina River near Copper Center. Excellent king salmon fishing in June and July. Wading and bank fishing along the lower river.",
        parking: true,
      },
      {
        name: "Chitina Dipnet Area",
        latitude: 61.5167,
        longitude: -144.4333,
        description:
          "Lower Copper River access near Chitina. Primarily a dipnet fishery for personal-use salmon, but tributary mouths offer fly fishing opportunities.",
        parking: true,
      },
    ],
    bestMonths: ["June", "July", "August", "September"],
    latitude: 61.9,
    longitude: -145.1,
    mapBounds: {
      sw: [-146.0, 61.3],
      ne: [-144.0, 62.5],
    },
    metaTitle: "Copper River Fly Fishing Guide — Alaska | Executive Angler",
    metaDescription:
      "Fly fishing the Copper River system in Alaska. Wild salmon runs and clear-water tributary fishing in the shadow of the Wrangell Mountains.",
    featured: false,
  },
  // ==========================================
  // OREGON
  // ==========================================
  {
    id: "river-deschutes",
    slug: "deschutes-river",
    name: "Deschutes River",
    destinationId: "dest-oregon",
    description:
      "The Deschutes River is Oregon's most iconic fly fishing destination, a powerful desert canyon river that carves through the basalt rimrock of central Oregon before joining the Columbia River near the town of Maupin. The lower Deschutes, from Pelton Dam downstream to the Columbia, is renowned for its wild redsides, a brilliantly colored strain of resident rainbow trout that are among the most athletic fish in the Pacific Northwest. These fish, typically ranging from 10 to 18 inches with occasional specimens exceeding 20, are muscular, acrobatic fighters that exploit the river's powerful current to test tackle and technique in equal measure.\n\nThe Deschutes is also one of the finest summer steelhead rivers accessible by road in the Northwest, with wild steelhead entering the river from July through November and providing outstanding opportunities for anglers willing to swing flies through the river's classic runs and tailouts. The dry fly fishing for steelhead on the Deschutes, using waking patterns skated across the surface, is one of the most exciting experiences in all of fly fishing. The river's canyon setting, with towering rimrock walls, golden grasslands, and surprisingly mild weather even in the shoulder seasons, creates an atmosphere that feels more like the American Southwest than the Pacific Northwest. Multi-day float trips through the canyon are a Deschutes tradition, combining outstanding fishing with camping on sandy beaches under star-filled skies.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=400&q=80", // PLACEHOLDER
    lengthMiles: 100,
    flowType: "tailwater",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout (Redsides)", "Summer Steelhead", "Brown Trout"],
    regulations:
      "Check Oregon Department of Fish and Wildlife for current regulations. Wild steelhead regulations vary by season. Barbless hooks required. Specific fly-only sections exist.",
    accessPoints: [
      {
        name: "Warm Springs Bridge",
        latitude: 44.7833,
        longitude: -121.2333,
        description:
          "Upper access below Pelton Dam. Productive wade fishing with less pressure than the lower canyon. Good trout water with occasional steelhead.",
        parking: true,
      },
      {
        name: "Maupin City Park",
        latitude: 45.1750,
        longitude: -121.0833,
        description:
          "Central access point in the town of Maupin. Boat ramp and wade access. Heart of the lower Deschutes with excellent trout and steelhead water.",
        parking: true,
      },
      {
        name: "Beavertail Campground",
        latitude: 45.2500,
        longitude: -121.0500,
        description:
          "Popular camping and fishing access below Maupin. Classic steelhead runs and productive trout riffles. Multi-day float trip put-in.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    latitude: 45.1,
    longitude: -121.1,
    mapBounds: {
      sw: [-121.4, 44.7],
      ne: [-120.9, 45.4],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Salmonfly",
            size: "#4-8",
            pattern: "Chubby Chernobyl, Pat's Rubber Legs, Norm Wood Special",
            timeOfDay: "all day",
            intensity: "heavy",
          },
          {
            insect: "Golden Stonefly",
            size: "#6-10",
            pattern: "Yellow Stimulator, Golden Stone Dry",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Pale Morning Dun",
            size: "#14-18",
            pattern: "PMD Sparkle Dun, PMD Cripple",
            timeOfDay: "morning",
            intensity: "moderate",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis, Goddard Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "October",
        hatches: [
          {
            insect: "October Caddis",
            size: "#6-10",
            pattern: "Orange Stimulator, October Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Blue-winged Olive",
            size: "#16-20",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Deschutes River Fly Fishing Guide — Oregon | Executive Angler",
    metaDescription:
      "Fly fishing the Deschutes River in Oregon. Wild redsides, summer steelhead, and dramatic desert canyon scenery in the Pacific Northwest.",
    featured: true,
  },
  {
    id: "river-rogue",
    slug: "rogue-river",
    name: "Rogue River",
    destinationId: "dest-oregon",
    description:
      "The Rogue River in southern Oregon is one of the original Wild and Scenic Rivers in the United States, a designation it earned through a combination of outstanding fisheries, dramatic canyon scenery, and a wilderness character that has attracted adventurers since Zane Grey made it famous in the early twentieth century. The Rogue supports robust runs of summer and winter steelhead, spring and fall Chinook salmon, and a resident population of half-pounder steelhead, young fish returning from their first ocean season that provide fast-paced action on light tackle and small flies throughout the fall months.\n\nThe Rogue's most celebrated section is the Wild and Scenic stretch between Grave Creek and Foster Bar, a 35-mile roadless canyon accessible only by boat or trail. Multi-day float trips through this section rank among the finest wilderness fishing experiences in the Pacific Northwest, with anglers camping on gravel bars, fishing pristine runs, and encountering black bears, river otters, and ospreys along the way. The upper Rogue near the town of Shady Cove offers more accessible fishing for trout and steelhead, with roadside access and a gentler gradient that allows comfortable wade fishing. The combination of wild steelhead, salmon, a half-pounder run unique to this region, and the legacy of one of America's first wild river protections makes the Rogue an essential destination for any angler exploring the Pacific Northwest.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1587502537745-84b7d66a8f97?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587502537745-84b7d66a8f97?w=400&q=80", // PLACEHOLDER
    lengthMiles: 215,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Summer Steelhead", "Winter Steelhead", "Chinook Salmon", "Half-Pounder Steelhead", "Resident Trout"],
    regulations:
      "Check Oregon Department of Fish and Wildlife for current regulations. Wild steelhead and salmon regulations vary by season and section. Barbless hooks required on most sections.",
    accessPoints: [
      {
        name: "Shady Cove (Upper Rogue)",
        latitude: 42.6167,
        longitude: -122.8167,
        description:
          "Upper Rogue access with gentle gradient and good wade fishing. Productive trout water with seasonal steelhead. Easy roadside access.",
        parking: true,
      },
      {
        name: "Grave Creek (Wild Section Start)",
        latitude: 42.6500,
        longitude: -123.5833,
        description:
          "Put-in for the Wild and Scenic section. Permit required for multi-day floats. Beginning of the roadless canyon with outstanding steelhead water.",
        parking: true,
      },
      {
        name: "Gold Beach (Lower Rogue)",
        latitude: 42.4000,
        longitude: -124.4167,
        description:
          "Tidewater section near the ocean. Excellent fall steelhead and salmon fishing. Jet boat access to upper canyon runs.",
        parking: true,
      },
    ],
    bestMonths: ["June", "July", "August", "September", "October", "November"],
    latitude: 42.55,
    longitude: -123.5,
    mapBounds: {
      sw: [-124.5, 42.3],
      ne: [-122.6, 42.8],
    },
    metaTitle: "Rogue River Fly Fishing Guide — Oregon | Executive Angler",
    metaDescription:
      "Fly fishing the Rogue River in southern Oregon. Wild steelhead, salmon, and the unique half-pounder run on one of America's first Wild and Scenic Rivers.",
    featured: false,
  },
  {
    id: "river-mckenzie",
    slug: "mckenzie-river",
    name: "McKenzie River",
    destinationId: "dest-oregon",
    description:
      "The McKenzie River in Oregon's Willamette Valley is the birthplace of the drift boat, a craft designed specifically for navigating this river's swift, clear waters and delivering anglers to the best fishing lanes with precision and grace. The river flows from Clear Lake in the high Cascades through a forested canyon of remarkable beauty, with old-growth Douglas fir and western red cedar shading the water and contributing to the cool temperatures that sustain outstanding populations of wild rainbow trout and hatchery spring Chinook salmon.\n\nThe McKenzie's wild rainbows are the river's primary attraction for fly anglers, with fish averaging 10 to 14 inches and aggressive surface-feeding behavior that makes them ideal dry fly targets. The river's prolific green drake hatch in late May and June is legendary among Oregon fly fishers, producing the kind of blanket emergence that brings every trout in the river to the surface. The McKenzie is also notable for its spring Chinook salmon run, one of the best in the Willamette system, which draws anglers from across the state each May and June. The combination of a scenic Cascade Mountain setting, the tradition of the McKenzie River drift boat, and consistent trout fishing that rewards both skilled and developing anglers makes this river one of Oregon's most cherished fly fishing destinations.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80", // PLACEHOLDER
    lengthMiles: 90,
    flowType: "freestone",
    difficulty: "beginner",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Spring Chinook Salmon", "Bull Trout"],
    regulations:
      "Check Oregon Department of Fish and Wildlife for current regulations. Bull trout are catch-and-release only. Specific regulations apply to salmon seasons. Barbless hooks required.",
    accessPoints: [
      {
        name: "Paradise Campground",
        latitude: 44.1500,
        longitude: -122.1000,
        description:
          "Upper river access in the old-growth forest section. Crystal-clear water with eager wild rainbow trout. Excellent wade fishing in a stunning setting.",
        parking: true,
      },
      {
        name: "Finn Rock Reach",
        latitude: 44.1833,
        longitude: -122.2333,
        description:
          "Mid-river access with good float and wade opportunities. Classic McKenzie drift boat water with productive riffles and runs.",
        parking: true,
      },
      {
        name: "Hendricks Bridge (Walterville)",
        latitude: 44.0833,
        longitude: -122.5667,
        description:
          "Lower river access near the Willamette Valley. Wider water with good spring Chinook fishing and productive trout runs.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September"],
    latitude: 44.15,
    longitude: -122.25,
    mapBounds: {
      sw: [-122.65, 44.0],
      ne: [-121.95, 44.25],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "March Brown",
            size: "#10-14",
            pattern: "March Brown Dry, March Brown Emerger",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Green Drake",
            size: "#10-12",
            pattern: "Green Drake Paradrake, Extended Body Drake",
            timeOfDay: "late morning to early afternoon",
            intensity: "heavy",
          },
          {
            insect: "Golden Stonefly",
            size: "#6-10",
            pattern: "Yellow Stimulator, Golden Stone Dry",
            timeOfDay: "afternoon to evening",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "August",
        hatches: [
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, CDC Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
          {
            insect: "Hoppers",
            size: "#8-12",
            pattern: "Chubby Chernobyl, Dave's Hopper",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "McKenzie River Fly Fishing Guide — Oregon | Executive Angler",
    metaDescription:
      "Fly fishing the McKenzie River in Oregon. Birthplace of the drift boat with wild rainbow trout and legendary green drake hatches in the Cascade foothills.",
    featured: false,
  },
  // ==========================================
  // PENNSYLVANIA
  // ==========================================
  {
    id: "river-letort-spring-run",
    slug: "letort-spring-run",
    name: "Letort Spring Run",
    destinationId: "dest-pennsylvania",
    description:
      "Letort Spring Run in the Cumberland Valley of south-central Pennsylvania is one of the most historically significant trout streams in American fly fishing, a tiny limestone spring creek that has influenced generations of anglers and fly tiers far beyond what its modest size would suggest. The Letort was home water for Charlie Fox, Vince Marinaro, and Ed Koch, pioneers whose observations of trout feeding behavior on this creek led to revolutionary developments in fly pattern design and presentation technique that transformed the sport. The creek's crystal-clear, alkaline water supports dense populations of brown trout, wild brook trout in its upper reaches, and a remarkable array of insect life that includes the terrestrial patterns for which the Letort is most famous.\n\nFishing the Letort today demands the same careful approach that Fox and Marinaro documented decades ago. The creek is narrow enough to cast across in most places, and its glassy surface reveals every imperfection in leader construction and drift. The brown trout, many of them large fish that have survived multiple seasons of angling pressure, feed selectively on tiny terrestrials, midges, and sulphur mayflies with a wariness that can reduce experienced anglers to frustrated observers. The Letort's terrestrial fishing in summer, when ants, beetles, and grasshoppers constitute the primary food source, remains the best way to experience the creek's unique challenge. Success here is not measured in numbers but in the satisfaction of fooling a single, difficult fish with the right fly, the right cast, and the patience to wait for the perfect moment.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=400&q=80", // PLACEHOLDER
    lengthMiles: 7,
    flowType: "spring creek",
    difficulty: "advanced",
    wadingType: "wade",
    primarySpecies: ["Brown Trout", "Brook Trout"],
    regulations:
      "Check Pennsylvania Fish and Boat Commission for current regulations. Special regulation sections with catch-and-release, artificial-only rules. Heritage trout angling designation on some sections.",
    accessPoints: [
      {
        name: "Bonny Brook Road Access",
        latitude: 40.1917,
        longitude: -77.1833,
        description:
          "Upper Letort access with the most historic water. Small, intimate spring creek with extremely wary brown trout. Walk carefully and cast precisely.",
        parking: true,
      },
      {
        name: "Letort Park (Carlisle)",
        latitude: 40.2000,
        longitude: -77.2000,
        description:
          "Town of Carlisle access through the park. Good terrestrial fishing in summer. More accessible than the upper sections but fish remain very selective.",
        parking: true,
      },
    ],
    bestMonths: ["April", "May", "June", "July", "August", "September", "October"],
    latitude: 40.195,
    longitude: -77.19,
    mapBounds: {
      sw: [-77.25, 40.17],
      ne: [-77.13, 40.22],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Sulphur (Ephemerella dorothea)",
            size: "#16-18",
            pattern: "Sulphur Dun, Sulphur Emerger, Comparadun",
            timeOfDay: "evening",
            intensity: "heavy",
          },
          {
            insect: "Midges",
            size: "#20-24",
            pattern: "Griffith's Gnat, CDC Midge",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Terrestrials (Ants, Beetles, Hoppers)",
            size: "#14-20",
            pattern: "Fur Ant, Foam Beetle, Letort Hopper, Letort Cricket",
            timeOfDay: "afternoon",
            intensity: "heavy",
          },
          {
            insect: "Trico",
            size: "#22-26",
            pattern: "Trico Spinner, CDC Trico",
            timeOfDay: "early morning",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "September",
        hatches: [
          {
            insect: "Terrestrials (Ants, Beetles)",
            size: "#16-22",
            pattern: "Flying Ant, Foam Beetle, Crowe Beetle",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, CDC BWO",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Letort Spring Run Fly Fishing Guide — Pennsylvania | Executive Angler",
    metaDescription:
      "Fly fishing Letort Spring Run in Pennsylvania's Cumberland Valley. Historic limestone spring creek that defined American terrestrial fly fishing.",
    featured: false,
  },
  {
    id: "river-big-spring",
    slug: "big-spring-creek",
    name: "Big Spring Creek",
    destinationId: "dest-pennsylvania",
    description:
      "Big Spring Creek in Cumberland County, Pennsylvania, is one of the most productive limestone spring creeks in the eastern United States, flowing with remarkable clarity and consistency from a massive spring source that discharges millions of gallons of cold, mineral-rich water daily. The creek supports an extraordinary biomass of aquatic insects and crustaceans, including freshwater shrimp, cress bugs, and dense populations of mayflies and caddis that fuel the growth of brown trout reaching genuinely impressive sizes for a small limestone stream. Fish exceeding 20 inches are present throughout the regulated sections, though catching them consistently requires the same technical precision demanded by the finest spring creeks in the Rocky Mountain West.\n\nBig Spring's character is defined by its abundant aquatic vegetation, particularly watercress beds that create complex current patterns and provide cover for feeding trout. Anglers must learn to read the subtle current seams around these weed beds, identifying feeding lanes where trout position themselves to intercept drifting insects without expending unnecessary energy. The creek's trico spinner fall in July and August is one of the great small-stream spectacles in the East, with dense clouds of tiny spinners falling to the water and triggering sustained rising activity among even the largest fish. For anglers who appreciate the challenge and satisfaction of technical spring creek fishing within a few hours of Philadelphia, Baltimore, and Washington, Big Spring offers a world-class experience in an accessible, pastoral setting.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=400&q=80", // PLACEHOLDER
    lengthMiles: 5,
    flowType: "spring creek",
    difficulty: "advanced",
    wadingType: "wade",
    primarySpecies: ["Brown Trout", "Rainbow Trout"],
    regulations:
      "Check Pennsylvania Fish and Boat Commission for current regulations. Special regulation sections with catch-and-release, artificial flies only, and barbless hooks required.",
    accessPoints: [
      {
        name: "Big Spring State Fish Hatchery",
        latitude: 40.2167,
        longitude: -77.1500,
        description:
          "Access near the spring source. Very clear water with large, educated brown trout. Extremely technical fishing requiring fine tippets and small flies.",
        parking: true,
      },
      {
        name: "Huntsdale Road Bridge",
        latitude: 40.2083,
        longitude: -77.1583,
        description:
          "Mid-creek access with productive pools and riffles. Good trico fishing in summer. Watercress beds create complex currents for trout to exploit.",
        parking: true,
      },
    ],
    bestMonths: ["April", "May", "June", "July", "August", "September", "October"],
    latitude: 40.21,
    longitude: -77.15,
    mapBounds: {
      sw: [-77.2, 40.19],
      ne: [-77.1, 40.24],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Sulphur",
            size: "#16-18",
            pattern: "Sulphur Dun, Comparadun, Sulphur Emerger",
            timeOfDay: "evening",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, CDC Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Trico",
            size: "#22-26",
            pattern: "Trico Spinner, CDC Trico, Parachute Trico",
            timeOfDay: "early morning spinner fall",
            intensity: "heavy",
          },
          {
            insect: "Terrestrials",
            size: "#14-20",
            pattern: "Fur Ant, Foam Beetle",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "October",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Midges",
            size: "#22-26",
            pattern: "Griffith's Gnat, Zebra Midge",
            timeOfDay: "all day",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Big Spring Creek Fly Fishing Guide — Pennsylvania | Executive Angler",
    metaDescription:
      "Fly fishing Big Spring Creek in Pennsylvania. Productive limestone spring creek with large brown trout and outstanding trico hatches.",
    featured: false,
  },
  {
    id: "river-penns-creek",
    slug: "penns-creek",
    name: "Penns Creek",
    destinationId: "dest-pennsylvania",
    description:
      "Penns Creek is the crown jewel of Pennsylvania trout fishing, a large limestone-influenced freestone stream that flows through a forested valley in the heart of the state, offering a combination of wild trout, prolific hatches, and scenic beauty that rivals many better-known western rivers. The creek's most celebrated stretch runs through a roadless, forested canyon between Coburn and the catch-and-release section near Poe Paddy State Park, where wild brown trout exceeding 20 inches patrol deep pools and undercut banks in water that is clear enough to sight-fish on bright days.\n\nPenns Creek's green drake hatch in late May and early June is the single most anticipated event on the Pennsylvania fly fishing calendar, drawing anglers from across the eastern seaboard to the stream's banks for the brief, intense emergence of these large mayflies. When conditions align, with overcast skies and warm temperatures triggering a heavy evening hatch, the fishing can be transcendent, with large brown trout abandoning their daytime caution to gorge on the massive insects. Beyond the green drakes, Penns Creek offers excellent fishing throughout the season with sulphur hatches in May, tricos and terrestrials in summer, and blue-winged olives in the fall. The creek's size allows comfortable wade fishing in most sections, and its status as one of the few eastern streams capable of supporting a self-sustaining wild brown trout population of this quality makes it a genuinely significant fishery.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80", // PLACEHOLDER
    lengthMiles: 55,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "wade",
    primarySpecies: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
    regulations:
      "Check Pennsylvania Fish and Boat Commission for current regulations. Catch-and-release artificial-only sections near Poe Paddy. Special regulation trout water throughout.",
    accessPoints: [
      {
        name: "Poe Paddy State Park",
        latitude: 40.8667,
        longitude: -77.3000,
        description:
          "Heart of the catch-and-release section. Forested canyon setting with excellent wild brown trout water. Good camping and hiking nearby.",
        parking: true,
      },
      {
        name: "Coburn Bridge",
        latitude: 40.8500,
        longitude: -77.4833,
        description:
          "Upper canyon access. The green drake hatch epicenter. Productive evening rises during the mayfly season.",
        parking: true,
      },
      {
        name: "Weikert Access",
        latitude: 40.8333,
        longitude: -77.2333,
        description:
          "Lower river access with broader water. Good nymphing runs and productive dry fly riffles. Less pressure than the famous canyon section.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    latitude: 40.85,
    longitude: -77.35,
    mapBounds: {
      sw: [-77.55, 40.78],
      ne: [-77.15, 40.92],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Green Drake",
            size: "#8-12",
            pattern: "Green Drake Paradrake, Coffin Fly Spinner",
            timeOfDay: "evening",
            intensity: "heavy",
          },
          {
            insect: "Sulphur",
            size: "#16-18",
            pattern: "Sulphur Dun, Sulphur Emerger",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "July",
        hatches: [
          {
            insect: "Trico",
            size: "#22-26",
            pattern: "Trico Spinner, CDC Trico",
            timeOfDay: "early morning",
            intensity: "heavy",
          },
          {
            insect: "Terrestrials",
            size: "#12-18",
            pattern: "Foam Beetle, Flying Ant, Dave's Hopper",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "October",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
        ],
      },
    ],
    metaTitle: "Penns Creek Fly Fishing Guide — Pennsylvania | Executive Angler",
    metaDescription:
      "Fly fishing Penns Creek in central Pennsylvania. The state's finest wild trout stream with legendary green drake hatches and scenic canyon water.",
    featured: false,
  },
  // ==========================================
  // MICHIGAN
  // ==========================================
  {
    id: "river-au-sable",
    slug: "au-sable-river",
    name: "Au Sable River",
    destinationId: "dest-michigan",
    description:
      "The Au Sable River in northern Michigan is the most storied trout stream in the Midwest, a sand-bottomed, spring-fed river that flows through jack pine forests and cedar swamps for nearly 120 miles before emptying into Lake Huron. The Au Sable's place in fly fishing history is secure: it was here that the conservation movement to protect wild trout gained early momentum, and the river's Holy Water section near Grayling, one of the first catch-and-release, fly-fishing-only waters in the country, became a model for wild trout management across the nation. The river supports healthy populations of brown and brook trout, with the upper sections favoring native brook trout and the middle and lower stretches holding larger browns.\n\nThe Au Sable's character is gentle and intimate, with soft currents, cedar-lined banks, and a sandy bottom that makes wading easy and pleasant. The river is also one of the finest canoe and drift boat rivers in the Midwest, with the traditional Au Sable river boat, a flat-bottomed wooden craft poled silently upstream against the current, providing a uniquely stealthy approach to rising fish. The Hendrickson mayfly hatch in May and the prolific Hex hatch in June and July, when massive Hexagenia limbata mayflies emerge at dusk and send large brown trout into feeding frenzies in the dark, are the seasonal highlights that draw anglers from across the country. The Hex hatch in particular is a nocturnal experience unlike anything else in American fly fishing, with anglers casting large dry flies by feel in near-total darkness to the explosive surface takes of trout they cannot see.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
    lengthMiles: 120,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Brown Trout", "Brook Trout", "Rainbow Trout"],
    regulations:
      "Check Michigan DNR for current regulations. Holy Water section is fly-fishing-only, catch-and-release. Various sections have different gear and harvest restrictions.",
    accessPoints: [
      {
        name: "Burton's Landing (Holy Water)",
        latitude: 44.6667,
        longitude: -84.6333,
        description:
          "Heart of the legendary Holy Water. Fly-fishing-only, catch-and-release. Classic Au Sable dry fly water with native brook and brown trout.",
        parking: true,
      },
      {
        name: "Wakeley Bridge",
        latitude: 44.6833,
        longitude: -84.5167,
        description:
          "Upper river access with good brook trout water. Intimate, cedar-lined stream with excellent Hendrickson hatches in May.",
        parking: true,
      },
      {
        name: "Mio Dam",
        latitude: 44.6500,
        longitude: -84.1333,
        description:
          "Below Mio Dam for the lower Au Sable. Prime Hex hatch water with large brown trout. Night fishing during the Hex emergence is legendary.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September"],
    latitude: 44.67,
    longitude: -84.4,
    mapBounds: {
      sw: [-84.75, 44.55],
      ne: [-84.0, 44.8],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Hendrickson",
            size: "#12-14",
            pattern: "Hendrickson Dry, Light Hendrickson, Hendrickson Emerger",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, X-Caddis",
            timeOfDay: "evening",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Hex (Hexagenia limbata)",
            size: "#4-8",
            pattern: "Hex Dry, Hex Wiggle Nymph, Roberts Yellow Drake",
            timeOfDay: "dusk to full dark",
            intensity: "heavy",
          },
          {
            insect: "Brown Drake",
            size: "#8-12",
            pattern: "Brown Drake Paradrake, Brown Drake Spinner",
            timeOfDay: "evening",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "August",
        hatches: [
          {
            insect: "Trico",
            size: "#20-24",
            pattern: "Trico Spinner, CDC Trico",
            timeOfDay: "early morning",
            intensity: "heavy",
          },
          {
            insect: "Terrestrials",
            size: "#14-18",
            pattern: "Foam Beetle, Fur Ant, Small Hopper",
            timeOfDay: "afternoon",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Au Sable River Fly Fishing Guide — Michigan | Executive Angler",
    metaDescription:
      "Fly fishing the Au Sable River in Michigan. The Midwest's most historic trout stream with legendary Hex hatches and the Holy Water catch-and-release section.",
    featured: false,
  },
  {
    id: "river-pere-marquette",
    slug: "pere-marquette-river",
    name: "Pere Marquette River",
    destinationId: "dest-michigan",
    description:
      "The Pere Marquette River in western Michigan was the first river in the United States to be stocked with brown trout, receiving the historic 1884 shipment from Germany that forever changed American trout fishing. Today the river remains one of the finest trout and salmon streams in the Great Lakes region, flowing through a beautiful hardwood forest landscape with sand and gravel substrates that support excellent wild brown trout reproduction and serve as critical spawning habitat for migratory steelhead and salmon. The flies-only section of the upper PM, a ten-mile stretch of classic riffle-pool water, holds wild brown trout that average 12 to 16 inches with fish over 20 inches available to anglers who fish the deeper pools and undercut banks with patience and skill.\n\nBeyond the resident trout fishery, the Pere Marquette is one of Michigan's premier steelhead rivers, with runs of chromium-bright Great Lakes steelhead entering from October through April that rival their Pacific Northwest counterparts in size and fighting ability. The fall salmon run, primarily Chinook salmon averaging 15 to 25 pounds, adds another dimension to the fishing calendar. The river's gentle gradient and wadeable depths make it accessible to anglers of all skill levels, and its designation as a National Wild and Scenic River ensures that the surrounding landscape remains as undeveloped and beautiful as the fishing is productive.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1533699224246-6dc3b3ed3b1c?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1533699224246-6dc3b3ed3b1c?w=400&q=80", // PLACEHOLDER
    lengthMiles: 66,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Brown Trout", "Steelhead", "Chinook Salmon", "Brook Trout"],
    regulations:
      "Check Michigan DNR for current regulations. Flies-only section in the upper river. Steelhead and salmon regulations vary by season. Special gear restrictions apply.",
    accessPoints: [
      {
        name: "Forks Access (Flies-Only)",
        latitude: 43.9333,
        longitude: -85.8667,
        description:
          "Access to the famous flies-only section. Classic brown trout water with excellent hatches and wild, reproducing fish. Gentle wading on sand and gravel.",
        parking: true,
      },
      {
        name: "Bowman Bridge",
        latitude: 43.9000,
        longitude: -85.9500,
        description:
          "Mid-river access popular for both trout and steelhead. Good drift boat launch and productive wade water in both directions.",
        parking: true,
      },
      {
        name: "Walhalla Bridge",
        latitude: 43.9333,
        longitude: -86.0667,
        description:
          "Lower river access with excellent steelhead and salmon fishing. Deeper pools and runs that hold migratory fish through the season.",
        parking: true,
      },
    ],
    bestMonths: ["April", "May", "June", "September", "October", "November"],
    latitude: 43.93,
    longitude: -85.95,
    mapBounds: {
      sw: [-86.15, 43.85],
      ne: [-85.75, 44.0],
    },
    hatchChart: [
      {
        month: "May",
        hatches: [
          {
            insect: "Hendrickson",
            size: "#12-14",
            pattern: "Hendrickson Dry, Light Hendrickson",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, Hemingway Caddis",
            timeOfDay: "evening",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "June",
        hatches: [
          {
            insect: "Hex (Hexagenia limbata)",
            size: "#4-8",
            pattern: "Hex Dry, Roberts Yellow Drake",
            timeOfDay: "dusk to dark",
            intensity: "heavy",
          },
          {
            insect: "Sulphur",
            size: "#16-18",
            pattern: "Sulphur Dun, Comparadun",
            timeOfDay: "evening",
            intensity: "moderate",
          },
        ],
      },
    ],
    metaTitle: "Pere Marquette River Fly Fishing Guide — Michigan | Executive Angler",
    metaDescription:
      "Fly fishing the Pere Marquette River in Michigan. The first brown trout river in America with wild trout, steelhead, and National Wild and Scenic River designation.",
    featured: false,
  },
  {
    id: "river-manistee",
    slug: "manistee-river",
    name: "Manistee River",
    destinationId: "dest-michigan",
    description:
      "The Manistee River is one of Michigan's largest and most productive trout and salmon rivers, flowing over 190 miles through the forests of the northern Lower Peninsula before reaching Lake Michigan near the city of Manistee. The upper river above Tippy Dam offers outstanding wade fishing for resident brown trout in a setting of cedar swamps and hardwood forests, with the river's spring-fed tributaries maintaining cool temperatures even during the warmest summer months. The Manistee's broad, gentle current and sandy bottom make it an approachable river for anglers of all experience levels, yet its deeper pools and undercut banks harbor brown trout of genuinely impressive size.\n\nBelow Tippy Dam, the Manistee transforms into one of the Great Lakes' premier steelhead and salmon fisheries. Fall brings massive runs of Chinook salmon that stack up below the dam, followed by steelhead that enter the river from October through spring. The steelhead fishing below Tippy Dam draws anglers from across the Midwest, with fish averaging 8 to 12 pounds and occasional specimens exceeding 15 pounds providing fights that test both tackle and stamina. The river's Hex hatch on the upper sections in late June rivals the Au Sable's legendary emergence, and the diverse character of the Manistee, from intimate upper headwaters to powerful lower stretches, ensures that every type of fly angler can find water suited to their preferences and abilities.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&q=80", // PLACEHOLDER
    lengthMiles: 190,
    flowType: "freestone",
    difficulty: "beginner",
    wadingType: "both",
    primarySpecies: ["Brown Trout", "Steelhead", "Chinook Salmon", "Brook Trout"],
    regulations:
      "Check Michigan DNR for current regulations. Tippy Dam area has specific salmon and steelhead regulations. Upper river sections have trout-specific gear and harvest rules.",
    accessPoints: [
      {
        name: "CCC Bridge (Upper Manistee)",
        latitude: 44.5667,
        longitude: -84.8833,
        description:
          "Upper river access with classic trout water. Sand-bottomed stream with good dry fly fishing. Easy wading for all skill levels.",
        parking: true,
      },
      {
        name: "Sharon Bridge",
        latitude: 44.4500,
        longitude: -85.2667,
        description:
          "Mid-river access with good Hex hatch water. Wider river with productive pools and riffles. Drift boat and wade fishing.",
        parking: true,
      },
      {
        name: "Tippy Dam",
        latitude: 44.3333,
        longitude: -85.8833,
        description:
          "Below Tippy Dam for steelhead and salmon. Heavy migratory fish runs from fall through spring. Bank fishing and wading access.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September", "October", "November"],
    latitude: 44.45,
    longitude: -85.2,
    mapBounds: {
      sw: [-86.0, 44.25],
      ne: [-84.7, 44.65],
    },
    metaTitle: "Manistee River Fly Fishing Guide — Michigan | Executive Angler",
    metaDescription:
      "Fly fishing the Manistee River in Michigan. Brown trout, steelhead, and salmon in a diverse river system from intimate headwaters to powerful lower stretches.",
    featured: false,
  },
  // ==========================================
  // ARKANSAS
  // ==========================================
  {
    id: "river-white-river-ar",
    slug: "white-river-arkansas",
    name: "White River (Arkansas)",
    destinationId: "dest-arkansas",
    description:
      "The White River below Bull Shoals Dam in northern Arkansas is one of the most productive tailwater trout fisheries in the United States, supporting an extraordinary population of rainbow and brown trout in water that, before the dam was built in the 1950s, was too warm to support any trout species. The cold, clear releases from the bottom of Bull Shoals Lake transformed this section of the Ozarks into a world-class trout destination, with the river now holding both stocked and wild trout that grow to remarkable sizes on the abundant scud, sowbug, and midge populations sustained by the nutrient-rich tailwater environment.\n\nThe White River's trophy brown trout fishery is its most distinguished feature, with fish exceeding 20 inches relatively common and genuine giants over 30 inches caught with surprising regularity. The river's broad, powerful flows are best fished from a drift boat, as the changing dam release schedules create rapidly fluctuating water levels that can make wade fishing both difficult and dangerous. When generation flows are minimal, however, the White River provides excellent wade fishing in its shallower runs and riffles, with midges and sowbugs being the most productive patterns year-round. The community of guides, fly shops, and lodges around the towns of Cotter and Bull Shoals has built a thriving fly fishing culture in the heart of the Ozarks, demonstrating that world-class trout fishing can be found far from the traditional mountain strongholds of the American West.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1501446529957-6226bd447c46?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1501446529957-6226bd447c46?w=400&q=80", // PLACEHOLDER
    lengthMiles: 100,
    flowType: "tailwater",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout", "Brook Trout"],
    regulations:
      "Check Arkansas Game and Fish Commission for current regulations. Trophy trout area regulations apply on specific sections with minimum size limits and reduced creel. Check dam generation schedules before wading.",
    accessPoints: [
      {
        name: "Bull Shoals Dam",
        latitude: 36.3667,
        longitude: -92.5833,
        description:
          "Immediately below the dam. Cold, productive water with heavy midge activity. Check generation schedules for wade safety. Boat ramp available.",
        parking: true,
      },
      {
        name: "Cotter Bridge",
        latitude: 36.2833,
        longitude: -92.5333,
        description:
          "Town of Cotter access. Good wade fishing during low generation and excellent float trip section. Close to guides, shops, and lodging.",
        parking: true,
      },
      {
        name: "Buffalo City Access",
        latitude: 36.2333,
        longitude: -92.3667,
        description:
          "Lower river access near the Buffalo River confluence. Wider water with trophy brown trout potential. Less crowded than upper access points.",
        parking: true,
      },
    ],
    bestMonths: ["January", "February", "March", "April", "May", "October", "November", "December"],
    latitude: 36.3,
    longitude: -92.5,
    mapBounds: {
      sw: [-92.7, 36.15],
      ne: [-92.25, 36.45],
    },
    hatchChart: [
      {
        month: "February",
        hatches: [
          {
            insect: "Midges",
            size: "#18-24",
            pattern: "Zebra Midge, Griffith's Gnat, Mercury Midge",
            timeOfDay: "all day",
            intensity: "heavy",
          },
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
        ],
      },
      {
        month: "April",
        hatches: [
          {
            insect: "Caddis",
            size: "#14-16",
            pattern: "Elk Hair Caddis, Peacock Caddis",
            timeOfDay: "afternoon to evening",
            intensity: "heavy",
          },
          {
            insect: "Sowbugs/Scuds",
            size: "#14-18",
            pattern: "Pink Scud, Ray Charles, Sowbug",
            timeOfDay: "all day (subsurface)",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "November",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2, Sparkle Dun",
            timeOfDay: "midday to afternoon",
            intensity: "heavy",
          },
          {
            insect: "Midges",
            size: "#20-24",
            pattern: "Zebra Midge, Griffith's Gnat",
            timeOfDay: "all day",
            intensity: "heavy",
          },
        ],
      },
    ],
    metaTitle: "White River Fly Fishing Guide — Arkansas | Executive Angler",
    metaDescription:
      "Fly fishing the White River tailwater in Arkansas. Trophy brown trout and prolific midge hatches in one of the nation's finest tailwater fisheries.",
    featured: false,
  },
  {
    id: "river-norfork",
    slug: "norfork-river",
    name: "Norfork River",
    destinationId: "dest-arkansas",
    description:
      "The Norfork River in northern Arkansas is a short but extraordinarily productive tailwater that flows just 4.8 miles from Norfork Dam to its confluence with the White River, packing more trophy trout per mile into its brief run than almost any other river in the country. The cold, nutrient-rich releases from Norfork Lake create ideal conditions for rapid trout growth, and the river's dense populations of scuds, sowbugs, and midges fuel a fishery that produces brown and rainbow trout of remarkable size with unusual regularity. Fish over 20 inches are common, and the Norfork has produced multiple state record brown trout, establishing its reputation as one of the finest trophy trout destinations in the South.\n\nDespite its diminutive length, the Norfork offers surprising variety. The upper section immediately below the dam features deep, cold water with heavy current that demands weighted nymphs and indicators, while the lower stretches near the White River confluence flatten out into broader, shallower runs where dry fly fishing during midge and mayfly hatches can be exceptional. The river's small size and the dam's generation schedule make it critically important to monitor flow conditions, as the difference between wading depth and dangerous wading depth can change in minutes when the turbines activate. For anglers willing to respect the water and adapt their approach to the conditions, the Norfork delivers trophy-caliber trout fishing in a compact, accessible package.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80", // PLACEHOLDER
    lengthMiles: 5,
    flowType: "tailwater",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Brown Trout", "Rainbow Trout"],
    regulations:
      "Check Arkansas Game and Fish Commission for current regulations. Trophy trout area regulations may apply. Monitor dam generation schedules carefully for wading safety.",
    accessPoints: [
      {
        name: "Norfork Dam",
        latitude: 36.2500,
        longitude: -92.2333,
        description:
          "Below Norfork Dam. Very cold, productive water. Check generation schedules before wading. Boat ramp and bank access available.",
        parking: true,
      },
      {
        name: "Ackerman Access",
        latitude: 36.2417,
        longitude: -92.2500,
        description:
          "Mid-river access point. Good wade fishing during low generation. Productive scud and midge water with trophy brown trout.",
        parking: true,
      },
    ],
    bestMonths: ["January", "February", "March", "April", "October", "November", "December"],
    latitude: 36.245,
    longitude: -92.24,
    mapBounds: {
      sw: [-92.3, 36.21],
      ne: [-92.18, 36.28],
    },
    hatchChart: [
      {
        month: "February",
        hatches: [
          {
            insect: "Midges",
            size: "#20-26",
            pattern: "Zebra Midge, Mercury Midge, Griffith's Gnat",
            timeOfDay: "all day",
            intensity: "heavy",
          },
          {
            insect: "Sowbugs/Scuds",
            size: "#14-18",
            pattern: "Pink Scud, Ray Charles, Sowbug",
            timeOfDay: "all day (subsurface)",
            intensity: "heavy",
          },
        ],
      },
      {
        month: "November",
        hatches: [
          {
            insect: "Blue-winged Olive",
            size: "#18-22",
            pattern: "Parachute BWO, RS2",
            timeOfDay: "midday to afternoon",
            intensity: "moderate",
          },
          {
            insect: "Midges",
            size: "#20-26",
            pattern: "Zebra Midge, Griffith's Gnat",
            timeOfDay: "all day",
            intensity: "heavy",
          },
        ],
      },
    ],
    metaTitle: "Norfork River Fly Fishing Guide — Arkansas | Executive Angler",
    metaDescription:
      "Fly fishing the Norfork River tailwater in Arkansas. Trophy brown trout in one of the most productive short tailwaters in the country.",
    featured: false,
  },
  {
    id: "river-little-red",
    slug: "little-red-river",
    name: "Little Red River",
    destinationId: "dest-arkansas",
    description:
      "The Little Red River below Greers Ferry Dam in north-central Arkansas holds a special place in American fly fishing history as the home of the former world record brown trout, a 40-pound, 4-ounce specimen caught in 1992 that stunned the angling world and put this modest Ozark tailwater on the international map. While the specific conditions that produced that extraordinary fish are debated to this day, the Little Red continues to be one of the finest tailwater trout fisheries in the South, with cold, clear releases from Greers Ferry Lake supporting dense populations of rainbow trout and a smaller but significant population of trophy-capable brown trout.\n\nThe Little Red's upper section near the dam is the most productive trout water, with approximately 30 miles of cold tailwater supporting excellent populations of rainbows averaging 12 to 16 inches and browns that commonly exceed 20 inches. The river's prolific scud and sowbug populations are the foundation of its productivity, and anglers who master subsurface patterns in pink and tan will find consistent success throughout the year. Surface fishing peaks during the river's reliable blue-winged olive and midge hatches from fall through spring, when attentive anglers can spot pods of rising trout in the quieter pools and tailouts. The Little Red's combination of accessible wading during low generation, consistent year-round fishing, and the ever-present possibility of a truly extraordinary brown trout makes it a destination that should be on every serious trout angler's list.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&q=80", // PLACEHOLDER
    lengthMiles: 30,
    flowType: "tailwater",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Rainbow Trout", "Brown Trout"],
    regulations:
      "Check Arkansas Game and Fish Commission for current regulations. Special regulations apply on trophy sections near the dam. Monitor generation schedules for safe wading.",
    accessPoints: [
      {
        name: "Greers Ferry Dam (JFK Park)",
        latitude: 35.5167,
        longitude: -92.0167,
        description:
          "Below Greers Ferry Dam. Cold, productive tailwater with heavy scud populations. The most consistently productive section for both size and numbers.",
        parking: true,
      },
      {
        name: "Swinging Bridge Access",
        latitude: 35.5000,
        longitude: -92.0333,
        description:
          "Popular mid-river access. Good wade fishing during low water. Named for the pedestrian bridge that spans the river at this point.",
        parking: true,
      },
      {
        name: "Pangburn Access",
        latitude: 35.4333,
        longitude: -91.8333,
        description:
          "Lower river access with warmer water and different character. Fewer trout but larger fish possible. Good streamer water.",
        parking: true,
      },
    ],
    bestMonths: ["January", "February", "March", "April", "May", "October", "November", "December"],
    latitude: 35.5,
    longitude: -92.0,
    mapBounds: {
      sw: [-92.15, 35.38],
      ne: [-91.75, 35.58],
    },
    metaTitle: "Little Red River Fly Fishing Guide — Arkansas | Executive Angler",
    metaDescription:
      "Fly fishing the Little Red River in Arkansas. Home of the former world record brown trout with outstanding tailwater fishing below Greers Ferry Dam.",
    featured: false,
  },
  // ==========================================
  // FLORIDA KEYS
  // ==========================================
  {
    id: "river-florida-keys-flats",
    slug: "florida-keys-flats",
    name: "Florida Keys Flats",
    destinationId: "dest-florida-keys",
    description:
      "The Florida Keys flats system is the birthplace of American saltwater fly fishing, a vast network of shallow-water habitats stretching from Key Largo to Key West that has drawn anglers to its transparent, turquoise waters for over half a century. These warm, turtle-grass-covered flats are home to the three species that define saltwater fly fishing's grand slam: bonefish, permit, and tarpon. The Keys remain the only destination in the continental United States where all three species can be pursued on the same day, and for many anglers, the pursuit of a grand slam on the fly represents the ultimate achievement in the sport.\n\nThe permit fishing in the Keys is widely considered the most difficult sight-fishing challenge in all of fly fishing. These broad-shouldered, powerful fish cruise the flats in small groups, tailing as they root for crabs and shrimp in the sand, and their legendary wariness means that the vast majority of casts end in refusal or spooked fish. Landing a permit on a fly is one of the rarest and most celebrated accomplishments in angling. The tarpon fishing is equally world-class, with fish averaging 80 to 120 pounds migrating through the channels and basins of the lower Keys each spring, their massive silver bodies rolling and gulping air as they move through the crystal-clear water. The backcountry of Florida Bay and the mangrove-lined channels of the Gulf side add juvenile tarpon, snook, and redfish to the mix, creating a year-round saltwater fly fishing destination of extraordinary diversity. The Keys' established guide culture, developed over decades of pioneering saltwater fly fishing, ensures that visiting anglers benefit from generations of accumulated knowledge about these demanding, rewarding fisheries.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", // PLACEHOLDER
    flowType: "saltwater flat",
    difficulty: "advanced",
    wadingType: "both",
    primarySpecies: ["Bonefish", "Permit", "Tarpon", "Barracuda", "Snook", "Redfish"],
    regulations:
      "Check Florida FWC for current regulations. Permit and bonefish are catch-and-release only in Monroe County. Tarpon require a tag for harvest (release is standard practice). Various seasonal closures apply to different species.",
    accessPoints: [
      {
        name: "Islamorada (Middle Keys)",
        latitude: 24.9242,
        longitude: -80.6278,
        description:
          "The self-proclaimed Sport Fishing Capital of the World. Access to the Atlantic-side flats for bonefish and permit, and Florida Bay for tarpon and backcountry species.",
        parking: true,
      },
      {
        name: "Marathon (Middle Keys)",
        latitude: 24.7136,
        longitude: -81.0903,
        description:
          "Central Keys access to productive flats on both the Atlantic and Gulf sides. Good bonefish and permit flats within easy reach. Numerous guide services.",
        parking: true,
      },
      {
        name: "Key West (Lower Keys)",
        latitude: 24.5551,
        longitude: -81.7800,
        description:
          "Lower Keys access to the premier tarpon migration grounds. Spring tarpon fishing in the channels and basins surrounding Key West is world-class.",
        parking: true,
      },
    ],
    bestMonths: ["March", "April", "May", "June", "October", "November"],
    latitude: 24.75,
    longitude: -81.0,
    mapBounds: {
      sw: [-81.9, 24.4],
      ne: [-80.3, 25.1],
    },
    metaTitle: "Florida Keys Flats Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Fly fishing the Florida Keys flats. The birthplace of saltwater fly fishing with bonefish, permit, and tarpon for the ultimate grand slam challenge.",
    featured: true,
  },
  // ─── PHASE 3: IRELAND ──────────────────────────────────────────────
  {
    id: "river-moy",
    slug: "river-moy",
    name: "River Moy",
    destinationId: "dest-ireland",
    description:
      "The River Moy in County Mayo is Ireland's most prolific Atlantic salmon river, consistently producing the highest rod catches of any river in the country. Rising in the Ox Mountains of County Sligo, the Moy flows westward through the town of Ballina before entering Killala Bay on the Atlantic coast. The river and its tributaries drain a vast limestone catchment that produces alkaline, nutrient-rich water ideal for both salmon and brown trout. In a typical season, the Moy system produces between seven and ten thousand salmon to the rod, a figure that dwarfs most other Atlantic salmon rivers in western Europe.\n\nThe Moy offers an accessible and remarkably affordable Atlantic salmon fishing experience. The Moy Fishery, managed by Inland Fisheries Ireland, provides day-ticket access to prime salmon beats in and around Ballina, putting world-class salmon fishing within reach of anglers who might otherwise be priced out of the sport. The river fishes well with both single-handed and double-handed rods, with wet fly, nymph, and dry fly methods all productive depending on conditions. Spring salmon arrive from March onward, building through May and June, while the main grilse run from late June through August provides the peak of the season with aggressive, fresh-run fish in the four-to-eight-pound class that fight far above their weight.\n\nBeyond salmon, the Moy system holds excellent brown trout, particularly in the tributaries and the upper river above Foxford. Lough Conn and Lough Cullin, connected to the Moy system, offer outstanding wild brown trout fishing from drifting boats, with the mayfly hatch in May and June drawing trout to the surface in numbers that thrill even experienced lough anglers. The combination of prolific salmon fishing, wild brown trout, and the legendary hospitality of the Ballina area makes the Moy the ideal introduction to Irish fly fishing.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=1200&q=80", // PLACEHOLDER
    lengthMiles: 62,
    flowType: "freestone",
    difficulty: "beginner",
    wadingType: "both",
    primarySpecies: ["Atlantic Salmon", "Brown Trout", "Sea Trout"],
    regulations:
      "Salmon rod license required from Inland Fisheries Ireland. Catch-and-release mandatory before June 1 on most beats. Bag limits of 1 salmon per day during harvest season. Fly only on certain beats. Check current regulations with the Moy Fishery office in Ballina.",
    accessPoints: [
      {
        name: "Ridge Pool, Ballina",
        latitude: 54.1148,
        longitude: -9.1552,
        description: "The most famous salmon pool in Ireland. Day-ticket access through the Moy Fishery. Fly only, rotating beats.",
        parking: true,
      },
      {
        name: "Foxford Fishery",
        latitude: 53.9819,
        longitude: -9.1144,
        description: "Excellent salmon and brown trout water upstream of Foxford. Multiple beats available on day tickets.",
        parking: true,
      },
      {
        name: "Ballylahan Bridge",
        latitude: 53.9231,
        longitude: -9.0833,
        description: "Upper Moy access with good brown trout fishing and early-season salmon. Less crowded than the Ballina beats.",
        parking: true,
      },
    ],
    bestMonths: ["May", "June", "July", "August", "September"],
    latitude: 54.1148,
    longitude: -9.1552,
    mapBounds: {
      sw: [-9.5, 53.8],
      ne: [-8.8, 54.3],
    },
    hatchChart: [
      {
        month: "March",
        hatches: [
          { insect: "Large Dark Olive", size: "#12-14", pattern: "March Brown, Dark Olive Emerger", timeOfDay: "midday", intensity: "moderate" },
        ],
      },
      {
        month: "May",
        hatches: [
          { insect: "Mayfly (Ephemera danica)", size: "#8-10", pattern: "Spent Gnat, Green Drake, Grey Wulff", timeOfDay: "afternoon to evening", intensity: "heavy" },
          { insect: "Olive Dun", size: "#14-16", pattern: "Greenwell's Glory, Olive Quill", timeOfDay: "midday", intensity: "moderate" },
        ],
      },
      {
        month: "June",
        hatches: [
          { insect: "Mayfly (spent)", size: "#10-12", pattern: "Spent Gnat, Grey Wulff", timeOfDay: "evening", intensity: "moderate" },
          { insect: "Sedge (Caddis)", size: "#12-14", pattern: "Murrough, Elk Hair Caddis", timeOfDay: "evening", intensity: "moderate" },
        ],
      },
      {
        month: "August",
        hatches: [
          { insect: "Sedge", size: "#12-14", pattern: "Murrough, Peter Ross", timeOfDay: "evening", intensity: "moderate" },
          { insect: "Daddy Longlegs", size: "#10-12", pattern: "Daddy Longlegs, Crane Fly", timeOfDay: "afternoon", intensity: "sparse" },
        ],
      },
    ],
    metaTitle: "River Moy Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Ireland's premier Atlantic salmon river. Fish the legendary Ridge Pool and Moy Fishery beats in Ballina, County Mayo.",
    featured: false,
  },
  // ─── PHASE 3: KOLA PENINSULA ──────────────────────────────────────
  {
    id: "river-ponoi",
    slug: "ponoi-river",
    name: "Ponoi River",
    destinationId: "dest-kola-peninsula",
    description:
      "The Ponoi River is the most famous Atlantic salmon river in Russia and arguably the most productive salmon fishery remaining in the world. Flowing northeast across the Kola Peninsula for over 250 miles before emptying into the Barents Sea, the Ponoi drains a vast wilderness of tundra, birch forest, and moss-covered bogs that has never been subjected to logging, damming, or industrial development. The result is a river system of extraordinary ecological health, producing runs of Atlantic salmon that can exceed one hundred thousand fish in a single season — numbers that are almost inconceivable to anglers accustomed to the depleted salmon rivers of Scotland, Ireland, or eastern North America.\n\nThe fishing on the Ponoi is conducted from a single camp operated by Ponoi River Company, accessible only by helicopter from the regional capital of Murmansk. The camp controls over 60 miles of the lower river, offering access to dozens of named pools and runs that hold salmon from the first ice-out in early June through September. The standard technique is Spey casting with two-handed rods, swinging large flies on floating or intermediate lines through the broad, boulder-strewn pools. The salmon of the Ponoi are notably aggressive, often taking the fly with a confidence that reflects their lack of exposure to fishing pressure in the ocean approaches to the river.\n\nWhat distinguishes the Ponoi from other great salmon rivers is the consistency of its fishing. While all salmon rivers are subject to the vagaries of run timing, water conditions, and weather, the Ponoi's enormous run size means that fresh fish are entering the river continuously throughout the season, and the probability of encountering taking fish on any given day is remarkably high. Double-digit days — ten or more salmon landed per rod — are common during peak weeks, and fish average ten to fifteen pounds with specimens exceeding thirty pounds caught regularly. The experience of Spey casting through a crystal-clear pool on the Arctic tundra, with the midnight sun reflecting off the water and the next salmon strike always just a cast away, is one of the defining moments in the sport of fly fishing.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&q=80", // PLACEHOLDER
    lengthMiles: 260,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Atlantic Salmon", "Sea Trout", "Arctic Char", "Grayling"],
    regulations:
      "Strict catch-and-release for all Atlantic salmon. Single barbless hooks required. Fish handling protocols enforced by guides. All regulations managed by Ponoi River Company.",
    accessPoints: [
      {
        name: "Ryabaga Camp",
        latitude: 67.0667,
        longitude: 41.1333,
        description: "Main fishing camp on the lower Ponoi. Helicopter access only from Murmansk. All beats accessed by boat from camp.",
        parking: false,
      },
      {
        name: "Brevenny Pool",
        latitude: 67.1000,
        longitude: 40.9500,
        description: "One of the most productive pools on the river. Deep holding water with consistent salmon throughout the season.",
        parking: false,
      },
    ],
    bestMonths: ["June", "July", "August", "September"],
    latitude: 67.0667,
    longitude: 41.1333,
    mapBounds: {
      sw: [39.5, 66.5],
      ne: [42.0, 67.5],
    },
    metaTitle: "Ponoi River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "The world's most prolific Atlantic salmon river. Fly fishing the Ponoi on Russia's Kola Peninsula for world-class salmon in pristine wilderness.",
    featured: false,
  },
  // ─── PHASE 3: MONGOLIA ──────────────────────────────────────────
  {
    id: "river-eg-uur",
    slug: "eg-uur-river",
    name: "Eg-Uur River",
    destinationId: "dest-mongolia",
    description:
      "The Eg-Uur watershed in northern Mongolia is the heartland of Siberian taimen fly fishing, a remote river system flowing through forested mountains and open steppe that holds one of the healthiest remaining populations of the world's largest salmonid. The Eg River and its major tributary, the Uur, converge in a landscape of stunning natural beauty where boreal forest gives way to grassland and the only signs of human habitation are the occasional ger camp of nomadic herders. For fly anglers, the Eg-Uur represents the pinnacle of taimen fishing — big, wild fish in pristine water, pursued with large streamers, articulated flies, and mouse patterns in a setting of genuine wilderness adventure.\n\nThe taimen of the Eg-Uur system are apex predators that occupy the same ecological niche as bull trout or pike in other waters, feeding on smaller fish, rodents, and even ducklings. Fish exceeding forty inches are encountered regularly, with the largest specimens approaching sixty inches and weights over fifty pounds. The fishing technique combines streamer fishing with surface presentations — large deer-hair mouse patterns skated across the surface at dawn and dusk can produce explosive strikes from taimen that charge the fly with breathtaking aggression. The visual, predatory nature of taimen fishing on the surface is the defining experience of a Mongolian fly fishing trip, a moment of raw wilderness drama that remains indelibly imprinted on every angler who witnesses it.\n\nThe Eg-Uur also offers excellent fishing for lenok, a beautiful salmonid native to central Asian rivers that eagerly takes dry flies and nymphs in the riffly water between deeper taimen pools. Siberian grayling, with their spectacular oversized dorsal fins, provide additional sport on lighter tackle. The multi-species fishing ensures that rods are bending throughout the day, even between the explosive but sometimes infrequent taimen encounters that anchor the trip. Conservation is central to every reputable Mongolian taimen operation, with strict catch-and-release, barbless hooks, and minimal handling requirements reflecting the vulnerability of this magnificent fish.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1602850930608-ea1d7e8bd2b9?w=1200&q=80", // PLACEHOLDER
    lengthMiles: 190,
    flowType: "freestone",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Siberian Taimen", "Lenok", "Siberian Grayling", "Amur Trout"],
    regulations:
      "Strict catch-and-release for all taimen. Single barbless hooks required. Fish must remain in the water at all times during handling. Photography kept brief. All regulations enforced by guide staff.",
    accessPoints: [
      {
        name: "Eg-Uur Confluence",
        latitude: 49.8500,
        longitude: 100.5000,
        description: "The confluence of the Eg and Uur rivers. Deep pools and logjams hold the largest taimen in the system.",
        parking: false,
      },
      {
        name: "Upper Eg Camp",
        latitude: 50.0000,
        longitude: 100.2000,
        description: "Upstream camp with excellent wade fishing access. Lenok and grayling in the riffles, taimen in the deeper bends.",
        parking: false,
      },
    ],
    bestMonths: ["June", "July", "August", "September", "October"],
    latitude: 49.8500,
    longitude: 100.5000,
    mapBounds: {
      sw: [99.5, 49.3],
      ne: [101.0, 50.5],
    },
    metaTitle: "Eg-Uur River Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Pursue Siberian taimen in Mongolia's Eg-Uur watershed. The world's largest salmonid in pristine wilderness rivers of northern Mongolia.",
    featured: false,
  },
  // ─── PHASE 3: CUBA ──────────────────────────────────────────────
  {
    id: "river-jardines-de-la-reina",
    slug: "jardines-de-la-reina",
    name: "Jardines de la Reina",
    destinationId: "dest-cuba",
    description:
      "Jardines de la Reina — the Gardens of the Queen — is a 150-mile archipelago of mangrove islands, white sand flats, and coral channels stretching along Cuba's southern coast, and it stands as one of the most pristine saltwater fly fishing environments remaining in the Caribbean. Designated a marine protected area, Jardines de la Reina has been closed to commercial fishing for decades, and the result is a saltwater ecosystem of breathtaking health where schools of bonefish number in the hundreds, permit cruise the flats with a confidence rarely seen on more pressured waters, and tarpon inhabit the mangrove channels in densities that rival the Florida Keys at their historical peak.\n\nThe flats of Jardines de la Reina offer a stunning diversity of saltwater fly fishing opportunities within a compact area. Inside the reef line, vast turtle grass flats and white sand pockets hold bonefish that average three to five pounds, with larger fish regularly encountered. The channels between mangrove islands concentrate bait and predators, creating natural ambush points where tarpon ranging from juvenile twenty-pounders to hundred-pound adults roll and feed. Permit are found throughout the system, cruising the flats in small groups, their dark tails tipping above the surface as they root for crabs and shrimp in the turtle grass.\n\nThe grand slam potential of Jardines de la Reina — bonefish, permit, and tarpon in a single day — is among the highest of any destination in the Caribbean. Multi-species days are the norm, with anglers often adding barracuda, jacks, and various snapper species to their tally. The fishing is conducted from poled skiffs with experienced Cuban guides who have spent their careers learning the intricacies of the archipelago's tides, channels, and flats. Most operations are based on live-aboard motherships that anchor in protected channels, providing comfortable accommodations and the flexibility to move with the fishing conditions.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80", // PLACEHOLDER
    flowType: "saltwater flat",
    difficulty: "intermediate",
    wadingType: "both",
    primarySpecies: ["Bonefish", "Permit", "Tarpon", "Barracuda", "Jacks"],
    regulations:
      "Catch-and-release required for all species on most operations. Marine protected area rules enforced by Cuban park rangers. Barbless hooks required. No fishing in designated no-take zones.",
    accessPoints: [
      {
        name: "Central Flats",
        latitude: 21.0500,
        longitude: -79.5000,
        description: "The heart of the Jardines bonefish flats. Vast turtle grass flats with consistent bonefish and permit.",
        parking: false,
      },
      {
        name: "Mangrove Channels",
        latitude: 20.9500,
        longitude: -79.7000,
        description: "Deep mangrove channels holding tarpon and snook. Best fished on incoming tides.",
        parking: false,
      },
    ],
    bestMonths: ["February", "March", "April", "May", "June"],
    latitude: 21.0500,
    longitude: -79.5000,
    mapBounds: {
      sw: [-80.5, 20.5],
      ne: [-78.5, 21.5],
    },
    metaTitle: "Jardines de la Reina Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Cuba's premier saltwater fly fishing. Bonefish, permit, and tarpon on pristine flats in the Jardines de la Reina marine protected area.",
    featured: false,
  },
  // ─── PHASE 3: MALDIVES ──────────────────────────────────────────
  {
    id: "river-north-male-atoll",
    slug: "north-male-atoll",
    name: "North Malé Atoll",
    destinationId: "dest-maldives",
    description:
      "North Malé Atoll is the gateway to fly fishing in the Maldives, a ring of coral islands enclosing a turquoise lagoon where the Indian Ocean's most exciting game fish patrol channels, reef edges, and sand flats in extraordinary abundance. The atoll's structure — a perimeter of coral reef punctuated by deep channels connecting the inner lagoon to the open ocean — creates a natural concentration point for predatory species, with giant trevally, bluefin trevally, triggerfish, and bonefish all within reach of the fly angler working from a poled skiff or wading the atoll's interior flats.\n\nThe giant trevally fishing on North Malé Atoll is the headline attraction, drawing fly anglers from around the world for the chance to cast large poppers and streamers to one of the ocean's most powerful predators. GTs patrol the channel mouths and reef edges, ambushing baitfish on the tidal exchanges with explosive strikes that test the limits of twelve-weight tackle. Sight-casting to cruising GTs on the flats is the ultimate experience — spotting a dark shape moving across the white sand, leading the fish with a large fly, and waiting for the volcanic take that follows. Fish of fifty to eighty pounds are realistic targets, with specimens exceeding one hundred pounds a genuine possibility.\n\nInside the atoll, the flats hold bonefish, triggerfish, and a variety of reef species that provide excellent sight-fishing on lighter tackle between GT sessions. The triggerfish — particularly the giant triggerfish — have developed a cult following among visiting fly anglers, their selective feeding behavior and powerful fights making them a prized catch. Bonefish on Maldivian flats tend to be modest in size compared to Caribbean populations, but they are present in good numbers and provide fast action on seven- and eight-weight outfits. The visual clarity of the water, the diversity of species, and the sheer beauty of the atoll environment make North Malé Atoll a sensory overload for the saltwater fly angler.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80", // PLACEHOLDER
    flowType: "saltwater flat",
    difficulty: "advanced",
    wadingType: "both",
    primarySpecies: ["Giant Trevally", "Bluefin Trevally", "Bonefish", "Triggerfish"],
    regulations:
      "Catch-and-release practiced on all reputable operations. Fishing prohibited inside marine protected zones. Coral reef protection measures strictly enforced. Operators follow GT handling and release protocols.",
    accessPoints: [
      {
        name: "Eastern Channel",
        latitude: 4.3500,
        longitude: 73.5500,
        description: "Deep channel mouth where GTs ambush baitfish on tidal exchanges. Best on incoming tides.",
        parking: false,
      },
      {
        name: "Inner Lagoon Flats",
        latitude: 4.3000,
        longitude: 73.5000,
        description: "White sand flats inside the atoll with bonefish, triggerfish, and juvenile GTs.",
        parking: false,
      },
    ],
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    latitude: 4.3000,
    longitude: 73.5000,
    mapBounds: {
      sw: [73.2, 4.0],
      ne: [73.8, 4.7],
    },
    metaTitle: "North Malé Atoll Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Giant trevally and tropical saltwater species on the Maldives' North Malé Atoll. Sight-casting to GTs on pristine Indian Ocean flats.",
    featured: false,
  },
];
