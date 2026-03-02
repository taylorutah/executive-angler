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
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // PLACEHOLDER
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
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
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
  // ─── WYOMING ───────────────────────────────────────────────────────
  {
    id: "lodge-snake-river-sporting-club",
    slug: "snake-river-sporting-club",
    name: "Snake River Sporting Club Lodge",
    destinationId: "dest-wyoming",
    description:
      "Snake River Sporting Club Lodge occupies a privileged stretch of private land along the South Fork of the Snake River in Jackson Hole, Wyoming, providing guests with unmatched access to one of the most productive cutthroat trout fisheries in the Rocky Mountain West. The lodge sits at the intersection of towering Teton views and meandering cottonwood-lined riverbanks, where anglers can step out of their cabin and be knee-deep in productive riffles within minutes. The property encompasses several miles of private water that receives minimal fishing pressure, allowing resident Snake River fine-spotted cutthroat trout to grow to impressive sizes and feed with confidence throughout the season.\n\nAccommodations are designed around a philosophy of Western sophistication without pretension. Timber-frame cabins feature heated floors, deep soaking tubs, and floor-to-ceiling windows framing the Tetons. The culinary program draws on the bounty of the Greater Yellowstone region, with elk tenderloin, local greens, and freshwater accompaniments appearing regularly on the rotating dinner menu. A full-service guide operation coordinates daily outings on both private and public water, offering float trips through the Snake River canyon and wade fishing excursions into the backcountry of Grand Teton National Park.\n\nBeyond the fishing, the club offers sporting clays, horseback riding through alpine meadows, and naturalist-led wildlife safaris into the Teton and Yellowstone ecosystems. The town of Jackson is a short drive away, providing access to art galleries, fine dining, and the vibrant cultural life of one of the West's most storied mountain communities.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1518602164578-cd0074062767?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 43.4799,
    longitude: -110.7624,
    priceRange: "$1,200-2,200/night",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "October",
    capacity: 30,
    amenities: [
      "Private water access",
      "Guided fly fishing",
      "All meals included",
      "Sporting clays",
      "Horseback riding",
      "Wildlife safaris",
      "Timber-frame cabins",
      "Teton views",
      "Fly shop on site",
      "Casting instruction",
    ],
    nearbyRiverIds: ["river-snake-river", "river-firehole"],
    averageRating: 4.8,
    reviewCount: 34,
    metaTitle: "Snake River Sporting Club Lodge | Jackson Hole Fly Fishing",
    metaDescription:
      "Exclusive fly fishing lodge in Jackson Hole, Wyoming with private Snake River access, luxury cabins, and guided trips amid the Teton Range.",
    featured: true,
  },
  // ─── COLORADO ──────────────────────────────────────────────────────
  {
    id: "lodge-taylor-creek-lodge",
    slug: "taylor-creek-lodge",
    name: "Taylor Creek Lodge",
    destinationId: "dest-colorado",
    description:
      "Taylor Creek Lodge sits in the heart of the Colorado Rockies near the town of Basalt, providing anglers with a purpose-built base for exploring the legendary Frying Pan River tailwater and the broader Roaring Fork Valley. The lodge was conceived by a group of dedicated fly fishers who wanted to create the kind of intimate, knowledgeable, and welcoming operation that they themselves would want to visit. Every aspect of the property reflects this angler-first ethos, from the rod racks and wader drying stations in each room to the streamside evening hatch briefings conducted by the head guide each afternoon.\n\nThe Frying Pan River, flowing from the tailwater below Ruedi Reservoir, is one of the premier year-round trout fisheries in the American West. Its consistent cold-water flows support an extraordinary density of rainbow and brown trout, with fish averaging fourteen to sixteen inches and genuine trophies exceeding twenty-four inches taken each season. Taylor Creek Lodge's guide team knows every pool, seam, and undercut bank on the Frying Pan, and they rotate clients through both the heavily fished Gold Medal water near the dam and the more secluded stretches farther downstream. Guided excursions to the South Platte, Arkansas, and Roaring Fork rivers are also available for guests wanting to explore Colorado's broader trout fishing portfolio.\n\nThe lodge accommodates sixteen guests in eight well-appointed rooms, and the dining program features hearty mountain cuisine designed to fuel long days on the water. A covered porch overlooks the river valley, providing the ideal setting for post-fishing reflection and camaraderie among fellow anglers.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1470770841497-7b3200c60053?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1470770841497-7b3200c60053?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 39.3686,
    longitude: -106.8428,
    priceRange: "$500-900/night",
    priceTier: 3,
    seasonStart: "March",
    seasonEnd: "November",
    capacity: 16,
    amenities: [
      "Guided fly fishing",
      "Wader drying stations",
      "Rod storage",
      "Evening hatch briefings",
      "All meals included",
      "Covered riverside porch",
      "Fly tying room",
      "Casting instruction",
    ],
    nearbyRiverIds: ["river-frying-pan", "river-south-platte", "river-arkansas-co"],
    averageRating: 4.6,
    reviewCount: 53,
    metaTitle: "Taylor Creek Lodge | Frying Pan River Fly Fishing Lodge, Colorado",
    metaDescription:
      "Intimate fly fishing lodge near Basalt, Colorado with expert-guided trips on the Frying Pan, South Platte, and Arkansas rivers. All-inclusive angler-focused experience.",
    featured: true,
  },
  // ─── IDAHO ─────────────────────────────────────────────────────────
  {
    id: "lodge-henrys-fork-lodge",
    slug: "henrys-fork-lodge",
    name: "Henry's Fork Lodge",
    destinationId: "dest-idaho",
    description:
      "Henry's Fork Lodge is a revered name among serious fly fishers worldwide, positioned on the banks of the Henry's Fork of the Snake River in Island Park, Idaho. The lodge overlooks the famous Railroad Ranch section, a stretch of flat, glassy spring creek water that demands the highest level of technical fly fishing skill and rewards those who possess it with some of the largest and most selective rainbow trout in the Western United States. For decades, this lodge has served as a gathering place for the sport's most accomplished practitioners, drawn by the challenge of presenting tiny dry flies to sipping trout in impossibly clear water.\n\nThe lodge itself balances comfort with a focus that never strays far from the river. Spacious rooms look out over the Henry's Fork, and guests can observe rising trout from the dining room during the legendary evening hatches of June and July. The culinary program is refined without being fussy, emphasizing fresh ingredients and generous portions. A well-stocked fly shop on the premises carries the specialized leaders, tippet, and fly patterns that the Henry's Fork demands, and the guiding staff includes some of the most experienced technical dry-fly anglers in the profession.\n\nGuided trips extend beyond the Railroad Ranch to include the Box Canyon, Warm River, and upper stretches of the Henry's Fork, as well as excursions to nearby Silver Creek and the South Fork of the Snake. The lodge's season is deliberately short, running from mid-June through September, timed to coincide with the river's peak insect activity and the arrival of its most dedicated anglers.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 44.4219,
    longitude: -111.3728,
    priceRange: "$900-1,600/night",
    priceTier: 4,
    seasonStart: "June",
    seasonEnd: "September",
    capacity: 18,
    amenities: [
      "Riverside location",
      "Guided fly fishing",
      "On-site fly shop",
      "All meals included",
      "Casting instruction",
      "Wader and gear storage",
      "Fly tying stations",
      "Evening hatch viewing",
    ],
    nearbyRiverIds: ["river-henry-s-fork", "river-silver-creek", "river-south-fork-boise"],
    averageRating: 4.8,
    reviewCount: 61,
    metaTitle: "Henry's Fork Lodge | Premier Idaho Fly Fishing Lodge",
    metaDescription:
      "Iconic fly fishing lodge on the Henry's Fork in Island Park, Idaho. Technical dry-fly fishing for trophy rainbows, expert guides, and all-inclusive riverside accommodations.",
    featured: true,
  },
  // ─── ALASKA ────────────────────────────────────────────────────────
  {
    id: "lodge-bristol-bay-sportfishing",
    slug: "bristol-bay-sportfishing",
    name: "Bristol Bay Sportfishing Lodge",
    destinationId: "dest-alaska",
    description:
      "Bristol Bay Sportfishing Lodge operates from a remote compound on the shores of Lake Iliamna in southwestern Alaska, placing guests at the epicenter of the most prolific wild salmon and trout fishery on the planet. The lodge is accessible only by floatplane from Anchorage, a journey that strips away the trappings of modern life and delivers anglers into a landscape of volcanic peaks, tundra meadows, and crystal rivers teeming with fish. From late June through September, the rivers surrounding Bristol Bay receive successive runs of all five Pacific salmon species, attracting enormous concentrations of rainbow trout, Dolly Varden, Arctic char, and Arctic grayling that feed aggressively on the salmon eggs and flesh drifting through the current.\n\nDaily fishing excursions launch by floatplane from the lodge's private dock, carrying small groups of anglers to a rotating selection of remote rivers and streams that may see only a handful of visiting fishers each season. Guides specialize in matching the day's destination to current run timing and weather conditions, ensuring clients experience the best available fishing each morning. Whether swinging mouse patterns for leopard rainbow trout on a nameless tundra creek or sight-casting to pods of fresh silver salmon in an estuary, the variety and quality of fishing available from Bristol Bay Lodge is virtually unmatched anywhere in the world.\n\nThe lodge accommodates twelve guests in comfortable cabins with modern amenities, and the dining program features Alaskan seafood, locally foraged ingredients, and hearty meals designed for anglers who have spent ten hours on the water. A sauna and outdoor hot tub provide welcome recovery after long days of wading cold rivers.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 59.3738,
    longitude: -155.1456,
    priceRange: "$1,800-3,500/night",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "September",
    capacity: 12,
    amenities: [
      "Floatplane access to remote rivers",
      "Guided fly fishing",
      "All meals included",
      "Private cabins",
      "Sauna and hot tub",
      "Fly tying stations",
      "Rod and wader rental",
      "Bear viewing excursions",
      "Photography workshops",
    ],
    nearbyRiverIds: ["river-bristol-bay", "river-kenai"],
    averageRating: 4.9,
    reviewCount: 42,
    metaTitle: "Bristol Bay Sportfishing Lodge | Alaska Fly Fishing Adventures",
    metaDescription:
      "Remote fly fishing lodge on Lake Iliamna, Alaska. Floatplane access to pristine Bristol Bay rivers for salmon, rainbow trout, and Arctic char. All-inclusive wilderness experience.",
    featured: true,
  },
  // ─── OREGON ────────────────────────────────────────────────────────
  {
    id: "lodge-steamboat-inn",
    slug: "steamboat-inn",
    name: "Steamboat Inn",
    destinationId: "dest-oregon",
    description:
      "Steamboat Inn occupies a storied bend of the North Umpqua River in the Cascade Mountains of southern Oregon, a location that has attracted fly fishers seeking wild summer steelhead since the 1930s. The inn sits directly above the Camp Water, a series of legendary named pools and runs that comprise some of the most hallowed steelhead fly water in the Pacific Northwest. Each pool carries decades of angling lore, and the privilege of swinging a fly through these currents at dawn, with old-growth Douglas fir towering overhead and mist rising from the jade-green river, represents one of fly fishing's most transcendent experiences.\n\nThe accommodations reflect the inn's heritage as a gathering place for passionate anglers. Streamside cabins perch above the river, and several have private decks where guests can watch steelhead rolling in the pools below. The main lodge houses a communal dining room where the evening Fisherman's Dinner has become a beloved tradition, bringing all guests together around a long table for a multi-course meal accompanied by conversation about the day's encounters on the river. The wine list draws from Oregon's celebrated Umpqua Valley vineyards.\n\nThe North Umpqua's fly-only, catch-and-release regulations ensure a quality experience, and the river's wild steelhead, averaging six to twelve pounds with occasional fish exceeding fifteen, are among the strongest and most acrobatic in the Pacific drainage. Guided trips on the Rogue and McKenzie rivers are arranged for guests seeking additional variety during their stay.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 43.3564,
    longitude: -122.7303,
    priceRange: "$300-600/night",
    priceTier: 3,
    seasonStart: "June",
    seasonEnd: "October",
    capacity: 20,
    amenities: [
      "Streamside cabins",
      "Fisherman's Dinner tradition",
      "Guided fly fishing",
      "Walk-wade access",
      "Fly-only water",
      "Oregon wine list",
      "Gear storage",
      "Hiking trails",
    ],
    nearbyRiverIds: ["river-rogue", "river-mckenzie", "river-deschutes"],
    averageRating: 4.7,
    reviewCount: 78,
    metaTitle: "Steamboat Inn | North Umpqua River Fly Fishing Lodge, Oregon",
    metaDescription:
      "Historic fly fishing lodge on the North Umpqua River in Oregon. Streamside cabins, legendary steelhead water, and the celebrated Fisherman's Dinner tradition since the 1930s.",
    featured: true,
  },
  // ─── PENNSYLVANIA ──────────────────────────────────────────────────
  {
    id: "lodge-limestone-springs-inn",
    slug: "limestone-springs-inn",
    name: "Limestone Springs Inn",
    destinationId: "dest-pennsylvania",
    description:
      "Limestone Springs Inn is a carefully restored colonial-era fieldstone manor nestled in the Cumberland Valley of south-central Pennsylvania, placing anglers within walking distance of the renowned Letort Spring Run and a short drive from Big Spring, Penns Creek, and a constellation of other storied limestone creeks that form the cradle of American fly fishing. The inn draws its name from the calcium-rich geological formations beneath the valley floor, the same geology that gives Pennsylvania's spring creeks their gin-clear water, stable temperatures, and extraordinary insect life that has tested and refined generations of fly fishers.\n\nThe property comprises six individually decorated guest rooms furnished with period antiques, each named for a notable figure in Pennsylvania fly fishing history. A full country breakfast is served each morning in the dining room, and the inn's library contains an extensive collection of fly fishing literature spanning two centuries. The innkeepers are accomplished anglers themselves, offering detailed guidance on current conditions, access points, and fly selection for each of the region's productive waters.\n\nGuided trips can be arranged through the inn's network of local professionals who specialize in the demanding technical fishing that Pennsylvania's spring creeks require. Sight-fishing to rising trout with size 20 sulfur duns on the Letort, drifting a tiny trico spinner through a pod of sipping browns on Big Spring, or prospecting the riffles of Penns Creek with an Elk Hair Caddis during the green drake hatch represent just a sampling of the experiences available from this exceptional base of operations.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1505916349660-8d91a382ae6e?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 40.2010,
    longitude: -77.2003,
    priceRange: "$250-450/night",
    priceTier: 2,
    seasonStart: "March",
    seasonEnd: "November",
    capacity: 12,
    amenities: [
      "Spring creek proximity",
      "Full breakfast included",
      "Fly fishing library",
      "Guide coordination",
      "Period antique furnishings",
      "Gear storage and rod room",
      "Garden and patio",
      "Fly tying station",
    ],
    nearbyRiverIds: ["river-letort-spring-run", "river-big-spring", "river-penns-creek"],
    averageRating: 4.5,
    reviewCount: 39,
    metaTitle: "Limestone Springs Inn | Pennsylvania Spring Creek Fly Fishing Lodge",
    metaDescription:
      "Colonial fieldstone inn in the Cumberland Valley near Letort Spring Run, Big Spring, and Penns Creek. The ideal base for Pennsylvania's legendary limestone creek fly fishing.",
    featured: false,
  },
  // ─── MICHIGAN ──────────────────────────────────────────────────────
  {
    id: "lodge-pere-marquette-river-lodge",
    slug: "pere-marquette-river-lodge",
    name: "Pere Marquette River Lodge",
    destinationId: "dest-michigan",
    description:
      "Pere Marquette River Lodge occupies a wooded bluff above one of Michigan's most celebrated trout and steelhead rivers, providing a year-round base for anglers pursuing the remarkable diversity of fishing opportunities in the northern Lower Peninsula. The lodge was built by a retired guide who understood precisely what traveling fly fishers need: clean, functional rooms with enough space to spread out gear, a drying room that actually works, a hot meal waiting at the end of a cold day on the water, and knowledgeable staff who can point you to the right stretch of river for the current conditions.\n\nThe Pere Marquette is a designated Wild and Scenic River, and its pristine sand-bottomed runs support healthy populations of resident brown and brook trout alongside seasonal runs of steelhead and Pacific salmon that enter the river from Lake Michigan. The lodge coordinates guided float trips in traditional Au Sable-style riverboats, a method of fishing the Pere Marquette that dates back more than a century and remains the most effective way to cover the river's long, wadeable flats and deep holding pools. In autumn, the lodge becomes a hub for steelhead and salmon anglers, with guides running Spey casting clinics and swinging flies through the river's classic steelhead runs.\n\nBeyond the Pere Marquette, the lodge arranges guided trips on the Au Sable and Manistee rivers, both within easy driving distance. The surrounding Huron-Manistee National Forest offers hiking, wildlife viewing, and a quietude that has drawn visitors to this part of Michigan for generations.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1587381420270-0a60ea89dfd0?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587381420270-0a60ea89dfd0?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 43.9436,
    longitude: -85.9533,
    priceRange: "$200-400/night",
    priceTier: 2,
    seasonStart: "April",
    seasonEnd: "November",
    capacity: 22,
    amenities: [
      "Guided float trips",
      "Gear drying room",
      "Hot meals",
      "Spey casting clinics",
      "Au Sable riverboat access",
      "Fly tying stations",
      "Rod and gear storage",
      "Hiking trail access",
    ],
    nearbyRiverIds: ["river-pere-marquette", "river-au-sable", "river-manistee"],
    averageRating: 4.4,
    reviewCount: 67,
    metaTitle: "Pere Marquette River Lodge | Michigan Trout & Steelhead Fishing",
    metaDescription:
      "Year-round fly fishing lodge on Michigan's Pere Marquette River. Guided float trips for trout, steelhead, and salmon in the Huron-Manistee National Forest.",
    featured: false,
  },
  // ─── ARKANSAS ──────────────────────────────────────────────────────
  {
    id: "lodge-white-river-trout-lodge",
    slug: "white-river-trout-lodge",
    name: "White River Trout Lodge",
    destinationId: "dest-arkansas",
    description:
      "White River Trout Lodge perches on a limestone bluff overlooking the legendary White River tailwater near the town of Cotter, Arkansas, positioning guests above one of the most productive trout fisheries in the Southern United States. The cold, nutrient-rich water released from Bull Shoals Dam creates an artificial tailwater environment that supports staggering numbers of rainbow and brown trout in a region where trout would not naturally survive. Fish densities on the upper White River are among the highest measured anywhere in North America, and trophy brown trout exceeding ten pounds are taken regularly by skilled anglers who understand the river's complex currents and prolific insect hatches.\n\nThe lodge operates as a complete fly fishing destination, with an in-house guide team that launches drift boats from the lodge's private ramp each morning. Guides specialize in the specific techniques that the White River demands, including deep nymphing through the heavy tailwater flows, streamer fishing for trophy browns in low-light conditions, and delicate dry-fly presentations during the river's remarkable midge and scud hatches that occur even in midwinter. The lodge's location near the confluence of the White and Norfork rivers means that two world-class tailwater fisheries are accessible within minutes.\n\nAccommodations include well-appointed riverfront cabins with private decks, and the lodge's screened dining pavilion serves Southern-accented cuisine with views of the river valley stretching toward the Ozark hills. The year-round fishery means the lodge operates twelve months, with some of the best fishing occurring during winter when other destinations are shuttered.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 36.3076,
    longitude: -92.5310,
    priceRange: "$250-500/night",
    priceTier: 2,
    seasonStart: "January",
    seasonEnd: "December",
    capacity: 20,
    amenities: [
      "Private boat ramp",
      "Guided drift boat trips",
      "Riverfront cabins",
      "All meals included",
      "Screened dining pavilion",
      "Rod and wader rental",
      "Fly shop on site",
      "Year-round operation",
    ],
    nearbyRiverIds: ["river-white-river-ar", "river-norfork", "river-little-red"],
    averageRating: 4.5,
    reviewCount: 84,
    metaTitle: "White River Trout Lodge | Arkansas Tailwater Fly Fishing",
    metaDescription:
      "Year-round fly fishing lodge on the White River near Cotter, Arkansas. Guided drift boat trips for trophy trout on two world-class tailwater fisheries.",
    featured: false,
  },
  // ─── FLORIDA KEYS ──────────────────────────────────────────────────
  {
    id: "lodge-islamorada-flats-lodge",
    slug: "islamorada-flats-lodge",
    name: "Islamorada Flats Lodge",
    destinationId: "dest-florida-keys",
    description:
      "Islamorada Flats Lodge is a purpose-built saltwater fly fishing operation located on the bay side of Islamorada, the self-proclaimed sportfishing capital of the world. The lodge caters exclusively to fly anglers pursuing the storied grand slam of the Florida Keys flats: bonefish, permit, and tarpon, three species that together represent the pinnacle of shallow-water fly fishing challenge. Each demands different tactics, different flies, and a different angling temperament, and the guides who operate from this lodge have devoted their careers to mastering the art of putting their clients within casting range of all three.\n\nThe lodge's fleet of technical poling skiffs launches each morning from a private dock into the vast network of turtle grass flats, mangrove shorelines, and tidal channels that make the Middle Keys one of the most productive saltwater fly fishing destinations on Earth. Spring brings massive schools of migrating tarpon that stage along the bridges and channels, providing shots at fish exceeding a hundred pounds. Summer and fall shift the focus to permit tailing on the oceanside flats and bonefish cruising the backcountry basins. The guides read tidal movements, wind patterns, and seasonal migrations with an intuition developed over decades on these waters.\n\nAccommodations are clean, comfortable, and entirely oriented toward the fishing lifestyle. A tackle room with rod storage, fly-tying benches, and a rigging station ensures that guests spend their evenings preparing for the next morning's pursuit rather than worrying about logistics.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 24.9243,
    longitude: -80.6274,
    priceRange: "$600-1,200/night",
    priceTier: 4,
    seasonStart: "January",
    seasonEnd: "December",
    capacity: 14,
    amenities: [
      "Technical poling skiffs",
      "Guided flats fishing",
      "Private dock",
      "Tackle room",
      "Rod storage",
      "Fly-tying stations",
      "Year-round fishing",
      "Airport transfers",
      "Casting instruction",
    ],
    nearbyRiverIds: ["river-florida-keys-flats"],
    averageRating: 4.7,
    reviewCount: 56,
    metaTitle: "Islamorada Flats Lodge | Florida Keys Fly Fishing for Tarpon, Bonefish & Permit",
    metaDescription:
      "Dedicated saltwater fly fishing lodge in Islamorada, Florida Keys. Expert guides for bonefish, permit, and tarpon on the legendary Keys flats year-round.",
    featured: true,
  },
  // ─── NEW ZEALAND ───────────────────────────────────────────────────
  {
    id: "lodge-tongariro-river-lodge",
    slug: "tongariro-river-lodge",
    name: "Tongariro River Lodge",
    destinationId: "dest-new-zealand",
    description:
      "Tongariro River Lodge commands a sweeping vista of the Tongariro River and the volcanic peaks of the central North Island, providing the definitive New Zealand fly fishing lodge experience in a setting of dramatic natural beauty. The lodge sits on the banks of New Zealand's most famous trout river, where large rainbow and brown trout — descendants of fish introduced from California and Scotland over a century ago — run upriver from Lake Taupo in numbers that still astonish visiting anglers accustomed to more pressured fisheries. The river's accessibility, combined with its extraordinary productivity, makes it the ideal centerpiece for a New Zealand fishing vacation.\n\nThe lodge accommodations reflect a distinctly New Zealand sensibility: understated elegance, native timber construction, and an emphasis on blending with the surrounding landscape rather than competing with it. Suites overlook the river, and the lodge's restaurant features contemporary New Zealand cuisine with an emphasis on local lamb, venison, and seafood. An extensive wine list showcases the country's celebrated Marlborough and Central Otago producers.\n\nGuided fishing from the lodge covers the Tongariro's diverse water types, from the heavy runs and deep pools of the lower river to the intimate pocket water of the upper gorge. Helicopter excursions to remote backcountry streams on the South Island can be arranged for guests seeking the ultimate sight-fishing experience — stalking individual trophy trout in crystalline water visible from altitude. The lodge also serves as a base for exploring Tongariro National Park, a UNESCO World Heritage Site, with its volcanic landscapes, alpine crossing tracks, and unique native bush.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1469521669194-babb45599def?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1469521669194-babb45599def?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1502003148287-a82ef80a6b2c?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80", // PLACEHOLDER
    ],
    latitude: -38.9920,
    longitude: 175.8025,
    priceRange: "$600-1,100/night",
    priceTier: 4,
    seasonStart: "October",
    seasonEnd: "April",
    capacity: 24,
    amenities: [
      "Riverside location",
      "Guided fly fishing",
      "Helicopter backcountry trips",
      "Restaurant and wine bar",
      "Casting instruction",
      "Gear storage",
      "National park access",
      "New Zealand wine list",
    ],
    nearbyRiverIds: ["river-tongariro", "river-mataura", "river-oreti"],
    averageRating: 4.6,
    reviewCount: 45,
    metaTitle: "Tongariro River Lodge | New Zealand Fly Fishing Lodge",
    metaDescription:
      "Premier fly fishing lodge on the Tongariro River, New Zealand. Trophy rainbow and brown trout, helicopter backcountry trips, and volcanic landscapes in the central North Island.",
    featured: true,
  },
  // ─── PATAGONIA ─────────────────────────────────────────────────────
  {
    id: "lodge-estancia-rio-grande",
    slug: "estancia-rio-grande",
    name: "Estancia Rio Grande",
    destinationId: "dest-patagonia",
    description:
      "Estancia Rio Grande is a working sheep ranch turned world-class fly fishing lodge on the banks of the Rio Grande in northern Patagonia, Argentina. The estancia controls private access to several kilometers of river that hold some of the largest sea-run brown trout found anywhere on Earth. Fish averaging eight to twelve pounds are commonplace, and each season produces specimens exceeding twenty pounds — migratory brown trout of a size that exists in the modern angling world only in the rivers of Patagonia and Tierra del Fuego. The fishing is conducted almost exclusively by Spey casting or two-handed rod techniques, swinging large wet flies through the river's broad pools and deep runs.\n\nThe lodge occupies the original estancia homestead, a whitewashed adobe structure surrounded by Lombardy poplars that provide welcome shelter from the Patagonian wind. The interior has been thoughtfully renovated to provide comfortable accommodations without sacrificing the building's authentic gaucho heritage. Thick walls, hardwood floors, and wood-burning stoves create a warm refuge after long days on the wind-swept river. The dining program is centered around the Argentine tradition of the asado, with whole lambs roasted over open coals accompanied by Malbec from the Mendoza region.\n\nThe lodge's guide team includes several former national casting champions who bring deep technical knowledge to the art of Spey casting in Patagonian conditions. Wind is a constant companion here, and guides work closely with clients to refine their casting mechanics and line management, ensuring that when a massive sea-run brown materializes in the current, the angler is prepared to deliver the fly.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80", // PLACEHOLDER
    ],
    latitude: -40.4712,
    longitude: -70.9456,
    priceRange: "$800-1,500/night",
    priceTier: 4,
    seasonStart: "November",
    seasonEnd: "April",
    capacity: 10,
    amenities: [
      "Private river access",
      "Spey casting instruction",
      "Guided fishing",
      "Traditional asado dining",
      "Argentine wine program",
      "Working estancia experience",
      "Gear storage and drying",
      "Airport transfers from Neuquen",
    ],
    nearbyRiverIds: ["river-rio-grande-ar", "river-rio-malleo"],
    averageRating: 4.8,
    reviewCount: 31,
    metaTitle: "Estancia Rio Grande | Patagonia Argentina Fly Fishing Lodge",
    metaDescription:
      "World-class fly fishing lodge on the Rio Grande in Patagonia, Argentina. Trophy sea-run brown trout, Spey casting, and authentic estancia hospitality in the Argentine steppe.",
    featured: true,
  },
  // ─── BRITISH COLUMBIA ──────────────────────────────────────────────
  {
    id: "lodge-dean-river-lodge",
    slug: "dean-river-lodge",
    name: "Dean River Lodge",
    destinationId: "dest-british-columbia",
    description:
      "Dean River Lodge is one of the most remote and exclusive steelhead fishing operations in British Columbia, accessible only by helicopter from the coastal town of Bella Coola. The lodge occupies a gravel bench above the Dean River's turquoise waters in the heart of the Great Bear Rainforest, a vast wilderness of old-growth cedar, Sitka spruce, and glacier-fed rivers that supports some of the last truly wild steelhead populations on the Pacific coast. The Dean's steelhead are renowned among serious anglers for their extraordinary size and strength, with fish commonly exceeding fifteen pounds and occasional specimens approaching thirty.\n\nThe fishing season is short and fiercely coveted, running from late July through September when fresh steelhead enter the river from the Pacific. Rods are limited to a small number of anglers per week, and many weeks are booked years in advance. The lodge's guides are among the most experienced steelhead specialists in British Columbia, skilled in traditional Spey casting, single-hand techniques, and the art of reading the Dean's ever-changing pools and tailouts. Grizzly bears are a constant presence along the river, fishing alongside the anglers and adding an element of wild intensity to every day on the water.\n\nThe lodge itself is comfortable without being extravagant, befitting its wilderness setting. Guests share meals in a central dining cabin, and accommodations consist of private tents or cabins outfitted with proper beds, woodstoves, and solar-powered lighting. The emphasis is on the fishing and the wilderness experience, and guests who book the Dean River Lodge understand that they are choosing an adventure that prioritizes the pursuit of wild steelhead above all else.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1440581572325-0bea30075d9d?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 52.7518,
    longitude: -126.8734,
    priceRange: "$1,500-2,800/night",
    priceTier: 5,
    seasonStart: "July",
    seasonEnd: "September",
    capacity: 8,
    amenities: [
      "Helicopter access",
      "Guided steelhead fishing",
      "All meals included",
      "Spey casting instruction",
      "Bear viewing",
      "Wilderness cabins",
      "Limited rod availability",
      "Gear drying facilities",
    ],
    nearbyRiverIds: ["river-dean", "river-skeena", "river-elk-river-bc"],
    averageRating: 4.9,
    reviewCount: 22,
    metaTitle: "Dean River Lodge | BC Steelhead Fly Fishing",
    metaDescription:
      "Exclusive helicopter-access steelhead lodge on British Columbia's Dean River. Trophy wild steelhead in the Great Bear Rainforest. Limited availability.",
    featured: true,
  },
  // ─── BAHAMAS ───────────────────────────────────────────────────────
  {
    id: "lodge-andros-south-bonefish-lodge",
    slug: "andros-south-bonefish-lodge",
    name: "Andros South Bonefish Lodge",
    destinationId: "dest-bahamas",
    description:
      "Andros South Bonefish Lodge sits on the remote southern coast of Andros Island in the Bahamas, overlooking an immense system of shallow-water flats that harbors one of the densest bonefish populations in the Caribbean. The lodge was established by a team of dedicated saltwater anglers who recognized that southern Andros offered a bonefishing experience that rivaled or exceeded the more heavily promoted destinations in the region, with vast expanses of white-sand and turtle-grass flats receiving only a fraction of the fishing pressure found on the northern end of the island or in the Florida Keys.\n\nDaily fishing operations launch from the lodge's dock, with experienced Bahamian guides poling custom-built flats skiffs across a mosaic of shallow bays, creek mouths, and oceanside flats. Bonefish averaging three to five pounds are encountered in schools numbering in the dozens, and trophy fish exceeding eight pounds are a realistic possibility on any given day. Beyond bonefish, the flats around southern Andros produce regular encounters with barracuda, jack crevalle, and the occasional permit, providing variety for anglers who want to diversify their fly selections.\n\nThe lodge accommodates eight guests in beachfront cabins with air conditioning and modern amenities. The dining program features fresh Bahamian seafood, including conch, grouper, and lobster, prepared by a local chef whose recipes reflect generations of island culinary tradition. Evenings are spent on the lodge's veranda watching the sunset over the flats, tying flies for the next morning, and swapping stories with fellow anglers from around the world.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 23.7612,
    longitude: -77.7668,
    priceRange: "$700-1,200/night",
    priceTier: 4,
    seasonStart: "October",
    seasonEnd: "June",
    capacity: 8,
    amenities: [
      "Guided flats fishing",
      "Custom flats skiffs",
      "Beachfront cabins",
      "All meals included",
      "Bahamian seafood cuisine",
      "Air conditioning",
      "Fly-tying stations",
      "Airport transfers from Congo Town",
    ],
    nearbyRiverIds: ["river-andros-flats", "river-abaco-flats"],
    averageRating: 4.7,
    reviewCount: 38,
    metaTitle: "Andros South Bonefish Lodge | Bahamas Fly Fishing",
    metaDescription:
      "Remote bonefish lodge on southern Andros Island, Bahamas. World-class flats fishing with experienced Bahamian guides on pristine, lightly pressured waters.",
    featured: true,
  },
  // ─── ICELAND ───────────────────────────────────────────────────────
  {
    id: "lodge-laxa-myvatn-lodge",
    slug: "laxa-myvatn-lodge",
    name: "Laxa i Myvatn Lodge",
    destinationId: "dest-iceland",
    description:
      "Laxa i Myvatn Lodge is a refined Icelandic fishing lodge situated alongside one of the most productive Atlantic salmon and brown trout rivers in the subarctic world. The Laxa i Myvatn flows northward from Lake Myvatn through a volcanic landscape of lava fields, geothermal springs, and tundra grasslands, carrying nutrient-rich water that supports an extraordinary biomass of aquatic insects and the large, well-conditioned trout and salmon that feed on them. The river is divided into beats, and rod access is tightly controlled, ensuring that each angler fishes water that receives minimal pressure throughout the short Icelandic season.\n\nThe lodge itself is a contemporary Nordic structure built with local materials, featuring floor-to-ceiling windows that frame views of the river and the surrounding volcanic terrain. Guest rooms are appointed in the understated Scandinavian style that Icelanders execute so well: clean lines, natural textiles, and geothermal underfloor heating that keeps the interior warm against the subarctic evenings. The dining program takes full advantage of Iceland's culinary renaissance, with Arctic char, lamb, and foraged ingredients featured prominently.\n\nFishing on the Laxa demands precision. The river's clarity exposes every flaw in presentation, and the brown trout — some exceeding six pounds — are among the most selective dry-fly targets in the Northern Hemisphere. The Atlantic salmon fishing begins in late June and peaks through July and August, with fish averaging eight to twelve pounds taken on small flies swung through the river's lava-carved pools. The midnight sun extends fishing hours to near infinity, and it is not uncommon for anglers to find themselves casting at two in the morning under a sky that never fully darkens.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1520681279154-51b3fb4ea0f7?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1477322524744-0eece9e79640?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 65.6412,
    longitude: -17.9951,
    priceRange: "$1,200-2,500/night",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "September",
    capacity: 10,
    amenities: [
      "Beat rotation system",
      "Guided salmon and trout fishing",
      "All meals included",
      "Geothermal heating",
      "Nordic design interiors",
      "Midnight sun fishing",
      "Gear storage and drying",
      "Hot spring access nearby",
    ],
    nearbyRiverIds: ["river-laxa-myvatn", "river-midfjardara"],
    averageRating: 4.8,
    reviewCount: 27,
    metaTitle: "Laxa i Myvatn Lodge | Iceland Atlantic Salmon & Trout Fishing",
    metaDescription:
      "Premier Icelandic fly fishing lodge on the Laxa i Myvatn. Atlantic salmon, trophy brown trout, midnight sun fishing, and Nordic luxury in a volcanic landscape.",
    featured: true,
  },
  // ─── CHILE ─────────────────────────────────────────────────────────
  {
    id: "lodge-baker-lodge-patagonia",
    slug: "baker-lodge-patagonia",
    name: "Baker Lodge Patagonia",
    destinationId: "dest-chile",
    description:
      "Baker Lodge Patagonia occupies a dramatic setting at the confluence of the Rio Baker and a glacial tributary in the Aysen Region of Chilean Patagonia, providing fly fishers access to what many consider the most stunning trout water in South America. The Rio Baker is Chile's largest river by volume, its milky turquoise waters powered by the melting glaciers of the Northern Patagonian Ice Field. Despite its size, the Baker holds remarkable populations of rainbow and brown trout, as well as king salmon that were introduced in the 1980s and have established self-sustaining populations in several tributaries.\n\nThe lodge was designed to harmonize with the surrounding old-growth lenga beech forest, utilizing reclaimed timber, stone, and glass to create a structure that feels both luxurious and appropriate to its wild setting. Six guest rooms offer views of the river and the ice-capped peaks beyond, and the common areas include a fly-tying room, a small library of Patagonian natural history, and a living room centered around a massive stone fireplace where guests gather each evening for pisco sours and conversation about the day's fishing.\n\nGuided fishing excursions range from float trips on the Baker itself to hike-in expeditions to remote tributaries where resident trout have rarely if ever encountered a fly. The Simpson River, an hour's drive north, provides additional variety with its clear, wadeable runs and enthusiastic rainbow trout. The Carretera Austral, Chile's legendary frontier highway, passes nearby, and the lodge can arrange excursions to hanging glaciers, marble caves, and the temperate rainforest landscapes that make this region one of the last great wilderness frontiers on Earth.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1470770841497-7b3200c60053?w=800&q=80", // PLACEHOLDER
    ],
    latitude: -47.1833,
    longitude: -72.1167,
    priceRange: "$700-1,300/night",
    priceTier: 4,
    seasonStart: "November",
    seasonEnd: "April",
    capacity: 12,
    amenities: [
      "Guided float and wade fishing",
      "All meals included",
      "Fly-tying room",
      "Pisco sour bar",
      "Glacier excursions",
      "Helicopter access to remote rivers",
      "Gear storage",
      "Airport transfers from Balmaceda",
    ],
    nearbyRiverIds: ["river-rio-baker", "river-rio-simpson"],
    averageRating: 4.7,
    reviewCount: 29,
    metaTitle: "Baker Lodge Patagonia | Chilean Patagonia Fly Fishing",
    metaDescription:
      "Fly fishing lodge on the Rio Baker in Chilean Patagonia. Glacial rivers, trophy trout, and wilderness adventure on the Carretera Austral.",
    featured: true,
  },
  // ─── BELIZE ────────────────────────────────────────────────────────
  {
    id: "lodge-turneffe-flats-resort",
    slug: "turneffe-flats-resort",
    name: "Turneffe Flats Resort",
    destinationId: "dest-belize",
    description:
      "Turneffe Flats Resort is situated on the Turneffe Atoll, the largest coral atoll in the Western Hemisphere, approximately thirty miles offshore from Belize City. The resort occupies a palm-fringed island within the atoll's protected interior, surrounded by an intricate system of mangrove-lined flats, sand bores, and coral channels that together constitute one of the most diverse and productive saltwater fly fishing environments in the Caribbean. Bonefish, permit, tarpon, barracuda, jack crevalle, and snook all inhabit the atoll's waters in fishable numbers, providing a variety of fly-rod targets that few destinations can match.\n\nThe fishing program at Turneffe Flats is led by a team of Belizean guides who have grown up on the atoll and possess an intimate knowledge of its tides, currents, and seasonal fish movements. Each morning, anglers board flats skiffs for a short run to the day's fishing grounds, which might range from white-sand bonefish flats inside the lagoon to deeper channels where permit cruise and tarpon roll. The grand slam — bonefish, permit, and tarpon in a single day — is a realistic aspiration here, and several are accomplished each season.\n\nThe resort accommodates sixteen guests in beachfront cabanas built from native hardwoods and thatch, and the dining program features freshly caught seafood, tropical fruits, and Belizean Creole cuisine. A dive operation based at the resort offers world-class reef diving and snorkeling on days when anglers want a break from the flats, and the atoll's marine preserve protects some of the healthiest coral reef ecosystems remaining in the Caribbean.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 17.3187,
    longitude: -87.8527,
    priceRange: "$600-1,100/night",
    priceTier: 4,
    seasonStart: "November",
    seasonEnd: "June",
    capacity: 16,
    amenities: [
      "Guided flats fishing",
      "Beachfront cabanas",
      "All meals included",
      "Dive and snorkel operation",
      "Fly-tying stations",
      "Rod storage",
      "Airport transfers from Belize City",
      "Marine preserve access",
    ],
    nearbyRiverIds: ["river-belize-flats"],
    averageRating: 4.7,
    reviewCount: 51,
    metaTitle: "Turneffe Flats Resort | Belize Saltwater Fly Fishing",
    metaDescription:
      "Premier saltwater fly fishing resort on Turneffe Atoll, Belize. Grand slam opportunities for bonefish, permit, and tarpon with experienced Belizean guides.",
    featured: true,
  },
  // ─── SCOTLAND ──────────────────────────────────────────────────────
  {
    id: "lodge-craigellachie-house",
    slug: "craigellachie-house",
    name: "Craigellachie House",
    destinationId: "dest-scotland",
    description:
      "Craigellachie House is a Georgian country house turned fishing lodge perched above the River Spey in the Speyside region of the Scottish Highlands, offering guests a deeply traditional Atlantic salmon fishing experience steeped in centuries of angling heritage. The Spey is the second-longest river in Scotland and the birthplace of Spey casting, the elegant two-handed rod technique that was developed on its banks in the nineteenth century and has since spread to steelhead and salmon rivers worldwide. Fishing from Craigellachie House connects the modern angler to this unbroken lineage of rivercraft and tradition.\n\nThe lodge holds exclusive rights to several productive beats on the middle Spey, waters that receive strong runs of Atlantic salmon from spring through autumn. Ghillies — the Scottish term for river guides — have tended these beats for generations, and their knowledge of each pool, lie, and taking spot is encyclopedic. Fishing is conducted by Spey casting from the bank, wading where appropriate, and the lodge maintains a full complement of two-handed rods, reels, and lines for guests who arrive without their own Spey tackle.\n\nThe house itself retains the character of a Highland sporting estate, with wood-paneled rooms, open fires, and a whisky cabinet stocked with single malts from the surrounding Speyside distilleries. A full Scottish breakfast fuels morning fishing, and the evening meal features Scottish game, fresh Atlantic seafood, and produce from the house's kitchen garden. Distillery tours on non-fishing days provide an immersive introduction to Speyside's other great obsession.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1505916349660-8d91a382ae6e?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 57.4504,
    longitude: -3.2143,
    priceRange: "$500-1,000/night",
    priceTier: 3,
    seasonStart: "February",
    seasonEnd: "October",
    capacity: 14,
    amenities: [
      "Exclusive Spey beats",
      "Ghillie-guided fishing",
      "Spey casting instruction",
      "Rod and tackle provided",
      "Full Scottish breakfast",
      "Whisky collection",
      "Distillery tours",
      "Wood-paneled rooms",
      "Open fires",
    ],
    nearbyRiverIds: ["river-river-spey", "river-river-tay"],
    averageRating: 4.6,
    reviewCount: 33,
    metaTitle: "Craigellachie House | River Spey Salmon Fishing Lodge, Scotland",
    metaDescription:
      "Georgian fishing lodge on the River Spey in the Scottish Highlands. Traditional Atlantic salmon fishing with ghillies, Speyside whisky, and Highland hospitality.",
    featured: true,
  },
  // ─── SLOVENIA ──────────────────────────────────────────────────────
  {
    id: "lodge-soca-valley-lodge",
    slug: "soca-valley-lodge",
    name: "Soca Valley Lodge",
    destinationId: "dest-slovenia",
    description:
      "Soca Valley Lodge is a boutique fishing lodge tucked into the Julian Alps of western Slovenia, overlooking the emerald waters of the Soca River, one of the most visually stunning trout streams in all of Europe. The Soca is famous for its extraordinary clarity and its population of marble trout, a genetically distinct species found only in the Adriatic drainage of Slovenia and northeastern Italy. These striking fish, with their marbled olive and cream flanks, are considered among the rarest and most beautiful salmonids in the world, and the opportunity to pursue them with a fly rod in their native habitat draws dedicated anglers from across the globe.\n\nThe lodge occupies a renovated Alpine farmhouse with thick stone walls, exposed timber beams, and a terrace that overlooks a stretch of the Soca's turquoise pools. Accommodations are warm and intimate, with eight rooms decorated in a blend of traditional Slovenian folk art and contemporary mountain style. The kitchen serves locally sourced Slovenian cuisine, including freshwater trout, wild mushrooms, mountain cheeses, and hearty stews, accompanied by wines from the nearby Goriska Brda wine region.\n\nGuided fishing on the Soca and its tributaries requires special permits that the lodge arranges in advance. Guides are licensed by the Slovenian fishing authority and bring deep knowledge of the river's hydrology, insect hatches, and the behavior patterns of marble trout, which differ markedly from the rainbow and brown trout that most visiting anglers have previously pursued. Sight-fishing to individual marble trout in gin-clear alpine water, with the Julian Alps soaring above, represents one of fly fishing's most unforgettable experiences.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 46.3300,
    longitude: 13.7350,
    priceRange: "$300-600/night",
    priceTier: 3,
    seasonStart: "April",
    seasonEnd: "October",
    capacity: 16,
    amenities: [
      "Guided marble trout fishing",
      "Fishing permit arrangement",
      "Slovenian cuisine",
      "Alpine terrace",
      "Fly-tying room",
      "Gear storage",
      "Wine tasting excursions",
      "Hiking and cycling",
    ],
    nearbyRiverIds: ["river-soca-river"],
    averageRating: 4.6,
    reviewCount: 24,
    metaTitle: "Soca Valley Lodge | Slovenia Marble Trout Fly Fishing",
    metaDescription:
      "Boutique fly fishing lodge in Slovenia's Julian Alps. Guided sight-fishing for marble trout in the emerald Soca River. Alpine cuisine and stunning mountain scenery.",
    featured: false,
  },
  // ─── JAPAN ─────────────────────────────────────────────────────────
  {
    id: "lodge-nagara-river-ryokan",
    slug: "nagara-river-ryokan",
    name: "Nagara River Ryokan",
    destinationId: "dest-japan",
    description:
      "Nagara River Ryokan is a traditional Japanese inn on the banks of the Nagara River in Gifu Prefecture, offering visiting fly anglers a culturally immersive base for exploring one of Japan's most historic fishing rivers. The Nagara has been central to Japanese fishing culture for over thirteen hundred years, and the inn's location provides access to both the river's productive ayu and trout water and the broader world of Japanese tenkara and fly fishing that is gaining international recognition. The ryokan experience itself — tatami mat rooms, communal onsen hot spring baths, and multi-course kaiseki dinners — provides a dimension of cultural richness that no Western fishing lodge can replicate.\n\nThe inn coordinates guided tenkara and Western fly fishing excursions on the Nagara and its mountain tributaries, where native amago and iwana trout inhabit boulder-strewn gorges beneath canopies of Japanese maple and cedar. Tenkara, the traditional Japanese method of fixed-line fly fishing that originated in these very mountains, is practiced here in its purest form, with telescopic rods, hand-tied kebari flies, and an emphasis on reading water and delicate presentation that will resonate deeply with any technically minded angler.\n\nEvening meals at the ryokan are a procession of small, exquisitely prepared dishes featuring river fish, mountain vegetables, tofu, and seasonal specialties, served in a private dining room overlooking the Nagara. After dinner, the onsen beckons, its mineral-rich water drawn from a deep geothermal source that has been warming weary bodies for centuries. The combination of world-class fishing, centuries of cultural tradition, and Japanese hospitality creates an experience unlike any other in the fly fishing world.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 35.4437,
    longitude: 136.7614,
    priceRange: "$300-700/night",
    priceTier: 3,
    seasonStart: "March",
    seasonEnd: "October",
    capacity: 12,
    amenities: [
      "Guided tenkara and fly fishing",
      "Tatami mat rooms",
      "Onsen hot spring baths",
      "Kaiseki dinner service",
      "Rod and tenkara rental",
      "Cultural excursions",
      "River views",
      "Traditional ryokan hospitality",
    ],
    nearbyRiverIds: ["river-nagara-river"],
    averageRating: 4.7,
    reviewCount: 19,
    metaTitle: "Nagara River Ryokan | Japan Tenkara & Fly Fishing Lodge",
    metaDescription:
      "Traditional Japanese ryokan on the Nagara River in Gifu. Guided tenkara and fly fishing, onsen baths, kaiseki cuisine, and centuries of Japanese fishing culture.",
    featured: false,
  },
  // ─── CHRISTMAS ISLAND ──────────────────────────────────────────────
  {
    id: "lodge-christmas-island-outfitters",
    slug: "christmas-island-outfitters",
    name: "Christmas Island Outfitters Lodge",
    destinationId: "dest-christmas-island",
    description:
      "Christmas Island Outfitters Lodge is the premier fly fishing operation on Kiritimati, the world's largest coral atoll, located in the central Pacific Ocean roughly midway between Hawaii and Fiji. The atoll encompasses over 150 square miles of shallow lagoon, interior flats, and oceanside reef systems that support what many experienced saltwater anglers consider the single greatest concentration of bonefish on the planet. Fish numbering in the thousands cruise the white-sand flats in tight schools, and encounters with individual trophies exceeding ten pounds are a regular occurrence rather than a once-in-a-lifetime event.\n\nThe lodge operates from a compound near the village of London on the atoll's north shore, with I-Kiribati guides who have fished these flats since childhood. Each morning, anglers board vehicles for a short drive to the day's fishing grounds, then wade the firm coral-sand flats on foot with their guide, covering miles of productive water over the course of a full day. Beyond bonefish, the atoll's flats hold giant trevally, milkfish, triggerfish, and bluefin trevally, species that test both tackle and angling skill to their absolute limits.\n\nAccommodations are simple but clean, reflecting the atoll's remote location and limited infrastructure. Meals feature fresh-caught fish, tropical fruits, and imported provisions. Anglers who choose Christmas Island understand that the destination's appeal lies not in resort-style luxury but in the sheer volume and quality of the fishing, which operates on a scale that exists nowhere else on Earth.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 1.8721,
    longitude: -157.4735,
    priceRange: "$500-900/night",
    priceTier: 3,
    seasonStart: "January",
    seasonEnd: "December",
    capacity: 12,
    amenities: [
      "Guided wade fishing",
      "I-Kiribati local guides",
      "All meals included",
      "Gear storage",
      "Year-round fishing",
      "Giant trevally fishing",
      "Airport transfers",
      "Fly-tying area",
    ],
    nearbyRiverIds: ["river-christmas-island-flats"],
    averageRating: 4.5,
    reviewCount: 34,
    metaTitle: "Christmas Island Outfitters | Kiritimati Bonefish Fly Fishing",
    metaDescription:
      "Fly fishing lodge on Christmas Island (Kiritimati). World-class bonefishing, giant trevally, and remote Pacific atoll adventure on the largest coral atoll on Earth.",
    featured: false,
  },
  // ─── SEYCHELLES ────────────────────────────────────────────────────
  {
    id: "lodge-alphonse-island-lodge",
    slug: "alphonse-island-lodge",
    name: "Alphonse Island Lodge",
    destinationId: "dest-seychelles",
    description:
      "Alphonse Island Lodge is the undisputed pinnacle of tropical saltwater fly fishing luxury, situated on a private coral island in the Outer Islands of the Seychelles, roughly 250 miles southwest of the main island of Mahe. The lodge controls exclusive fishing access to the vast atoll systems of Alphonse, St. Francois, and Bijoutier, three interconnected atolls that together offer more than a hundred square miles of pristine flats, lagoons, and reef channels teeming with an extraordinary diversity of tropical gamefish. Giant trevally, bonefish, milkfish, permit, triggerfish, bluefin trevally, and Indo-Pacific permit all patrol these waters in numbers and sizes that have earned the Seychelles a reputation as the ultimate saltwater fly fishing frontier.\n\nThe lodge accommodates twenty-four guests in beachfront bungalows shaded by coconut palms, each with direct views of the Indian Ocean. The facilities rival those of any five-star tropical resort, with a swimming pool, spa, gourmet restaurant, and dive center complementing the world-class fly fishing program. The guiding team includes some of the most experienced and accomplished tropical flats guides working anywhere in the world, specialists in sight-casting to giant trevally on coral reef edges and stalking tailing bonefish across pancake-flat lagoons.\n\nThe daily fishing operation is a study in logistics and precision, with guides matching tide charts, wind forecasts, and seasonal fish movements to select the optimal flats and channels for each morning's excursion. The fishing is entirely catch-and-release, and the Alphonse Foundation supports ongoing marine conservation research that monitors fish populations and reef health across the atoll system.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // PLACEHOLDER
    ],
    latitude: -7.0167,
    longitude: 52.7333,
    priceRange: "$2,000-4,000/night",
    priceTier: 5,
    seasonStart: "October",
    seasonEnd: "May",
    capacity: 24,
    amenities: [
      "Private island",
      "Exclusive atoll access",
      "Guided flats fishing",
      "Beachfront bungalows",
      "Swimming pool and spa",
      "Gourmet restaurant",
      "Dive center",
      "Marine conservation program",
      "Catch-and-release only",
    ],
    nearbyRiverIds: ["river-alphonse-flats"],
    averageRating: 4.9,
    reviewCount: 26,
    metaTitle: "Alphonse Island Lodge | Seychelles Saltwater Fly Fishing",
    metaDescription:
      "Private island fly fishing lodge in the Seychelles Outer Islands. Giant trevally, bonefish, and milkfish on pristine Indian Ocean flats with five-star luxury.",
    featured: true,
  },
  // ─── TASMANIA ──────────────────────────────────────────────────────
  {
    id: "lodge-western-lakes-lodge",
    slug: "western-lakes-lodge",
    name: "Western Lakes Lodge",
    destinationId: "dest-tasmania",
    description:
      "Western Lakes Lodge is a remote wilderness fishing retreat nestled in the Central Highlands of Tasmania, Australia, providing access to one of the most unique and challenging still-water fly fishing environments in the Southern Hemisphere. The Western Lakes region encompasses hundreds of glacial tarns and lakes scattered across a dolerite plateau at an elevation of approximately three thousand feet, each lake harboring populations of wild brown trout that feed primarily by sight in shallow, crystal-clear water. The fishing here is pure polaroiding: spotting individual fish from the bank or while wading, then making a single accurate cast to a moving target, often with only seconds to execute before the trout spooks.\n\nThe lodge is accessible by a rough four-wheel-drive track through buttongrass moorland and eucalyptus forest, a journey that reinforces the isolation and wildness of the destination. Accommodations are comfortable but deliberately understated: timber cabins with wood-burning stoves, hot showers, and solid meals prepared by the lodge's resident cook. The emphasis is entirely on the fishing experience and the starkly beautiful landscape, not on luxury amenities.\n\nGuides are Tasmanian locals who have spent their lives reading the moods of these highland lakes, understanding how wind direction, cloud cover, and water temperature influence the behavior of trout that can be maddeningly selective one day and aggressively feeding the next. Helicopter access to the most remote and productive lakes is available for anglers seeking water that may see only a handful of visitors per season. The wild brown trout of Tasmania's Western Lakes, averaging two to four pounds with occasional fish exceeding six, are among the most demanding and rewarding quarry in the freshwater fly fishing world.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80", // PLACEHOLDER
    ],
    latitude: -41.8563,
    longitude: 146.0342,
    priceRange: "$400-800/night",
    priceTier: 3,
    seasonStart: "October",
    seasonEnd: "April",
    capacity: 8,
    amenities: [
      "Guided sight-fishing",
      "Helicopter lake access",
      "Timber cabins",
      "All meals included",
      "4WD transfers",
      "Polaroid fishing technique",
      "Gear storage",
      "Wilderness setting",
    ],
    nearbyRiverIds: ["river-western-lakes-tas"],
    averageRating: 4.6,
    reviewCount: 18,
    metaTitle: "Western Lakes Lodge | Tasmania Sight-Fishing for Wild Brown Trout",
    metaDescription:
      "Remote wilderness fly fishing lodge in Tasmania's Central Highlands. Sight-fishing for wild brown trout in glacial lakes surrounded by pristine Australian bush.",
    featured: false,
  },
  // ─── KAMCHATKA ─────────────────────────────────────────────────────
  {
    id: "lodge-kamchatka-river-camp",
    slug: "kamchatka-river-camp",
    name: "Kamchatka River Camp",
    destinationId: "dest-kamchatka",
    description:
      "Kamchatka River Camp is a seasonal fly-out fishing operation based on the remote Zhupanova River in Russia's Kamchatka Peninsula, one of the last truly wild places on Earth where Pacific salmon, steelhead, and rainbow trout exist in numbers that recall the great runs of centuries past. The camp provides access to rivers and streams that flow through a volcanic landscape of steaming fumaroles, snow-capped stratovolcanoes, and tundra valleys patrolled by Kamchatka brown bears — the largest brown bears in Asia. The fishing experience here exists on a scale and in a setting that has no parallel in the modern angling world.\n\nThe camp itself consists of comfortable weatherproof tents erected on wooden platforms along the riverbank, with a central dining tent, sauna, and gathering area. Helicopter flights from the camp deliver anglers to a rotation of rivers each day, accessing water that may see fewer than fifty anglers in an entire season. The Zhupanova's resident rainbow trout, known locally as mikizha, are powerful, aggressive fish that readily attack mouse patterns, streamers, and large dry flies, with specimens routinely exceeding twenty-five inches. Pacific salmon runs — chinook, sockeye, coho, chum, and pink — cycle through the rivers from June through October, providing an ever-changing tableau of fishing opportunities.\n\nThe guiding staff combines Russian field expertise with international fly fishing knowledge, and the camp's logistics are managed with military precision to ensure safety and quality in this extraordinarily remote environment. Brown bears fish alongside anglers on virtually every outing, and the proximity to active volcanoes adds a geological drama that makes every day on the water feel like an expedition into the primordial wild.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 53.5885,
    longitude: 159.1498,
    priceRange: "$1,500-3,000/night",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "October",
    capacity: 10,
    amenities: [
      "Helicopter fly-out fishing",
      "Guided fishing",
      "All meals included",
      "Weatherproof tent camp",
      "Sauna",
      "Bear viewing",
      "Volcanic landscape",
      "Five Pacific salmon species",
      "Trophy rainbow trout",
    ],
    nearbyRiverIds: ["river-zhupanova"],
    averageRating: 4.8,
    reviewCount: 15,
    metaTitle: "Kamchatka River Camp | Russia Fly Fishing Adventures",
    metaDescription:
      "Helicopter-access fly fishing camp on the Zhupanova River in Kamchatka, Russia. Trophy rainbow trout, Pacific salmon, brown bears, and volcanic wilderness.",
    featured: true,
  },
  // ─── TIERRA DEL FUEGO ──────────────────────────────────────────────
  {
    id: "lodge-kau-tapen-lodge",
    slug: "kau-tapen-lodge",
    name: "Kau Tapen Lodge",
    destinationId: "dest-tierra-del-fuego",
    description:
      "Kau Tapen Lodge is widely regarded as the finest sea-run brown trout lodge in the world, situated on the banks of the Rio Grande on the Argentine side of Tierra del Fuego, the windswept island at the southern tip of South America. The lodge controls exclusive access to the most productive section of the Rio Grande, a stretch of river that consistently produces the largest sea-run brown trout found anywhere on the planet. Fish averaging ten to fourteen pounds are the daily standard, and each season sees multiple specimens exceeding twenty pounds — migratory brown trout of a size that most anglers would not believe possible until they witness one materializing from the depths of a Fuegian pool.\n\nThe fishing at Kau Tapen is conducted primarily by double-handed (Spey) casting, swinging traditional wet flies and modern intruder-style patterns through the river's deep, glacier-carved pools. The lodge's guide team is composed of the most experienced sea-trout specialists in Tierra del Fuego, anglers who have dedicated their professional lives to understanding the migration patterns, feeding behavior, and tactical vulnerabilities of these extraordinary fish. Each beat on the lodge's water is rotated daily, ensuring that every guest fishes the full range of available pools during their stay.\n\nThe lodge building is a warm, elegant refuge against the Fuegian wind, with a wood-burning fireplace, a dining room serving Argentine cuisine with local lamb and Malbec, and a tackle room equipped with a full selection of Spey rods, reels, and lines. The landscape of Tierra del Fuego is hauntingly beautiful — rolling grasslands meeting the river under enormous Patagonian skies — and the sense of fishing at the very edge of the inhabited world adds a profound dimension to every day on the water.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1470770841497-7b3200c60053?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1470770841497-7b3200c60053?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80", // PLACEHOLDER
    ],
    latitude: -53.7870,
    longitude: -68.3123,
    priceRange: "$1,200-2,200/night",
    priceTier: 5,
    seasonStart: "January",
    seasonEnd: "April",
    capacity: 12,
    amenities: [
      "Exclusive river access",
      "Spey casting instruction",
      "Guided fishing",
      "All meals included",
      "Argentine wine and cuisine",
      "Beat rotation system",
      "Full tackle provision",
      "Airport transfers from Ushuaia",
      "Wood-burning fireplace",
    ],
    nearbyRiverIds: ["river-rio-grande-tdf"],
    averageRating: 4.9,
    reviewCount: 37,
    metaTitle: "Kau Tapen Lodge | Tierra del Fuego Sea-Run Brown Trout",
    metaDescription:
      "World's premier sea-run brown trout lodge on the Rio Grande in Tierra del Fuego, Argentina. Trophy fish exceeding 20 pounds, Spey casting, and exclusive river access.",
    featured: true,
  },
  // ─── PHASE 3 ADDITIONS ──────────────────────────────────────────
  {
    id: "lodge-mount-falcon",
    slug: "mount-falcon-estate",
    name: "Mount Falcon Estate",
    destinationId: "dest-ireland",
    description:
      "Mount Falcon Estate is one of Ireland's finest country house hotels with a dedicated salmon fishing program, set on a hundred-acre estate overlooking the River Moy in County Mayo. The estate holds private salmon fishing on both banks of the Moy, offering guests exclusive access to some of the river's most productive beats during the peak salmon season. The combination of a historic Georgian manor house, award-winning cuisine featuring locally sourced ingredients, and immediate access to Ireland's premier salmon river creates an experience that seamlessly blends sporting tradition with country house luxury.\n\nThe fishing at Mount Falcon is managed by an experienced team of ghillies who know the Moy intimately, from the lies where spring salmon hold in the deep pools to the gravel runs where grilse stack up in July and August. Guests fish with single-handed or double-handed rods depending on the beat and conditions, with wet fly, nymph, and dry fly methods all employed throughout the season. The estate also arranges fishing on nearby Lough Conn for wild brown trout, providing an alternative for days when the river is high or when guests want to experience the traditional Irish art of lough-style fishing from a drifting boat.\n\nBeyond fishing, Mount Falcon offers woodland walks, falconry experiences, an outdoor hot tub, and a Kitchen Garden restaurant that has earned a reputation as one of the finest dining experiences in the west of Ireland. The estate is family-friendly and accommodates non-fishing partners with activities and spa facilities.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1?w=800&q=80", // PLACEHOLDER
    ],
    websiteUrl: "https://www.mountfalcon.com",
    latitude: 54.0833,
    longitude: -9.2000,
    priceRange: "$250-500/night",
    priceTier: 3,
    seasonStart: "March",
    seasonEnd: "September",
    capacity: 32,
    amenities: [
      "Private salmon beats",
      "Experienced ghillies",
      "Georgian manor accommodation",
      "Award-winning restaurant",
      "Lough Conn access",
      "Falconry",
      "Woodland walks",
      "Outdoor hot tub",
      "Family friendly",
      "Non-fishing activities",
    ],
    nearbyRiverIds: ["river-moy"],
    averageRating: 4.7,
    reviewCount: 89,
    metaTitle: "Mount Falcon Estate | Irish Salmon Fishing Lodge",
    metaDescription:
      "Ireland's premier salmon fishing estate on the River Moy. Private beats, experienced ghillies, and Georgian country house luxury in County Mayo.",
    featured: false,
  },
  {
    id: "lodge-ponoi-river-camp",
    slug: "ponoi-river-camp",
    name: "Ponoi River Camp",
    destinationId: "dest-kola-peninsula",
    description:
      "Ponoi River Camp is the sole fishing operation on the world's most prolific Atlantic salmon river, offering an exclusive wilderness experience that combines record-breaking salmon fishing with comfortable camp accommodation on the Arctic tundra. Accessed only by helicopter from Murmansk, the camp sits on the banks of the lower Ponoi River amidst a landscape of tundra, birch groves, and crystal-clear pools teeming with Atlantic salmon. The operation has been running since the early 1990s and has refined its program to deliver consistently outstanding fishing while maintaining the catch-and-release conservation ethic that has kept the Ponoi's salmon runs healthy.\n\nThe camp accommodates a limited number of rods per week, rotating guests through over sixty miles of river on named beats that have been producing salmon for decades. Experienced guides pole boats to the best pools each day, where anglers Spey cast through holding water that may contain dozens of fresh-run salmon. The take rate on the Ponoi is legendary — double-digit days are common during peak weeks, and the quality of the fish is exceptional, with bright, ocean-fresh salmon averaging ten to fifteen pounds and multi-sea-winter fish exceeding thirty pounds taken regularly.\n\nAccommodation is in heated cabins and tents along the riverbank, with meals prepared by a dedicated camp chef using a combination of imported provisions and locally sourced ingredients. The atmosphere is relaxed and convivial, with anglers gathering in the communal dining cabin each evening to share tales of the day's fishing over dinner and drinks. The midnight sun provides endless casting light, and many anglers fish well past midnight during the peak of the Arctic summer.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 67.0667,
    longitude: 41.1333,
    priceRange: "$8,000-12,000/week",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "September",
    capacity: 16,
    amenities: [
      "Helicopter transfer from Murmansk",
      "Exclusive river access",
      "Experienced salmon guides",
      "All meals and drinks included",
      "Spey casting instruction",
      "Full tackle provision",
      "Heated cabins",
      "Midnight sun fishing",
    ],
    nearbyRiverIds: ["river-ponoi"],
    averageRating: 4.9,
    reviewCount: 23,
    metaTitle: "Ponoi River Camp | Kola Peninsula Atlantic Salmon",
    metaDescription:
      "The world's most productive Atlantic salmon fishing. Exclusive helicopter-access camp on Russia's Ponoi River with record-breaking catches.",
    featured: false,
  },
  {
    id: "lodge-sweetwater-travel",
    slug: "sweetwater-travel-mongolia",
    name: "Sweetwater Travel Mongolia Camp",
    destinationId: "dest-mongolia",
    description:
      "Sweetwater Travel operates the most established and conservation-focused taimen fishing camps in Mongolia, providing access to the Eg-Uur watershed and other pristine river systems in northern Mongolia where the world's largest salmonid still thrives. The operation is structured as a series of mobile ger camps and river camps that move with the fishing conditions, allowing anglers to cover extensive stretches of river in pursuit of taimen, lenok, and Siberian grayling in some of the most remote and beautiful wilderness remaining in Asia.\n\nThe camps are comfortable without being luxurious, reflecting the expedition nature of Mongolian taimen fishing. Traditional gers (the round felt tents of Mongolian nomads) provide warm, dry sleeping quarters, while communal dining tents serve hearty meals prepared by camp cooks. The guiding staff combines Mongolian river knowledge with Western fly fishing expertise, ensuring that anglers of all experience levels can effectively fish for taimen using the large streamers, mouse patterns, and articulated flies that these apex predators demand.\n\nSweetwater Travel has been at the forefront of taimen conservation in Mongolia, working with local communities and government agencies to protect critical taimen habitat and establish sustainable fishing practices. Their strict catch-and-release protocols, barbless hook requirements, and fish handling training have set the standard for responsible taimen fishing operations worldwide. A portion of each trip fee goes directly to habitat conservation and community development programs in the fishing areas.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 49.8500,
    longitude: 100.5000,
    priceRange: "$6,500-9,000/week",
    priceTier: 5,
    seasonStart: "June",
    seasonEnd: "October",
    capacity: 8,
    amenities: [
      "Experienced taimen guides",
      "Traditional ger accommodation",
      "All meals included",
      "Full tackle provision",
      "Conservation-focused operation",
      "Overland transfers from Ulaanbaatar",
      "Multi-day float trips available",
      "Photography assistance",
    ],
    nearbyRiverIds: ["river-eg-uur"],
    averageRating: 4.8,
    reviewCount: 18,
    metaTitle: "Sweetwater Travel Mongolia | Taimen Fishing Camps",
    metaDescription:
      "Mongolia's premier taimen fishing operation. Conservation-focused camps on the Eg-Uur watershed for the world's largest salmonid.",
    featured: false,
  },
  {
    id: "lodge-avalon-cuba",
    slug: "avalon-jardines-de-la-reina",
    name: "Avalon Fleet — Jardines de la Reina",
    destinationId: "dest-cuba",
    description:
      "Avalon is the pioneering and most established fly fishing operation in Cuba's Jardines de la Reina, operating a fleet of live-aboard motherships that serve as floating lodges anchored in the protected channels of this pristine marine archipelago. Since the early 2000s, Avalon has provided international fly anglers with access to what many consider the finest remaining saltwater flats fishing in the Caribbean, with bonefish, permit, tarpon, and a host of reef species available within minutes of each mothership anchorage.\n\nThe motherships are comfortable floating hotels, each accommodating six to eight anglers in air-conditioned cabins with private bathrooms. Meals are prepared by onboard chefs and feature fresh seafood alongside Cuban and international cuisine. Each morning, anglers board poled skiffs with experienced Cuban guides to explore the flats, channels, and mangrove shorelines of the archipelago, returning to the mothership for lunch and again at the end of the fishing day. The flexibility of the mothership format allows the operation to relocate based on tides, weather, and fish activity, maximizing fishing productivity throughout each week.\n\nThe fishing from Avalon's operation is exceptional by any Caribbean standard. Bonefish numbers are staggering, with schools of fifty to several hundred fish encountered daily on the inside flats. Permit fishing rivals the best in Belize and Mexico, with fish cruising the flats in pods that offer multiple shots per encounter. Tarpon inhabit the deeper channels year-round, with fish from twenty to over one hundred pounds available depending on season and location.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 21.0500,
    longitude: -79.5000,
    priceRange: "$5,500-7,500/week",
    priceTier: 4,
    seasonStart: "December",
    seasonEnd: "August",
    capacity: 8,
    amenities: [
      "Live-aboard mothership",
      "Air-conditioned cabins",
      "All meals and drinks included",
      "Expert Cuban guides",
      "Poled skiffs",
      "Grand slam opportunities",
      "Marine park access",
      "Snorkeling available",
    ],
    nearbyRiverIds: ["river-jardines-de-la-reina"],
    averageRating: 4.7,
    reviewCount: 31,
    metaTitle: "Avalon Fleet — Jardines de la Reina | Cuba Fly Fishing",
    metaDescription:
      "Cuba's premier saltwater fly fishing operation. Live-aboard motherships in the Jardines de la Reina for bonefish, permit, and tarpon.",
    featured: false,
  },
  {
    id: "lodge-maldives-gt",
    slug: "maldives-flyfish-explorer",
    name: "Maldives Flyfish Explorer",
    destinationId: "dest-maldives",
    description:
      "Maldives Flyfish Explorer is a dedicated fly fishing live-aboard vessel that cruises the atolls of the Maldives in search of giant trevally, bluefin trevally, bonefish, triggerfish, and the extraordinary variety of tropical species that inhabit these pristine Indian Ocean waters. The vessel is purpose-built for fly fishing, with an open casting deck, rod storage, fly tying station, and a fleet of poling skiffs that deploy each day to work the channels, reef edges, and interior flats of whichever atoll offers the best fishing conditions.\n\nThe live-aboard format is ideally suited to the Maldives, where the best fishing is spread across multiple atolls and changes with tidal cycles, moon phases, and seasonal fish movements. The vessel moves between anchorages to follow the fishing, providing access to remote atolls and channel systems that land-based operations cannot reach. Giant trevally are the primary target, with fish prowling the channel mouths and reef edges where tidal flows concentrate bait. Sight-casting to cruising GTs on the flats is the pinnacle experience, but blind-casting poppers and large flies along reef structures produces consistent action as well.\n\nAccommodation aboard the Explorer is comfortable and well-appointed, with air-conditioned cabins, an open-air dining area, and a sun deck for relaxing between fishing sessions. Meals feature fresh seafood and Maldivian cuisine. The crew and guides are experienced local fishermen who have transitioned from commercial fishing to catch-and-release guiding, bringing an intimate knowledge of the atolls and fish behavior that comes only from a lifetime on these waters.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1200&q=80", // PLACEHOLDER
    thumbnailUrl:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&q=80", // PLACEHOLDER
    galleryUrls: [
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80", // PLACEHOLDER
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", // PLACEHOLDER
    ],
    latitude: 4.3000,
    longitude: 73.5000,
    priceRange: "$7,000-10,000/week",
    priceTier: 5,
    seasonStart: "October",
    seasonEnd: "May",
    capacity: 6,
    amenities: [
      "Purpose-built fly fishing vessel",
      "Air-conditioned cabins",
      "All meals included",
      "Poling skiffs",
      "Expert local guides",
      "GT and reef fishing",
      "Multi-atoll itinerary",
      "Fly tying station",
      "Snorkeling and diving",
    ],
    nearbyRiverIds: ["river-north-male-atoll"],
    averageRating: 4.8,
    reviewCount: 14,
    metaTitle: "Maldives Flyfish Explorer | Indian Ocean GT Fishing",
    metaDescription:
      "Purpose-built fly fishing live-aboard in the Maldives. Giant trevally, bonefish, and triggerfish on pristine Indian Ocean atolls.",
    featured: false,
  },
];
