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
  // ─── WYOMING ───────────────────────────────────────────────────────
  {
    id: "guide-jackson-hole-anglers",
    slug: "jackson-hole-anglers",
    name: "Trent Kirkpatrick — Jackson Hole Anglers",
    destinationId: "dest-wyoming",
    bio:
      "Trent Kirkpatrick has spent over two decades guiding fly fishers on the waters of the Greater Yellowstone region from his base in Jackson, Wyoming. A former competitive fly caster and lifelong naturalist, Trent brings an unusual combination of technical precision and ecological curiosity to every day on the river. His guided trips on the Snake River are widely regarded as some of the finest available in the Jackson Hole valley, blending productive fishing with insightful commentary on the geology, wildlife, and conservation history of the Teton landscape.\n\nTrent's specialties include dry-fly fishing for Snake River fine-spotted cutthroat trout, streamer fishing for large browns in the Snake River canyon, and backcountry wade trips into the remote tributaries of Grand Teton and Yellowstone National Parks. His float trips through the braided channels below the Tetons are consistently productive, and his intimate knowledge of the river's ever-shifting gravel bars and side channels allows him to find fish in water that other guides pass by. Trent is also an accomplished Spey caster and offers two-handed casting instruction for anglers interested in expanding their skill set.\n\nClients consistently praise Trent's patience with beginners and his ability to challenge experienced anglers with technical scenarios that push their abilities. He limits his bookings to ensure quality over volume, and his repeat client rate exceeds eighty percent, a testament to the caliber of his guiding.",
    specialties: [
      "Snake River float trips",
      "Dry fly fishing",
      "Streamer fishing",
      "Backcountry wade trips",
      "Spey casting instruction",
      "Cutthroat trout specialist",
      "Wildlife and ecology tours",
    ],
    yearsExperience: 22,
    photoUrl:
      "https://images.unsplash.com/photo-1587502537745-84b7d66a8f97?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-snake-river", "river-north-platte-wy", "river-firehole"],
    dailyRate: "$700/day (1-2 anglers)",
    metaTitle: "Trent Kirkpatrick — Jackson Hole Fly Fishing Guide",
    metaDescription:
      "Expert fly fishing guide in Jackson Hole, Wyoming. Snake River float trips, backcountry wade fishing, and Spey casting instruction amid the Teton Range.",
  },
  // ─── COLORADO ──────────────────────────────────────────────────────
  {
    id: "guide-frying-pan-anglers",
    slug: "frying-pan-anglers",
    name: "Miguel Vasquez — Frying Pan Anglers",
    destinationId: "dest-colorado",
    bio:
      "Miguel Vasquez grew up fishing the tailwaters and freestone streams of the Colorado Rockies and turned his childhood obsession into a guiding career that now spans eighteen years on some of the most demanding trout water in the American West. Based near Basalt, Colorado, Miguel specializes in the Frying Pan River tailwater, a fishery whose technical difficulty and trophy potential have earned it a reputation as one of the ultimate tests of fly fishing skill in the Lower 48. The Frying Pan's crystalline water, dense insect hatches, and heavily educated trout population require a level of precision in fly selection, leader construction, and presentation that separates casual anglers from committed practitioners.\n\nMiguel's approach to guiding is rooted in entomology and observation. He carries a portable microscope on every trip and regularly seines the river to identify the exact insect species trout are feeding on, then matches not just the genus but the specific life stage and behavioral drift pattern. This scientific rigor, combined with years of on-water intuition, gives his clients a decisive edge on water where the margin between success and failure is often a single size of tippet or one shade of dubbing color.\n\nBeyond the Frying Pan, Miguel guides on the South Platte, Arkansas, and Roaring Fork rivers, offering a diverse portfolio of Colorado trout fishing experiences. He is a certified casting instructor and a passionate advocate for river conservation, serving on the board of a regional watershed protection organization.",
    specialties: [
      "Tailwater nymphing",
      "Technical dry fly fishing",
      "Entomology-based guiding",
      "Frying Pan River specialist",
      "Casting instruction",
      "Euro nymphing",
      "Trophy trout pursuit",
    ],
    yearsExperience: 18,
    photoUrl:
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-frying-pan", "river-south-platte", "river-arkansas-co"],
    dailyRate: "$600/day (1-2 anglers)",
    metaTitle: "Miguel Vasquez — Frying Pan River Fly Fishing Guide, Colorado",
    metaDescription:
      "Expert fly fishing guide on Colorado's Frying Pan River. Technical tailwater nymphing, dry-fly fishing, and entomology-driven guiding for trophy trout.",
  },
  // ─── IDAHO ─────────────────────────────────────────────────────────
  {
    id: "guide-henrys-fork-anglers",
    slug: "henrys-fork-anglers",
    name: "Dale Pearson — Henry's Fork Anglers",
    destinationId: "dest-idaho",
    bio:
      "Dale Pearson has devoted thirty years to guiding fly fishers on the Henry's Fork of the Snake River and the spring creeks of eastern Idaho, establishing himself as one of the foremost technical dry-fly guides in the Western United States. The Henry's Fork's Railroad Ranch section, with its flat, glassy currents and enormous, selective rainbow trout, is Dale's home water, and his understanding of its seasonal rhythms, insect emergences, and fish behavior patterns is as deep as any living angler's. He has guided clients to fish that many would consider uncatchable, and his patient, methodical approach to the most challenging dry-fly scenarios has earned him a loyal following among the sport's most accomplished practitioners.\n\nDale's guiding philosophy centers on the belief that the Henry's Fork teaches lessons that apply to every piece of trout water on Earth. The discipline of approaching a sipping trout with a twenty-foot leader, a size 22 comparadun, and a single opportunity to make a drag-free presentation develops skills that transform an angler's effectiveness everywhere they fish afterward. He takes particular satisfaction in working with intermediate anglers who are ready to elevate their game and is known for his ability to diagnose and correct casting and presentation issues quickly.\n\nBeyond the Henry's Fork, Dale guides on Silver Creek, the South Fork of the Snake, and the backcountry waters of Yellowstone National Park, providing clients with a range of fishing experiences from technical spring creeks to powerful freestone rivers.",
    specialties: [
      "Technical dry fly fishing",
      "Spring creek specialist",
      "Henry's Fork Railroad Ranch",
      "Sight fishing",
      "Leader and tippet craft",
      "Casting diagnosis",
      "Yellowstone backcountry",
    ],
    yearsExperience: 30,
    photoUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-henry-s-fork", "river-silver-creek", "river-south-fork-boise"],
    dailyRate: "$650/day (1-2 anglers)",
    metaTitle: "Dale Pearson — Henry's Fork Fly Fishing Guide, Idaho",
    metaDescription:
      "Thirty-year veteran fly fishing guide on Idaho's Henry's Fork. Technical dry-fly specialist for trophy rainbows on the Railroad Ranch, Silver Creek, and Yellowstone.",
  },
  // ─── ALASKA ────────────────────────────────────────────────────────
  {
    id: "guide-bristol-bay-fly-fishing",
    slug: "bristol-bay-fly-fishing",
    name: "Nate Runyan — Bristol Bay Fly Fishing",
    destinationId: "dest-alaska",
    bio:
      "Nate Runyan is an Alaska-based fly fishing guide who has spent fifteen seasons navigating the remote rivers and tundra streams of the Bristol Bay watershed, one of the most prolific wild fish ecosystems remaining on Earth. Operating primarily by floatplane from his base on Lake Iliamna, Nate accesses a network of rivers that most anglers will never see, waters where wild rainbow trout routinely exceed twenty inches and five species of Pacific salmon crowd the pools in numbers that defy comprehension. His logistical expertise in this roadless wilderness is as essential as his fishing knowledge, and clients trust him to deliver them safely to world-class water regardless of weather, bears, or the thousand other variables that define backcountry Alaska.\n\nNate specializes in targeting the Bristol Bay's legendary rainbow trout, which grow to exceptional sizes by gorging on salmon eggs and flesh during the summer and fall spawning runs. He is an expert in reading salmon-influenced water, identifying the feeding lanes where rainbows stack up behind spawning sockeye, and selecting the precise egg patterns, flesh flies, and mouse imitations that trigger aggressive strikes. His clients routinely land rainbows exceeding twenty-four inches, with the occasional fish approaching thirty.\n\nNate is also a passionate conservationist who has been actively involved in efforts to protect Bristol Bay's fisheries from industrial development. He serves as a fishing industry representative to regional conservation coalitions and uses his platform as a guide to educate visiting anglers about the irreplaceable value of this watershed.",
    specialties: [
      "Trophy rainbow trout",
      "Pacific salmon on the fly",
      "Floatplane-access fishing",
      "Mouse and streamer fishing",
      "Egg and flesh fly techniques",
      "Bear safety and wilderness skills",
      "Multi-day float trips",
    ],
    yearsExperience: 15,
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-bristol-bay", "river-kenai", "river-copper-river"],
    dailyRate: "$900/day (1-2 anglers, includes floatplane)",
    metaTitle: "Nate Runyan — Bristol Bay Alaska Fly Fishing Guide",
    metaDescription:
      "Expert fly fishing guide in Bristol Bay, Alaska. Floatplane access to remote rivers for trophy rainbow trout and Pacific salmon in pristine wilderness.",
  },
  // ─── OREGON ────────────────────────────────────────────────────────
  {
    id: "guide-deschutes-river-outfitters",
    slug: "deschutes-river-outfitters",
    name: "Sarah Whitfield — Deschutes River Outfitters",
    destinationId: "dest-oregon",
    bio:
      "Sarah Whitfield is one of the Pacific Northwest's most respected fly fishing guides, operating a boutique guiding service focused on the rivers of central and southern Oregon. With sixteen years of professional guiding experience, Sarah has built her reputation on the Deschutes River, where she specializes in both the famed redsides rainbow trout fishery and the river's late-summer steelhead runs. Her intimate knowledge of the Deschutes canyon, from Warm Springs downstream to the Columbia confluence, encompasses every riffle, tailout, and camping spot along more than a hundred miles of fly-only water.\n\nSarah's approach to guiding reflects her background as a competitive fly fisher and certified casting instructor. She is meticulous about casting mechanics, believing that improving a client's casting ability yields far more fish over the course of a trip than simply finding the right pool. Her steelhead guiding, which involves traditional down-and-across wet-fly swinging with both single-hand and Spey rods, draws anglers who appreciate the meditative, methodical nature of the classic steelhead game.\n\nBeyond the Deschutes, Sarah guides on the Rogue River for summer steelhead and the McKenzie River for its exceptional resident rainbow trout fishing. She is active in Oregon's wild steelhead conservation community and volunteers as a mentor for youth fly fishing programs throughout the state.",
    specialties: [
      "Deschutes River specialist",
      "Steelhead swing fishing",
      "Spey casting instruction",
      "Dry fly fishing",
      "Multi-day camping float trips",
      "Casting instruction",
      "Women's fly fishing clinics",
    ],
    yearsExperience: 16,
    photoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-deschutes", "river-rogue", "river-mckenzie"],
    dailyRate: "$600/day (1-2 anglers)",
    metaTitle: "Sarah Whitfield — Deschutes River Fly Fishing Guide, Oregon",
    metaDescription:
      "Expert fly fishing guide on Oregon's Deschutes River. Steelhead swinging, redsides trout, Spey casting instruction, and multi-day float trips.",
  },
  // ─── PENNSYLVANIA ──────────────────────────────────────────────────
  {
    id: "guide-cumberland-valley-anglers",
    slug: "cumberland-valley-anglers",
    name: "Ed Shenk III — Cumberland Valley Anglers",
    destinationId: "dest-pennsylvania",
    bio:
      "Ed Shenk III carries forward a family tradition of limestone creek fly fishing that stretches back three generations in the Cumberland Valley of south-central Pennsylvania. His grandfather pioneered several fly patterns that remain staples on the Letort Spring Run, and Ed has built on that heritage with twenty-five years of professional guiding on the spring creeks and limestone streams that form the historical foundation of American fly fishing. The waters he guides — the Letort, Big Spring, Penns Creek, and a handful of lesser-known private streams — are among the most technically demanding in the Eastern United States, and Ed's deep familiarity with their rhythms, hatches, and resident trout populations gives his clients a decisive advantage.\n\nEd is a recognized authority on the sulphur, trico, and terrestrial hatches that define summer fly fishing on Pennsylvania's limestone creeks. His ability to spot feeding trout in flat, clear water and diagnose the specific insect they are consuming is a skill honed over thousands of hours of patient observation. He carries a vest full of meticulously tied flies in sizes that would challenge the eyesight of most anglers, and his leaders routinely taper to 7X or 8X tippet, a necessity on water where trout have been subjected to catch-and-release fishing pressure for decades.\n\nEd welcomes anglers of all skill levels but finds particular satisfaction in guiding experienced dry-fly fishers who want to test themselves against the most selective trout in the East.",
    specialties: [
      "Limestone spring creek fishing",
      "Technical dry fly fishing",
      "Trico and sulphur hatches",
      "Terrestrial fishing",
      "Sight fishing to rising trout",
      "Fine tippet techniques",
      "Penns Creek green drake hatch",
    ],
    yearsExperience: 25,
    photoUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-letort-spring-run", "river-big-spring", "river-penns-creek"],
    dailyRate: "$500/day (1-2 anglers)",
    metaTitle: "Ed Shenk III — Pennsylvania Spring Creek Fly Fishing Guide",
    metaDescription:
      "Third-generation fly fishing guide on Pennsylvania's legendary limestone creeks. Technical dry-fly fishing on the Letort, Big Spring, and Penns Creek.",
  },
  // ─── MICHIGAN ──────────────────────────────────────────────────────
  {
    id: "guide-au-sable-river-guides",
    slug: "au-sable-river-guides",
    name: "Jim Navarre — Au Sable River Guides",
    destinationId: "dest-michigan",
    bio:
      "Jim Navarre is a lifelong Michigan angler and twenty-year professional guide who operates from the legendary town of Grayling on the banks of the Au Sable River. The Au Sable holds a special place in American fly fishing history as one of the first rivers in the United States to receive dedicated trout management, and Jim honors that tradition by guiding from hand-built Au Sable riverboats — flat-bottomed wooden craft designed specifically for the river's shallow, sand-bottomed runs and cedar-shaded pools. Floating the Au Sable in one of these traditional boats, casting dry flies to rising brook and brown trout as the current carries you silently through northern Michigan's pine and hardwood forests, is an experience that connects the modern angler to the earliest days of American fly fishing.\n\nJim's guiding calendar spans the full range of Michigan's fishing seasons. Spring brings the famed Hendrickson and Borcher's drake hatches on the Au Sable, followed by the legendary Hex hatch in June and July, when enormous Hexagenia limbata mayflies carpet the river at dusk and the largest brown trout of the year rise to feed. Autumn shifts the focus to steelhead and salmon on the Pere Marquette and Manistee rivers, where Jim guides both swing and indicator anglers through classic Great Lakes steelhead water.\n\nJim is a certified Michigan DNR river guide and an active participant in the conservation of the Au Sable watershed through his membership in local river preservation organizations.",
    specialties: [
      "Au Sable riverboat trips",
      "Hex hatch specialist",
      "Night fishing for brown trout",
      "Steelhead on the Pere Marquette",
      "Brook trout fishing",
      "Traditional dry fly fishing",
      "Michigan salmon runs",
    ],
    yearsExperience: 20,
    photoUrl:
      "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-au-sable", "river-pere-marquette", "river-manistee"],
    dailyRate: "$550/day (1-2 anglers)",
    metaTitle: "Jim Navarre — Au Sable River Fly Fishing Guide, Michigan",
    metaDescription:
      "Experienced fly fishing guide on Michigan's Au Sable River. Traditional riverboat trips, Hex hatch fishing, and steelhead guiding on the Pere Marquette.",
  },
  // ─── ARKANSAS ──────────────────────────────────────────────────────
  {
    id: "guide-white-river-fly-fishing",
    slug: "white-river-fly-fishing",
    name: "Cody Lazenby — White River Fly Fishing",
    destinationId: "dest-arkansas",
    bio:
      "Cody Lazenby is a White River tailwater specialist who has guided fly fishers on the cold waters below Bull Shoals and Norfork dams for fourteen years, developing an encyclopedic knowledge of the generation schedules, insect hatches, and trophy trout holding areas that define fishing on one of the most productive tailwater systems in America. The White River's trout population is staggering by any measure, with electrofishing surveys consistently recording densities exceeding five thousand fish per mile on the best reaches. Cody navigates this abundance with precision, targeting specific fish and specific techniques rather than simply covering water and hoping for the best.\n\nCody's approach is built around understanding the U.S. Army Corps of Engineers generation schedule that controls water flow from the dam. Rising water pushes trout into predictable feeding positions, and falling water exposes runs and riffles that concentrate fish in ways that the uninitiated would never recognize. His ability to read the daily generation schedule and position his drift boat in exactly the right water at exactly the right time consistently produces outstanding days for his clients, even when other boats are struggling.\n\nBeyond the main White River, Cody guides on the Norfork River and the Little Red River, two additional tailwater fisheries within an hour of his home base in Cotter. The Norfork is particularly noted for its trophy brown trout, and the Little Red holds the world-record brown trout waters that have made Arkansas a surprisingly prominent destination on the national fly fishing map.",
    specialties: [
      "Tailwater drift boat trips",
      "Generation schedule fishing",
      "Trophy brown trout",
      "Midge and scud fishing",
      "Year-round trout fishing",
      "Norfork River specialist",
      "Beginner instruction",
    ],
    yearsExperience: 14,
    photoUrl:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-white-river-ar", "river-norfork", "river-little-red"],
    dailyRate: "$450/day (1-2 anglers)",
    metaTitle: "Cody Lazenby — White River Arkansas Fly Fishing Guide",
    metaDescription:
      "Expert tailwater fly fishing guide on Arkansas's White and Norfork rivers. Year-round trophy trout fishing, drift boat trips, and generation schedule expertise.",
  },
  // ─── FLORIDA KEYS ──────────────────────────────────────────────────
  {
    id: "guide-islamorada-flats-guide",
    slug: "islamorada-flats-guide",
    name: "Captain Luis Cabrera — Islamorada Flats",
    destinationId: "dest-florida-keys",
    bio:
      "Captain Luis Cabrera is a second-generation Florida Keys fishing guide who grew up poling flats skiffs across the backcountry waters of Islamorada and the Everglades before he was old enough to hold a commercial captain's license. His father guided in the Keys for thirty years, and Luis absorbed the art of reading tides, spotting fish, and understanding the seasonal movements of bonefish, permit, and tarpon from an age when most children were learning to ride bicycles. Today, with eighteen years as a licensed captain and guide, Luis is recognized as one of the most skilled and consistent guides working the Middle Keys flats.\n\nLuis is a permit specialist, a distinction that carries particular weight in the fly fishing world because permit are widely considered the most difficult shallow-water gamefish to catch on a fly. His success rate on permit exceeds the industry average by a significant margin, a result of his uncanny ability to spot tailing fish at distance, his precise boat positioning, and his deep understanding of permit feeding behavior on different bottom types and in different tidal conditions. His clients have achieved more grand slams — bonefish, permit, and tarpon in a single day — than those of any other guide in the Middle Keys over the past five seasons.\n\nLuis operates a state-of-the-art technical poling skiff equipped with the latest in shallow-water technology, and his tackle room is stocked with flies, leaders, and accessories specifically curated for Keys flats fishing.",
    specialties: [
      "Permit on the fly",
      "Tarpon fishing",
      "Bonefish flats",
      "Grand slam specialist",
      "Technical poling skiff",
      "Everglades backcountry",
      "Sight casting instruction",
    ],
    yearsExperience: 18,
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-florida-keys-flats"],
    dailyRate: "$800/day (1-2 anglers)",
    metaTitle: "Captain Luis Cabrera — Islamorada Fly Fishing Guide, Florida Keys",
    metaDescription:
      "Top-rated Florida Keys fly fishing guide specializing in permit, bonefish, and tarpon. Grand slam expert operating from Islamorada on the Middle Keys flats.",
  },
  // ─── NEW ZEALAND ───────────────────────────────────────────────────
  {
    id: "guide-nz-backcountry-fly-fishing",
    slug: "nz-backcountry-fly-fishing",
    name: "Hamish McLeod — NZ Backcountry Fly Fishing",
    destinationId: "dest-new-zealand",
    bio:
      "Hamish McLeod is a New Zealand backcountry fly fishing guide based in the Southland region of the South Island, where he has spent the past twenty years guiding visiting anglers on some of the most visually spectacular and technically demanding trout water in the Southern Hemisphere. Hamish grew up on a sheep station bordering the Mataura River and learned to fish before he could read, developing the acute eyesight and patient stalking skills that are prerequisites for success on New Zealand's crystalline rivers. His guiding territory spans both the South Island's famed spring creeks and the remote backcountry streams accessible only by helicopter or extended bushwalks.\n\nNew Zealand fly fishing is defined by sight-fishing to individual trout, and Hamish is a master of this discipline. His ability to spot brown and rainbow trout holding in clear water at distances that leave most visiting anglers shaking their heads in disbelief is legendary among his clients. Once a fish is located, Hamish coaches the approach, the cast, and the drift with a calm precision that puts nervous anglers at ease and consistently results in the fly arriving in the trout's feeding lane at the exact right moment.\n\nHamish organizes multi-day backcountry expeditions that combine helicopter access, wilderness camping, and fishing on rivers that may see only a handful of anglers per season. These trips offer the chance to pursue trophy brown trout exceeding eight pounds in water so remote that the only sounds are birdsong and the river's current.",
    specialties: [
      "Sight fishing for trophy trout",
      "Backcountry helicopter trips",
      "Multi-day wilderness expeditions",
      "Dry fly and nymph fishing",
      "South Island spring creeks",
      "Brown trout specialist",
      "Wilderness camping and guiding",
    ],
    yearsExperience: 20,
    photoUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-mataura", "river-oreti", "river-tongariro"],
    dailyRate: "$750 NZD/day (1-2 anglers)",
    metaTitle: "Hamish McLeod — New Zealand Backcountry Fly Fishing Guide",
    metaDescription:
      "Expert New Zealand fly fishing guide on the South Island. Sight-fishing for trophy brown trout, helicopter backcountry trips, and wilderness expeditions in Southland.",
  },
  // ─── PATAGONIA ─────────────────────────────────────────────────────
  {
    id: "guide-patagonia-trout-adventures",
    slug: "patagonia-trout-adventures",
    name: "Matias Orellana — Patagonia Trout Adventures",
    destinationId: "dest-patagonia",
    bio:
      "Matias Orellana is an Argentine fly fishing guide who has spent his entire adult life on the rivers of northern Patagonia, building a reputation as one of the most skilled and personable guides in the region. Born in San Martin de los Andes, Matias grew up fishing the Rio Malleo, Chimehuin, and Alumine rivers that drain the eastern slopes of the Andes, and his understanding of Patagonian trout behavior is informed by decades of daily observation on water that he considers an extension of his own home. His clients include both visiting international anglers and Argentina's own passionate fly fishing community, and he is equally comfortable guiding in English and Spanish.\n\nMatias excels at matching his guiding style to the personality and skill level of each client. For experienced anglers, he opens access to remote, wade-only stretches of river where large resident brown and rainbow trout hold beneath overhanging willows and volcanic boulder fields. For those newer to the sport, he selects more forgiving water where the trout are eager and the scenery is breathtaking, allowing beginners to build confidence and technique in an environment that rewards effort without punishing mistakes.\n\nHis float trips on the Rio Malleo during the fall spawning run are particularly sought after, offering shots at large migratory brown trout that move upriver from Lago Huechulafquen in predictable seasonal pulses. Matias also guides on the Rio Grande for sea-run brown trout, a species that represents one of fly fishing's ultimate challenges.",
    specialties: [
      "Patagonian brown trout",
      "Rio Malleo specialist",
      "Float and wade trips",
      "Spey casting for sea-run trout",
      "Streamer fishing",
      "Dry fly on spring creeks",
      "Bilingual guiding (English/Spanish)",
    ],
    yearsExperience: 19,
    photoUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-rio-grande-ar", "river-rio-malleo"],
    dailyRate: "$550/day (1-2 anglers)",
    metaTitle: "Matias Orellana — Patagonia Argentina Fly Fishing Guide",
    metaDescription:
      "Expert fly fishing guide in northern Patagonia, Argentina. Trophy brown and rainbow trout on the Rio Malleo, Chimehuin, and Rio Grande with bilingual service.",
  },
  // ─── BRITISH COLUMBIA ──────────────────────────────────────────────
  {
    id: "guide-skeena-steelhead-guide",
    slug: "skeena-steelhead-guide",
    name: "Owen Blackwater — Skeena Steelhead Adventures",
    destinationId: "dest-british-columbia",
    bio:
      "Owen Blackwater is a member of the Gitxsan First Nation and a professional fly fishing guide who has spent his life on the rivers of the Skeena watershed in northwestern British Columbia. The Skeena and its tributaries — the Bulkley, Morice, Kispiox, Babine, and Sustut — constitute the greatest wild steelhead river system remaining on Earth, and Owen's ancestral connection to these waters gives him a perspective on the fish and the landscape that no amount of sport fishing experience alone could provide. His guiding practice is informed by both traditional ecological knowledge passed down through his family and the modern fly fishing techniques demanded by the most discerning visiting anglers.\n\nOwen specializes in swinging flies for wild steelhead using traditional Spey casting methods. His preferred approach is the classic wet-fly swing, presenting hand-tied patterns through the tailouts, slots, and bucket pools that wild steelhead favor during their upstream migration. He ties many of his own flies, drawing inspiration from both the classic British salmon fly tradition and the innovative patterns emerging from the Pacific Northwest steelhead community. His knowledge of run timing, water temperature, and the behavioral differences between summer and fall steelhead allows him to position his clients on the right water at the right time throughout the season.\n\nOwen is a vocal advocate for wild steelhead conservation and catch-and-release practices, and he views his guiding as both a livelihood and a form of cultural stewardship for the rivers that have sustained his people for millennia.",
    specialties: [
      "Wild steelhead on the swing",
      "Spey casting instruction",
      "Skeena watershed specialist",
      "Traditional Spey fly tying",
      "Jet boat access",
      "Fall and summer steelhead",
      "First Nations cultural perspective",
    ],
    yearsExperience: 17,
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-skeena", "river-dean", "river-elk-river-bc"],
    dailyRate: "$700 CAD/day (1-2 anglers)",
    metaTitle: "Owen Blackwater — Skeena Steelhead Fly Fishing Guide, BC",
    metaDescription:
      "Indigenous fly fishing guide on BC's Skeena River system. Wild steelhead swinging, Spey casting, and cultural connection to the greatest steelhead rivers on Earth.",
  },
  // ─── BAHAMAS ───────────────────────────────────────────────────────
  {
    id: "guide-andros-bonefish-guide",
    slug: "andros-bonefish-guide",
    name: "Prescott Rolle — Andros Island Bonefishing",
    destinationId: "dest-bahamas",
    bio:
      "Prescott Rolle is a Bahamian bonefishing guide born and raised on Andros Island, the largest island in the Bahamas and home to some of the most extensive and productive bonefish flats in the Caribbean. Prescott learned to pole a skiff and spot bonefish from his uncle, one of the original guides on Andros's west side, and he has been guiding professionally for twenty-two years. His knowledge of the tides, seasonal fish movements, and bottom contours of southern Andros is virtually unmatched, and his ability to spot bonefish at extreme distances in varying light conditions has become the stuff of legend among returning clients.\n\nPrescott's guiding style is calm, encouraging, and focused on putting his clients in the best possible position for a successful cast. He understands that many visiting anglers are experiencing their first bonefishing trip, and he adjusts his coaching and expectations accordingly without ever sacrificing the quality of the fishing experience. For experienced flats anglers, Prescott accesses remote creeks and backcountry flats where trophy bonefish exceeding eight pounds cruise in small pods, demanding precise casts and stealthy approaches.\n\nBeyond bonefish, Prescott is skilled at targeting barracuda, jack crevalle, and the occasional permit that venture onto the flats around Andros. He builds his own custom flats skiff, a point of pride that reflects the deep boat-building tradition of the Bahamian Out Islands.",
    specialties: [
      "Bonefish specialist",
      "Trophy bonefish pursuit",
      "Backcountry creek fishing",
      "Barracuda and jack crevalle",
      "Beginner bonefishing instruction",
      "Custom-built flats skiff",
      "Tide and flat reading",
    ],
    yearsExperience: 22,
    photoUrl:
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-andros-flats", "river-abaco-flats"],
    dailyRate: "$600/day (1-2 anglers)",
    metaTitle: "Prescott Rolle — Andros Island Bonefish Guide, Bahamas",
    metaDescription:
      "Expert Bahamian bonefish guide on Andros Island. Twenty-two years of experience on the world's best bonefish flats with custom-built skiff.",
  },
  // ─── ICELAND ───────────────────────────────────────────────────────
  {
    id: "guide-iceland-salmon-guide",
    slug: "iceland-salmon-guide",
    name: "Gudmundur Sigurdsson — Iceland Fly Fishing",
    destinationId: "dest-iceland",
    bio:
      "Gudmundur Sigurdsson — known to his clients simply as Gummi — is one of Iceland's most experienced and sought-after salmon and trout fishing guides. Based in Akureyri in northern Iceland, Gummi has spent twenty-four years guiding on the volcanic rivers that drain toward the Arctic Ocean, waters that produce some of the finest Atlantic salmon and brown trout fishing in the subarctic world. His primary rivers include the Laxa i Myvatn, Midfjardara, and several smaller streams that he has developed relationships with over decades of careful stewardship and negotiation with local landowners.\n\nIcelandic salmon fishing operates on a beat rotation system, and Gummi's deep knowledge of each pool on his rivers — their holding lies, optimal water heights, and the specific fly patterns that have historically produced on each beat — gives his clients a significant advantage. He favors traditional presentation methods, swinging small flies on floating or intermediate lines through the tail of each pool, a technique that demands patience and casting skill but produces heart-stopping takes from fresh-run Atlantic salmon averaging eight to fifteen pounds.\n\nGummi is equally passionate about the brown trout fishing on the Laxa i Myvatn, where the river's extraordinary insect life supports trout that feed selectively on the surface throughout the endless Icelandic summer days. His dry-fly fishing for large Laxa browns, conducted under the midnight sun with visibility stretching to the volcanic horizons, represents one of the most magical experiences available in the Northern Hemisphere.",
    specialties: [
      "Atlantic salmon fishing",
      "Icelandic brown trout",
      "Beat rotation systems",
      "Small fly techniques",
      "Midnight sun fishing",
      "Spey and single-hand casting",
      "Icelandic river etiquette",
    ],
    yearsExperience: 24,
    photoUrl:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-laxa-myvatn", "river-midfjardara"],
    dailyRate: "$1,200/day (includes beat rod fee)",
    metaTitle: "Gudmundur Sigurdsson — Iceland Atlantic Salmon Fly Fishing Guide",
    metaDescription:
      "Premier Icelandic fly fishing guide for Atlantic salmon and brown trout. Expert guiding on the Laxa i Myvatn and Midfjardara rivers under the midnight sun.",
  },
  // ─── CHILE ─────────────────────────────────────────────────────────
  {
    id: "guide-chile-patagonia-guide",
    slug: "chile-patagonia-guide",
    name: "Rodrigo Sandoval — Patagonia Chile Fly Fishing",
    destinationId: "dest-chile",
    bio:
      "Rodrigo Sandoval is a Chilean fly fishing guide who has spent sixteen years exploring and guiding on the rivers of the Aysen Region, the wild heart of Chilean Patagonia. Operating from the small town of Coyhaique along the Carretera Austral, Rodrigo provides access to a vast network of rivers, spring creeks, and lakes that hold healthy populations of rainbow and brown trout in settings of almost incomprehensible natural beauty. The rivers of Chilean Patagonia are younger fisheries than their Argentine counterparts, and many of the streams Rodrigo fishes receive so few visiting anglers that the trout have little wariness of flies, creating opportunities for truly explosive fishing.\n\nRodrigo specializes in float trips on the Rio Simpson and Rio Baker, two of the region's largest and most productive trout rivers, as well as hike-in excursions to hidden spring creeks and backcountry streams that flow through old-growth lenga beech forest beneath the snowcapped Andes. His float trips combine outstanding fishing with the visual spectacle of glacial rivers cutting through basalt canyons and temperate rainforest, a landscape that rivals anything in New Zealand or the Canadian Rockies for sheer dramatic impact.\n\nA trained ecologist before he became a full-time guide, Rodrigo brings a scientific perspective to his river observations and is actively involved in monitoring trout populations and aquatic insect communities across the Aysen watershed. He guides in English, Spanish, and Portuguese.",
    specialties: [
      "Rio Baker and Simpson float trips",
      "Backcountry spring creek fishing",
      "Dry fly and nymph techniques",
      "Streamer fishing for large browns",
      "Multi-day wilderness trips",
      "Trilingual guiding (English/Spanish/Portuguese)",
      "Ecological interpretation",
    ],
    yearsExperience: 16,
    photoUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-rio-baker", "river-rio-simpson"],
    dailyRate: "$500/day (1-2 anglers)",
    metaTitle: "Rodrigo Sandoval — Chilean Patagonia Fly Fishing Guide",
    metaDescription:
      "Expert fly fishing guide in Chilean Patagonia. Float trips on the Rio Baker and Simpson, backcountry spring creeks, and wilderness expeditions along the Carretera Austral.",
  },
  // ─── BELIZE ────────────────────────────────────────────────────────
  {
    id: "guide-belize-flats-guide",
    slug: "belize-flats-guide",
    name: "Elton Garbutt — Belize Saltwater Fly Fishing",
    destinationId: "dest-belize",
    bio:
      "Elton Garbutt is a Belizean fly fishing guide whose family has fished the waters of the Turneffe Atoll and the Belize barrier reef for four generations. Growing up on the coast near Belize City, Elton learned to pole a skiff and read the flats from his grandfather, a commercial fisherman who transitioned into guiding as the sport fishing industry developed in Belize during the 1990s. Elton took up the guiding torch at age nineteen and has now logged fifteen years of professional service on some of the most productive saltwater flats in the Western Caribbean.\n\nElton's primary fishing grounds encompass the Turneffe Atoll, Lighthouse Reef, and the extensive mangrove-lined flats inside the barrier reef. His knowledge of the tidal flows, seasonal fish movements, and micro-habitats within these diverse ecosystems allows him to consistently find bonefish, permit, tarpon, and snook for his clients, often on flats that other guides overlook. He is particularly adept at targeting permit on the deeper sand-and-coral flats of the atoll's windward side, where these notoriously difficult fish feed on crabs and shrimp in water barely deep enough to cover their dorsal fins.\n\nElton builds many of his own crab and shrimp fly patterns, drawing on his intimate knowledge of the actual prey species found on the flats he fishes. His warm personality and genuine enthusiasm for sharing the beauty of Belize's marine environment make every trip feel like a fishing adventure with a knowledgeable friend rather than a commercial guiding transaction.",
    specialties: [
      "Permit on the fly",
      "Bonefish flats",
      "Tarpon in the channels",
      "Turneffe Atoll specialist",
      "Snook in the mangroves",
      "Custom crab fly patterns",
      "Grand slam pursuit",
    ],
    yearsExperience: 15,
    photoUrl:
      "https://images.unsplash.com/photo-1587502537745-84b7d66a8f97?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-belize-flats"],
    dailyRate: "$550/day (1-2 anglers)",
    metaTitle: "Elton Garbutt — Belize Saltwater Fly Fishing Guide",
    metaDescription:
      "Expert Belizean fly fishing guide on the Turneffe Atoll. Permit, bonefish, tarpon, and snook on the Caribbean's most productive flats.",
  },
  // ─── SCOTLAND ──────────────────────────────────────────────────────
  {
    id: "guide-spey-ghillie",
    slug: "spey-ghillie",
    name: "Alistair Grant — River Spey Ghillie",
    destinationId: "dest-scotland",
    bio:
      "Alistair Grant is a third-generation ghillie on the River Spey, carrying forward a family tradition of riverkeeping and salmon fishing that stretches back to the early twentieth century in the Scottish Highlands. Born and raised in Aberlour, Alistair has tended the middle beats of the Spey for twenty-eight years, maintaining the riverbanks, managing the fish stocks, and guiding visiting rods through the pools and runs that his grandfather first fished as a young apprentice ghillie. His knowledge of the Spey is not merely extensive but ancestral, woven into the fabric of a life lived entirely on and around one of Scotland's greatest salmon rivers.\n\nAlistair is widely regarded as one of the finest Spey casting instructors in Scotland, a distinction that carries considerable weight on the river that gave the technique its name. He can diagnose and correct casting faults in minutes, transforming a struggling angler's presentation from a tangled mess into an elegant, fishable cast that covers the water with authority. His teaching draws on the traditional Scottish school of Spey casting while incorporating modern line technologies and casting mechanics, producing a style that is both beautiful to watch and devastatingly effective at presenting a fly to running salmon.\n\nBeyond the Spey, Alistair guides on the River Tay for autumn salmon and advises visiting anglers on other Scottish salmon rivers. He is also a single malt whisky enthusiast whose knowledge of Speyside distilleries rivals his knowledge of salmon pools.",
    specialties: [
      "Atlantic salmon fishing",
      "Spey casting mastery",
      "Traditional ghillie service",
      "Beat management and riverkeeping",
      "Salmon fly selection",
      "Speyside whisky expertise",
      "River Tay autumn salmon",
    ],
    yearsExperience: 28,
    photoUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-river-spey", "river-river-tay"],
    dailyRate: "£450/day (1-2 rods, beat fee additional)",
    metaTitle: "Alistair Grant — River Spey Ghillie & Salmon Fishing Guide, Scotland",
    metaDescription:
      "Third-generation ghillie on Scotland's River Spey. Atlantic salmon fishing, expert Spey casting instruction, and Highland tradition on the birthplace of Spey casting.",
  },
  // ─── SLOVENIA ──────────────────────────────────────────────────────
  {
    id: "guide-soca-marble-trout-guide",
    slug: "soca-marble-trout-guide",
    name: "Luka Zupancic — Soca Valley Fly Fishing",
    destinationId: "dest-slovenia",
    bio:
      "Luka Zupancic is a Slovenian fly fishing guide who has dedicated his career to the rivers of the Julian Alps, specializing in the pursuit of marble trout — a genetically distinct and critically endangered salmonid found only in the Adriatic drainage of Slovenia and northeastern Italy. Luka grew up in the village of Tolmin at the confluence of the Soca and Tolminka rivers, and the emerald waters of these alpine streams have been his classroom and his obsession since childhood. With fourteen years of professional guiding, he is one of the most knowledgeable marble trout specialists working in Slovenia today.\n\nMarble trout fishing requires a fundamentally different approach than most trout fishing. The Soca's extraordinary clarity means that fish can detect an angler's presence from considerable distance, demanding cautious approaches, long leaders, and precise first casts. Luka coaches his clients through every step of the stalk, from initial fish detection through final presentation, and his patient, encouraging style helps nervous anglers manage the pressure of casting to a rare and beautiful fish in water so clear it feels like fishing in an aquarium.\n\nLuka holds all required Slovenian fishing licenses and arranges the daily and special permits needed to fish for marble trout, navigating a regulatory system that is among the most conservation-oriented in Europe. He also guides on the Idrijca, Unec, and other Slovenian rivers for brown and rainbow trout, and he leads multi-day fishing tours that combine alpine fishing with Slovenian wine tasting and cultural excursions.",
    specialties: [
      "Marble trout specialist",
      "Soca River expert",
      "Sight fishing in clear water",
      "Dry fly and nymph techniques",
      "Slovenian fishing permits",
      "Multi-day fishing tours",
      "Conservation-focused guiding",
    ],
    yearsExperience: 14,
    photoUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-soca-river"],
    dailyRate: "€350/day (1-2 anglers, permits additional)",
    metaTitle: "Luka Zupancic — Soca River Marble Trout Guide, Slovenia",
    metaDescription:
      "Specialist fly fishing guide for marble trout on Slovenia's Soca River. Sight-fishing in crystal-clear alpine water with expert local knowledge and permit assistance.",
  },
  // ─── JAPAN ─────────────────────────────────────────────────────────
  {
    id: "guide-japan-tenkara-guide",
    slug: "japan-tenkara-guide",
    name: "Takeshi Yamamoto — Japan Tenkara Fly Fishing",
    destinationId: "dest-japan",
    bio:
      "Takeshi Yamamoto is a Japanese tenkara master and fly fishing guide who divides his time between the mountain streams of central Honshu and the spring-fed rivers of Kyushu, bringing over two decades of experience to a guiding practice that bridges the traditions of Japanese fixed-line fishing and the Western fly fishing world. Takeshi trained under a tenkara master in the mountains of Gifu Prefecture, learning the art of kebari (Japanese wet fly) tying, stream reading, and the subtle manipulations of a fixed-line presentation that distinguish expert tenkara from the casual practice that has become popular internationally.\n\nTakeshi guides on the Nagara River and its mountain tributaries for native amago trout, as well as in the granite gorges of the Japanese Alps where iwana (Japanese char) hold in plunge pools beneath waterfalls and moss-covered boulders. His guided trips combine outstanding fishing with a cultural immersion that includes riverside lunches of onigiri and miso soup, discussions of Japanese river ecology, and visits to the remote mountain villages where tenkara has been practiced for centuries.\n\nFor Western fly fishers accustomed to reels and running line, Takeshi also offers guided trips using conventional fly tackle adapted to Japanese mountain streams, demonstrating how the two traditions complement each other. He is fluent in English, having spent several years guiding in Montana before returning to Japan, and his ability to translate between fishing cultures makes him an invaluable bridge for international anglers seeking an authentic Japanese fishing experience.",
    specialties: [
      "Tenkara master",
      "Japanese mountain stream fishing",
      "Amago and iwana trout",
      "Kebari fly tying",
      "Cultural fishing excursions",
      "Western fly fishing adaptation",
      "Bilingual guiding (English/Japanese)",
    ],
    yearsExperience: 21,
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-nagara-river"],
    dailyRate: "¥45,000/day (1-2 anglers)",
    metaTitle: "Takeshi Yamamoto — Japan Tenkara & Fly Fishing Guide",
    metaDescription:
      "Japanese tenkara master and fly fishing guide. Guided mountain stream fishing for amago and iwana in Gifu Prefecture with cultural immersion and bilingual service.",
  },
  // ─── CHRISTMAS ISLAND ──────────────────────────────────────────────
  {
    id: "guide-christmas-island-guide",
    slug: "christmas-island-guide",
    name: "Moamoa Teata — Kiritimati Flats Guide",
    destinationId: "dest-christmas-island",
    bio:
      "Moamoa Teata is an I-Kiribati fishing guide who has spent his entire life on Kiritimati (Christmas Island), the world's largest coral atoll, where he guides visiting fly fishers across the immense flats that harbor one of the greatest concentrations of bonefish found anywhere on the planet. Moamoa learned to read the flats from his father, a traditional fisherman who taught him the tidal patterns, fish behavior, and navigational landmarks of the atoll's vast lagoon system long before international anglers discovered the island's extraordinary fly fishing potential.\n\nMoamoa's guiding focuses on wading the firm coral-sand flats that extend for miles around the atoll's interior lagoon. His eyesight is remarkable even by the standards of Pacific Island guides, and he routinely spots schools of bonefish and individual trophy fish at distances that leave visiting anglers squinting in disbelief. Beyond bonefish, Moamoa is adept at targeting giant trevally on the atoll's oceanside reef edges, a pursuit that demands heavy tackle, precise timing, and nerves of steel as these powerful predators crash through the surf line to attack baitfish and crabs.\n\nMoamoa also guides for milkfish, triggerfish, and bluefin trevally — species that have helped establish Christmas Island as a multi-species saltwater fly fishing destination rather than simply a bonefish factory. His intimate knowledge of the atoll's many distinct flat systems allows him to match each day's fishing to conditions, ensuring that anglers are always positioned on the most productive water.",
    specialties: [
      "Bonefish specialist",
      "Giant trevally on the fly",
      "Milkfish targeting",
      "Triggerfish stalking",
      "Wade fishing on coral flats",
      "Tide and flat reading",
      "Multi-species saltwater",
    ],
    yearsExperience: 18,
    photoUrl:
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-christmas-island-flats"],
    dailyRate: "$400/day (1-2 anglers)",
    metaTitle: "Moamoa Teata — Christmas Island Bonefish & GT Guide",
    metaDescription:
      "Expert I-Kiribati fly fishing guide on Christmas Island. World-class bonefishing, giant trevally, and multi-species flats fishing on the world's largest coral atoll.",
  },
  // ─── SEYCHELLES ────────────────────────────────────────────────────
  {
    id: "guide-seychelles-flats-guide",
    slug: "seychelles-flats-guide",
    name: "Keith Rose-Innes — Alphonse Flats Guide",
    destinationId: "dest-seychelles",
    bio:
      "Keith Rose-Innes is a South African-born fly fishing guide who has spent the past twelve years based in the Seychelles Outer Islands, guiding on the pristine coral flats of Alphonse, St. Francois, and Bijoutier atolls. Before relocating to the Seychelles, Keith guided for trout in South Africa's Western Cape and for tiger fish in Zimbabwe, but it was the Seychelles' combination of extraordinary fishing, marine conservation, and remote tropical beauty that captured his imagination and ultimately defined his career. He is now recognized as one of the most accomplished and innovative saltwater flats guides working in the Indian Ocean.\n\nKeith's primary target is the giant trevally, a species that has become the marquee attraction of Seychelles fly fishing. These powerful predators, which can exceed a hundred pounds, patrol the reef edges and atoll channels, and presenting a fly to a charging GT is an adrenaline-charged experience that Keith orchestrates with the precision of a conductor. He is equally skilled at guiding for bonefish on the atoll's interior flats, where fish cruise in gin-clear water over white sand, and for the increasingly popular Indo-Pacific permit and milkfish that have drawn a new generation of adventurous anglers to these remote waters.\n\nKeith is an active contributor to the Alphonse Foundation's marine research program, assisting with fish tagging, population surveys, and reef health monitoring. His commitment to conservation is reflected in his strict catch-and-release guiding practice and his efforts to educate clients about the fragile ecosystems they are privileged to fish.",
    specialties: [
      "Giant trevally specialist",
      "Bonefish on coral flats",
      "Indo-Pacific permit",
      "Milkfish on the fly",
      "Trigger fish",
      "Marine conservation",
      "Catch-and-release advocacy",
    ],
    yearsExperience: 12,
    photoUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-alphonse-flats"],
    dailyRate: "Included in lodge package",
    metaTitle: "Keith Rose-Innes — Seychelles GT & Flats Fishing Guide",
    metaDescription:
      "Expert saltwater fly fishing guide in the Seychelles Outer Islands. Giant trevally, bonefish, and Indo-Pacific permit on the pristine flats of Alphonse Atoll.",
  },
  // ─── TASMANIA ──────────────────────────────────────────────────────
  {
    id: "guide-tasmania-highland-guide",
    slug: "tasmania-highland-guide",
    name: "Daniel Hackett — Tasmania Highland Fly Fishing",
    destinationId: "dest-tasmania",
    bio:
      "Daniel Hackett is a Tasmanian fly fishing guide who has spent twenty years perfecting the art of sight-fishing for wild brown trout in the glacial lakes and tannin-stained rivers of Tasmania's Central Highlands. Born in Launceston, Daniel first encountered the Western Lakes as a teenager on a camping trip with his father, and the experience of spotting a large brown trout cruising through crystal-clear water over a pale sand bottom fundamentally altered the trajectory of his life. He abandoned his plans for university, apprenticed with a veteran guide, and has been stalking Tasmanian trout professionally ever since.\n\nTasmania's Western Lakes fishing is a unique discipline that demands exceptional eyesight, stealth, and casting accuracy. Daniel's approach involves driving or hiking to a series of highland lakes each day, scanning the shorelines and shallows with polarized glasses for feeding or cruising trout, then coaching his client through a single-cast opportunity that may not repeat if the fish is spooked. The challenge is immense, but the reward — landing a wild brown trout of three, four, or even five pounds in a pristine alpine setting that feels like the end of the Earth — makes every failed attempt worthwhile.\n\nDaniel also guides on the mainland rivers of northern Tasmania for resident brown and rainbow trout, and on the highland streams during the summer months when terrestrial insects draw trout to the surface. He holds a Tasmanian inland fisheries guiding license and is active in local conservation efforts to protect the highland lake ecosystems from invasive species.",
    specialties: [
      "Sight fishing for wild browns",
      "Polaroiding technique",
      "Highland lake specialist",
      "Terrestrial dry fly fishing",
      "4WD and hiking access",
      "Tasmanian river fishing",
      "Wilderness navigation",
    ],
    yearsExperience: 20,
    photoUrl:
      "https://images.unsplash.com/photo-1587502537745-84b7d66a8f97?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-western-lakes-tas"],
    dailyRate: "$650 AUD/day (1-2 anglers)",
    metaTitle: "Daniel Hackett — Tasmania Highland Fly Fishing Guide",
    metaDescription:
      "Expert Tasmanian fly fishing guide specializing in sight-fishing for wild brown trout in the Western Lakes. Polaroiding, highland access, and wilderness guiding.",
  },
  // ─── KAMCHATKA ─────────────────────────────────────────────────────
  {
    id: "guide-kamchatka-wilderness-guide",
    slug: "kamchatka-wilderness-guide",
    name: "Sergei Volkov — Kamchatka Wilderness Fishing",
    destinationId: "dest-kamchatka",
    bio:
      "Sergei Volkov is a Russian fly fishing guide and wilderness outfitter who has spent eighteen years leading expeditions into the volcanic river systems of the Kamchatka Peninsula, one of the most remote and biologically rich fishing destinations on the planet. A trained wildlife biologist before he became a full-time guide, Sergei brings a scientific perspective to a landscape that operates on an almost prehistoric scale — rivers packed with millions of spawning Pacific salmon, rainbow trout that attack mouse patterns with the ferocity of small predators, and Kamchatka brown bears that fish alongside anglers with an indifference born of abundant food and minimal human contact.\n\nSergei's guiding operations are based around helicopter-supported river camps on the Zhupanova and several other rivers in central Kamchatka. Each day, a helicopter ferries small groups of anglers to different rivers and tributaries, accessing water that may see only a handful of visitors per season. The fishing is extraordinary by any global standard: rainbow trout averaging eighteen to twenty-two inches are the daily bread, with fish exceeding twenty-six inches a realistic possibility on any given outing. Pacific salmon runs rotate through the rivers from June to October, with chinook, sockeye, coho, chum, and pink salmon each providing distinct fly fishing opportunities.\n\nSergei is fluent in English and manages the complex logistics of operating in one of the world's most inaccessible regions with practiced efficiency. He is passionate about Kamchatka's conservation and works with international organizations to promote sustainable fishing tourism as an alternative to the extractive industries that threaten the peninsula's wilderness.",
    specialties: [
      "Trophy Kamchatka rainbows",
      "Helicopter fly-out fishing",
      "Five Pacific salmon species",
      "Mouse and streamer fishing",
      "Wilderness camp logistics",
      "Bear ecology and safety",
      "Bilingual guiding (English/Russian)",
    ],
    yearsExperience: 18,
    photoUrl:
      "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-zhupanova"],
    dailyRate: "$1,200/day (includes helicopter, 1-2 anglers)",
    metaTitle: "Sergei Volkov — Kamchatka Russia Fly Fishing Guide",
    metaDescription:
      "Expert fly fishing guide on Russia's Kamchatka Peninsula. Helicopter access to trophy rainbow trout and Pacific salmon on the Zhupanova River and remote volcanic rivers.",
  },
  // ─── TIERRA DEL FUEGO ──────────────────────────────────────────────
  {
    id: "guide-tierra-del-fuego-guide",
    slug: "tierra-del-fuego-guide",
    name: "Alejandro Fernandez — Rio Grande Sea Trout",
    destinationId: "dest-tierra-del-fuego",
    bio:
      "Alejandro Fernandez is an Argentine fly fishing guide who has devoted his career to the sea-run brown trout of the Rio Grande in Tierra del Fuego, the windswept island at the southern extremity of South America. For seventeen seasons, Alejandro has guided anglers from around the world on the Rio Grande's legendary pools and runs, where migratory brown trout of a size found nowhere else on Earth enter from the South Atlantic and ascend the river in waves from January through April. These fish, averaging eight to fourteen pounds with specimens regularly exceeding twenty, have made the Rio Grande the single most important sea-trout river in the modern fly fishing world.\n\nAlejandro is a Spey casting specialist whose fluid, powerful style has been refined by thousands of hours casting into the relentless Fuegian wind. He is patient and precise in his instruction, helping clients develop the casting mechanics needed to deliver large intruder-style flies across the Rio Grande's broad pools in conditions that would defeat a lesser teacher. His understanding of the river's holding water, combined with an intuitive sense for how sea trout respond to changing water conditions, light levels, and barometric pressure, consistently puts his clients into fish when other anglers are blanking.\n\nAlejandro ties all of his own sea-trout flies, designing patterns that incorporate the latest materials while drawing on decades of local knowledge about what triggers strikes from these powerful migratory fish. He is a quiet, focused guide whose intensity on the water is matched by his warmth and humor at the dinner table.",
    specialties: [
      "Sea-run brown trout specialist",
      "Spey casting in heavy wind",
      "Two-handed rod instruction",
      "Intruder and wet fly patterns",
      "Rio Grande beat fishing",
      "Custom fly tying",
      "Bilingual guiding (English/Spanish)",
    ],
    yearsExperience: 17,
    photoUrl:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-rio-grande-tdf"],
    dailyRate: "$600/day (1-2 anglers)",
    metaTitle: "Alejandro Fernandez — Tierra del Fuego Sea Trout Guide",
    metaDescription:
      "Expert fly fishing guide on the Rio Grande in Tierra del Fuego. Trophy sea-run brown trout, Spey casting instruction, and exclusive beat access on the world's premier sea-trout river.",
  },
  // ─── PHASE 3 ADDITIONS ──────────────────────────────────────────
  {
    id: "guide-paddy-moy",
    slug: "paddy-mcdonnell-moy-ghillie",
    name: "Paddy McDonnell — Moy Ghillie Service",
    destinationId: "dest-ireland",
    bio:
      "Paddy McDonnell is a third-generation ghillie on the River Moy whose family has guided salmon anglers on the river since his grandfather first started poling boats on Lough Conn in the 1950s. Growing up on the banks of Ireland's most prolific salmon river, Paddy learned to read the water before he could read a book, and his instinctive understanding of how salmon behave in the Moy's pools and runs under different water conditions is the product of a lifetime spent observing these extraordinary fish.\n\nPaddy specializes in guiding visiting anglers on both the main river salmon beats and the wild brown trout waters of Loughs Conn and Cullin. His approach combines traditional Irish methods — wet fly teams, Spey casting, and classic salmon fly patterns — with modern nymphing and dry fly techniques that he has adapted for Irish conditions. He is a patient and encouraging teacher who takes genuine pleasure in helping clients catch their first Atlantic salmon, whether that means coaching a beginner through the basics of a roll cast or helping an experienced angler refine their presentation on a technical pool.\n\nDuring the mayfly season in May and June, Paddy offers guided days on Lough Conn in his traditional lake boat, drifting the shallows with teams of wet flies and dry mayfly imitations for wild brown trout that can exceed five pounds. His knowledge of the lough's drift lines, reef structures, and mayfly congregation areas has been accumulated over decades and represents an irreplaceable local expertise.",
    specialties: [
      "Atlantic salmon fishing",
      "Wet fly and Spey casting",
      "Wild brown trout on loughs",
      "Mayfly season specialist",
      "Traditional lough-style fishing",
      "Beginner instruction",
      "Single and double-handed rod",
    ],
    yearsExperience: 30,
    photoUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-moy"],
    dailyRate: "$300/day (1-2 anglers)",
    metaTitle: "Paddy McDonnell — River Moy Salmon Ghillie",
    metaDescription:
      "Third-generation ghillie on Ireland's River Moy. Atlantic salmon, wild brown trout, and traditional Irish fly fishing in County Mayo.",
  },
  {
    id: "guide-alexei-ponoi",
    slug: "alexei-volkov-ponoi-guide",
    name: "Alexei Volkov — Ponoi River Guide",
    destinationId: "dest-kola-peninsula",
    bio:
      "Alexei Volkov has guided Atlantic salmon anglers on the Ponoi River for over twenty seasons, making him one of the most experienced guides working on Russia's Kola Peninsula. Born in Murmansk and trained in fisheries biology at the Northern Arctic Federal University, Alexei combines rigorous scientific knowledge of salmon behavior with the practical river craft that can only be gained through thousands of days on the water. His understanding of the Ponoi's pool structures, current dynamics, and seasonal fish movements allows him to consistently position his clients on taking fish, even during periods when other boats are struggling.\n\nAlexei is a master of the two-handed rod and an exceptionally skilled Spey casting instructor. He can diagnose and correct casting faults quickly, helping clients develop the smooth, efficient stroke needed to cover the Ponoi's broad pools effectively throughout a long Arctic day of fishing. His fly selection draws on two decades of experimentation, and his own patterns — tied during the long Murmansk winters — have accounted for some of the largest salmon caught on the river in recent seasons.\n\nBeyond his guiding expertise, Alexei contributes to the Ponoi River Company's salmon monitoring program, recording catch data, tagging fish, and participating in population surveys that inform the conservation management of this irreplaceable fishery. His commitment to the long-term health of the Ponoi's salmon runs is evident in every interaction with his clients, from his meticulous fish handling to his passionate advocacy for catch-and-release.",
    specialties: [
      "Atlantic salmon specialist",
      "Spey casting instruction",
      "Two-handed rod techniques",
      "Custom salmon fly patterns",
      "Fisheries biology background",
      "Salmon conservation",
      "Arctic conditions expertise",
    ],
    yearsExperience: 22,
    photoUrl:
      "https://images.unsplash.com/photo-1587502537745-84b7d66a8f97?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-ponoi"],
    dailyRate: "Included in camp package",
    metaTitle: "Alexei Volkov — Ponoi River Atlantic Salmon Guide",
    metaDescription:
      "Expert Atlantic salmon guide on Russia's Ponoi River. Over 20 seasons of Kola Peninsula experience with Spey casting instruction and conservation commitment.",
  },
  {
    id: "guide-bold-mongolia",
    slug: "bold-batbayar-mongolia-guide",
    name: "Bold Batbayar — Mongolia Taimen Specialist",
    destinationId: "dest-mongolia",
    bio:
      "Bold Batbayar is Mongolia's most experienced fly fishing guide, having spent eighteen years guiding international anglers on the remote rivers of northern Mongolia in pursuit of the legendary Siberian taimen. Born into a nomadic herding family in the Khentii Mountains, Bold grew up on the rivers where taimen have thrived for millennia, and his connection to the landscape and its wildlife runs deeper than any guidebook could convey. He transitioned from subsistence fishing to catch-and-release guiding in the mid-2000s and has since become a passionate advocate for taimen conservation, working with international organizations to protect the watersheds that sustain these magnificent fish.\n\nBold's river craft is extraordinary. He can read the water of a new stretch within minutes, identifying the logjams, undercut banks, and deep bends where taimen hold with an accuracy that borders on preternatural. His knowledge extends to every species in the system — he knows where the lenok pod up in the riffles, where the grayling feed in the glides, and where the largest taimen lurk in the deepest, most impenetrable pieces of structure. His casting instruction is patient and effective, helping anglers of all skill levels deliver the large, wind-resistant flies that taimen fishing demands.\n\nBold ties all of his own taimen flies, drawing on years of observation to create patterns that imitate the mice, marmots, and small fish that make up the taimen's diverse diet. His signature mouse pattern, tied with spun deer hair and trailing a rabbit strip tail, has accounted for dozens of taimen over forty inches and remains the most requested fly in his box.",
    specialties: [
      "Siberian taimen specialist",
      "Mouse pattern fishing",
      "Large streamer presentations",
      "Multi-species Mongolian rivers",
      "Wilderness navigation",
      "Conservation guiding",
      "Custom taimen fly patterns",
      "Float trip logistics",
    ],
    yearsExperience: 18,
    photoUrl:
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-eg-uur"],
    dailyRate: "Included in trip package",
    metaTitle: "Bold Batbayar — Mongolia Taimen Fishing Guide",
    metaDescription:
      "Mongolia's premier taimen guide. Eighteen years of experience on the Eg-Uur watershed pursuing the world's largest salmonid.",
  },
  {
    id: "guide-carlos-cuba",
    slug: "carlos-garcia-cuba-guide",
    name: "Carlos Garcia — Cuban Saltwater Specialist",
    destinationId: "dest-cuba",
    bio:
      "Carlos Garcia is one of Cuba's most skilled and sought-after saltwater fly fishing guides, a native of the Jardines de la Reina region who grew up on the waters of the archipelago and knows its channels, flats, and mangrove systems with the intimacy of a lifetime spent reading tides, wind, and the behavior of its remarkable fish populations. Carlos was among the first generation of Cuban guides to transition from commercial fishing to catch-and-release fly fishing guiding when the Jardines de la Reina marine protected area was established, and his deep understanding of the ecosystem's rhythms — from the seasonal movements of tarpon through the channels to the tidal patterns that push bonefish onto the interior flats — has made him one of the most consistently productive guides in the Caribbean.\n\nCarlos is a poling artist, propelling his skiff across the flats with silent precision that allows his anglers to approach bonefish, permit, and tarpon without spooking them. His eyes are legendary among visiting anglers — he spots fish at distances that seem impossible, calling out tailing bonefish, nervous water from cruising permit, and the subtle wakes of rolling tarpon with an accuracy that transforms every day on the water into a masterclass in saltwater observation. His permit record is particularly impressive, with a success rate that places him among the top guides working the Caribbean flats.\n\nBeyond his technical skills, Carlos brings a warmth and enthusiasm to every day on the water that is infectious. His limited English is supplemented by an expressive gestural vocabulary that communicates everything an angler needs to know — strip speed, casting direction, and the urgency of the situation — with clarity that transcends language barriers.",
    specialties: [
      "Bonefish flats fishing",
      "Permit specialist",
      "Tarpon in mangrove channels",
      "Grand slam pursuit",
      "Sight-casting on flats",
      "Skiff poling",
      "Jardines de la Reina expert",
      "Bilingual guiding (English/Spanish)",
    ],
    yearsExperience: 20,
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-jardines-de-la-reina"],
    dailyRate: "Included in trip package",
    metaTitle: "Carlos Garcia — Cuba Saltwater Fly Fishing Guide",
    metaDescription:
      "Expert saltwater fly fishing guide in Cuba's Jardines de la Reina. Bonefish, permit, and tarpon on the Caribbean's most pristine flats.",
  },
  {
    id: "guide-ibrahim-maldives",
    slug: "ibrahim-naseem-maldives-guide",
    name: "Ibrahim Naseem — Maldives GT Specialist",
    destinationId: "dest-maldives",
    bio:
      "Ibrahim Naseem is the Maldives' leading fly fishing guide, a native of the atolls who grew up fishing the channels and reef edges of the Indian Ocean before discovering the world of catch-and-release fly fishing through visiting international anglers in the early 2010s. His transformation from a commercial fisherman to a conservation-minded fly fishing guide represents a broader shift in the Maldivian fishing community, and Ibrahim has become an ambassador for sustainable fishing practices throughout the archipelago.\n\nIbrahim's knowledge of the Maldivian atolls is encyclopedic. He understands the complex relationship between moon phases, tidal flows, seasonal currents, and the movements of giant trevally, bluefin trevally, and other predators through the atoll systems in a way that only a lifetime of observation can produce. His ability to predict where GTs will be feeding on any given day — based on the tide, the time of month, and subtle environmental cues that escape less experienced eyes — gives his clients a significant advantage in targeting these powerful, often elusive fish.\n\nIbrahim has developed fly patterns specifically for Maldivian GTs, incorporating bright flash materials and oversized profiles that trigger aggressive strikes in the turquoise waters of the atoll channels. He is also an accomplished bonefisher, guiding clients to the subtle white sand and seagrass flats inside the atolls where Maldivian bonefish, though smaller than their Caribbean counterparts, provide fast action and excellent sight-fishing opportunities.",
    specialties: [
      "Giant trevally specialist",
      "Bluefin trevally fishing",
      "Atoll channel fishing",
      "Bonefish on tropical flats",
      "Triggerfish targeting",
      "Custom GT fly patterns",
      "Tidal and moon phase knowledge",
      "Catch-and-release advocacy",
    ],
    yearsExperience: 12,
    photoUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", // PLACEHOLDER
    riverIds: ["river-north-male-atoll"],
    dailyRate: "Included in trip package",
    metaTitle: "Ibrahim Naseem — Maldives GT Fly Fishing Guide",
    metaDescription:
      "The Maldives' premier fly fishing guide. Giant trevally, bluefin trevally, and tropical species on pristine Indian Ocean atolls.",
  },
];
