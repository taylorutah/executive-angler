import type { Destination } from "@/types/entities";

export const destinations: Destination[] = [
  {
    id: "dest-montana",
    slug: "montana",
    name: "Montana",
    region: "Northern Rockies",
    country: "United States",
    state: "Montana",
    tagline: "The Last Best Place for Fly Fishing",
    description:
      "Montana stands alone as the premier fly fishing destination in North America, a vast landscape of mountain ranges, sweeping valleys, and thousands of miles of blue-ribbon trout water that has captivated anglers for over a century. From the spring creeks of Paradise Valley to the legendary freestone rivers of the Greater Yellowstone Ecosystem, Montana offers a diversity of fly fishing experiences unmatched anywhere on Earth. The state's relatively low population density means that even on popular rivers during peak season, an angler willing to walk a short distance can find solitude and rising trout in equal measure.\n\nThe fly fishing culture in Montana runs deep, woven into the fabric of small towns like West Yellowstone, Ennis, Craig, and Livingston where fly shops outnumber fast food restaurants and the morning fishing report is more closely followed than the stock market. This is the landscape that inspired Norman Maclean's A River Runs Through It, and the reverence for cold water and wild trout that permeates the story is still palpable in every river valley across the state. Montana's commitment to wild trout management, with an emphasis on catch-and-release regulations and habitat conservation, has produced fisheries that continue to improve even as angling pressure has grown.\n\nWhat makes Montana truly exceptional for the visiting angler is the sheer variety of water available within a day's drive. In a single week based out of southwestern Montana, an angler could float the Madison River through broad ranchland casting hoppers to aggressive rainbows, wade the pocket water of the Gallatin Canyon stalking cutthroats behind boulders, drift nymphs through the deep runs of the Missouri River tailwater below Holter Dam, and finish the trip sight-fishing to rising brown trout on a spring creek in Paradise Valley. Add to this the stunning Rocky Mountain scenery, abundant wildlife, and a tradition of Western hospitality, and it becomes clear why Montana remains the destination that every serious fly angler eventually makes a pilgrimage to.\n\nThe fishing season in Montana typically runs from late May through October, with each month offering distinct opportunities. Early season brings the legendary salmonfly hatch on the Madison and Big Hole rivers, while midsummer delivers prolific caddis and mayfly activity along with outstanding hopper fishing. Fall brings solitude, brilliant foliage, and the chance to target large brown trout on streamers as they stage for their autumn spawn. Even winter offers opportunities for the dedicated angler, with midges and blue-winged olives providing surprisingly good dry fly fishing on warmer afternoons along tailwater sections.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80", // PLACEHOLDER
    latitude: 46.8797,
    longitude: -110.3626,
    bestMonths: [
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
    ],
    primarySpecies: [
      "Rainbow Trout",
      "Brown Trout",
      "Cutthroat Trout",
      "Mountain Whitefish",
      "Arctic Grayling",
    ],
    licenseInfo:
      "Montana fishing license required for all anglers 15 and older. Non-resident season license or short-term options available through Montana FWP. A conservation license is required in addition to the fishing license.",
    elevationRange: "3,000 - 10,000+ ft",
    climateNotes:
      "Semi-arid continental climate with warm summers and cold winters. Summer daytime highs of 70-90F with cool nights. Afternoon thunderstorms common in July and August. Fall brings crisp days and cold nights with early snow possible by October. Be prepared for rapidly changing mountain weather at any time.",
    regulationsSummary:
      "Montana has moved toward wild trout management with catch-and-release regulations on many blue-ribbon streams. Barbless hooks are required or recommended on many waters. Always check the current Montana FWP regulations book for specific river rules, as they vary by section and species.",
    metaTitle: "Montana Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Montana's world-class fly fishing. Explore the Madison, Gallatin, Yellowstone, and Missouri rivers with our comprehensive guide to the Last Best Place.",
    featured: true,
    sortOrder: 1,
  },
  {
    id: "dest-wyoming",
    slug: "wyoming",
    name: "Wyoming",
    region: "Northern Rockies",
    country: "United States",
    state: "Wyoming",
    tagline: "Wild Trout in the Shadow of the Tetons",
    description:
      "Wyoming offers some of the most spectacular fly fishing scenery in the West, with the Snake River winding beneath the Grand Tetons and Yellowstone's backcountry streams holding native cutthroat trout in pristine wilderness settings. The state's low population and vast public lands mean solitude is never far away, and the fishing ranges from technical spring creeks to tumbling mountain freestone rivers teeming with eager trout.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // PLACEHOLDER
    latitude: 43.0759,
    longitude: -107.2903,
    bestMonths: ["June", "July", "August", "September"],
    primarySpecies: ["Cutthroat Trout", "Rainbow Trout", "Brown Trout"],
    featured: false,
    sortOrder: 2,
  },
  {
    id: "dest-colorado",
    slug: "colorado",
    name: "Colorado",
    region: "Central Rockies",
    country: "United States",
    state: "Colorado",
    tagline: "Gold Medal Waters at High Altitude",
    description:
      "Colorado's Gold Medal trout waters offer exceptional fly fishing across a diverse landscape, from the deep canyons of the South Platte and Arkansas rivers to the high-altitude streams of the Rocky Mountain headwaters. The state's tailwater fisheries produce remarkable numbers of large trout, while alpine lakes and backcountry creeks provide solitude and the thrill of native cutthroat trout above timberline.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80", // PLACEHOLDER
    latitude: 39.5501,
    longitude: -105.7821,
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
    featured: false,
    sortOrder: 3,
  },
  {
    id: "dest-idaho",
    slug: "idaho",
    name: "Idaho",
    region: "Northern Rockies",
    country: "United States",
    state: "Idaho",
    tagline: "The Gem State's Hidden Trout Waters",
    description:
      "Idaho is one of the most underrated fly fishing destinations in the American West, offering iconic waters like the Henry's Fork of the Snake River, Silver Creek, and the South Fork of the Boise. The state's vast wilderness areas, including the Frank Church River of No Return Wilderness, provide backcountry fly fishing adventures that are increasingly rare in the modern world.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80", // PLACEHOLDER
    latitude: 44.0682,
    longitude: -114.742,
    bestMonths: ["June", "July", "August", "September"],
    primarySpecies: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
    featured: false,
    sortOrder: 4,
  },
  {
    id: "dest-alaska",
    slug: "alaska",
    name: "Alaska",
    region: "Pacific Northwest",
    country: "United States",
    state: "Alaska",
    tagline: "The Final Frontier of Fly Fishing",
    description:
      "Alaska represents the ultimate fly fishing frontier, where massive rainbow trout gorge on salmon eggs in glacial rivers, silver salmon slam streamers in coastal estuaries, and Arctic grayling rise freely in waters untouched by civilization. The sheer abundance of fish and the raw wilderness setting make an Alaskan fly fishing trip a once-in-a-lifetime experience that redefines what is possible with a fly rod.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1531176175280-109da1a28f25?w=1200&q=80", // PLACEHOLDER
    latitude: 61.2181,
    longitude: -149.9003,
    bestMonths: ["June", "July", "August", "September"],
    primarySpecies: [
      "Rainbow Trout",
      "Arctic Grayling",
      "King Salmon",
      "Silver Salmon",
      "Sockeye Salmon",
    ],
    featured: false,
    sortOrder: 5,
  },
  {
    id: "dest-new-zealand",
    slug: "new-zealand",
    name: "New Zealand",
    region: "South Island",
    country: "New Zealand",
    tagline: "Sight Fishing Paradise at the Bottom of the World",
    description:
      "New Zealand's crystal-clear rivers and streams offer what many anglers consider the pinnacle of sight fishing for trout. Introduced brown and rainbow trout have thrived in the pristine waters of both the North and South Islands, growing to remarkable sizes in rivers so transparent that individual fish can be spotted and stalked from considerable distances. The backcountry rivers of the South Island, accessible only by helicopter or multi-day hikes, provide a hunting-style approach to fly fishing that is unmatched anywhere else.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&q=80", // PLACEHOLDER
    latitude: -43.5321,
    longitude: 172.6362,
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    primarySpecies: ["Brown Trout", "Rainbow Trout"],
    featured: false,
    sortOrder: 6,
  },
  {
    id: "dest-patagonia",
    slug: "patagonia",
    name: "Patagonia, Argentina",
    region: "Patagonia",
    country: "Argentina",
    tagline: "South America's Untamed Trout Frontier",
    description:
      "Patagonia's windswept steppe and towering Andes peaks frame some of the most productive and scenic trout rivers in the Southern Hemisphere. The region's rivers, fed by snowmelt and glacial lakes, support robust populations of brown and rainbow trout that were introduced over a century ago and have flourished in the cold, nutrient-rich waters. The fishing season coincides with the Northern Hemisphere's off-season, making Patagonia a perfect winter escape for dedicated trout anglers.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80", // PLACEHOLDER
    latitude: -41.1335,
    longitude: -71.3103,
    bestMonths: ["November", "December", "January", "February", "March"],
    primarySpecies: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
    featured: false,
    sortOrder: 7,
  },
  {
    id: "dest-british-columbia",
    slug: "british-columbia",
    name: "British Columbia, Canada",
    region: "Pacific Northwest",
    country: "Canada",
    tagline: "Wild Steelhead and Pristine Wilderness",
    description:
      "British Columbia is a fly fishing destination of staggering diversity, from the legendary steelhead rivers of the Skeena watershed to the interior stillwater lakes that produce trophy rainbow trout on chironomid and dragonfly patterns. The province's vast wilderness, towering coastal rainforests, and commitment to wild fish conservation create an experience that combines world-class fishing with true immersion in one of the last great wild places on the Pacific coast.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80", // PLACEHOLDER
    latitude: 53.7267,
    longitude: -127.6476,
    bestMonths: ["June", "July", "August", "September", "October"],
    primarySpecies: [
      "Rainbow Trout",
      "Steelhead",
      "Cutthroat Trout",
      "Bull Trout",
    ],
    featured: false,
    sortOrder: 8,
  },
  {
    id: "dest-bahamas",
    slug: "bahamas",
    name: "Bahamas",
    region: "Caribbean",
    country: "Bahamas",
    tagline: "World Capital of Bonefish on the Fly",
    description:
      "The Bahamas is the spiritual home of bonefishing, offering thousands of square miles of pristine saltwater flats that hold the densest populations of bonefish in the Western Hemisphere. From the fabled flats of Andros Island to the remote cays of the Exumas, the Bahamian archipelago provides a stunning tropical backdrop for sight casting to tailing bonefish in gin-clear water. The islands also offer outstanding permit, tarpon, and barracuda fishing for anglers seeking a saltwater grand slam.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80", // PLACEHOLDER
    latitude: 24.3966,
    longitude: -76.0025,
    bestMonths: [
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
      "April",
      "May",
    ],
    primarySpecies: ["Bonefish", "Permit", "Tarpon", "Barracuda"],
    featured: false,
    sortOrder: 9,
  },
  {
    id: "dest-iceland",
    slug: "iceland",
    name: "Iceland",
    region: "North Atlantic",
    country: "Iceland",
    tagline: "Atlantic Salmon and Arctic Char in the Land of Fire and Ice",
    description:
      "Iceland offers a fly fishing experience unlike anywhere else on Earth, combining prolific runs of Atlantic salmon and stunning populations of Arctic char with a volcanic landscape of geysers, glaciers, and midnight sun. The country's strictly managed river systems, available through a rod-rotation beat system, produce exceptional catch rates for Atlantic salmon on the fly, while remote highland lakes and streams hold abundant Arctic char that rise eagerly to small dry flies throughout the brief but intense summer season.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80", // PLACEHOLDER
    latitude: 64.9631,
    longitude: -19.0208,
    bestMonths: ["June", "July", "August", "September"],
    primarySpecies: ["Atlantic Salmon", "Arctic Char", "Brown Trout"],
    featured: false,
    sortOrder: 10,
  },
];
