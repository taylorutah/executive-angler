/**
 * Quick seed — Top 20 hero trout fly patterns into canonical_flies
 * Usage: SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-flies-quick.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://api.executiveangler.com";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface FlyData {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  history: string;
  tying_overview: string;
  materials_list: { material: string; description: string; substitute?: string }[];
  tying_steps: { step: number; instruction: string; tip?: string }[];
  fishing_tips: string;
  when_to_use: string;
  imitates: string[];
  effective_species: string[];
  water_types: string[];
  sizes: string[];
  colors: string[];
  bead_options: string[];
  hook_styles: string[];
  key_variations: { name: string; slugFragment: string; description: string; sizes?: string[]; bead?: string; colors?: string[] }[];
  origin_credit: string;
  video_url: string;
  rank: number;
  featured: boolean;
  is_hero_pattern: boolean;
}

const flies: FlyData[] = [
  {
    slug: "parachute-adams",
    name: "Parachute Adams",
    category: "dry",
    tagline: "The most versatile dry fly ever tied",
    description: "The Parachute Adams is arguably the single most effective dry fly pattern in existence. Its gray body and grizzly hackle create a buggy silhouette that imitates a wide range of mayflies. The parachute-style hackle allows the fly to sit flush in the surface film, presenting a realistic profile to feeding trout. Effective on virtually every trout stream in the world.",
    history: "The original Adams was created by Leonard Halladay in 1922 for his friend Charles Adams, who was fishing the Boardman River in Michigan. The parachute version evolved later, offering improved flotation and a more realistic mayfly silhouette when viewed from below.",
    tying_overview: "A classic dry fly with a parachute-style hackle wrapped around a white post, gray dubbing body, and mixed grizzly and brown hackle fibers for the tail.",
    materials_list: [
      { material: "Hook", description: "TMC 100, #12-20", substitute: "Dai-Riki 300" },
      { material: "Thread", description: "8/0 gray" },
      { material: "Post", description: "White calf body hair or EP Trigger Point" },
      { material: "Tail", description: "Mixed grizzly and brown hackle fibers" },
      { material: "Body", description: "Adams gray superfine dubbing" },
      { material: "Hackle", description: "Grizzly and brown, parachute style" },
    ],
    tying_steps: [
      { step: 1, instruction: "Start thread behind the eye and wrap a solid thread base to the bend.", tip: "Keep wraps tight and even for a smooth body." },
      { step: 2, instruction: "Tie in mixed grizzly and brown hackle fibers for the tail, about shank length." },
      { step: 3, instruction: "At the 1/3 point from the eye, tie in a clump of white calf body hair, posting it upright with thread wraps.", tip: "Build a solid thread dam in front and behind the post." },
      { step: 4, instruction: "Tie in one grizzly and one brown hackle feather at the base of the post." },
      { step: 5, instruction: "Dub a slim body of Adams gray superfine from the tail to just behind the post." },
      { step: 6, instruction: "Wrap the hackle feathers around the post parachute-style, 3-4 turns each, and tie off.", tip: "Wrap the hackle clockwise (looking down) so the fibers splay horizontally." },
      { step: 7, instruction: "Whip finish behind the eye and apply a small drop of head cement." },
    ],
    fishing_tips: "Dead drift the Parachute Adams through riffles, seams, and along current edges. It excels during mayfly hatches but works equally well as a searching pattern when no hatch is visible. The white post makes it easy to track in broken water.",
    when_to_use: "Effective year-round, especially during mayfly hatches from March through October. Sizes 14-16 are the most versatile; go smaller (18-20) on tailwaters and spring creeks.",
    imitates: ["mayfly dun", "BWO", "PMD", "general attractor"],
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18", "20"],
    colors: ["Gray", "Olive", "Black"],
    bead_options: ["None"],
    hook_styles: ["Standard dry", "Wide gap"],
    key_variations: [
      { name: "Hi-Vis Post", slugFragment: "hi-vis", description: "Fluorescent orange or pink post for low-light visibility", colors: ["Orange post", "Pink post"] },
      { name: "CDC Adams", slugFragment: "cdc", description: "CDC feather replaces hackle for ultra-realistic flush float" },
      { name: "Olive Adams", slugFragment: "olive", description: "Olive dubbing body to match BWO hatches", colors: ["Olive"] },
    ],
    origin_credit: "Leonard Halladay, 1922",
    video_url: "https://www.youtube.com/watch?v=KCd4-4k-v0c",
    rank: 1,
    featured: true,
    is_hero_pattern: true,
  },
  {
    slug: "pheasant-tail-nymph",
    name: "Pheasant Tail Nymph",
    category: "nymph",
    tagline: "The most versatile nymph in any fly box",
    description: "The Pheasant Tail Nymph is the quintessential subsurface fly, imitating a wide range of mayfly nymphs with its slim, segmented profile. Pheasant tail fibers create a natural, buggy appearance that trout find irresistible. Whether dead-drifted through riffles or swung through runs, this pattern consistently produces fish on every type of trout water.",
    history: "Created by Frank Sawyer, a legendary river keeper on England's River Avon, in the 1950s. Sawyer designed the original without hackle, relying solely on copper wire and pheasant tail fibers. The beadhead version popularized in the 1990s added weight and flash.",
    tying_overview: "A slim nymph tied entirely with pheasant tail fibers over copper wire, with a peacock herl thorax. Modern versions add a tungsten bead for weight.",
    materials_list: [
      { material: "Hook", description: "TMC 3761, #14-18", substitute: "Dai-Riki 060" },
      { material: "Bead", description: "Tungsten, 3/32\" gold" },
      { material: "Thread", description: "8/0 brown" },
      { material: "Tail", description: "Pheasant tail fibers, 4-6 strands" },
      { material: "Rib", description: "Fine copper wire" },
      { material: "Abdomen", description: "Pheasant tail fibers, wrapped" },
      { material: "Thorax", description: "Peacock herl, 2-3 strands" },
      { material: "Wingcase", description: "Pheasant tail fibers, pulled over" },
      { material: "Legs", description: "Pheasant tail fiber tips" },
    ],
    tying_steps: [
      { step: 1, instruction: "Slide a tungsten bead onto the hook and secure in the vise. Start thread behind the bead.", tip: "Use lead-free wire wraps behind the bead for extra weight on deep runs." },
      { step: 2, instruction: "Tie in 4-6 pheasant tail fibers for the tail, about 3/4 shank length." },
      { step: 3, instruction: "Tie in fine copper wire at the tail tie-in point for the rib." },
      { step: 4, instruction: "Wrap pheasant tail fibers forward to create a slim, tapered abdomen, stopping 1/3 from the bead." },
      { step: 5, instruction: "Counter-wrap the copper wire forward as a rib, 4-5 even turns. Tie off and trim." },
      { step: 6, instruction: "Tie in a clump of pheasant tail fibers for the wingcase, tips pointing rearward." },
      { step: 7, instruction: "Wrap 2-3 strands of peacock herl for the thorax. Pull the wingcase fibers over the top and tie down.", tip: "Let the pheasant tail tips extend as legs on each side." },
      { step: 8, instruction: "Whip finish behind the bead. Apply UV resin to the wingcase for durability." },
    ],
    fishing_tips: "Dead drift under an indicator or as a dropper below a dry fly. The PT is most effective in the bottom 12 inches of the water column. Euro-nymph it with a tight line for maximum sensitivity. Set the hook on any hesitation.",
    when_to_use: "Effective year-round but especially deadly during BWO and PMD hatches. Use larger sizes (14-16) in spring and fall, smaller sizes (18-20) on tailwaters and during summer.",
    imitates: ["mayfly nymph", "BWO nymph", "PMD nymph", "March Brown nymph"],
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18", "20"],
    colors: ["Natural", "Olive", "Brown"],
    bead_options: ["Tungsten gold", "Tungsten black nickel", "Brass", "None"],
    hook_styles: ["Standard nymph", "Jig", "Curved"],
    key_variations: [
      { name: "Flashback", slugFragment: "flashback", description: "Pearl flashabou wingcase adds flash attraction", colors: ["Natural"] },
      { name: "Olive Beadhead", slugFragment: "olive-beadhead", description: "Olive-dyed pheasant tail for BWO matching", colors: ["Olive"], bead: "Tungsten gold" },
      { name: "Jig PT", slugFragment: "jig", description: "Jig hook with slotted tungsten bead for Euro nymphing", bead: "Tungsten slotted" },
      { name: "Soft Hackle PT", slugFragment: "soft-hackle", description: "Partridge hackle collar for swing presentations" },
    ],
    origin_credit: "Frank Sawyer, 1958",
    video_url: "https://www.youtube.com/watch?v=UxJp7DJAVY4",
    rank: 2,
    featured: true,
    is_hero_pattern: true,
  },
  {
    slug: "hares-ear-nymph",
    name: "Hare's Ear Nymph",
    category: "nymph",
    tagline: "The ultimate impressionistic nymph",
    description: "The Gold-Ribbed Hare's Ear is a buggy, impressionistic nymph that imitates almost everything trout eat underwater — mayflies, caddis, stoneflies, and even scuds. The spiky guard hairs of the hare's mask dubbing create movement and life, while the gold rib adds segmentation and flash. A must-have in every fly box.",
    history: "One of the oldest fly patterns in existence, with roots tracing to 15th century England. The modern beadhead version emerged in the early 1990s and quickly became the most popular nymph pattern worldwide.",
    tying_overview: "Dubbed hare's ear fur over a gold-ribbed body with a pulled-over wingcase. The key is picking out the guard hairs to create a buggy, lifelike profile.",
    materials_list: [
      { material: "Hook", description: "TMC 3761, #10-18" },
      { material: "Bead", description: "Gold tungsten, 3/32\"-7/64\"" },
      { material: "Thread", description: "8/0 tan or brown" },
      { material: "Tail", description: "Hare's mask guard hairs" },
      { material: "Rib", description: "Fine gold wire or oval tinsel" },
      { material: "Abdomen", description: "Hare's ear dubbing, natural" },
      { material: "Wingcase", description: "Turkey tail or mottled turkey quill" },
      { material: "Thorax", description: "Hare's ear dubbing, picked out" },
    ],
    tying_steps: [
      { step: 1, instruction: "Slide bead on hook, start thread behind bead, wrap to bend." },
      { step: 2, instruction: "Tie in guard hair tail fibers and gold wire rib." },
      { step: 3, instruction: "Dub a tapered abdomen of hare's ear fur to the thorax area." },
      { step: 4, instruction: "Wrap gold wire rib forward in 4-5 turns. Tie off." },
      { step: 5, instruction: "Tie in turkey quill wingcase section, tips rearward." },
      { step: 6, instruction: "Dub a full thorax. Pull wingcase over and tie down behind bead.", tip: "Use a dubbing brush to pick out guard hairs from the thorax — this is what makes the fly." },
      { step: 7, instruction: "Whip finish. Pick out dubbing fibers on sides and bottom for legs." },
    ],
    fishing_tips: "Dead drift through runs and riffles at or near the bottom. Extremely effective as the upper fly in a two-nymph rig. Works well as an all-day confidence pattern when you're not sure what to throw. Add a slight twitch on the swing for aggressive takes.",
    when_to_use: "Year-round effectiveness. Particularly deadly in spring during stonefly and early mayfly activity. Sizes 12-14 are best for freestone rivers, 16-18 for tailwaters.",
    imitates: ["mayfly nymph", "caddis larva", "stonefly nymph", "scud", "general attractor"],
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    water_types: ["freestone", "tailwater", "spring creek", "lake"],
    sizes: ["10", "12", "14", "16", "18"],
    colors: ["Natural", "Tan", "Olive", "Dark"],
    bead_options: ["Tungsten gold", "Brass", "None"],
    hook_styles: ["Standard nymph", "Jig", "Curved"],
    key_variations: [
      { name: "Gold Ribbed (Classic)", slugFragment: "gold-ribbed", description: "Traditional version without bead, gold wire rib" },
      { name: "Jig Hare's Ear", slugFragment: "jig", description: "Jig hook for Euro nymphing techniques", bead: "Slotted tungsten" },
      { name: "Soft Hackle Hare's Ear", slugFragment: "soft-hackle", description: "Added partridge hackle collar for swing presentations" },
    ],
    origin_credit: "Traditional, pre-1500s England",
    video_url: "https://www.youtube.com/watch?v=qCNz2RF3Z3s",
    rank: 3,
    featured: true,
    is_hero_pattern: true,
  },
  {
    slug: "elk-hair-caddis",
    name: "Elk Hair Caddis",
    category: "dry",
    tagline: "The definitive caddis imitation",
    description: "The Elk Hair Caddis is the go-to dry fly pattern for imitating adult caddisflies across all trout waters. Its tent-wing profile made from elk hair provides excellent flotation and a realistic silhouette. Whether fished dead drift or with a slight skate, it consistently triggers aggressive surface takes from trout feeding on caddis.",
    history: "Created by Al Troth in 1957 while fishing the Bitterroot River in Montana. Troth's innovation of using elk hair for the wing revolutionized caddis imitations with its superior buoyancy and realistic tent-wing profile.",
    tying_overview: "A palmered hackle body with a deer or elk hair wing tied tent-style over the top. Simple to tie and incredibly durable on the water.",
    materials_list: [
      { material: "Hook", description: "TMC 100, #12-18" },
      { material: "Thread", description: "8/0 tan" },
      { material: "Rib", description: "Fine gold wire (counter-wrapped)" },
      { material: "Body", description: "Hare's ear dubbing or superfine" },
      { material: "Hackle", description: "Brown or grizzly, palmered" },
      { material: "Wing", description: "Elk body hair, natural" },
    ],
    tying_steps: [
      { step: 1, instruction: "Start thread and wrap to the bend. Tie in gold wire and hackle feather at the bend." },
      { step: 2, instruction: "Dub a tapered body forward, leaving room behind the eye for the wing." },
      { step: 3, instruction: "Palmer the hackle forward through the body in even spirals. Tie off.", tip: "Keep hackle wraps slightly spaced — too dense makes the fly ride too high." },
      { step: 4, instruction: "Counter-wrap the gold wire through the hackle to reinforce it. Tie off." },
      { step: 5, instruction: "Clean and stack a clump of elk hair. Measure to extend just past the bend." },
      { step: 6, instruction: "Tie in the elk hair wing with 3-4 tight wraps, letting the hair flare slightly." },
      { step: 7, instruction: "Trim the elk hair butts at an angle, build a neat thread head, and whip finish." },
    ],
    fishing_tips: "Dead drift through riffles and pocket water during caddis hatches. When fish are chasing emergers, add a slight downstream skate — caddis are active flyers and trout expect movement. Also deadly as a hopper-dropper dry fly with a nymph trailing behind.",
    when_to_use: "Prime time is June through September during caddis hatches. Effective in sizes 14-16 on most waters. Use olive bodies for green caddis and tan for tan/brown caddis.",
    imitates: ["adult caddis", "egg-laying caddis", "general attractor"],
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Tan", "Olive", "Brown", "Black"],
    bead_options: ["None"],
    hook_styles: ["Standard dry"],
    key_variations: [
      { name: "X-Caddis", slugFragment: "x-caddis", description: "Trailing shuck version for crippled or emerging caddis" },
      { name: "CDC Caddis", slugFragment: "cdc", description: "CDC underwing for improved floatation and silhouette" },
      { name: "Olive EHC", slugFragment: "olive", description: "Olive body for green caddis species", colors: ["Olive"] },
    ],
    origin_credit: "Al Troth, 1957",
    video_url: "https://www.youtube.com/watch?v=6R5EGfgbfHk",
    rank: 4,
    featured: true,
    is_hero_pattern: true,
  },
  {
    slug: "zebra-midge",
    name: "Zebra Midge",
    category: "nymph",
    tagline: "Simple, deadly, indispensable",
    description: "The Zebra Midge is one of the simplest yet most effective fly patterns ever devised. Just thread and wire on a hook with a small bead, it imitates the larval and pupal stages of midges — the most abundant food source in most trout rivers. Its slim profile and subtle flash make it irresistible to selective trout, especially on tailwaters and spring creeks.",
    history: "The Zebra Midge emerged from the competitive fly fishing scene in the late 1990s. Its origins are debated, but it gained widespread popularity on Colorado's South Platte tailwaters where midge-feeding trout demand precise imitations.",
    tying_overview: "A minimalist pattern: bead, thread, and fine wire wrapped in alternating bands on a curved hook. Takes 30 seconds to tie.",
    materials_list: [
      { material: "Hook", description: "TMC 2488, #16-22", substitute: "Dai-Riki 125" },
      { material: "Bead", description: "Silver or black tungsten, 2mm-2.5mm" },
      { material: "Thread", description: "8/0 or 12/0, black or red" },
      { material: "Rib", description: "Fine silver wire" },
    ],
    tying_steps: [
      { step: 1, instruction: "Slide bead onto hook. Start thread behind bead, build a small thread dam." },
      { step: 2, instruction: "Wrap thread to the bend. Tie in fine silver wire." },
      { step: 3, instruction: "Wrap thread forward to the bead, building a slight taper.", tip: "Keep wraps very smooth — any lumpiness ruins the sleek midge profile." },
      { step: 4, instruction: "Wrap the wire forward in even, spaced turns creating the zebra stripe effect." },
      { step: 5, instruction: "Tie off wire behind bead. Whip finish. Apply thin UV resin if desired." },
    ],
    fishing_tips: "Dead drift in the top 2 feet of the water column, especially in slow tailwater runs. Fish it as a dropper behind a larger nymph or below a dry fly indicator. Set the hook softly on tailwater takes — midge-sipping trout don't slam the fly.",
    when_to_use: "Best in winter and early spring when midges are the primary food source. On tailwaters, effective year-round. Sizes 18-22 are standard; go to 24-26 on ultra-clear spring creeks.",
    imitates: ["midge larva", "midge pupa"],
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["16", "18", "20", "22", "24", "26"],
    colors: ["Black", "Red", "Olive", "Copper"],
    bead_options: ["Silver tungsten", "Black tungsten", "Copper tungsten"],
    hook_styles: ["Curved", "Standard nymph"],
    key_variations: [
      { name: "Red Zebra", slugFragment: "red", description: "Red thread body — especially effective in winter", colors: ["Red"] },
      { name: "UV Resin Zebra", slugFragment: "uv-resin", description: "UV resin coating for added sheen and durability" },
      { name: "Olive Zebra", slugFragment: "olive", description: "Olive thread matches green midge species", colors: ["Olive"] },
    ],
    origin_credit: "South Platte anglers, late 1990s",
    video_url: "https://www.youtube.com/watch?v=r9MnUjHVEz8",
    rank: 5,
    featured: true,
    is_hero_pattern: true,
  },
  {
    slug: "woolly-bugger",
    name: "Woolly Bugger",
    category: "streamer",
    tagline: "If you could only fish one fly, this would be it",
    description: "The Woolly Bugger is the most versatile fly pattern ever created. Part streamer, part nymph, part attractor — it imitates leeches, baitfish, crayfish, large stonefly nymphs, and even sculpin. Strip it, swing it, dead drift it, jig it — every retrieve style catches fish. No fly box is complete without a selection of Woolly Buggers in black, olive, and brown.",
    history: "Russell Blessing created the Woolly Bugger in 1967 in Lancaster County, Pennsylvania, originally designed to imitate hellgrammites in the Susquehanna River. It combined the Woolly Worm with a marabou tail, creating what many consider the most successful fly pattern of the 20th century.",
    tying_overview: "A marabou tail, chenille body, and palmered hackle create maximum movement in the water. The beadhead version adds a jigging action that triggers aggressive strikes.",
    materials_list: [
      { material: "Hook", description: "TMC 5263, #4-10", substitute: "Dai-Riki 700" },
      { material: "Bead", description: "Tungsten or brass, 5/32\"-3/16\"" },
      { material: "Thread", description: "6/0 black" },
      { material: "Tail", description: "Black marabou, shank length" },
      { material: "Flash", description: "Crystal flash or Krystal Flash, 4-6 strands" },
      { material: "Body", description: "Medium black chenille" },
      { material: "Hackle", description: "Black saddle hackle, palmered" },
    ],
    tying_steps: [
      { step: 1, instruction: "Slide bead on hook. Start thread, wrap to bend." },
      { step: 2, instruction: "Tie in a full marabou plume for the tail, extending one hook shank length beyond the bend.", tip: "Don't trim marabou — tie in the whole tip for maximum movement." },
      { step: 3, instruction: "Add 4-6 strands of crystal flash along each side of the tail." },
      { step: 4, instruction: "Tie in a saddle hackle feather at the tail. Tie in chenille." },
      { step: 5, instruction: "Wrap chenille forward to the bead, creating a full body. Tie off." },
      { step: 6, instruction: "Palmer the hackle forward through the body in even spirals. Tie off behind the bead.", tip: "Stroke hackle fibers rearward as you wrap for a streamlined profile." },
      { step: 7, instruction: "Whip finish behind the bead. Cement the head." },
    ],
    fishing_tips: "Strip it with short, erratic pulls along banks and structure. Swing it through runs on a tight line. Dead drift it under an indicator in deep pools. The Woolly Bugger catches fish on every retrieve — experiment until you find what works that day. Target structure: undercut banks, log jams, and deep pools.",
    when_to_use: "Effective year-round, but especially productive in spring runoff (olive #8) and fall pre-spawn (black #6). Fish it in low light — early morning, late evening, and overcast days — for the biggest fish.",
    imitates: ["leech", "baitfish", "crayfish", "stonefly nymph", "sculpin", "general attractor"],
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    water_types: ["freestone", "tailwater", "lake"],
    sizes: ["4", "6", "8", "10"],
    colors: ["Black", "Olive", "Brown", "White"],
    bead_options: ["Tungsten", "Brass", "Cone", "None"],
    hook_styles: ["3XL streamer", "Standard"],
    key_variations: [
      { name: "Conehead Bugger", slugFragment: "conehead", description: "Cone head for faster sink and jigging action", bead: "Cone, brass or tungsten" },
      { name: "Crystal Bugger", slugFragment: "crystal", description: "Crystal chenille body for maximum flash" },
      { name: "Olive Bugger", slugFragment: "olive", description: "Olive color imitates leeches and sculpin", colors: ["Olive"] },
      { name: "Articulated Bugger", slugFragment: "articulated", description: "Two-piece articulated version for big water and big fish" },
    ],
    origin_credit: "Russell Blessing, 1967",
    video_url: "https://www.youtube.com/watch?v=SWP-Bpv7ryI",
    rank: 6,
    featured: true,
    is_hero_pattern: true,
  },
  // Non-hero patterns (rank 7-20) — minimal data
  ...[
    { slug: "rs2", name: "RS2", category: "emerger", rank: 7, description: "Rim Chung's RS2 is a deadly baetis emerger pattern. The sparse CDC or Antron wing and slim thread body perfectly imitate a mayfly struggling to break through the surface film. A go-to pattern on tailwaters during BWO hatches.", sizes: ["18", "20", "22", "24"], colors: ["Gray", "Olive", "Black"], imitates: ["mayfly emerger", "BWO emerger", "PMD emerger"], water_types: ["tailwater", "spring creek"], bead_options: ["None", "Tungsten micro"] },
    { slug: "frenchie", name: "Frenchie", category: "nymph", rank: 8, description: "A Euro nymphing staple that combines the Pheasant Tail Nymph with a fluorescent hot spot collar. The UV-bright dubbing collar triggers strikes from trout that would ignore more subtle patterns. Essential for competitive nymphing techniques.", sizes: ["12", "14", "16", "18", "20"], colors: ["Pink hot spot", "Orange hot spot", "Natural"], imitates: ["mayfly nymph", "caddis larva", "general attractor"], water_types: ["freestone", "tailwater"], bead_options: ["Tungsten slotted"], hook_styles: ["Jig"] },
    { slug: "perdigon", name: "Perdigon", category: "nymph", rank: 9, description: "Born in Spanish competitive fly fishing, the Perdigon is a tungsten-loaded, UV-resin-coated nymph designed to sink fast and stay deep. Its smooth, glossy body cuts through the water column like a bullet. The go-to pattern for Euro nymphing in fast, deep water.", sizes: ["14", "16", "18", "20", "22"], colors: ["Olive", "Black", "Brown", "Purple"], imitates: ["mayfly nymph", "caddis larva"], water_types: ["freestone", "tailwater"], bead_options: ["Tungsten slotted"], hook_styles: ["Jig"] },
    { slug: "san-juan-worm", name: "San Juan Worm", category: "nymph", rank: 10, description: "Love it or hate it, the San Juan Worm catches trout. This simple pattern imitates aquatic worms that wash into the drift during high water events. It's especially deadly after rain, during runoff, or below dam releases. A confidence pattern that puts fish in the net.", sizes: ["10", "12", "14", "16"], colors: ["Red", "Pink", "Brown", "Wine"], imitates: ["aquatic worm", "annelid"], water_types: ["freestone", "tailwater"], bead_options: ["None", "Tungsten micro"] },
    { slug: "copper-john", name: "Copper John", category: "nymph", rank: 11, description: "John Barr's Copper John is a heavy, flashy attractor nymph that sinks fast and draws attention. The copper wire body, flashback wingcase, and rubber legs create a pattern that looks like nothing and everything at once. One of the most productive nymph patterns ever created.", sizes: ["12", "14", "16", "18"], colors: ["Copper", "Red", "Green", "Chartreuse"], imitates: ["mayfly nymph", "stonefly nymph", "general attractor"], water_types: ["freestone", "tailwater"], bead_options: ["Tungsten gold", "Tungsten black"], hook_styles: ["Standard nymph"] },
    { slug: "bwo-parachute", name: "BWO Parachute", category: "dry", rank: 12, description: "A dedicated Blue-Winged Olive imitation with an olive dubbing body and dun hackle. The parachute post provides visibility and realistic low-riding profile. Essential during the prolific BWO hatches that occur on virtually every trout stream from fall through spring.", sizes: ["16", "18", "20", "22"], colors: ["Olive", "Gray-olive"], imitates: ["BWO dun", "baetis dun"], water_types: ["tailwater", "spring creek", "freestone"], bead_options: ["None"] },
    { slug: "griffiths-gnat", name: "Griffith's Gnat", category: "dry", rank: 13, description: "George Griffith's midge cluster imitation is a tiny but mighty dry fly. Palmered grizzly hackle over a peacock herl body creates a buggy, sparkly profile that imitates midge clusters and individual adults. Essential for winter and spring midge hatches on tailwaters.", sizes: ["18", "20", "22", "24"], colors: ["Black", "Peacock"], imitates: ["midge cluster", "midge adult"], water_types: ["tailwater", "spring creek"], bead_options: ["None"] },
    { slug: "stimulator", name: "Stimulator", category: "dry", rank: 14, description: "Randall Kaufmann's Stimulator is an oversized attractor dry fly that imitates stoneflies, caddis, and grasshoppers depending on size and color. Its buoyant elk hair wing and palmered hackle let it ride high through the fastest pocket water. A favorite hopper-dropper top fly.", sizes: ["8", "10", "12", "14"], colors: ["Orange", "Yellow", "Olive", "Royal"], imitates: ["stonefly adult", "caddis adult", "grasshopper", "general attractor"], water_types: ["freestone"], bead_options: ["None"] },
    { slug: "royal-wulff", name: "Royal Wulff", category: "dry", rank: 15, description: "Lee Wulff's iconic attractor dry fly with its distinctive peacock herl body, red floss band, and white calf hair wings. The Royal Wulff is designed to be visible, buoyant, and irresistible. It catches trout when nothing is hatching and works on every type of trout water from mountain freestone to lowland meadow streams.", sizes: ["10", "12", "14", "16"], colors: ["Peacock/Red/White"], imitates: ["general attractor", "mayfly dun"], water_types: ["freestone", "spring creek"], bead_options: ["None"] },
    { slug: "cdc-emerger", name: "CDC Emerger", category: "emerger", rank: 16, description: "A minimalist emerger pattern using CDC feather for the wing, creating an ultra-realistic impression of a mayfly struggling to break through the surface film. The CDC traps air bubbles naturally, keeping the fly in the surface tension zone where trout key on vulnerable emergers.", sizes: ["16", "18", "20", "22"], colors: ["Olive", "Gray", "Tan"], imitates: ["mayfly emerger", "BWO emerger", "PMD emerger"], water_types: ["tailwater", "spring creek", "freestone"], bead_options: ["None"] },
    { slug: "klinkhammer-special", name: "Klinkhammer Special", category: "emerger", rank: 17, description: "Hans van Klinken's revolutionary emerger design hangs the abdomen below the surface film while the parachute hackle and wing sit above. This split-level presentation perfectly imitates a hatching mayfly — the most vulnerable and irresistible stage for trout. A pattern every serious angler should master.", sizes: ["12", "14", "16", "18"], colors: ["Olive", "Tan", "Black"], imitates: ["mayfly emerger", "caddis emerger"], water_types: ["freestone", "tailwater", "spring creek"], bead_options: ["None"] },
    { slug: "egg-pattern", name: "Egg Pattern", category: "egg", rank: 18, description: "Simple yarn or chenille egg patterns imitate fish eggs drifting in the current during spawning season. Whether trout, whitefish, or salmon eggs, this pattern triggers an opportunistic feeding response that's hard for trout to resist. Dead drift it through spawning gravel and tailouts.", sizes: ["10", "12", "14", "16"], colors: ["Pink", "Orange", "Peach", "Yellow", "Chartreuse"], imitates: ["fish egg", "salmon egg", "trout egg"], water_types: ["freestone", "tailwater"], bead_options: ["None", "Bead"] },
    { slug: "midge-larva", name: "Midge Larva", category: "midge", rank: 19, description: "A simple thread-body pattern imitating the larval stage of chironomid midges. Despite its simplicity, this pattern accounts for a significant portion of the trout diet, especially in tailwaters where midges are the dominant food source. Fish it deep and slow on a dead drift.", sizes: ["18", "20", "22", "24", "26"], colors: ["Black", "Red", "Olive", "Cream"], imitates: ["midge larva", "chironomid larva"], water_types: ["tailwater", "spring creek", "lake"], bead_options: ["Glass bead", "Tungsten micro", "None"] },
    { slug: "sculpzilla", name: "Sculpzilla", category: "streamer", rank: 20, description: "A modern sculpin imitation designed by the late Kelly Galloup. The weighted head and fish-skull create an aggressive jigging action that triggers predatory instincts in large brown trout. Fish it on a sinking line with aggressive strips along structure for trophy-class fish.", sizes: ["4", "6", "8", "10"], colors: ["Olive", "White", "Brown", "Sculpin olive"], imitates: ["sculpin", "baitfish", "darter"], water_types: ["freestone", "tailwater"], bead_options: ["Fish skull", "Weighted", "Cone"] },
  ].map((f) => ({
    ...f,
    featured: false,
    is_hero_pattern: false,
    tagline: "",
    history: "",
    tying_overview: "",
    materials_list: [],
    tying_steps: [],
    fishing_tips: "",
    when_to_use: "",
    effective_species: ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"],
    key_variations: [],
    origin_credit: "",
    video_url: "",
    hook_styles: f.hook_styles || ["Standard"],
    bead_options: f.bead_options || ["None"],
    colors: f.colors || [],
  })),
];

async function seed() {
  console.log(`🪰 Seeding ${flies.length} canonical flies...`);

  for (const fly of flies) {
    const { error } = await supabase
      .from("canonical_flies")
      .upsert(fly, { onConflict: "slug" });

    if (error) {
      console.error(`  ❌ ${fly.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${fly.name} (rank ${fly.rank})`);
    }
  }

  // Verify count
  const { count } = await supabase
    .from("canonical_flies")
    .select("id", { count: "exact", head: true });

  console.log(`\n✅ Done! ${count} canonical flies in database.`);
}

seed().catch(console.error);
