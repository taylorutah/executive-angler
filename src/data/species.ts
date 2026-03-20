import type { Species } from "@/types/entities";

export const species: Species[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TROUT (family: "trout")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-rainbow-trout",
    slug: "rainbow-trout",
    commonName: "Rainbow Trout",
    scientificName: "Oncorhynchus mykiss",
    family: "trout",
    description:
      "The rainbow trout is one of the most widely distributed and sought-after game fish in the world. Named for the distinctive pink-to-red lateral band that runs along its side, the rainbow is renowned for its acrobatic fighting ability and willingness to take a fly. Native to the cold-water tributaries of the Pacific Ocean in Asia and North America, rainbow trout have been introduced to suitable waters on every continent except Antarctica. They thrive in clean, cold, well-oxygenated streams, rivers, and lakes, with an ideal temperature range of 50 to 60 degrees Fahrenheit. Rainbows are opportunistic feeders, readily taking nymphs, dry flies, and streamers, making them a favorite target for fly anglers of all experience levels. Their adaptability and willingness to feed throughout the water column mean that nearly every fly fishing technique can be employed when targeting them.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f4/FMIB_43023_Rainbow_Trout_%28Salmo_irideus%29.jpeg", // FMIB 1896 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f4/FMIB_43023_Rainbow_Trout_%28Salmo_irideus%29.jpeg",
    nativeRange: "Pacific drainages of North America and Asia, from Mexico to Alaska and across to Kamchatka",
    introducedRange: "Every continent except Antarctica, including Europe, South America, Africa, Oceania, and additional Asian drainages",
    averageSize: "12-20 inches, 1-5 lbs",
    recordSize: "48 lbs (Lake Diefenbaker, Saskatchewan, 2009)",
    recordDetails: "Caught by Sean Konrad using a bait rig; the fish measured 43 inches in length",
    preferredHabitat:
      "Cold, clean rivers and streams with gravel bottoms; also lakes, tailwaters, and spring creeks with water temperatures between 50-65°F",
    preferredFlies: [
      "Parachute Adams #14-18",
      "Elk Hair Caddis #14-16",
      "Pheasant Tail Nymph #14-18",
      "Rainbow Warrior #16-20",
      "Woolly Bugger #6-10",
      "Blue-winged Olive #16-20",
      "San Juan Worm #10-14",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. mykiss",
    },
    conservationStatus: "Least Concern (IUCN); some native subspecies are Threatened or Endangered under the ESA",
    diet: "Aquatic insects (mayflies, caddisflies, stoneflies, midges), terrestrial insects, crustaceans, small fish, and fish eggs",
    spawningInfo:
      "Rainbow trout are spring spawners, typically depositing eggs in gravel redds in tributary streams from February through June depending on latitude. Females select well-oxygenated riffle areas with clean gravel substrate. Eggs incubate for 3-4 weeks before hatching.",
    spawningMonths: ["February", "March", "April", "May", "June"],
    spawningTempF: "42-52°F",
    lifespan: "4-8 years in the wild, up to 11 years",
    waterTemperatureRange: "44-67°F (optimal 50-60°F)",
    flyFishingTips:
      "Rainbow trout are active feeders throughout the day and respond well to both nymphing and dry fly presentations. Focus on seams, riffles, and tailouts where food concentrates. During heavy hatches, match the hatch closely with properly sized imitations.",
    tackleRecommendations:
      "A 9-foot 5-weight rod is the standard choice for most rainbow trout fishing. Use 4X-6X tippet depending on fly size and water clarity.",
    funFacts: [
      "Rainbow trout can detect colors into the ultraviolet spectrum, which influences their response to fluorescent fly materials",
      "Sea-run rainbow trout are called steelhead and can grow to over 40 inches",
      "Rainbows have been known to jump up to 3 feet out of the water when hooked",
      "They were first described scientifically by German naturalist Johann Julius Walbaum in 1792",
    ],
    relatedDestinationIds: ["dest-montana", "dest-colorado", "dest-idaho", "dest-oregon"],
    relatedRiverIds: ["river-madison", "river-south-platte", "river-henry-s-fork"],
    distributionCoordinates: [
      { name: "Madison River, MT", latitude: 45.6, longitude: -111.5 },
      { name: "South Platte, CO", latitude: 39.4, longitude: -105.2 },
      { name: "Henry's Fork, ID", latitude: 44.6, longitude: -111.4 },
      { name: "Deschutes River, OR", latitude: 44.6, longitude: -121.2 },
      { name: "Kenai River, AK", latitude: 60.5, longitude: -150.8 },
    ],
    metaTitle: "Rainbow Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to rainbow trout fly fishing: habitat, preferred flies, tackle recommendations, and top destinations for targeting Oncorhynchus mykiss.",
    featured: true,
  },
  {
    id: "species-brown-trout",
    slug: "brown-trout",
    commonName: "Brown Trout",
    scientificName: "Salmo trutta",
    family: "trout",
    description:
      "The brown trout is the thinking angler's quarry. Originally native to Europe and western Asia, brown trout were first introduced to North American waters in 1883 and have since established thriving populations across the continent. Distinguished by their golden-brown coloring adorned with black and red spots often encircled by pale halos, brown trout are widely regarded as the most difficult trout species to fool with a fly. They are exceptionally wary, frequently nocturnal feeders, and grow larger than most other stream-dwelling trout. Brown trout tolerate warmer water temperatures than their salmonid cousins, allowing them to thrive in waters where other trout species struggle. Trophy brown trout are often caught on streamers fished during low-light conditions, though large specimens also fall to well-presented dry flies during prolific hatches.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Brown_trout_FWS_white_background.jpg", // USFWS illustration — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Brown_trout_FWS_white_background.jpg",
    nativeRange: "Europe, western Asia, and North Africa, from Iceland and Scandinavia south to the Atlas Mountains",
    introducedRange: "North America, South America, Australasia, East Africa, and southern Asia",
    averageSize: "14-22 inches, 2-8 lbs",
    recordSize: "44 lbs 11 oz (Ohau Canal, New Zealand, 2020)",
    recordDetails: "Caught by Seamus Petrie while spin fishing; the fish measured over 38 inches",
    preferredHabitat:
      "Rivers, streams, and lakes with cover such as undercut banks, logjams, and deep pools; tolerates warmer water than other trout up to 75°F",
    preferredFlies: [
      "Woolly Bugger #4-8",
      "Muddler Minnow #4-8",
      "Parachute Adams #14-18",
      "Copper John #14-18",
      "Hare's Ear Nymph #12-16",
      "Sculpin patterns #4-6",
      "Mouse patterns #2-6",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salmo",
      species: "S. trutta",
    },
    conservationStatus: "Least Concern (IUCN) globally; native populations in Europe face localized threats from habitat degradation",
    diet: "Aquatic and terrestrial insects, crayfish, sculpins, small fish, mice, and frogs; larger fish become increasingly piscivorous",
    spawningInfo:
      "Brown trout are fall spawners, constructing redds in gravel substrates from October through December. Females fan out shallow depressions in clean gravel, and eggs incubate through the winter, hatching in early spring. This fall spawning behavior distinguishes them from most other trout.",
    spawningMonths: ["October", "November", "December"],
    spawningTempF: "44-48°F",
    lifespan: "6-12 years in rivers, up to 20 years in lakes",
    waterTemperatureRange: "40-75°F (optimal 54-65°F)",
    flyFishingTips:
      "Target brown trout during low-light periods at dawn, dusk, and after dark for the best chance at trophy fish. Streamers stripped tight to banks and undercut structure are deadly for large specimens. During daylight hours, precise nymph rigs drifted through deep runs and pools can be highly effective.",
    tackleRecommendations:
      "A 9-foot 5-weight for general work and a 9-foot 6 or 7-weight for streamer fishing. Use 3X-5X tippet for nymphing and 0X-2X for streamers.",
    funFacts: [
      "Brown trout are the only salmonid species where some populations have never been artificially propagated in hatcheries",
      "Large brown trout can consume prey up to one-third of their own body length",
      "They are capable of surviving in water up to 81°F for short periods, far warmer than any other trout",
      "The first successful introduction of brown trout to the US in 1883 used eggs shipped from Germany to a Michigan hatchery",
    ],
    relatedDestinationIds: ["dest-montana", "dest-pennsylvania", "dest-new-zealand", "dest-arkansas"],
    relatedRiverIds: ["river-madison", "river-letort-spring-run", "river-white-river-ar"],
    distributionCoordinates: [
      { name: "Madison River, MT", latitude: 45.6, longitude: -111.5 },
      { name: "Letort Spring Run, PA", latitude: 40.2, longitude: -77.2 },
      { name: "White River, AR", latitude: 36.4, longitude: -92.1 },
      { name: "River Test, England", latitude: 51.0, longitude: -1.5 },
      { name: "Ohau Canal, NZ", latitude: -44.2, longitude: 169.9 },
    ],
    metaTitle: "Brown Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to brown trout fly fishing: habitat, behavior, preferred flies, tackle, and top destinations for targeting Salmo trutta.",
    featured: true,
  },
  {
    id: "species-cutthroat-trout",
    slug: "cutthroat-trout",
    commonName: "Cutthroat Trout",
    scientificName: "Oncorhynchus clarkii",
    family: "trout",
    description:
      "The cutthroat trout holds a special place in the hearts of western anglers as the native trout of the American West. Named for the distinctive red-orange slash marks beneath the lower jaw, cutthroat trout encompass numerous subspecies adapted to the diverse watersheds of western North America, from the Yellowstone cutthroat of the Greater Yellowstone Ecosystem to the westslope cutthroat of the northern Rockies and the coastal cutthroat of Pacific Northwest streams. Cutthroat trout are generally more willing to take a dry fly than brown trout, making them a delight for surface-oriented anglers. Many subspecies face conservation challenges from habitat loss and hybridization with non-native rainbow trout, making catch-and-release practices especially important when targeting these beautiful native fish.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/FMIB_35754_Cut-Throat%2C_or_Waha_Lake_Trout_%28Salmo_clarkii_bouvieri%29.jpeg", // FMIB 1924 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/FMIB_35754_Cut-Throat%2C_or_Waha_Lake_Trout_%28Salmo_clarkii_bouvieri%29.jpeg",
    nativeRange: "Western North America, from Alaska south to New Mexico, with distinct subspecies in the Yellowstone, Columbia, Colorado, and Lahontan basins",
    introducedRange: "Limited introductions within western North America to restore native populations in historic habitat",
    averageSize: "10-18 inches, 0.5-3 lbs",
    recordSize: "41 lbs (Pyramid Lake, Nevada, 1925)",
    recordDetails: "A Lahontan cutthroat trout caught by John Skimmerhorn; this subspecies was later listed under the ESA",
    preferredHabitat:
      "Cold mountain streams, alpine lakes, and coastal rivers; prefers clean gravel substrates for spawning and water temperatures below 62°F",
    preferredFlies: [
      "Royal Wulff #12-16",
      "Stimulator #10-14",
      "Elk Hair Caddis #14-16",
      "Prince Nymph #12-16",
      "Parachute Adams #14-18",
      "Cutthroat Candy #14",
      "PMD #14-18",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. clarkii",
    },
    conservationStatus: "Varies by subspecies; Lahontan and Greenback subspecies are Threatened under the ESA; Yellowstone cutthroat are a Species of Concern",
    diet: "Aquatic insects (mayflies, caddisflies, stoneflies), terrestrial insects (hoppers, ants, beetles), small crustaceans, and occasionally small fish",
    spawningInfo:
      "Cutthroat trout are spring spawners, typically reproducing from April through July depending on elevation and water temperature. They require clean, well-oxygenated gravel in tributary streams. Some lake-dwelling populations migrate long distances to access suitable spawning habitat.",
    spawningMonths: ["April", "May", "June", "July"],
    spawningTempF: "43-50°F",
    lifespan: "4-9 years in streams, up to 12 years in lakes",
    waterTemperatureRange: "39-62°F (optimal 48-56°F)",
    flyFishingTips:
      "Cutthroat trout are aggressive surface feeders and often respond enthusiastically to attractor dry flies even when no hatch is occurring. Present flies with a drag-free drift and don't be afraid to size up your patterns. High mountain lakes often produce excellent sight fishing opportunities in crystal-clear water.",
    tackleRecommendations:
      "A 9-foot 4 or 5-weight rod covers most cutthroat situations. Use 4X-5X tippet for dries and small nymphs in clear water.",
    funFacts: [
      "There are at least 14 recognized subspecies of cutthroat trout, each adapted to a specific watershed",
      "The species is named after Meriwether Lewis and William Clark, who first documented them during their famous expedition",
      "Cutthroat trout are the state fish of seven western states",
      "They can hybridize with rainbow trout, producing fertile offspring called cutbows",
    ],
    relatedDestinationIds: ["dest-montana", "dest-wyoming", "dest-idaho", "dest-colorado"],
    relatedRiverIds: ["river-yellowstone", "river-snake-river", "river-big-hole"],
    distributionCoordinates: [
      { name: "Yellowstone River, MT/WY", latitude: 44.9, longitude: -110.4 },
      { name: "Snake River, WY", latitude: 43.5, longitude: -110.8 },
      { name: "Big Hole River, MT", latitude: 45.7, longitude: -113.2 },
      { name: "Flathead Lake, MT", latitude: 47.9, longitude: -114.1 },
    ],
    metaTitle: "Cutthroat Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to cutthroat trout fly fishing: subspecies, habitat, preferred flies, conservation status, and top western destinations.",
    featured: true,
  },
  {
    id: "species-steelhead",
    slug: "steelhead",
    commonName: "Steelhead",
    scientificName: "Oncorhynchus mykiss (anadromous)",
    family: "trout",
    description:
      "Steelhead are the anadromous form of rainbow trout, spending their juvenile years in freshwater rivers before migrating to the ocean where they grow rapidly and develop their characteristic chrome-bright coloring. Returning to their natal rivers to spawn, steelhead are prized as one of the most challenging and rewarding fly rod quarries in North America. Unlike Pacific salmon, steelhead are iteroparous, meaning they can survive spawning and return to the ocean to repeat the cycle multiple times. Fly fishing for steelhead demands patience, persistence, and refined technique, as these powerful fish can go hours or even days between takes. The classic approach uses a two-handed spey rod to swing wet flies through long runs and tailouts, though nymphing and indicator techniques are also highly effective. Landing a wild steelhead on a swung fly is considered by many to be the pinnacle of freshwater fly fishing achievement.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a1/FMIB_43026_Steel-Head_Trout_%28Salmo_gairdneri%29_Adult.jpeg", // FMIB 1896 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a1/FMIB_43026_Steel-Head_Trout_%28Salmo_gairdneri%29_Adult.jpeg",
    nativeRange: "Pacific Coast drainages from Southern California north to the Kamchatka Peninsula in Russia",
    introducedRange: "Great Lakes tributaries, select rivers in the eastern United States, Chile, and Argentina",
    averageSize: "24-32 inches, 6-12 lbs",
    recordSize: "42 lbs 3 oz (Bell Island, Alaska, 1970)",
    recordDetails: "Caught by David White while fishing a tidal estuary near Bell Island",
    preferredHabitat:
      "Large coastal rivers with deep runs, gravel tailouts, and boulder-strewn pools; ocean habitat includes nearshore and open ocean environments",
    preferredFlies: [
      "Intruder #2-6",
      "Egg-Sucking Leech #2-6",
      "Skagit Minnow #1/0-4",
      "Green Butt Skunk #4-8",
      "Popsicle #2-4",
      "Glo Bug #6-10",
      "Stonefly Nymph #4-8",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. mykiss",
    },
    conservationStatus: "Multiple Distinct Population Segments are listed as Threatened or Endangered under the ESA; wild runs throughout the Pacific Northwest have declined significantly",
    diet: "In the ocean: forage fish (herring, anchovies, smelt), squid, shrimp, and krill; in rivers during spawning runs: largely non-feeding but will strike flies out of aggression and territorial behavior",
    spawningInfo:
      "Steelhead spawn in gravel-bottomed rivers from late winter through spring. Winter-run fish return to rivers from November through April, while summer-run fish enter rivers from May through October but hold until conditions are right. Unlike salmon, steelhead can survive spawning and return to sea.",
    spawningMonths: ["December", "January", "February", "March", "April"],
    spawningTempF: "42-52°F",
    lifespan: "6-11 years, with 1-3 ocean years being most common",
    waterTemperatureRange: "34-60°F (optimal 42-52°F for fishing)",
    flyFishingTips:
      "Swinging flies on a spey rod through classic steelhead runs is the traditional and most rewarding approach. Fish the water methodically, taking a step downstream between each cast. Early morning, late evening, and overcast days tend to produce the most aggressive takes to a swung fly.",
    tackleRecommendations:
      "A 12 to 13-foot 7 or 8-weight spey rod is standard for swinging flies. For nymphing, a 10-foot 7-weight single-hand rod works well. Use stout 8-12 lb tippet.",
    funFacts: [
      "A steelhead's sense of smell is so acute that it can detect its home stream's unique chemical signature from hundreds of miles away in the ocean",
      "Steelhead can leap waterfalls up to 11 feet high during their upstream migration",
      "The distinction between a steelhead and a resident rainbow trout is behavioral rather than genetic",
      "Some steelhead travel over 900 miles inland from the Pacific Ocean to reach their spawning grounds",
    ],
    relatedDestinationIds: ["dest-oregon", "dest-british-columbia", "dest-alaska", "dest-idaho"],
    relatedRiverIds: ["river-deschutes", "river-snake-river", "river-kenai"],
    distributionCoordinates: [
      { name: "Deschutes River, OR", latitude: 44.6, longitude: -121.2 },
      { name: "Skagit River, WA", latitude: 48.4, longitude: -121.8 },
      { name: "Skeena River, BC", latitude: 54.3, longitude: -128.6 },
      { name: "Kenai Peninsula, AK", latitude: 60.5, longitude: -150.8 },
    ],
    metaTitle: "Steelhead — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to steelhead fly fishing: spey techniques, habitat, preferred flies, tackle, and top rivers for targeting anadromous rainbow trout.",
    featured: false,
  },
  {
    id: "species-bull-trout",
    slug: "bull-trout",
    commonName: "Bull Trout",
    scientificName: "Salvelinus confluentus",
    family: "trout",
    description:
      "The bull trout is a large, predatory char native to the cold, pristine headwaters of the Pacific Northwest and northern Rocky Mountains. Despite its common name, the bull trout is technically a member of the char genus Salvelinus, closely related to brook trout, Dolly Varden, and Arctic char. Bull trout require the coldest and cleanest water of any salmonid in the lower 48 states, with water temperatures rarely exceeding 59 degrees Fahrenheit, making them a sensitive indicator species for watershed health. They are powerful, aggressive predators that can grow to impressive sizes, with fish over 20 pounds taken in some river systems. Bull trout exhibit diverse life history strategies including resident stream, fluvial, and adfluvial forms. Due to significant population declines from habitat degradation, dam construction, and competition with non-native species, bull trout are listed as Threatened under the Endangered Species Act, and many fisheries are catch-and-release only.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/FMIB_34459_Dolly_Varden_or_Bull_Trout.jpeg", // FMIB 1913 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/FMIB_34459_Dolly_Varden_or_Bull_Trout.jpeg",
    nativeRange: "Pacific Northwest and northern Rocky Mountains, from northern Nevada and Oregon north through British Columbia and Alberta",
    introducedRange: "No significant introductions outside native range",
    averageSize: "14-24 inches, 2-6 lbs",
    recordSize: "32 lbs (Lake Pend Oreille, Idaho, 1949)",
    recordDetails: "Caught by N.L. Higgins; Lake Pend Oreille remains one of the premier bull trout fisheries in the world",
    preferredHabitat:
      "Cold, deep pools in headwater streams and large rivers; also deep, cold lakes connected to spawning tributaries with water temperatures below 59°F",
    preferredFlies: [
      "Articulated Streamer #1/0-4",
      "Woolly Bugger #2-6",
      "Sculpzilla #2-4",
      "Dolly Llama #2-6",
      "Egg patterns #8-12",
      "Zonker #2-6",
      "Bunny Leech #2-6",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salvelinus",
      species: "S. confluentus",
    },
    conservationStatus: "Threatened under the US Endangered Species Act; many populations have declined significantly from historical levels",
    diet: "Highly piscivorous as adults, feeding primarily on sculpin, whitefish, and juvenile salmonids; juveniles eat aquatic invertebrates and small crustaceans",
    spawningInfo:
      "Bull trout spawn in the fall, typically September through November, migrating upstream to cold, clean headwater tributaries with specific gravel composition. Water temperature must remain below 48°F for successful egg incubation. Eggs incubate over winter and hatch in late winter or early spring.",
    spawningMonths: ["September", "October", "November"],
    spawningTempF: "36-46°F",
    lifespan: "8-14 years, with migratory forms generally living longer than resident populations",
    waterTemperatureRange: "36-59°F (optimal 39-52°F)",
    flyFishingTips:
      "Bull trout are aggressive predators that respond well to large, articulated streamers stripped aggressively through deep pools and runs. Focus on the deepest, darkest water in the river, particularly around logjams and boulders. Many bull trout fisheries are catch-and-release only, so practice careful handling.",
    tackleRecommendations:
      "A 9-foot 6 or 7-weight rod with a sinking or sink-tip line for streamer work. Use 0X-2X tippet and stout leaders to handle large fish and heavy flies.",
    funFacts: [
      "Bull trout can live at elevations exceeding 7,000 feet in alpine headwater streams",
      "Migratory bull trout may travel over 100 miles between their summer feeding areas and spawning tributaries",
      "They were long confused with Dolly Varden char and were not formally recognized as a separate species until 1978",
      "Bull trout populations serve as a barometer for overall watershed health due to their exacting habitat requirements",
    ],
    relatedDestinationIds: ["dest-idaho", "dest-montana", "dest-oregon", "dest-british-columbia"],
    relatedRiverIds: ["river-south-fork-boise", "river-big-hole", "river-deschutes"],
    distributionCoordinates: [
      { name: "South Fork Boise, ID", latitude: 43.6, longitude: -115.3 },
      { name: "Flathead River, MT", latitude: 48.2, longitude: -114.3 },
      { name: "Metolius River, OR", latitude: 44.6, longitude: -121.6 },
      { name: "Upper Columbia, BC", latitude: 51.2, longitude: -117.5 },
    ],
    metaTitle: "Bull Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to bull trout fly fishing: conservation status, habitat requirements, preferred flies, and top destinations for this threatened char species.",
    featured: false,
  },
  {
    id: "species-lake-trout",
    slug: "lake-trout",
    commonName: "Lake Trout",
    scientificName: "Salvelinus namaycush",
    family: "trout",
    description:
      "The lake trout is the largest char species in North America and the apex predator of deep, cold northern lakes. Known regionally as mackinaw, lakers, or grey trout, these fish inhabit the deepest waters of glacially carved lakes across Canada and the northern United States, from the Great Lakes to the isolated mountain lakes of the Rocky Mountains. Lake trout are built for life in deep, cold water, with a deeply forked tail and a metabolism adapted to near-freezing temperatures. While lake trout are commonly associated with trolling and deep-water jigging, they offer outstanding fly fishing opportunities during spring and fall when they move into shallow water to feed and spawn. During ice-out and again in autumn, lake trout can be found cruising shallow shorelines and rocky points, making them vulnerable to streamers and large wet flies cast from shore or a boat.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/FMIB_35062_Lake_Trout%3B_Mackinaw_Trout.jpeg", // FMIB 1922 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/FMIB_35062_Lake_Trout%3B_Mackinaw_Trout.jpeg",
    nativeRange: "Northern North America, from Alaska and Canada south through the Great Lakes and into parts of New England",
    introducedRange: "Western mountain lakes in Montana, Idaho, Wyoming, and Colorado; several European lakes and South American waters",
    averageSize: "18-30 inches, 3-10 lbs",
    recordSize: "72 lbs (Great Bear Lake, Northwest Territories, 1995)",
    recordDetails: "Caught by Lloyd Bull; Great Bear Lake in Canada remains the premier lake trout fishery in the world",
    preferredHabitat:
      "Deep, cold oligotrophic lakes with rocky structure; moves to shallow water during spring and fall when surface temperatures drop below 55°F",
    preferredFlies: [
      "Articulated Minnow #1/0-4",
      "Clouser Minnow #2-6",
      "Woolly Bugger #2-6",
      "Zonker #2-6",
      "Deceiver #1/0-4",
      "Egg-Sucking Leech #2-6",
      "Sculpzilla #2-4",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salvelinus",
      species: "S. namaycush",
    },
    conservationStatus: "Least Concern (IUCN) overall; Great Lakes populations were devastated by sea lamprey but have recovered through management programs",
    diet: "Highly piscivorous, feeding on cisco, whitefish, sculpin, smelt, and other prey fish; juveniles consume zooplankton and aquatic invertebrates",
    spawningInfo:
      "Lake trout are fall spawners that broadcast their eggs over rocky lake shoals rather than constructing redds like other salmonids. Spawning occurs from September through November when water temperatures drop to around 50°F. Eggs settle into rock crevices and incubate through winter.",
    spawningMonths: ["September", "October", "November"],
    spawningTempF: "46-52°F",
    lifespan: "15-40 years, with some individuals exceeding 60 years in far northern lakes",
    waterTemperatureRange: "40-55°F (optimal 46-52°F)",
    flyFishingTips:
      "Target lake trout on the fly during ice-out in spring and again during the fall spawn when they move into water less than 15 feet deep. Use full-sinking lines and large streamer patterns stripped with erratic, darting retrieves. Rocky points, drop-offs, and shallow reefs are prime holding areas.",
    tackleRecommendations:
      "An 8 or 9-weight rod with a fast-sinking line (Type III-V) for reaching deeper water. Use 0X-2X fluorocarbon tippet rated for 12-20 lb test.",
    funFacts: [
      "Lake trout are the longest-lived freshwater fish in North America, with some individuals documented at over 60 years old",
      "They are the only salmonid species native to the Great Lakes that reproduces entirely within lake environments",
      "Lake trout populations in Yellowstone Lake threaten native Yellowstone cutthroat trout, and removal efforts have been ongoing since 1994",
      "A naturally occurring hybrid between lake trout and brook trout is called a splake",
    ],
    relatedDestinationIds: ["dest-montana", "dest-alaska", "dest-british-columbia", "dest-michigan"],
    relatedRiverIds: ["river-yellowstone", "river-kenai", "river-au-sable"],
    distributionCoordinates: [
      { name: "Flathead Lake, MT", latitude: 47.9, longitude: -114.1 },
      { name: "Great Bear Lake, NWT", latitude: 65.8, longitude: -121.3 },
      { name: "Lake Superior, MI", latitude: 47.5, longitude: -87.5 },
      { name: "Lake Louise, AB", latitude: 51.4, longitude: -116.2 },
    ],
    metaTitle: "Lake Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to lake trout fly fishing: deep-water techniques, seasonal timing, preferred flies, and top northern destinations for mackinaw.",
    featured: false,
  },
  {
    id: "species-golden-trout",
    slug: "golden-trout",
    commonName: "Golden Trout",
    scientificName: "Oncorhynchus aguabonita",
    family: "trout",
    description:
      "The golden trout is widely considered the most beautiful freshwater fish in North America. Endemic to a handful of high-elevation streams in the southern Sierra Nevada of California, the golden trout displays a stunning combination of brilliant golden-yellow flanks, vivid red-orange belly and gill plates, olive-green back, and parr marks that persist throughout adulthood. These fish evolved in isolated alpine streams above 8,000 feet in elevation, and their restricted native range makes them one of the rarest and most sought-after trout species on the continent. Backpacking into the high Sierra to catch a wild golden trout in its native habitat is a bucket-list experience for many fly anglers. Though small in size, golden trout feed eagerly on dry flies and offer a fishing experience framed by some of the most spectacular mountain scenery anywhere in the world.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/9f/FMIB_39582_Golden_Trout_of_Volcano_Creek%2C_Salmo_roosevelti_Evermann.jpeg", // FMIB 1906 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/9f/FMIB_39582_Golden_Trout_of_Volcano_Creek%2C_Salmo_roosevelti_Evermann.jpeg",
    nativeRange: "Kern River drainage in the southern Sierra Nevada of California, above 8,000 feet elevation",
    introducedRange: "High-elevation lakes and streams throughout the western United States, including Wyoming, Montana, Idaho, and Colorado",
    averageSize: "6-12 inches, 0.25-1 lb",
    recordSize: "11 lbs 4 oz (Cook Lake, Wyoming, 1948)",
    recordDetails: "Caught by Charles Reed; introduced populations in nutrient-rich lakes grow far larger than native stream fish",
    preferredHabitat:
      "High-altitude streams and alpine lakes above 8,000 feet elevation with cold, clear water and gravel substrates",
    preferredFlies: [
      "Royal Wulff #14-18",
      "Elk Hair Caddis #14-18",
      "Parachute Adams #16-20",
      "Stimulator #12-16",
      "Griffith's Gnat #18-22",
      "Bead Head Prince Nymph #14-18",
      "Foam Beetle #14-16",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. aguabonita",
    },
    conservationStatus: "Species of Special Concern in California; native populations threatened by hybridization with non-native rainbow trout and brown trout",
    diet: "Primarily aquatic and terrestrial insects including midges, caddisflies, mayflies, ants, and beetles; also consumes freshwater crustaceans at higher elevations",
    spawningInfo:
      "Golden trout spawn in late spring and early summer, typically June through August, as snowmelt warms alpine streams to suitable temperatures. Females construct small redds in fine gravel, and the short growing season at high elevation limits reproductive output. Fry emerge in late summer and must grow quickly before winter arrives.",
    spawningMonths: ["June", "July", "August"],
    spawningTempF: "44-52°F",
    lifespan: "5-9 years in native streams, up to 11 years in stocked lakes",
    waterTemperatureRange: "38-62°F (optimal 42-55°F)",
    flyFishingTips:
      "Golden trout in their native range are often eager dry fly feeders, particularly on summer afternoons when terrestrial insects are active. Small attractor patterns work well, and delicate presentations are key in the crystal-clear water of alpine environments. Pack light and be prepared for multi-day backcountry trips to reach the best water.",
    tackleRecommendations:
      "A 7.5 to 8-foot 3 or 4-weight rod is ideal for small alpine streams. Bring 5X-6X tippet and small dry flies for the gin-clear water.",
    funFacts: [
      "The golden trout is the state freshwater fish of California",
      "Native golden trout habitat sits above natural waterfalls that prevented colonization by other trout species for thousands of years",
      "Some alpine lake populations develop even more intense coloration than stream fish due to dietary differences",
      "Golden trout can survive at elevations exceeding 12,000 feet, among the highest of any salmonid",
    ],
    relatedDestinationIds: ["dest-wyoming", "dest-colorado", "dest-idaho", "dest-montana"],
    relatedRiverIds: ["river-snake-river", "river-south-platte", "river-henry-s-fork"],
    distributionCoordinates: [
      { name: "Kern River, CA", latitude: 36.5, longitude: -118.4 },
      { name: "Wind River Range, WY", latitude: 42.8, longitude: -109.6 },
      { name: "Beartooth Range, MT", latitude: 45.1, longitude: -109.5 },
      { name: "Sawtooth Range, ID", latitude: 43.9, longitude: -115.0 },
    ],
    metaTitle: "Golden Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to golden trout fly fishing: alpine habitat, backcountry techniques, preferred flies, and the best high-elevation destinations for California's state fish.",
    featured: false,
  },
  {
    id: "species-marble-trout",
    slug: "marble-trout",
    commonName: "Marble Trout",
    scientificName: "Salmo marmoratus",
    family: "trout",
    description:
      "The marble trout is one of the rarest and most distinctive trout species on earth, found only in the river systems draining into the Adriatic Sea from the Julian Alps of Slovenia and northeastern Italy. Named for the intricate marbled pattern that covers its body in swirling olive, cream, and brown tones rather than the spots typical of other trout, the marble trout grows to enormous sizes in its native limestone rivers. Fish exceeding 30 pounds have been documented, making it the largest trout species in Europe by a considerable margin. The emerald-green waters of the Soca River and its tributaries in Slovenia are the epicenter of marble trout fly fishing, where strict catch-and-release regulations and habitat restoration programs have helped stabilize populations. Fly fishing for marble trout is a destination experience that combines technical challenge with extraordinary scenery and European fly fishing culture.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Salmo_marmoratus.jpg", // Wikimedia Commons — best available (no vintage illustration exists)
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Salmo_marmoratus.jpg",
    nativeRange: "Adriatic basin rivers of Slovenia and northeastern Italy, concentrated in the Soca, Idrijca, and tributaries of the Po River system",
    introducedRange: "No significant introductions outside native range; conservation stocking within historic habitat only",
    averageSize: "16-26 inches, 2-8 lbs",
    recordSize: "55 lbs 2 oz (Soca River basin, Slovenia, 1996)",
    recordDetails: "Documented during population surveys; the fish measured over 48 inches in length",
    preferredHabitat:
      "Crystal-clear limestone rivers and streams with deep pools, undercut banks, and abundant aquatic vegetation; water temperatures typically 43-57°F year-round",
    preferredFlies: [
      "Large Streamer patterns #2-6",
      "Sculpzilla #2-4",
      "Woolly Bugger #4-8",
      "March Brown #12-14",
      "Elk Hair Caddis #14-16",
      "Pheasant Tail Nymph #14-18",
      "CDC Dun patterns #14-18",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salmo",
      species: "S. marmoratus",
    },
    conservationStatus: "Critically Endangered in much of its range due to hybridization with introduced brown trout; intensive conservation breeding programs underway in Slovenia",
    diet: "Highly piscivorous as adults, feeding on sculpin, minnows, and smaller trout; juveniles consume aquatic invertebrates including stonefly and mayfly larvae",
    spawningInfo:
      "Marble trout spawn in autumn and early winter, typically from November through January, in clean gravel substrates of tributary streams. They face a critical hybridization threat from introduced brown trout, which spawn at the same time and in similar habitat. Conservation programs focus on maintaining genetically pure populations.",
    spawningMonths: ["November", "December", "January"],
    spawningTempF: "42-48°F",
    lifespan: "10-18 years, with the largest specimens estimated at over 20 years",
    waterTemperatureRange: "39-59°F (optimal 43-54°F)",
    flyFishingTips:
      "Trophy marble trout are best targeted with large streamers fished deep in pools and along undercut banks, particularly during periods of higher water. Early mornings and late evenings produce the most aggressive strikes from large fish. Sight fishing in the crystal-clear Slovenian rivers is possible and rewarding during calm conditions.",
    tackleRecommendations:
      "A 9-foot 6 or 7-weight rod for streamer work in larger rivers, or a 5-weight for nymphing and dries in smaller tributaries. Fluorocarbon tippet in 2X-4X is recommended for the clear water.",
    funFacts: [
      "The marble trout is the largest salmonid species in Europe, with documented specimens exceeding 55 pounds",
      "Its distinctive marbled pattern develops as the fish matures, with juveniles showing more typical spotted markings",
      "A devastating flood in the Soca basin in 1926 nearly wiped out the species, and recovery efforts have taken decades",
      "Slovenia has strict fly-fishing-only and catch-and-release regulations on its premier marble trout waters",
    ],
    relatedDestinationIds: ["dest-slovenia", "dest-scotland"],
    relatedRiverIds: ["river-letort-spring-run"],
    distributionCoordinates: [
      { name: "Soca River, Slovenia", latitude: 46.3, longitude: 13.7 },
      { name: "Idrijca River, Slovenia", latitude: 46.0, longitude: 13.9 },
      { name: "Isonzo/Soca, Italy", latitude: 45.9, longitude: 13.6 },
    ],
    metaTitle: "Marble Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to marble trout fly fishing: Slovenia's rare limestone river giant, habitat, conservation, and the best Adriatic basin destinations.",
    featured: false,
  },
  // ═══════════════════════════════════════════════════════════════════
  // SALMON (family: "salmon")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-chinook-salmon",
    slug: "chinook-salmon",
    commonName: "Chinook Salmon",
    scientificName: "Oncorhynchus tshawytscha",
    family: "salmon",
    description:
      "The Chinook salmon, also known as the king salmon, is the largest of all Pacific salmon species and one of the most powerful fish an angler can hook on a fly rod. Native to the Pacific coast from California to Alaska and across to Siberia, Chinook salmon can exceed 50 pounds and are capable of sustained, drag-screaming runs that test both angler and equipment. Their life cycle is one of nature's great dramas, as adults return from the ocean to their natal rivers, often traveling hundreds of miles upstream, to spawn and die. Fly fishing for Chinook salmon on their spawning runs offers an extraordinary combination of raw power and scenic beauty, whether swinging flies on Alaskan rivers or drifting beads and egg patterns in Pacific Northwest tributaries. King salmon hold deep cultural and ecological significance throughout their range.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/01/FMIB_41470_Chinook_Salmon_%28Oncorhynchus_tschawytscha%29.jpeg", // FMIB 1898 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/01/FMIB_41470_Chinook_Salmon_%28Oncorhynchus_tschawytscha%29.jpeg",
    nativeRange: "Pacific Ocean and associated river systems from central California north to the Yukon River in Alaska and across to Kamchatka, Russia",
    introducedRange: "Great Lakes of North America, Patagonia (Argentina and Chile), and New Zealand",
    averageSize: "24-36 inches, 10-30 lbs",
    recordSize: "97 lbs 4 oz (Kenai River, Alaska, 1985)",
    recordDetails: "Caught by Les Anderson using conventional tackle; the Kenai River produces the world's largest Chinook runs",
    preferredHabitat:
      "Open ocean during feeding phase; large coastal rivers with deep pools, gravel bars, and strong currents during spawning migration",
    preferredFlies: [
      "Egg-Sucking Leech #2-6",
      "Flesh Fly #4-6",
      "Intruder #1/0-4",
      "Woolly Bugger #2-6",
      "Glo Bug #6-10",
      "Bunny Leech #1/0-4",
      "Alaska Mary Ann #4-8",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. tshawytscha",
    },
    conservationStatus: "Multiple populations listed as Threatened or Endangered under the ESA; Sacramento River winter-run Chinook are Endangered; robust populations remain in Alaska and British Columbia",
    diet: "In the ocean: herring, anchovies, sardines, squid, and shrimp; in freshwater during spawning migration: largely non-feeding, but will take flies out of territorial aggression",
    spawningInfo:
      "Chinook salmon return to their natal rivers from late spring through fall depending on the run type. They construct large redds in deep gravel, and females deposit 3,000 to 14,000 eggs. All Chinook die after spawning, their decaying bodies providing essential marine-derived nutrients to freshwater ecosystems.",
    spawningMonths: ["June", "July", "August", "September", "October"],
    spawningTempF: "45-55°F",
    lifespan: "3-7 years, with most spending 1-5 years in the ocean before returning to spawn",
    waterTemperatureRange: "38-58°F (optimal 45-55°F for spawning rivers)",
    flyFishingTips:
      "Target Chinook salmon by swinging large, heavy flies through deep runs and tailouts on a sinking line. In Alaska, dead-drifting egg patterns behind actively spawning fish can be highly effective. Focus on the deepest slots in the river where fish rest during their upstream migration.",
    tackleRecommendations:
      "A 9 to 10-foot 8 to 10-weight rod with a strong fighting butt is essential. Use heavy sinking-tip lines and 15-20 lb tippet to handle these powerful fish.",
    funFacts: [
      "The largest Chinook salmon ever documented was a 126-pound fish caught in a commercial fish trap near Petersburg, Alaska in 1949",
      "Chinook salmon can navigate back to within a few hundred feet of where they were born using the Earth's magnetic field and olfactory cues",
      "A single female Chinook can deposit up to 14,000 eggs in her redd",
      "Chinook salmon are a critical food source for orcas, bears, eagles, and over 130 other wildlife species",
    ],
    relatedDestinationIds: ["dest-alaska", "dest-british-columbia", "dest-oregon", "dest-kamchatka"],
    relatedRiverIds: ["river-kenai", "river-bristol-bay", "river-copper-river"],
    distributionCoordinates: [
      { name: "Kenai River, AK", latitude: 60.5, longitude: -150.8 },
      { name: "Bristol Bay, AK", latitude: 58.8, longitude: -158.5 },
      { name: "Columbia River, OR/WA", latitude: 46.2, longitude: -123.2 },
      { name: "Sacramento River, CA", latitude: 40.5, longitude: -122.4 },
      { name: "Skeena River, BC", latitude: 54.3, longitude: -128.6 },
    ],
    metaTitle: "Chinook Salmon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to Chinook (king) salmon fly fishing: the largest Pacific salmon, tackle, techniques, and top Alaskan and Northwest rivers.",
    featured: true,
  },
  {
    id: "species-coho-salmon",
    slug: "coho-salmon",
    commonName: "Coho Salmon",
    scientificName: "Oncorhynchus kisutch",
    family: "salmon",
    description:
      "The coho salmon, known as the silver salmon for its brilliant chrome coloring when fresh from the sea, is arguably the best Pacific salmon species for fly anglers. Coho combine aggressive fly-taking behavior with acrobatic fights and a willingness to chase down swung flies and stripped streamers that makes them the most consistently cooperative salmon on a fly rod. Averaging 8 to 12 pounds, coho provide outstanding sport on medium-weight fly tackle without requiring the heavy gear needed for Chinook. Fresh coho in their ocean-bright phase are stunning fish with metallic silver sides and dark blue-green backs. As they progress upriver, males develop hooked jaws (kypes) and dark red coloring. Alaska offers the finest coho fishing in the world, with rivers like the Kanektok, Karluk, and countless Bristol Bay tributaries providing reliable runs from July through October.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/FMIB_51072_Kisutch_or_Silver_Salmon.jpeg", // FMIB 1884 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/FMIB_51072_Kisutch_or_Silver_Salmon.jpeg",
    nativeRange: "Pacific Rim from central California to Point Hope, Alaska, and across to Kamchatka, Russia, and northern Japan",
    introducedRange: "Great Lakes of North America, Chile, Argentina, and scattered introductions in other regions",
    averageSize: "20-28 inches, 6-12 lbs",
    recordSize: "33 lbs 4 oz (Salmon River, New York, 1989)",
    recordDetails: "Caught by Jerry Lifton; Great Lakes coho populations were established through extensive stocking programs beginning in the 1960s",
    preferredHabitat:
      "Open ocean during marine phase; coastal rivers and streams with moderate flows, deep pools, and gravel bars during spawning runs",
    preferredFlies: [
      "Egg-Sucking Leech #2-6",
      "Clouser Minnow #2-6",
      "Polar Shrimp #4-8",
      "Woolly Bugger #2-6",
      "Purple Egg-Sucking Leech #2-4",
      "Flash Fly #2-6",
      "Popsicle #2-4",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. kisutch",
    },
    conservationStatus: "Lower 48 populations in Oregon and California include ESA-listed Threatened populations; Alaska populations remain healthy and are commercially harvested",
    diet: "In the ocean: herring, sand lance, anchovy, squid, and euphausiids; in freshwater: largely non-feeding but aggressively strike bright, flashy flies",
    spawningInfo:
      "Coho salmon return to natal streams from September through December, with peak spawning occurring in November and December in most systems. Females construct redds in gravel riffles and deposit 1,500 to 4,500 eggs. Like all Pacific salmon, coho are semelparous, dying after a single spawning event.",
    spawningMonths: ["September", "October", "November", "December"],
    spawningTempF: "42-50°F",
    lifespan: "3 years on average, with most spending 1.5 years in freshwater and 1.5 years in the ocean",
    waterTemperatureRange: "40-58°F (optimal 45-54°F)",
    flyFishingTips:
      "Coho salmon respond aggressively to swung wet flies and stripped streamers, especially brightly colored patterns in pink, purple, and chartreuse. Fish the swinging fly across and down through holding water, and be prepared for explosive takes. Fresh, ocean-bright fish in the lower river reaches provide the best sport.",
    tackleRecommendations:
      "A 9-foot 7 or 8-weight rod is ideal for most coho situations. Use a floating or intermediate sinking line for shallow rivers and a sink-tip for deeper water. Tippet strength of 10-15 lb is sufficient.",
    funFacts: [
      "Coho salmon are famous for their acrobatic jumps when hooked, often clearing the water by several feet",
      "Young coho spend one to two years in freshwater before migrating to sea, much longer than most other Pacific salmon species",
      "Male coho that return to spawn at a smaller size are called jacks, and they use a sneaker mating strategy to access females",
      "The coho's willingness to aggressively chase stripped flies makes it the most popular Pacific salmon species among fly anglers",
    ],
    relatedDestinationIds: ["dest-alaska", "dest-british-columbia", "dest-oregon"],
    relatedRiverIds: ["river-bristol-bay", "river-kenai", "river-rogue"],
    distributionCoordinates: [
      { name: "Bristol Bay, AK", latitude: 58.8, longitude: -158.5 },
      { name: "Kenai Peninsula, AK", latitude: 60.5, longitude: -150.8 },
      { name: "Rogue River, OR", latitude: 42.4, longitude: -124.4 },
      { name: "Skeena River, BC", latitude: 54.3, longitude: -128.6 },
    ],
    metaTitle: "Coho Salmon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to coho (silver) salmon fly fishing: the fly angler's favorite Pacific salmon, tackle, swinging techniques, and top Alaskan rivers.",
    featured: false,
  },
  {
    id: "species-sockeye-salmon",
    slug: "sockeye-salmon",
    commonName: "Sockeye Salmon",
    scientificName: "Oncorhynchus nerka",
    family: "salmon",
    description:
      "The sockeye salmon is the most commercially valuable Pacific salmon species and undergoes one of the most dramatic physical transformations in the natural world. In the ocean, sockeye are sleek, silver, blue-backed fish that feed primarily on zooplankton using specialized gill rakers. Upon entering freshwater for their spawning migration, they transform into a vivid crimson red with olive-green heads, giving them the alternate name red salmon. Sockeye are unique among Pacific salmon in that most populations require a lake in their life history, rearing as juveniles in freshwater lakes for one to three years before migrating to sea. Fly fishing for sockeye presents unique challenges, as they are plankton feeders that do not actively feed in freshwater. However, the sheer density of fish in rivers like Alaska's Kenai and the Bristol Bay drainages creates outstanding opportunities for anglers using small, bright flies drifted through concentrated schools.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/FMIB_41472_Blueback_Salmon_%28Oncorhynchus_nerka%29.jpeg", // FMIB 1898 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/FMIB_41472_Blueback_Salmon_%28Oncorhynchus_nerka%29.jpeg",
    nativeRange: "North Pacific from the Columbia River north through Alaska, across to Kamchatka, Russia, and south to northern Japan",
    introducedRange: "Limited introductions in the Great Lakes and select New England waters; generally not widely stocked outside native range",
    averageSize: "20-26 inches, 5-8 lbs",
    recordSize: "15 lbs 3 oz (Kenai River, Alaska, 1974)",
    recordDetails: "Caught by Chuck Leach on the Kenai River, which hosts one of the largest sockeye runs on Earth",
    preferredHabitat:
      "Open ocean during marine phase; lake systems and associated river corridors during freshwater rearing and spawning; concentrated in deep channels and pools during upstream migration",
    preferredFlies: [
      "Sockeye Candy #6-10",
      "Comet #6-8",
      "Bead Head Nymph #8-12",
      "Glo Bug #8-12",
      "Bunny Bug #6-8",
      "Flash Fly #6-8",
      "Egg Pattern #8-12",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. nerka",
    },
    conservationStatus: "Snake River sockeye are listed as Endangered under the ESA; other lower 48 populations are threatened; Alaska populations are healthy with annual runs in the tens of millions",
    diet: "Primarily zooplankton and small crustaceans in both freshwater and marine environments; one of the few salmonid species to rely heavily on plankton throughout its life cycle",
    spawningInfo:
      "Sockeye salmon return to natal lake systems from June through September, spawning in tributaries and along lakeshore gravel beaches. Females deposit 2,000 to 4,500 eggs in gravel redds. The Bristol Bay sockeye run in Alaska is the largest in the world, with some years seeing over 60 million fish returning.",
    spawningMonths: ["July", "August", "September"],
    spawningTempF: "42-50°F",
    lifespan: "4-5 years on average, with 1-3 years in freshwater and 1-3 years in the ocean",
    waterTemperatureRange: "42-58°F (optimal 46-54°F)",
    flyFishingTips:
      "Sockeye salmon do not actively feed in freshwater, so fly selection is less about matching the hatch and more about triggering a reaction strike. Small, brightly colored flies drifted through dense schools on a dead drift can provoke strikes. Use a slow, steady retrieve or a rhythmic twitching motion to entice takes.",
    tackleRecommendations:
      "A 9-foot 7 or 8-weight rod handles most sockeye fishing situations well. Use a floating line with a long leader and 8-12 lb fluorocarbon tippet to present small flies naturally.",
    funFacts: [
      "The Bristol Bay sockeye run in Alaska is the largest salmon run on Earth, with returns sometimes exceeding 60 million fish",
      "Sockeye salmon can detect magnetic fields and use the Earth's magnetism to navigate during ocean migration",
      "The landlocked form of sockeye salmon is called kokanee and is popular with anglers in mountain lakes across the western US",
      "Sockeye salmon turn from silver to a brilliant crimson red as they enter spawning condition, one of the most dramatic color changes in the animal kingdom",
    ],
    relatedDestinationIds: ["dest-alaska", "dest-british-columbia", "dest-kamchatka"],
    relatedRiverIds: ["river-kenai", "river-bristol-bay", "river-copper-river"],
    distributionCoordinates: [
      { name: "Bristol Bay, AK", latitude: 58.8, longitude: -158.5 },
      { name: "Kenai River, AK", latitude: 60.5, longitude: -150.8 },
      { name: "Fraser River, BC", latitude: 49.2, longitude: -122.9 },
      { name: "Copper River, AK", latitude: 60.7, longitude: -144.5 },
    ],
    metaTitle: "Sockeye Salmon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to sockeye (red) salmon fly fishing: spawning runs, unique behavior, techniques for plankton feeders, and top Alaskan destinations.",
    featured: false,
  },
  {
    id: "species-pink-salmon",
    slug: "pink-salmon",
    commonName: "Pink Salmon",
    scientificName: "Oncorhynchus gorbuscha",
    family: "salmon",
    description:
      "The pink salmon is the smallest and most abundant of the five Pacific salmon species, returning to spawn on a rigid two-year cycle that produces massive runs in odd-numbered years throughout much of Alaska and British Columbia. Known locally as humpback salmon or humpies for the pronounced dorsal hump that males develop during spawning, pink salmon are often overlooked by fly anglers focused on larger species. However, fresh pink salmon in the tidewater and lower river reaches are spirited fighters on light tackle and will readily take small bright flies. Their sheer abundance means that when the run is on, anglers can experience nonstop action with aggressive fish willing to strike on nearly every cast. Pink salmon provide an excellent entry point for anglers new to salmon fly fishing and offer a high-energy alternative when rivers are between peak runs of larger species.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b9/FMIB_39953_Oncorhynchus_gorbuscha_%28Walbaum%29_Humpback_Salmon_Drawn_from_a_specimen_collected_in_Cook%27s_Inlet%2C_Alaska.jpeg", // FMIB — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b9/FMIB_39953_Oncorhynchus_gorbuscha_%28Walbaum%29_Humpback_Salmon_Drawn_from_a_specimen_collected_in_Cook%27s_Inlet%2C_Alaska.jpeg",
    nativeRange: "North Pacific Ocean from Sacramento, California north through Alaska, across to Korea, Japan, and Arctic Russia",
    introducedRange: "Great Lakes (self-sustaining populations established), scattered Atlantic coast rivers in Maine and Maritime Canada",
    averageSize: "18-24 inches, 3-5 lbs",
    recordSize: "14 lbs 13 oz (Moose and Kenai Rivers, Alaska, 1974)",
    recordDetails: "Caught on the Kenai River drainage; pink salmon in Alaska are substantially larger than those found further south",
    preferredHabitat:
      "Nearshore ocean waters during marine phase; tidal estuaries, lower river reaches, and small coastal streams during brief spawning runs",
    preferredFlies: [
      "Pink Pollywog #6-10",
      "Hot Pink Clouser #6-8",
      "Egg-Sucking Leech #6-8",
      "Comet #6-10",
      "Flash Fly #6-8",
      "Pink Woolly Bugger #6-8",
      "Glo Bug #8-10",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. gorbuscha",
    },
    conservationStatus: "Least Concern (IUCN); the most abundant Pacific salmon species with healthy populations throughout Alaska and British Columbia",
    diet: "In the ocean: zooplankton, small crustaceans, squid, and small fish; non-feeding in freshwater during spawning migration but will strike bright, flashy flies",
    spawningInfo:
      "Pink salmon have a strict two-year life cycle, spawning in odd years in some rivers and even years in others. They spawn from July through October in small coastal streams and lower sections of larger rivers. Females deposit 1,500 to 2,000 eggs in shallow gravel nests, and all adults die within weeks of spawning.",
    spawningMonths: ["July", "August", "September", "October"],
    spawningTempF: "44-52°F",
    lifespan: "Exactly 2 years, the shortest and most rigid life cycle of any Pacific salmon species",
    waterTemperatureRange: "42-58°F (optimal 46-54°F)",
    flyFishingTips:
      "Target fresh, ocean-bright pink salmon in tidewater and the lower few miles of spawning streams for the best sport. Use small, bright pink and chartreuse flies on a dead drift or slow swing. Light tackle heightens the experience, as these scrappy fish fight well above their weight class on a 5 or 6-weight rod.",
    tackleRecommendations:
      "A 9-foot 5 or 6-weight rod provides excellent sport with pink salmon. Use a floating line with 6-10 lb tippet and small, bright flies.",
    funFacts: [
      "Pink salmon have the most rigid life cycle of any salmon species, living exactly two years with no exceptions",
      "An estimated 400 million pink salmon return to spawn in Alaska during peak odd-year runs",
      "Male pink salmon develop a grotesquely exaggerated dorsal hump during spawning, giving them the nickname humpies",
      "Pink salmon fry migrate to the ocean almost immediately after emerging from the gravel, spending virtually no time in freshwater",
    ],
    relatedDestinationIds: ["dest-alaska", "dest-british-columbia"],
    relatedRiverIds: ["river-kenai", "river-copper-river"],
    distributionCoordinates: [
      { name: "Prince William Sound, AK", latitude: 60.6, longitude: -147.0 },
      { name: "Southeast Alaska", latitude: 57.0, longitude: -134.4 },
      { name: "Bella Coola, BC", latitude: 52.4, longitude: -126.7 },
      { name: "Puget Sound, WA", latitude: 47.6, longitude: -122.3 },
    ],
    metaTitle: "Pink Salmon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to pink (humpy) salmon fly fishing: abundant runs, light tackle techniques, and the best Alaskan and British Columbian destinations.",
    featured: false,
  },
  {
    id: "species-chum-salmon",
    slug: "chum-salmon",
    commonName: "Chum Salmon",
    scientificName: "Oncorhynchus keta",
    family: "salmon",
    description:
      "The chum salmon is one of the most underappreciated game fish in the Pacific salmon family, yet it offers some of the hardest-fighting action available to fly anglers in Alaska and the Pacific Northwest. Known as dog salmon for the large canine-like teeth that males develop during spawning, chum salmon are the second-largest Pacific salmon species, averaging 8 to 15 pounds and occasionally exceeding 30 pounds. Fresh from the ocean, chum salmon are bright chrome with subtle purple and green vertical bars that intensify dramatically as fish enter spawning condition. Chum salmon have gained increasing popularity among fly anglers who appreciate their aggressive strikes, powerful runs, and availability in large numbers across a wide geographic range. Late-season chum runs in October and November extend the salmon fishing calendar well after other species have finished spawning.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/FMIB_39935_Oncorhynchus_keta_%28Walbaum%29_Dog_salmon_Drawn_from_a_specimen_collected_at_Fort_Alexander%2C_Cook%27s_Inlet%2C_Alaska.jpeg", // FMIB — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/FMIB_39935_Oncorhynchus_keta_%28Walbaum%29_Dog_salmon_Drawn_from_a_specimen_collected_at_Fort_Alexander%2C_Cook%27s_Inlet%2C_Alaska.jpeg",
    nativeRange: "Widest geographic range of any Pacific salmon, from San Francisco Bay north through Alaska and across to Korea, Japan, and Arctic Russia",
    introducedRange: "No significant introductions outside native range; occasional stray fish appear in non-native waters",
    averageSize: "22-30 inches, 8-15 lbs",
    recordSize: "35 lbs (Edie Pass, British Columbia, 1995)",
    recordDetails: "Caught by Todd Johansson; British Columbia's coastal rivers produce some of the largest chum salmon on record",
    preferredHabitat:
      "Open ocean during marine phase; coastal rivers, tidal estuaries, and small streams during spawning migration; prefers moderate currents and gravel substrates",
    preferredFlies: [
      "Egg-Sucking Leech #2-6",
      "Chartreuse Flash Fly #4-8",
      "Woolly Bugger #2-6",
      "Pink Marabou #4-6",
      "Comet #4-8",
      "Glo Bug #6-10",
      "Purple Egg-Sucking Leech #2-4",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Oncorhynchus",
      species: "O. keta",
    },
    conservationStatus: "Columbia River chum are listed as Threatened under the ESA; Alaskan populations remain healthy with strong commercial harvests",
    diet: "In the ocean: zooplankton, jellyfish, small fish, and squid; in freshwater during spawning: non-feeding but will aggressively strike bright, flashy patterns",
    spawningInfo:
      "Chum salmon typically spawn from September through January, making them the latest-running Pacific salmon species in many systems. They favor lower river reaches and small coastal streams with spring-fed groundwater upwelling. Females deposit 2,400 to 3,100 eggs in gravel redds, and all adults die after spawning.",
    spawningMonths: ["September", "October", "November", "December", "January"],
    spawningTempF: "42-50°F",
    lifespan: "3-6 years, with most spending 2-4 years in the ocean before returning to spawn",
    waterTemperatureRange: "40-56°F (optimal 44-52°F)",
    flyFishingTips:
      "Target fresh chum salmon in tidewater and lower river sections where they are still bright and aggressive. Chartreuse, pink, and purple flies provoke the most strikes. Chum salmon fight exceptionally hard for their size, so be prepared for powerful runs and dogged resistance near the end of the fight.",
    tackleRecommendations:
      "A 9-foot 8-weight rod is standard for chum salmon. Use a floating or sink-tip line with 12-16 lb tippet. Heavy chum on light gear can be an endurance contest.",
    funFacts: [
      "Chum salmon have the widest natural geographic distribution of any Pacific salmon species, spanning from California to Korea",
      "Male chum develop dramatic vertical bars of purple, green, and red during spawning, among the most vivid colors in any salmonid",
      "Chum salmon fry migrate to the ocean within weeks of emerging from the gravel, spending almost no time in freshwater",
      "The name dog salmon comes from the fearsome canine-like teeth males develop during spawning season",
    ],
    relatedDestinationIds: ["dest-alaska", "dest-british-columbia"],
    relatedRiverIds: ["river-kenai", "river-bristol-bay"],
    distributionCoordinates: [
      { name: "Juneau, AK", latitude: 58.3, longitude: -134.4 },
      { name: "Bella Coola, BC", latitude: 52.4, longitude: -126.7 },
      { name: "Hood Canal, WA", latitude: 47.6, longitude: -122.9 },
      { name: "Chignik, AK", latitude: 56.3, longitude: -158.4 },
    ],
    metaTitle: "Chum Salmon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to chum (dog) salmon fly fishing: hard-fighting action, bright patterns, late-season runs, and top Alaskan destinations.",
    featured: false,
  },
  {
    id: "species-atlantic-salmon",
    slug: "atlantic-salmon",
    commonName: "Atlantic Salmon",
    scientificName: "Salmo salar",
    family: "salmon",
    description:
      "The Atlantic salmon is the original salmon of the fly fishing world and has been pursued with flies for centuries in the rivers of the British Isles, Scandinavia, and eastern North America. Often called the king of fish, the Atlantic salmon is a supremely powerful and acrobatic game fish that can exceed 40 pounds in the largest river systems. Unlike Pacific salmon, Atlantic salmon are iteroparous and can survive spawning to return to the ocean and spawn again in subsequent years. Fly fishing for Atlantic salmon is steeped in tradition and pageantry, with classic wet fly patterns like the Jock Scott, Thunder and Lightning, and Green Highlander still in use today alongside modern tube flies and bombers. The rivers of Iceland, Scotland, Norway, Russia's Kola Peninsula, and eastern Canada's Maritime provinces offer the finest Atlantic salmon fly fishing in the world, each with distinct character and fishing culture.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/44/FMIB_51065_Atlantic_Salmon.jpeg", // FMIB — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/44/FMIB_51065_Atlantic_Salmon.jpeg",
    nativeRange: "North Atlantic Ocean and its tributary rivers, from Connecticut and Quebec south of Greenland, across to Iceland, the British Isles, Scandinavia, and the Baltic",
    introducedRange: "Patagonia (Argentina and Chile), New Zealand, and various Pacific coast rivers (mostly unsuccessful establishment)",
    averageSize: "24-34 inches, 8-16 lbs",
    recordSize: "79 lbs 2 oz (Tana River, Norway, 1928)",
    recordDetails: "Caught by Henrik Henriksen on a fly; Norway's Tana River has produced many of the largest Atlantic salmon ever recorded",
    preferredHabitat:
      "Open North Atlantic during ocean feeding phase; clean, cold rivers with cobble and gravel substrates, deep holding pools, and well-oxygenated runs during spawning migration",
    preferredFlies: [
      "Bomber #2-6",
      "Green Highlander #4-8",
      "Ally's Shrimp #6-10",
      "Cascade tube fly #6-10",
      "Blue Charm #6-8",
      "Buck Bug #4-6",
      "Undertaker #4-8",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salmo",
      species: "S. salar",
    },
    conservationStatus: "Endangered in the US under the ESA (Gulf of Maine DPS); populations declining across much of the range due to aquaculture impacts, habitat loss, and marine survival issues",
    diet: "In the ocean: capelin, sand lance, herring, shrimp, and squid; in freshwater during spawning: non-feeding, but legendary for striking traditional wet flies and dry flies out of instinct and aggression",
    spawningInfo:
      "Atlantic salmon enter rivers from spring through fall and spawn in late October through December. Females construct redds in gravel substrates in the tails of pools and glides. Unlike Pacific salmon, many Atlantic salmon survive spawning (called kelts) and return to the ocean to feed and potentially spawn again.",
    spawningMonths: ["October", "November", "December"],
    spawningTempF: "40-48°F",
    lifespan: "5-13 years, with the potential for multiple spawning migrations thanks to iteroparous reproduction",
    waterTemperatureRange: "38-65°F (optimal 45-55°F for fishing)",
    flyFishingTips:
      "Atlantic salmon fishing demands patience and precise presentation. Classic wet fly swinging on a floating or intermediate line is the traditional approach, working methodically through known holding lies. Dry fly fishing with bombers and waking flies is thrilling when conditions are right. Water temperature and height are critical factors in determining which fly size and technique to use.",
    tackleRecommendations:
      "A 12 to 14-foot 8 or 9-weight spey rod for larger rivers, or a 9-foot 7 or 8-weight single-hand rod for smaller streams. Use floating or intermediate lines and 8-12 lb tippet.",
    funFacts: [
      "Atlantic salmon have been pursued with flies since at least the 15th century, making salmon fly fishing one of the oldest forms of recreational angling",
      "A single Atlantic salmon can leap waterfalls up to 12 feet high during its upstream migration",
      "Unlike all Pacific salmon species, Atlantic salmon can survive spawning and return to the ocean to spawn again",
      "The elaborate Victorian-era Atlantic salmon flies, tied with exotic feathers from around the world, are now prized by collectors and can sell for thousands of dollars each",
    ],
    relatedDestinationIds: ["dest-iceland", "dest-scotland", "dest-kamchatka"],
    relatedRiverIds: ["river-penns-creek"],
    distributionCoordinates: [
      { name: "Laxa i Adalal, Iceland", latitude: 65.6, longitude: -18.2 },
      { name: "River Spey, Scotland", latitude: 57.3, longitude: -3.1 },
      { name: "Ponoi River, Russia", latitude: 67.1, longitude: -41.1 },
      { name: "Miramichi River, NB", latitude: 47.0, longitude: -65.5 },
      { name: "Tana River, Norway", latitude: 70.1, longitude: 27.0 },
    ],
    metaTitle: "Atlantic Salmon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to Atlantic salmon fly fishing: the king of fish, traditional techniques, classic flies, and the finest rivers in Iceland, Scotland, and beyond.",
    featured: false,
  },
  // ═══════════════════════════════════════════════════════════════════
  // CHAR (family: "char")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-brook-trout",
    slug: "brook-trout",
    commonName: "Brook Trout",
    scientificName: "Salvelinus fontinalis",
    family: "char",
    description:
      "Despite its common name, the brook trout is technically a char, closely related to Arctic char and lake trout rather than true trout. Native to eastern North America, brook trout are arguably the most beautiful freshwater fish on the continent, with a dark olive-green body covered in vermiculated patterns on the back and dorsal fin, pale spots and vivid red spots with blue halos along the flanks, and brilliant orange-red fins edged in white and black during spawning season. Brook trout require the coldest and cleanest water of any trout species, making them excellent indicators of watershed health. While brook trout in their native eastern streams rarely exceed 10 inches, populations in larger rivers, lakes, and the sea-run variety known as salters can grow substantially larger. Their eagerness to take a well-presented dry fly makes them a perennial favorite among fly anglers.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/dd/Brook_trout_freshwater_fish.jpg", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/dd/Brook_trout_freshwater_fish.jpg",
    nativeRange: "Eastern North America, from Georgia and the Appalachian Mountains north to the Arctic Circle, including the Great Lakes basin and Hudson Bay drainages",
    introducedRange: "Western North America, Europe, South America, and Australasia; widely stocked for recreational fishing",
    averageSize: "6-12 inches, 0.25-1.5 lbs",
    recordSize: "14 lbs 8 oz (Nipigon River, Ontario, 1916)",
    recordDetails: "Caught by Dr. W.J. Cook; this legendary record has stood for over a century and may never be broken",
    preferredHabitat:
      "Small, cold headwater streams with dense canopy; spring-fed creeks and beaver ponds; requires water below 65°F and thrives best below 58°F",
    preferredFlies: [
      "Royal Wulff #12-16",
      "Ausable Wulff #10-14",
      "Elk Hair Caddis #14-16",
      "Mickey Finn #8-12",
      "Bead Head Prince Nymph #12-16",
      "Black-nosed Dace #8-12",
      "Adams #14-16",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salvelinus",
      species: "S. fontinalis",
    },
    conservationStatus: "Least Concern globally; southern Appalachian populations are declining due to habitat loss, acid rain, and competition from non-native trout",
    diet: "Aquatic insects (mayflies, caddisflies, stoneflies, midges), terrestrial insects (ants, beetles, hoppers), small crustaceans, worms, and occasionally small fish",
    spawningInfo:
      "Brook trout are fall spawners, constructing redds in gravel areas with groundwater upwelling from September through November. Females seek out springs and seeps that provide a constant flow of cold, oxygen-rich water over developing eggs. Eggs incubate through winter and hatch in late winter or early spring.",
    spawningMonths: ["September", "October", "November"],
    spawningTempF: "40-49°F",
    lifespan: "3-6 years in most populations, with fish rarely exceeding age 5 in small streams",
    waterTemperatureRange: "34-65°F (optimal 45-58°F)",
    flyFishingTips:
      "Brook trout are eager surface feeders and respond exceptionally well to attractor dry flies, especially in small mountain streams where they have limited exposure to fishing pressure. Approach stealthily and keep a low profile, as brook trout in clear headwater streams are easily spooked. Small streamers like the Mickey Finn can be deadly for larger specimens.",
    tackleRecommendations:
      "A 7 to 8-foot 2 or 3-weight rod is perfect for small brook trout streams. Use 4X-6X tippet and light leaders for delicate presentations in tight quarters.",
    funFacts: [
      "Brook trout are the state fish of nine US states, more than any other fish species",
      "Sea-run brook trout, called salters, migrate to coastal estuaries and can grow to over 6 pounds",
      "The world record brook trout from Nipigon River has stood unchallenged since 1916, making it one of the oldest standing freshwater fishing records",
      "Brook trout can hybridize with brown trout to produce tiger trout and with lake trout to produce splake",
    ],
    relatedDestinationIds: ["dest-pennsylvania", "dest-michigan", "dest-montana", "dest-colorado"],
    relatedRiverIds: ["river-letort-spring-run", "river-au-sable", "river-big-spring"],
    distributionCoordinates: [
      { name: "Letort Spring Run, PA", latitude: 40.2, longitude: -77.2 },
      { name: "Au Sable River, MI", latitude: 44.7, longitude: -84.3 },
      { name: "Shenandoah NP, VA", latitude: 38.5, longitude: -78.4 },
      { name: "Adirondacks, NY", latitude: 44.0, longitude: -74.0 },
      { name: "White Mountains, NH", latitude: 44.1, longitude: -71.3 },
    ],
    metaTitle: "Brook Trout — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to brook trout fly fishing: America's most beautiful native char, habitat, preferred flies, and top eastern and mountain destinations.",
    featured: true,
  },
  {
    id: "species-arctic-char",
    slug: "arctic-char",
    commonName: "Arctic Char",
    scientificName: "Salvelinus alpinus",
    family: "char",
    description:
      "The Arctic char is the northernmost freshwater fish species on Earth and one of the most strikingly colored salmonids in existence. Found in lakes, rivers, and coastal waters across the circumpolar Arctic, Arctic char exhibit extraordinary variation in form, color, and life history. During spawning season, male char develop brilliant orange to deep crimson bellies, white-tipped fins, and an overall appearance that rivals any tropical fish for sheer visual impact. Arctic char are supremely adapted to cold, nutrient-poor waters where other fish species cannot survive, and they are often the only fish species present in high-Arctic lakes. Both landlocked and anadromous (sea-run) forms exist, with anadromous char migrating to coastal waters in summer to feed before returning to freshwater in fall. Fly fishing for Arctic char is a wilderness experience that takes anglers to some of the most remote and pristine landscapes remaining on the planet.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/FMIB_46339_Alpine_Char.jpeg", // FMIB 1877 Jonathan Couch — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/FMIB_46339_Alpine_Char.jpeg",
    nativeRange: "Circumpolar Arctic, including northern Canada, Alaska, Greenland, Iceland, Scandinavia, and Arctic Russia; relic populations in alpine lakes of Scotland, Ireland, and the Alps",
    introducedRange: "Limited introductions in mountain lakes of the western United States and southern hemisphere cold-water lakes",
    averageSize: "14-24 inches, 2-6 lbs",
    recordSize: "32 lbs 9 oz (Tree River, Northwest Territories, 1981)",
    recordDetails: "Caught by Jeffrey Ward; the Tree River in Canada's Arctic is legendary for producing trophy sea-run Arctic char",
    preferredHabitat:
      "Deep, cold oligotrophic lakes and tundra rivers in the Arctic; coastal marine waters during summer feeding migrations for anadromous populations",
    preferredFlies: [
      "Egg-Sucking Leech #4-8",
      "Woolly Bugger #4-8",
      "Clouser Minnow #4-6",
      "Flesh Fly #4-8",
      "Bead Head Nymph #10-14",
      "Glo Bug #6-10",
      "Zonker #4-6",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Salvelinus",
      species: "S. alpinus",
    },
    conservationStatus: "Least Concern (IUCN) globally; some southern relic populations in Europe are Vulnerable due to climate change and habitat degradation",
    diet: "Aquatic invertebrates, small crustaceans, zooplankton, insect larvae, and small fish; anadromous populations feed on marine invertebrates and capelin in coastal waters",
    spawningInfo:
      "Arctic char spawn in the fall, typically September through November, on gravel shoals in lakes or in river substrates. Some populations spawn only every other year due to the energy demands of reproduction in nutrient-poor Arctic environments. Males develop vivid spawning colors and compete aggressively for access to females.",
    spawningMonths: ["September", "October", "November"],
    spawningTempF: "36-43°F",
    lifespan: "10-25 years, with some populations in low-productivity Arctic lakes reaching 40 years",
    waterTemperatureRange: "32-55°F (optimal 39-50°F)",
    flyFishingTips:
      "Sea-run Arctic char are aggressive fly takers when they first enter rivers from the ocean in late summer and fall. Use bright, flashy patterns that imitate the marine prey they have been feeding on. In lakes, focus on inlet and outlet areas where char congregate to feed on migrating insects and small fish.",
    tackleRecommendations:
      "A 9-foot 6 or 7-weight rod handles most Arctic char situations. Use sink-tip lines for river fishing and full-sinking lines for deep lakes. Tippet in the 8-12 lb range is appropriate.",
    funFacts: [
      "Arctic char is the northernmost freshwater fish species on Earth, found in lakes within 600 miles of the North Pole",
      "Some Arctic char populations have been isolated in lakes since the last ice age, over 10,000 years ago, resulting in remarkable genetic diversity",
      "Char are farmed commercially in Iceland and Canada and are considered among the finest eating fish in the world",
      "In some lakes, multiple morphs of Arctic char coexist, each occupying a different ecological niche and differing in size, diet, and coloration",
    ],
    relatedDestinationIds: ["dest-alaska", "dest-iceland", "dest-british-columbia", "dest-kamchatka"],
    relatedRiverIds: ["river-bristol-bay", "river-copper-river"],
    distributionCoordinates: [
      { name: "Tree River, NWT", latitude: 67.2, longitude: -111.9 },
      { name: "Thingvallavatn, Iceland", latitude: 64.2, longitude: -21.1 },
      { name: "Bristol Bay, AK", latitude: 58.8, longitude: -158.5 },
      { name: "Svalbard, Norway", latitude: 78.2, longitude: 15.6 },
    ],
    metaTitle: "Arctic Char — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to Arctic char fly fishing: the world's northernmost freshwater fish, anadromous runs, wilderness destinations, and top Arctic fly patterns.",
    featured: false,
  },
  // ═══════════════════════════════════════════════════════════════════
  // GRAYLING (family: "grayling")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-arctic-grayling",
    slug: "arctic-grayling",
    commonName: "Arctic Grayling",
    scientificName: "Thymallus arcticus",
    family: "grayling",
    description:
      "The Arctic grayling is one of the most visually striking freshwater fish in North America, instantly recognizable by its enormous, sail-like dorsal fin adorned with iridescent spots of blue, purple, and pink. Once widespread across the northern half of the continent, Arctic grayling have been reduced to a fraction of their historical range in the lower 48 states, with Montana's Big Hole River supporting the last self-sustaining fluvial population in the contiguous United States. In Alaska, British Columbia, and the Canadian Arctic, grayling remain abundant and provide outstanding fly fishing opportunities. They are enthusiastic surface feeders, making them a dream species for dry fly purists, and they are found in some of the most remote and scenic waters on the planet. Their willingness to rise to a well-presented dry fly and the spectacular beauty of their dorsal fin make every grayling a memorable catch.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/de/FMIB_51081_Alaska_Grayling.jpeg", // FMIB — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/de/FMIB_51081_Alaska_Grayling.jpeg",
    nativeRange: "Northern North America from Alaska through Canada; relic populations in Montana and historically Michigan; also found across Siberia and into Mongolia",
    introducedRange: "Limited stocking efforts in mountain lakes of the western United States to supplement declining populations",
    averageSize: "10-15 inches, 0.5-1.5 lbs",
    recordSize: "5 lbs 15 oz (Katseyedie River, Northwest Territories, 1967)",
    recordDetails: "Caught by Jeanne Branson; the Katseyedie River in Canada's Northwest Territories produced this long-standing world record",
    preferredHabitat:
      "Clear, cold rivers and lakes in northern regions; gravel-bottomed pools and runs in flowing water; thrives at temperatures below 55°F",
    preferredFlies: [
      "Royal Wulff #12-16",
      "Elk Hair Caddis #14-16",
      "Adams #14-16",
      "Black Gnat #14-18",
      "Parachute Adams #14-18",
      "Griffith's Gnat #18-22",
      "Prince Nymph #14-16",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Thymallus",
      species: "T. arcticus",
    },
    conservationStatus: "Species of Special Concern in Montana; extinct in Michigan since the 1930s; abundant in Alaska and northern Canada",
    diet: "Primarily aquatic insects (mayflies, caddisflies, stoneflies, midges) and terrestrial insects; also small crustaceans and occasionally fish eggs",
    spawningInfo:
      "Arctic grayling are spring spawners, typically reproducing from April through June as water temperatures rise after ice-out. They broadcast eggs over gravel substrates in rivers and stream mouths without constructing redds. Males display their spectacular dorsal fin during courtship to attract females.",
    spawningMonths: ["April", "May", "June"],
    spawningTempF: "40-50°F",
    lifespan: "6-10 years, with fish in far northern populations occasionally reaching 15 years",
    waterTemperatureRange: "36-55°F (optimal 40-50°F)",
    flyFishingTips:
      "Arctic grayling are one of the most willing dry fly fish in freshwater. Small attractor patterns and insect imitations presented with a drag-free drift will consistently produce strikes. Grayling have relatively soft mouths, so use a gentle hook set and light tippet to avoid pulling the fly free.",
    tackleRecommendations:
      "A 9-foot 3 or 4-weight rod is ideal for grayling fishing. Use 4X-6X tippet and light leaders for delicate dry fly presentations.",
    funFacts: [
      "The grayling's enormous dorsal fin can be folded flat against its body for streamlining in strong currents and fanned out for display, thermoregulation, and stability",
      "Freshly caught grayling emit a faint scent of thyme, which is the origin of their genus name Thymallus",
      "Montana's Big Hole River hosts the last fluvial Arctic grayling population in the lower 48 states",
      "Grayling were once so abundant in Michigan that they were commercially harvested and shipped to restaurants in Detroit and Chicago",
    ],
    relatedDestinationIds: ["dest-montana", "dest-alaska", "dest-british-columbia"],
    relatedRiverIds: ["river-big-hole", "river-bristol-bay", "river-kenai"],
    distributionCoordinates: [
      { name: "Big Hole River, MT", latitude: 45.7, longitude: -113.2 },
      { name: "Togiak River, AK", latitude: 59.1, longitude: -160.3 },
      { name: "Great Bear Lake, NWT", latitude: 65.8, longitude: -121.3 },
      { name: "Stikine River, BC", latitude: 57.1, longitude: -131.6 },
    ],
    metaTitle: "Arctic Grayling — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to Arctic grayling fly fishing: the sail-finned beauty, dry fly techniques, conservation status, and top northern destinations.",
    featured: false,
  },
  // ═══════════════════════════════════════════════════════════════════
  // SALTWATER (family: "saltwater")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-bonefish",
    slug: "bonefish",
    commonName: "Bonefish",
    scientificName: "Albula vulpes",
    family: "saltwater",
    description:
      "The bonefish is the undisputed king of the saltwater flats and the species that launched the entire saltwater fly fishing revolution. Found on shallow tropical flats throughout the Caribbean, Bahamas, and Indo-Pacific, bonefish are often called the grey ghost for their silvery, torpedo-shaped bodies that seem to materialize out of nowhere on the white sand flats. Sight fishing for bonefish on the flats is considered by many to be the most exciting and visually engaging form of fly fishing, requiring accurate casting, careful wading, and a deep understanding of tidal movements and flat ecology. When hooked, bonefish are famous for their blistering initial run, often peeling off a hundred yards of backing in seconds. The challenge of spotting a tailing or cruising fish, making a precise cast, and then holding on during that first explosive run makes bonefishing an addiction that draws anglers back to the flats year after year.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/FMIB_42368_Albula_vulpes_%28Linnaeus%29.jpeg", // FMIB Jordan & Evermann 1905 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/FMIB_42368_Albula_vulpes_%28Linnaeus%29.jpeg",
    nativeRange: "Tropical and subtropical flats worldwide; Caribbean, Bahamas, Florida Keys, Hawaii, and Indo-Pacific from East Africa to French Polynesia",
    introducedRange: "No introductions; natural distribution throughout tropical and subtropical coastal waters",
    averageSize: "18-26 inches, 3-8 lbs",
    recordSize: "16 lbs (Biscayne Bay, Florida, 2007)",
    recordDetails: "Caught by Brian Gorski on fly tackle; Biscayne Bay in South Florida remains a world-class bonefish destination",
    preferredHabitat:
      "Shallow saltwater flats with sand, turtle grass, and marl bottoms; tidal channels and mangrove edges; water depth typically 6 inches to 3 feet",
    preferredFlies: [
      "Gotcha #4-8",
      "Crazy Charlie #4-8",
      "Christmas Island Special #6",
      "Mantis Shrimp #4-6",
      "Bonefish Bitter #4-6",
      "Clouser Minnow #4-6",
      "Spawning Shrimp #6-8",
    ],
    taxonomy: {
      order: "Albuliformes",
      family: "Albulidae",
      genus: "Albula",
      species: "A. vulpes",
    },
    conservationStatus: "Near Threatened (IUCN); populations in Florida have declined significantly, while Bahamas and Indo-Pacific populations remain relatively healthy",
    diet: "Crabs, shrimp, mantis shrimp, clams, sea worms, and small fish found on sandy and grassy flats; feeds by rooting in the substrate, often tailing with their forks exposed above the surface",
    spawningInfo:
      "Bonefish spawn offshore in deep water, typically during full moon periods from November through May. Larvae are transparent and ribbon-like, drifting in ocean currents before settling on flats as juveniles. Spawning aggregations can number in the thousands and have been documented off the Bahamas and Florida Keys.",
    spawningMonths: ["November", "December", "January", "February", "March", "April", "May"],
    spawningTempF: "72-82°F (water temperature)",
    lifespan: "15-20 years, making them relatively long-lived for their size",
    waterTemperatureRange: "68-88°F (optimal 75-85°F)",
    flyFishingTips:
      "Accurate casting is the single most important skill in bonefishing. Practice casting 40-60 feet accurately in wind before your trip. Lead the fish by 6-10 feet and let the fly sink before beginning a slow, steady strip retrieve. Tailing fish are feeding actively and are the best targets.",
    tackleRecommendations:
      "A 9-foot 8-weight rod is the standard bonefish setup. Use a weight-forward floating tropical line and 10-12 lb fluorocarbon tippet. Bring a reel with a smooth, reliable drag and at least 150 yards of backing.",
    funFacts: [
      "Bonefish can accelerate from zero to 30 miles per hour in seconds, making their initial run one of the most thrilling experiences in all of fly fishing",
      "Their crushing pharyngeal teeth can crack open the shells of crabs, clams, and sea urchins",
      "Bonefish were the first saltwater species to be widely targeted on fly tackle, launching the saltwater fly fishing movement in the 1950s",
      "They can detect the vibrations of prey buried several inches beneath the sand using sensitive lateral line receptors",
    ],
    relatedDestinationIds: ["dest-bahamas", "dest-florida-keys", "dest-belize", "dest-christmas-island"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Andros Island, Bahamas", latitude: 24.7, longitude: -78.0 },
      { name: "Florida Keys, FL", latitude: 24.7, longitude: -81.1 },
      { name: "Ambergris Caye, Belize", latitude: 18.0, longitude: -87.9 },
      { name: "Christmas Island, Kiribati", latitude: 1.9, longitude: -157.5 },
      { name: "Seychelles", latitude: -4.6, longitude: 55.5 },
    ],
    metaTitle: "Bonefish — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to bonefish fly fishing: the grey ghost of the flats, sight fishing techniques, top Caribbean and Indo-Pacific destinations, and essential tackle.",
    featured: true,
  },
  {
    id: "species-permit",
    slug: "permit",
    commonName: "Permit",
    scientificName: "Trachinotus falcatus",
    family: "saltwater",
    description:
      "The permit is widely considered the most difficult fish to catch on a fly in the world, and landing one on the flats is a defining achievement in any fly angler's career. Found on the same tropical flats as bonefish and tarpon, the permit is a large, powerful member of the jack family distinguished by its deep, compressed body, sickle-shaped tail, and dark dorsal and anal fins. Permit feed primarily on crabs and other crustaceans found on sandy and rocky flats, and their wariness and selectivity are legendary among fly anglers. A typical permit fishing day might involve dozens of shots at fish that refuse, spook, or simply ignore the fly entirely. But when everything comes together and a permit tips down on your crab pattern, the ensuing fight is a powerful, drag-testing battle that cements the permit's reputation as the ultimate flats challenge.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0d/FMIB_33896_Trachinotus_Falcatus_%28Linnaeus%29.jpeg", // FMIB Jordan & Evermann — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0d/FMIB_33896_Trachinotus_Falcatus_%28Linnaeus%29.jpeg",
    nativeRange: "Western Atlantic from Massachusetts south through the Caribbean, Gulf of Mexico, and along the coast of Brazil; also found in Bermuda",
    introducedRange: "No introductions; entirely natural distribution in the western Atlantic and Caribbean basin",
    averageSize: "20-30 inches, 10-25 lbs",
    recordSize: "60 lbs (Fort Lauderdale, Florida, 1997)",
    recordDetails: "Caught by Roy Brooker on conventional tackle; the fly rod record stands at 56 pounds from Key West, Florida",
    preferredHabitat:
      "Shallow saltwater flats with sand and rocky substrate; reef edges, channels, and wrecks; feeds over turtle grass flats and sandy depressions in water 1-10 feet deep",
    preferredFlies: [
      "Merkin Crab #2-6",
      "Permit Crab #2-4",
      "Raghead Crab #2-4",
      "Flexo Crab #2-4",
      "EP Crab #2-4",
      "Spawning Shrimp #4-6",
      "Wool Crab #2-4",
    ],
    taxonomy: {
      order: "Carangiformes",
      family: "Carangidae",
      genus: "Trachinotus",
      species: "T. falcatus",
    },
    conservationStatus: "Least Concern (IUCN); populations are healthy throughout most of their range, but increasingly managed through catch-and-release regulations in key fisheries",
    diet: "Primarily crabs (blue crabs, spider crabs, mole crabs), shrimp, sea urchins, small clams, and occasionally small fish; uses powerful jaws and pharyngeal teeth to crush hard-shelled prey",
    spawningInfo:
      "Permit spawn offshore from April through September, with peak activity during full moon periods. They form large aggregations near reef edges and channel mouths for spawning. Larvae are pelagic and settle onto coastal flats as juveniles, where they grow rapidly feeding on small crustaceans.",
    spawningMonths: ["April", "May", "June", "July", "August", "September"],
    spawningTempF: "76-84°F (water temperature)",
    lifespan: "20-30 years, making them one of the longest-lived flats species",
    waterTemperatureRange: "70-88°F (optimal 76-84°F)",
    flyFishingTips:
      "Permit fishing is a game of patience and precision. Use weighted crab patterns that land softly and sink quickly to the bottom. Cast well ahead of a cruising permit and let the fly sit motionless on the bottom until the fish approaches. Movement should be minimal and slow, mimicking a crab trying to hide rather than flee.",
    tackleRecommendations:
      "A 9-foot 9 or 10-weight rod with a powerful butt section for fighting large fish in current. Use 12-16 lb fluorocarbon tippet and a reel with a smooth drag and at least 200 yards of backing.",
    funFacts: [
      "Permit have been called the holy grail of flats fishing, and many experienced anglers go years between catches",
      "The Grand Slam of saltwater fly fishing (bonefish, permit, and tarpon in one day) is one of the most coveted achievements in the sport",
      "Permit can detect the electromagnetic fields generated by crabs and shrimp buried in the sand",
      "Their deep, compressed body shape generates immense power that allows them to make sustained, drag-testing runs on the flats",
    ],
    relatedDestinationIds: ["dest-belize", "dest-florida-keys", "dest-bahamas"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Ascension Bay, Mexico", latitude: 19.8, longitude: -87.4 },
      { name: "Key West, FL", latitude: 24.6, longitude: -81.8 },
      { name: "Turneffe Atoll, Belize", latitude: 17.3, longitude: -87.9 },
      { name: "Los Roques, Venezuela", latitude: 11.8, longitude: -66.8 },
    ],
    metaTitle: "Permit — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to permit fly fishing: the ultimate flats challenge, crab patterns, sight fishing techniques, and top Caribbean destinations.",
    featured: false,
  },
  {
    id: "species-tarpon",
    slug: "tarpon",
    commonName: "Tarpon",
    scientificName: "Megalops atlanticus",
    family: "saltwater",
    description:
      "The tarpon is the undisputed heavyweight champion of saltwater fly fishing and arguably the most spectacular game fish in the world. Known as the silver king for its enormous, mirror-like scales and brilliant silver coloring, tarpon can exceed 200 pounds and are capable of explosive, repeated jumps that leave even experienced anglers in awe. Found throughout the tropical and subtropical Atlantic, from the coast of West Africa to the eastern seaboard of the Americas, tarpon congregate in remarkable numbers in the Florida Keys each spring during their annual migration. Hooking a tarpon on a fly rod is a violent, heart-stopping experience as the fish engulfs the fly, turns away, and erupts from the water in a shower of spray. The ensuing battle can last from minutes to hours and tests every aspect of an angler's skill, equipment, and physical endurance. Landing a tarpon over 100 pounds on a fly rod is one of the great achievements in sport fishing.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c2/FMIB_51739_Tarpon_or_Grande_Ecaille_Tarpon_atlanticus_Cuv_%26_Val_Florida.jpeg", // FMIB 1907 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c2/FMIB_51739_Tarpon_or_Grande_Ecaille_Tarpon_atlanticus_Cuv_%26_Val_Florida.jpeg",
    nativeRange: "Tropical and subtropical western Atlantic from Virginia south through the Caribbean, Gulf of Mexico, and along the coast of Brazil; also West Africa from Senegal to Angola",
    introducedRange: "Pacific coast of Panama and Costa Rica via the Panama Canal; scattered sightings in other non-native waters",
    averageSize: "40-70 inches, 40-100 lbs",
    recordSize: "286 lbs 9 oz (Lake Maracaibo, Venezuela, 2003)",
    recordDetails: "Caught by Max Domecq on conventional tackle; the fly rod record is 205 pounds from Homosassa, Florida",
    preferredHabitat:
      "Coastal waters including bays, passes, flats, channels, bridges, mangrove edges, and open ocean; tolerant of a wide range of salinities including freshwater",
    preferredFlies: [
      "Black Death #2/0-3/0",
      "EP Baitfish #2/0-3/0",
      "Tarpon Toad #2/0-3/0",
      "Cockroach #1/0-3/0",
      "Purple Demon #1/0-2/0",
      "Apte Too #2/0-3/0",
      "Laid-Up Tarpon Fly #1/0-2/0",
    ],
    taxonomy: {
      order: "Elopiformes",
      family: "Megalopidae",
      genus: "Megalops",
      species: "M. atlanticus",
    },
    conservationStatus: "Vulnerable (IUCN); populations have declined in some areas due to overharvest, habitat loss, and bycatch; strictly catch-and-release in Florida waters",
    diet: "Schooling baitfish (mullet, sardines, pinfish), crabs, shrimp, and other crustaceans; tarpon are opportunistic predators that feed at all levels of the water column",
    spawningInfo:
      "Tarpon spawn offshore in deep water from May through August, releasing millions of eggs during moonlit nights. Larvae are transparent and ribbon-shaped, drifting in ocean currents for weeks before settling into coastal nursery habitat. Juvenile tarpon thrive in mangrove backwaters, canals, and even landlocked freshwater ponds.",
    spawningMonths: ["May", "June", "July", "August"],
    spawningTempF: "76-86°F (water temperature)",
    lifespan: "50-80 years, making them one of the longest-lived fish commonly targeted by fly anglers",
    waterTemperatureRange: "72-90°F (optimal 76-86°F)",
    flyFishingTips:
      "Tarpon fishing demands a strip-strike rather than a trout-set when the fish eats the fly. Keep the rod tip low and use a strong, steady strip to set the hook in the tarpon's bony mouth. When the fish jumps, bow the rod toward it to create slack and prevent the hook from pulling free. Patience and stamina are essential for landing big fish.",
    tackleRecommendations:
      "A 12-weight rod is standard for adult tarpon, with a high-quality reel holding at least 250 yards of 30-40 lb backing. Use a 60-80 lb fluorocarbon shock tippet to withstand the tarpon's abrasive gill plates.",
    funFacts: [
      "Tarpon have a primitive lung-like swim bladder that allows them to gulp air at the surface, enabling them to survive in oxygen-poor water",
      "A single tarpon scale can be larger than a silver dollar, and anglers traditionally keep a single scale as a trophy rather than harvesting the fish",
      "Tarpon have remained virtually unchanged for over 100 million years, making them living fossils that coexisted with dinosaurs",
      "The migration of giant tarpon through the Florida Keys each spring draws fly anglers from around the world and is one of the great spectacles in sport fishing",
    ],
    relatedDestinationIds: ["dest-florida-keys", "dest-belize", "dest-bahamas"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Key West, FL", latitude: 24.6, longitude: -81.8 },
      { name: "Islamorada, FL", latitude: 24.9, longitude: -80.6 },
      { name: "Boca Grande, FL", latitude: 26.8, longitude: -82.3 },
      { name: "San Pedro, Belize", latitude: 18.0, longitude: -87.9 },
      { name: "Campeche, Mexico", latitude: 19.8, longitude: -90.5 },
    ],
    metaTitle: "Tarpon — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to tarpon fly fishing: the silver king, jump-filled battles, essential techniques, and top Florida Keys and Caribbean destinations.",
    featured: false,
  },
  {
    id: "species-redfish",
    slug: "redfish",
    commonName: "Redfish",
    scientificName: "Sciaenops ocellatus",
    family: "saltwater",
    description:
      "The redfish, also known as the red drum, is one of the most popular inshore saltwater game fish in the southeastern United States and Gulf Coast. Named for their copper-bronze coloring and the distinctive black spot or spots near the base of the tail, redfish inhabit shallow coastal waters from Massachusetts south through the Gulf of Mexico. They are powerful, tenacious fighters that make long, drag-pulling runs when hooked on a fly rod. Sight fishing for tailing redfish on shallow grass flats and oyster bars is a quintessentially southern saltwater experience that rivals bonefishing for visual excitement and technical challenge. Redfish are remarkably adaptable, tolerating a wide range of salinities from nearly fresh to full ocean water, and they can be found in coastal marshes, tidal creeks, oyster reefs, and sandy flats throughout their range. Their accessibility and willingness to take a well-presented fly make them an ideal entry point for anglers transitioning from freshwater to saltwater fly fishing.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/FMIB_33320_Sciaenops_Ocellatus_%28Linnaeus%29.jpeg", // FMIB Jordan & Evermann — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/FMIB_33320_Sciaenops_Ocellatus_%28Linnaeus%29.jpeg",
    nativeRange: "Western Atlantic coast from Massachusetts south through the Gulf of Mexico to northern Mexico, with the highest concentrations along the Gulf states",
    introducedRange: "No significant introductions; some experimental stocking in Texas and other Gulf states to supplement natural populations",
    averageSize: "18-30 inches, 3-12 lbs",
    recordSize: "94 lbs 2 oz (Hatteras, North Carolina, 1984)",
    recordDetails: "Caught by David Deuel; the fly rod record is significantly smaller at around 44 pounds",
    preferredHabitat:
      "Shallow coastal flats, oyster bars, tidal creeks, spartina grass marshes, mangrove shorelines, and inlet areas; highly tolerant of salinity variations from brackish to full saltwater",
    preferredFlies: [
      "Clouser Minnow #1/0-4",
      "Spoon Fly #2-6",
      "EP Shrimp #2-6",
      "Redfish Crack #2-4",
      "Gurgler #1/0-4",
      "Crab Pattern #2-4",
      "Deceiver #1/0-4",
    ],
    taxonomy: {
      order: "Acanthuriformes",
      family: "Sciaenidae",
      genus: "Sciaenops",
      species: "S. ocellatus",
    },
    conservationStatus: "Least Concern; populations recovered dramatically after strict harvest regulations were implemented in the 1980s following severe overfishing",
    diet: "Crabs, shrimp, mullet, menhaden, pinfish, and other crustaceans and small fish found in coastal environments; uses downward-oriented mouth to feed on bottom-dwelling prey",
    spawningInfo:
      "Redfish spawn in nearshore waters from August through November, congregating near passes, inlets, and barrier island beaches. Females release millions of eggs during evening hours, and larvae drift into estuaries and marshes where juveniles grow rapidly. Redfish can live for decades and grow to enormous sizes.",
    spawningMonths: ["August", "September", "October", "November"],
    spawningTempF: "70-80°F (water temperature)",
    lifespan: "35-60 years, with bull redfish in the 40+ pound range often exceeding 30 years of age",
    waterTemperatureRange: "52-88°F (optimal 65-82°F)",
    flyFishingTips:
      "Look for tailing redfish on shallow flats during falling tides when fish concentrate in remaining water. Cast slightly beyond and past the fish, then strip the fly into its path with short, sharp retrieves. Gold and copper-colored flies that match the marsh environment are consistently productive. Weedless patterns are essential in grass-heavy areas.",
    tackleRecommendations:
      "A 9-foot 8-weight rod is the standard redfish setup. Use a weight-forward floating line with a 9-foot leader and 15-20 lb fluorocarbon tippet to handle the abrasive oyster shell habitat.",
    funFacts: [
      "The distinctive black spot near the tail is believed to confuse predators by mimicking an eye, causing attacks toward the tail rather than the head",
      "Redfish were at the center of a conservation crisis in the 1980s when the Cajun blackened redfish craze nearly decimated Gulf populations",
      "Bull redfish over 40 inches can produce a drumming sound by vibrating muscles against their swim bladder, audible to anglers in quiet conditions",
      "Juvenile redfish are called puppy drum and make excellent light-tackle targets on 6-weight fly rods in shallow marsh habitats",
    ],
    relatedDestinationIds: ["dest-florida-keys", "dest-bahamas"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Louisiana Marsh", latitude: 29.5, longitude: -89.8 },
      { name: "Mosquito Lagoon, FL", latitude: 28.8, longitude: -80.7 },
      { name: "Charleston, SC", latitude: 32.8, longitude: -79.9 },
      { name: "Port Aransas, TX", latitude: 27.8, longitude: -97.1 },
    ],
    metaTitle: "Redfish — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to redfish (red drum) fly fishing: sight fishing on the flats, Gulf Coast destinations, marsh techniques, and essential inshore patterns.",
    featured: false,
  },
  {
    id: "species-striped-bass",
    slug: "striped-bass",
    commonName: "Striped Bass",
    scientificName: "Morone saxatilis",
    family: "saltwater",
    description:
      "The striped bass is the premier game fish of the Atlantic coast, drawing millions of anglers from Maine to the Carolinas each year. Known colloquially as stripers, linesiders, or rockfish, striped bass are large, powerful predators distinguished by their silver bodies marked with seven to eight dark horizontal stripes running from gill to tail. Striped bass undertake one of the most impressive migrations on the eastern seaboard, traveling from their Chesapeake Bay and Hudson River spawning grounds north to New England and back each year. Fly fishing for striped bass has exploded in popularity, with anglers targeting fish from the surf, on shallow flats, around rocky structure, and in tidal rivers and estuaries. The species offers remarkable versatility, as stripers can be caught on topwater poppers, swung deceiver patterns, and deep-drifted weighted flies throughout the season. Their availability, fighting power, and the variety of environments they inhabit make them one of the most complete fly rod game fish available.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ef/Striped_bass_morone_saxatilis_fish_%28white_background%29.jpg", // Scientific illustration — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ef/Striped_bass_morone_saxatilis_fish_%28white_background%29.jpg",
    nativeRange: "Atlantic coast of North America from the St. Lawrence River south to the St. Johns River in Florida, with major spawning populations in the Chesapeake Bay and Hudson River",
    introducedRange: "Pacific coast of North America from British Columbia to Baja California; also landlocked reservoir populations throughout the United States",
    averageSize: "20-32 inches, 5-15 lbs",
    recordSize: "81 lbs 14 oz (Long Island Sound, Connecticut, 2011)",
    recordDetails: "Caught by Greg Myerson on live eel; the fly rod record is approximately 64 pounds from Montauk, New York",
    preferredHabitat:
      "Coastal waters including rocky shorelines, sandy beaches, tidal rivers, estuaries, jetties, harbors, and shallow flats; highly migratory along the Atlantic seaboard",
    preferredFlies: [
      "Lefty's Deceiver #1/0-4/0",
      "Clouser Minnow #1/0-4/0",
      "Surf Candy #1/0-2/0",
      "Crease Fly #1/0-2/0",
      "Gurgler #1/0-2/0",
      "Flatwing #2/0-4/0",
      "EP Minnow #1/0-3/0",
    ],
    taxonomy: {
      order: "Moroniformes",
      family: "Moronidae",
      genus: "Morone",
      species: "M. saxatilis",
    },
    conservationStatus: "Overfished according to recent Atlantic States Marine Fisheries Commission assessments; strict slot limits and harvest restrictions implemented to rebuild the spawning stock",
    diet: "Menhaden, herring, anchovies, sand eels, squid, crabs, lobsters, and a wide variety of other fish and crustaceans; highly opportunistic predators that adapt feeding strategies to available prey",
    spawningInfo:
      "Striped bass spawn in freshwater and brackish tidal rivers from April through June, with the Chesapeake Bay producing the majority of Atlantic coast fish. Females broadcast millions of semi-buoyant eggs into the current, which must remain suspended by flowing water to develop properly. Spawning success varies dramatically with water flow and temperature conditions.",
    spawningMonths: ["April", "May", "June"],
    spawningTempF: "55-68°F",
    lifespan: "25-35 years, with large females (cows) being the most productive spawners",
    waterTemperatureRange: "55-75°F (optimal 60-70°F for feeding activity)",
    flyFishingTips:
      "Striped bass are ambush predators that use structure, current, and tidal flow to trap prey. Fish around rip lines, rocky points, bridge pilings, and inlet mouths during moving tides for the best action. Dawn and dusk produce the most consistent surface feeding, when poppers and gurgler patterns can draw explosive strikes.",
    tackleRecommendations:
      "A 9-foot 9 or 10-weight rod is standard for surf and boat fishing. For smaller fish in estuaries, an 8-weight works well. Use intermediate or sinking lines and 15-20 lb fluorocarbon leaders.",
    funFacts: [
      "Striped bass were among the first fish protected by conservation legislation in the New World, with the Massachusetts Bay Colony passing a law in 1639 banning their use as fertilizer",
      "A large female striped bass can release over 4 million eggs in a single spawning event",
      "The hybrid between striped bass and white bass, known as the wiper, is widely stocked in reservoirs for sport fishing",
      "Striped bass can tolerate both freshwater and saltwater, and landlocked populations thrive in reservoirs hundreds of miles from the ocean",
    ],
    relatedDestinationIds: ["dest-pennsylvania", "dest-florida-keys"],
    relatedRiverIds: ["river-penns-creek"],
    distributionCoordinates: [
      { name: "Montauk, NY", latitude: 41.1, longitude: -71.9 },
      { name: "Chesapeake Bay, MD", latitude: 37.8, longitude: -76.1 },
      { name: "Cape Cod, MA", latitude: 41.7, longitude: -70.0 },
      { name: "Block Island, RI", latitude: 41.2, longitude: -71.6 },
    ],
    metaTitle: "Striped Bass — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to striped bass fly fishing: Atlantic coast migration, surf and flat techniques, essential patterns, and top New England destinations.",
    featured: false,
  },
  {
    id: "species-giant-trevally",
    slug: "giant-trevally",
    commonName: "Giant Trevally (GT)",
    scientificName: "Caranx ignobilis",
    family: "saltwater",
    description:
      "The giant trevally, universally known as the GT, is the apex predator of tropical Indo-Pacific flats and reefs, and hooking one on a fly rod is among the most adrenaline-charged experiences in all of fly fishing. GTs are massively built fish with broad, powerful bodies, steep head profiles, and oversized forked tails that generate enormous thrust. They are aggressive, territorial hunters that will charge across a flat at full speed to engulf a popper or streamer in an explosion of white water. Found from the east coast of Africa through the Indian Ocean to Hawaii and beyond, GTs are the marquee species at legendary remote destinations like Christmas Island, the Seychelles, and the atolls of French Polynesia. Fly fishing for GTs demands heavy tackle, accurate casting, and the physical stamina to survive brutal, reel-testing fights. The experience of sight-casting to a GT cruising a coral flat and watching it accelerate toward the fly is an incomparable rush.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Caranx_sausun_Ford_50.jpg", // G.H. Ford "Fishes of India" — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Caranx_sausun_Ford_50.jpg",
    nativeRange: "Indo-Pacific region from East Africa and the Red Sea through the Indian Ocean to Hawaii, Australia, and Japan",
    introducedRange: "No introductions; natural distribution throughout the tropical and subtropical Indo-Pacific",
    averageSize: "24-40 inches, 15-40 lbs",
    recordSize: "160 lbs (Tokara Islands, Japan, 2006)",
    recordDetails: "Caught by Keiki Hamasaki on conventional tackle; fly rod-caught GTs over 100 pounds have been documented in the Seychelles",
    preferredHabitat:
      "Coral flats, reef edges, channels, lagoons, and offshore structures throughout the tropical Indo-Pacific; moves onto shallow flats to hunt during tidal shifts",
    preferredFlies: [
      "Large Popper #4/0-6/0",
      "Brush Fly #4/0-6/0",
      "EP Baitfish #3/0-5/0",
      "Semper Flash #4/0-6/0",
      "Crease Fly #3/0-5/0",
      "Dahlberg Diver #3/0-5/0",
      "Clouser Minnow #2/0-4/0",
    ],
    taxonomy: {
      order: "Carangiformes",
      family: "Carangidae",
      genus: "Caranx",
      species: "C. ignobilis",
    },
    conservationStatus: "Least Concern (IUCN); populations remain healthy in remote atolls but face localized pressure from commercial and recreational fishing near populated areas",
    diet: "Fish, crabs, lobsters, octopus, squid, and virtually any available prey; GTs are apex predators that have been documented hunting birds, turtles, and even small sharks",
    spawningInfo:
      "GTs spawn in large aggregations around the new and full moon during summer months, typically July through October in most of their range. Spawning occurs in deep channels and offshore reef edges. Larvae are pelagic and settle into shallow coastal nursery areas as juveniles.",
    spawningMonths: ["July", "August", "September", "October"],
    spawningTempF: "78-86°F (water temperature)",
    lifespan: "20-25 years, with females generally living longer and growing larger than males",
    waterTemperatureRange: "72-88°F (optimal 76-84°F)",
    flyFishingTips:
      "GTs respond explosively to large poppers stripped aggressively across the surface. When casting to a cruising GT on a flat, place the fly 10-15 feet ahead and strip it fast to trigger an instinctive predatory response. The strip-strike must be forceful to penetrate the GT's tough mouth, and the initial run will test your drag system to its limits.",
    tackleRecommendations:
      "A 12-weight rod minimum is required, with 14-weight preferred for trophy fish. Use a reel with at least 300 yards of 50 lb backing and a bombproof drag. Wire or heavy fluorocarbon bite tippet of 80-100 lb is essential.",
    funFacts: [
      "GTs have been filmed leaping from the water to catch terns and other seabirds in mid-flight at remote Pacific atolls",
      "A large GT can reach speeds of over 40 miles per hour during its attack run on prey",
      "In Hawaiian culture, the GT (known as ulua) holds spiritual significance and catching one is considered a rite of passage",
      "GTs are one of the few fish species known to use cooperative hunting strategies, working together to herd prey fish into shallow water",
    ],
    relatedDestinationIds: ["dest-christmas-island", "dest-seychelles"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Christmas Island, Kiribati", latitude: 1.9, longitude: -157.5 },
      { name: "Alphonse Island, Seychelles", latitude: -7.0, longitude: 52.7 },
      { name: "Cosmoledo Atoll, Seychelles", latitude: -9.7, longitude: 47.6 },
      { name: "North Island, Hawaii", latitude: 21.5, longitude: -158.0 },
    ],
    metaTitle: "Giant Trevally (GT) — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to giant trevally fly fishing: the apex predator of Indo-Pacific flats, heavy tackle techniques, and remote atoll destinations.",
    featured: false,
  },
  {
    id: "species-snook",
    slug: "snook",
    commonName: "Snook",
    scientificName: "Centropomus undecimalis",
    family: "saltwater",
    description:
      "The snook is the quintessential inshore game fish of tropical and subtropical Florida and the Caribbean, prized for its explosive strikes, powerful fights, and challenging behavior. Identified by a prominent black lateral line running from gill plate to tail, snook are ambush predators that lurk around mangrove roots, dock pilings, bridge shadows, and beach structure, using shade and current to ambush passing baitfish and shrimp. Snook are highly sensitive to cold water and are restricted to the warmest parts of their range during winter months, with mass die-offs occurring during unusual cold snaps in Florida. Fly fishing for snook combines the sight fishing excitement of flats species with the structure-oriented challenge of bass fishing, as anglers must deliver accurate casts tight to cover and then fight powerful fish away from line-cutting structure. Night fishing under lighted docks and bridges with streamers is a particularly exciting pursuit.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/43/FMIB_33893_Centropomus_Undecimalis_%28Bloch%29.jpeg", // FMIB Jordan & Evermann — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/43/FMIB_33893_Centropomus_Undecimalis_%28Bloch%29.jpeg",
    nativeRange: "Western Atlantic from central Florida south through the Caribbean, Gulf of Mexico, and along the coast of Brazil to Rio de Janeiro",
    introducedRange: "No significant introductions; natural range restricted by cold temperature intolerance",
    averageSize: "20-32 inches, 5-12 lbs",
    recordSize: "53 lbs 10 oz (Parismina, Costa Rica, 2014)",
    recordDetails: "Caught by Gilbert Ponzi; Florida's state record stands at 44 pounds 3 ounces from Fort Myers",
    preferredHabitat:
      "Mangrove shorelines, dock pilings, bridge shadows, inlet channels, beach troughs, and tidal creeks; requires water temperatures above 60°F and tolerates both fresh and saltwater",
    preferredFlies: [
      "Deceiver #1/0-3/0",
      "EP Baitfish #1/0-3/0",
      "Gurgler #1/0-2/0",
      "Clouser Minnow #1/0-2/0",
      "Seaducer #1/0-2/0",
      "Puglisi Shrimp #2-4",
      "Hollow Fleye #2/0-3/0",
    ],
    taxonomy: {
      order: "Carangiformes",
      family: "Centropomidae",
      genus: "Centropomus",
      species: "C. undecimalis",
    },
    conservationStatus: "Not globally assessed by IUCN; strictly regulated in Florida with seasonal closures, slot limits, and catch-and-release-only periods following the 2010 cold kill event",
    diet: "Primarily fish (mullet, pilchard, pinfish, greenbacks) and shrimp; ambush predator that uses structure and current to trap prey",
    spawningInfo:
      "Snook spawn from May through September in passes, inlets, and near barrier island beaches during the new and full moon. They are protandric hermaphrodites, meaning individuals begin life as males and some transition to females as they grow larger. This life history strategy means that large females are particularly valuable to the population.",
    spawningMonths: ["May", "June", "July", "August", "September"],
    spawningTempF: "76-86°F (water temperature)",
    lifespan: "15-21 years, with females living longer and growing larger than males",
    waterTemperatureRange: "60-90°F (optimal 72-86°F; lethal below 55°F for extended periods)",
    flyFishingTips:
      "Accuracy is paramount when fishing for snook around structure. Cast tight to mangrove roots, dock pilings, and bridge shadows and begin stripping immediately with sharp, darting retrieves. At night, target lighted docks and bridges where snook ambush baitfish attracted to the illumination. During the beach spawn, wade the sandy troughs at dawn for outstanding sight fishing.",
    tackleRecommendations:
      "A 9-foot 8 or 9-weight rod with a fast action for casting into wind and pulling fish from structure. Use 30-40 lb fluorocarbon shock tippet to resist the snook's abrasive gill plates.",
    funFacts: [
      "Snook are protandric hermaphrodites, starting life as males and potentially transitioning to females as they grow, usually around age 3-5",
      "Their distinctive black lateral line is so prominent that snook are sometimes called linesiders or sergeant fish",
      "A severe cold snap in January 2010 killed millions of snook in Florida, leading to a complete closure of the fishery for several years",
      "Snook can tolerate entirely fresh water and are regularly found far upstream in coastal rivers and canals",
    ],
    relatedDestinationIds: ["dest-florida-keys", "dest-belize"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Everglades, FL", latitude: 25.3, longitude: -80.9 },
      { name: "Tampa Bay, FL", latitude: 27.8, longitude: -82.5 },
      { name: "Tortuguero, Costa Rica", latitude: 10.5, longitude: -83.5 },
      { name: "Cancun, Mexico", latitude: 21.2, longitude: -86.8 },
    ],
    metaTitle: "Snook — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to snook fly fishing: Florida's premier inshore predator, mangrove techniques, night fishing, and top tropical destinations.",
    featured: false,
  },
  {
    id: "species-roosterfish",
    slug: "roosterfish",
    commonName: "Roosterfish",
    scientificName: "Nematistius pectoralis",
    family: "saltwater",
    description:
      "The roosterfish is one of the most visually spectacular game fish in the world, instantly recognizable by its extraordinary dorsal fin composed of seven elongated spines that resemble a rooster's comb. Found exclusively along the Pacific coast of the Americas from Baja California to Peru, roosterfish are powerful inshore predators that patrol sandy beaches, rocky points, and river mouths in the warm waters of the eastern Pacific. Sight fishing for roosterfish from the beach is a unique and thrilling experience, as anglers spot the distinctive dorsal comb cutting through the surface of the surf zone before making a carefully timed cast. Roosterfish are explosive fighters that make powerful runs along the beach, testing drag systems and line capacity. The combination of their striking appearance, challenging behavior, and the dramatic coastal settings where they are found makes roosterfish one of the most coveted species among traveling fly anglers.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/The_fishes_of_North_and_Middle_America_%28Pl._CXXXVIII%29_%287983374653%29.jpg", // Jordan & Evermann plate CXXXVIII — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/The_fishes_of_North_and_Middle_America_%28Pl._CXXXVIII%29_%287983374653%29.jpg",
    nativeRange: "Eastern Pacific coast from Baja California Sur, Mexico, south through Central America to northern Peru, including offshore islands",
    introducedRange: "No introductions; endemic to the eastern Pacific",
    averageSize: "24-36 inches, 10-30 lbs",
    recordSize: "114 lbs (Baja California, Mexico, 1960)",
    recordDetails: "Caught by Abe Sackheim on conventional tackle; fly rod-caught fish over 60 pounds have been documented in Costa Rica and Baja",
    preferredHabitat:
      "Sandy beaches, rocky shorelines, river mouths, and reef edges in warm eastern Pacific waters; commonly found in the surf zone in water 2-15 feet deep",
    preferredFlies: [
      "EP Baitfish #2/0-4/0",
      "Deceiver #2/0-4/0",
      "Clouser Minnow #1/0-3/0",
      "Popper #2/0-4/0",
      "Crease Fly #2/0-3/0",
      "Brush Fly #2/0-4/0",
      "Puglisi Sardine #1/0-3/0",
    ],
    taxonomy: {
      order: "Carangiformes",
      family: "Nematistiidae",
      genus: "Nematistius",
      species: "N. pectoralis",
    },
    conservationStatus: "Data Deficient (IUCN); not commercially targeted in most of its range but faces localized pressure from artisanal fishing; catch-and-release increasingly practiced by sport fishers",
    diet: "Small fish (sardines, mullet, needlefish), crabs, and squid; roosterfish are aggressive predators that often hunt cooperatively in small groups, driving baitfish into shallow water",
    spawningInfo:
      "Roosterfish spawning behavior is poorly documented, but they are believed to spawn in offshore waters from June through November. Larvae are pelagic and settle into coastal nursery areas as juveniles. Research on roosterfish reproductive biology is ongoing, and much remains unknown.",
    spawningMonths: ["June", "July", "August", "September", "October", "November"],
    spawningTempF: "76-84°F (water temperature)",
    lifespan: "Estimated 12-20 years based on limited age studies",
    waterTemperatureRange: "68-86°F (optimal 74-82°F)",
    flyFishingTips:
      "Beach fishing for roosterfish requires scanning the surf zone for the distinctive dorsal comb or nervous baitfish activity. Cast ahead of cruising fish with a fast-sinking baitfish pattern and strip aggressively. Timing the cast between waves is critical, and anglers should be prepared to move quickly along the beach to follow pods of hunting roosterfish.",
    tackleRecommendations:
      "A 10 or 11-weight rod with a stripping basket for surf casting. Use an intermediate or fast-sinking line and 20-30 lb fluorocarbon leader to handle powerful runs along the beach.",
    funFacts: [
      "The roosterfish is the only living member of its family, Nematistiidae, making it a taxonomically unique species with no close relatives",
      "Their seven elongated dorsal spines can be raised and lowered at will and are used for display and communication with other roosterfish",
      "Roosterfish are one of the few game fish species where sight fishing from the beach is a primary technique",
      "Despite their impressive size and fighting ability, roosterfish have relatively small mouths for their body size, requiring careful fly selection",
    ],
    relatedDestinationIds: ["dest-belize", "dest-chile"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Baja California Sur, Mexico", latitude: 23.2, longitude: -109.7 },
      { name: "Guanacaste, Costa Rica", latitude: 10.3, longitude: -85.8 },
      { name: "Panama City, Panama", latitude: 8.5, longitude: -79.5 },
      { name: "Galapagos Islands, Ecuador", latitude: -0.9, longitude: -89.6 },
    ],
    metaTitle: "Roosterfish — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to roosterfish fly fishing: the Pacific's most spectacular game fish, beach techniques, and top Baja and Central American destinations.",
    featured: false,
  },
  {
    id: "species-barracuda",
    slug: "barracuda",
    commonName: "Barracuda",
    scientificName: "Sphyraena barracuda",
    family: "saltwater",
    description:
      "The great barracuda is one of the fastest and most explosive predators in tropical waters, capable of bursting from a standstill to over 35 miles per hour in a fraction of a second to slash through schools of baitfish. With their elongated, torpedo-shaped bodies, prominent underbite filled with razor-sharp teeth, and fierce predatory behavior, barracuda have a fearsome reputation that belies their outstanding qualities as a fly rod game fish. Found throughout the tropical and subtropical Atlantic and Indo-Pacific, barracuda are commonly encountered on the same flats and reefs where anglers target bonefish, permit, and tarpon. While often dismissed as a bycatch species, sight fishing for large barracuda on shallow flats with long, slender needlefish patterns and a high-speed retrieve is a genuinely thrilling pursuit. The explosive strike and initial run of a big barracuda are among the most violent in saltwater fly fishing.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/Great_barracuda_%28Duane_Raver%29.png", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/Great_barracuda_%28Duane_Raver%29.png",
    nativeRange: "Circumtropical distribution in the Atlantic, Indian, and Pacific Oceans; abundant throughout the Caribbean, Bahamas, and Florida Keys",
    introducedRange: "No introductions; naturally distributed throughout tropical and subtropical marine waters worldwide",
    averageSize: "24-40 inches, 5-15 lbs",
    recordSize: "85 lbs (Christmas Island, Kiribati, 1992)",
    recordDetails: "Caught by John W. Helfrich; large barracuda are common in the remote atolls of the Pacific",
    preferredHabitat:
      "Shallow flats, reef edges, channels, wrecks, and mangrove shorelines in tropical waters; also found over deep reefs and in open water near structure",
    preferredFlies: [
      "Needlefish Pattern #2/0-4/0",
      "Long Deceiver #2/0-4/0",
      "Tube Fly #2/0-4/0",
      "EP Baitfish #2/0-4/0",
      "Popovics Surf Candy #1/0-3/0",
      "Wire Clouser #1/0-3/0",
      "Flashy Brush Fly #2/0-4/0",
    ],
    taxonomy: {
      order: "Istiophoriformes",
      family: "Sphyraenidae",
      genus: "Sphyraena",
      species: "S. barracuda",
    },
    conservationStatus: "Least Concern (IUCN); populations are healthy throughout most of their range, though large individuals are increasingly rare near populated coastlines",
    diet: "Fish of all types including jacks, grouper, snapper, mullet, and needlefish; barracuda are visual predators that rely on speed and ambush tactics to overpower prey",
    spawningInfo:
      "Barracuda spawn in offshore waters throughout the year in tropical regions, with peak activity during spring and summer months. They release pelagic eggs that hatch within 48 hours. Juveniles seek shelter in mangrove estuaries and seagrass beds where they grow rapidly, reaching maturity at 2-3 years of age.",
    spawningMonths: ["March", "April", "May", "June", "July", "August"],
    spawningTempF: "74-84°F (water temperature)",
    lifespan: "12-18 years in the wild",
    waterTemperatureRange: "68-88°F (optimal 74-84°F)",
    flyFishingTips:
      "Barracuda are visual predators that respond to fast, erratic retrieves. Use long, slender flies that imitate needlefish and strip as fast as you possibly can. The fly should be moving at maximum speed when it enters the barracuda's strike zone. Wire tippet is absolutely essential, as barracuda teeth will slice through fluorocarbon instantly.",
    tackleRecommendations:
      "A 9-foot 9 or 10-weight rod for casting large flies. Wire bite tippet of 30-40 lb is mandatory. Use an intermediate or floating line depending on water depth.",
    funFacts: [
      "Barracuda can accelerate from stationary to over 35 miles per hour in a single body length, making them one of the fastest-accelerating fish in the ocean",
      "Their teeth are so sharp that they have been used by indigenous peoples as cutting tools and arrowheads",
      "Large barracuda over 30 pounds can carry ciguatera toxin accumulated through the food chain, making them unsafe to eat in some regions",
      "Barracuda are attracted to shiny objects and reflections, which is why long, flashy flies with metallic materials are so effective",
    ],
    relatedDestinationIds: ["dest-bahamas", "dest-florida-keys", "dest-christmas-island", "dest-belize"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Nassau, Bahamas", latitude: 25.0, longitude: -77.4 },
      { name: "Key Largo, FL", latitude: 25.1, longitude: -80.4 },
      { name: "Christmas Island, Kiribati", latitude: 1.9, longitude: -157.5 },
      { name: "Belize Barrier Reef", latitude: 17.5, longitude: -87.8 },
    ],
    metaTitle: "Barracuda — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to barracuda fly fishing: the ocean's fastest predator, high-speed techniques, wire tippet requirements, and top tropical destinations.",
    featured: false,
  },
  {
    id: "species-peacock-bass",
    slug: "peacock-bass",
    commonName: "Peacock Bass",
    scientificName: "Cichla temensis",
    family: "saltwater",
    description:
      "The peacock bass is the most aggressive freshwater game fish in the tropics, delivering explosive topwater strikes and brutal, drag-testing fights that have made it a bucket-list species for traveling fly anglers. Native to the Amazon and Orinoco river basins of South America, peacock bass are actually members of the cichlid family rather than true bass, but their predatory behavior and powerful build have earned them the bass comparison. The speckled peacock bass is the largest of approximately 15 recognized species, with fish exceeding 25 pounds regularly caught in remote Amazonian blackwater rivers. Their namesake eyespot on the tail, brilliant green and gold coloring, and three distinctive vertical bars make them among the most visually striking freshwater fish in the world. Fly fishing for peacock bass is a tropical adventure that takes anglers deep into the Amazon basin aboard floating motherships.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/FMIB_38650_Cychla_trifasciata.jpeg", // FMIB Schomburgk — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/FMIB_38650_Cychla_trifasciata.jpeg",
    nativeRange: "Amazon, Orinoco, and other river basins in tropical South America, from Venezuela and Colombia south through Brazil and Peru",
    introducedRange: "South Florida canals, Hawaii, Puerto Rico, Panama Canal Zone, and various tropical regions where they have been stocked as game fish",
    averageSize: "16-24 inches, 4-10 lbs",
    recordSize: "29 lbs (Rio Negro, Brazil, 2010)",
    recordDetails: "A speckled peacock bass caught in the Brazilian Amazon; the Florida state record for introduced butterfly peacock bass is 9 lbs 8 oz",
    preferredHabitat:
      "Blackwater and clearwater rivers, lagoons, and flooded forest in the Amazon basin; also lakes, canals, and warm-water rivers where introduced",
    preferredFlies: [
      "Large Popper #2/0-4/0",
      "Dahlberg Diver #1/0-3/0",
      "Deceiver #1/0-3/0",
      "Clouser Minnow #1/0-2/0",
      "Gurgler #1/0-3/0",
      "EP Baitfish #1/0-3/0",
      "Game Changer #1/0-3/0",
    ],
    taxonomy: {
      order: "Cichliformes",
      family: "Cichlidae",
      genus: "Cichla",
      species: "C. temensis",
    },
    conservationStatus: "Least Concern (IUCN) in native range; considered invasive in some introduced habitats including South Florida and Hawaii",
    diet: "Primarily fish, including piranha, characins, and other cichlids; also shrimp, crabs, and large aquatic insects; extremely aggressive predator that will attack prey nearly its own size",
    spawningInfo:
      "Peacock bass spawn year-round in tropical waters, with peak activity during the rainy and early dry seasons. Both parents guard the nest and defend the fry aggressively for several weeks after hatching. Nest-guarding adults are particularly territorial and will attack flies and lures that approach their fry.",
    spawningMonths: ["January", "February", "March", "October", "November", "December"],
    spawningTempF: "78-86°F (water temperature)",
    lifespan: "8-12 years in the wild, with the largest speckled peacock bass estimated at 15+ years",
    waterTemperatureRange: "74-90°F (optimal 78-86°F; cannot survive water below 60°F)",
    flyFishingTips:
      "Peacock bass are aggressive topwater predators that respond best to large poppers and divers fished with loud, splashy retrieves. Work structure such as fallen trees, rock outcrops, and flooded vegetation systematically. The strikes are often violent and may require a strip-strike followed by keeping heavy pressure on the fish to prevent it from reaching snag-filled cover.",
    tackleRecommendations:
      "A 9-foot 8 to 10-weight rod depending on species size. Use a weight-forward floating line with a short, stout 30-40 lb leader. Wire tippet is not necessary, but heavy fluorocarbon is recommended.",
    funFacts: [
      "Despite being called bass, peacock bass are actually cichlids and are more closely related to tilapia and angelfish than to largemouth bass",
      "Peacock bass were intentionally introduced to South Florida canals in 1984 to control invasive spotted tilapia populations",
      "Both parents guard the nest and young fry, and adult peacock bass have been observed attacking caiman that approach their offspring",
      "The eyespot on the tail, which gives them the peacock name, is believed to confuse predators about which end is the head",
    ],
    relatedDestinationIds: ["dest-florida-keys", "dest-patagonia"],
    relatedRiverIds: ["river-florida-keys-flats"],
    distributionCoordinates: [
      { name: "Rio Negro, Brazil", latitude: -1.4, longitude: -62.0 },
      { name: "Orinoco Basin, Venezuela", latitude: 7.0, longitude: -66.0 },
      { name: "Miami Canals, FL", latitude: 25.8, longitude: -80.2 },
      { name: "Madeira River, Brazil", latitude: -8.8, longitude: -64.0 },
    ],
    metaTitle: "Peacock Bass — Topwater Tactics & Best Destinations",
    metaDescription:
      "Target peacock bass on the fly (record: 29 lbs). Best poppers, 8-10 wt setups, and top spots from the Amazon to South Florida canals. Free species guide.",
    featured: false,
  },
  // ═══════════════════════════════════════════════════════════════════
  // WARMWATER (family: "warmwater")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-largemouth-bass",
    slug: "largemouth-bass",
    commonName: "Largemouth Bass",
    scientificName: "Micropterus salmoides",
    family: "warmwater",
    description:
      "The largemouth bass is the most popular freshwater game fish in North America and has built an enormous following among both conventional and fly anglers. Named for its large mouth that extends past the eye when closed, the largemouth bass is an apex predator in warm-water ecosystems, feeding on everything from insects and crayfish to frogs, mice, and smaller fish. While traditionally associated with spinning and baitcasting gear, fly fishing for largemouth bass has surged in popularity, offering explosive topwater takes on poppers and gurgler patterns that rival any trout rise for excitement. Largemouth bass are found in ponds, lakes, reservoirs, and slow-moving rivers across the United States, making them one of the most accessible game fish for fly anglers. Their aggressive strikes, powerful fights, and tolerance of warm water make them an ideal species for anglers extending their fly fishing beyond cold-water trout streams.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Largemouth_bass_-_DPLA_-_%28white_background%29.jpg", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Largemouth_bass_-_DPLA_-_%28white_background%29.jpg",
    nativeRange: "Eastern and central North America from the Great Lakes south to the Gulf of Mexico and from the Atlantic coast west to Texas",
    introducedRange: "Every US state, southern Canada, Mexico, Central America, Europe, Africa, Asia, and Australasia; one of the most widely distributed freshwater fish on Earth",
    averageSize: "12-20 inches, 1-5 lbs",
    recordSize: "22 lbs 4 oz (Montgomery Lake, Georgia, 1932)",
    recordDetails: "Caught by George Perry; this iconic record stood alone for 77 years and is the most famous freshwater fishing record in history",
    preferredHabitat:
      "Warm, shallow lakes and ponds with abundant vegetation; submerged structure like docks, fallen timber, and weed edges; also slow-moving rivers and reservoirs",
    preferredFlies: [
      "Boogle Bug Popper #2-6",
      "Clouser Minnow #2-6",
      "Dahlberg Diver #1/0-4",
      "Woolly Bugger #4-8",
      "Gurgler #2-6",
      "Deer Hair Mouse #2-6",
      "Crayfish patterns #2-6",
    ],
    taxonomy: {
      order: "Perciformes",
      family: "Centrarchidae",
      genus: "Micropterus",
      species: "M. salmoides",
    },
    conservationStatus: "Least Concern; one of the most abundant and widely managed freshwater game fish in the world, supported by extensive stocking and habitat management programs",
    diet: "Highly opportunistic predator feeding on bluegill, shad, crayfish, frogs, mice, snakes, ducklings, and large insects; larger fish become increasingly piscivorous",
    spawningInfo:
      "Largemouth bass spawn in spring when water temperatures reach 60-75°F, typically from March through June depending on latitude. Males construct and guard circular nest beds in shallow water, fanning the eggs to keep them clean and oxygenated. Male bass aggressively defend the nest and will strike virtually anything that approaches, including flies.",
    spawningMonths: ["March", "April", "May", "June"],
    spawningTempF: "60-75°F",
    lifespan: "10-16 years, with fish in southern latitudes growing faster but living shorter lives than northern populations",
    waterTemperatureRange: "50-85°F (optimal 65-80°F for active feeding)",
    flyFishingTips:
      "Topwater fishing with poppers and gurglers during early morning and late evening provides the most exciting largemouth bass fly fishing. Let the fly sit motionless after landing for 5-10 seconds before beginning a slow, rhythmic pop-and-pause retrieve. Target weed edges, lily pads, docks, and fallen timber where bass ambush prey.",
    tackleRecommendations:
      "A 9-foot 7 or 8-weight rod with a bass taper line designed for turning over large, wind-resistant flies. Use 10-15 lb tippet and heavy monofilament leaders.",
    funFacts: [
      "George Perry's 1932 world record largemouth bass was caught during the Great Depression, and Perry reportedly ate the fish for dinner that same night",
      "Largemouth bass can detect vibrations through their lateral line from over 100 feet away, which is why topwater poppers are so effective",
      "Bass tournaments generate over $100 billion annually in economic activity in the United States",
      "Male largemouth bass do not eat while guarding their nest, surviving solely on stored energy for up to three weeks",
    ],
    relatedDestinationIds: ["dest-florida-keys", "dest-michigan", "dest-arkansas"],
    relatedRiverIds: ["river-au-sable", "river-white-river-ar"],
    distributionCoordinates: [
      { name: "Lake Fork, TX", latitude: 32.8, longitude: -95.6 },
      { name: "Kissimmee Chain, FL", latitude: 27.8, longitude: -81.2 },
      { name: "Guntersville Lake, AL", latitude: 34.4, longitude: -86.2 },
      { name: "Lake Erie, MI/OH", latitude: 41.8, longitude: -81.5 },
    ],
    metaTitle: "Largemouth Bass — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to largemouth bass fly fishing: America's favorite game fish, topwater techniques, poppers, and the best warm-water destinations.",
    featured: false,
  },
  {
    id: "species-smallmouth-bass",
    slug: "smallmouth-bass",
    commonName: "Smallmouth Bass",
    scientificName: "Micropterus dolomieu",
    family: "warmwater",
    description:
      "The smallmouth bass is widely regarded as the finest freshwater game fish in North America on a pound-for-pound basis, combining explosive strikes, acrobatic leaps, and dogged fighting ability that surpasses even the most celebrated trout species. Distinguished from its largemouth cousin by a smaller mouth that does not extend past the eye, bronze-brown coloring, and dark vertical bars on the flanks, the smallmouth bass thrives in clear, cool rivers and rocky lakes across the northern and eastern United States and southern Canada. Smallmouth bass on a fly rod provide action that many experienced anglers compare favorably to steelhead and Atlantic salmon. They are particularly responsive to topwater flies, crashing poppers and crayfish patterns with a ferocity that generates addictive surface explosions. The smallmouth's preference for clear, moving water and rocky habitat makes it an ideal species for wade fishing with a fly rod.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b7/Smallmouth_bass.jpg", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b7/Smallmouth_bass.jpg",
    nativeRange: "Great Lakes basin, upper Mississippi, Ohio, and Tennessee River drainages; Saint Lawrence River and associated waterways in the northeastern United States and southeastern Canada",
    introducedRange: "Nearly every US state and southern Canada; also Europe, Africa, Asia, and South America, though less widely than largemouth bass",
    averageSize: "12-18 inches, 1-4 lbs",
    recordSize: "11 lbs 15 oz (Dale Hollow Lake, Tennessee, 1955)",
    recordDetails: "Caught by David Hayes; Dale Hollow Lake on the Tennessee-Kentucky border remains one of the finest smallmouth fisheries in the world",
    preferredHabitat:
      "Clear, cool rivers with rocky bottoms and moderate current; rocky lakes with minimal vegetation; prefers clean water with temperatures of 60-75°F",
    preferredFlies: [
      "Clouser Minnow #2-6",
      "Woolly Bugger #4-8",
      "Popper #4-8",
      "Crayfish patterns #4-8",
      "Hellgrammite #4-8",
      "Muddler Minnow #4-8",
      "Deer Hair Diver #2-6",
    ],
    taxonomy: {
      order: "Perciformes",
      family: "Centrarchidae",
      genus: "Micropterus",
      species: "M. dolomieu",
    },
    conservationStatus: "Least Concern; populations are healthy and expanding in many areas, though some native southern Appalachian populations face pressure from habitat degradation",
    diet: "Crayfish are the primary food source in most habitats, supplemented by small fish (darters, minnows, sculpin), hellgrammites, dragonfly nymphs, and leeches",
    spawningInfo:
      "Smallmouth bass spawn in late spring when water temperatures reach 60-65°F, typically from May through June. Males select nest sites on rocky or gravel substrates in 2-6 feet of water. Like largemouth bass, males guard the nest and fry aggressively for several weeks after hatching.",
    spawningMonths: ["May", "June"],
    spawningTempF: "60-65°F",
    lifespan: "10-15 years in northern latitudes, with slower growth but longer lifespans in cold-water environments",
    waterTemperatureRange: "55-78°F (optimal 65-75°F for active feeding)",
    flyFishingTips:
      "Smallmouth bass are strongly associated with rocky structure. Focus on current seams below riffles, boulder gardens, ledge drops, and rocky points on lakes. Crayfish patterns are the single most productive fly for smallmouth in rivers. Fish them on a dead drift through likely holding water or strip them erratically along the bottom.",
    tackleRecommendations:
      "A 9-foot 6-weight rod is perfect for most smallmouth bass fishing, offering enough power for larger flies while maintaining sensitivity for subtle takes. Use 8-12 lb fluorocarbon tippet.",
    funFacts: [
      "Smallmouth bass are considered the strongest freshwater fish in North America relative to their size, producing more force per pound than any trout species",
      "They are extremely sensitive to water quality and are absent from polluted or heavily silted waterways, making them an indicator of stream health",
      "The name dolomieu honors French mineralogist Deodat de Dolomieu, though the fish has no connection to the Dolomite mountains",
      "Smallmouth bass have been known to leap completely out of the water up to 3 feet high when hooked, sometimes multiple times in a single fight",
    ],
    relatedDestinationIds: ["dest-michigan", "dest-pennsylvania", "dest-arkansas"],
    relatedRiverIds: ["river-au-sable", "river-pere-marquette", "river-penns-creek"],
    distributionCoordinates: [
      { name: "Dale Hollow Lake, TN", latitude: 36.5, longitude: -85.4 },
      { name: "Susquehanna River, PA", latitude: 40.3, longitude: -76.9 },
      { name: "St. Croix River, WI/MN", latitude: 45.4, longitude: -92.6 },
      { name: "Grand River, ON", latitude: 43.4, longitude: -80.3 },
    ],
    metaTitle: "Smallmouth Bass — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to smallmouth bass fly fishing: pound-for-pound the best fighter in freshwater, crayfish patterns, and top river destinations.",
    featured: false,
  },
  {
    id: "species-carp",
    slug: "carp",
    commonName: "Carp",
    scientificName: "Cyprinus carpio",
    family: "warmwater",
    description:
      "The common carp has undergone a remarkable transformation in the fly fishing world, evolving from a derided rough fish to one of the most challenging and rewarding freshwater species available to fly anglers. Originally native to Asia and eastern Europe, carp have been introduced to waters on every continent except Antarctica and are now the most widely distributed freshwater fish on Earth. Carp are large, powerful, and incredibly wary fish that present a sight fishing challenge comparable to bonefishing on tropical flats. Stalking tailing carp in shallow water with weighted nymphs and crayfish patterns demands stealth, precise casting, and a patient approach that has earned carp the nickname freshwater bonefish among devoted practitioners. When hooked, carp make sustained, drag-testing runs that can strip a hundred yards of backing from the reel, humbling anglers accustomed to the comparatively modest fights of trout.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6b/Common_carp_%28white_background%29.jpg", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6b/Common_carp_%28white_background%29.jpg",
    nativeRange: "Central Asia and eastern Europe, from the Danube River basin east through the Caspian and Aral Sea drainages to China and Japan",
    introducedRange: "Virtually every continent except Antarctica; established in North America since the 1830s, now found in every US state except Alaska",
    averageSize: "18-28 inches, 5-15 lbs",
    recordSize: "75 lbs 11 oz (Lac de St. Cassien, France, 1987)",
    recordDetails: "Caught by Leo van der Gugten; North American records exceed 50 pounds in several states",
    preferredHabitat:
      "Warm, shallow lakes, ponds, reservoirs, and slow-moving rivers with soft bottoms; muddy flats, weed beds, and flooded shallows where they root for food",
    preferredFlies: [
      "Carp Bitters #6-10",
      "Backstabber #6-8",
      "Hybrid Carp Fly #6-8",
      "San Juan Worm #10-14",
      "Woolly Bugger #6-10",
      "Clouser Crayfish #4-8",
      "Carp Carrot #6-8",
    ],
    taxonomy: {
      order: "Cypriniformes",
      family: "Cyprinidae",
      genus: "Cyprinus",
      species: "C. carpio",
    },
    conservationStatus: "Least Concern (IUCN); considered invasive in many regions where introduced, but prized as a sport and food fish in Europe and Asia",
    diet: "Omnivorous, feeding on aquatic invertebrates, crayfish, worms, plant matter, algae, seeds, and small mollusks; uses sensitive barbels and a protrusible mouth to detect and vacuum food from soft substrates",
    spawningInfo:
      "Carp spawn in late spring and early summer when water temperatures reach 64-75°F. They broadcast eggs over aquatic vegetation in shallow, weedy areas during vigorous spawning displays. A single female can produce over one million eggs. Spawning events are conspicuous, with splashing and thrashing in shallow water.",
    spawningMonths: ["May", "June", "July"],
    spawningTempF: "64-75°F",
    lifespan: "15-25 years in most environments, with some individuals exceeding 40 years",
    waterTemperatureRange: "50-85°F (optimal 70-82°F for active feeding)",
    flyFishingTips:
      "Sight fishing for carp requires approaching tailing or cruising fish from behind and presenting the fly several feet ahead of the fish's path. Let the fly sink to the bottom and wait for the carp to approach. Any unnatural movement or splash will spook wary carp instantly. Small, weighted nymph and crayfish patterns in earthy tones are most effective.",
    tackleRecommendations:
      "A 9-foot 6 or 7-weight rod with a reliable drag system for handling powerful runs. Use 8-12 lb fluorocarbon tippet and long, fine leaders for the stealthiest presentation.",
    funFacts: [
      "Carp were originally imported to the United States in the 1830s as a food fish and were actively stocked by the US Fish Commission",
      "Their sensitive barbels can detect amino acids and other chemical signals at concentrations as low as parts per billion",
      "Carp are one of the longest-lived freshwater fish, with some individuals in Europe documented at over 60 years old",
      "The fly fishing community has embraced carp to such a degree that dedicated carp-on-fly tournaments now attract hundreds of participants",
    ],
    relatedDestinationIds: ["dest-colorado", "dest-michigan", "dest-idaho"],
    relatedRiverIds: ["river-south-platte", "river-missouri", "river-snake-river"],
    distributionCoordinates: [
      { name: "South Platte, CO", latitude: 39.8, longitude: -105.0 },
      { name: "Lake Michigan, MI", latitude: 43.0, longitude: -86.5 },
      { name: "Missouri River, MT", latitude: 47.0, longitude: -111.0 },
      { name: "Snake River, ID", latitude: 43.5, longitude: -111.0 },
    ],
    metaTitle: "Carp — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to carp fly fishing: the freshwater bonefish, sight fishing techniques, preferred patterns, and top warm-water destinations.",
    featured: false,
  },
  {
    id: "species-mountain-whitefish",
    slug: "mountain-whitefish",
    commonName: "Mountain Whitefish",
    scientificName: "Prosopium williamsoni",
    family: "warmwater",
    description:
      "The mountain whitefish is the unsung hero of western trout streams. Often overlooked or even disparaged by trout-focused anglers, mountain whitefish are native to the cold rivers and lakes of western North America and frequently outnumber trout in many premier fisheries. They are a member of the salmonid family, characterized by their silvery body, small mouth, and forked tail. Mountain whitefish feed primarily on aquatic invertebrates along the river bottom, making them excellent targets for nymph fishers, and they can provide fast-paced action during winter months when trout fishing slows. Increasingly, fly anglers are recognizing mountain whitefish as worthy quarry in their own right, appreciating their strong fights and the skill required to effectively target them with small nymphs and midges. Their importance as a native species in western river ecosystems adds conservation value to their pursuit.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/FMIB_51755_Rocky_Mountain_Whitefish%2C_Coregonus_williamsoni_Girard.jpeg", // FMIB Jordan 1907 — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/FMIB_51755_Rocky_Mountain_Whitefish%2C_Coregonus_williamsoni_Girard.jpeg",
    nativeRange: "Western North America, from the Rocky Mountains to the Pacific Coast, from British Columbia south to Nevada and Utah",
    introducedRange: "No significant introductions outside native range; natural distribution throughout cold western rivers",
    averageSize: "10-16 inches, 0.5-2 lbs",
    recordSize: "5 lbs 8 oz (Elbow River, Alberta, 1963)",
    recordDetails: "Caught in Alberta, Canada; whitefish in nutrient-rich tailwaters and spring creeks can reach exceptional sizes for the species",
    preferredHabitat:
      "Cold, clear rivers and streams; deep runs and pools with gravel and cobble bottoms; also found in deep, cold lakes and reservoirs throughout the western mountains",
    preferredFlies: [
      "Bead Head Pheasant Tail #16-20",
      "RS2 #18-22",
      "Zebra Midge #18-22",
      "San Juan Worm #12-14",
      "Copper John #16-20",
      "Mercury Midge #20-24",
      "WD-40 #18-22",
    ],
    taxonomy: {
      order: "Salmoniformes",
      family: "Salmonidae",
      genus: "Prosopium",
      species: "P. williamsoni",
    },
    conservationStatus: "Least Concern; native populations are generally healthy throughout western North America, though some local declines have been noted due to habitat degradation",
    diet: "Primarily benthic aquatic invertebrates including midge larvae, mayfly nymphs, caddisfly larvae, and small crustaceans; occasionally takes small fish eggs and drifting terrestrial insects",
    spawningInfo:
      "Mountain whitefish are fall and early winter spawners, depositing eggs over clean gravel substrates in rivers from October through December. Unlike trout, whitefish do not construct redds but instead broadcast eggs that settle into gravel interstices. Spawning typically occurs at night in shallow riffles.",
    spawningMonths: ["October", "November", "December"],
    spawningTempF: "38-44°F",
    lifespan: "8-14 years, with fish in cold headwater streams growing slowly but reaching considerable age",
    waterTemperatureRange: "36-64°F (optimal 42-55°F)",
    flyFishingTips:
      "Mountain whitefish feed almost exclusively on the bottom, so nymphing techniques with weighted flies and indicators are most effective. Use small midge and mayfly nymph patterns drifted close to the substrate in deep runs and pools. Winter fishing can be particularly productive as whitefish continue feeding actively in cold water when trout become lethargic.",
    tackleRecommendations:
      "A 9-foot 4 or 5-weight rod is ideal for whitefish nymphing. Use a sensitive indicator setup with 4X-6X tippet and small, weighted nymphs.",
    funFacts: [
      "Mountain whitefish outnumber trout by a ratio of 10 to 1 or more in many premier western rivers, making them the most abundant game fish in these ecosystems",
      "They are a native member of the salmonid family and play a critical ecological role in western river food webs",
      "Whitefish have a small, downward-oriented mouth that is perfectly adapted for picking invertebrates off the river bottom",
      "In some regions, dedicated whitefish derbies attract anglers who appreciate the species on its own merits rather than as accidental catch while trout fishing",
    ],
    relatedDestinationIds: ["dest-montana", "dest-idaho", "dest-colorado", "dest-wyoming"],
    relatedRiverIds: ["river-madison", "river-gallatin", "river-henry-s-fork"],
    distributionCoordinates: [
      { name: "Madison River, MT", latitude: 45.6, longitude: -111.5 },
      { name: "Gallatin River, MT", latitude: 45.5, longitude: -111.2 },
      { name: "Henry's Fork, ID", latitude: 44.6, longitude: -111.4 },
      { name: "North Platte, WY", latitude: 42.8, longitude: -106.3 },
    ],
    metaTitle: "Mountain Whitefish — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to mountain whitefish fly fishing: the overlooked native of western rivers, nymphing techniques, and top Montana and Idaho waters.",
    featured: false,
  },
  // ═══════════════════════════════════════════════════════════════════
  // PIKE (family: "pike")
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "species-northern-pike",
    slug: "northern-pike",
    commonName: "Northern Pike",
    scientificName: "Esox lucius",
    family: "pike",
    description:
      "The northern pike is the apex freshwater predator of the northern hemisphere, an ambush specialist with a torpedo-shaped body, a flat, duck-billed snout filled with hundreds of razor-sharp teeth, and an explosive strike that can generate the most violent topwater takes in freshwater fly fishing. Found across the circumpolar north in lakes, rivers, and marshes from Europe through Siberia and across North America, northern pike are among the most widely distributed freshwater fish on Earth. They are powerful, aggressive fish that readily strike large streamers and topwater patterns, making them outstanding fly rod targets for anglers seeking raw, adrenaline-fueled action. Pike fly fishing is at its best in spring and early summer when large fish move into shallow bays and backwaters to feed after the spawn, providing sight fishing opportunities for fish that can exceed 40 inches in length. The visual thrill of watching a pike follow and attack a streamer is an unforgettable experience.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Esox_lucius1.jpg", // Timothy Knepp USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Esox_lucius1.jpg",
    nativeRange: "Circumpolar distribution across the entire northern hemisphere: North America from Alaska to the eastern seaboard, Europe, and Asia through Siberia",
    introducedRange: "Southern United States, Spain, Turkey, and various other regions outside the native range; widely distributed through stocking programs",
    averageSize: "24-36 inches, 4-12 lbs",
    recordSize: "55 lbs 1 oz (Lake of Grefeern, Germany, 1986)",
    recordDetails: "Caught by Lothar Louis; North American records include a 46-pound fish from Great Sacandaga Lake, New York",
    preferredHabitat:
      "Shallow, weedy bays and backwaters of lakes and slow-moving rivers; marshes, sloughs, and backwater channels with abundant aquatic vegetation for ambush cover",
    preferredFlies: [
      "Articulated Streamer #3/0-6/0",
      "Pike Bunny #3/0-6/0",
      "Deceiver #2/0-5/0",
      "Dahlberg Diver #1/0-4/0",
      "Game Changer #2/0-5/0",
      "Pike Popper #2/0-4/0",
      "Clouser Minnow #1/0-4/0",
    ],
    taxonomy: {
      order: "Esociformes",
      family: "Esocidae",
      genus: "Esox",
      species: "E. lucius",
    },
    conservationStatus: "Least Concern (IUCN); one of the most abundant and widely distributed freshwater predators in the world",
    diet: "Highly piscivorous, feeding on perch, walleye, suckers, minnows, and other fish; also frogs, mice, muskrats, ducklings, and essentially any animal that fits in its mouth",
    spawningInfo:
      "Northern pike are among the earliest-spawning freshwater fish, moving into flooded marshes and shallow bays immediately after ice-out in March through May. Females scatter eggs over aquatic vegetation in water 6-18 inches deep. No parental care is provided, and eggs hatch in 12-14 days depending on water temperature.",
    spawningMonths: ["March", "April", "May"],
    spawningTempF: "40-50°F",
    lifespan: "12-20 years, with females living longer and growing substantially larger than males",
    waterTemperatureRange: "40-72°F (optimal 55-70°F for active feeding)",
    flyFishingTips:
      "Pike are ambush predators that position themselves along weed edges, around submerged timber, and in shallow bays where they can attack prey from cover. Cast large streamers parallel to weed lines and retrieve with long, steady strips punctuated by pauses. Wire or heavy fluorocarbon bite tippet is absolutely essential to prevent the pike's teeth from severing your leader.",
    tackleRecommendations:
      "A 9-foot 8 to 10-weight rod designed for throwing large, wind-resistant flies. Use a wire bite tippet of at least 30 lb and an intermediate or floating line with a pike-specific leader.",
    funFacts: [
      "Northern pike have been documented attacking and consuming ducklings, muskrats, and even small dogs that enter the water",
      "Their teeth are angled backward, ensuring that prey cannot escape once seized in the pike's jaws",
      "Pike can strike prey at speeds exceeding 30 miles per hour over short distances from a standing start",
      "They are one of the few freshwater fish species with a truly circumpolar distribution, found across North America, Europe, and Asia",
    ],
    relatedDestinationIds: ["dest-michigan", "dest-alaska", "dest-british-columbia", "dest-montana"],
    relatedRiverIds: ["river-au-sable", "river-missouri", "river-manistee"],
    distributionCoordinates: [
      { name: "Lake of the Woods, MN", latitude: 49.0, longitude: -94.5 },
      { name: "Lake St. Clair, MI", latitude: 42.5, longitude: -82.7 },
      { name: "Great Slave Lake, NWT", latitude: 61.7, longitude: -114.0 },
      { name: "Lake Athabasca, SK", latitude: 59.0, longitude: -109.0 },
    ],
    metaTitle: "Northern Pike — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to northern pike fly fishing: the apex freshwater predator, large streamer techniques, wire leaders, and top northern destinations.",
    featured: false,
  },
  {
    id: "species-musky",
    slug: "musky",
    commonName: "Musky",
    scientificName: "Esox masquinongy",
    family: "pike",
    description:
      "The muskellunge, commonly known as musky, is the largest member of the pike family and one of the most elusive and coveted freshwater game fish in North America. Known as the fish of 10,000 casts for the extreme difficulty involved in hooking one, musky grow to enormous proportions, with fish exceeding 50 inches and 40 pounds present in the best fisheries. Musky are apex predators that have no natural enemies in their habitats, sitting atop the food chain in the clear, cool lakes and rivers of the upper Midwest and northeastern United States and southeastern Canada. Fly fishing for musky is an extreme discipline that demands oversized tackle, enormous flies, and an extraordinary level of patience and persistence. When a musky finally commits to the fly, the experience is unforgettable, as these massive fish deliver crushing strikes and bulldog-like fights that test the limits of fly tackle. Dedicated musky fly anglers consider the hours of fruitless casting a worthy investment for moments of peak intensity.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/21/Muskellunge_%28Duane_Raver%29.png", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/21/Muskellunge_%28Duane_Raver%29.png",
    nativeRange: "Great Lakes basin, upper Mississippi and Ohio River drainages, St. Lawrence River system, and Lake of the Woods watershed in the northern United States and southeastern Canada",
    introducedRange: "Expanded stocking throughout the northeastern and midwestern United States and southeastern Canada in suitable cool, clear waters",
    averageSize: "30-42 inches, 8-20 lbs",
    recordSize: "67 lbs 8 oz (Lac Court Oreilles, Wisconsin, 1949)",
    recordDetails: "Caught by Cal Johnson; numerous fish over 60 pounds have been documented in Wisconsin, Minnesota, and Ontario waters",
    preferredHabitat:
      "Clear, cool lakes with extensive weed beds, rocky structure, and deep water access; also large rivers with adequate flow and structure; prefers water with visibility of at least 4 feet",
    preferredFlies: [
      "Articulated Musky Fly #5/0-8/0",
      "Buford #5/0-8/0",
      "Game Changer #4/0-7/0",
      "Double Deceiver #4/0-7/0",
      "Musky Popper #4/0-6/0",
      "Lynch's Drunk & Disorderly #5/0-8/0",
      "Swim Fly #4/0-6/0",
    ],
    taxonomy: {
      order: "Esociformes",
      family: "Esocidae",
      genus: "Esox",
      species: "E. masquinongy",
    },
    conservationStatus: "Least Concern; carefully managed through strict catch-and-release regulations and minimum size limits in most states and provinces; stocking programs maintain populations in many waters",
    diet: "Highly piscivorous, feeding on suckers, walleye, perch, bass, and other fish up to one-third their own body length; also consumes frogs, muskrats, and waterfowl",
    spawningInfo:
      "Musky spawn in spring shortly after ice-out when water temperatures reach 48-56°F, typically from April through May. They scatter eggs over shallow, vegetated areas in marshes and bays. No parental care is provided. Musky are slow-growing and late-maturing, with females not reaching sexual maturity until 5-7 years of age.",
    spawningMonths: ["April", "May"],
    spawningTempF: "48-56°F",
    lifespan: "15-30 years, with trophy-class females often exceeding 20 years of age",
    waterTemperatureRange: "50-75°F (optimal 60-72°F for peak feeding activity)",
    flyFishingTips:
      "Musky fishing requires mental toughness and endurance. Cast large flies to likely holding areas including weed edges, rocky points, and drop-offs, and make a figure-eight motion with the fly at the end of each retrieve to entice following fish into striking at boat-side. Fall is the prime season for musky on the fly, as fish feed aggressively to build reserves for winter.",
    tackleRecommendations:
      "A 9-foot 10 to 12-weight rod capable of throwing flies up to 12 inches long. Use a reel with a strong drag and at least 200 yards of 40 lb backing. Wire or 80 lb fluorocarbon bite tippet is essential.",
    funFacts: [
      "The nickname fish of 10,000 casts reflects the extraordinary difficulty of hooking a musky, though dedicated anglers dispute this as an underestimate",
      "Musky are the official state fish of Wisconsin, where they hold an almost mythical status among anglers",
      "A musky can consume prey up to 40% of its own body length in a single strike",
      "The musky's metabolism slows dramatically in winter, and fish may go weeks between meals, surviving on stored body fat",
    ],
    relatedDestinationIds: ["dest-michigan", "dest-pennsylvania"],
    relatedRiverIds: ["river-au-sable", "river-pere-marquette"],
    distributionCoordinates: [
      { name: "Lake of the Woods, MN/ON", latitude: 49.0, longitude: -94.5 },
      { name: "Lac Court Oreilles, WI", latitude: 46.0, longitude: -91.5 },
      { name: "Georgian Bay, ON", latitude: 45.0, longitude: -80.5 },
      { name: "Allegheny River, PA", latitude: 41.8, longitude: -79.0 },
    ],
    metaTitle: "Musky — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to musky fly fishing: the fish of 10,000 casts, oversized tackle and flies, fall techniques, and top Great Lakes region destinations.",
    featured: false,
  },
  {
    id: "species-chain-pickerel",
    slug: "chain-pickerel",
    commonName: "Chain Pickerel",
    scientificName: "Esox niger",
    family: "pike",
    description:
      "The chain pickerel is the smallest commonly targeted member of the pike family in North America, but what it lacks in size it more than compensates for with aggressive strikes and willingness to attack flies throughout the year. Named for the distinctive dark chain-link pattern that covers its bright green flanks, the chain pickerel is native to the Atlantic seaboard from Maine to Florida and is the dominant pike-family predator in waters too warm for northern pike and muskellunge. Chain pickerel are ambush predators that lurk among lily pads, submerged vegetation, and fallen timber, striking with remarkable speed and violence. They are an outstanding fly rod species that provides reliable action on days when other species are inactive, particularly during the cooler months of fall, winter, and early spring when chain pickerel continue to feed aggressively. Their accessibility in ponds and small streams near population centers makes them an ideal target for quick fly fishing outings.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Chain_pickerel_%28Duane_Raver%29.png", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Chain_pickerel_%28Duane_Raver%29.png",
    nativeRange: "Atlantic coast of North America from Nova Scotia south to Florida, and west through the Gulf Coast states to the Mississippi drainage",
    introducedRange: "Limited introductions in Maine and other northeastern states where they coexist with northern pike in some waters",
    averageSize: "14-22 inches, 1-3 lbs",
    recordSize: "9 lbs 6 oz (Homerville, Georgia, 1961)",
    recordDetails: "Caught by Baxley McQuaig Jr.; pickerel over 4 pounds are considered exceptional in most waters",
    preferredHabitat:
      "Shallow, weedy ponds, lakes, and slow-moving streams and rivers with abundant aquatic vegetation; lily pads, pickerelweed, and submerged timber are preferred ambush cover",
    preferredFlies: [
      "Clouser Minnow #2-6",
      "Woolly Bugger #4-8",
      "Deceiver #2-6",
      "Popper #4-8",
      "Mickey Finn #6-10",
      "Deer Hair Diver #2-6",
      "Bunny Leech #2-6",
    ],
    taxonomy: {
      order: "Esociformes",
      family: "Esocidae",
      genus: "Esox",
      species: "E. niger",
    },
    conservationStatus: "Least Concern; abundant and stable throughout their native range with no significant conservation concerns",
    diet: "Small fish (minnows, sunfish, perch), frogs, crayfish, and large aquatic insects; proportionally aggressive predator that will attack prey up to half its own length",
    spawningInfo:
      "Chain pickerel are early spring spawners, depositing eggs in shallow, vegetated areas when water temperatures reach 47-52°F in March through April. Eggs adhere to aquatic vegetation and hatch in 6-12 days. No parental care is provided, and newly hatched fry attach to vegetation briefly before becoming free-swimming.",
    spawningMonths: ["March", "April"],
    spawningTempF: "47-52°F",
    lifespan: "6-10 years, with females growing larger and living longer than males",
    waterTemperatureRange: "40-78°F (optimal 55-72°F for active feeding, but will feed down to near-freezing temperatures)",
    flyFishingTips:
      "Chain pickerel are aggressive year-round, making them an excellent cold-weather fly fishing option when other species are dormant. Target edges of lily pads and submerged vegetation with streamers retrieved in quick, darting strips. Weedless flies are essential in heavy cover. Wire or heavy fluorocarbon tippet prevents bite-offs from their sharp teeth.",
    tackleRecommendations:
      "A 9-foot 5 or 6-weight rod is ideal for chain pickerel, providing enough power for streamers while maintaining the sport of battling these energetic fish. Use 15-20 lb bite tippet.",
    funFacts: [
      "Chain pickerel are active predators even in near-freezing water, making them one of the best fly fishing targets during the winter months",
      "Their chain-link pattern is unique among the pike family and provides excellent camouflage among aquatic vegetation",
      "Chain pickerel are sometimes called the jack pike or just pickerel by New England anglers",
      "They have proportionally more teeth than northern pike, with over 500 teeth in their jaws at any given time",
    ],
    relatedDestinationIds: ["dest-pennsylvania", "dest-michigan"],
    relatedRiverIds: ["river-penns-creek", "river-letort-spring-run"],
    distributionCoordinates: [
      { name: "Connecticut River, CT", latitude: 41.5, longitude: -72.6 },
      { name: "Delaware Water Gap, PA", latitude: 41.0, longitude: -75.1 },
      { name: "Cape Cod, MA", latitude: 41.7, longitude: -70.0 },
      { name: "Okefenokee Swamp, GA", latitude: 30.7, longitude: -82.3 },
    ],
    metaTitle: "Chain Pickerel — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to chain pickerel fly fishing: the aggressive year-round predator, lily pad techniques, and top eastern pond and stream destinations.",
    featured: false,
  },
  {
    id: "species-tiger-musky",
    slug: "tiger-musky",
    commonName: "Tiger Musky",
    scientificName: "Esox masquinongy × Esox lucius",
    family: "pike",
    description:
      "The tiger musky is a striking hybrid between the muskellunge and the northern pike, combining the impressive size potential of the musky with the more aggressive feeding behavior of pike. Named for the distinctive dark vertical bars and wavy tiger-stripe markings on their flanks, tiger musky are produced both naturally in waters where musky and pike coexist and through deliberate hatchery programs designed to create a high-quality sport fish. Tiger musky are generally sterile, which makes them ideal for fisheries management, as they grow quickly, feed aggressively, and do not reproduce to upset the ecological balance of stocked waters. They are more willing to strike a fly than pure muskellunge, making them a relatively accessible entry point into the world of big-game pike-family fly fishing. Tiger musky can exceed 50 inches and 30 pounds in productive waters, offering the same heart-stopping strikes and powerful fights as their parent species.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Tiger_muskellunge_%28Duane_Raver%29.png", // Duane Raver USFWS — public domain
    illustrationUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Tiger_muskellunge_%28Duane_Raver%29.png",
    nativeRange: "Occurs naturally in a few lakes where muskellunge and northern pike ranges overlap, primarily in the upper Great Lakes region and southern Canada",
    introducedRange: "Widely stocked for sport fishing in lakes and reservoirs across the northern and midwestern United States, from Vermont to Washington state",
    averageSize: "28-38 inches, 6-15 lbs",
    recordSize: "51 lbs 3 oz (Lac Vieux Desert, Michigan/Wisconsin border, 1919)",
    recordDetails: "Caught by John Knobla; modern stocked tiger musky fisheries regularly produce fish over 40 inches",
    preferredHabitat:
      "Clear, cool lakes with abundant weed growth, rocky structure, and deep water access; similar habitat preferences to both parent species but more tolerant of varied conditions",
    preferredFlies: [
      "Articulated Streamer #3/0-6/0",
      "Game Changer #3/0-6/0",
      "Deceiver #2/0-5/0",
      "Popper #2/0-5/0",
      "Buford #3/0-6/0",
      "Woolly Bugger #1/0-4/0",
      "Swim Fly #2/0-5/0",
    ],
    taxonomy: {
      order: "Esociformes",
      family: "Esocidae",
      genus: "Esox",
      species: "E. masquinongy × E. lucius",
    },
    conservationStatus: "Not assessed by IUCN; a hatchery-produced hybrid stocked for sport fishing; has no independent conservation status but contributes to recreational fisheries management",
    diet: "Piscivorous predator feeding on perch, sunfish, suckers, minnows, and other available fish; more aggressive and less selective than pure muskellunge in feeding behavior",
    spawningInfo:
      "Tiger musky are functionally sterile hybrids and do not reproduce successfully in the wild. While they may exhibit spawning behavior in spring, any eggs produced are not viable. This sterility is a fisheries management advantage, as it prevents overpopulation and allows precise control of stocking densities.",
    spawningMonths: ["April", "May"],
    spawningTempF: "48-56°F (spawning behavior exhibited but reproduction unsuccessful)",
    lifespan: "12-18 years, with growth rates typically exceeding those of pure muskellunge in managed fisheries",
    waterTemperatureRange: "50-75°F (optimal 58-72°F)",
    flyFishingTips:
      "Tiger musky are more aggressive than pure muskellunge and will often commit to the fly more readily. Use the same large flies and techniques as musky fishing but expect more frequent follows and strikes. The figure-eight leader movement at the end of each retrieve is still crucial, as tiger musky will often follow to within inches of the rod tip before striking.",
    tackleRecommendations:
      "A 9-foot 9 to 11-weight rod capable of casting large flies. Wire or 60-80 lb fluorocarbon bite tippet is essential. A reel with a smooth drag and 150+ yards of 30 lb backing is recommended.",
    funFacts: [
      "Tiger musky grow faster than either parent species in their first few years of life, a phenomenon known as hybrid vigor",
      "Their sterility makes them a fisheries manager's dream, as stocking rates can be precisely controlled without worrying about natural reproduction",
      "The distinctive tiger stripe pattern varies between individuals, with no two tiger musky having exactly the same markings",
      "Tiger musky are generally more aggressive feeders than pure muskellunge, making them somewhat less deserving of the 10,000 casts reputation",
    ],
    relatedDestinationIds: ["dest-michigan", "dest-pennsylvania", "dest-colorado"],
    relatedRiverIds: ["river-au-sable", "river-penns-creek"],
    distributionCoordinates: [
      { name: "Lake Champlain, VT/NY", latitude: 44.5, longitude: -73.3 },
      { name: "Pineview Reservoir, UT", latitude: 41.2, longitude: -111.8 },
      { name: "Tiger Musky Lake, WI", latitude: 45.5, longitude: -89.5 },
      { name: "Escanaba Lake, WI", latitude: 46.1, longitude: -89.6 },
    ],
    metaTitle: "Tiger Musky — Species Profile | Executive Angler",
    metaDescription:
      "Complete guide to tiger musky fly fishing: the aggressive pike-muskellunge hybrid, stocked fisheries, large-fly techniques, and top destinations.",
    featured: false,
  },
];
