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
      "https://images.unsplash.com/photo-1625027589032-cc9955080931?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1625027589032-cc9955080931?w=400&q=80",
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
      "Wyoming delivers a fly fishing experience that is equal parts grandeur and intimacy, set against some of the most dramatic mountain scenery on the continent. The state's crown jewel is Yellowstone National Park, where the Yellowstone, Firehole, and Lamar rivers harbor native Yellowstone cutthroat trout in waters surrounded by geothermal features, grizzly bears, and herds of bison. Outside the park, the Snake River carves through the floor of Jackson Hole beneath the towering Teton Range, offering outstanding float fishing for fine-spotted Snake River cutthroat trout that rise willingly to dry flies from June through October.\n\nThe diversity of water in Wyoming extends far beyond these marquee fisheries. The North Platte River in south-central Wyoming produces some of the largest trout in the Rockies, particularly in the Miracle Mile and Grey Reef sections where tailwater conditions nurture trophy rainbows and browns that regularly exceed twenty inches. The Bighorn River near Thermopolis and the Wind River on the Wind River Reservation provide additional world-class tailwater opportunities, while the numerous small streams draining the Absaroka, Wind River, and Bighorn mountain ranges offer backcountry solitude and native cutthroat populations that see remarkably few anglers each season.\n\nWyoming's fishing culture is defined by its emphasis on wild, self-sustaining trout populations and the conservation of native cutthroat subspecies. The state has invested heavily in the removal of non-native species from key cutthroat waters and the restoration of native populations to their historic range. For the visiting angler, this means an opportunity to catch fish that have inhabited these watersheds for thousands of years, a connection to wild places that is increasingly rare in the modern angling world. The landscape itself is part of the draw, with towering peaks, sagebrush-covered basins, deep canyons, and wide-open skies that make every day on the water feel like an expedition into the frontier West.\n\nThe prime season in Wyoming runs from late June through September, with the early weeks often complicated by high runoff from snowmelt at elevation. July and August bring reliable hatches of pale morning duns, caddis, and terrestrials, while September offers lower water, cooperative fish, and the first hints of autumn color. The state sees far less angling pressure than neighboring Montana, and anglers willing to explore beyond Jackson Hole and Yellowstone will find exceptional fishing with solitude that is increasingly hard to come by in the Rocky Mountain West.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1598637885393-7efc83ab3950?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1598637885393-7efc83ab3950?w=400&q=80",
    latitude: 43.0759,
    longitude: -107.2903,
    bestMonths: ["June", "July", "August", "September", "October"],
    primarySpecies: [
      "Cutthroat Trout",
      "Rainbow Trout",
      "Brown Trout",
      "Mountain Whitefish",
      "Brook Trout",
    ],
    licenseInfo:
      "Wyoming Game and Fish license required. Non-resident daily, 5-day, and season licenses available online. Yellowstone National Park requires a separate park fishing permit. Special regulations apply on the Wind River Reservation.",
    elevationRange: "4,000 - 13,000+ ft",
    climateNotes:
      "High-altitude continental climate with short summers and long winters. Summer highs of 65-85F with cool evenings. Afternoon thunderstorms common in the mountains July through August. Snow possible at elevation even in summer months. Wind is a near-constant companion, especially in open basins.",
    regulationsSummary:
      "Wyoming emphasizes wild trout management with catch-and-release regulations on many premier waters. Artificial flies and lures only on designated stretches. Specific regulations apply to cutthroat trout conservation waters. Yellowstone National Park has its own set of regulations that must be followed within park boundaries.",
    metaTitle: "Wyoming Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Wyoming's wild trout waters beneath the Tetons and through Yellowstone. Our guide covers the Snake, North Platte, and backcountry cutthroat streams.",
    featured: true,
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
      "Colorado's designation of Gold Medal trout waters has become a benchmark of quality recognized by anglers worldwide, and the state earns that reputation with a remarkable collection of tailwaters, freestone rivers, and mountain streams distributed across some of the highest terrain in the Lower 48. The South Platte River system, from Cheesman Canyon's technical spring creek-like currents to the wide riffles of Deckers, produces trout of extraordinary size and selectivity that will test even the most accomplished nymph fisherman. Meanwhile, the Frying Pan River below Ruedi Reservoir has earned a near-mythical reputation for trophy rainbows that sip tiny midges in gin-clear tailwater flows.\n\nThe Arkansas River corridor from Leadville to Canon City offers one of the longest stretches of Gold Medal water in the state, with brown trout populations that thrive in the freestone pocket water and deep runs carved through high-desert canyon walls. The Colorado, Eagle, and Roaring Fork rivers on the Western Slope provide exceptional dry fly fishing during summer, when prolific hatches of green drakes, pale morning duns, and caddis bring large trout to the surface in breathtaking Rocky Mountain valleys. For those willing to hike above timberline, Colorado's alpine lakes and streams hold native greenback cutthroat trout in some of the most stunning settings imaginable, with fishing at elevations exceeding twelve thousand feet.\n\nColorado's proximity to the Denver metropolitan area means that some waters see significant pressure, but the state's vast public lands and extensive network of trails provide access to remote fishing that rivals anything in the West. The Gold Medal program itself, which recognizes waters capable of sustaining at least sixty pounds of trout per acre and at least twelve fish of fourteen inches or larger per acre, ensures that designated stretches receive the management attention necessary to maintain trophy-caliber fisheries. Special regulations on these waters typically include artificial flies and lures only, with reduced bag limits or catch-and-release requirements.\n\nThe Colorado fishing calendar begins in earnest with spring midge and blue-winged olive hatches on the tailwaters, building through the runoff period in May and June to peak activity in July and August when terrestrial patterns and attractor dry flies produce explosive surface takes. Fall fishing from September through November is arguably the finest season, with low water, reduced crowds, spawning brown trout aggressively defending their redds, and reliable afternoon hatches of blue-winged olives that can produce the best dry fly fishing of the year.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1549286521-7417e535c72f?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1549286521-7417e535c72f?w=400&q=80",
    latitude: 39.5501,
    longitude: -105.7821,
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    primarySpecies: [
      "Rainbow Trout",
      "Brown Trout",
      "Cutthroat Trout",
      "Brook Trout",
      "Mountain Whitefish",
    ],
    licenseInfo:
      "Colorado Parks and Wildlife fishing license required. Non-resident 1-day, 5-day, and annual licenses available online or at license agents. A Habitat Stamp is included with most license purchases.",
    elevationRange: "5,000 - 14,000+ ft",
    climateNotes:
      "High-altitude semi-arid climate with intense sun and dramatic temperature swings. Summer highs of 70-90F at lower elevations, significantly cooler at altitude. Afternoon thunderstorms nearly daily in July and August, often with lightning above timberline. Thin air and strong UV require sun protection year-round.",
    regulationsSummary:
      "Gold Medal waters carry special regulations including artificial flies and lures only, catch-and-release or reduced bag limits. Wild trout waters have additional restrictions. Regulations vary significantly by water and section, so consult the current CPW brochure before fishing.",
    metaTitle: "Colorado Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Colorado's Gold Medal trout waters. From the South Platte to the Frying Pan, our guide covers the best fly fishing in the Centennial State.",
    featured: true,
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
      "Idaho remains one of the most underappreciated fly fishing destinations in the American West, a state where legendary waters flow through landscapes ranging from high desert lava plains to dense alpine forests, and where the sheer volume of fishable water ensures that solitude is always within reach. The Henry's Fork of the Snake River near Island Park is rightfully celebrated as one of the most challenging and rewarding dry fly fisheries on Earth, with its glassy spring-fed currents, prolific hatches of green drakes and pale morning duns, and large rainbow trout that have humbled generations of skilled anglers in the Railroad Ranch section.\n\nSilver Creek, a spring creek near Sun Valley, offers similarly technical fishing in a preserve setting where enormous brown and rainbow trout feed selectively on tiny insects in water so clear that every refusal is visible in excruciating detail. For anglers who prefer more forgiving water, the South Fork of the Snake River downstream from Palisades Reservoir provides outstanding float fishing through a scenic canyon, with aggressive cutthroat trout that take dry flies and nymphs with an enthusiasm that makes the South Fork one of the most productive big-fish rivers in the region.\n\nBeyond these headline waters, Idaho's true treasure lies in its backcountry. The Frank Church River of No Return Wilderness, the largest contiguous wilderness area in the Lower 48, contains the Middle Fork of the Salmon River, a multi-day float trip through pristine canyon country where native westslope cutthroat trout rise to attractor patterns in rapids-studded pools with no road access and no cell signal. The Selway, Lochsa, and St. Joe rivers in the northern panhandle offer additional wild trout fishing in old-growth forests that feel untouched by the modern world. Idaho's stillwater fishing is equally compelling, with Henrys Lake producing trophy hybrid cutthroat-rainbow trout and the countless high mountain lakes of the Sawtooth and White Cloud ranges harboring brook, cutthroat, and golden trout.\n\nThe fishing season in Idaho varies dramatically by elevation and water type, but generally runs from late May through November. The Henry's Fork and Silver Creek fish best from June through October, with peak dry fly activity in late June and early July. The South Fork offers reliable action from July through October. Backcountry wilderness trips are best planned for July and August when water levels have dropped and mountain passes are clear of snow.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1609365697525-c42476d52f83?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1609365697525-c42476d52f83?w=400&q=80",
    latitude: 44.0682,
    longitude: -114.742,
    bestMonths: ["June", "July", "August", "September", "October"],
    primarySpecies: [
      "Rainbow Trout",
      "Brown Trout",
      "Cutthroat Trout",
      "Brook Trout",
      "Steelhead",
    ],
    licenseInfo:
      "Idaho Fish and Game license required. Non-resident season, 3-day, and 1-day licenses available online. A steelhead permit is required in addition to the fishing license for steelhead fishing. Check current regulations for specific river rules.",
    elevationRange: "2,000 - 12,000+ ft",
    climateNotes:
      "Varied climate from high desert in the south to maritime-influenced conditions in the north. Summer highs of 75-95F in river valleys with cool nights. Mountain areas significantly cooler. Afternoon thunderstorms common in July and August. Northern Idaho receives considerable precipitation year-round.",
    regulationsSummary:
      "Idaho manages trout waters with a mix of general and special regulations. The Henry's Fork Railroad Ranch is catch-and-release with barbless hooks. Silver Creek is catch-and-release on the Nature Conservancy section. Many backcountry waters have specific cutthroat conservation rules. Always consult the current IDFG regulation booklet.",
    metaTitle: "Idaho Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Idaho's world-class fly fishing from the Henry's Fork to Silver Creek and the wilderness rivers of the Frank Church. A complete angler's guide.",
    featured: true,
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
      "Alaska represents the ultimate expression of abundance in the fly fishing world, a land where rivers run thick with wild salmon, rainbow trout grow to proportions rarely seen elsewhere, and the wilderness setting is so vast and untouched that it fundamentally reshapes an angler's understanding of what a healthy fishery looks like. The state's Bristol Bay region, anchored by rivers like the Kvichak, Naknek, Alagnak, and countless smaller tributaries draining into the bay, produces the greatest sockeye salmon run on Earth each summer, and the rainbow trout that feed on the resulting bounty of salmon eggs and flesh grow to astonishing sizes, with fish exceeding thirty inches taken regularly on egg patterns and flesh flies.\n\nBeyond Bristol Bay, the Kenai Peninsula offers accessible fly fishing for all five species of Pacific salmon along with resident rainbow trout and Dolly Varden char, while the remote rivers of the Alaska Peninsula, Kodiak Island, and the western coast provide expedition-level fishing for anglers seeking true wilderness. The Kanektok, Goodnews, and Togiak rivers on the western coast produce some of the finest mixed-species fishing in the state, where an angler might land king salmon, silver salmon, rainbow trout, Arctic grayling, and Dolly Varden all in the same day. In Southeast Alaska, the rainforest-shrouded rivers of the Tongass National Forest hold steelhead, cutthroat trout, and salmon in a temperate coastal environment that feels worlds apart from the tundra of the interior.\n\nThe logistics of fishing Alaska are part of the experience. Many of the best waters are accessible only by floatplane, and guided lodge-based trips or fully outfitted float trips are the standard mode of access. The investment is significant, but the return is fishing that cannot be replicated anywhere else. Standing in a Bristol Bay tributary watching thousands of salmon push upstream, with grizzly bears fishing the far bank and bald eagles circling overhead, while a twenty-eight-inch rainbow trout tugs at the end of your line is an experience that will permanently recalibrate your expectations for what fly fishing can be.\n\nThe Alaska fishing calendar begins in June with king salmon and the first rainbow trout activity, builds through July with sockeye runs and excellent trout fishing on egg patterns, peaks in August and September with silver salmon flooding coastal rivers and rainbow trout at their most aggressive, and concludes in October as the last silvers move upriver and trout gorge on decaying salmon flesh before winter sets in.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1667128494321-9c5bbe01edb7?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1667128494321-9c5bbe01edb7?w=400&q=80",
    latitude: 59.4545,
    longitude: -155.2583,
    bestMonths: ["June", "July", "August", "September", "October"],
    primarySpecies: [
      "Rainbow Trout",
      "King Salmon",
      "Silver Salmon",
      "Sockeye Salmon",
      "Arctic Grayling",
      "Dolly Varden",
    ],
    licenseInfo:
      "Alaska Department of Fish and Game license required. Non-resident annual, 14-day, 7-day, 3-day, and 1-day options available. A King Salmon stamp is required to fish for king salmon. Licenses can be purchased online or at vendors throughout the state.",
    elevationRange: "Sea level - 3,000 ft (typical fishing areas)",
    climateNotes:
      "Highly variable by region. Bristol Bay sees cool summers with highs of 50-65F and frequent rain. Kenai Peninsula is slightly warmer. Southeast Alaska is wet and temperate. Interior is warmest in summer. Be prepared for rain, wind, and cool temperatures at all times. Layering is essential.",
    regulationsSummary:
      "Alaska manages fisheries by specific river and species with detailed emergency orders that can change daily based on run strength. Single barbless hooks required on many waters. Catch-and-release for rainbow trout on most premier waters. Check ADF&G emergency orders before each day of fishing.",
    metaTitle: "Alaska Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Plan your Alaska fly fishing adventure. From Bristol Bay rainbows to Kenai salmon, our guide covers the Last Frontier's greatest angling opportunities.",
    featured: true,
    sortOrder: 5,
  },
  {
    id: "dest-new-zealand",
    slug: "new-zealand",
    name: "New Zealand",
    region: "South Pacific",
    country: "New Zealand",
    tagline: "Sight Fishing Paradise at the Bottom of the World",
    description:
      "New Zealand stands apart in the fly fishing world as the undisputed capital of sight fishing for trout, a place where the clarity of the water, the size of the fish, and the hunting-style approach to angling combine to create an experience that many consider the pinnacle of the sport. Brown and rainbow trout were introduced to New Zealand in the late nineteenth century, and they found an environment so perfectly suited to their needs that they thrived beyond all expectations. Today, the rivers and streams of both the North and South Islands hold trout that average four to six pounds, with fish exceeding ten pounds a realistic possibility on any given day.\n\nThe South Island is the epicenter of New Zealand's trout fishing reputation. Rivers like the Mataura, Oreti, and Aparima in Southland produce outstanding brown trout fishing in waters surrounded by pastoral farmland, while the backcountry rivers of Fiordland, the West Coast, and the Nelson Lakes region offer wilderness fishing for large trout in water so transparent that every pebble on the streambed is visible at depth. Helicopter access to remote headwaters is a defining feature of the New Zealand experience, allowing anglers to reach untouched pools where a single large brown trout might hold in a crystal-clear run, visible from fifty feet away, waiting to be stalked with a precise upstream cast.\n\nThe North Island offers its own distinct character. The volcanic plateau rivers near Taupo, including the Tongariro, Tauranga-Taupo, and Waitahanui, are renowned for their runs of large rainbow trout that migrate from Lake Taupo to spawn in the tributaries. The Tongariro River in particular has earned a devoted international following for its winter nymphing and its powerful, acrobatic rainbows that average five to seven pounds. Spring creeks in the Wairarapa and Hawke's Bay regions provide technical dry fly fishing in pastoral settings that evoke the chalk streams of England.\n\nThe New Zealand trout season runs from October through April on most rivers, with the North Island's Taupo region open year-round. The best sight fishing on the South Island typically occurs from December through March when water levels drop and visibility improves. A licensed New Zealand guide is an invaluable asset, as local knowledge of fish-holding water, access points on private land, and the helicopter logistics of backcountry trips is difficult to replicate independently.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1625027588969-8c30887f52ba?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1625027588969-8c30887f52ba?w=400&q=80",
    latitude: -43.5321,
    longitude: 172.6362,
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    primarySpecies: ["Brown Trout", "Rainbow Trout"],
    licenseInfo:
      "A New Zealand fishing license is required and can be purchased from Fish & Game New Zealand. Whole season, week, and day licenses available. The Taupo region requires a separate license administered by the Department of Conservation. Foreign visitors can purchase licenses online.",
    elevationRange: "Sea level - 3,000 ft (typical fishing areas)",
    climateNotes:
      "Temperate maritime climate with mild summers and cool winters. South Island summer highs of 60-75F with cool nights. North Island slightly warmer. Rain can occur at any time, especially on the West Coast. Sandflies are a significant nuisance near many rivers. Pack insect repellent and rain gear.",
    regulationsSummary:
      "Regulations vary by Fish & Game region. Many backcountry rivers are catch-and-release with barbless hooks. Bag limits are typically one to two fish per day on most waters. Some rivers have fly-only or artificial-lure-only restrictions. Check the relevant Fish & Game region rules before fishing.",
    metaTitle: "New Zealand Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore New Zealand's world-renowned sight fishing for trophy brown and rainbow trout. Our guide covers the South Island backcountry to Taupo's legendary rivers.",
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
      "Argentine Patagonia occupies a singular position in the fly fishing imagination, a place where the vast windswept steppe gives way to the snow-capped Andes and rivers of staggering beauty carry trout populations that have flourished for over a century since their introduction from Europe and North America. The region centered around the towns of Junin de los Andes, San Martin de los Andes, and Bariloche offers a concentration of world-class trout rivers that ranks with any destination on the planet, all set against a backdrop of volcanic peaks, ancient forests of southern beech, and turquoise glacial lakes that make Patagonia one of the most visually spectacular places an angler will ever cast a fly.\n\nThe Rio Malleo, flowing from Lago Tromen near the Chilean border, is widely regarded as one of the finest brown trout rivers in South America, with selective, well-educated fish that demand precise presentations in clear, spring-fed currents. The Chimehuin River, one of the largest and most productive fisheries in the region, supports both brown and rainbow trout that exceed twenty inches with regularity, with the lower river offering outstanding streamer fishing for trophy browns during the autumn months. The Alumine, Collon Cura, and Limay rivers provide additional blue-ribbon water, each with its own character and challenges, from technical dry fly fishing on spring creek-like sections to aggressive streamer fishing in the deep pools of canyon stretches.\n\nPatagonia's appeal extends beyond the quality of its trout fishing to the culture and hospitality that surround the angling experience. Estancias along the rivers offer comfortable accommodations with the warmth of Argentine hospitality, wood-fired asados featuring local lamb and Malbec wine, and the sense of being immersed in a working landscape where cattle ranching and fly fishing coexist harmoniously. The guides are passionate and knowledgeable, many having grown up fishing these rivers from childhood, and their intimate understanding of the water and the habits of the fish adds immeasurably to the experience.\n\nThe Argentine trout season runs from November through April, coinciding with the Northern Hemisphere's winter and making Patagonia an ideal destination for anglers seeking to extend their fishing year. December through February delivers the warmest weather and most reliable dry fly fishing, while March and April bring cooler temperatures, autumn colors, and the opportunity to target pre-spawn browns on large streamers. The Patagonian wind is legendary and relentless, so strong casting skills and wind-resistant leaders are essential equipment.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1672941375895-7d6c67f87091?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1672941375895-7d6c67f87091?w=400&q=80",
    latitude: -40.1657,
    longitude: -71.3489,
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    primarySpecies: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
    licenseInfo:
      "Argentine fishing license required, administered by each province. Neuquen and Rio Negro provinces are the primary fishing regions. Licenses are available through local fly shops, guides, and some lodges. Both provincial and national park permits may be required depending on location.",
    elevationRange: "2,000 - 6,000 ft",
    climateNotes:
      "Semi-arid steppe climate with warm summers and cold, snowy winters. Summer highs of 65-80F with cool evenings. Wind is a near-constant factor, especially from the west, and can be fierce. Rain is relatively infrequent in the steppe but more common near the Andes. Pack layers and wind-resistant outerwear.",
    regulationsSummary:
      "Regulations vary by province and specific water. Many premier rivers are catch-and-release with single barbless hooks and fly-only restrictions. Some waters allow a limited harvest of non-native species. National park waters have additional regulations. Always check current provincial regulations and carry your license.",
    metaTitle: "Patagonia Argentina Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Patagonia's world-class trout rivers. From the Malleo to the Chimehuin, our guide covers Argentina's premier fly fishing in the Andes foothills.",
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
      "British Columbia commands a reverence among fly anglers that few destinations can match, earned through its legendary steelhead rivers, its remarkable stillwater trout fisheries, and a wilderness setting that encompasses everything from coastal temperate rainforest to interior sagebrush plateaus. The province's steelhead rivers, particularly those in the Skeena River watershed, represent the last great stronghold of wild steelhead on the Pacific coast, and the chance to swing a fly for these powerful, ocean-going fish in rivers like the Bulkley, Kispiox, Babine, and Sustut draws dedicated anglers from around the world each autumn.\n\nSteelhead fishing in British Columbia is a practice steeped in tradition and defined by patience. The classic approach involves wading into a run, casting a long line across the current, and allowing a swung wet fly to sweep through the holding water on a tight line, waiting for the explosive take of a fish that may weigh fifteen to twenty-five pounds. The rivers of the Skeena system offer this experience in a setting of towering spruce and cedar forests, gravel bars flanked by mountains, and the ever-present possibility of encountering grizzly bears along the river corridor. It is fly fishing in its most elemental form, stripped of technology and dependent on watercraft, casting skill, and an understanding of where steelhead hold in the current.\n\nThe interior of British Columbia offers an entirely different but equally compelling fly fishing experience. The Kamloops region and the Cariboo Plateau are home to hundreds of productive stillwater lakes that grow rainbow trout of exceptional size and fighting ability on a diet of chironomids, damselflies, dragonflies, leeches, and shrimp. This form of fly fishing, pursued from pontoon boats and float tubes, demands a deep understanding of aquatic entomology and the ability to match specific hatch stages with precise imitations, and it produces trout in the three- to eight-pound range with regularity. Rivers like the Thompson, a tributary of the Fraser, also hold steelhead and provide additional opportunities for anglers based in the interior.\n\nThe British Columbia fishing calendar is remarkably long. Spring brings chironomid hatches on interior lakes from April through June, followed by damselfly and sedge activity through summer. Trout rivers on the coast and in the interior fish well from June through October. Steelhead fishing begins on the Skeena tributaries in August and continues into November, with September and October generally considered the prime months for the largest fish.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1551504664-cd9cb181d8fa?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551504664-cd9cb181d8fa?w=400&q=80",
    latitude: 53.7267,
    longitude: -127.6476,
    bestMonths: ["May", "June", "July", "August", "September", "October", "November"],
    primarySpecies: [
      "Steelhead",
      "Rainbow Trout",
      "Cutthroat Trout",
      "Bull Trout",
      "Pacific Salmon",
    ],
    licenseInfo:
      "British Columbia freshwater fishing license required. Non-resident annual and short-term licenses available online through the BC government portal. A classified waters license and additional fees apply for designated steelhead and salmon rivers. Guided angling license is separate from unguided.",
    elevationRange: "Sea level - 5,000 ft (typical fishing areas)",
    climateNotes:
      "Highly variable across the province. Coastal areas are wet and mild year-round. Interior plateaus are drier with warm summers and cold winters. Northern rivers can see frost by mid-September. Steelhead season on the Skeena system features cool, wet weather with daytime highs of 40-55F in October. Pack rain gear and warm layers.",
    regulationsSummary:
      "BC has extensive regulations including classified waters with reduced daily rods, single barbless hook requirements on many rivers, and strict catch-and-release for wild steelhead on most systems. Some rivers require advance booking for classified water access. Always consult the current BC freshwater fishing synopsis.",
    metaTitle: "British Columbia Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore British Columbia's legendary steelhead rivers and interior stillwaters. From the Skeena to Kamloops, our guide covers BC's finest fly fishing.",
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
      "The Bahamas hold an unassailable position as the birthplace and spiritual home of saltwater fly fishing for bonefish, a tradition that stretches back to the mid-twentieth century when pioneering anglers first discovered that the silvery, lightning-fast denizens of the tropical flats would eat a well-presented fly. Today, the Bahamian archipelago, stretching over 500 miles from Grand Bahama in the north to the Turks and Caicos border in the south, encompasses the most extensive and productive bonefish habitat in the Western Hemisphere, with dozens of individual island fisheries that range from heavily guided luxury operations to remote, barely explored cays where an angler with a skiff and a push pole can have miles of flat entirely to themselves.\n\nAndros Island, the largest landmass in the Bahamas, is the undisputed epicenter of Bahamian bonefishing. The western shore of Andros faces the vast expanse of the Great Bahama Bank, a shallow underwater platform that creates endless miles of wadeable flats where bonefish tail in water measured in inches. The lodges on Andros have refined the art of guided bonefishing to a high standard, with experienced guides who pole shallow skiffs across mirror-calm flats, spotting tailing fish at remarkable distances and positioning anglers for precision casts to individual targets. The average bonefish on Andros runs three to five pounds, with fish exceeding eight pounds encountered regularly, and the sheer numbers of fish available make it possible to have encounters with dozens or even hundreds of bonefish in a single day.\n\nBeyond Andros, the Exuma Cays, Abaco, Long Island, Crooked Island, and Acklins Island each offer their own distinct bonefishing character, from the vast ocean-side flats of Acklins to the mangrove-lined creeks of the Exumas. The Bahamas also provide outstanding opportunities for permit, tarpon, and barracuda on the fly, making a saltwater grand slam a realistic goal on the right tide and with favorable conditions. The permit fishing on the flats around Grand Bahama and the deep-water edges of the Exumas has gained increasing recognition, while the creeks and channels between islands hold resident tarpon that will smash a well-stripped fly on the surface.\n\nThe Bahamian fishing calendar runs year-round, with the peak season for bonefishing generally considered to be October through May when cooler water temperatures concentrate fish on the flats and weather patterns are more stable. Summer months bring warmer water and slightly different fish behavior, with bonefish tending to feed in deeper water during the heat of the day but remaining available on the flats during early morning and late afternoon periods.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1452109436269-d410ed332571?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1452109436269-d410ed332571?w=400&q=80",
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
    licenseInfo:
      "No fishing license is required for recreational fishing in the Bahamas. However, visiting anglers fishing with a guide should ensure their guide holds proper licensing. Some bonefishing flats near national parks may have access restrictions.",
    elevationRange: "Sea level",
    climateNotes:
      "Tropical maritime climate with warm temperatures year-round. Winter highs of 75-80F, summer highs of 85-90F. Trade winds from the east are typical and help manage heat. Hurricane season runs June through November. Peak fishing season from October through May offers the most stable weather.",
    regulationsSummary:
      "Bahamian fishing regulations require catch-and-release for bonefish. Spearfishing is prohibited for visiting anglers. There are restrictions on the number of certain species that can be harvested. Marine protected areas have specific rules that must be followed. Check current regulations with your guide or lodge.",
    metaTitle: "Bahamas Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover world-class bonefishing in the Bahamas. From Andros to the Exumas, our guide covers the Caribbean's finest saltwater fly fishing destinations.",
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
      "Iceland offers an Atlantic salmon and Arctic char fishing experience that exists in a class entirely its own, combining some of the most productive salmon rivers in the world with a volcanic landscape of otherworldly beauty that makes every day on the water feel like an expedition to another planet. The island's roughly eighty salmon rivers, fed by glacial melt, springs, and rainfall draining through ancient lava fields, produce remarkably consistent runs of Atlantic salmon that have been managed with care and discipline for centuries. The rod-rotation beat system that governs most Icelandic salmon rivers ensures that each angler has exclusive access to a defined stretch of water for a set period, eliminating the crowding that plagues salmon rivers elsewhere and creating an intimate, unhurried fishing experience.\n\nThe salmon fishing in Iceland is characterized by clear, relatively small rivers where the fish can often be seen holding in pools, making it possible to target individual salmon with specific fly presentations. The rivers of the west and north, including legendary names like the Laxa in Adaldal, Nordura, and Midfjardara, produce multi-sea-winter salmon that average eight to fifteen pounds, with fish over twenty pounds a realistic possibility on the best rivers. The hitching technique, in which a riffle-hitched fly is skated across the surface film, is a uniquely Icelandic method that produces spectacular surface takes from salmon that would refuse a traditionally swung fly.\n\nArctic char fishing provides an equally compelling reason to visit Iceland. Highland lakes and rivers throughout the interior hold abundant populations of Arctic char that range from half-pound stream fish to lake-dwelling specimens exceeding ten pounds. The char fishing is often best in areas that are overlooked by salmon anglers, making it possible to enjoy outstanding sport with these beautifully colored fish in complete solitude. Many anglers combine a salmon beat with char fishing to create a varied and rewarding itinerary.\n\nThe Icelandic salmon season runs from mid-June through mid-September, with the exact timing varying by river and region. The best salmon fishing on most rivers occurs in July and early August. Arctic char fishing extends later into the autumn on many waters. The midnight sun provides nearly twenty-four hours of fishable light during peak season, and many of the finest takes occur in the golden hours of the Icelandic evening when the sun hangs low on the horizon and the volcanic landscape glows with an ethereal quality that exists nowhere else.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1563420715-36d59de95f91?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1563420715-36d59de95f91?w=400&q=80",
    latitude: 64.9631,
    longitude: -19.0208,
    bestMonths: ["June", "July", "August", "September"],
    primarySpecies: ["Atlantic Salmon", "Arctic Char", "Brown Trout"],
    licenseInfo:
      "Fishing rights in Iceland are privately owned and access is arranged through the river owner or booking agent. Rod fees vary dramatically by river and can be very expensive on premier salmon rivers. No national fishing license is required, but rod access must be booked in advance.",
    elevationRange: "Sea level - 2,000 ft (typical fishing areas)",
    climateNotes:
      "Maritime subarctic climate moderated by the Gulf Stream. Summer highs of 50-60F with occasional warmer days. Wind and rain are common. Midnight sun provides extended fishing hours in June and July. Weather can change rapidly. Pack warm, waterproof layers and expect cool conditions even in summer.",
    regulationsSummary:
      "Most Icelandic salmon rivers are catch-and-release or have strict bag limits. Disinfection of all fishing equipment before entering the country is mandatory and enforced. Barbless hooks are required on most rivers. The rod-rotation beat system means you must fish your assigned beat during your allocated time.",
    metaTitle: "Iceland Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Iceland's legendary Atlantic salmon rivers and Arctic char lakes. Our guide covers the Land of Fire and Ice's finest fly fishing opportunities.",
    featured: false,
    sortOrder: 10,
  },
  {
    id: "dest-oregon",
    slug: "oregon",
    name: "Oregon",
    region: "Pacific Northwest",
    country: "United States",
    state: "Oregon",
    tagline: "From Desert Canyons to Coastal Steelhead Runs",
    description:
      "Oregon occupies a unique position in the fly fishing world, straddling the divide between the arid high desert of the interior and the lush, rain-soaked forests of the coast, with each landscape producing fisheries of national significance. The Deschutes River, carving a dramatic basalt canyon through central Oregon's sagebrush country, is the state's flagship trout and steelhead fishery, offering outstanding redsides rainbow trout fishing from spring through fall and a prized run of summer steelhead that draws anglers from across the continent to swing flies in its heavy, powerful currents from July through November.\n\nThe diversity of Oregon's waters extends well beyond the Deschutes. The Rogue River in southern Oregon provides a legendary multi-day float trip through the Wild Rogue Wilderness, where summer steelhead, half-pounders, and resident trout keep rods bent through miles of pristine canyon water. The Metolius River near Camp Sherman is one of the most beautiful spring creeks in the West, its crystalline flows emerging fully formed from the base of Black Butte and holding wild rainbow and bull trout in forested surroundings. The Crooked River tailwater near Prineville and the Fall River near Sunriver offer additional central Oregon options, while the McKenzie River in the Cascade foothills east of Eugene produces wild rainbows and is the birthplace of the McKenzie drift boat that has become synonymous with Western river fishing.\n\nOregon's coastal rivers deserve special attention. The North Umpqua River, flowing through old-growth Douglas fir forest, is considered one of the finest summer steelhead rivers in existence, with its legendary Camp Water section offering classic swing-fishing in a setting of cathedral-like beauty. The Sandy, Clackamas, and Wilson rivers on the north coast provide winter steelhead fishing within easy reach of Portland, while the remote rivers of the south coast offer solitude and wild steelhead in tannic, tea-colored water that flows through ancient forests.\n\nThe Oregon season varies by region and species. Central Oregon trout fishing runs from late April through October, with the famous salmonfly hatch on the Deschutes in late May being a highlight. Summer steelhead arrive on coastal rivers from June through November. Winter steelhead fishing extends from December through March. The state's combination of accessible urban fisheries, remote wilderness waters, and everything in between makes it one of the most versatile fly fishing destinations in the West.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1612552001322-30d755f0980e?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1612552001322-30d755f0980e?w=400&q=80",
    latitude: 44.5720,
    longitude: -121.1794,
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    primarySpecies: [
      "Rainbow Trout",
      "Steelhead",
      "Brown Trout",
      "Chinook Salmon",
      "Bull Trout",
    ],
    licenseInfo:
      "Oregon Department of Fish and Wildlife license required. Non-resident annual and multi-day licenses available online. Additional tags required for salmon, steelhead, and certain other species. A combined angling tag covers most needs.",
    elevationRange: "Sea level - 6,000 ft",
    climateNotes:
      "Maritime climate west of the Cascades with mild, wet winters and dry summers. High desert conditions east of the Cascades with warm, dry summers and cold winters. The Deschutes canyon can exceed 100F in summer. Coastal rivers see frequent rain. Dress in layers and be prepared for wind in the canyon.",
    regulationsSummary:
      "Oregon has detailed regulations by zone and water body. Many premier trout streams are catch-and-release with artificial flies and lures only. Wild steelhead must be released on most rivers. Barbless hooks required for salmon and steelhead. Consult the current ODFW regulations synopsis for specific waters.",
    metaTitle: "Oregon Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Oregon's diverse fly fishing from the Deschutes canyon to coastal steelhead rivers. Our guide covers the best trout and steelhead waters in the state.",
    featured: false,
    sortOrder: 11,
  },
  {
    id: "dest-pennsylvania",
    slug: "pennsylvania",
    name: "Pennsylvania",
    region: "Mid-Atlantic",
    country: "United States",
    state: "Pennsylvania",
    tagline: "Limestone Spring Creeks and the Birthplace of American Fly Fishing",
    description:
      "Pennsylvania holds a place of deep historical significance in American fly fishing, and the limestone spring creeks of its Cumberland Valley remain among the most technically demanding and rewarding trout fisheries in the eastern United States. The state's angling heritage traces back centuries, with innovations in fly tying, tackle design, and stream conservation that originated on Pennsylvania waters influencing the development of the sport across the continent. Today, streams like Penns Creek, Spring Creek, the Letort Spring Run, Falling Spring Branch, and Big Spring continue to produce wild and holdover trout that test the skills of even the most accomplished anglers.\n\nThe limestone spring creeks are the jewels of Pennsylvania fly fishing. Fed by groundwater filtered through calcium-rich bedrock, these streams maintain consistent temperatures and pH levels that produce extraordinary insect life and the highly selective trout that feed on it. The Letort Spring Run near Carlisle, immortalized by the writings of Vince Marinaro and Charlie Fox, is perhaps the most historically significant spring creek in America, its meadow stretches holding wild brown trout that sip tiny terrestrials and midges in flat, glassy currents that reveal every imperfection in leader construction and fly presentation. Falling Spring Branch and Big Spring nearby offer similar challenges in slightly different settings.\n\nBeyond the spring creeks, Pennsylvania offers a remarkable breadth of trout water. Penns Creek in central Pennsylvania is the state's premier freestone fishery, with prolific hatches of green drakes, sulphurs, and March browns that bring large wild brown trout to the surface in a wooded limestone valley. Fishing Creek and Elk Creek in the northern tier provide additional wild trout opportunities, while Pine Creek and Kettle Creek flow through the Pennsylvania Grand Canyon, offering scenic freestone fishing in a remote mountain setting. The Delaware River system along the eastern border, particularly the upper main stem and the Brodhead Creek in the Poconos, adds further diversity.\n\nPennsylvania's trout season opens the first Saturday of April with a statewide opener that remains a cultural event, drawing thousands of anglers to their favorite streams for the traditional start of the season. The most rewarding fishing, however, occurs from mid-April through June when the succession of major hatches from Hendricksons through sulphurs to green drakes produces reliable dry fly opportunities on virtually every trout stream in the state. Fall fishing from September through November offers solitude, spawning brown trout, and late-season hatches of blue-winged olives and October caddis.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1609366664575-79b68b0eca9b?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1609366664575-79b68b0eca9b?w=400&q=80",
    latitude: 40.8781,
    longitude: -77.7996,
    bestMonths: ["April", "May", "June", "July", "September", "October"],
    primarySpecies: [
      "Brown Trout",
      "Rainbow Trout",
      "Brook Trout",
    ],
    licenseInfo:
      "Pennsylvania Fish and Boat Commission license required. Non-resident annual and multi-day tourist licenses available. A trout/salmon permit is required in addition to the base license to fish for trout during trout season. Licenses available online or at agents.",
    elevationRange: "500 - 2,500 ft",
    climateNotes:
      "Humid continental climate with warm summers and cold winters. Summer highs of 80-90F with humidity. Spring and fall are pleasant with moderate temperatures. Winter fishing is possible on spring creeks but requires cold-weather gear. Spring rains can cause high water and muddy conditions on freestone streams.",
    regulationsSummary:
      "Pennsylvania designates special regulation areas on many premier trout streams, including catch-and-release artificial lures only, delayed harvest, and heritage trout angling sections. Season dates and regulations vary by water classification. The statewide trout season opens the first Saturday of April. Consult the PFBC summary of regulations.",
    metaTitle: "Pennsylvania Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Pennsylvania's legendary limestone spring creeks and freestone rivers. Our guide covers the Letort, Penns Creek, and the best trout fishing in the East.",
    featured: false,
    sortOrder: 12,
  },
  {
    id: "dest-michigan",
    slug: "michigan",
    name: "Michigan",
    region: "Great Lakes",
    country: "United States",
    state: "Michigan",
    tagline: "The Au Sable Tradition and Great Lakes Steelhead",
    description:
      "Michigan occupies a foundational place in American fly fishing history, with the Au Sable River near Grayling serving as the cradle of organized trout fishing in the Midwest and the birthplace of innovations that shaped the sport nationwide. The state's northern Lower Peninsula and Upper Peninsula together contain over 11,000 miles of classified trout streams, more than any state east of the Mississippi, flowing through northern hardwood forests, cedar swamps, and sandy glacial plains that produce cold, clear water ideally suited to wild brook, brown, and rainbow trout. The tradition of evening hex hatches on the Au Sable, fishing from flat-bottomed Au Sable river boats by lantern light, remains one of the most iconic experiences in American fly fishing.\n\nThe Au Sable River system, including the mainstream, North Branch, and South Branch, offers a variety of trout fishing experiences from technical spring-fed stretches holding selective brown trout to wider, faster runs where brook trout and rainbows mix in pocket water beneath overhanging cedars. The Pere Marquette River in the western Lower Peninsula is equally celebrated, renowned for its runs of steelhead, salmon, and its healthy populations of resident brown trout. The Manistee, Pine, Boardman, and Jordan rivers round out a collection of northern Michigan trout streams that would be the envy of any state.\n\nMichigan's connection to the Great Lakes adds an entirely different dimension to its fly fishing portfolio. Tributary rivers draining into Lakes Michigan, Huron, and Superior receive seasonal runs of steelhead, chinook and coho salmon, and lake-run brown trout that provide outstanding fly fishing opportunities from September through April. The steelhead fishing on rivers like the Pere Marquette, Muskegon, and various Upper Peninsula streams attracts anglers from across the Midwest who swing flies and drift nymphs for chrome-bright fish that can exceed fifteen pounds.\n\nThe Upper Peninsula is Michigan's wild frontier, with hundreds of small brook trout streams winding through boreal forest and beaver-pond country that evoke a simpler era in American trout fishing. Rivers like the Fox, Two Hearted, and Driggs offer backcountry brook trout fishing of exceptional quality, with native fish rising to attractor dries in water that sees minimal angling pressure. The Michigan season runs year-round on many waters, with peak trout fishing from May through September and steelhead fishing best from October through April. The hex hatch on the Au Sable, typically occurring in late June, is the state's signature angling event.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1604087472033-cae0bd418fec?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1604087472033-cae0bd418fec?w=400&q=80",
    latitude: 44.7631,
    longitude: -84.7271,
    bestMonths: ["May", "June", "July", "August", "September", "October"],
    primarySpecies: [
      "Brown Trout",
      "Brook Trout",
      "Rainbow Trout",
      "Steelhead",
      "Chinook Salmon",
    ],
    licenseInfo:
      "Michigan Department of Natural Resources fishing license required. Non-resident annual and temporary licenses available online. All-species license covers trout and salmon. No additional trout stamp required.",
    elevationRange: "580 - 1,800 ft",
    climateNotes:
      "Humid continental climate moderated by the Great Lakes. Summer highs of 75-85F with pleasant evenings. Spring can be cool and wet. Lake-effect weather creates highly variable conditions, especially in the UP. Mosquitoes and black flies can be fierce from late May through July. Pack insect protection.",
    regulationsSummary:
      "Michigan has Type 1 through Type 4 trout stream classifications with varying regulations. Many premier streams have flies-only or catch-and-release sections. Gear-restricted reaches require artificial lures only. Great Lakes tributaries have specific salmon and steelhead regulations. Check the current Michigan fishing guide for details.",
    metaTitle: "Michigan Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Michigan's storied trout streams and Great Lakes steelhead runs. From the Au Sable to the Pere Marquette, our guide covers the finest Midwest fly fishing.",
    featured: false,
    sortOrder: 13,
  },
  {
    id: "dest-arkansas",
    slug: "arkansas",
    name: "Arkansas",
    region: "Ozarks",
    country: "United States",
    state: "Arkansas",
    tagline: "Year-Round Tailwater Trout in the Ozark Highlands",
    description:
      "Arkansas defies expectations for Southern fly fishing, harboring a collection of cold-water tailwater fisheries in the Ozark and Ouachita mountains that produce trout fishing rivaling many destinations in the traditional trout belt of the Rocky Mountain West. The state's premier fishery, the White River system below Bull Shoals and Norfork dams, is one of the most productive trout rivers in the United States, with brown trout exceeding thirty inches caught each season and rainbow trout so abundant that the river supports both a thriving catch-and-release fly fishing community and a put-and-take harvest fishery simultaneously. The White River's reputation for trophy brown trout has grown steadily over the past two decades, attracting anglers who recognize that this Ozark tailwater produces fish of a caliber that few rivers anywhere can match.\n\nThe tailwater environment created by the deep-release dams on the White and its major tributary, the North Fork of the White River (below Norfork Dam), provides a year-round supply of cold, nutrient-rich water that supports extraordinary trout growth rates. The North Fork, often called the Norfork tailwater, is particularly renowned for its trophy brown trout, with catch-and-release regulations on certain stretches producing fish that rival the best European chalk streams in both size and selectivity. The Little Red River below Greers Ferry Dam rounds out Arkansas's triumvirate of premier tailwaters, having produced the former world-record brown trout and continuing to offer excellent fishing for rainbows, browns, and cutthroat trout in a scenic Ozark valley.\n\nWhat sets Arkansas apart from other tailwater destinations is the year-round nature of the fishing. While Western rivers freeze over or blow out with spring runoff, the Arkansas tailwaters maintain fishable conditions twelve months of the year. Winter midging on the White River, when clouds of tiny Diptera trigger selective feeding in the slow tailout pools, produces some of the most technical dry fly fishing available anywhere. Spring brings caddis and sowbug activity, summer offers early morning and late evening hatches when generation schedules allow, and fall delivers sculpin-chasing brown trout that crush streamers in the deeper runs.\n\nThe culture of fly fishing in Arkansas has matured significantly, with a growing community of guides, fly shops, and lodges centered around the mountain towns of Cotter, Mountain Home, and Calico Rock that provide everything a visiting angler needs. The combination of exceptional fishing, moderate cost of travel, mild Southern winters, and the unhurried hospitality of the Ozarks makes Arkansas a destination that rewards repeat visits and consistently surprises anglers who arrive with low expectations.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1692893479204-79c9d392079c?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1692893479204-79c9d392079c?w=400&q=80",
    latitude: 36.3696,
    longitude: -92.5849,
    bestMonths: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "October",
      "November",
      "December",
    ],
    primarySpecies: [
      "Brown Trout",
      "Rainbow Trout",
      "Cutthroat Trout",
      "Brook Trout",
    ],
    licenseInfo:
      "Arkansas Game and Fish Commission license required. Non-resident annual, trip (14-day), and 3-day licenses available online. A separate trout permit is required in addition to the base license. Licenses can also be purchased at local vendors.",
    elevationRange: "400 - 2,000 ft",
    climateNotes:
      "Humid subtropical climate with mild winters and warm summers. Winter highs of 40-55F, summer highs of 85-95F with high humidity. Fishing is year-round due to cold tailwater releases. Summer fishing is best early morning and evening. Mild winters allow comfortable fishing most days with proper layering.",
    regulationsSummary:
      "Arkansas tailwaters have specific regulations by river section. Catch-and-release areas with barbless hooks and artificial lures only exist on key stretches of the White, North Fork, and Little Red rivers. Bull Shoals tailwater has both general and special regulation zones. Generation schedules affect wadability. Check AGFC regulations and generation schedules daily.",
    metaTitle: "Arkansas Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Arkansas's trophy tailwater trout fishing. From the White River to the Norfork, our guide covers year-round Ozark fly fishing opportunities.",
    featured: false,
    sortOrder: 14,
  },
  {
    id: "dest-florida-keys",
    slug: "florida-keys",
    name: "Florida Keys",
    region: "Southeast",
    country: "United States",
    state: "Florida",
    tagline: "Tarpon, Permit, and Bonefish on the Flats",
    description:
      "The Florida Keys represent the pinnacle of saltwater fly fishing in the continental United States, a chain of low-lying coral islands stretching 120 miles from Key Largo to Key West where the shallow flats, channels, and basins of Florida Bay and the Atlantic backcountry provide habitat for the three species that define the saltwater grand slam: tarpon, permit, and bonefish. No other destination in the world offers the same opportunity to pursue all three of these iconic gamefish within a single day's fishing, and the guides of the Florida Keys have elevated saltwater sight fishing to an art form refined over generations of poling skiffs across these storied flats.\n\nTarpon fishing is the headliner in the Keys, and the annual spring migration of silver king tarpon through the channels and along the oceanside flats from April through July is one of the great spectacles in all of fishing. Fish averaging 80 to 120 pounds, and occasionally exceeding 150, stream through Islamorada, Marathon, and the Lower Keys in vast schools, rolling on the surface in the early morning light, presenting fly anglers with shots at one of the most powerful gamefish in the ocean. The fight that follows a hookup is legendary: aerial acrobatics, blistering runs, and a test of endurance and tackle that can last an hour or more.\n\nPermit fishing on the Keys flats is widely considered the most difficult challenge in saltwater fly fishing. These broad, wary members of the jack family cruise the turtle grass flats and sand pots in small groups, their nervous dispositions and reluctance to eat a fly making each successful catch a hard-earned trophy. The flats around the Content Keys, Boca Grande Channel, and the Marquesas Keys west of Key West hold some of the best permit populations in the world, and guides who specialize in permit fishing possess a depth of knowledge about tides, bottom composition, and fish behavior that borders on the obsessive.\n\nThe Keys bonefish population, while smaller than in the Bahamas, offers the advantage of larger average size and the convenience of fishing within sight of civilization. The backcountry flats of Florida Bay and the oceanside flats from Key Largo south hold bonefish that average four to six pounds, with trophy fish exceeding ten pounds a realistic possibility. The year-round subtropical climate means that something is always biting in the Keys, with tarpon season in spring and early summer, permit available year-round with peaks in spring and fall, and bonefishing best from November through May when cooler water drives fish onto the shallow flats.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1697091704524-607f589aafd3?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1697091704524-607f589aafd3?w=400&q=80",
    latitude: 24.6642,
    longitude: -81.3989,
    bestMonths: ["March", "April", "May", "June", "November", "December"],
    primarySpecies: [
      "Tarpon",
      "Permit",
      "Bonefish",
      "Barracuda",
      "Snook",
    ],
    licenseInfo:
      "Florida saltwater fishing license required for non-residents. Available as annual, 7-day, or 3-day licenses online through the Florida Fish and Wildlife Conservation Commission. A no-cost shoreline license is available for fishing from shore.",
    elevationRange: "Sea level",
    climateNotes:
      "Tropical maritime climate. Winter highs of 75-80F, summer highs of 88-92F with high humidity. Strong cold fronts from November through March can temporarily drop temperatures and affect fishing. Afternoon thunderstorms common in summer. Hurricane season runs June through November.",
    regulationsSummary:
      "Florida Keys fall within the Florida Fish and Wildlife Conservation Commission and National Marine Fisheries Service regulations. Tarpon over 75 inches require a special harvest tag. Bonefish are catch-and-release only. Permit have slot limits. Everglades National Park backcountry has additional regulations. Check FWC for current rules.",
    metaTitle: "Florida Keys Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore the Florida Keys saltwater grand slam. Our guide covers tarpon, permit, and bonefish fly fishing from Key Largo to Key West and the backcountry flats.",
    featured: false,
    sortOrder: 15,
  },
  {
    id: "dest-chile",
    slug: "chile",
    name: "Chile",
    region: "Patagonia",
    country: "Chile",
    tagline: "Volcanic Rivers and Ancient Forests of the Chilean Lake District",
    description:
      "Chile's Lake District and northern Patagonia offer a fly fishing experience that is at once familiar to trout anglers from the Northern Hemisphere and utterly unique in its setting, combining the challenge of large, selective brown and rainbow trout with a landscape of active volcanoes, ancient araucaria forests, and pristine rivers that flow through some of the most ecologically intact temperate wilderness remaining on Earth. The region centered around the towns of Pucon, Villarrica, Coyhaique, and Futaleufu provides access to a remarkable diversity of water types, from spring-fed meadow streams to thundering freestone rivers draining the Andes, all holding trout that trace their lineage to stockings made over a century ago.\n\nThe Rio Simpson near Coyhaique in the Aysen region is widely considered the finest trout river in Chile, its turquoise waters holding both brown and rainbow trout that average sixteen to twenty inches with fish exceeding twenty-five inches a regular occurrence. The Simpson fishes well with both dry flies and nymphs, and its accessible road-side pools make it an excellent choice for wading anglers. Nearby, the Rio Nirehuao, Rio Manihuales, and the spring creeks draining into Lago Elizalde provide additional options that range from technical sight fishing to blind-casting in productive riffle-pool sequences.\n\nFurther north in the Lake District, the rivers around Pucon and Junin de los Andes offer outstanding fishing in a landscape dominated by the snow-capped cone of Volcan Villarrica. The Trancura, Liucura, and Tolten rivers produce reliable dry fly fishing from December through March, with caddis and mayfly hatches that bring trout to the surface in picturesque settings. Chile's southern rivers in the Carretera Austral region, including the Futaleufu, Baker, and Palena, flow through increasingly wild and remote terrain where the fishing pressure drops to near zero and the size and aggressiveness of the trout increase proportionally.\n\nThe Chilean fishing season mirrors the Southern Hemisphere summer, running from November through April with the peak period from December through March. Early season brings higher water and strong nymphing, while midsummer delivers the best dry fly fishing. Late season in March and April sees spawning activity and aggressive streamer fishing for large browns. Chile's improving infrastructure, relative affordability compared to Argentine Patagonia, and the genuine warmth of Chilean rural hospitality make it an increasingly popular alternative for anglers seeking South American trout fishing.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1587425614913-cada64d59dea?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587425614913-cada64d59dea?w=400&q=80",
    latitude: -45.5712,
    longitude: -72.0662,
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    primarySpecies: ["Brown Trout", "Rainbow Trout", "Brook Trout"],
    licenseInfo:
      "Chilean fishing license (licencia de pesca) required, administered by the Servicio Nacional de Pesca y Acuicultura (SERNAPESCA). Available online or at local offices. Separate permits may be required for certain national parks and reserves. Guides should arrange permits for their clients.",
    elevationRange: "500 - 4,000 ft",
    climateNotes:
      "Temperate oceanic climate with significant rainfall, especially in southern regions. Summer highs of 60-75F with cool evenings. The Aysen region receives more rain than the Lake District. Wind is common, particularly in open valleys. Pack quality rain gear and layers. UV can be intense at altitude.",
    regulationsSummary:
      "Chilean trout fishing regulations include catch-and-release requirements on many designated waters, artificial flies and lures only restrictions, and specific season dates that vary by region. Some rivers have daily bag limits. National park and reserve waters may have additional rules. Carry your license and check local regulations.",
    metaTitle: "Chile Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Chile's volcanic rivers and pristine trout waters. From the Lake District to Patagonia, our guide covers Chilean fly fishing at its finest.",
    featured: false,
    sortOrder: 16,
  },
  {
    id: "dest-belize",
    slug: "belize",
    name: "Belize",
    region: "Central America",
    country: "Belize",
    tagline: "Caribbean Flats and the Barrier Reef",
    description:
      "Belize has earned its reputation as one of the premier saltwater fly fishing destinations in the Caribbean through a combination of vast, fish-rich flats, a protective barrier reef system second only to Australia's, and a laid-back cultural atmosphere that makes every fishing trip feel like equal parts angling adventure and tropical holiday. The country's coastline and offshore atolls provide habitat for bonefish, permit, and tarpon in quantities that rival the best fisheries in the hemisphere, and the guides of Belize, many from traditional fishing families on Ambergris Caye, Turneffe Atoll, and the southern coast, bring a deep generational knowledge of their waters that translates directly into productive days on the flats.\n\nThe permit fishing in Belize is arguably the country's greatest claim to fame. The flats surrounding Turneffe Atoll, the largest atoll in the Western Hemisphere, hold permit in numbers and sizes that make this species, notoriously difficult to catch on the fly elsewhere, an achievable target for dedicated anglers. The guides at Turneffe have developed specialized techniques for presenting crab patterns to tailing permit on the turtle grass flats, and catch rates at the top operations consistently exceed those of most other permit fisheries worldwide. Fish averaging fifteen to twenty-five pounds are standard, with specimens exceeding thirty pounds taken each season.\n\nThe southern coast of Belize, from Dangriga south through Placencia to Punta Gorda, offers equally compelling fishing in a less developed setting. The extensive flats systems of the inner reef provide outstanding bonefishing, while the river mouths and lagoons hold tarpon that range from juvenile fish of ten to twenty pounds, perfect for honing tarpon-fighting skills, to mature migratory fish exceeding 100 pounds that arrive in spring and summer. The mangrove-lined creeks and estuaries harbor snook and barracuda that add variety to any itinerary.\n\nBelize's fishing calendar runs year-round with seasonal peaks that vary by species. Permit fishing is best from March through June when spawning aggregations concentrate fish on the flats. Tarpon fishing peaks from April through September. Bonefishing is productive year-round but best from November through May. The country's accessibility from the United States, English-speaking population, reasonable cost structure compared to some Caribbean alternatives, and genuine conservation ethic make it an outstanding choice for anglers seeking their first international saltwater fly fishing experience or returning for another shot at the species that got away.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1570689300480-a5956076aeb6?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1570689300480-a5956076aeb6?w=400&q=80",
    latitude: 17.5046,
    longitude: -87.7982,
    bestMonths: ["March", "April", "May", "June", "November", "December"],
    primarySpecies: [
      "Permit",
      "Bonefish",
      "Tarpon",
      "Snook",
      "Barracuda",
    ],
    licenseInfo:
      "Belize does not require a fishing license for catch-and-release recreational angling. Guided operations handle any necessary permits. Fishing within marine reserves may have additional requirements. Spearfishing requires a separate license.",
    elevationRange: "Sea level",
    climateNotes:
      "Tropical climate with warm temperatures year-round. Highs of 80-90F most of the year. Dry season from February through May offers the best weather for fishing. Rainy season from June through November brings afternoon showers but fishing remains productive. Hurricane season peaks August through October.",
    regulationsSummary:
      "Belize mandates catch-and-release for bonefish, permit, and tarpon when caught on the flats. Marine reserves have no-take zones that must be respected. Size and bag limits apply to certain reef species. Fishing within reserves requires permission. Consult your guide or lodge for current regulations.",
    metaTitle: "Belize Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Belize's world-class permit, bonefish, and tarpon fishing. Our guide covers Turneffe Atoll, the southern coast, and the Caribbean's best flats.",
    featured: false,
    sortOrder: 17,
  },
  {
    id: "dest-scotland",
    slug: "scotland",
    name: "Scotland",
    region: "British Isles",
    country: "United Kingdom",
    tagline: "Hallowed Salmon Rivers and Highland Lochs",
    description:
      "Scotland occupies a place of deep reverence in the history of fly fishing, a land where the sport has been practiced and refined for centuries on rivers and lochs that have shaped the techniques, tackle, and traditions that anglers worldwide still follow today. The Scottish salmon rivers, from the legendary Tweed and Spey in the east to the Tay, Dee, and the wild rivers of the Highlands and Islands, represent the oldest continuously fished fly waters in the world, and the experience of casting a salmon fly on the Spey, where the two-handed casting technique that bears the river's name was developed, connects an angler to centuries of sporting tradition in a way that few other fishing destinations can match.\n\nThe River Spey, flowing for over 100 miles from the Cairngorm Mountains to the Moray Firth, is Scotland's most iconic salmon river and the birthplace of Spey casting. Its long, sweeping pools demand the graceful, rhythmic casting style that uses the water's surface tension to load the rod, and the runs of Atlantic salmon that enter the river from February through October provide opportunities throughout an extended season. The River Tweed, forming the border between Scotland and England, is Britain's most productive salmon river by catch numbers, with excellent autumn runs that draw anglers from across Europe. The rivers Tay, Dee, and Don complete the roster of Scotland's eastern salmon rivers, each with its own character and loyal following.\n\nBeyond salmon, Scotland's brown trout fishing on highland lochs is an experience of spare beauty and quiet satisfaction that contrasts with the grandeur of the salmon rivers. Loch-style fishing from drifting boats, casting teams of traditional wet flies on a short line ahead of a wind-driven drift, is a distinctly Scottish art form that has been practiced on waters like Lochs Watten, Calder, and the machair lochs of the Outer Hebrides for generations. The wild brown trout of these lochs may not match the size of their counterparts in New Zealand or Patagonia, but the setting of heather-clad hills, stone-walled crofts, and endless northern light gives the fishing a contemplative quality that is deeply rewarding.\n\nThe Scottish fishing season varies by water, with salmon rivers typically opening between January and March and closing between September and November. Brown trout fishing runs from March through October on most waters. The shoulder seasons can offer the best fishing, with spring salmon fresh from the sea and autumn runs of large fish staging in the lower rivers. The combination of historical depth, scenic grandeur, and the warmth of Scottish hospitality makes a fishing trip to Scotland an experience that nourishes the soul as much as it tests the casting arm.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1582401050609-e1ae93fb488e?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1582401050609-e1ae93fb488e?w=400&q=80",
    latitude: 57.4596,
    longitude: -4.2264,
    bestMonths: ["April", "May", "June", "September", "October"],
    primarySpecies: ["Atlantic Salmon", "Brown Trout", "Sea Trout"],
    licenseInfo:
      "Scotland does not require a rod license, but anglers must obtain a fishing permit from the relevant estate, association, or fishing hotel that controls the water. Permits range from affordable day tickets on association waters to very expensive beats on premier salmon rivers. Booking well in advance is essential for popular beats.",
    elevationRange: "Sea level - 2,000 ft (typical fishing areas)",
    climateNotes:
      "Cool maritime climate with frequent rainfall. Summer highs of 55-65F with long daylight hours in June and July. Rain can occur at any time. Highland and island areas are particularly exposed to wind and weather. Midges (biting insects) can be fierce from June through August in still conditions. Pack waterproofs and warm layers.",
    regulationsSummary:
      "Scottish salmon fishing regulations include mandatory catch-and-release on many rivers, particularly early and late in the season. Conservation codes require release of all spring salmon on most rivers. Brown trout and sea trout regulations vary by water. Barbless or debarbed hooks increasingly encouraged. Check specific beat rules before fishing.",
    metaTitle: "Scotland Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Scotland's legendary salmon rivers and highland lochs. From the Spey to the Tweed, our guide covers centuries of fly fishing tradition.",
    featured: false,
    sortOrder: 18,
  },
  {
    id: "dest-slovenia",
    slug: "slovenia",
    name: "Slovenia",
    region: "Central Europe",
    country: "Slovenia",
    tagline: "Marble Trout and Emerald Rivers in the Julian Alps",
    description:
      "Slovenia has emerged as one of Europe's most exciting fly fishing destinations, a compact Alpine nation where rivers of extraordinary clarity flow through limestone gorges, emerald valleys, and medieval villages, harboring a unique treasure that exists nowhere else on Earth: the marble trout. This ancient species, Salmo marmoratus, predates the last ice age and survives in its pure form only in the river systems draining the western Julian Alps of Slovenia and a small section of neighboring Italy. The chance to catch a marble trout on a fly, with its distinctive marbled pattern of olive and cream set against a muscular body built for the fast, cold currents of the Soca drainage, represents one of the most compelling species-specific pursuits available to the traveling fly angler.\n\nThe Soca River is the centerpiece of Slovenian fly fishing, a stunning watercourse that originates in the Julian Alps near the Vrsic Pass and flows through the narrow Trenta Valley before widening into the broader reaches near Tolmin and Most na Soci. The water is a luminous turquoise-green, so clear that marble trout, brown trout, rainbow trout, and grayling can be spotted holding in pools and runs from well above. The upper Soca and its tributaries in the Triglav National Park are managed exclusively for marble trout conservation, with strict catch-and-release regulations and limited rod numbers that ensure both the survival of this endangered species and an uncrowded fishing experience.\n\nBeyond the Soca system, the Idrijca, Baca, and Unec rivers provide additional marble trout habitat, while the Sava Bohinjka and its tributaries in the eastern Julian Alps hold excellent populations of brown trout and grayling in equally scenic Alpine settings. Lake Bohinj, nestled beneath the peaks of Triglav National Park, offers stillwater fishing for lake trout and char in one of the most beautiful natural lakes in Europe. The Krka River in the Dolenjska region of southeastern Slovenia provides a different experience entirely, with gentle limestone spring creek-like character and resident brown trout that feed on prolific hatches in pastoral lowland meadows.\n\nThe Slovenian trout season generally runs from April through October, with the best fishing from May through September. Summer months bring warm weather, reliable hatches, and comfortable wading in waters that rarely exceed knee depth in the upper reaches. The country's small size, excellent infrastructure, welcoming culture, and outstanding cuisine, particularly the influence of Italian and Austrian traditions, make it easy to combine world-class fly fishing with broader cultural exploration.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1695722253071-be7a094ab92c?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1695722253071-be7a094ab92c?w=400&q=80",
    latitude: 46.2540,
    longitude: 13.7316,
    bestMonths: ["May", "June", "July", "August", "September"],
    primarySpecies: [
      "Marble Trout",
      "Brown Trout",
      "Rainbow Trout",
      "Grayling",
    ],
    licenseInfo:
      "Slovenian fishing permits are required and managed by local fishing clubs (ribiske druzine) that control specific stretches of water. Daily and weekly permits available through clubs, fly shops, and some hotels. Permits for marble trout waters are limited in number and should be arranged in advance. A national fishing license is also required.",
    elevationRange: "500 - 3,000 ft",
    climateNotes:
      "Alpine to Mediterranean climate depending on region. Summer highs of 70-85F in the valleys with cooler conditions at elevation. Afternoon thunderstorms possible in summer. The Soca valley can be breezy. Spring and autumn bring cooler temperatures and fewer visitors. Rain gear recommended year-round.",
    regulationsSummary:
      "Slovenia strictly manages its marble trout populations. Catch-and-release only on all marble trout waters. Barbless hooks required. Daily rod limits on many waters, particularly in Triglav National Park. Grayling also have specific protections. All fishing is by permit only with clearly defined beat boundaries. Poaching penalties are severe.",
    metaTitle: "Slovenia Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Slovenia's unique marble trout and emerald Alpine rivers. Our guide covers the Soca, Julian Alps, and Europe's most exciting fly fishing destination.",
    featured: false,
    sortOrder: 19,
  },
  {
    id: "dest-japan",
    slug: "japan",
    name: "Japan",
    region: "East Asia",
    country: "Japan",
    tagline: "Where Tenkara Was Born and Mountain Streams Run Wild",
    description:
      "Japan holds a singular position in fly fishing history as the birthplace of tenkara, the centuries-old Japanese method of fishing mountain streams with a long rod, fixed line, and a single fly that has experienced a remarkable global renaissance in recent decades. But Japan's significance to the fly angler extends far beyond tenkara. The country's mountainous interior, stretching from the subtropical forests of Kyushu in the south to the volcanic peaks of Hokkaido in the north, contains thousands of miles of pristine mountain streams that harbor native char and trout species found nowhere else, flowing through landscapes of extraordinary natural beauty that blend ancient forest, moss-covered boulders, and traditional mountain villages in a setting unlike any other fishing destination.\n\nThe native salmonids of Japan are the primary draw for the traveling angler. Iwana (Japanese char, Salvelinus leucomaenis) inhabit the coldest headwater streams, their dark bodies spotted with pale pink or orange dots and adapted to the steep, boulder-choked pocket water of the high mountains. Yamame (cherry trout, Oncorhynchus masou) occupy the middle reaches of mountain streams, displaying the distinctive parr marks and delicate beauty that make them one of the most visually stunning freshwater fish in the world. In Hokkaido, the northernmost major island, the rivers hold populations of ito (Japanese huchen, Hucho perryi), an endangered and enormous predatory salmonid that can exceed forty inches and represents one of the rarest and most sought-after species in fly fishing.\n\nFishing for these species in their native habitat is an experience of quiet intensity. Japanese mountain streams are typically small, clear, and steep, requiring short, accurate casts into plunge pools, beneath overhanging vegetation, and behind boulders in water that drops rapidly through forested gorges. The tenkara method is perfectly adapted to these conditions, and many visiting anglers discover that the simplicity and precision of a long rod and fixed line opens up water that would be difficult to fish with conventional Western tackle. The cultural dimension of fishing in Japan adds immeasurably to the experience, from soaking in a natural onsen hot spring after a day on the stream to staying in traditional mountain lodges where the evening meal features locally foraged ingredients.\n\nThe Japanese fishing season varies by region but generally runs from March through September in the mountains and year-round for some lowland and Hokkaido fisheries. The best mountain stream fishing occurs from May through August when water levels stabilize and insect activity increases. Hokkaido's ito fishing is best in spring and early summer. The combination of unique species, ancient fishing traditions, extraordinary cuisine, and the deep cultural experience of rural Japan makes this one of the most rewarding destinations an adventurous angler can visit.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1696287417462-78351ca64d5d?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1696287417462-78351ca64d5d?w=400&q=80",
    latitude: 36.6513,
    longitude: 138.1810,
    bestMonths: ["April", "May", "June", "July", "August", "September"],
    primarySpecies: [
      "Iwana (Japanese Char)",
      "Yamame (Cherry Trout)",
      "Amago",
      "Rainbow Trout",
    ],
    licenseInfo:
      "Japanese fishing permits are managed by local fishing cooperatives (gyokyo kumiai) that control specific rivers. Day permits typically cost 1,000-3,000 yen and are available at convenience stores, tackle shops, or riverside vending machines. Permits are river-specific. Hokkaido has separate licensing requirements.",
    elevationRange: "1,000 - 7,000 ft (typical mountain stream fishing)",
    climateNotes:
      "Varies dramatically by region. Mountain areas experience warm, humid summers with frequent afternoon rain. Temperatures range from 60-85F at typical fishing elevations. Hokkaido is cooler with summer highs of 65-75F. The rainy season (tsuyu) from mid-June to mid-July can cause high water in central Honshu. Typhoon season extends from August through October.",
    regulationsSummary:
      "Regulations vary by river and prefecture. Many mountain streams have catch-and-release sections. Season dates differ by region, typically March through September. Some waters restrict methods to fly or tenkara only. Ito fishing in Hokkaido is strictly regulated with catch-and-release mandatory. Always purchase the appropriate river permit before fishing.",
    metaTitle: "Japan Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Japan's mountain streams and tenkara traditions. Our guide covers iwana, yamame, and the unique fly fishing culture of the Japanese Alps.",
    featured: false,
    sortOrder: 20,
  },
  {
    id: "dest-christmas-island",
    slug: "christmas-island",
    name: "Christmas Island (Kiritimati)",
    region: "Central Pacific",
    country: "Kiribati",
    tagline: "Giant Trevally and Bonefish on Remote Pacific Flats",
    description:
      "Christmas Island, known locally as Kiritimati, rises from the central Pacific Ocean as the world's largest coral atoll, a vast ring of land and lagoon that encompasses over 150 square miles of saltwater flats representing the single most productive bonefish and giant trevally habitat on the planet. For saltwater fly anglers, Christmas Island is a destination of almost mythical status, offering encounters with bonefish in densities that must be seen to be believed and the opportunity to sight-cast to giant trevally, the apex predator of the Indo-Pacific flats, in water shallow enough to wade. The remoteness of the atoll, reached by weekly flights from Honolulu or Fiji, only adds to the sense of embarking on a true expedition.\n\nThe bonefishing on Christmas Island operates on a scale that is difficult to comprehend until experienced firsthand. The atoll's lagoon-side flats, warming in the equatorial sun, attract schools of bonefish numbering in the hundreds and sometimes thousands, cruising across white sand and coral rubble in water that barely covers their backs. On a productive day, an angler might present flies to fifty or more schools of fish, and double-digit catch days are the norm rather than the exception. The fish average two to four pounds but provide electric runs on the expansive flats, and specimens exceeding six pounds are caught regularly by anglers who target the larger singles and pairs that patrol the edges of the schools.\n\nThe giant trevally fishing is what elevates Christmas Island from an outstanding bonefish destination to a truly world-class fishery. These powerful, aggressive predators cruise the flats in small groups or as solitary hunters, their broad shadows visible against the light-colored bottom as they search for prey. Casting a large baitfish pattern to a GT and stripping it aggressively to trigger a charge and explosive take is one of the most adrenaline-charged experiences in all of fly fishing, and the fight that follows, with the fish deploying raw power to reach the safety of the coral, demands heavy tackle, sound technique, and strong nerves. Fish averaging twenty to forty pounds are common, with specimens exceeding sixty pounds taken each season.\n\nChristmas Island fishes productively year-round, with the atoll's equatorial position ensuring consistent conditions throughout the calendar. The best GT fishing typically occurs from September through April when larger fish move onto the flats. Bonefishing is reliable in all months. The tradewinds that blow from the east provide natural cooling, making the tropical heat manageable. Accommodations on the island are basic but functional, and the focus remains squarely on the fishing.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1655313850070-ce53fbf44e41?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1655313850070-ce53fbf44e41?w=400&q=80",
    latitude: 1.8721,
    longitude: -157.4750,
    bestMonths: [
      "January",
      "February",
      "March",
      "September",
      "October",
      "November",
      "December",
    ],
    primarySpecies: [
      "Bonefish",
      "Giant Trevally",
      "Triggerfish",
      "Milkfish",
    ],
    licenseInfo:
      "A fishing license is required and is typically arranged by the outfitter or lodge as part of the trip package. The license fee is modest and covers the duration of the stay. Bring copies of passport identification for the permit process.",
    elevationRange: "Sea level",
    climateNotes:
      "Equatorial oceanic climate with consistent warmth year-round. Highs of 85-90F with moderate humidity. Trade winds from the east provide cooling. Occasional rain squalls pass quickly. The sun is intense at the equator, so aggressive sun protection is essential. Bring high-SPF sunscreen, sun gloves, and a quality buff.",
    regulationsSummary:
      "Christmas Island requires catch-and-release for bonefish, giant trevally, and most other flats species. Guides enforce conservation practices. Hook quality and barbless or debarbed hooks are expected. The atoll's fish populations are healthy but sensitive to overharvest, and responsible angling practices are essential.",
    metaTitle: "Christmas Island Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Christmas Island's legendary bonefish and giant trevally flats. Our guide covers the world's largest coral atoll and its premier saltwater fly fishing.",
    featured: false,
    sortOrder: 21,
  },
  {
    id: "dest-seychelles",
    slug: "seychelles",
    name: "Seychelles",
    region: "Indian Ocean",
    country: "Seychelles",
    tagline: "Indian Ocean Flats and the Ultimate Saltwater Challenge",
    description:
      "The Seychelles archipelago, scattered across the western Indian Ocean northeast of Madagascar, has rapidly ascended to the summit of international saltwater fly fishing destinations, offering a combination of species diversity, fish size, and sheer tropical beauty that many experienced anglers rank as the finest flats fishing experience in the world. The outer islands of the Seychelles, particularly the atolls of Alphonse, St. Francois, Cosmoledo, Astove, and Providence, contain vast expanses of pristine coral flats, lagoons, and channels that harbor populations of bonefish, giant trevally, permit, triggerfish, milkfish, and Indo-Pacific species that are encountered in such variety and abundance that each day on the water presents new challenges and new opportunities.\n\nThe giant trevally fishing in the Seychelles is among the best on Earth. The outer atolls, protected as marine reserves or managed under strict conservation protocols, hold GT populations that include truly massive specimens exceeding 100 pounds. Sight-casting to these fish on the flats with heavy twelve-weight rods and large, colorful flies is an exercise in controlled aggression, requiring fast, accurate casts and aggressive strip-strikes to drive the hook home before the fish runs for the coral. The lagoons and channels of Cosmoledo and Providence are particularly renowned for their GT populations, but all of the outer atolls produce world-class encounters.\n\nThe triggerfish of the Seychelles have become a signature species for the destination, with both yellowmargin and moustache triggerfish feeding on the flats in a manner that makes them accessible to fly anglers. Watching a triggerfish tail in shallow water, its dorsal fin protruding above the surface as it roots in the sand for crustaceans, and then placing a small crab pattern close enough to trigger a take without spooking this notoriously wary fish, is a technical challenge that has captivated a growing following of dedicated anglers. The bonefish on the Seychelles flats are larger on average than in most Caribbean fisheries, with fish of six to eight pounds common, and milkfish, rarely targeted elsewhere, present a unique fly fishing opportunity in the atoll lagoons.\n\nThe Seychelles fishing season runs from October through May, with the best conditions from March through May and October through November when the monsoon transitions bring calmer weather and concentrated fish activity. Access to the outer islands is limited to a small number of guided operations that maintain strict rod limits to protect the fisheries, so booking well in advance is essential. The investment is considerable, but the quality and diversity of the fishing, set against the backdrop of uninhabited tropical atolls, creates an experience that many saltwater anglers describe as the pinnacle of their fishing lives.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1632222521693-cebd8629b3d6?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1632222521693-cebd8629b3d6?w=400&q=80",
    latitude: -9.7500,
    longitude: 46.7747,
    bestMonths: ["October", "November", "March", "April", "May"],
    primarySpecies: [
      "Giant Trevally",
      "Bonefish",
      "Triggerfish",
      "Milkfish",
      "Permit",
    ],
    licenseInfo:
      "Fishing permits for the outer islands are arranged by the guiding operation as part of the trip package. The Seychelles Islands Foundation manages access to protected atolls. Rod fees and conservation levies are typically included in the lodge package price.",
    elevationRange: "Sea level",
    climateNotes:
      "Tropical maritime climate with two monsoon seasons. The southeast monsoon from May through September brings cooler, drier conditions with stronger winds. The northwest monsoon from November through March is warmer and calmer with occasional rain. Shoulder periods in October and April often offer the best fishing conditions. Daytime temperatures range from 80-90F year-round.",
    regulationsSummary:
      "The Seychelles outer island fisheries operate under strict catch-and-release policies for all species. Barbless hooks are mandatory. Daily rod limits are enforced. Many atolls have protected marine reserve status. Guides enforce careful fish handling practices. The conservation-first approach is a key reason these fisheries remain exceptional.",
    metaTitle: "Seychelles Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore the Seychelles outer atolls for world-class GT, bonefish, and triggerfish. Our guide covers the Indian Ocean's premier saltwater fly fishing.",
    featured: false,
    sortOrder: 22,
  },
  {
    id: "dest-tasmania",
    slug: "tasmania",
    name: "Tasmania",
    region: "Oceania",
    country: "Australia",
    tagline: "Wild Brown Trout and Polaroiding in the Island State",
    description:
      "Tasmania, the island state off Australia's southeastern coast, has quietly built a reputation among serious trout anglers as one of the finest sight fishing destinations in the Southern Hemisphere, a place where large, wild brown trout cruise the margins of highland lakes and shallow river flats in water clear enough to spot fish at distances that test even the sharpest eyes. The Tasmanian technique of polaroiding, named for the polarized sunglasses essential to the method, involves walking the shores of lakes and lagoons, scanning the shallows for cruising or feeding brown trout, and making precise presentations to individual fish that may weigh five to ten pounds. It is a hunting style of fly fishing that demands patience, stealth, and the ability to deliver a fly accurately under pressure.\n\nThe Central Highlands of Tasmania, a wild plateau of button-grass moorland, eucalyptus forest, and thousands of lakes and tarns ranging from vast impoundments to tiny pothole waters, is the heart of Tasmanian trout fishing. Lakes like Arthurs Lake, Great Lake, Little Pine Lagoon, and Penstock Lagoon produce brown trout of exceptional quality, their spotted flanks and butter-yellow bellies evidence of a diet rich in freshwater shrimp, mayflies, and beetles. Little Pine Lagoon, often called Australia's premier trout water, is managed as a catch-and-release fishery with fly-only restrictions, and its shallow, clear water provides the quintessential Tasmanian sight fishing experience.\n\nThe rivers and streams of Tasmania add another dimension to the angling experience. The Meander, Mersey, South Esk, and Macquarie rivers offer freestone trout fishing through pastoral valleys and native forest, with brown trout that rise to dry flies during hatches of mayflies, caddis, and the distinctive Tasmanian spinner falls that occur on warm summer evenings. The wild rivers of the western wilderness, accessible by bushwalking through some of Australia's most rugged terrain, hold populations of trout that see almost no angling pressure and respond to well-presented flies with an eagerness born of complete naivety.\n\nThe Tasmanian trout season runs from the first Saturday in August through the end of April, with the best fishing typically occurring from November through March during the Southern Hemisphere summer. Early season brings spinner falls and dun hatches on the lakes, while midsummer delivers the peak of the polaroiding season with warm weather driving trout into the shallows to feed on terrestrials and aquatic insects. Late season in March and April offers cooler conditions, active fish preparing for winter, and outstanding dry fly fishing on both lakes and rivers.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1570470276043-874a41ad9b40?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1570470276043-874a41ad9b40?w=400&q=80",
    latitude: -41.9999,
    longitude: 146.3159,
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    primarySpecies: ["Brown Trout", "Rainbow Trout"],
    licenseInfo:
      "Tasmanian Inland Fisheries Service (IFS) license required. Season, 14-day, 3-day, and 1-day licenses available online or at Service Tasmania outlets. Non-resident rates apply for visitors from outside Tasmania. Licenses are also available at most tackle shops.",
    elevationRange: "500 - 3,500 ft (Central Highlands)",
    climateNotes:
      "Cool temperate maritime climate. Summer highs of 60-75F on the Central Highlands, warmer at lower elevations. Weather changes rapidly and cold fronts can bring snow to the highlands even in summer. Wind is a constant factor on the plateau lakes. Pack warm layers, rain gear, and good polarized sunglasses.",
    regulationsSummary:
      "Tasmania manages its trout fisheries with a combination of bag limits, fly-only waters, and catch-and-release designations. Little Pine Lagoon is catch-and-release, fly only. Many highland waters have reduced bag limits. Some rivers are open year-round while others follow the standard August-April season. Check the current IFS regulations.",
    metaTitle: "Tasmania Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Tasmania's world-class sight fishing for wild brown trout. Our guide covers the Central Highlands lakes, rivers, and the art of polaroiding.",
    featured: false,
    sortOrder: 23,
  },
  {
    id: "dest-kamchatka",
    slug: "kamchatka",
    name: "Kamchatka",
    region: "Russian Far East",
    country: "Russia",
    tagline: "Volcanic Wilderness and Untouched Pacific Salmon Rivers",
    description:
      "The Kamchatka Peninsula, a volcanic finger of land jutting southward from the Russian Far East between the Sea of Okhotsk and the Pacific Ocean, contains the last truly pristine salmon and steelhead rivers on Earth, watersheds so remote and unaltered by human activity that they provide a window into what Pacific salmon ecosystems looked like before dams, logging, and development transformed the rivers of the American West. For the fly angler willing to undertake the significant logistical effort required to reach Kamchatka, the reward is fishing of a quality and abundance that is no longer available anywhere else, in a wilderness setting of active volcanoes, hot springs, dense birch forests, and brown bears so numerous that encounters are a daily occurrence.\n\nThe rainbow trout and steelhead of Kamchatka are the primary draw for visiting fly anglers. The peninsula's rivers support populations of both resident rainbows that gorge on salmon eggs during the summer runs and sea-run steelhead that enter the rivers from the Pacific with a power and wildness that reflects their completely wild genetic heritage. The Zhupanova River, accessed by helicopter from Petropavlovsk-Kamchatsky, is the most famous rainbow trout river on the peninsula, producing fish that regularly exceed twenty-five inches on mouse patterns, egg imitations, and large streamers in a volcanic canyon setting of breathtaking beauty.\n\nThe salmon runs on Kamchatka are staggering in their abundance and diversity. All six species of Pacific salmon return to the peninsula's rivers: chinook, sockeye, chum, pink, coho, and the cherry salmon unique to the western Pacific. The rivers of the western coast receive the largest runs, with sockeye and chinook arriving in June and July, followed by chum, pink, and coho through August and September. The fishing during these runs combines targeting individual salmon on the fly with the knowledge that the massive influx of protein is feeding the rainbow trout, char, and grayling populations that make the rivers so productive for the remainder of the season.\n\nKamchatka expeditions typically involve helicopter-supported tent camps or floating trips on inflatable rafts, covering remote river sections over the course of seven to ten days. The season runs from mid-June through early October, with July and August considered the prime months for the combination of salmon, rainbows, and favorable weather. The experience is genuinely expeditionary in nature, with no roads, no cabins, and no contact with the outside world for the duration of the trip. It is a destination for anglers who seek the last wild places and are willing to accept the challenges and uncertainties of true wilderness in exchange for fishing that redefines the concept of abundance.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1663117269907-49850796ce9c?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1663117269907-49850796ce9c?w=400&q=80",
    latitude: 54.8269,
    longitude: 158.6486,
    bestMonths: ["July", "August", "September"],
    primarySpecies: [
      "Rainbow Trout",
      "Steelhead",
      "Chinook Salmon",
      "Sockeye Salmon",
      "Coho Salmon",
      "Arctic Char",
    ],
    licenseInfo:
      "Russian fishing permits are arranged by the outfitter as part of the expedition package. Visitors require a Russian visa and special permits for access to protected natural areas. The outfitter handles all permitting logistics. Individual anglers cannot arrange access independently.",
    elevationRange: "Sea level - 2,000 ft (typical fishing areas)",
    climateNotes:
      "Subarctic maritime climate with cool, wet summers and harsh winters. Summer highs of 50-65F with frequent rain and fog. Weather can change rapidly. Volcanic activity creates unique microclimates near hot springs. Bears are numerous and encounters are expected. Pack warm, waterproof layers and expect challenging conditions.",
    regulationsSummary:
      "Kamchatka fisheries are managed through a permit system administered by regional authorities. Catch-and-release is standard practice on all reputable guided operations for rainbow trout and steelhead. Salmon harvest may be limited to specific species and quantities. All regulations are handled by the outfitter. Follow guide instructions regarding fish handling and release.",
    metaTitle: "Kamchatka Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Kamchatka's untouched salmon and rainbow trout rivers. Our guide covers the Russian Far East's last wild fly fishing frontier.",
    featured: false,
    sortOrder: 24,
  },
  {
    id: "dest-tierra-del-fuego",
    slug: "tierra-del-fuego",
    name: "Tierra del Fuego",
    region: "Southern Patagonia",
    country: "Argentina",
    tagline: "Sea-Run Brown Trout at the End of the World",
    description:
      "Tierra del Fuego, the archipelago at the southern tip of South America shared between Argentina and Chile, holds a place of almost mystical allure in the fly fishing world as the home of the largest sea-run brown trout on Earth. The Rio Grande, flowing across the windswept steppe of the Argentine portion of the island from its headwaters near the Chilean border to the Atlantic Ocean, is the undisputed capital of sea-run brown trout fishing, producing chrome-bright anadromous browns that average eight to twelve pounds and regularly exceed twenty pounds, with fish over thirty pounds caught each season. No other river in the world produces sea-run brown trout of comparable size and abundance, and a week on the Rio Grande in peak season is a pilgrimage that stands on the bucket list of every serious trout angler.\n\nThe fishing on the Rio Grande is a study in controlled power. The river flows broad and relatively shallow across the Fuegian steppe, its gravel-bottomed runs and pools holding fish that have returned from the Atlantic Ocean fat and aggressive after feeding on the rich marine forage of the South Atlantic. The standard technique involves Spey or switch rods in the seven- to nine-weight range, swinging large, weighted flies through the holding water on a sinking line, waiting for the solid pull of a take that announces a fish of a caliber rarely encountered in trout fishing. The fight of a fresh sea-run brown is explosive, with powerful runs, dogged head-shaking, and an endurance that reflects the fish's ocean conditioning.\n\nThe estancias that line the Rio Grande have developed a sophisticated lodge infrastructure that combines excellent fishing with the comfort and gastronomy for which Argentine hospitality is renowned. Properties like Kau Tapen, Maria Behety, and Villa Maria offer exclusive access to private beats on the river, with experienced guides who understand the complex relationship between tides, water levels, wind, and fish behavior that determines where the sea-runs will hold on any given day. The typical fishing week involves rotating through multiple beats, experiencing the full variety of the river from the deep pools of the lower reaches to the gravel runs and glides of the middle and upper sections.\n\nThe sea-run brown trout season on the Rio Grande runs from January through April, with the peak fishing typically occurring in February and March when the largest runs of fish enter the river from the sea. January brings the first fish and often the largest individual specimens, while late March and April see higher numbers as subsequent waves of fish push upstream. The weather in Tierra del Fuego is characterized by relentless wind, which is both a challenge and a defining feature of the experience. Temperatures are cool even in summer, typically ranging from 45 to 60 degrees, and the long hours of Patagonian daylight extend fishing opportunities well into the evening.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1582400256001-8614e325ab28?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1582400256001-8614e325ab28?w=400&q=80",
    latitude: -53.8469,
    longitude: -69.1387,
    bestMonths: ["January", "February", "March", "April"],
    primarySpecies: [
      "Sea-Run Brown Trout",
      "Brown Trout",
      "Rainbow Trout",
      "Brook Trout",
    ],
    licenseInfo:
      "Tierra del Fuego provincial fishing license required. Licenses are typically arranged by the lodge as part of the trip package. A separate Rio Grande fishing permit may be required. International visitors should confirm all permits are included with their booking.",
    elevationRange: "Sea level - 1,000 ft",
    climateNotes:
      "Cool, windy maritime climate. Summer (January-March) highs of 50-60F with constant wind from the west, often gusting to 30-40 mph. Rain and sun can alternate rapidly. Long daylight hours in summer, with usable light until 10pm. Layered windproof clothing is essential. The wind is the defining feature of Fuegian weather.",
    regulationsSummary:
      "The Rio Grande is strictly managed with catch-and-release regulations for all sea-run brown trout. Single barbless hooks required. Most fishing is on private estancia beats with rod limits. Wading and bank fishing only on most stretches. Guides enforce careful fish handling with minimal air exposure. The fishery's health depends on these conservation measures.",
    metaTitle: "Tierra del Fuego Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Tierra del Fuego's legendary sea-run brown trout. Our guide covers the Rio Grande and the world's finest anadromous brown trout fishing.",
    featured: false,
    sortOrder: 25,
  },
  // ─── PHASE 3 ADDITIONS ──────────────────────────────────────────────
  {
    id: "dest-ireland",
    slug: "ireland",
    name: "Ireland",
    region: "Western Europe",
    country: "Ireland",
    tagline: "Atlantic Salmon and Wild Brown Trout on the Emerald Isle",
    description:
      "Ireland has been a revered fly fishing destination for centuries, its rain-fed rivers and limestone loughs producing Atlantic salmon and wild brown trout of exceptional quality against a backdrop of rolling green countryside, ancient stone walls, and a cultural warmth that makes every visiting angler feel immediately at home. The west coast, from County Kerry north through Clare, Galway, Mayo, and Donegal, holds the greatest concentration of salmon rivers, while the limestone loughs of the midlands and west offer world-class wild brown trout fishing that peaks during the mayfly hatch in May and June when trout exceeding five pounds cruise the shallows sipping spent duns from the surface.\n\nThe Irish approach to fly fishing is steeped in tradition yet remarkably accessible. The Moy, Corrib, and Erriff are household names in the salmon fishing world, producing fresh-run fish from spring through autumn depending on water levels and rainfall. Irish salmon fishing ranges from the intimate setting of a small spate river swollen after overnight rain, where a single-handed rod and a size-12 wet fly are all that is needed, to the broad pools of the Moy where Spey casting with double-handed rods covers the wide holding water. Sea trout fishing adds another dimension, particularly on rivers like the Erriff and Costello-Fermoyle where nocturnal sea trout runs in June and July bring these powerful, silver fish within reach of the night angler.\n\nWhat sets Ireland apart from other European fly fishing destinations is the extraordinary quality of its wild brown trout fishing, particularly on the great western loughs. Lough Corrib, Lough Mask, and Lough Conn hold self-sustaining populations of wild brownies that feed heavily on a rich invertebrate fauna, growing fat and strong in the alkaline waters. Traditional lough-style fishing from a drifting boat using a team of wet flies on a short line is an art form refined over generations, and the annual mayfly hatch on Corrib draws anglers from across Europe for what many consider the finest wild trout dry fly fishing on the continent.\n\nThe fishing season in Ireland varies by species and water. Salmon rivers open between January and March depending on the catchment, with the prime months typically being June through September when grilse and summer salmon enter the rivers. Brown trout fishing on rivers and loughs runs from February through September, with the mayfly period in May and June representing the absolute peak. The climate is mild and wet, with temperatures rarely extreme in either direction but rain an ever-present companion that keeps the rivers charged and the landscape its famous shade of green.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1604780766477-64e158c2e30c?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1604780766477-64e158c2e30c?w=400&q=80",
    latitude: 53.4129,
    longitude: -8.2439,
    bestMonths: ["April", "May", "June", "July", "August", "September"],
    primarySpecies: [
      "Atlantic Salmon",
      "Brown Trout",
      "Sea Trout",
      "Pike",
    ],
    licenseInfo:
      "An Irish state salmon and sea trout rod license is required and can be purchased online through Inland Fisheries Ireland. Brown trout fishing on most waters requires only a permit from the local fishery or club. Some waters are free to fish. Non-residents can purchase licenses at local tackle shops.",
    elevationRange: "Sea level - 1,000 ft (typical fishing areas)",
    climateNotes:
      "Mild oceanic climate with frequent rain throughout the year. Summer highs of 55-68F. Rain gear is essential at all times. The west coast receives the most rainfall. Winds can be strong, especially on exposed loughs. Long summer daylight hours extend evening fishing opportunities well past 10pm in June.",
    regulationsSummary:
      "Catch-and-release is mandatory on many salmon rivers, especially early season. Bag limits apply where harvest is permitted. Barbless hooks are increasingly required. Brown trout regulations vary by water. Always check local regulations with Inland Fisheries Ireland before fishing.",
    metaTitle: "Ireland Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Discover Ireland's Atlantic salmon rivers and wild brown trout loughs. From the River Moy to Lough Corrib, explore the Emerald Isle's finest fly fishing.",
    featured: false,
    sortOrder: 26,
  },
  {
    id: "dest-kola-peninsula",
    slug: "kola-peninsula",
    name: "Kola Peninsula",
    region: "Northwestern Russia",
    country: "Russia",
    tagline: "The World's Greatest Atlantic Salmon Rivers",
    description:
      "The Kola Peninsula in northwestern Russia is home to the most prolific Atlantic salmon rivers remaining on Earth, a vast wilderness of boreal forest and tundra where dozens of rivers flow north into the Barents Sea carrying runs of salmon that dwarf anything found in Scotland, Norway, or eastern Canada. Rivers like the Ponoi, Yokanga, Varzuga, and Kharlovka produce salmon in numbers and sizes that recall the legendary catches described in Victorian fishing journals, before commercial netting and habitat degradation reduced Atlantic salmon populations across the rest of their range. For the serious salmon angler, the Kola Peninsula represents the last frontier where the odds of encountering multiple fresh-run Atlantic salmon in a single day remain genuinely high.\n\nThe fishing on the Kola's premier rivers is conducted from remote wilderness camps accessible only by helicopter, a logistical challenge that has paradoxically served as the fishery's greatest protection. The rivers themselves are pristine, flowing through landscapes of birch forest, moss-covered tundra, and granite canyons untouched by development. The standard approach is Spey casting with double-handed rods, swinging large tube flies and Sunray Shadows through the pools and runs on floating or intermediate lines. The salmon here are aggressive and willing, often taking the fly with a violence that catches even experienced anglers off guard.\n\nWhat makes the Kola uniquely compelling is the sheer diversity of the salmon fishing on offer. The Ponoi, the most famous of the Kola rivers, can produce catches of ten or more salmon per rod per day during peak periods, with fish ranging from bright six-pound grilse to chrome sea-liced specimens exceeding thirty pounds. The Yokanga offers a more intimate, technical fishing experience on smaller water with exceptional numbers of large multi-sea-winter fish. The Varzuga, the southernmost of the major rivers, is renowned for its spring run that coincides with the ice breakup in late May, creating one of the most dramatic natural spectacles in the fishing world.\n\nThe season on the Kola runs from late May through September, with the peak salmon fishing typically occurring in June and early July when the first major runs of fish enter the rivers. Mid-season fishing in July and August can be excellent on rivers with strong summer runs, while September brings the autumn fish, often the largest of the season. Conditions are challenging — the weather is unpredictable, the terrain demanding, and the remoteness requires a degree of self-sufficiency. But for the angler willing to make the journey, the Kola Peninsula delivers Atlantic salmon fishing of a quality and abundance that exists nowhere else in the modern world.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1696831387582-89e93dcd53e5?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1696831387582-89e93dcd53e5?w=400&q=80",
    latitude: 67.9222,
    longitude: 33.0783,
    bestMonths: ["June", "July", "August", "September"],
    primarySpecies: [
      "Atlantic Salmon",
      "Sea Trout",
      "Arctic Char",
      "Brown Trout",
      "Grayling",
    ],
    licenseInfo:
      "All fishing permits and access are arranged through the outfitter as part of the expedition package. Individual anglers cannot arrange independent access to most Kola rivers. A valid Russian visa is required for all visitors. Outfitters handle all in-country logistics including helicopter transfers and camp permits.",
    elevationRange: "Sea level - 1,500 ft (typical fishing areas)",
    climateNotes:
      "Subarctic climate with long, cold winters and cool summers. Summer highs of 50-65F with 24-hour daylight in June and July above the Arctic Circle. Rain, wind, and sudden temperature drops are common. Mosquitoes and blackflies can be intense in June and early July. Pack insect repellent and head nets.",
    regulationsSummary:
      "Strict catch-and-release on all reputable camps for Atlantic salmon. Single barbless hooks required. Fish handling protocols enforced by guides. All regulations are managed by the individual river operators. Follow guide instructions at all times.",
    metaTitle: "Kola Peninsula Fly Fishing Guide | Executive Angler",
    metaDescription:
      "The world's greatest Atlantic salmon rivers. Explore the Kola Peninsula's Ponoi, Yokanga, and Varzuga rivers for unmatched salmon fishing.",
    featured: false,
    sortOrder: 27,
  },
  {
    id: "dest-mongolia",
    slug: "mongolia",
    name: "Mongolia",
    region: "Central Asia",
    country: "Mongolia",
    tagline: "Taimen — The World's Largest Salmonid in Pristine Wilderness",
    description:
      "Mongolia occupies a singular place in the fly fishing imagination as the home of the Siberian taimen, the world's largest salmonid and one of the most coveted freshwater game fish on Earth. In the remote river valleys of northern and western Mongolia, where the steppe gives way to forested mountains and rivers flow through landscapes that have changed little since the time of Genghis Khan, taimen exceeding four feet in length and fifty pounds in weight still patrol the deep pools and log-choked runs, feeding on smaller fish, rodents, and anything else that enters their domain. For the adventurous fly angler, pursuing taimen in Mongolia represents the ultimate wilderness fishing experience — a journey to the edge of the known angling world in pursuit of a fish that is part predator, part prehistoric relic, and entirely extraordinary.\n\nThe rivers of northern Mongolia, particularly those in the Eg-Uur, Onon, and Selenge watersheds, hold the healthiest remaining populations of taimen. The fishing is conducted from ger camps or floating tent camps along the river, with anglers covering miles of water each day casting large articulated streamers, mouse patterns, and surface flies to undercut banks, logjams, and the heads and tails of deep pools. The take of a big taimen is one of the most violent strikes in freshwater fly fishing — a savage, visible explosion as a fish that can weigh as much as a springer spaniel engulfs a fly on the surface. The fight that follows is a battle of attrition, the taimen using the river's current and its sheer mass to test tackle and angler alike.\n\nBeyond taimen, Mongolia's rivers hold Siberian grayling, lenok, and Amur trout, all of which provide excellent fly fishing between taimen encounters. The lenok, a close relative of the trout, is an eager dry fly feeder that provides fast action on lighter tackle, while Mongolian grayling with their oversized dorsal fins rise willingly to small dries and nymphs in the riffles and runs between the deeper taimen pools. The multi-species nature of Mongolian fly fishing ensures that even on days when the taimen prove elusive, there is always action to be had.\n\nThe season in Mongolia runs from June through October, with September and early October often producing the best taimen fishing as the fish feed aggressively before the onset of winter. Summer months bring warmer weather and longer days but can also bring high, off-color water from rainfall. The logistics of fishing in Mongolia are inherently complex, involving international flights, domestic transfers, and overland journeys to remote river camps, but the reward is access to one of the last truly wild fishing frontiers on the planet.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1647571678239-46d11a748156?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1647571678239-46d11a748156?w=400&q=80",
    latitude: 49.2827,
    longitude: 100.1537,
    bestMonths: ["June", "July", "August", "September", "October"],
    primarySpecies: [
      "Siberian Taimen",
      "Lenok",
      "Siberian Grayling",
      "Amur Trout",
    ],
    licenseInfo:
      "Fishing permits are arranged by the outfitter as part of the trip package. A valid Mongolian visa or e-visa is required for most nationalities. Special permits may be required for fishing in protected areas or national parks. All logistics handled by the outfitter.",
    elevationRange: "3,000 - 7,000 ft",
    climateNotes:
      "Extreme continental climate with large temperature swings. Summer highs of 65-85F with cool nights dropping to 35-45F. September and October can bring sub-freezing nights. Precipitation is modest but rivers can rise quickly after rain. UV intensity is high at altitude. Pack layered clothing for wide temperature ranges.",
    regulationsSummary:
      "Strict catch-and-release for all taimen on reputable operations. Single barbless hooks required. Fish must be kept in the water during unhooking and photography. Taimen are classified as vulnerable by the IUCN and conservation is paramount. Lenok and grayling may have different regulations depending on the watershed.",
    metaTitle: "Mongolia Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Pursue the legendary Siberian taimen in Mongolia's pristine wilderness rivers. The world's largest salmonid awaits in the Eg-Uur and Onon watersheds.",
    featured: false,
    sortOrder: 28,
  },
  {
    id: "dest-cuba",
    slug: "cuba",
    name: "Cuba",
    region: "Caribbean",
    country: "Cuba",
    tagline: "Untouched Saltwater Flats in the Heart of the Caribbean",
    description:
      "Cuba has emerged as one of the most exciting saltwater fly fishing destinations in the world, its vast archipelago of pristine flats, mangrove-lined channels, and coral atolls holding populations of bonefish, permit, tarpon, and other game fish in numbers and sizes that recall the Florida Keys of fifty years ago. The Jardines de la Reina, a marine protected area stretching over 150 miles along Cuba's southern coast, is the crown jewel of Cuban fly fishing — an archipelago of mangrove islands and crystal-clear flats where commercial fishing has been banned for decades, creating a saltwater ecosystem of extraordinary health and abundance.\n\nThe bonefish on Cuban flats are remarkable for both their numbers and their naivety. Schools of tailing bonefish numbering in the hundreds are a common sight on the white sand and turtle grass flats, and while individual fish can be selective, the sheer volume of opportunities means that even anglers new to saltwater fly fishing will find success. Permit fishing in Cuba rivals the best in the world, with the Jardines de la Reina and Cayo Largo consistently producing fish that cruise the flats in singles, pairs, and small schools, willing to eat a well-presented crab fly with a confidence rarely seen on the pressured permit flats of Belize or the Yucatan.\n\nTarpon fishing adds another dimension to the Cuban saltwater experience. Both juvenile and adult tarpon inhabit the mangrove channels and deeper flats throughout the archipelago, with fish ranging from ten-pound juveniles that fight like demons on a seven-weight to hundred-pound adults that test the limits of a twelve-weight outfit. The possibility of a grand slam — bonefish, permit, and tarpon in a single day — is real on Cuban waters, and multi-species days are the norm rather than the exception.\n\nThe fishing season in Cuba runs from December through August, with the prime months being February through June when weather conditions are most stable and fish activity is highest. Most fishing operations are live-aboard motherships that cruise the Jardines de la Reina or land-based lodges on outlying cays. The logistics of fishing in Cuba require advance planning, particularly regarding travel regulations for U.S. citizens, but the payoff is access to some of the last truly wild saltwater flats in the Caribbean.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1680529642520-5897a7e9707b?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1680529642520-5897a7e9707b?w=400&q=80",
    latitude: 21.4419,
    longitude: -79.9572,
    bestMonths: ["February", "March", "April", "May", "June"],
    primarySpecies: [
      "Bonefish",
      "Permit",
      "Tarpon",
      "Barracuda",
      "Jacks",
    ],
    licenseInfo:
      "Fishing licenses are arranged by the outfitter as part of the trip package. U.S. citizens should consult current OFAC regulations regarding travel to Cuba. All arrangements must be made through a licensed operator. Non-U.S. nationals face fewer restrictions but should confirm visa requirements.",
    elevationRange: "Sea level",
    climateNotes:
      "Tropical maritime climate with warm temperatures year-round. Winter highs of 75-82F, summer highs of 85-92F. Cold fronts from December through March can temporarily cool the flats and push bonefish to deeper water. Hurricane season runs June through November. Peak fishing conditions are February through May.",
    regulationsSummary:
      "Catch-and-release is standard on all reputable operations for bonefish, permit, and tarpon. The Jardines de la Reina is a marine protected area with strict conservation rules enforced by park rangers. Barracuda and some jack species may be harvested in limited numbers for shore lunch. Barbless hooks are required on most operations.",
    metaTitle: "Cuba Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Explore Cuba's pristine saltwater flats in the Jardines de la Reina. World-class bonefish, permit, and tarpon fishing in the Caribbean's last frontier.",
    featured: false,
    sortOrder: 29,
  },
  {
    id: "dest-maldives",
    slug: "maldives",
    name: "Maldives",
    region: "Indian Ocean",
    country: "Maldives",
    tagline: "Giant Trevally and Tropical Species on Pristine Atolls",
    description:
      "The Maldives, an archipelago of 26 atolls stretching across the Indian Ocean southwest of India, has rapidly established itself as one of the premier tropical saltwater fly fishing destinations in the world. While best known for its luxury resorts and crystal-clear waters, the Maldives offers fly anglers something far more thrilling — the opportunity to sight-cast to giant trevally, bluefin trevally, bonefish, triggerfish, and a dazzling array of reef species on flats, channels, and drop-offs that see virtually no fishing pressure. The GT fishing in particular has drawn international attention, with fish exceeding one hundred pounds prowling the atoll edges and channel mouths, willing to eat large surface poppers and streamer patterns with explosive aggression.\n\nThe structure of the Maldivian atolls creates an ideal environment for diverse saltwater fly fishing. Each atoll is a ring of coral islands enclosing a shallow lagoon connected to the deep ocean by channels where tidal flows concentrate bait and predators. Inside the atolls, white sand flats and turtle grass beds hold bonefish and triggerfish, while the channel mouths and reef edges are the domain of giant trevally, bluefin trevally, and other pelagic species. The fishing is conducted from dedicated fly fishing boats that explore the atoll systems, with anglers wading the flats for bonefish and casting from the boat to cruising GTs and other predators.\n\nThe diversity of species available on a Maldives fly fishing trip is extraordinary. Beyond the headline GTs and bonefish, anglers regularly encounter milkfish, yellowfin tuna, wahoo, barracuda, Napoleon wrasse, and a stunning variety of reef fish that will eat a well-presented fly. The visual nature of the fishing — sight-casting in gin-clear water over white sand and coral — makes the Maldives one of the most aesthetically striking fishing destinations on Earth, with every cast framed by turquoise water, swaying palm trees, and the vast horizon of the Indian Ocean.\n\nThe fishing season in the Maldives runs year-round, with the best conditions typically occurring during the northeast monsoon from November through April when seas are calmer and visibility is highest. The southwest monsoon from May through October brings more wind and rain but also increased GT activity in some atolls. Most fly fishing operations are conducted from live-aboard vessels that move between atolls to follow fish activity and weather conditions, providing an expedition-style experience that combines world-class fishing with the unparalleled beauty of the Indian Ocean's most iconic island chain.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1762655641740-a3341a83e73a?w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1762655641740-a3341a83e73a?w=400&q=80",
    latitude: 3.2028,
    longitude: 73.2207,
    bestMonths: ["November", "December", "January", "February", "March", "April"],
    primarySpecies: [
      "Giant Trevally",
      "Bluefin Trevally",
      "Bonefish",
      "Triggerfish",
      "Milkfish",
    ],
    licenseInfo:
      "No formal fishing license is required for recreational fly fishing in the Maldives. Fishing permits for specific atolls are arranged by the operator. Some atolls restrict fishing in marine protected zones. All arrangements are handled by the outfitter.",
    elevationRange: "Sea level",
    climateNotes:
      "Tropical climate with temperatures of 80-90F year-round. Northeast monsoon (November-April) brings drier weather and calmer seas. Southwest monsoon (May-October) brings more rain and stronger winds. Humidity is consistently high. UV exposure is extreme — high-factor sun protection is essential.",
    regulationsSummary:
      "Catch-and-release is practiced on all reputable fly fishing operations. Fishing inside marine protected areas is prohibited. Coral reef damage from anchoring or wading is strictly controlled. Operators follow conservation protocols for GT handling and release. Spearfishing is illegal throughout the Maldives.",
    metaTitle: "Maldives Fly Fishing Guide | Executive Angler",
    metaDescription:
      "Giant trevally, bonefish, and tropical species on the Maldives' pristine atolls. Explore the Indian Ocean's premier saltwater fly fishing destination.",
    featured: false,
    sortOrder: 30,
  },
];
