import type { Species } from "@/types/entities";

export const species: Species[] = [
  {
    id: "species-rainbow-trout",
    slug: "rainbow-trout",
    commonName: "Rainbow Trout",
    scientificName: "Oncorhynchus mykiss",
    description:
      "The rainbow trout is one of the most widely distributed and sought-after game fish in the world. Named for the distinctive pink-to-red lateral band that runs along its side, the rainbow is renowned for its acrobatic fighting ability and willingness to take a fly. Native to the cold-water tributaries of the Pacific Ocean in Asia and North America, rainbow trout have been introduced to suitable waters on every continent except Antarctica. They thrive in clean, cold, well-oxygenated streams, rivers, and lakes, with an ideal temperature range of 50-60 degrees Fahrenheit. Rainbows are opportunistic feeders, readily taking nymphs, dry flies, and streamers, making them a favorite target for fly anglers of all experience levels.",
    imageUrl:
      "https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=1200&q=80", // PLACEHOLDER
    nativeRange: "Pacific drainages of North America and Asia",
    averageSize: "12-20 inches, 1-5 lbs",
    recordSize: "48 lbs (Lake Diefenbaker, Saskatchewan, 2009)",
    preferredHabitat:
      "Cold, clean rivers and streams with gravel bottoms; also lakes and tailwaters",
    preferredFlies: [
      "Parachute Adams #14-18",
      "Elk Hair Caddis #14-16",
      "Pheasant Tail Nymph #14-18",
      "Rainbow Warrior #16-20",
      "Woolly Bugger #6-10",
      "Blue-winged Olive #16-20",
      "San Juan Worm #10-14",
    ],
  },
  {
    id: "species-brown-trout",
    slug: "brown-trout",
    commonName: "Brown Trout",
    scientificName: "Salmo trutta",
    description:
      "The brown trout is the thinking angler's quarry. Originally native to Europe and western Asia, brown trout were first introduced to North American waters in 1883 and have since established thriving populations across the continent. Distinguished by their golden-brown coloring adorned with black and red spots often encircled by pale halos, brown trout are widely regarded as the most difficult trout species to fool with a fly. They are exceptionally wary, frequently nocturnal feeders, and grow larger than most other stream-dwelling trout. Brown trout tolerate warmer water temperatures than their salmonid cousins, allowing them to thrive in waters where other trout species struggle. Trophy brown trout are often caught on streamers fished during low-light conditions, though large specimens also fall to well-presented dry flies during prolific hatches.",
    imageUrl:
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&q=80", // PLACEHOLDER
    nativeRange: "Europe and western Asia",
    averageSize: "14-22 inches, 2-8 lbs",
    recordSize: "44 lbs 11 oz (Ohau Canal, New Zealand, 2020)",
    preferredHabitat:
      "Rivers, streams, and lakes with cover such as undercut banks, logjams, and deep pools; tolerates warmer water than other trout",
    preferredFlies: [
      "Woolly Bugger #4-8",
      "Muddler Minnow #4-8",
      "Parachute Adams #14-18",
      "Copper John #14-18",
      "Hare's Ear Nymph #12-16",
      "Sculpin patterns #4-6",
      "Mouse patterns #2-6",
    ],
  },
  {
    id: "species-cutthroat-trout",
    slug: "cutthroat-trout",
    commonName: "Cutthroat Trout",
    scientificName: "Oncorhynchus clarkii",
    description:
      "The cutthroat trout holds a special place in the hearts of western anglers as the native trout of the American West. Named for the distinctive red-orange slash marks beneath the lower jaw, cutthroat trout encompass numerous subspecies adapted to the diverse watersheds of western North America, from the Yellowstone cutthroat of the Greater Yellowstone Ecosystem to the westslope cutthroat of the northern Rockies and the coastal cutthroat of Pacific Northwest streams. Cutthroat trout are generally more willing to take a dry fly than brown trout, making them a delight for surface-oriented anglers. Many subspecies face conservation challenges from habitat loss and hybridization with non-native rainbow trout, making catch-and-release practices especially important when targeting these beautiful native fish.",
    imageUrl:
      "https://images.unsplash.com/photo-1514469445815-46f9c63a4862?w=1200&q=80", // PLACEHOLDER
    nativeRange: "Western North America, from Alaska to New Mexico",
    averageSize: "10-18 inches, 0.5-3 lbs",
    recordSize: "41 lbs (Pyramid Lake, Nevada, 1925)",
    preferredHabitat:
      "Cold mountain streams, alpine lakes, and coastal rivers; prefers clean gravel substrates for spawning",
    preferredFlies: [
      "Royal Wulff #12-16",
      "Stimulator #10-14",
      "Elk Hair Caddis #14-16",
      "Prince Nymph #12-16",
      "Parachute Adams #14-18",
      "Cutthroat Candy #14",
      "PMD #14-18",
    ],
  },
  {
    id: "species-brook-trout",
    slug: "brook-trout",
    commonName: "Brook Trout",
    scientificName: "Salvelinus fontinalis",
    description:
      "Despite its common name, the brook trout is technically a char, closely related to Arctic char and lake trout rather than true trout. Native to eastern North America, brook trout are arguably the most beautiful freshwater fish on the continent, with a dark olive-green body covered in vermiculated (worm-like) patterns on the back and dorsal fin, pale spots and vivid red spots with blue halos along the flanks, and brilliant orange-red fins edged in white and black during spawning season. Brook trout require the coldest and cleanest water of any trout species, making them excellent indicators of watershed health. While brook trout in their native eastern streams rarely exceed 10 inches, populations in larger rivers, lakes, and the sea-run variety known as salters can grow substantially larger.",
    imageUrl:
      "https://images.unsplash.com/photo-1587621093393-a0e78ac9cb10?w=1200&q=80", // PLACEHOLDER
    nativeRange: "Eastern North America, from Georgia to the Arctic Circle",
    averageSize: "6-12 inches, 0.25-1.5 lbs",
    recordSize: "14 lbs 8 oz (Nipigon River, Ontario, 1916)",
    preferredHabitat:
      "Small, cold headwater streams with dense canopy; spring-fed creeks and beaver ponds; requires water below 65 degrees F",
    preferredFlies: [
      "Royal Wulff #12-16",
      "Ausable Wulff #10-14",
      "Elk Hair Caddis #14-16",
      "Mickey Finn #8-12",
      "Bead Head Prince Nymph #12-16",
      "Black-nosed Dace #8-12",
      "Adams #14-16",
    ],
  },
  {
    id: "species-mountain-whitefish",
    slug: "mountain-whitefish",
    commonName: "Mountain Whitefish",
    scientificName: "Prosopium williamsoni",
    description:
      "The mountain whitefish is the unsung hero of western trout streams. Often overlooked or even disparaged by trout-focused anglers, mountain whitefish are native to the cold rivers and lakes of western North America and frequently outnumber trout in many premier fisheries. They are a member of the salmonid family, characterized by their silvery body, small mouth, and forked tail. Mountain whitefish feed primarily on aquatic invertebrates along the river bottom, making them excellent targets for nymph fishers, and they can provide fast-paced action during winter months when trout fishing slows. Increasingly, fly anglers are recognizing mountain whitefish as worthy quarry in their own right, appreciating their strong fights and the skill required to effectively target them with small nymphs and midges.",
    imageUrl:
      "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&q=80", // PLACEHOLDER
    nativeRange:
      "Western North America, from the Rockies to the Pacific Coast",
    averageSize: "10-16 inches, 0.5-2 lbs",
    recordSize: "5 lbs 8 oz (Elbow River, Alberta, 1963)",
    preferredHabitat:
      "Cold, clear rivers and streams; deep runs and pools with gravel and cobble bottoms",
    preferredFlies: [
      "Bead Head Pheasant Tail #16-20",
      "RS2 #18-22",
      "Zebra Midge #18-22",
      "San Juan Worm #12-14",
      "Copper John #16-20",
      "Mercury Midge #20-24",
      "WD-40 #18-22",
    ],
  },
  {
    id: "species-arctic-grayling",
    slug: "arctic-grayling",
    commonName: "Arctic Grayling",
    scientificName: "Thymallus arcticus",
    description:
      "The Arctic grayling is one of the most visually striking freshwater fish in North America, instantly recognizable by its enormous, sail-like dorsal fin that is often adorned with iridescent spots of blue, purple, and pink. Once widespread across the northern half of the continent, Arctic grayling have been reduced to a fraction of their historical range in the lower 48 states, with Montana's Big Hole River supporting the last self-sustaining fluvial population in the contiguous United States. In Alaska, British Columbia, and the Canadian Arctic, grayling remain abundant and provide outstanding fly fishing opportunities. They are enthusiastic surface feeders, making them a dream species for dry fly purists, and they are found in some of the most remote and scenic waters on the planet. Their willingness to rise to a well-presented dry fly and the spectacular beauty of their dorsal fin make every grayling caught a memorable experience.",
    imageUrl:
      "https://images.unsplash.com/photo-1596394723269-e8e8e8e8e8e8?w=1200&q=80", // PLACEHOLDER
    nativeRange:
      "Northern North America, from Alaska through Canada; relic populations in Montana and Michigan",
    averageSize: "10-15 inches, 0.5-1.5 lbs",
    recordSize: "5 lbs 15 oz (Katseyedie River, Northwest Territories, 1967)",
    preferredHabitat:
      "Clear, cold rivers and lakes in northern regions; gravel-bottomed pools and runs in flowing water",
    preferredFlies: [
      "Royal Wulff #12-16",
      "Elk Hair Caddis #14-16",
      "Adams #14-16",
      "Black Gnat #14-18",
      "Parachute Adams #14-18",
      "Griffith's Gnat #18-22",
      "Prince Nymph #14-16",
    ],
  },
  {
    id: "species-largemouth-bass",
    slug: "largemouth-bass",
    commonName: "Largemouth Bass",
    scientificName: "Micropterus salmoides",
    description:
      "The largemouth bass is the most popular freshwater game fish in North America and has built an enormous following among both conventional and fly anglers. Named for its large mouth that extends past the eye when closed, the largemouth bass is an apex predator in warm-water ecosystems, feeding on everything from insects and crayfish to frogs, mice, and smaller fish. While traditionally associated with spinning and baitcasting gear, fly fishing for largemouth bass has surged in popularity, offering explosive topwater takes on poppers and gurgler patterns that rival any trout rise for excitement. Largemouth bass are found in ponds, lakes, reservoirs, and slow-moving rivers across the United States, making them one of the most accessible game fish for fly anglers. Their aggressive strikes, powerful fights, and tolerance of warm water make them an ideal species for anglers looking to extend their fly fishing beyond cold-water trout streams.",
    imageUrl:
      "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=1200&q=80", // PLACEHOLDER
    nativeRange:
      "Eastern and central North America; introduced worldwide",
    averageSize: "12-20 inches, 1-5 lbs",
    recordSize: "22 lbs 4 oz (Montgomery Lake, Georgia, 1932)",
    preferredHabitat:
      "Warm, shallow lakes and ponds with abundant vegetation; submerged structure like docks, fallen timber, and weed edges",
    preferredFlies: [
      "Boogle Bug Popper #2-6",
      "Clouser Minnow #2-6",
      "Dahlberg Diver #1/0-4",
      "Woolly Bugger #4-8",
      "Gurgler #2-6",
      "Deer Hair Mouse #2-6",
      "Crayfish patterns #2-6",
    ],
  },
  {
    id: "species-bonefish",
    slug: "bonefish",
    commonName: "Bonefish",
    scientificName: "Albula vulpes",
    description:
      "The bonefish is the undisputed king of the saltwater flats and the species that launched the entire saltwater fly fishing revolution. Found on shallow tropical flats throughout the Caribbean, Bahamas, and Indo-Pacific, bonefish are often called the grey ghost for their silvery, torpedo-shaped bodies that seem to materialize out of nowhere on the white sand flats. Sight fishing for bonefish on the flats is considered by many to be the most exciting and visually engaging form of fly fishing, requiring accurate casting, careful wading, and a deep understanding of tidal movements and flat ecology. When hooked, bonefish are famous for their blistering initial run, often peeling off a hundred yards of backing in seconds. The challenge of spotting a tailing or cruising fish, making a precise cast, and then holding on during that first explosive run makes bonefishing an addiction that draws anglers back to the flats year after year.",
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80", // PLACEHOLDER
    nativeRange:
      "Tropical and subtropical flats worldwide; Caribbean, Bahamas, Florida Keys, Indo-Pacific",
    averageSize: "18-26 inches, 3-8 lbs",
    recordSize: "16 lbs (Biscayne Bay, Florida, 2007)",
    preferredHabitat:
      "Shallow saltwater flats with sand, turtle grass, and marl bottoms; tidal channels and mangrove edges",
    preferredFlies: [
      "Gotcha #4-8",
      "Crazy Charlie #4-8",
      "Christmas Island Special #6",
      "Mantis Shrimp #4-6",
      "Bonefish Bitter #4-6",
      "Clouser Minnow #4-6",
      "Spawning Shrimp #6-8",
    ],
  },
];
