/**
 * Executive Angler — Canonical Flies Seed Script
 *
 * Seeds 100 trout fly patterns into the `canonical_flies` Supabase table.
 * Distribution: 22 dry, 30 nymph, 12 streamer, 12 emerger, 8 wet, 8 terrestrial, 5 egg, 3 midge
 * Top 20 are "hero patterns" with full tying steps and materials.
 *
 * Usage:
 *   npx tsx scripts/seed-flies.ts
 *
 * Environment variables (reads from .env.local automatically, or set manually):
 *   NEXT_PUBLIC_SUPABASE_URL  — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (no dotenv dependency)
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found — rely on environment variables
}

// ---------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TyingStep {
  step: number;
  instruction: string;
  tip?: string;
}

interface Material {
  material: string;
  description: string;
}

interface KeyVariation {
  name: string;
  description: string;
}

interface CanonicalFly {
  slug: string;
  name: string;
  category: string;
  tagline?: string;
  description: string;
  history?: string;
  tying_overview?: string;
  tying_steps?: TyingStep[];
  materials_list?: Material[];
  fishing_tips?: string;
  when_to_use?: string;
  imitates: string[];
  effective_species: string[];
  water_types: string[];
  sizes: string[];
  colors: string[];
  bead_options?: string[];
  hook_styles?: string[];
  key_variations?: KeyVariation[];
  hero_image_url?: string;
  gallery_urls?: string[];
  icon_url?: string;
  video_url?: string;
  additional_videos?: object[];
  related_fly_ids?: string[];
  related_river_ids?: string[];
  related_destination_ids?: string[];
  hatch_associations?: object[];
  affiliate_links?: object[];
  fly_shop_ids?: string[];
  origin_credit?: string;
  meta_title?: string;
  meta_description?: string;
  rank: number;
  featured: boolean;
  is_hero_pattern: boolean;
}

// ---------------------------------------------------------------------------
// Standard trout species list
// ---------------------------------------------------------------------------

const TROUT = ["rainbow trout", "brown trout", "brook trout", "cutthroat trout"];

// ---------------------------------------------------------------------------
// Hero Patterns (1-20) — Full data
// ---------------------------------------------------------------------------

const heroPatterns: CanonicalFly[] = [
  // ── 1. Parachute Adams ──────────────────────────────────────────────────
  {
    slug: "parachute-adams",
    name: "Parachute Adams",
    category: "dry",
    tagline: "The most versatile dry fly ever tied.",
    description:
      "The Parachute Adams is arguably the most effective all-around dry fly in existence. Its gray body and mixed grizzly-brown hackle suggest a wide range of mayflies, making it a go-to searching pattern on any trout stream. The white parachute post provides excellent visibility in broken water and low light.",
    history:
      "The original Adams was created by Leonard Halladay in 1922 for his friend Charles Adams on the Boardman River in Michigan. The parachute variation emerged in the 1970s, adding a horizontal hackle wrap around a white post for improved floatation and a more natural profile sitting in the surface film.",
    tying_overview:
      "Tie a split-tail of moose body hair, dub a slim gray body, post white calf body hair, and wrap grizzly and brown hackle parachute-style around the base of the post.",
    tying_steps: [
      { step: 1, instruction: "Secure hook in vise and start thread behind the eye, wrapping a smooth base to the bend.", tip: "Use 8/0 thread for sizes 16+ to keep the profile slim." },
      { step: 2, instruction: "Tie in a small bunch of moose body hair fibers for the tail, splaying them slightly.", tip: "The tail should be approximately shank length." },
      { step: 3, instruction: "Dub a thin, tapered body of Adams gray superfine dubbing forward to about 75% of the shank.", tip: "Keep the dubbing tight — a slim body floats better than a bulky one." },
      { step: 4, instruction: "Tie in a clump of white calf body hair as the parachute post, wrapping the base to stand it upright.", tip: "Post thread wraps 6-8 turns up the post to stiffen it." },
      { step: 5, instruction: "Tie in one grizzly and one brown hackle feather at the base of the post.", tip: "Select hackle 1.5x the hook gap for proper float." },
      { step: 6, instruction: "Wrap both hackles parachute-style around the base of the post, 3-4 turns each.", tip: "Wrap the brown first, then the grizzly on top." },
      { step: 7, instruction: "Secure hackle tips, trim waste, build a small thread head, and whip finish.", tip: "A drop of head cement on the post base locks everything in place." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 100, #12-20" },
      { material: "Thread", description: "Uni 8/0, gray" },
      { material: "Tail", description: "Moose body hair, dark" },
      { material: "Body", description: "Adams gray superfine dubbing" },
      { material: "Post", description: "White calf body hair" },
      { material: "Hackle", description: "Grizzly and brown dry fly hackle" },
    ],
    fishing_tips:
      "Dead drift the Parachute Adams in riffles, seams, and eddy lines. It works as a prospecting fly when no hatch is visible, and during mayfly hatches it passes for BWOs, PMDs, and Callibaetis. Size down to #18-20 for pressured water.",
    when_to_use:
      "Year-round on any trout water. Especially effective during mixed mayfly hatches and as a searching pattern when nothing specific is hatching.",
    imitates: ["mayflies", "BWOs", "PMDs", "Callibaetis"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18", "20"],
    colors: ["Gray", "Olive", "Black"],
    bead_options: [],
    hook_styles: ["Standard dry fly", "1x fine wire"],
    key_variations: [
      { name: "Hi-Vis Parachute Adams", description: "Fluorescent orange or pink post for low-light visibility." },
      { name: "CDC Adams", description: "CDC feather replaces calf hair post for enhanced floatation." },
      { name: "Female Adams", description: "Yellow egg sac added to the rear of the body." },
    ],
    video_url: "https://www.youtube.com/watch?v=U7jGSBHJOPE",
    origin_credit: "Leonard Halladay, 1922 (parachute variation, 1970s)",
    rank: 1,
    featured: true,
    is_hero_pattern: true,
  },

  // ── 2. Pheasant Tail Nymph ─────────────────────────────────────────────
  {
    slug: "pheasant-tail-nymph",
    name: "Pheasant Tail Nymph",
    category: "nymph",
    tagline: "The universal nymph — fooling trout since 1958.",
    description:
      "Frank Sawyer's Pheasant Tail Nymph is one of the most widely fished subsurface patterns in the world. The natural pheasant tail fibers create a slim, buggy profile that imitates a broad range of mayfly nymphs. It is equally effective dead-drifted under an indicator or swung on a tight line in riffles.",
    history:
      "Frank Sawyer, the legendary riverkeeper on the Avon in Wiltshire, England, designed this pattern in 1958 using only pheasant tail fibers and fine copper wire — no thread. His intent was to create a weighted, natural-looking nymph that sank quickly into the feeding zone of chalkstream trout.",
    tying_overview:
      "Wrap copper wire along the shank, tie in pheasant tail fibers for the tail and body, create a thorax with peacock herl, and form a wing case from the pheasant tail tips folded over.",
    tying_steps: [
      { step: 1, instruction: "Secure hook and wrap a layer of fine copper wire from eye to bend as both weight and thread base.", tip: "Sawyer's original used no thread — copper wire only." },
      { step: 2, instruction: "Tie in 4-6 pheasant tail fibers at the bend for the tail.", tip: "Tail should be about half the shank length." },
      { step: 3, instruction: "Wrap the pheasant tail fibers forward over the copper wire to form a slim, segmented body to 2/3 of the shank.", tip: "Counter-wrap copper wire over the body for durability." },
      { step: 4, instruction: "Tie in 2-3 strands of peacock herl and wrap a full thorax.", tip: "Twist the herl around the thread for a rope that won't unravel." },
      { step: 5, instruction: "Pull the remaining pheasant tail fiber tips over the thorax as a wing case and secure.", tip: "For a flashback version, substitute a strip of pearl tinsel." },
      { step: 6, instruction: "Form a small thread head, whip finish, and cement.", tip: "Keep the head tiny — nymphs are about the body, not the head." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 3761, #12-20" },
      { material: "Thread", description: "Uni 8/0, brown (or copper wire only)" },
      { material: "Tail", description: "Pheasant tail fibers" },
      { material: "Body", description: "Pheasant tail fibers, counter-ribbed with copper wire" },
      { material: "Thorax", description: "Peacock herl" },
      { material: "Wing case", description: "Pheasant tail fiber tips (or pearl tinsel for flashback)" },
      { material: "Weight", description: "Fine copper wire underbody or tungsten bead" },
    ],
    fishing_tips:
      "Fish a Pheasant Tail Nymph as the point fly in a two-nymph Euro rig, or under an indicator in moderate currents. It is devastating on tailwaters during BWO and PMD nymph activity. In spring creeks, drop to a #18-20 for finicky fish.",
    when_to_use:
      "Effective all season long. Best during pre-hatch mayfly nymph activity, especially BWOs and PMDs. A confidence pattern for any nymphing situation.",
    imitates: ["mayfly nymphs", "BWO nymphs", "PMD nymphs", "Callibaetis nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18", "20"],
    colors: ["Natural", "Olive", "Brown"],
    bead_options: ["Tungsten", "Brass bead", "None"],
    hook_styles: ["Standard nymph", "Jig hook", "1x long"],
    key_variations: [
      { name: "Flashback Pheasant Tail", description: "Pearl tinsel wing case adds flash to attract fish from distance." },
      { name: "Jig Pheasant Tail", description: "Tied on a jig hook with slotted tungsten bead for Euro nymphing." },
      { name: "Soft Hackle Pheasant Tail", description: "Hungarian partridge collar creates movement and emerger profile." },
      { name: "Tungsten Pheasant Tail", description: "Heavy tungsten bead for fast, deep water." },
    ],
    video_url: "https://www.youtube.com/watch?v=JHQZWyB9gDE",
    origin_credit: "Frank Sawyer, 1958",
    rank: 2,
    featured: true,
    is_hero_pattern: true,
  },

  // ── 3. Hare's Ear Nymph ────────────────────────────────────────────────
  {
    slug: "hares-ear-nymph",
    name: "Hare's Ear Nymph",
    category: "nymph",
    tagline: "Buggy, messy, and irresistible to every trout in the river.",
    description:
      "The Gold-Ribbed Hare's Ear is the buggiest, most imitative general nymph ever devised. The rough, spiky dubbing of hare's ear fur creates a silhouette that passes for mayfly nymphs, caddis larvae, and stonefly nymphs alike. Its versatility makes it a permanent fixture in every fly box.",
    history:
      "The Hare's Ear dates back to at least the 15th century in England, where it was fished as a wet fly. The modern gold-ribbed nymph version was popularized in the mid-20th century and became a staple of American fly fishing. Its effectiveness relies on the translucent, spiky guard hairs that trap air and move naturally in current.",
    tying_overview:
      "Dub a rough hare's ear body with gold wire ribbing, form a thorax of picked-out dubbing, and pull a wing case of turkey tail over the top.",
    tying_steps: [
      { step: 1, instruction: "Start thread and wrap to the bend. Tie in gold wire for the rib.", tip: "Use fine gold wire on small sizes, medium on #10-12." },
      { step: 2, instruction: "Tie in a small bunch of hare's ear guard hairs for the tail.", tip: "Keep the tail sparse — just a few fibers." },
      { step: 3, instruction: "Dub a tapered body of hare's ear fur from bend to 60% of shank. Counter-wrap gold wire in 4-5 even turns.", tip: "Mix underfur and guard hairs for the buggiest texture." },
      { step: 4, instruction: "Tie in a section of mottled turkey tail for the wing case.", tip: "Coat the turkey with head cement before tying in to prevent splitting." },
      { step: 5, instruction: "Dub a fuller thorax of hare's ear, slightly larger than the abdomen.", tip: "Use more guard hairs in the thorax dubbing for extra movement." },
      { step: 6, instruction: "Pull the turkey wing case over the thorax and secure. Pick out the dubbing with a bodkin or velcro.", tip: "Aggressive picking creates legs — the buggier the better." },
      { step: 7, instruction: "Whip finish and cement. Give the thorax one more pick-out.", tip: "The finished fly should look slightly disheveled — that's the point." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 3761, #10-18" },
      { material: "Thread", description: "Uni 8/0, tan or brown" },
      { material: "Tail", description: "Hare's ear guard hairs" },
      { material: "Rib", description: "Fine gold wire" },
      { material: "Body", description: "Hare's ear dubbing (natural)" },
      { material: "Wing case", description: "Mottled turkey tail" },
      { material: "Thorax", description: "Hare's ear dubbing, picked out" },
    ],
    fishing_tips:
      "Dead drift the Hare's Ear through riffles and runs at the natural drift speed. It excels as a searching nymph when you don't know what's hatching. On tailwaters, the beadhead version fished Euro-style is a year-round producer.",
    when_to_use:
      "A 365-day pattern. Particularly effective during caddis and mayfly emergence, or anytime trout are feeding subsurface and you need a generalist.",
    imitates: ["mayfly nymphs", "caddis larvae", "stonefly nymphs", "scuds"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["10", "12", "14", "16", "18"],
    colors: ["Natural", "Brown", "Tan", "Olive"],
    bead_options: ["Gold bead", "Tungsten", "None"],
    hook_styles: ["Standard nymph", "Jig hook", "2x long"],
    key_variations: [
      { name: "Beadhead Hare's Ear", description: "Gold or tungsten bead adds weight and attraction." },
      { name: "Soft Hackle Hare's Ear", description: "Partridge collar for emerger presentations." },
      { name: "Jig Hare's Ear", description: "Slotted tungsten on a jig hook for Euro nymphing." },
    ],
    video_url: "https://www.youtube.com/watch?v=WBqb3U0CQWQ",
    origin_credit: "Traditional English origin, 15th century+",
    rank: 3,
    featured: true,
    is_hero_pattern: true,
  },

  // ── 4. Elk Hair Caddis ─────────────────────────────────────────────────
  {
    slug: "elk-hair-caddis",
    name: "Elk Hair Caddis",
    category: "dry",
    tagline: "The tent-wing dry fly that revolutionized caddis fishing.",
    description:
      "Al Troth's Elk Hair Caddis is the definitive adult caddis imitation. The palmered hackle body and tent-shaped elk hair wing create a buoyant, high-riding silhouette that trout slam in broken water. It is a must-have on every freestone river from Montana to Patagonia.",
    history:
      "Al Troth developed the Elk Hair Caddis in 1957 on the Beaverhead River in Montana. Frustrated with existing caddis patterns that sank quickly, he designed a durable, high-floating fly using elk hair's natural buoyancy. It quickly became the world's most popular caddis imitation.",
    tying_overview:
      "Palmer a hackle over a dubbed body from bend to thorax, tie in a tent wing of elk hair tips, trim the butts to form a bullet head.",
    tying_steps: [
      { step: 1, instruction: "Start thread at the eye and wrap to the bend. Tie in a dry fly hackle by the tip.", tip: "Select hackle one size smaller than normal — the palmering adds plenty of float." },
      { step: 2, instruction: "Dub a tapered body of tan or olive hare's ear dubbing from bend to 80% of shank.", tip: "Keep the body slim; bulk comes from the hackle." },
      { step: 3, instruction: "Palmer the hackle forward over the body in 5-6 open spiral wraps. Secure at the thorax.", tip: "Palmered wraps should be evenly spaced." },
      { step: 4, instruction: "Stack a clump of elk hair in a hair stacker for even tips.", tip: "Use bull elk body hair — it's hollow and floats best." },
      { step: 5, instruction: "Measure the elk hair so tips extend to the bend, forming a tent-wing silhouette. Tie in with 3 firm wraps.", tip: "Pinch the hair to prevent flaring on the first wrap." },
      { step: 6, instruction: "Trim the elk hair butts at a steep angle to form a bullet-shaped head.", tip: "The trimmed butts add to the bushy, buggy appearance." },
      { step: 7, instruction: "Whip finish at the eye and cement the head.", tip: "A small drop of UV resin on the thread wraps at the head adds durability." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 100, #12-18" },
      { material: "Thread", description: "Uni 6/0, tan" },
      { material: "Hackle", description: "Brown or grizzly dry fly hackle, palmered" },
      { material: "Body", description: "Hare's ear dubbing, tan or olive" },
      { material: "Wing", description: "Bull elk body hair, tent style" },
    ],
    fishing_tips:
      "Fish the Elk Hair Caddis with a slight downstream twitch to imitate caddis skating on the surface. It is deadly in pocket water and riffles where caddis are active. On evening caddis hatches, skitter it across the current seams.",
    when_to_use:
      "Spring through fall whenever adult caddis are present. Also an excellent searching pattern on freestone rivers even without a visible hatch.",
    imitates: ["adult caddis", "October caddis", "Grannom"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Tan", "Olive", "Brown"],
    bead_options: [],
    hook_styles: ["Standard dry fly", "1x fine wire"],
    key_variations: [
      { name: "X-Caddis", description: "Trailing shuck replaces hackle for flush-floating emerger profile." },
      { name: "CDC Elk Hair Caddis", description: "CDC underwing adds floatation without bulk." },
      { name: "Goddard Caddis", description: "Spun deer hair body for ultimate buoyancy in heavy water." },
    ],
    video_url: "https://www.youtube.com/watch?v=R7G5aO1KQGU",
    origin_credit: "Al Troth, 1957",
    rank: 4,
    featured: true,
    is_hero_pattern: true,
  },

  // ── 5. Zebra Midge ─────────────────────────────────────────────────────
  {
    slug: "zebra-midge",
    name: "Zebra Midge",
    category: "midge",
    tagline: "Small fly, big results — the tailwater secret weapon.",
    description:
      "The Zebra Midge is the simplest and most effective midge pattern ever designed. A thread body with wire rib and a small bead creates the segmented look of a midge pupa that trout feed on relentlessly in tailwaters. When fish are rising to invisible food, this is almost always the answer.",
    history:
      "The Zebra Midge originated on Colorado's South Platte River tailwaters in the early 2000s, though its exact originator is debated. Its genius lies in extreme simplicity — thread, wire, and a bead — making it easy to tie in bulk and devastating on midge-heavy waters like Cheesman Canyon and the San Juan River.",
    tying_overview:
      "Slide a small bead onto the hook, wrap a thread body, rib with fine wire, and whip finish. That's it — simplicity is the point.",
    tying_steps: [
      { step: 1, instruction: "Slide a 2mm silver or tungsten bead onto the hook. Start thread behind the bead.", tip: "Match bead size to hook — 2mm for #18-20, 1.5mm for #22-24." },
      { step: 2, instruction: "Wrap thread to the bend in smooth, touching turns to create the body.", tip: "Thread color IS the body color — use black, red, or olive." },
      { step: 3, instruction: "Tie in fine silver or copper wire at the bend.", tip: "Ultra-fine wire for sizes 20+, small wire for 16-18." },
      { step: 4, instruction: "Wrap thread back to the bead to build a smooth, slightly tapered body.", tip: "Keep the body thin — midges are slender insects." },
      { step: 5, instruction: "Counter-wrap the wire forward in 5-6 evenly spaced turns. Secure behind the bead.", tip: "Counter-wrapping prevents the wire from unwinding on fish." },
      { step: 6, instruction: "Whip finish behind the bead. Apply a thin coat of UV resin or head cement to the body.", tip: "The resin coat adds durability and a subtle shine that mimics gas bubbles." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 2488, #16-26" },
      { material: "Bead", description: "Silver or black tungsten, 1.5-2.5mm" },
      { material: "Thread", description: "Uni 8/0 or 10/0, black, red, or olive" },
      { material: "Rib", description: "Fine silver or copper wire" },
    ],
    fishing_tips:
      "Fish the Zebra Midge as the dropper in a two-nymph rig, 18-24 inches below a heavier point fly. On tailwaters, fish it in the film suspended under a small dry fly. Trout eat midges year-round but especially in winter when nothing else is hatching.",
    when_to_use:
      "Year-round on tailwaters and spring creeks. Indispensable in winter and early spring when midges are the primary food source.",
    imitates: ["midge pupae", "midge larvae", "Chironomids"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "lake"],
    sizes: ["16", "18", "20", "22", "24", "26"],
    colors: ["Black", "Red", "Olive", "Copper"],
    bead_options: ["Silver tungsten", "Black tungsten", "Copper tungsten"],
    hook_styles: ["Scud/midge hook", "Standard nymph"],
    key_variations: [
      { name: "UV Zebra Midge", description: "UV resin coat over the body for extra shine and durability." },
      { name: "Top Secret Midge", description: "Pearl flashabou wing case at the thorax." },
      { name: "Tungsten Zebra Midge", description: "Heavy tungsten bead for Euro nymphing in fast water." },
    ],
    video_url: "https://www.youtube.com/watch?v=H5x-x-xsyA",
    origin_credit: "South Platte River guides, early 2000s",
    rank: 5,
    featured: true,
    is_hero_pattern: true,
  },

  // ── 6. Woolly Bugger ───────────────────────────────────────────────────
  {
    slug: "woolly-bugger",
    name: "Woolly Bugger",
    category: "streamer",
    tagline: "If you could only fish one fly for the rest of your life.",
    description:
      "The Woolly Bugger is the most versatile fly in existence, imitating leeches, baitfish, crayfish, stonefly nymphs, and virtually anything else that swims. Its marabou tail pulses seductively with every strip, making it irresistible to trout, bass, and nearly every predatory freshwater fish. It is the fly you tie on when nothing else works.",
    history:
      "Russell Blessing created the Woolly Bugger in 1967 in Pennsylvania, combining the classic Woolly Worm with a marabou tail. The result was a fly with unmatched action in the water. It has since become the most popular fly pattern in North America and a global staple for trout fishing.",
    tying_overview:
      "Tie in a marabou tail, palmer chenille and hackle forward over a weighted underbody, and form a neat head.",
    tying_steps: [
      { step: 1, instruction: "Slide a bead or cone onto the hook if desired. Wrap 10-15 turns of lead wire on the shank for weight.", tip: "Lead placement affects jigging action — center weight for a steady sink, front weight for a jigging retrieve." },
      { step: 2, instruction: "Start thread and secure the lead wraps. Tie in a marabou plume for the tail at the bend.", tip: "Tail should be shank-length. Strip the fluffy base fibers for a cleaner tie-in." },
      { step: 3, instruction: "Tie in a saddle hackle by the tip and a length of chenille at the bend.", tip: "Select a hackle with fibers slightly longer than the hook gap." },
      { step: 4, instruction: "Wrap the chenille forward in touching turns to form a full body. Secure behind the bead or at the eye.", tip: "Medium chenille for #6-8, small for #10-12." },
      { step: 5, instruction: "Palmer the hackle forward over the chenille in 5-6 open spiral wraps. Secure and trim.", tip: "Stroke the hackle fibers rearward as you wrap to prevent trapping." },
      { step: 6, instruction: "Build a neat thread head, whip finish, and cement.", tip: "If using a cone head, the cone covers the thread head automatically." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 5263, #2-10, 3x long streamer" },
      { material: "Bead/Cone", description: "Tungsten or brass cone, optional" },
      { material: "Weight", description: "Lead or non-lead wire, .020-.030" },
      { material: "Thread", description: "Uni 6/0, black" },
      { material: "Tail", description: "Marabou plume, black or olive" },
      { material: "Body", description: "Medium chenille, black or olive" },
      { material: "Hackle", description: "Saddle hackle, black or grizzly, palmered" },
    ],
    fishing_tips:
      "Strip the Woolly Bugger on a sink-tip line along undercut banks, through deep pools, and around structure. Vary the retrieve — long slow strips, short erratic strips, and dead drifts all produce. In cold water, slow down; in warm water, speed up.",
    when_to_use:
      "Year-round, any water. The go-to pattern for early and late season when trout are feeding on baitfish and leeches, and a producer in off-color water.",
    imitates: ["leeches", "baitfish", "crayfish", "stonefly nymphs", "sculpin"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "lake"],
    sizes: ["2", "4", "6", "8", "10"],
    colors: ["Black", "Olive", "Brown", "White"],
    bead_options: ["Brass cone", "Tungsten cone", "Bead head", "None"],
    hook_styles: ["3x long streamer", "Standard streamer"],
    key_variations: [
      { name: "Beadhead Woolly Bugger", description: "Tungsten bead for faster sink and jigging action." },
      { name: "Conehead Woolly Bugger", description: "Cone head for aggressive jigging retrieve." },
      { name: "Crystal Bugger", description: "Crystal chenille body adds flash." },
      { name: "Articulated Bugger", description: "Two-section articulated shank for larger baitfish profile." },
    ],
    video_url: "https://www.youtube.com/watch?v=aXZqHPpivCE",
    origin_credit: "Russell Blessing, 1967",
    rank: 6,
    featured: true,
    is_hero_pattern: true,
  },

  // ── 7. RS2 ─────────────────────────────────────────────────────────────
  {
    slug: "rs2",
    name: "RS2",
    category: "emerger",
    tagline: "Rim Chung's minimalist masterpiece for selective trout.",
    description:
      "The RS2 (Rim's Semblance 2) is a devastatingly simple emerger pattern that hangs in the surface film imitating a mayfly struggling to shed its shuck. The CDC or poly yarn wing tuft and sparse beaver fur body create a delicate silhouette that fools the most selective tailwater trout.",
    history:
      "Rim Chung developed the RS2 in the 1970s for the demanding tailwater trout of Colorado's South Platte River. The name stands for 'Rim's Semblance, version 2.' Its sparse design was revolutionary — proving that less material often catches more fish on pressured water.",
    tying_overview:
      "Tie in a micro-tail of hackle fibers, dub a wispy beaver body, and tie a small CDC or poly yarn wing tuft at the thorax.",
    tying_steps: [
      { step: 1, instruction: "Start thread and wrap to the bend. Tie in two or three dun hackle fibers as a split tail.", tip: "The tail should be sparse — literally 2-3 fibers." },
      { step: 2, instruction: "Dub the finest wisp of beaver belly fur and form a slim body to 70% of the shank.", tip: "Less dubbing is more. You should see thread through the dubbing." },
      { step: 3, instruction: "Tie in a small tuft of CDC feather or poly yarn on top of the shank as a wing.", tip: "The wing should be short — just past the eye, to suggest an emerging wing." },
      { step: 4, instruction: "Dub a slightly fuller thorax around the wing base.", tip: "The thorax gives the fly its silhouette in the film." },
      { step: 5, instruction: "Whip finish and trim any stray fibers. Keep it sparse.", tip: "Resist the urge to add material. Minimalism is the key to the RS2." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 2488, #18-24" },
      { material: "Thread", description: "Uni 8/0, gray or olive" },
      { material: "Tail", description: "Dun hackle fibers, 2-3 strands" },
      { material: "Body", description: "Beaver belly dubbing, sparse" },
      { material: "Wing", description: "CDC puff or poly yarn" },
    ],
    fishing_tips:
      "Fish the RS2 unweighted in the surface film, either as a standalone or trailing 18 inches behind a visible dry fly. On tailwaters, it is deadly during BWO and midge emergence. Watch for subtle sipping rises and present with a drag-free drift.",
    when_to_use:
      "During BWO hatches, midge emergence, and any time trout are rising to tiny insects in the film. Essential on tailwaters and spring creeks.",
    imitates: ["BWO emergers", "midge emergers", "mayfly emergers"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22", "24"],
    colors: ["Gray", "Olive", "Black"],
    bead_options: ["None", "Small glass bead"],
    hook_styles: ["Scud/midge hook", "Standard dry fly"],
    key_variations: [
      { name: "CDC RS2", description: "CDC wing tuft for maximum floatation in the film." },
      { name: "Foam Post RS2", description: "Closed-cell foam post for visibility." },
      { name: "Beadhead RS2", description: "Tiny glass bead for fishing just under the surface." },
    ],
    video_url: "https://www.youtube.com/watch?v=3r7XEY7PJHQ",
    origin_credit: "Rim Chung, 1970s",
    rank: 7,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 8. Frenchie ────────────────────────────────────────────────────────
  {
    slug: "frenchie",
    name: "Frenchie",
    category: "nymph",
    tagline: "The Euro nymphing gateway drug.",
    description:
      "The Frenchie is the quintessential Euro nymph — a Pheasant Tail variation with a fluorescent hot spot collar at the thorax. Developed for competition-style nymphing, it combines the proven mayfly profile of pheasant tail with a bright attractor element that triggers strikes from trout feeding in fast, broken water.",
    history:
      "The Frenchie was popularized by Lance Egan and the US competitive fly fishing circuit in the 2010s, though its roots trace to European competition anglers. The 'French' in the name refers to French nymphing technique, not its country of origin. It is now the most widely tied Euro nymph pattern worldwide.",
    tying_overview:
      "On a jig hook with a slotted tungsten bead, tie a pheasant tail body and add a bright dubbing collar of hot pink, orange, or chartreuse at the thorax.",
    tying_steps: [
      { step: 1, instruction: "Slide a slotted tungsten bead onto a jig hook and secure in the vise.", tip: "Match bead weight to water depth — 3.5mm for deep, 2.5mm for moderate runs." },
      { step: 2, instruction: "Start thread behind the bead and wrap to the bend. Tie in 4-5 pheasant tail fibers for the tail.", tip: "Tail should be short — about half the shank." },
      { step: 3, instruction: "Wrap pheasant tail fibers forward to form a slim body to 75% of the shank.", tip: "Counter-wrap with fine wire for durability." },
      { step: 4, instruction: "Dub a small collar of fluorescent hot spot dubbing (pink, orange, or chartreuse) immediately behind the bead.", tip: "Use just 2-3 wraps — the hot spot should be small and bright." },
      { step: 5, instruction: "Whip finish behind the bead and cement.", tip: "The hot spot should be visible but not overwhelming — a pop of color, not a neon sign." },
    ],
    materials_list: [
      { material: "Hook", description: "Hanak 450 jig hook, #12-20" },
      { material: "Bead", description: "Slotted tungsten, 2.5-3.5mm" },
      { material: "Thread", description: "Semperfli Nano Silk, brown" },
      { material: "Tail", description: "Pheasant tail fibers" },
      { material: "Body", description: "Pheasant tail fibers, ribbed with fine wire" },
      { material: "Hot spot collar", description: "Fluorescent dubbing — pink, orange, or chartreuse" },
    ],
    fishing_tips:
      "Fish the Frenchie as the point fly in a tight-line Euro rig, leading the flies through seams and runs with constant bottom contact. The jig hook rides point-up, reducing snags. Vary the hot spot color — pink in clear water, orange in off-color.",
    when_to_use:
      "Year-round Euro nymphing pattern. Especially effective in moderate to fast currents where trout are actively feeding on mayfly nymphs near the bottom.",
    imitates: ["mayfly nymphs", "BWO nymphs", "caddis larvae"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18", "20"],
    colors: ["Pink hot spot", "Orange hot spot", "Chartreuse hot spot"],
    bead_options: ["Tungsten slotted"],
    hook_styles: ["Jig hook"],
    key_variations: [
      { name: "Blowtorch", description: "Hot orange thorax with a fire orange bead — high-vis attractor variant." },
      { name: "Chartreuse Frenchie", description: "Chartreuse hot spot for off-color water." },
      { name: "Purple Frenchie", description: "UV purple dubbing collar for deep water visibility." },
    ],
    video_url: "https://www.youtube.com/watch?v=aHxLREY6fMs",
    origin_credit: "Lance Egan / European competition anglers, 2010s",
    rank: 8,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 9. Perdigon ────────────────────────────────────────────────────────
  {
    slug: "perdigon",
    name: "Perdigon",
    category: "nymph",
    tagline: "The fast-sinking competition nymph that changed Euro nymphing forever.",
    description:
      "The Perdigon is a sleek, heavy, UV-resin-coated nymph designed for one purpose: getting to the bottom fast. Its smooth body and tungsten bead cut through current with minimal drag, making it the preferred point fly for competitive Euro nymphers fishing deep, fast runs where traditional flies struggle to reach the strike zone.",
    history:
      "Developed by Spanish competition fly fishers in the early 2000s, the Perdigon (Spanish slang for lead shot) was designed to sink like a bullet. It dominated European fly fishing competitions and was introduced to American anglers through the US Fly Fishing Team's competition results. Its UV resin coat was the key innovation, creating a durable, smooth, fast-sinking profile.",
    tying_overview:
      "On a jig hook with a heavy tungsten bead, wrap a thin thread or tinsel body, add a thin fiber wing case, and seal everything with UV resin.",
    tying_steps: [
      { step: 1, instruction: "Slide a heavy slotted tungsten bead onto a jig hook. Start thread and build a smooth, tapered underbody.", tip: "Use the heaviest bead the hook will support — 3.5mm on a #14 is standard." },
      { step: 2, instruction: "Tie in a tail of 2-3 coq de Leon fibers at the bend.", tip: "Short tail — just a few fiber lengths past the bend." },
      { step: 3, instruction: "Wrap the body with thread or tinsel in smooth, tapered turns from bend to bead.", tip: "Olive, brown, or black thread bodies are most effective." },
      { step: 4, instruction: "Tie in a thin strip of Peacock Quill or Coq de Leon fiber as a wing case over the thorax area.", tip: "Just a few fibers — this is an accent, not a feature." },
      { step: 5, instruction: "Apply a thin, even coat of UV resin over the entire body. Cure with a UV light.", tip: "Rotate the fly while curing for an even, smooth finish." },
      { step: 6, instruction: "Apply a second thin coat of UV resin if needed for smoothness. Whip finish behind the bead.", tip: "The finished body should be glass-smooth — that's what makes it sink fast." },
    ],
    materials_list: [
      { material: "Hook", description: "Hanak 400BL jig hook, #14-22" },
      { material: "Bead", description: "Slotted tungsten, 3.0-4.0mm (heavy)" },
      { material: "Thread", description: "Ultra-fine thread or Peacock Quill body wrap" },
      { material: "Tail", description: "Coq de Leon fibers, 2-3 strands" },
      { material: "Wing case", description: "Coq de Leon or holographic tinsel" },
      { material: "Coating", description: "UV resin, thin formula" },
    ],
    fishing_tips:
      "Fish the Perdigon as the heavy point fly in a Euro tandem rig, with a lighter emerger or midge pattern as the dropper. Lead the flies through deep runs with constant bottom contact. The smooth profile means fewer snags than traditional nymphs in rocky substrate.",
    when_to_use:
      "Anytime you need to get deep fast. Essential for Euro nymphing in fast, deep runs. Year-round effectiveness, especially in high or off-color water.",
    imitates: ["mayfly nymphs", "caddis pupae", "general attractor"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["14", "16", "18", "20", "22"],
    colors: ["Olive", "Black", "Brown", "Purple"],
    bead_options: ["Tungsten slotted (heavy)"],
    hook_styles: ["Jig hook"],
    key_variations: [
      { name: "Hot Spot Perdigon", description: "Fluorescent collar behind the bead for added attraction." },
      { name: "Rainbow Warrior Perdigon", description: "Pearl tinsel body under UV resin for flash." },
      { name: "Black Magic Perdigon", description: "All black with UV purple wing case — deep water producer." },
    ],
    video_url: "https://www.youtube.com/watch?v=RhH4Wqe2yZI",
    origin_credit: "Spanish competition fly fishers, early 2000s",
    rank: 9,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 10. San Juan Worm ──────────────────────────────────────────────────
  {
    slug: "san-juan-worm",
    name: "San Juan Worm",
    category: "nymph",
    tagline: "Love it or hate it, it catches fish — lots of fish.",
    description:
      "The San Juan Worm is the most controversial and most effective simple fly in the game. A tuft of Ultra Chenille or Squirmy Wormy material on a hook, it imitates aquatic worms that trout hoover up after rain events and high water. Purists scoff, but the fish don't care.",
    history:
      "Named after New Mexico's San Juan River, where it became infamous in the 1980s. The tailwater below Navajo Dam releases nutrient-rich water that supports enormous populations of aquatic worms (Tubifex and Lumbriculus). Local guides discovered that a simple chenille worm pattern was the most consistent producer on the river.",
    tying_overview:
      "Tie a length of Ultra Chenille or Squirmy Wormy material to a curved hook, extending past both ends. That's the whole fly.",
    tying_steps: [
      { step: 1, instruction: "Place a scud hook in the vise. Optionally slide on a small tungsten bead.", tip: "Beadhead versions sink faster in heavy water." },
      { step: 2, instruction: "Start thread at the midpoint of the shank.", tip: "A few thread wraps is all you need — this is a 30-second fly." },
      { step: 3, instruction: "Cut a 2-inch length of Ultra Chenille or Squirmy Wormy material.", tip: "Red and pink are the classic colors; brown for more natural presentations." },
      { step: 4, instruction: "Tie the material to the hook at the center, so equal lengths extend fore and aft.", tip: "Use tight thread wraps to prevent spinning." },
      { step: 5, instruction: "Build a small thread bump over the tie-in point. Whip finish and cement.", tip: "Singe or taper the ends of the chenille for a natural taper." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 2457, #10-16, scud/emerger" },
      { material: "Thread", description: "Uni 6/0, red or brown" },
      { material: "Body", description: "Ultra Chenille or Squirmy Wormy, red, pink, or brown" },
      { material: "Bead", description: "Small tungsten bead, optional" },
    ],
    fishing_tips:
      "Dead drift the San Juan Worm along the bottom during or after rain events, high water, or anytime worms are active. It is especially productive as the lead fly in a double-nymph rig, with a smaller midge or mayfly nymph as the dropper. Don't overthink it.",
    when_to_use:
      "After rainstorms, during high water events, and year-round on tailwaters with worm populations. Particularly effective in winter when trout are sluggish and want an easy meal.",
    imitates: ["aquatic worms", "Tubifex worms", "earthworms"],
    effective_species: TROUT,
    water_types: ["tailwater", "freestone"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Red", "Pink", "Brown", "Wine"],
    bead_options: ["Small tungsten", "None"],
    hook_styles: ["Scud hook", "Curved nymph"],
    key_variations: [
      { name: "Squirmy Wormy", description: "Stretchy silicone material for lifelike wriggling movement." },
      { name: "Beadhead San Juan Worm", description: "Tungsten bead for added weight." },
      { name: "Micro Worm", description: "Tied on #16-18 for pressured tailwater fish." },
    ],
    video_url: "https://www.youtube.com/watch?v=UKbgNJJN5U0",
    origin_credit: "San Juan River guides, New Mexico, 1980s",
    rank: 10,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 11. Copper John ────────────────────────────────────────────────────
  {
    slug: "copper-john",
    name: "Copper John",
    category: "nymph",
    tagline: "John Barr's heavy metal attractor — built to sink and designed to shine.",
    description:
      "The Copper John is a heavy, flashy attractor nymph that sinks like a rock and catches fish like a dream. Its copper wire body, epoxy-coated wing case, and biots tail create a durable, attention-grabbing profile that excels in fast water. It is one of the most popular commercial fly patterns ever created.",
    history:
      "John Barr developed the Copper John in Colorado in the early 1990s, refining it over several years before it became commercially available. The pattern's combination of heavy weight, flash, and a mayfly-stonefly hybrid silhouette made it an instant hit. By the 2000s, it was the best-selling nymph in America.",
    tying_overview:
      "Tie split goose biots for a tail, wrap a copper wire body, add a flashback wing case sealed with epoxy, and finish with a dubbed thorax and biots legs.",
    tying_steps: [
      { step: 1, instruction: "Slide a tungsten or brass bead onto a 2x heavy nymph hook. Add lead wraps behind the bead.", tip: "This fly is designed to be heavy — don't skimp on the weight." },
      { step: 2, instruction: "Tie in two goose biots splayed for the tail.", tip: "Biots should splay outward at a V angle." },
      { step: 3, instruction: "Wrap copper wire (or colored wire) forward to form a segmented body to 60% of the shank.", tip: "Keep wire wraps tight and touching for a smooth, even body." },
      { step: 4, instruction: "Tie in a strip of Flashabou or thin skin for the wing case.", tip: "Epoxy or UV resin over the wing case when complete." },
      { step: 5, instruction: "Dub a thorax of peacock herl or peacock dubbing.", tip: "Keep the thorax proportional — slightly wider than the body." },
      { step: 6, instruction: "Tie in goose biots on each side for legs, pull wing case over thorax, and secure.", tip: "Legs should angle back at 45 degrees." },
      { step: 7, instruction: "Coat the wing case with a thin layer of UV resin or 5-minute epoxy. Whip finish.", tip: "The glossy wing case is the Copper John's signature feature." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 5262, #12-18, 2x heavy nymph" },
      { material: "Bead", description: "Tungsten or brass bead, copper or gold" },
      { material: "Thread", description: "Uni 6/0, black" },
      { material: "Tail", description: "Goose biots, brown" },
      { material: "Body", description: "Copper wire (or red, green, chartreuse wire)" },
      { material: "Wing case", description: "Thin Skin or Flashabou, coated with UV resin" },
      { material: "Thorax", description: "Peacock herl or dubbing" },
      { material: "Legs", description: "Goose biots, brown" },
    ],
    fishing_tips:
      "Fish the Copper John as the point fly in a double-nymph rig, using its weight to pull a lighter dropper into the strike zone. It excels in fast pocket water, deep runs, and plunge pools. The flash from the wire body draws fish from distance.",
    when_to_use:
      "Year-round attractor nymph. Especially effective in moderate to fast water where weight and flash help fish locate the fly.",
    imitates: ["mayfly nymphs", "stonefly nymphs", "attractor"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Copper", "Red", "Green", "Chartreuse", "Black"],
    bead_options: ["Tungsten", "Brass"],
    hook_styles: ["2x heavy nymph", "Jig hook"],
    key_variations: [
      { name: "Red Copper John", description: "Red wire body — especially effective on freestone rivers." },
      { name: "Green Copper John", description: "Chartreuse wire for caddis-colored variation." },
      { name: "Rubber Legs Copper John", description: "Rubber legs replace biots for more movement." },
      { name: "Flashback Copper John", description: "Additional flashback strip over the wing case." },
    ],
    video_url: "https://www.youtube.com/watch?v=hm0gS-xEH7c",
    origin_credit: "John Barr, Colorado, early 1990s",
    rank: 11,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 12. BWO Parachute ──────────────────────────────────────────────────
  {
    slug: "bwo-parachute",
    name: "BWO Parachute",
    category: "dry",
    tagline: "The essential hatch-matcher for every Blue-Winged Olive event.",
    description:
      "The BWO Parachute is a specific-color Adams variant tied to match the ubiquitous Blue-Winged Olive mayfly hatch. With its olive body and dun hackle riding low in the film, it perfectly imitates Baetis duns drifting helplessly on the surface. It is the fly you reach for when olive-bodied mayflies blanket the water from fall through spring.",
    history:
      "Blue-Winged Olive parachute patterns evolved from the general parachute dry fly tradition as anglers realized that matching the specific olive coloration of Baetis mayflies dramatically improved catch rates during these prolific hatches. The BWO Parachute became a tailwater essential through the 1990s and 2000s.",
    tying_overview:
      "Same structure as a Parachute Adams but with olive dubbing, dun hackle, and olive-dun tail fibers matched to Baetis coloration.",
    tying_steps: [
      { step: 1, instruction: "Secure hook and wrap thread to the bend. Tie in a few dun hackle fibers for the tail.", tip: "Tail fibers should be sparse and match dun coloration." },
      { step: 2, instruction: "Dub a slim body of olive superfine dubbing from bend to 70% of shank.", tip: "BWOs are slender insects — keep the body thin." },
      { step: 3, instruction: "Tie in a white or gray post of calf body hair or poly yarn. Build a post base.", tip: "Hi-vis white post is essential for seeing this small fly on the water." },
      { step: 4, instruction: "Tie in a dun-colored dry fly hackle at the base of the post.", tip: "Hackle should be proportioned for one size smaller than the hook." },
      { step: 5, instruction: "Wrap the hackle parachute-style around the post base, 3-4 turns.", tip: "Keep wraps tight to the base of the post." },
      { step: 6, instruction: "Secure hackle, build a small head, whip finish and cement.", tip: "The finished fly should sit low in the film like a real Baetis dun." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 100, #16-22" },
      { material: "Thread", description: "Uni 8/0, olive" },
      { material: "Tail", description: "Dun hackle fibers" },
      { material: "Body", description: "Olive superfine dubbing" },
      { material: "Post", description: "White calf body hair or poly yarn" },
      { material: "Hackle", description: "Dun dry fly hackle, parachute style" },
    ],
    fishing_tips:
      "Present the BWO Parachute with a dead drift in the feeding lanes during a Baetis hatch. These hatches often occur on overcast, drizzly days — the worse the weather, the better the fishing. Size down when fish refuse: #20-22 matches late-season Baetis.",
    when_to_use:
      "During Blue-Winged Olive (Baetis) hatches, primarily fall and spring. Also effective on cloudy summer days when small BWOs emerge in the afternoon.",
    imitates: ["Baetis duns", "Blue-Winged Olives", "small mayflies"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["16", "18", "20", "22"],
    colors: ["Olive", "Gray-olive", "Dark olive"],
    bead_options: [],
    hook_styles: ["Standard dry fly", "1x fine wire"],
    key_variations: [
      { name: "Comparadun BWO", description: "Deer hair fan wing for a lower-profile flush float." },
      { name: "CDC BWO", description: "CDC wing and body for ultimate in-the-film presentation." },
      { name: "Sparkle Dun BWO", description: "Z-lon trailing shuck to imitate emerging dun." },
    ],
    video_url: "https://www.youtube.com/watch?v=RFdSTyJxeEQ",
    origin_credit: "Various tyers, evolved from parachute tradition",
    rank: 12,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 13. Griffith's Gnat ────────────────────────────────────────────────
  {
    slug: "griffiths-gnat",
    name: "Griffith's Gnat",
    category: "dry",
    tagline: "The midge cluster pattern that saves the day on flat water.",
    description:
      "Griffith's Gnat is the most important midge dry fly pattern in existence. Its peacock herl body and palmered grizzly hackle create a buggy silhouette that imitates a cluster of midges trapped in the surface film. When trout are rising to invisible insects on glassy water, this tiny fly is often the key to cracking the code.",
    history:
      "George Griffith, a co-founder of Trout Unlimited, developed this pattern in Michigan. Its enduring effectiveness lies in its simplicity and ability to imitate midge clusters rather than individual midges — matching how trout actually feed during midge activity.",
    tying_overview:
      "Palmer a grizzly hackle over a peacock herl body — one of the simplest and most effective dry fly designs ever conceived.",
    tying_steps: [
      { step: 1, instruction: "Start thread on a #18-24 dry fly hook and wrap to the bend.", tip: "Use the finest thread available for small sizes — 10/0 or 12/0." },
      { step: 2, instruction: "Tie in a grizzly hackle by the tip at the bend.", tip: "Select an undersized hackle — slightly smaller than normal for the hook." },
      { step: 3, instruction: "Tie in 2-3 strands of peacock herl at the bend.", tip: "Twist the herl into a rope for durability." },
      { step: 4, instruction: "Wrap the peacock herl forward to form the body, stopping just behind the eye.", tip: "A full, slightly rough body is ideal." },
      { step: 5, instruction: "Palmer the grizzly hackle forward over the body in 4-5 open turns. Secure and trim at the eye.", tip: "Sparse palmering is key — too much hackle and it won't sit in the film correctly." },
      { step: 6, instruction: "Build a tiny thread head, whip finish, and cement.", tip: "The finished fly should look like a tiny piece of lint — that's perfect." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 101, #18-24, dry fly" },
      { material: "Thread", description: "Uni 10/0, black" },
      { material: "Body", description: "Peacock herl, 2-3 strands" },
      { material: "Hackle", description: "Grizzly dry fly hackle, undersized, palmered" },
    ],
    fishing_tips:
      "Present the Griffith's Gnat dead drift in the film during midge activity. Fish it in sizes #20-24 on tailwaters and spring creeks where trout sip midges from the surface. Apply floatant sparingly to let it sit IN the film, not on top of it.",
    when_to_use:
      "During midge hatches, particularly on calm water. Essential on winter tailwaters and spring creeks when midges are the only game in town.",
    imitates: ["midge clusters", "midge adults", "Chironomid clusters"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "lake"],
    sizes: ["18", "20", "22", "24"],
    colors: ["Black/Peacock", "Olive/Peacock"],
    bead_options: [],
    hook_styles: ["Standard dry fly", "1x fine wire"],
    key_variations: [
      { name: "Hi-Vis Griffith's Gnat", description: "Orange or pink thread head for visibility on the water." },
      { name: "CDC Griffith's Gnat", description: "CDC fibers mixed with peacock herl for enhanced floatation." },
    ],
    video_url: "https://www.youtube.com/watch?v=AHlHnRU6RPw",
    origin_credit: "George Griffith, Michigan",
    rank: 13,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 14. Stimulator ─────────────────────────────────────────────────────
  {
    slug: "stimulator",
    name: "Stimulator",
    category: "dry",
    tagline: "The attractor dry fly that mimics everything big on the surface.",
    description:
      "Randall Kaufmann's Stimulator is a large, buoyant attractor dry fly that suggests adult stoneflies, caddis, and grasshoppers simultaneously. Its palmered hackle and elk hair wing provide incredible floatation, making it the ideal indicator fly in a dry-dropper rig. When big bugs are on the water, the Stimulator is the first fly out of the box.",
    history:
      "Randall Kaufmann developed the Stimulator in the Pacific Northwest, drawing on the Sofa Pillow and similar stonefly patterns. It quickly became the standard adult stonefly imitation west of the Mississippi. Its success lies in its buoyancy and ability to suggest multiple food forms at once.",
    tying_overview:
      "Tie in an elk hair tail and wing, dub a two-tone body with palmered hackle, and add a robust thorax with additional hackle wraps.",
    tying_steps: [
      { step: 1, instruction: "Start thread and tie in elk hair tail fibers at the bend. Tie in hackle and gold wire.", tip: "Elk hair tail provides buoyancy from the rear." },
      { step: 2, instruction: "Dub an orange or amber body from bend to midshank. Palmer the hackle forward and rib with gold wire.", tip: "The two-tone body is a Stimulator signature." },
      { step: 3, instruction: "Tie in a stacked elk hair wing at midshank, tent-style.", tip: "Wing should extend to the bend of the hook." },
      { step: 4, instruction: "Tie in a second hackle at the wing tie-in point.", tip: "This front hackle should be one size larger for extra float." },
      { step: 5, instruction: "Dub a yellow or green thorax from wing to eye. Palmer the second hackle through the thorax.", tip: "The color contrast between body and thorax is intentional." },
      { step: 6, instruction: "Secure hackle, trim butts, whip finish and cement.", tip: "A well-tied Stimulator should float like a cork even after multiple fish." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 200R, #8-14, 3x long" },
      { material: "Thread", description: "Uni 6/0, orange" },
      { material: "Tail", description: "Elk hair" },
      { material: "Body", description: "Orange or amber dubbing" },
      { material: "Thorax", description: "Yellow or fluorescent green dubbing" },
      { material: "Hackle", description: "Grizzly, palmered over body and thorax" },
      { material: "Wing", description: "Elk hair, tent style" },
      { material: "Rib", description: "Fine gold wire" },
    ],
    fishing_tips:
      "Fish the Stimulator as a dry-dropper indicator fly, suspending a nymph 18-24 inches below. It excels in pocket water and riffles during stonefly season. Dead drift it through heavy water, or skitter it to imitate an ovipositing stonefly.",
    when_to_use:
      "During stonefly hatches (salmonfly, golden stone, yellow sally) and as a high-floating attractor in summer pocket water. Also a great hopper stand-in.",
    imitates: ["adult stoneflies", "salmonflies", "golden stoneflies", "large caddis", "grasshoppers"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["8", "10", "12", "14"],
    colors: ["Orange", "Yellow", "Olive", "Black"],
    bead_options: [],
    hook_styles: ["3x long dry fly", "2x long dry fly"],
    key_variations: [
      { name: "Rubber Legs Stimulator", description: "Rubber legs add movement and suggest stonefly legs." },
      { name: "Hi-Vis Stimulator", description: "Fluorescent post for tracking in whitewater." },
      { name: "Mini Stimulator", description: "Sized down to #14-16 for yellow sally and caddis." },
    ],
    video_url: "https://www.youtube.com/watch?v=uo4SfCy0wMU",
    origin_credit: "Randall Kaufmann, Pacific Northwest",
    rank: 14,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 15. Royal Wulff ────────────────────────────────────────────────────
  {
    slug: "royal-wulff",
    name: "Royal Wulff",
    category: "dry",
    tagline: "The king of attractor dry flies — regal and irresistible.",
    description:
      "The Royal Wulff is the most recognizable attractor dry fly ever designed. Its split white calf hair wings, peacock herl body divided by a red floss band, and brown hackle create a fly that doesn't imitate anything specific but triggers strikes from every trout in the river. It is the classic prospecting fly for rough water and uneducated fish.",
    history:
      "Lee Wulff created the Wulff series of flies in the 1930s, adapting the Royal Coachman wet fly into a buoyant, hair-winged dry fly. The white wings, originally designed for visibility, and the peacock/red color scheme created one of fly fishing's most iconic patterns. It remains a staple nearly a century later.",
    tying_overview:
      "Tie split calf hair wings, a moose hair tail, a segmented body of peacock herl and red floss, and a brown hackle collar.",
    tying_steps: [
      { step: 1, instruction: "Tie in upright, split white calf body hair wings at 30% from the eye.", tip: "Figure-eight wraps to split and stiffen the wings." },
      { step: 2, instruction: "Wrap to the bend and tie in a tail of brown moose body hair.", tip: "The tail should be shank-length and slightly fanned." },
      { step: 3, instruction: "Tie in peacock herl and wrap the rear third of the body.", tip: "Twist the herl into a rope for durability." },
      { step: 4, instruction: "Tie in red floss and wrap 4-5 turns for the center band.", tip: "The red band should be bright and distinct — it's the signature feature." },
      { step: 5, instruction: "Wrap peacock herl for the front third of the body, up to the wing base.", tip: "Front and rear peacock sections should be roughly equal." },
      { step: 6, instruction: "Tie in brown dry fly hackle and wrap 3-4 turns behind and in front of the wings. Whip finish.", tip: "Full hackle for this pattern — it needs to ride high in fast water." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 100, #10-16" },
      { material: "Thread", description: "Uni 6/0, black" },
      { material: "Wings", description: "White calf body hair, upright and split" },
      { material: "Tail", description: "Brown moose body hair" },
      { material: "Body", description: "Peacock herl with red floss center band" },
      { material: "Hackle", description: "Brown dry fly hackle, full collar" },
    ],
    fishing_tips:
      "The Royal Wulff is at its best in fast pocket water and riffles where trout don't have time to inspect the fly. Dead drift it through runs, or skate it across pools for aggressive strikes. It doubles as a high-floating indicator for a dropper nymph.",
    when_to_use:
      "When nothing specific is hatching and you want to prospect. Best in faster water where trout react to the fly's general impression rather than examining details.",
    imitates: ["general attractor", "mayflies (suggestive)", "stoneflies (suggestive)"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Red/Peacock/White (classic)", "Green Drake variant"],
    bead_options: [],
    hook_styles: ["Standard dry fly", "1x fine wire"],
    key_variations: [
      { name: "Parachute Royal Wulff", description: "Parachute hackle for lower profile in slower water." },
      { name: "Ausable Wulff", description: "All natural materials — a Catskill regional favorite." },
      { name: "White Wulff", description: "All white version for spinner falls and low light." },
    ],
    video_url: "https://www.youtube.com/watch?v=l9qoAF0WHCI",
    origin_credit: "Lee Wulff, 1930s",
    rank: 15,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 16. CDC Emerger ────────────────────────────────────────────────────
  {
    slug: "cdc-emerger",
    name: "CDC Emerger",
    category: "emerger",
    tagline: "Nature's floatant meets the most critical feeding window.",
    description:
      "The CDC Emerger exploits the natural oil in CDC (cul de canard) feathers to hang a sparse mayfly emerger perfectly in the surface film. The loop wing and trailing shuck create an exact imitation of a mayfly struggling to emerge from its nymphal shuck — the moment when trout feed with the least caution.",
    history:
      "CDC patterns originated in the Jura Mountains of Switzerland and France, where anglers discovered that the preen gland feathers of ducks naturally repelled water. CDC emerger designs became widespread in European fly fishing by the 1980s and reached American tyers by the 1990s.",
    tying_overview:
      "Tie a Z-lon trailing shuck, dub a sparse body, and loop a CDC feather over the thorax as a wing that sits in the surface film.",
    tying_steps: [
      { step: 1, instruction: "Tie in a few strands of Z-lon or Antron yarn at the bend for a trailing shuck.", tip: "The shuck represents the nymphal exoskeleton the emerging mayfly is shedding." },
      { step: 2, instruction: "Dub a slim body of fine dubbing from bend to 70% of the shank.", tip: "Match body color to the natural — olive for BWOs, tan for PMDs." },
      { step: 3, instruction: "Select a CDC feather and tie it in by the tip at the thorax position.", tip: "One quality CDC feather is better than multiple poor ones." },
      { step: 4, instruction: "Loop the CDC feather forward to form a bubble wing over the thorax area.", tip: "The CDC loop should suggest a crumpled, emerging wing." },
      { step: 5, instruction: "Dub a slightly fuller thorax, whip finish, and trim any stray CDC fibers.", tip: "Never apply floatant to CDC — it destroys the natural oils." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 2488, #16-22" },
      { material: "Thread", description: "Uni 8/0, olive or tan" },
      { material: "Shuck", description: "Z-lon or Antron yarn" },
      { material: "Body", description: "Fine dubbing, olive or tan" },
      { material: "Wing", description: "CDC feather, looped" },
    ],
    fishing_tips:
      "Fish the CDC Emerger dead drift in the surface film during mayfly hatches. It is particularly effective when trout are refusing conventional dries — they're likely feeding on emergers stuck in the shuck. Dry the CDC between fish by false casting, never by squeezing.",
    when_to_use:
      "During any mayfly emergence, especially when trout are bulging or sipping rather than splashing. Critical pattern for BWO, PMD, and Callibaetis hatches.",
    imitates: ["mayfly emergers", "BWO emergers", "PMD emergers", "Callibaetis emergers"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "lake"],
    sizes: ["16", "18", "20", "22"],
    colors: ["Olive", "Gray", "Tan"],
    bead_options: [],
    hook_styles: ["Scud/emerger hook", "Standard dry fly"],
    key_variations: [
      { name: "Klinkhammer-style CDC", description: "Curved shank for a deeper body hang in the film." },
      { name: "CDC Loop Wing Emerger", description: "Exaggerated loop wing for more visible profile." },
      { name: "Snowshoe Hare Emerger", description: "Snowshoe rabbit foot replaces CDC for durability." },
    ],
    video_url: "https://www.youtube.com/watch?v=f1xKx-07jQA",
    origin_credit: "European tradition, Jura Mountains, Switzerland/France",
    rank: 16,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 17. Klinkhammer Special ────────────────────────────────────────────
  {
    slug: "klinkhammer-special",
    name: "Klinkhammer Special",
    category: "emerger",
    tagline: "The curved-shank emerger that hangs in the film like the real thing.",
    description:
      "Hans van Klinken's Klinkhammer Special is a revolutionary emerger design that uses a curved hook shank to suspend the abdomen below the surface while the thorax and parachute hackle ride in the film. This creates an exact profile of an emerging mayfly or caddis, with the body dangling enticingly where trout expect to see it.",
    history:
      "Hans van Klinken designed the Klinkhammer in the 1980s while fishing Scandinavian grayling rivers. Frustrated by trout and grayling ignoring conventional dries during emergence, he developed the curved-shank, parachute-style emerger that would hang in the film with a submerged abdomen. It quickly became one of Europe's most important patterns.",
    tying_overview:
      "On a curved emerger hook, tie a dubbed abdomen that hangs below the film, a poly yarn parachute post, and hackle wrapped parachute-style around the post at the thorax.",
    tying_steps: [
      { step: 1, instruction: "Place a curved emerger hook in the vise. Start thread and tie in a poly yarn post at the midpoint of the shank.", tip: "The post should be about 1.5x the hook gap in height." },
      { step: 2, instruction: "Wrap thread to the bend and dub a tapered abdomen of fine dubbing.", tip: "This abdomen hangs below the surface — match color to the natural." },
      { step: 3, instruction: "Tie in a hackle at the base of the post.", tip: "Select a hackle one size larger than standard for the hook size." },
      { step: 4, instruction: "Dub a thorax of peacock herl or dark dubbing around the base of the post.", tip: "The thorax should be slightly bulkier than the abdomen." },
      { step: 5, instruction: "Wrap the hackle parachute-style around the post base, 3-4 turns.", tip: "Parachute hackle keeps the fly in the film, not on top of it." },
      { step: 6, instruction: "Secure hackle, whip finish at the eye, and trim the post to desired height.", tip: "Leave the post visible — it's your strike indicator on the water." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 2487 or Partridge K4A, #12-18, curved emerger" },
      { material: "Thread", description: "Uni 8/0, olive or tan" },
      { material: "Post", description: "Poly yarn, white or fluorescent" },
      { material: "Abdomen", description: "Fine dubbing, olive or tan (Fly-Rite or similar)" },
      { material: "Thorax", description: "Peacock herl" },
      { material: "Hackle", description: "Grizzly or dun, parachute style" },
    ],
    fishing_tips:
      "Fish the Klinkhammer dead drift during mayfly and caddis emergence. Its profile is unique — trout see the submerged abdomen from below, exactly as they see a real emerger. It is especially effective for grayling and selective brown trout that refuse conventional dries.",
    when_to_use:
      "During any emergence event. Particularly deadly in slower currents where trout can inspect flies closely, and when standard dries are being refused.",
    imitates: ["mayfly emergers", "caddis emergers", "midge emergers"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Olive", "Tan", "Gray"],
    bead_options: [],
    hook_styles: ["Curved emerger hook"],
    key_variations: [
      { name: "CDC Klinkhammer", description: "CDC wing replaces poly post for a more natural silhouette." },
      { name: "Klinkhammer BWO", description: "Olive body version specifically for Baetis hatches." },
      { name: "Klinkhammer Caddis", description: "Tan/amber body for caddis emergence." },
    ],
    video_url: "https://www.youtube.com/watch?v=Nx7TqgjVdPk",
    origin_credit: "Hans van Klinken, 1980s, Scandinavia",
    rank: 17,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 18. Egg Pattern (Glo Bug) ──────────────────────────────────────────
  {
    slug: "glo-bug",
    name: "Glo Bug",
    category: "egg",
    tagline: "When trout are gorging on eggs, nothing else comes close.",
    description:
      "The Glo Bug is the definitive egg pattern — a ball of bright yarn on a hook that imitates the single loose eggs trout feed on voraciously during spawning season. Simple to tie and devastatingly effective, it is a must-have pattern from fall through early spring on rivers with spawning salmon, steelhead, or trout.",
    history:
      "Egg patterns have been used for decades on Great Lakes tributaries and Pacific Northwest rivers where salmon and steelhead runs deposit millions of eggs. The Glo Bug, named after the bright Glo Bug yarn developed by Oregon fly tyers, became the standard egg imitation by the 1970s.",
    tying_overview:
      "Tie a clump of egg yarn to the shank, trim it into a ball shape, and you're fishing. This is a 60-second fly.",
    tying_steps: [
      { step: 1, instruction: "Start thread on a short-shank egg hook or scud hook.", tip: "Egg hooks are designed to hide inside the round yarn ball." },
      { step: 2, instruction: "Cut a 1.5-inch length of Glo Bug yarn.", tip: "McFlyFoam and Otter's Egg Yarn are excellent alternatives." },
      { step: 3, instruction: "Tie the yarn perpendicular to the shank at the midpoint, using 4-5 tight wraps.", tip: "Fold both halves upward and take 2-3 wraps underneath to round the shape." },
      { step: 4, instruction: "Pull all yarn fibers upward and trim into a ball shape about the size of a pea.", tip: "Use sharp scissors and rotate the fly while trimming." },
      { step: 5, instruction: "Whip finish under the yarn ball and cement the thread wraps.", tip: "The thread wraps should be completely hidden inside the yarn ball." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 105 or Gamakatsu egg hook, #10-16" },
      { material: "Thread", description: "Uni 6/0, matching yarn color" },
      { material: "Body", description: "Glo Bug yarn, McFlyFoam, or similar egg yarn" },
    ],
    fishing_tips:
      "Dead drift the Glo Bug through spawning gravel and below spawning redds where loose eggs collect. Fish it with enough weight to keep it ticking along the bottom. It works as both a standalone fly and as part of a two-nymph rig above a smaller nymph.",
    when_to_use:
      "During and after salmon/steelhead/trout spawning runs — typically fall through early spring. Any river with spawning activity will have egg-feeding trout.",
    imitates: ["salmon eggs", "trout eggs", "steelhead eggs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Pink", "Orange", "Chartreuse", "Peach", "Yellow"],
    bead_options: ["None", "Small bead for weight"],
    hook_styles: ["Egg hook", "Scud hook"],
    key_variations: [
      { name: "Nuke Egg", description: "Smaller, more translucent version tied with McFlyFoam." },
      { name: "Y2K Bug", description: "Two-tone egg with a bright dot center." },
      { name: "Sucker Spawn", description: "Diffuse, veil-like egg cluster imitation." },
    ],
    video_url: "https://www.youtube.com/watch?v=8lgKp-LZv6M",
    origin_credit: "Pacific Northwest and Great Lakes tyers, 1970s",
    rank: 18,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 19. Midge Larva (Thread Midge) ─────────────────────────────────────
  {
    slug: "thread-midge",
    name: "Thread Midge",
    category: "midge",
    tagline: "Microscopic but mighty — the fly that matches the tiniest hatch.",
    description:
      "The Thread Midge is the simplest larval midge imitation: a thread body with optional wire rib and a tiny bead. It imitates the slender, worm-like midge larvae that make up the bulk of a trout's winter diet on tailwaters and spring creeks. Tied in sizes #20-26, it tests both the tyer's skill and the angler's patience, but the results speak for themselves.",
    history:
      "Thread midge patterns evolved from the practical necessity of imitating insects as small as 2-3mm long. Tailwater anglers on the South Platte, San Juan, and Bighorn rivers refined the design to its absolute essence: thread, wire, and a bead.",
    tying_overview:
      "Slide a micro bead onto the hook, wrap a smooth thread body, and optionally rib with fine wire. Minimalism at its finest.",
    tying_steps: [
      { step: 1, instruction: "Slide a 1.5mm glass or tungsten bead onto a midge hook.", tip: "Glass beads for shallow water, tungsten for deeper runs." },
      { step: 2, instruction: "Start thread behind the bead and wrap a smooth, tapered body to the bend.", tip: "Thread color is everything — match the naturals on your water." },
      { step: 3, instruction: "Optionally tie in ultra-fine wire at the bend and counter-rib forward.", tip: "The rib adds segmentation and durability." },
      { step: 4, instruction: "Build up a slightly thicker thorax area behind the bead.", tip: "Just 2-3 extra thread wraps for the thorax is sufficient." },
      { step: 5, instruction: "Whip finish behind the bead. Optional: coat body with UV resin for durability.", tip: "A thin resin coat mimics the translucent quality of real midge larvae." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 2488 or Tiemco 2488H, #18-26" },
      { material: "Bead", description: "Glass or micro tungsten, 1.0-1.5mm" },
      { material: "Thread", description: "Uni 10/0 or 12/0, black, red, olive, or cream" },
      { material: "Rib", description: "Ultra-fine wire, optional" },
    ],
    fishing_tips:
      "Fish the Thread Midge as a dropper behind a slightly larger fly in a two-nymph rig. On tailwaters, suspend it under a small dry fly or indicator, dead drifting through slow runs and eddies. Trout eat midges year-round, but this pattern is most valuable in winter.",
    when_to_use:
      "Year-round on tailwaters and spring creeks, with peak effectiveness in winter and early spring when midges are the dominant food source.",
    imitates: ["midge larvae", "Chironomid larvae"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "lake"],
    sizes: ["18", "20", "22", "24", "26"],
    colors: ["Black", "Red", "Olive", "Cream"],
    bead_options: ["Glass bead", "Micro tungsten", "None"],
    hook_styles: ["Scud/midge hook"],
    key_variations: [
      { name: "Disco Midge", description: "Flashabou body under UV resin for sparkle." },
      { name: "WD-40", description: "Slightly buggier version with a dubbed thorax." },
      { name: "Mercury Midge", description: "Glass bead version for translucent effect." },
    ],
    video_url: "https://www.youtube.com/watch?v=LO6rYBp5jiw",
    origin_credit: "Tailwater guides, various",
    rank: 19,
    featured: false,
    is_hero_pattern: true,
  },

  // ── 20. Sculpzilla ─────────────────────────────────────────────────────
  {
    slug: "sculpzilla",
    name: "Sculpzilla",
    category: "streamer",
    tagline: "The sculpin slayer that big browns can't resist.",
    description:
      "The Sculpzilla is a simple, heavily weighted sculpin imitation designed to ride hook-point-up and bounce along the bottom where sculpins live. Its wide wool head pushes water and creates an enticing profile, while the rabbit strip tail undulates with every strip. It is the pattern of choice for targeting big brown trout feeding on sculpin in freestone rivers.",
    history:
      "The Sculpzilla was developed by Montana guide and tyer Russ Maddin to create a sculpin pattern that was durable, easy to tie, and effective. It uses a lead-wrapped shank and wool head to achieve the bottom-bouncing action that triggers predatory strikes from large trout.",
    tying_overview:
      "Wrap heavy lead on a streamer hook, tie in a rabbit strip tail, build a wool head, and trim to a wide, flat sculpin shape.",
    tying_steps: [
      { step: 1, instruction: "Wrap 20-25 turns of heavy lead wire (.030) on the front third of a 3x long streamer hook.", tip: "Concentrate weight at the front for a jigging, head-down retrieve." },
      { step: 2, instruction: "Start thread and secure the lead wraps. Build a thread dam behind the lead.", tip: "Thread dam prevents the lead from sliding." },
      { step: 3, instruction: "Tie in a rabbit strip at the bend, extending past the hook about one shank-length.", tip: "Cross-cut rabbit strip gives more movement than standard cut." },
      { step: 4, instruction: "Dub or tie in wool at the head, building it up progressively.", tip: "Use long-fiber wool for easy trimming." },
      { step: 5, instruction: "Trim the wool head into a wide, flat sculpin shape — flat on the bottom, rounded on top.", tip: "A razor blade gives cleaner cuts than scissors for the flat bottom." },
      { step: 6, instruction: "Whip finish at the eye and cement. The finished head should be wider than it is tall.", tip: "Test the fly in water — it should ride hook-point-up and sink rapidly." },
    ],
    materials_list: [
      { material: "Hook", description: "TMC 5263, #4-10, 3x long streamer" },
      { material: "Weight", description: "Lead wire, .025-.030, 20-25 wraps" },
      { material: "Thread", description: "Uni 6/0, olive or brown" },
      { material: "Tail", description: "Rabbit strip, olive or brown" },
      { material: "Head", description: "Wool or dubbing, trimmed to sculpin shape" },
    ],
    fishing_tips:
      "Strip the Sculpzilla along the bottom with short, sharp strips interspersed with pauses. It should bounce and dart like a startled sculpin. Use a sink-tip line to keep it in the zone. Fish it tight to undercut banks, around boulders, and through deep pools where big trout ambush prey.",
    when_to_use:
      "Year-round for targeting large brown trout, especially in fall and early spring when big fish are actively hunting sculpin. Most effective in freestone rivers with healthy sculpin populations.",
    imitates: ["sculpin", "darters", "bottom-dwelling baitfish"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["4", "6", "8", "10"],
    colors: ["Olive", "Brown", "White", "Black"],
    bead_options: ["Weighted (lead wraps)", "Cone head"],
    hook_styles: ["3x long streamer"],
    key_variations: [
      { name: "Articulated Sculpzilla", description: "Two-section articulated for larger profile and more movement." },
      { name: "Mini Sculpzilla", description: "Tied on #8-10 for smaller rivers." },
      { name: "Conehead Sculpzilla", description: "Tungsten cone replaces wool head for faster sink rate." },
    ],
    video_url: "https://www.youtube.com/watch?v=xbI_R0OVifs",
    origin_credit: "Russ Maddin, Montana",
    rank: 20,
    featured: false,
    is_hero_pattern: true,
  },
];

// ---------------------------------------------------------------------------
// Standard Patterns (21-100) — Essential data only
// ---------------------------------------------------------------------------

const standardPatterns: CanonicalFly[] = [
  // ── DRY FLIES (21-38) — 18 more to make 22 total ──────────────────────
  {
    slug: "blue-winged-olive-comparadun",
    name: "Blue-Winged Olive Comparadun",
    category: "dry",
    description: "The Comparadun's deer hair fan wing sits flush in the film, presenting a realistic mayfly silhouette that tailwater browns find impossible to refuse. It excels during Baetis hatches on slick water where trout inspect every drift with laser focus.",
    imitates: ["Baetis duns", "Blue-Winged Olives"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["16", "18", "20", "22"],
    colors: ["Olive", "Gray-olive"],
    fishing_tips: "Fish dead drift on a long, fine tippet during BWO hatches. Perfect for flat, glassy water where parachute patterns cast too much shadow.",
    rank: 21,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "sparkle-dun",
    name: "Sparkle Dun",
    category: "dry",
    description: "Craig Mathews' Sparkle Dun combines a deer hair fan wing with a Z-lon trailing shuck, bridging the gap between emerger and dun. It imitates the critical moment when a mayfly breaks free of its nymphal case and sits on the surface, vulnerable and irresistible.",
    imitates: ["mayfly duns", "emerging mayflies", "BWOs", "PMDs"],
    effective_species: TROUT,
    water_types: ["spring creek", "tailwater"],
    sizes: ["14", "16", "18", "20"],
    colors: ["Olive", "Tan", "Gray"],
    fishing_tips: "Outstanding for selective fish that refuse standard dries. The trailing shuck is the trigger — trout key on emergers more than fully formed duns.",
    rank: 22,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "pale-morning-dun",
    name: "Pale Morning Dun",
    category: "dry",
    description: "The PMD pattern imitates one of the West's most important hatches — Ephemerella infrequens and E. inermis. A pale yellow body with light dun wings accurately represents these delicate mayflies that blanket tailwaters and spring creeks through summer afternoons.",
    imitates: ["Pale Morning Duns", "Ephemerella mayflies"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["14", "16", "18"],
    colors: ["Pale yellow", "Sulphur", "Light olive"],
    fishing_tips: "PMD hatches can be incredibly dense. Match size precisely and fish a dead drift in feeding lanes. Trout often switch between duns and emergers during the hatch.",
    rank: 23,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "x-caddis",
    name: "X-Caddis",
    category: "dry",
    description: "Craig Mathews' X-Caddis omits the hackle of an Elk Hair Caddis, creating a lower-riding fly that hangs in the film like an emerging caddis. The Z-lon trailing shuck and deer hair wing perfectly imitate a caddis struggling out of its pupal case.",
    imitates: ["emerging caddis", "adult caddis"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["14", "16", "18"],
    colors: ["Tan", "Olive", "Brown"],
    fishing_tips: "Use when fish refuse the Elk Hair Caddis — the X-Caddis sits in the film rather than on top. Deadly on smooth glides during evening caddis hatches.",
    rank: 24,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "adams",
    name: "Adams",
    category: "dry",
    description: "The original Adams dry fly is the foundation of American mayfly fishing. Its mixed grizzly and brown hackle, gray body, and grizzly wings present a versatile profile that suggests a wide range of mayflies on any stream. It predates the parachute version by over 50 years.",
    imitates: ["mayflies", "general dry fly attractor"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18", "20"],
    colors: ["Gray"],
    rank: 25,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "green-drake",
    name: "Green Drake",
    category: "dry",
    description: "The Green Drake is the biggest mayfly hatch of the year in many western rivers. This large, heavily hackled pattern imitates Drunella grandis duns, which can be size #10-12. When the Green Drake hatch is on, even the most wary brown trout abandon caution to gorge on these oversized mayflies.",
    imitates: ["Green Drake mayflies", "Drunella grandis"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12"],
    colors: ["Olive-green", "Dark olive"],
    fishing_tips: "Green Drake hatches are short-lived (2-3 weeks) and time-specific (usually late morning to early afternoon). When it's on, fish aggressively with confident drifts.",
    rank: 26,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "humpy",
    name: "Humpy",
    category: "dry",
    description: "The Humpy is an indestructible attractor dry fly built for fast pocket water. Its deer or elk hair shellback and overbody create a nearly unsinkable profile that doubles as a perfect dry-dropper indicator. It suggests stoneflies, caddis, and any large insect on the surface.",
    imitates: ["stoneflies", "caddis", "general attractor"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Yellow", "Royal", "Green"],
    fishing_tips: "A pocket water specialist. Fish it in turbulent riffles and runs where other dry flies get drowned. Makes an excellent indicator fly for a dropper nymph.",
    rank: 27,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "march-brown",
    name: "March Brown",
    category: "dry",
    description: "The March Brown imitates Rhithrogena morrisoni, one of the first significant mayfly hatches of the season in western rivers. Its mottled brown wings and reddish-brown body accurately represent this early-season mayfly that triggers some of the year's most enthusiastic dry fly feeding.",
    imitates: ["March Brown mayflies", "Rhithrogena morrisoni"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["12", "14"],
    colors: ["Brown", "Tan-brown"],
    rank: 28,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "cdc-blue-winged-olive",
    name: "CDC Blue-Winged Olive",
    category: "dry",
    description: "A CDC-winged BWO that rides perfectly in the surface film with no floatant needed. The natural oils in CDC feathers keep the fly sitting at the exact surface level where trout expect to see emerging Baetis — neither on top nor below the film.",
    imitates: ["Baetis duns", "Blue-Winged Olives"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22"],
    colors: ["Olive", "Dark olive"],
    fishing_tips: "Never apply floatant to CDC — it destroys the natural oils. Dry the fly by false casting between fish. Replace after 3-4 fish.",
    rank: 29,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "sulphur-dun",
    name: "Sulphur Dun",
    category: "dry",
    description: "The Sulphur Dun imitates Ephemerella dorothea and E. invaria, the signature evening hatch on eastern and midwestern rivers. A creamy yellow body with light dun wings matches the delicate profile of these iconic mayflies during summer twilight feeding frenzies.",
    imitates: ["Sulphur mayflies", "Ephemerella dorothea"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["14", "16", "18"],
    colors: ["Sulphur yellow", "Cream"],
    rank: 30,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "trico-spinner",
    name: "Trico Spinner",
    category: "dry",
    description: "The Trico Spinner imitates the spent Tricorythodes spinner fall — one of the most technical and rewarding dry fly events of the year. Trout line up in pods and sip hundreds of tiny, white-winged spinners from the surface in predictable feeding lanes.",
    imitates: ["Trico spinners", "Tricorythodes"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["20", "22", "24"],
    colors: ["Black/White"],
    fishing_tips: "Trico spinner falls occur early morning. Fish to rising fish with pinpoint accuracy — 6x or 7x tippet is essential. A trailing shuck version can outperform the standard.",
    rank: 31,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "henrys-fork-hopper",
    name: "Henry's Fork Hopper",
    category: "dry",
    description: "Mike Lawson's Henry's Fork Hopper is the standard foam-body grasshopper pattern for slick water. Unlike bushy hoppers designed for rough water, this pattern sits flush in the film with a realistic profile that satisfies the most discriminating spring creek trout.",
    imitates: ["grasshoppers"],
    effective_species: TROUT,
    water_types: ["spring creek", "freestone"],
    sizes: ["8", "10", "12"],
    colors: ["Tan", "Yellow", "Olive"],
    fishing_tips: "Plop the hopper on the bank and twitch it into the current for the most natural presentation. Let it drift drag-free once in the current. Best in late summer through early fall.",
    rank: 32,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "deep-sparrow-nymph",
    name: "Deep Sparrow Nymph",
    category: "nymph",
    description: "A heavy tungsten jig nymph with a dubbed body and CDC collar that imitates a range of small mayfly nymphs. The sparse CDC legs pulse in current while the slim profile slices through the water column. A competition staple for technical Euro nymphing.",
    imitates: ["mayfly nymphs", "small stonefly nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["14", "16", "18"],
    colors: ["Brown", "Olive"],
    bead_options: ["Tungsten slotted"],
    hook_styles: ["Jig hook"],
    rank: 33,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "iron-lotus",
    name: "Iron Lotus",
    category: "nymph",
    description: "A modern Czech nymph with a woven body, tungsten bead, and hot spot collar. Built for heavy Euro nymphing in fast water, it combines a slim fast-sinking profile with enough flash and color to attract attention from trout holding in deep runs.",
    imitates: ["caddis larvae", "mayfly nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16"],
    colors: ["Olive/Pink", "Brown/Orange"],
    bead_options: ["Tungsten"],
    hook_styles: ["Czech nymph hook", "Jig hook"],
    rank: 34,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "callibaetis-cripple",
    name: "Callibaetis Cripple",
    category: "dry",
    description: "This cripple pattern imitates a Callibaetis mayfly that failed to fully emerge from its shuck — stuck half in, half out of the surface film. Stillwater trout key on these helpless insects, making the cripple pattern the top producer during Callibaetis hatches on lakes and ponds.",
    imitates: ["Callibaetis duns", "crippled mayflies"],
    effective_species: TROUT,
    water_types: ["lake", "spring creek"],
    sizes: ["14", "16"],
    colors: ["Gray", "Speckled gray"],
    fishing_tips: "Essential for lake fishing during Callibaetis hatches. Fish with a very slow hand-twist retrieve or dead drift on the surface near weed beds.",
    rank: 35,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "olive-thorax-dun",
    name: "Olive Thorax Dun",
    category: "dry",
    description: "Vince Marinaro's Thorax Dun design places the hackle at the center of the body rather than the head, allowing the fly to sit lower on the water with a more natural attitude. The olive version is tailored for matching BWO hatches on demanding spring creeks.",
    imitates: ["BWO duns", "olive mayflies"],
    effective_species: TROUT,
    water_types: ["spring creek", "tailwater"],
    sizes: ["16", "18", "20"],
    colors: ["Olive", "Gray-olive"],
    rank: 36,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "quill-gordon",
    name: "Quill Gordon",
    category: "dry",
    description: "The Quill Gordon is a Catskill classic tied with a stripped peacock quill body that creates a delicate, segmented silhouette. It imitates the Epeorus pleuralis mayfly and is one of the first major hatches of the eastern trout season, signaling spring's arrival on Appalachian streams.",
    imitates: ["Quill Gordon mayflies", "Epeorus pleuralis"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["12", "14"],
    colors: ["Gray/Cream"],
    rank: 37,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "goddard-caddis",
    name: "Goddard Caddis",
    category: "dry",
    description: "John Goddard and Cliff Henry's spun deer hair caddis is the most buoyant caddis imitation ever conceived. The clipped deer hair body traps air and rides high in the fastest water, making it the go-to choice for pocket water and heavy riffles where standard caddis patterns drown.",
    imitates: ["adult caddis", "October caddis"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Tan", "Brown", "Olive"],
    fishing_tips: "Skitter this fly across the surface to imitate egg-laying caddis. It's nearly indestructible and will float through the roughest pocket water.",
    rank: 38,
    featured: false,
    is_hero_pattern: false,
  },

  // ── NYMPHS (39-58) — 20 more to make 30 total ─────────────────────────
  {
    slug: "prince-nymph",
    name: "Prince Nymph",
    category: "nymph",
    description: "Doug Prince's attractor nymph combines peacock herl, brown hackle, goose biot wings and tail in a pattern that doesn't match any specific insect but consistently catches trout. The white biot wings provide flash and movement that draw attention in fast water.",
    imitates: ["stonefly nymphs", "attractor", "general nymph"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14", "16", "18"],
    colors: ["Peacock/White"],
    bead_options: ["Tungsten", "Brass", "None"],
    hook_styles: ["Standard nymph", "Jig hook"],
    fishing_tips: "Fish as a dropper behind a heavier point fly. The white biot wings add visibility and attraction in off-color water.",
    rank: 39,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "rainbow-warrior",
    name: "Rainbow Warrior",
    category: "nymph",
    description: "Lance Egan's Rainbow Warrior is a flashy midge/mayfly crossover pattern with a pearl Mylar body, red thread collar, and sow-scud dubbing thorax. It attracts attention and triggers strikes from trout feeding on a wide range of subsurface food in tailwater and spring creek environments.",
    imitates: ["midge pupae", "mayfly nymphs", "attractor"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["16", "18", "20", "22"],
    colors: ["Pearl/Red"],
    bead_options: ["Tungsten"],
    hook_styles: ["Jig hook", "Standard nymph"],
    fishing_tips: "A competition staple. Fish it as a dropper in a Euro rig or under an indicator on tailwaters. The flash body is visible even in turbid water.",
    rank: 40,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "walt-s-worm",
    name: "Walt's Worm",
    category: "nymph",
    description: "Walt Young's deceptively simple nymph uses hare's ear dubbing on a curved hook to imitate caddis larvae, crane fly larvae, and scuds simultaneously. Its simplicity and versatility have made it a go-to pattern for competition anglers and guides worldwide.",
    imitates: ["caddis larvae", "crane fly larvae", "scuds"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16"],
    colors: ["Tan", "Cream", "Olive"],
    bead_options: ["Tungsten", "None"],
    hook_styles: ["Scud hook", "Curved nymph"],
    rank: 41,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "stonefly-nymph",
    name: "Pat's Rubber Legs",
    category: "nymph",
    description: "Pat's Rubber Legs is a large, heavily weighted stonefly nymph pattern with rubber legs that pulse and wiggle in current. Built to get down deep in fast water, it is the go-to lead fly for western freestone rivers during salmonfly and golden stonefly pre-hatch periods.",
    imitates: ["stonefly nymphs", "salmonfly nymphs", "golden stonefly nymphs"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["4", "6", "8", "10"],
    colors: ["Brown/Black", "Olive/Brown", "Black"],
    bead_options: ["Tungsten", "Lead wraps"],
    hook_styles: ["3x long nymph"],
    fishing_tips: "Fish as the heavy lead fly in a double-nymph rig. Needs enough weight to bounce along rocky bottoms in heavy current.",
    rank: 42,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "lightning-bug",
    name: "Lightning Bug",
    category: "nymph",
    description: "The Lightning Bug is a flashy attractor nymph with a pearl tinsel body and tungsten bead that catches light and attention in the water column. It suggests a variety of emerging insects and works well as a dropper behind a heavier point fly.",
    imitates: ["mayfly nymphs", "caddis pupae", "attractor"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["14", "16", "18"],
    colors: ["Pearl", "Gold"],
    bead_options: ["Tungsten", "Brass"],
    hook_styles: ["Standard nymph"],
    rank: 43,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "jig-ptn",
    name: "Jig Pheasant Tail",
    category: "nymph",
    description: "The jig-hook version of the Pheasant Tail Nymph rides point-up to reduce snags and fishes perfectly in a tight-line Euro nymphing setup. A slotted tungsten bead provides weight and the classic pheasant tail body does the rest. This is the competition angler's refined version of the original.",
    imitates: ["mayfly nymphs", "BWO nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["14", "16", "18", "20"],
    colors: ["Natural", "Olive"],
    bead_options: ["Tungsten slotted"],
    hook_styles: ["Jig hook"],
    rank: 44,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "mop-fly",
    name: "Mop Fly",
    category: "nymph",
    description: "The Mop Fly — made from a strip of chenille mop material on a jig hook — is the most controversial and undeniably effective nymph of the 21st century. It imitates caddis larvae, aquatic worms, and crane fly larvae with a soft, translucent body that trout devour without hesitation.",
    imitates: ["caddis larvae", "crane fly larvae", "aquatic worms"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14"],
    colors: ["Cream", "Tan", "Chartreuse", "Pink"],
    bead_options: ["Tungsten"],
    hook_styles: ["Jig hook"],
    fishing_tips: "Dead drift it through runs and slots. The soft body has a natural, translucent look underwater that drives trout crazy. Love it or hate it, this fly catches fish.",
    rank: 45,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "caddis-larva-green-rock-worm",
    name: "Green Rock Worm",
    category: "nymph",
    description: "The Green Rock Worm imitates free-living Rhyacophila caddis larvae — the bright green caterpillar-like insects found clinging to rocks in every freestone river. A simple green dubbing body with a dark head is one of the most underrated nymph patterns in fly fishing.",
    imitates: ["Rhyacophila caddis larvae", "green rock worms"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["12", "14", "16"],
    colors: ["Bright green", "Olive-green"],
    bead_options: ["Tungsten", "Brass"],
    hook_styles: ["Curved nymph", "Standard nymph"],
    rank: 46,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "flashback-hares-ear",
    name: "Flashback Hare's Ear",
    category: "nymph",
    description: "The Flashback variant adds a strip of pearl tinsel over the wing case of the classic Hare's Ear, providing flash that mimics the trapped gas bubble of an emerging insect. This simple addition significantly increases the fly's visibility and effectiveness, especially in off-color water.",
    imitates: ["mayfly nymphs", "caddis larvae", "scuds"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Natural", "Brown"],
    bead_options: ["Gold bead", "Tungsten"],
    hook_styles: ["Standard nymph"],
    rank: 47,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "twenty-incher",
    name: "Twenty Incher",
    category: "nymph",
    description: "The Twenty Incher is a large, heavily weighted stonefly nymph with rubber legs and a chenille body. Designed for deep, fast water, it acts as both a fish-catcher and an anchor fly to drag smaller droppers into the strike zone.",
    imitates: ["stonefly nymphs", "large aquatic insects"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["4", "6", "8"],
    colors: ["Black", "Brown"],
    bead_options: ["Tungsten", "Lead wraps"],
    hook_styles: ["3x long nymph"],
    rank: 48,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "micro-mayfly",
    name: "Micro Mayfly",
    category: "nymph",
    description: "A tiny, sparse nymph tied on a barbless jig hook that imitates the smallest mayfly nymphs in the drift. Effective during heavy Baetis and Trico nymph activity, it is the secret weapon for technical tailwater fishing when trout are keyed on minuscule naturals.",
    imitates: ["small mayfly nymphs", "Baetis nymphs", "Trico nymphs"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22", "24"],
    colors: ["Olive", "Brown", "Gray"],
    bead_options: ["Micro tungsten"],
    hook_styles: ["Jig hook"],
    rank: 49,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "soft-hackle-partridge-and-orange",
    name: "Partridge and Orange",
    category: "nymph",
    description: "The Partridge and Orange is a traditional soft-hackle wet fly dating back centuries on English rivers. A simple orange silk body with a Hungarian partridge hackle collar creates a pattern that imitates emerging caddis pupae and mayfly nymphs rising through the water column.",
    imitates: ["caddis pupae", "emerging mayflies"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["12", "14", "16"],
    colors: ["Orange", "Yellow"],
    hook_styles: ["Standard wet fly"],
    fishing_tips: "Swing on a tight line across and downstream. The soft hackle pulses and breathes in the current, mimicking an emerging insect struggling toward the surface.",
    rank: 50,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "quasimodo-pheasant-tail",
    name: "Quasimodo Pheasant Tail",
    category: "nymph",
    description: "A Czech-style Pheasant Tail variation tied on a curved scud hook with a pronounced hump-back profile. The exaggerated shape and heavy bead get it into the feeding zone fast, and the curved body imitates the natural posture of drifting mayfly and scud nymphs.",
    imitates: ["mayfly nymphs", "scuds"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Natural", "Olive"],
    bead_options: ["Tungsten"],
    hook_styles: ["Scud hook", "Czech nymph hook"],
    rank: 51,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "squirrel-nymph",
    name: "Squirrel Nymph",
    category: "nymph",
    description: "Dave Whitlock's Squirrel Nymph uses fox squirrel body hair and tail as dubbing for a buggy, all-purpose nymph. The guard hairs create movement and trap air bubbles, while the mottled coloration suggests stonefly nymphs, caddis larvae, and mayfly nymphs simultaneously.",
    imitates: ["stonefly nymphs", "caddis larvae", "mayfly nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Natural fox squirrel", "Dark brown"],
    bead_options: ["Gold bead", "Tungsten"],
    hook_styles: ["2x long nymph"],
    rank: 52,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "bead-head-caddis-pupa",
    name: "Beadhead Caddis Pupa",
    category: "nymph",
    description: "This simple caddis pupa imitation features a dubbed body with a contrasting thorax and a soft hackle collar suggesting legs. It imitates the ascending pupa stage of caddis — the moment when trout intercept them rising through the water column to hatch at the surface.",
    imitates: ["caddis pupae", "emerging caddis"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Green", "Tan", "Olive"],
    bead_options: ["Tungsten", "Brass"],
    hook_styles: ["Curved nymph", "Standard nymph"],
    fishing_tips: "Fish in the upper water column, swinging on the rise during caddis emergence. The hackle collar pulses naturally in current.",
    rank: 53,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "two-bit-hooker",
    name: "Two Bit Hooker",
    category: "nymph",
    description: "A hot-collared jig nymph that combines a wire body with a fluorescent dubbing collar for a slim, fast-sinking profile. Developed for competition Euro nymphing, it serves as a versatile point fly that gets deep quickly while still attracting attention with its hot spot.",
    imitates: ["mayfly nymphs", "caddis larvae", "attractor"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["14", "16", "18"],
    colors: ["Copper/Pink", "Copper/Orange"],
    bead_options: ["Tungsten slotted"],
    hook_styles: ["Jig hook"],
    rank: 54,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "sexy-walts-worm",
    name: "Sexy Walt's Worm",
    category: "nymph",
    description: "A modernized version of Walt's Worm with a UV dubbing body and a glass bead for subtle weight and translucency. The curved hook and shaggy dubbing profile imitate caddis larvae and scuds — two of the most important subsurface food items in trout streams worldwide.",
    imitates: ["caddis larvae", "scuds", "sow bugs"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["12", "14", "16"],
    colors: ["Tan", "Pink", "Olive"],
    bead_options: ["Glass bead", "Tungsten"],
    hook_styles: ["Scud hook"],
    rank: 55,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "scud-pattern",
    name: "Scud",
    category: "nymph",
    description: "The Scud imitates Gammarus and Hyalella amphipods — crustaceans that thrive in weed beds on tailwaters and spring creeks. With a curved body, shellback, and picked-out dubbing legs, it represents a food source trout eat in enormous quantities wherever scuds are present.",
    imitates: ["scuds", "freshwater shrimp", "amphipods"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "lake"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Olive", "Gray", "Orange", "Tan"],
    bead_options: ["Tungsten", "None"],
    hook_styles: ["Scud hook"],
    fishing_tips: "Dead drift through weed beds and along the bottom of spring creeks and tailwaters. Scuds are most active during low-light conditions.",
    rank: 56,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "sow-bug",
    name: "Sow Bug",
    category: "nymph",
    description: "The Sow Bug (or aquatic isopod) imitation is a flat-profiled, segmented nymph that imitates the tiny crustaceans found in enormous densities on tailwaters like the Bighorn, White River, and San Juan. Trout eat them all day, every day — making this a staple subsurface pattern.",
    imitates: ["sow bugs", "aquatic isopods"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["14", "16", "18"],
    colors: ["Gray", "Tan", "Pink"],
    bead_options: ["Small tungsten", "None"],
    hook_styles: ["Scud hook"],
    rank: 57,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "polish-woven-nymph",
    name: "Polish Woven Nymph",
    category: "nymph",
    description: "The Polish Woven Nymph features a two-tone woven body that creates a durable, segmented abdomen resembling various aquatic larvae. Originated by Polish competition anglers, it sinks quickly and its unique construction provides a realistic translucent quality that standard dubbed flies cannot achieve.",
    imitates: ["caddis larvae", "stonefly nymphs", "mayfly nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14", "16"],
    colors: ["Olive/Cream", "Brown/Tan"],
    bead_options: ["Tungsten"],
    hook_styles: ["Czech nymph hook", "Jig hook"],
    rank: 58,
    featured: false,
    is_hero_pattern: false,
  },

  // ── STREAMERS (59-68) — 10 more to make 12 total ──────────────────────
  {
    slug: "slumpbuster",
    name: "Slumpbuster",
    category: "streamer",
    description: "John Barr's Slumpbuster is a cone-headed pine squirrel strip streamer designed to imitate sculpin and baitfish. Its flat bottom profile and squirrel strip wing create a seductive, undulating action that draws aggressive strikes from large brown trout. Named for its ability to break a fishing slump.",
    imitates: ["sculpin", "baitfish", "crayfish"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["4", "6", "8"],
    colors: ["Olive", "Brown", "Black"],
    bead_options: ["Tungsten cone"],
    hook_styles: ["3x long streamer"],
    fishing_tips: "Fish on a sink-tip line with a jig-strip retrieve — short, erratic strips that mimic a fleeing sculpin.",
    rank: 59,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "sex-dungeon",
    name: "Sex Dungeon",
    category: "streamer",
    description: "Kelly Galloup's Sex Dungeon is a massive, articulated streamer designed to trigger predatory aggression from trophy brown trout. With dual hooks, rubber legs, and a head that pushes water, it creates commotion and vibration that big fish can't ignore. This is a fly for anglers hunting the fish of a lifetime.",
    imitates: ["large baitfish", "sculpin", "crayfish"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["2", "4", "6"],
    colors: ["Olive/White", "Black/Olive", "White"],
    bead_options: ["Weighted articulated shanks", "Cone head"],
    hook_styles: ["Articulated streamer"],
    fishing_tips: "Strip aggressively with a heavy sink-tip line along undercut banks and through deep pools. This fly is designed to be fished with authority.",
    rank: 60,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "zonker",
    name: "Zonker",
    category: "streamer",
    description: "The Zonker uses a rabbit strip tied over a Mylar tube body to create a baitfish imitation with incredible movement. The rabbit fur pulses and breathes with every strip, while the Mylar body provides flash. Simple to tie and deadly effective on trout feeding on minnows.",
    imitates: ["minnows", "baitfish", "dace"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "lake"],
    sizes: ["4", "6", "8", "10"],
    colors: ["Natural rabbit", "Olive", "White", "Black"],
    bead_options: ["Cone head", "None"],
    hook_styles: ["3x long streamer"],
    rank: 61,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "muddler-minnow",
    name: "Muddler Minnow",
    category: "streamer",
    description: "Don Gapen's Muddler Minnow is one of fly fishing's most versatile patterns. Its spun deer hair head pushes water and creates a wide profile suggesting sculpin, while it can be fished deep on a sink-tip or skated on the surface as a giant dry fly. It has accounted for trophy trout worldwide since 1937.",
    imitates: ["sculpin", "grasshoppers", "stoneflies", "baitfish"],
    effective_species: TROUT,
    water_types: ["freestone", "lake"],
    sizes: ["4", "6", "8", "10"],
    colors: ["Natural", "Black", "White"],
    bead_options: ["None", "Cone head"],
    hook_styles: ["3x long streamer"],
    fishing_tips: "Fish deep and slow for sculpin imitation, or grease the deer hair head and skate it across the surface for explosive strikes.",
    rank: 62,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "circus-peanut",
    name: "Circus Peanut",
    category: "streamer",
    description: "Russ Maddin's Circus Peanut is a dual-articulated streamer with a peanut-shaped foam head that gives it an erratic, darting action. The foam head also makes it neutrally buoyant, allowing it to hover and pause during the retrieve — a trigger that makes big trout commit.",
    imitates: ["large baitfish", "sculpin", "crayfish"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["2", "4", "6"],
    colors: ["Olive/Yellow", "Black/Yellow", "White"],
    bead_options: ["Weighted shanks"],
    hook_styles: ["Articulated streamer"],
    rank: 63,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "olive-bugger",
    name: "Olive Woolly Bugger",
    category: "streamer",
    description: "The olive variant of the Woolly Bugger is specifically effective as a leech and damselfly nymph imitation. The olive coloration matches the most common leech and baitfish colorations in western rivers and stillwaters, making it slightly more imitative than the standard black.",
    imitates: ["leeches", "damselfly nymphs", "baitfish"],
    effective_species: TROUT,
    water_types: ["freestone", "lake", "tailwater"],
    sizes: ["6", "8", "10", "12"],
    colors: ["Olive"],
    bead_options: ["Brass cone", "Tungsten bead", "None"],
    hook_styles: ["3x long streamer"],
    rank: 64,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "clouser-minnow-trout",
    name: "Clouser Minnow (Trout)",
    category: "streamer",
    description: "Bob Clouser's iconic dumbbell-eyed minnow pattern, scaled down for trout water. The weighted eyes make it ride hook-point-up and create a jigging action that imitates a wounded baitfish. A staple on rivers where trout feed on minnows and juvenile fish.",
    imitates: ["minnows", "juvenile fish", "baitfish"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "lake"],
    sizes: ["6", "8", "10"],
    colors: ["Olive/White", "Chartreuse/White", "Brown/White"],
    bead_options: ["Lead dumbbell eyes"],
    hook_styles: ["Standard streamer"],
    rank: 65,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "kreelex",
    name: "Kreelex",
    category: "streamer",
    description: "The Kreelex is a simple but flashy baitfish pattern made primarily of metallic lateral scale material and holographic flash. When stripped through the water, it creates an intense flash-and-shimmer effect that mimics panicked baitfish and draws reaction strikes from predatory trout.",
    imitates: ["baitfish", "shiners", "minnows"],
    effective_species: TROUT,
    water_types: ["tailwater", "lake", "freestone"],
    sizes: ["6", "8", "10"],
    colors: ["Silver", "Gold", "Copper"],
    bead_options: ["Dumbbell eyes", "Cone head"],
    hook_styles: ["Standard streamer"],
    rank: 66,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "double-bunny",
    name: "Double Bunny",
    category: "streamer",
    description: "The Double Bunny uses two rabbit strips — one on top, one on the bottom of the hook — to create a wide, undulating baitfish profile with maximum movement. The dual strips pulse independently, creating a lifelike swimming action that big trout find impossible to resist.",
    imitates: ["large baitfish", "sculpin", "leeches"],
    effective_species: TROUT,
    water_types: ["freestone", "lake"],
    sizes: ["2", "4", "6", "8"],
    colors: ["Olive/White", "Black/White", "Brown/Orange"],
    bead_options: ["Cone head", "Lead eyes"],
    hook_styles: ["3x long streamer"],
    rank: 67,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "autumn-splendor",
    name: "Autumn Splendor",
    category: "streamer",
    description: "Mike Schmidt's Autumn Splendor is a balanced leech/baitfish pattern designed to be fished on a jig hook under an indicator or on a Euro nymphing rig. Its marabou and flashabou tail creates subtle movement even when the fly is nearly stationary, triggering strikes from lethargic trout.",
    imitates: ["leeches", "baitfish"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["8", "10", "12"],
    colors: ["Olive", "Brown", "Black"],
    bead_options: ["Tungsten"],
    hook_styles: ["Jig hook", "Standard streamer"],
    rank: 68,
    featured: false,
    is_hero_pattern: false,
  },

  // ── EMERGERS (69-78) — 10 more to make 12 total ───────────────────────
  {
    slug: "barrs-emerger",
    name: "Barr's Emerger",
    category: "emerger",
    description: "John Barr's BWO emerger is the definitive trailing-shuck pattern for imitating Blue-Winged Olives transitioning from nymph to dun. The brown Z-lon shuck, olive body, and dun hackle create a profile that hangs perfectly in the film, fooling the most selective tailwater trout.",
    imitates: ["BWO emergers", "Baetis emergers"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22"],
    colors: ["Olive", "Gray-olive"],
    fishing_tips: "Fish in the film during BWO hatches. It is the pattern to reach for when trout refuse standard BWO dries.",
    rank: 69,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "emerging-caddis-pupa",
    name: "Emerging Caddis Pupa",
    category: "emerger",
    description: "This pattern captures the explosive moment when a caddis pupa ascends through the water column and breaks through the surface film. A dubbed body with a soft hackle collar and a trailing Z-lon shuck create a fly that works in the film and just below it.",
    imitates: ["caddis pupae", "emerging caddis"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Green", "Tan", "Olive"],
    hook_styles: ["Curved emerger hook"],
    rank: 70,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "bwo-loop-wing-emerger",
    name: "BWO Loop Wing Emerger",
    category: "emerger",
    description: "A CDC loop wing emerger specifically tied to match Blue-Winged Olives. The looped CDC creates a visible, air-trapping wing while the sparse olive body and Z-lon shuck hang below the film. It is one of the most effective flies for selective trout during Baetis emergence.",
    imitates: ["BWO emergers", "Baetis emergers"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22"],
    colors: ["Olive", "Dark olive"],
    rank: 71,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "pmd-emerger",
    name: "PMD Emerger",
    category: "emerger",
    description: "A trailing-shuck emerger pattern specifically colored to match Pale Morning Dun emergence. The pale yellow body, brown shuck, and dun wing suggest a PMD transitioning through the surface film — a posture trout find far more vulnerable than a fully formed dun.",
    imitates: ["PMD emergers", "Pale Morning Dun emergers"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["14", "16", "18"],
    colors: ["Pale yellow", "Sulphur"],
    rank: 72,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "last-chance-cripple",
    name: "Last Chance Cripple",
    category: "emerger",
    description: "René Harrop's Last Chance Cripple imitates a mayfly that failed to fully emerge, trapped half-in, half-out of its nymphal shuck. Named after Idaho's Last Chance, this pattern is devastating on Henry's Fork and any other water where trout feed selectively on vulnerable emergers.",
    imitates: ["crippled mayflies", "failed emergers"],
    effective_species: TROUT,
    water_types: ["spring creek", "tailwater"],
    sizes: ["14", "16", "18", "20"],
    colors: ["Olive", "PMD yellow", "Gray"],
    fishing_tips: "Fish during heavy mayfly hatches when trout ignore perfect duns and focus on the easy meals — cripples stuck in the film.",
    rank: 73,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "snowshoe-emerger",
    name: "Snowshoe Emerger",
    category: "emerger",
    description: "The Snowshoe Emerger uses snowshoe rabbit foot hair as a wing material, providing exceptional floatation and a natural, translucent wing profile. The waterproof qualities of snowshoe hair make this a more durable alternative to CDC emergers.",
    imitates: ["mayfly emergers", "BWO emergers"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["16", "18", "20", "22"],
    colors: ["Olive", "Gray", "Tan"],
    rank: 74,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "spotlight-emerger",
    name: "Spotlight Emerger",
    category: "emerger",
    description: "A modern emerger pattern with a bright foam post for visibility and a sparse body that hangs in the film. The foam post doubles as both a wing and a strike indicator, making it ideal for fishing in broken water where standard emerger patterns disappear from view.",
    imitates: ["mayfly emergers", "caddis emergers"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["14", "16", "18"],
    colors: ["Olive", "Tan", "Gray"],
    rank: 75,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "matthews-sparkle-emerger",
    name: "Sparkle Pupa",
    category: "emerger",
    description: "Gary LaFontaine's Sparkle Pupa uses Antron yarn to trap air bubbles around the body, imitating the gas bubble that caddis pupae generate as they ascend to the surface to hatch. This revolutionary material choice forever changed how fly tyers approach caddis emerger design.",
    imitates: ["caddis pupae", "emerging caddis"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16"],
    colors: ["Brown/Yellow", "Olive/Green", "Gray"],
    fishing_tips: "Fish in the film or just below it during caddis emergence. The trapped air bubbles create the exact silhouette trout see from below.",
    rank: 76,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "tungsten-torpedo",
    name: "Tungsten Torpedo",
    category: "nymph",
    description: "A heavy, streamlined Euro nymph with a smooth thread body under UV resin and a large tungsten bead. Designed as a pure anchor fly to get lighter droppers into the strike zone in fast, deep water. Its minimal profile reduces drag while its weight ensures constant bottom contact.",
    imitates: ["caddis larvae", "mayfly nymphs", "anchor fly"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["10", "12", "14"],
    colors: ["Black", "Olive", "Brown"],
    bead_options: ["Tungsten (heavy)"],
    hook_styles: ["Jig hook"],
    rank: 77,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "quigley-cripple",
    name: "Quigley Cripple",
    category: "emerger",
    description: "Bob Quigley's Cripple is a hybrid emerger with a nymph body below the film and a hackle-tip wing above, connected by a parachute hackle that floats in the surface. It represents a mayfly caught between worlds — not quite nymph, not quite dun — and trout eat it with confidence.",
    imitates: ["crippled mayflies", "emerging mayflies"],
    effective_species: TROUT,
    water_types: ["spring creek", "tailwater", "freestone"],
    sizes: ["14", "16", "18", "20"],
    colors: ["Olive", "Tan", "Gray"],
    fishing_tips: "Outstanding during heavy hatches when trout become ultra-selective. Fish it where you see refusals to standard dries.",
    rank: 78,
    featured: false,
    is_hero_pattern: false,
  },

  // ── WET FLIES (79-86) — 8 patterns ────────────────────────────────────
  {
    slug: "soft-hackle-hares-ear",
    name: "Soft Hackle Hare's Ear",
    category: "wet",
    description: "A Hare's Ear body with a soft Hungarian partridge hackle collar, designed to be swung across and downstream to imitate emerging caddis and mayflies. The pulsing hackle fibers create lifelike movement that triggers strikes from trout intercepting ascending insects.",
    imitates: ["emerging caddis", "emerging mayflies", "drowned adult insects"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16"],
    colors: ["Natural", "Olive"],
    hook_styles: ["Standard wet fly"],
    fishing_tips: "Swing on a tight line across and down. Let the fly hang at the end of the drift — the 'dangle' often produces aggressive takes.",
    rank: 79,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "leadwing-coachman",
    name: "Leadwing Coachman",
    category: "wet",
    description: "The Leadwing Coachman is a traditional wet fly with a peacock herl body and dark slate wings that has been catching trout for over a century. Its dark silhouette suggests drowned caddis, mayflies, and small beetles, making it a reliable searching pattern when swung below the surface.",
    imitates: ["drowned insects", "caddis", "small beetles"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["12", "14", "16"],
    colors: ["Dark gray/Peacock"],
    hook_styles: ["Standard wet fly"],
    rank: 80,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "march-brown-wet",
    name: "March Brown Wet",
    category: "wet",
    description: "The wet fly version of the March Brown is a classic swing pattern for early season fishing. Its mottled brown wings and gold-ribbed body imitate drowned March Brown duns and emerging nymphs rising through the water column — a presentation that trout intercept aggressively in spring.",
    imitates: ["drowned March Brown duns", "emerging mayflies"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["12", "14"],
    colors: ["Brown", "Mottled brown"],
    hook_styles: ["Standard wet fly"],
    rank: 81,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "soft-hackle-pheasant-tail",
    name: "Soft Hackle Pheasant Tail",
    category: "wet",
    description: "A marriage of the Pheasant Tail Nymph and soft hackle tradition, this pattern fishes brilliantly on the swing. The pheasant tail body provides the mayfly profile while the partridge hackle collar breathes and pulses, suggesting an emerging nymph ascending toward the surface.",
    imitates: ["emerging mayflies", "ascending nymphs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["14", "16", "18"],
    colors: ["Natural pheasant", "Olive"],
    hook_styles: ["Standard wet fly"],
    rank: 82,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "picket-pin",
    name: "Picket Pin",
    category: "wet",
    description: "The Picket Pin is a traditional stillwater wet fly that imitates damselfly nymphs and emergers. Its peacock herl body, grizzly hackle, and white wing make it a productive lake pattern when stripped slowly through weed beds or along drop-offs.",
    imitates: ["damselfly nymphs", "dragonfly nymphs", "general wet fly"],
    effective_species: TROUT,
    water_types: ["lake"],
    sizes: ["10", "12", "14"],
    colors: ["Peacock/White"],
    hook_styles: ["Standard wet fly", "2x long"],
    rank: 83,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "carey-special",
    name: "Carey Special",
    category: "wet",
    description: "The Carey Special is a Pacific Northwest stillwater staple featuring a pheasant rump hackle that creates an oversized, mobile collar suggesting dragonfly nymphs, leeches, and sedge pupae. It is one of the most effective subsurface lake patterns for trout and is a proven producer on BC interior lakes.",
    imitates: ["dragonfly nymphs", "sedge pupae", "leeches"],
    effective_species: TROUT,
    water_types: ["lake"],
    sizes: ["8", "10", "12"],
    colors: ["Olive", "Brown", "Black"],
    hook_styles: ["2x long wet fly"],
    fishing_tips: "Retrieve with a slow hand-twist strip along weed bed edges and shoals. The pheasant rump hackle creates an enormous pulsing profile underwater.",
    rank: 84,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "woolly-worm",
    name: "Woolly Worm",
    category: "wet",
    description: "The ancestor of the Woolly Bugger, the Woolly Worm is a palmered chenille-and-hackle pattern that has been catching trout for centuries. Without the marabou tail, it presents a caterpillar-like profile that imitates a wide range of aquatic and terrestrial larvae.",
    imitates: ["caterpillars", "aquatic larvae", "general wet fly"],
    effective_species: TROUT,
    water_types: ["freestone", "lake"],
    sizes: ["8", "10", "12", "14"],
    colors: ["Black", "Brown", "Olive", "Grizzly"],
    hook_styles: ["2x long wet fly"],
    rank: 85,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "partridge-and-green",
    name: "Partridge and Green",
    category: "wet",
    description: "The green silk-bodied companion to the Partridge and Orange, this soft hackle wet fly imitates emerging caddis with its bright green body and mobile partridge collar. Swung across and downstream during caddis emergence, it is one of the most effective traditional wet flies ever tied.",
    imitates: ["emerging caddis", "green caddis pupae"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["12", "14", "16"],
    colors: ["Green"],
    hook_styles: ["Standard wet fly"],
    rank: 86,
    featured: false,
    is_hero_pattern: false,
  },

  // ── TERRESTRIALS (87-94) — 8 patterns ─────────────────────────────────
  {
    slug: "chernobyl-ant",
    name: "Chernobyl Ant",
    category: "terrestrial",
    description: "The Chernobyl Ant is an oversized foam terrestrial pattern with rubber legs that creates a massive disturbance on the surface. While it doesn't look much like a real ant, its high-floating foam body and leggy profile suggest grasshoppers, stoneflies, and large terrestrial insects, making it the ultimate summer dry-dropper indicator.",
    imitates: ["grasshoppers", "large ants", "stoneflies", "terrestrial insects"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["6", "8", "10", "12"],
    colors: ["Black/Orange", "Tan/Yellow", "Black/Red"],
    fishing_tips: "Slap it on the water near overhanging banks and grass — the plop triggers aggressive strikes. Add a dropper nymph 18-24 inches below for a deadly combination.",
    rank: 87,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "foam-beetle",
    name: "Foam Beetle",
    category: "terrestrial",
    description: "The Foam Beetle is a simple but devastatingly effective terrestrial pattern. A piece of black foam folded over a peacock herl body creates a nearly unsinkable beetle imitation that trout eat aggressively along grassy banks and under overhanging trees throughout summer.",
    imitates: ["beetles", "terrestrial beetles"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["12", "14", "16", "18"],
    colors: ["Black", "Olive", "Brown"],
    fishing_tips: "Cast tight to grassy banks and let it drift under overhanging vegetation. Trout eat beetles more often than most anglers realize.",
    rank: 88,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "foam-ant",
    name: "Foam Ant",
    category: "terrestrial",
    description: "The Foam Ant creates the distinct two-hump silhouette of a real ant using closed-cell foam segments. Ant falls are one of the most underrated feeding events in fly fishing — when flying ants hit the water, trout abandon all caution and gorge themselves.",
    imitates: ["ants", "flying ants", "carpenter ants"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["14", "16", "18", "20"],
    colors: ["Black", "Cinnamon", "Red"],
    fishing_tips: "During flying ant falls, this pattern is the only fly you need. Fish it dead drift along foam lines and eddies where ants collect.",
    rank: 89,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "daves-hopper",
    name: "Dave's Hopper",
    category: "terrestrial",
    description: "Dave Whitlock's Hopper is the original modern grasshopper imitation, featuring a spun deer hair head, knotted pheasant tail legs, and a yellow body. It is buoyant, visible, and has been the standard hopper pattern for decades on western meadow streams.",
    imitates: ["grasshoppers"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["6", "8", "10", "12"],
    colors: ["Yellow", "Tan", "Olive"],
    rank: 90,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "letort-cricket",
    name: "Letort Cricket",
    category: "terrestrial",
    description: "Ed Shenk's Letort Cricket is a classic terrestrial designed for the legendary limestone streams of Pennsylvania's Cumberland Valley. Its clipped deer hair body and black coloring present a perfect cricket silhouette that spring creek trout eat with confidence.",
    imitates: ["crickets", "black terrestrial insects"],
    effective_species: TROUT,
    water_types: ["spring creek", "freestone"],
    sizes: ["10", "12", "14"],
    colors: ["Black"],
    rank: 91,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "parachute-hopper",
    name: "Parachute Hopper",
    category: "terrestrial",
    description: "A foam-bodied grasshopper with a parachute post that provides visibility in choppy water and doubles as a hopper-dropper indicator. The parachute post makes it easy to track on the water while maintaining a realistic hopper profile from the trout's perspective below.",
    imitates: ["grasshoppers"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["8", "10", "12"],
    colors: ["Tan", "Yellow", "Olive"],
    fishing_tips: "The parachute post makes this the ideal hopper-dropper pattern. Drop a nymph 18-24 inches below and fish along grassy banks in late summer.",
    rank: 92,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "flying-ant",
    name: "Flying Ant",
    category: "terrestrial",
    description: "The Flying Ant pattern includes CDC or hackle-tip wings that distinguish it from standard ant patterns. During mating flights in late summer, millions of winged ants fall onto rivers, creating some of the most intense surface feeding of the year. Trout key on the wing silhouette.",
    imitates: ["flying ants", "winged ants"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek", "tailwater"],
    sizes: ["14", "16", "18"],
    colors: ["Black", "Cinnamon"],
    rank: 93,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "inchworm",
    name: "Inchworm",
    category: "terrestrial",
    description: "A simple bright-green chenille or foam pattern that imitates the caterpillars and inchworms that drop from overhanging trees into trout streams in spring and early summer. When caterpillar activity is heavy, trout line up under trees and eat them with reckless abandon.",
    imitates: ["inchworms", "caterpillars", "green worms"],
    effective_species: TROUT,
    water_types: ["freestone", "spring creek"],
    sizes: ["10", "12", "14"],
    colors: ["Bright green", "Chartreuse"],
    fishing_tips: "Cast under overhanging trees in spring and early summer. Dead drift along shady banks where caterpillars naturally fall into the water.",
    rank: 94,
    featured: false,
    is_hero_pattern: false,
  },

  // ── EGG PATTERNS (95-98) — 4 more to make 5 total ─────────────────────
  {
    slug: "nuke-egg",
    name: "Nuke Egg",
    category: "egg",
    description: "The Nuke Egg is a smaller, more translucent version of the Glo Bug, tied with McFlyFoam for a realistic veil-like appearance. The sparse, semi-transparent material imitates a single drifting egg better than denser yarn patterns, making it the choice for pressured tailwater trout.",
    imitates: ["salmon eggs", "trout eggs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["12", "14", "16"],
    colors: ["Peach", "Oregon cheese", "Steelhead orange"],
    bead_options: ["None"],
    hook_styles: ["Egg hook", "Scud hook"],
    rank: 95,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "y2k-bug",
    name: "Y2K Bug",
    category: "egg",
    description: "The Y2K Bug features a bright center dot surrounded by a translucent veil of egg yarn, imitating a fertilized egg with a visible nucleus. The two-tone color combination is remarkably effective on trout that have become selective to standard single-color egg patterns.",
    imitates: ["fertilized eggs", "salmon eggs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14"],
    colors: ["Pink/Orange", "Peach/Chartreuse", "Oregon cheese/flame"],
    bead_options: ["None"],
    hook_styles: ["Egg hook"],
    rank: 96,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "sucker-spawn",
    name: "Sucker Spawn",
    category: "egg",
    description: "The Sucker Spawn imitates a diffuse cluster of eggs rather than a single egg, using loosely tied McFlyFoam for a veiled, ethereal profile. It is particularly effective during spring sucker runs when trout feed on the dislodged egg clusters in the drift.",
    imitates: ["egg clusters", "sucker eggs", "dislodged eggs"],
    effective_species: TROUT,
    water_types: ["freestone"],
    sizes: ["10", "12", "14"],
    colors: ["White", "Cream", "Pale pink"],
    bead_options: ["None"],
    hook_styles: ["Egg hook", "Scud hook"],
    rank: 97,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "blood-dot-egg",
    name: "Blood Dot Egg",
    category: "egg",
    description: "A realistic egg pattern featuring a contrasting red or orange dot in the center of a pale egg body, mimicking the blood spot visible in developing fish eggs. This added realism makes it effective on heavily pressured waters where trout have seen thousands of standard egg patterns.",
    imitates: ["developing fish eggs", "salmon eggs"],
    effective_species: TROUT,
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12", "14"],
    colors: ["Pale pink/red dot", "Peach/orange dot"],
    bead_options: ["None"],
    hook_styles: ["Egg hook"],
    rank: 98,
    featured: false,
    is_hero_pattern: false,
  },

  // ── MIDGES (99-100) — 2 more to make 3 total ──────────────────────────
  {
    slug: "top-secret-midge",
    name: "Top Secret Midge",
    category: "midge",
    description: "The Top Secret Midge features a thread body with a pearl Flashabou wing case at the thorax, adding a subtle flash that mimics the gas bubble of an emerging midge pupa. It is slightly more complex than the Zebra Midge but significantly more effective on pressured tailwater trout that have seen every simple midge pattern.",
    imitates: ["midge pupae", "emerging midges"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22", "24"],
    colors: ["Black/Pearl", "Olive/Pearl"],
    bead_options: ["Small tungsten", "Glass bead"],
    hook_styles: ["Scud/midge hook"],
    fishing_tips: "Fish in the upper water column during midge emergence. The flash wing case catches light and draws attention from feeding trout.",
    rank: 99,
    featured: false,
    is_hero_pattern: false,
  },
  {
    slug: "juju-baetis",
    name: "Juju Baetis",
    category: "nymph",
    description: "Charlie Craven's Juju Baetis is a sleek, modern nymph that imitates tiny Baetis mayfly nymphs with devastating precision. Its thin, epoxy-coated body and CDC wing puff create a slim, realistic profile that is deadly during Baetis nymph activity on Colorado's technical tailwaters.",
    imitates: ["Baetis nymphs", "small mayfly nymphs"],
    effective_species: TROUT,
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22"],
    colors: ["Olive", "Black"],
    bead_options: ["Micro tungsten"],
    hook_styles: ["Scud/midge hook"],
    fishing_tips: "Fish as a dropper behind a heavier nymph. The CDC wing puff traps a tiny air bubble that adds both flash and buoyancy in the drift.",
    rank: 100,
    featured: false,
    is_hero_pattern: false,
  },
];

// ---------------------------------------------------------------------------
// Combine all patterns
// ---------------------------------------------------------------------------

const allFlies: CanonicalFly[] = [...heroPatterns, ...standardPatterns];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate() {
  // Check total count
  if (allFlies.length !== 100) {
    console.error(`❌ Expected 100 flies, got ${allFlies.length}`);
    process.exit(1);
  }

  // Check category distribution
  const counts: Record<string, number> = {};
  for (const fly of allFlies) {
    counts[fly.category] = (counts[fly.category] || 0) + 1;
  }
  const expected: Record<string, number> = {
    dry: 22, nymph: 30, streamer: 12, emerger: 12,
    wet: 8, terrestrial: 8, egg: 5, midge: 3,
  };
  for (const [cat, exp] of Object.entries(expected)) {
    if (counts[cat] !== exp) {
      console.error(`❌ Category '${cat}': expected ${exp}, got ${counts[cat] || 0}`);
      process.exit(1);
    }
  }

  // Check unique slugs
  const slugs = new Set(allFlies.map((f) => f.slug));
  if (slugs.size !== 100) {
    console.error(`❌ Duplicate slugs detected (${slugs.size} unique of 100)`);
    process.exit(1);
  }

  // Check unique ranks
  const ranks = new Set(allFlies.map((f) => f.rank));
  if (ranks.size !== 100) {
    console.error(`❌ Duplicate ranks detected (${ranks.size} unique of 100)`);
    process.exit(1);
  }

  // Check hero patterns
  const heroes = allFlies.filter((f) => f.is_hero_pattern);
  if (heroes.length !== 20) {
    console.error(`❌ Expected 20 hero patterns, got ${heroes.length}`);
    process.exit(1);
  }

  // Check featured
  const featured = allFlies.filter((f) => f.featured);
  if (featured.length !== 6) {
    console.error(`❌ Expected 6 featured, got ${featured.length}`);
    process.exit(1);
  }

  console.log("✅ Validation passed: 100 flies, correct distribution, unique slugs and ranks\n");
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log("🪰 Executive Angler — Seeding Canonical Flies\n");
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Table: canonical_flies`);
  console.log(`   Total: 100 flies (20 hero patterns + 80 standard)\n`);

  // Validate before seeding
  validate();

  const start = Date.now();
  const batchSize = 25;
  let upsertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allFlies.length; i += batchSize) {
    const batch = allFlies.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(allFlies.length / batchSize);

    console.log(
      `  → Batch ${batchNum}/${totalBatches}: upserting ${batch.length} flies (ranks ${batch[0].rank}-${batch[batch.length - 1].rank})...`
    );

    const { error } = await supabase
      .from("canonical_flies")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error(`  ❌ Batch ${batchNum} error:`, error.message);
      if (error.details) console.error("     Details:", error.details);
      errorCount += batch.length;
    } else {
      upsertedCount += batch.length;
      console.log(`  ✅ Batch ${batchNum}: ${batch.length} flies upserted`);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n🎣 Seeding complete in ${elapsed}s`);
  console.log(`   Upserted: ${upsertedCount}/100`);
  if (errorCount > 0) {
    console.log(`   Errors: ${errorCount}`);
  }

  // Print category summary
  const counts: Record<string, number> = {};
  for (const fly of allFlies) {
    counts[fly.category] = (counts[fly.category] || 0) + 1;
  }
  console.log("\n   Category distribution:");
  for (const [cat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${cat}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
