// Phase 2: Seed Confidence Flies from Egan/Olsen/Rowley book.
//
// Phase 2a: UPDATE 8 overlapping canonical_flies with EA-voiced back-stories,
//           video_url, affiliate_links, and origin_credit. Also re-seeds ingredients.
// Phase 2b: INSERT 23 new canonical_flies + their recipe ingredients.
//
// Run: node scripts/seed-confidence-flies.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envText = readFileSync(
  "/Users/taylorwarnick/My Sites-Apps/personal/executive-angler/.env.local",
  "utf8"
);
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Ingredient helper ────────────────────────────────────────────
// role:         hook | bead | thread | tail | body | abdomen | thorax | rib | ribbing |
//               hackle | wing | wingcase | collar | legs | flash | coating | eye | weight | tag | shuck
// match_text:   substring searched in tying_materials.name (case-insensitive)
// brand_filter: optional — filter to this brand exactly
function ing(role, label, { match, brand, optional = false, step = null, color = null, size = null, notes = null } = {}) {
  return { role, label, match, brand, optional, step, color, size, notes };
}

// ── The 31 Confidence Flies ──────────────────────────────────────
const FLIES = [
  // ────────────── LANCE EGAN (12) ──────────────
  {
    slug: "rainbow-warrior",
    name: "Rainbow Warrior",
    overlap: true,
    category: "nymph",
    tagline: "Lance Egan's original flashy attractor nymph — the fly that started it all.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/HfEQB6f7uWg",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/tungsten-rainbow-warrior-pearl", label: "Buy — Rainbow Warrior (Fly Fish Food)" },
      { url: "https://www.flyfishfood.com/products/egans-jig-rainbow-warrior", label: "Buy — Jig Rainbow Warrior (Fly Fish Food)" },
    ],
    history: `The Rainbow Warrior was Lance Egan's first commercially available pattern and remains one of the all-time best-selling competition nymphs. Despite a flashy pearl body and a red-thread hot-spot collar that imitates nothing in particular, it consistently fools selective tailwater trout and eager pocket-water fish alike. Lance's philosophy with the Warrior is simple: don't worry about *why* fish eat it — just be glad they do. In sow-bug, scud, midge-pupa, midge-larva, and chironomid water, it performs like a multi-tool attractor.`,
    when_to_use: "Year-round confidence nymph — works as a point fly on a Euro rig or a dropper under an indicator. Size down in clear tailwaters, size up in dirty pocket water.",
    sizes: ["12", "14", "16", "18", "20"],
    recipe: [
      ing("hook", "TMC 2457 — size 16", { match: "TMC 2457" }),
      ing("thread", "UTC Ultrathread 70D — Red", { match: "Danville 140" }),
      ing("bead", "Tungsten Bead — Nickel 2.3mm", { match: "Tungsten Slotted", size: "2.3mm", color: "silver" }),
      ing("tail", "Natural Ringneck Pheasant Tail fibers", { match: "pheasant tail", notes: "3-4 fibers" }),
      ing("body", "Pearl Tinsel — Large (body + wingcase)", { match: "Flashback Tinsel", color: "pearl" }),
      ing("thorax", "Wapsi Sow Scud Dubbing — Rainbow", { match: "Sow Scud", color: "rainbow" }),
    ],
  },
  {
    slug: "egans-tungsten-surveyor",
    name: "Egan's Tungsten Surveyor",
    overlap: false,
    category: "nymph",
    tagline: "A Hare's Ear in Rainbow Warrior clothing — silhouette meets sparkle.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/vhJE7xOQZBA",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/egans-tungsten-surveyor", label: "Buy — Tungsten Surveyor (Fly Fish Food)" },
    ],
    description: "A dense, fast-sinking hybrid: the classic Hare's Ear silhouette built with the Rainbow Warrior's translucent sow-scud thorax and pearl wingcase. Silver ribbing and a red-thread collar tie the look together.",
    history: `The Surveyor is one of Lance Egan's lesser-known patterns — and, in his own words, one of his most productive. The design came from a simple experiment: take a bead-head Hare's Ear, swap the hare's mask for Wapsi rainbow sow-scud dubbing, and borrow red thread, pheasant tail, and a pearl flashback from the Rainbow Warrior. The result is a fly that carries the Hare's Ear's time-tested silhouette but catches light the way the Warrior does. If you fish Hare's Ears with confidence, the Surveyor will do the same work with a little more attraction.`,
    fishing_tips: "A classic point-fly for tailwater euro rigs. Silver bead tends to out-fish gold in clear water; natural silhouette makes it credible to picky fish.",
    when_to_use: "All-water searching pattern. Excels where fish see pressure and where a pure attractor wears off.",
    imitates: ["mayfly nymph", "sow bug", "midge pupa", "attractor"],
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["14", "16", "18"],
    hook_styles: ["curved nymph", "standard nymph"],
    recipe: [
      ing("hook", "TMC 2499SP-BL — size 16", { match: "TMC 2499" }),
      ing("bead", "Tungsten Bead — Silver 2.3mm", { match: "Tungsten Slotted", color: "silver" }),
      ing("thread", "UTC Ultrathread 70D — Red", { match: "Danville 140" }),
      ing("tail", "Natural Ringneck Pheasant Tail fibers", { match: "pheasant tail" }),
      ing("rib", "UTC Ultra Wire Silver — Small", { match: "Ultra Wire Silver" }),
      ing("body", "Wapsi Sow Scud Dubbing — Rainbow (body + thorax)", { match: "Sow Scud", color: "rainbow" }),
      ing("wingcase", "Pearl Flashback Tinsel — Large", { match: "Flashback Tinsel", color: "pearl" }),
    ],
  },
  {
    slug: "egans-rainbow-warrior-perdigon",
    name: "Egan's Rainbow Warrior Perdigon",
    overlap: false,
    category: "nymph",
    tagline: "The Rainbow Warrior compressed into a Spanish-style perdigon — drops like a stone, keeps the flash.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/HenAWliSQX0",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/egans-warrior-perdigon-rainbow", label: "Buy — Rainbow Warrior Perdigon (Fly Fish Food)" },
    ],
    description: "A dense, UV-coated perdigon that translates the Rainbow Warrior's color palette — pearl body, red collar, silver bead, pheasant-tail tail — into the smooth-profiled Spanish nymph-fishing style. Sinks fast, holds up to fish after fish.",
    history: `Perdigons — Spanish for 'pellet' — are the fastest-sinking small nymphs in modern fly fishing. Their smooth resin-coated bodies slice through the water column, letting you fish thin tippet without split shot. Lance built the Rainbow Warrior Perdigon by stripping his signature pattern down to its essential colors and wrapping them in Solarez or Loon UV Flow. The result is a pattern that combines the Warrior's proven fish-catching palette with the anchor properties of a competition perdigon.`,
    fishing_tips: "Point fly on a Euro rig, paired with a lighter tag fly. The UV coating protects the pearl body through dozens of fish.",
    when_to_use: "When you need fast depth and thin tippet — classic tight-line nymphing water.",
    imitates: ["mayfly nymph", "midge pupa", "attractor"],
    water_types: ["tailwater", "freestone"],
    sizes: ["16", "18", "20"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Umpqua XC400BL Jig — size 18", { match: "Umpqua XC400BL Jig", brand: "Umpqua" }),
      ing("bead", "Slotted Tungsten — Silver 2.5mm", { match: "Tungsten Slotted", color: "silver" }),
      ing("thread", "UTC Ultrathread 70D — Red", { match: "Danville 140" }),
      ing("tail", "Coq de Leon fibers", { match: "coq de leon" }),
      ing("body", "Pearl Flashback Tinsel — Medium", { match: "Flashback Tinsel", color: "pearl" }),
      ing("coating", "Loon UV Clear Flow or Solarez Bone Dry", { match: "UV Clear Fly Finish Flow" }),
    ],
  },
  {
    slug: "frenchie",
    name: "Frenchie",
    overlap: true,
    category: "nymph",
    tagline: "Lance Egan's Championship Frenchie — pheasant tail + shrimp-pink hot spot.",
    origin_credit: "Lance Egan (variation on a competition classic)",
    video_url: "https://youtu.be/PMnx_Hz-oG8",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/egans-frenchie", label: "Buy — Frenchie (Fly Fish Food)" },
      { url: "https://www.flyfishfood.com/products/egans-jig-frenchie", label: "Buy — Jig Frenchie (Fly Fish Food)" },
    ],
    history: `The Frenchie as a *style* has been around competition fly fishing for decades — Lance Egan's version is the color combination that sealed its place in American boxes. The story: Lance took the classic French nymph, replaced the tail with Coq de Leon for sheen and durability, swapped natural pheasant tail for a dyed variant, and paired shrimp-pink Ice Dub with a red-thread collar to create a hot-spot that reads equally well to selective tailwater trout and pocket-water rainbows. He sealed the recipe at his first World Championship in Portugal, 2006, winning a river session on the River Alva with a Frenchie/Bionic Ant dry-dropper rig. The combination has caught fish in every country and state he has fished since.`,
    when_to_use: "When the trout are on mayfly nymphs — particularly PMDs and BWOs. Point fly for Euro rigs; dropper below a Bionic Ant or Chubby.",
    sizes: ["14", "16", "18", "20"],
    recipe: [
      ing("hook", "Hanak 400 BL Jig — size 16", { match: "Hanak 400 BL Jig" }),
      ing("thread", "UTC 70D — Red", { match: "Danville 140" }),
      ing("bead", "Slotted Tungsten — Gold 3mm", { match: "Tungsten Slotted", color: "gold", size: "3.0mm" }),
      ing("tail", "Coq de Leon fibers", { match: "coq de leon" }),
      ing("body", "Dyed Pheasant Tail fibers (melanistic or muskrat-gray)", { match: "pheasant tail" }),
      ing("rib", "UTC Ultra Wire Copper — Small", { match: "Ultra Wire Brassie Copper" }),
      ing("hot_spot", "Hareline Ice Dub — UV Shrimp Pink", { match: "Ice Dub", color: "pink" }),
    ],
  },
  {
    slug: "egans-thread-frenchie",
    name: "Egan's Thread Frenchie",
    overlap: false,
    category: "nymph",
    tagline: "A pheasant-tail-free Frenchie — faster to tie, virtually bullet-proof.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/n12lOMf9CDY",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/egans-thread-frenchie-jig-olive", label: "Buy — Thread Frenchie Olive" },
      { url: "https://www.flyfishfood.com/products/egans-thread-frenchie-jig-black", label: "Buy — Thread Frenchie Black" },
      { url: "https://www.flyfishfood.com/products/egans-thread-frenchie-jig-brown", label: "Buy — Thread Frenchie Brown" },
    ],
    description: "A thread-bodied, UV-resin-coated jig nymph that captures the Frenchie silhouette without fragile pheasant tail. Wire-ribbed and coated, it holds up to fish after fish.",
    history: `The standard Frenchie has one weakness: pheasant tail shreds. Even with super-glue and counter-wrapped wire, a pheasant-tail Frenchie wears out after a dozen fish. Lance designed the Thread Frenchie to solve that problem — a tight thread body, counter-ribbed with copper wire, sealed under UV resin. The result is the same deadly silhouette and hot-spot collar, but the fly survives Euro-nymphing sessions where the pheasant-tail version would lose its body entirely. Lance now fishes and guides with Thread Frenchies more than any other nymph.`,
    fishing_tips: "Use small beads for tailwaters, heavier beads to anchor a rig. Olive is the signature color; brown and black cover warmer and darker water respectively.",
    when_to_use: "Anytime a Frenchie would work — but you want a tie that lasts all day.",
    imitates: ["mayfly nymph", "midge pupa", "attractor"],
    water_types: ["tailwater", "freestone", "spring creek"],
    sizes: ["14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Umpqua XC400BL — size 16", { match: "Umpqua XC 400" }),
      ing("thread", "UTC Ultrathread 70D — Olive", { match: "Danville 140" }),
      ing("bead", "Slotted Tungsten — Gold 2.5mm", { match: "Tungsten Slotted", color: "gold", size: "2.5mm" }),
      ing("tail", "Coq de Leon fibers", { match: "coq de leon" }),
      ing("rib", "UTC Ultra Wire Brassie — Sculpin Olive", { match: "Ultra Wire Sculpin Olive" }),
      ing("hot_spot", "Hareline Ice Dub — UV Pink", { match: "Ice Dub", color: "pink" }),
      ing("coating", "Loon UV Clear Flow or Solarez Bone Dry", { match: "UV Clear Fly Finish Flow" }),
    ],
  },
  {
    slug: "silver-bullet-baetis",
    name: "Silver Bullet Baetis",
    overlap: false,
    category: "nymph",
    tagline: "A drab, fast-sinking Baetis imitation for fish that refuse the hot-spot.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/wpfXrLgZzP8",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/egans-silver-bullet", label: "Buy — Silver Bullet Baetis" },
    ],
    description: "A slim, drab-toned, resin-coated mayfly nymph designed for picky tailwater fish. No hot spot, no flash — just silhouette and sink rate.",
    history: `The Silver Bullet Baetis is Lance Egan's answer to the selective fish that refuse anything with a hot spot. He built it to complement the Iron Lotus and Thread Frenchie — same sleek profile, but stripped of attractor elements. The peacock-black Ice Dub thorax and olive-silver body ride close to natural coloration. When you find trout that keep ignoring your flashy ties in clear low water, the Silver Bullet is the pattern to tie on.`,
    fishing_tips: "Pair with a Thread Frenchie or Iron Lotus on your rig — one attractor, one natural, let the fish tell you which.",
    when_to_use: "Picky, heavily-pressured fish. BWO and PMD emergences in clear water.",
    imitates: ["baetis nymph", "mayfly nymph"],
    water_types: ["tailwater", "spring creek"],
    sizes: ["14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Umpqua XC400BL or Hanak 400 BL Jig — size 16", { match: "Umpqua XC400BL Jig" }),
      ing("thread", "UTC Ultrathread 70D — Light Olive", { match: "Danville 140" }),
      ing("bead", "Slotted Tungsten — Silver 3.0mm", { match: "Tungsten Slotted", color: "silver", size: "3.0mm" }),
      ing("tail", "Coq de Leon fibers", { match: "coq de leon" }),
      ing("rib", "UTC Ultra Wire Brassie — Sculpin Olive", { match: "Ultra Wire Sculpin Olive" }),
      ing("thorax", "Hareline Ice Dub — Peacock Black", { match: "Ice Dub", color: "peacock" }),
      ing("coating", "Loon UV Clear Flow or Solarez Bone Dry", { match: "UV Clear Fly Finish Flow" }),
    ],
  },
  {
    slug: "egans-red-dart",
    name: "Egan's Red Dart",
    overlap: false,
    category: "nymph",
    tagline: "A Red Tag / Prince Nymph hybrid with a UV-pink hot spot.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/9gZL36MI0uk",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/tungsten-dart-red", label: "Buy — Red Dart (Fly Fish Food)" },
    ],
    description: "An attractor nymph that merges the Red Tag's tail with the Prince Nymph's soft-hackle collar, finished with peacock Ice Dub and a UV-pink hot spot. Designed for fish that want flash with natural pulse.",
    history: `Lance designed the Red Dart at the 2011 World Fly Fishing Championships in Bolzano, Italy. The local fish were eating Red Tags and Prince Nymphs, and he was winning sessions on a modified Prince: red thread collar and peacock Ice Dub body. His next step was to merge the two patterns into one — replacing the Prince's biots with a Red Tag–style dyed hackle tail, keeping the brown soft-hackle collar, and tucking a UV pink hot spot behind the bead. The fly has won Lance fish in Italy, America, and every country he has fished since. Why does it work? He doesn't know. The fish do.`,
    fishing_tips: "Add the optional .015\" lead wire under-body for a heavy Euro-rig anchor fly.",
    when_to_use: "Attractor/searching fly for stained water, fast runs, and mixed hatches.",
    imitates: ["mayfly nymph", "attractor", "prince nymph"],
    water_types: ["freestone", "pocket water", "tailwater"],
    sizes: ["12", "14", "16"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Hanak 400 BL Jig — size 14", { match: "Hanak 400 BL Jig" }),
      ing("bead", "Slotted Tungsten — Gold 3.3mm", { match: "Tungsten Slotted", color: "gold", size: "3.3mm" }),
      ing("thread", "UTC Ultrathread 70D — Red", { match: "Danville 140" }),
      ing("tail", "Red saddle hackle fibers", { match: "Saddle Hackle", color: "red" }),
      ing("abdomen", "Hareline Ice Dub — Peacock", { match: "Ice Dub", color: "peacock" }),
      ing("rib", "Sulky Metallic Tinsel — Opalescent 8040", { match: "Sulky Metallic" }),
      ing("rib", "7X tippet (secondary rib)", { match: "", optional: true }),
      ing("hackle", "Brown / Furnace / Coachman-Brown hen cape", { match: "Hen Cape", color: "brown" }),
      ing("thorax", "Hareline Ice Dub — UV Pink (hot spot)", { match: "Ice Dub", color: "pink" }),
      ing("weight", ".015\" lead wire (optional)", { match: "", optional: true }),
    ],
  },
  {
    slug: "egans-gti-caddis",
    name: "Egan's GTi Caddis",
    overlap: false,
    category: "nymph",
    tagline: "Lance Egan's 'Go-To Imitation' — a contrasting-back net-builder caddis larva.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/OVgZ0aMO9s0",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/egans-gti-caddis-olive", label: "Buy — GTi Caddis Olive" },
      { url: "https://www.flyfishfood.com/products/egans-gti-caddis-cream", label: "Buy — GTi Caddis Cream" },
      { url: "https://www.flyfishfood.com/products/egans-gti-caddis-amber", label: "Buy — GTi Caddis Amber" },
    ],
    description: "A weighted Hydropsychidae (net-builder) caddis larva with a contrasting shellback, designed around Hare-Tron dubbing and Arizona Synthetic peacock thorax.",
    history: `'GTi' stands for Go-To Imitation — a bit cheesy, but earned. The GTi Caddis is more imitative than most of Lance Egan's patterns; it represents the Hydropsychidae 'net-builder' caddis found in rivers across the country. The curious detail is the shellback: it deliberately contrasts the underbody rather than matching the natural insect. Lance has tried every realistic color variation, and the contrasting-back versions consistently out-fish them. Why? He doesn't know. But the fish agree.`,
    fishing_tips: "Carry it in Olive, Cream, and Amber — which one works is a daily experiment. Tie with lead under-body for fast sink.",
    when_to_use: "Anywhere net-builder caddis are a significant food source — tailwaters and freestones alike.",
    imitates: ["caddis larva", "hydropsyche"],
    water_types: ["tailwater", "freestone"],
    sizes: ["10", "12", "14"],
    hook_styles: ["Czech nymph"],
    recipe: [
      ing("hook", "Hanak 300 BL Czech Nymph — size 12", { match: "Hanak 300 BL" }),
      ing("bead", "Tungsten — Gold 3.3mm", { match: "Tungsten Slotted", color: "gold", size: "3.3mm" }),
      ing("thread", "UTC 70D — Olive", { match: "Danville 140" }),
      ing("weight", ".015\" lead wire under-body", { match: "", optional: true }),
      ing("tail", "Strung Peacock Herl", { match: "peacock herl" }),
      ing("rib", "Krystal Flash — Olive", { match: "Krystal Flash", color: "olive" }),
      ing("rib", "6X tippet (secondary)", { match: "", optional: true }),
      ing("abdomen", "Hareline Hare-Tron Dubbing — Olive", { match: "Hare-Tron", color: "olive" }),
      ing("thorax", "Arizona Synthetic Dubbing — Peacock", { match: "Arizona Synthetic", color: "peacock" }),
      ing("wingcase", "Scud Back — Summer Duck 1/8\"", { match: "Scud Back" }),
    ],
  },
  {
    slug: "egans-iron-lotus",
    name: "Egan's Iron Lotus",
    overlap: false,
    category: "nymph",
    tagline: "A thread-bodied, UV-coated Baetis nymph with a subtle red hot-spot.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/4K_6QSMEziA",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/iron-lotus-olive", label: "Buy — Iron Lotus Olive" },
      { url: "https://www.flyfishfood.com/products/egans-jig-iron-lotus", label: "Buy — Jig Iron Lotus" },
    ],
    description: "A sleek, fast-sinking mayfly nymph with a white-ribbed olive thread body, peacock thorax, black flashback wingcase, and a small red hot-spot collar. Built to imitate BWO and PMD nymphs.",
    history: `The Iron Lotus gets its name — as Lance will freely admit — from the 'fabled Iron Lotus' skating move in *Blades of Glory*. His team watched the movie on repeat while tying flies leading up to a National Fly Fishing Championship, and the name stuck. The fly itself is serious business: a slick UV-coated body aids sink rate, subtle white ribbing adds segmentation, and the classic Egan touch — gold bead and red hot spot — gives just enough flash to pique interest. Lance has tested versions with black beads and no hot spot for tailwater purists. Every time, the red-and-gold original wins.`,
    fishing_tips: "The white ribbing is the tell — makes the fly look segmented without adding bulk. Olive is the default; tie in grey, black, and brown for species rotation.",
    when_to_use: "BWO and PMD nymphing on tailwaters and spring creeks. Euro-nymph point fly.",
    imitates: ["baetis nymph", "pmd nymph", "mayfly nymph"],
    water_types: ["tailwater", "spring creek"],
    sizes: ["14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Hanak 400 BL Jig — size 16", { match: "Hanak 400 BL Jig" }),
      ing("thread", "UTC Ultrathread 70D — Olive", { match: "Danville 140" }),
      ing("bead", "Slotted Tungsten — Gold 3.0mm", { match: "Tungsten Slotted", color: "gold", size: "3.0mm" }),
      ing("tail", "Coq de Leon fibers", { match: "coq de leon" }),
      ing("abdomen", "UTC Ultrathread 70D — Olive (thread body)", { match: "Danville 140" }),
      ing("rib", "Danville 140 Denier — White", { match: "Danville 140" }),
      ing("thorax", "Arizona Synthetic Dubbing — Peacock", { match: "Arizona Synthetic", color: "peacock" }),
      ing("wingcase", "UTC Flashback Tinsel — Black Large", { match: "Flashback Tinsel", color: "black" }),
      ing("hot_spot", "UTC Ultrathread 70D — Red", { match: "Danville 140" }),
      ing("coating", "Loon UV Clear Flow or Solarez Bone Dry", { match: "UV Clear Fly Finish Flow" }),
    ],
  },
  {
    slug: "egans-bionic-ant-2",
    name: "Egan's Bionic Ant 2.0",
    overlap: false,
    category: "terrestrial",
    tagline: "Lance Egan's high-floating, visible terrestrial — the non-hatch dry fly of choice.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/6yJnlq4pzm4",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/bionic-ant-2-0-black", label: "Buy — Bionic Ant 2.0 Black" },
      { url: "https://www.flyfishfood.com/products/bionic-ant-2-0-purple", label: "Buy — Bionic Ant 2.0 Purple" },
      { url: "https://www.flyfishfood.com/products/bionic-ant-brown", label: "Buy — Bionic Ant Brown" },
    ],
    description: "An oversized foam ant with a Trigger Point white wing, Uni Flex legs, and a Coachman-brown hackle. Buoyant enough to hold a dropper, visible to the angler, irresistible to trout.",
    history: `Lance Egan's favorite summer-time fishing is floating rivers and casting ants to bank-hugging trout. For years he overlooked ants — fishing cicadas in early summer and hoppers late — but once he learned how reliable ants are as a summer food, they became his go-to dry fly for non-hatch periods. The trick with the Bionic is *size*: where most tiers fish size 16 and smaller, Lance fishes size 10 and 12 ants. Combined with a buoyant foam body, white-foam top, Trigger Point wing for visibility, and a Coachman-brown center hackle, the Bionic Ant 2.0 is the rare dry that is buoyant, easy to see, and fish-approved.`,
    fishing_tips: "Fish aggressively — cast to the bank, twitch if you need to. Black is the default; purple and brown are useful alternatives.",
    when_to_use: "Summer through early fall. Dry-dropper anchor for hopper-dropper rigs.",
    imitates: ["ant", "beetle", "terrestrial"],
    water_types: ["freestone", "tailwater", "pocket water"],
    sizes: ["10", "12"],
    hook_styles: ["dry"],
    recipe: [
      ing("hook", "TMC 100 — size 12", { match: "TMC 100" }),
      ing("thread", "Semperfli Nano Silk 8/0 — Black", { match: "Nano Silk", color: "black" }),
      ing("body", "Wapsi Foam Ant Bodies — XL Black", { match: "Foam Ant" }),
      ing("legs", "Wapsi Uni Flex — Black", { match: "Uni Flex", color: "black" }),
      ing("wing", "EP Trigger Point Fibers — White", { match: "Trigger Point" }),
      ing("hackle", "Coachman Brown hackle", { match: "Saddle Hackle" }),
    ],
  },
  {
    slug: "egans-corn-fed-caddis",
    name: "Egan's Corn-Fed Caddis",
    overlap: false,
    category: "dry",
    tagline: "A beefy, buoyant CDC caddis — the linebacker of dry flies.",
    origin_credit: "Lance Egan",
    video_url: "https://youtu.be/2NL1wr7xKZ4",
    affiliate_links: [
      { url: "https://www.flyfishfood.com/products/corn-fed-caddis-cdc-tan", label: "Buy — Corn-Fed Caddis Tan" },
      { url: "https://www.flyfishfood.com/products/corn-fed-caddis-cdc-olive", label: "Buy — Corn-Fed Caddis Olive" },
    ],
    description: "A heavy-winged CDC caddis dry with a Super Fine dubbed body, Antron shuck, Trigger Point overwing, and a CDC hackle. Buoyant enough to anchor a dry-dropper rig.",
    history: `The Corn-Fed Caddis lives up to its name — this is a linebacker at ballet class. Where most CDC patterns are sparse and delicate, the Corn-Fed is heavy-winged, with stacked CDC topped by a Trigger Point poly-yarn overwing for extra float. The CDC fibers even serve as the hackle. It is a buggy, visible, and durable dry that handles the weight of a tungsten dropper without submarining. Throw it at spring-creek browns, pocket-water rainbows, or suspicious freestone risers — it all works.`,
    fishing_tips: "Do NOT use traditional floatants. Tiemco Dry Magic, Loon Lochsa, Shimizaki Dry Shake, Loon Top Ride, or Frogs Fanny all work well.",
    when_to_use: "Any caddis hatch. Also as a blind-prospecting dry over trout water.",
    imitates: ["caddis adult", "dry caddis"],
    water_types: ["freestone", "spring creek", "tailwater"],
    sizes: ["12", "14", "16"],
    hook_styles: ["dry"],
    recipe: [
      ing("hook", "TMC 100 — size 14", { match: "TMC 100" }),
      ing("thread", "Semperfli Nano Silk 12/0 — Beige", { match: "Nano Silk" }),
      ing("shuck", "Wapsi Antron Yarn — PMD Shuck / Olive", { match: "Antron Yarn" }),
      ing("body", "Super Fine Dry Fly Dubbing — Tan", { match: "Super Fine", color: "tan" }),
      ing("rib", "Semperfli Nano Silk 12/0 — Beige", { match: "Nano Silk" }),
      ing("wing", "Natural Dun CDC", { match: "CDC", color: "natural" }),
      ing("wing", "EP Trigger Point Fibers — White (overwing)", { match: "Trigger Point" }),
      ing("hackle", "Nature's Spirit CDC — Natural Dun", { match: "CDC Puff" }),
    ],
  },
  {
    slug: "egans-poacher-olive",
    name: "Egan's Poacher — Olive",
    overlap: false,
    category: "streamer",
    tagline: "A dense Euro-rig streamer with squirrel zonker and Mega Simi Seal.",
    origin_credit: "Lance Egan",
    video_url: null,
    affiliate_links: [],
    description: "A heavily-weighted jig streamer built for Euro nymphing rigs. Squirrel zonker tail, Ripple Ice Dub flash, Mega Simi Seal body, Brahma Hen Saddle hackle. Sinks fast, kicks on the drift.",
    history: `Fishing streamers on a Euro rig has quietly become one of the deadliest techniques in competition fly fishing — and the Poacher is Lance Egan's answer. A regular bead-head Woolly Bugger is too airy, too slow-sinking for the tight-line presentation this style demands. The Poacher packs in a tungsten bead, .025" lead wire under-body, a squirrel zonker tail, dirty olive Mega Simi Seal dubbing, and a hen-saddle hackle — dense enough to drop into deep slots while still animating with every rod-tip twitch. Fish it like a nymph with subtle lifts; most strikes come on the fall.`,
    fishing_tips: "Stay in contact on the drift. Strikes come on the fall, so the tension of the rig matters more than the pattern itself.",
    when_to_use: "Deep slots, pocket water, and tailwater buckets where fish want a big meal.",
    imitates: ["sculpin", "minnow", "crayfish", "leech"],
    water_types: ["freestone", "tailwater", "pocket water"],
    sizes: ["8", "10"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Hanak 400 Jig — size 10", { match: "Hanak 400 BL Jig" }),
      ing("bead", "Slotted Tungsten — Black Nickel 4.6mm", { match: "Tungsten Slotted", color: "black", size: "4.6mm" }),
      ing("weight", ".025\" lead wire under-body", { match: "", optional: true }),
      ing("thread", "Danville 140D — Olive", { match: "Danville 140", color: "olive" }),
      ing("tail", "Wapsi Squirrel Zonker Strip — Sculpin Olive", { match: "Squirrel Zonker", color: "olive" }),
      ing("flash", "Hareline Ripple Ice Dub — Mother of Pearl", { match: "Ripple Ice Dub" }),
      ing("body", "Arizona Mega Simi Seal — Dirty Olive", { match: "Mega Simi Seal", color: "dirty olive" }),
      ing("hackle", "Whiting Brahma Hen Saddle — Mottled Gray / Dyed Golden Olive", { match: "Brahma" }),
    ],
  },

  // ────────────── DEVIN OLSEN (10) ──────────────
  {
    slug: "blowtorch",
    name: "Blowtorch",
    overlap: true,
    category: "nymph",
    tagline: "Devin Olsen's fluorescent-tagged tag nymph — pulling power for pressured trout.",
    origin_credit: "Devin Olsen (adapted from a Czech tag nymph)",
    video_url: "https://youtu.be/RlUV9QXCVko",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/devin-olsens-blowtorch/", label: "Buy — Blowtorch (Tactical Fly Fisher)" },
    ],
    history: `Devin Olsen first saw the Blowtorch at the 2014 World Fly Fishing Championships in the Czech Republic. A local guide showed Team USA a tag nymph he used on chubs in the Vltava River. Devin adapted the colors and materials to his preference, and the fly won him 1st and 2nd-place river sessions at that tournament. He calls its appeal 'pulling power' — trout will leave a lie to eat this fly when they will not move for something more natural. The Blowtorch is now one of the first flies Devin ties on when exploring new water.`,
    when_to_use: "Attractor / searching. Whenever trout need to be convinced to commit, not just drifted-over.",
    sizes: ["12", "14", "16"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 14", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Pink Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 — Red or Dark Tan", { match: "Nano Silk" }),
      ing("tag", "Glo Brite #5 or #7", { match: "Glo Brite" }),
      ing("rib", "Red wire or Sulky Pearl Tinsel", { match: "Ultra Wire Red" }),
      ing("abdomen", "Peacock Black Ice Dub or Hare's Ear dubbing", { match: "Ice Dub", color: "peacock" }),
      ing("hackle", "Natural CDC", { match: "CDC Puff", color: "natural" }),
      ing("collar", "UV Shrimp Pink Ice Dub", { match: "Ice Dub", color: "pink" }),
    ],
  },
  {
    slug: "olsen-quilldigon",
    name: "Quilldigon",
    overlap: false,
    category: "nymph",
    tagline: "A Polish-quill perdigon mayfly — drab enough to fool the picky, durable enough to survive.",
    origin_credit: "Devin Olsen",
    video_url: "https://youtu.be/clLjLkBVIwc",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/devin-olsens-quilldigon/", label: "Buy — Quilldigon (Tactical Fly Fisher)" },
    ],
    description: "A dense perdigon nymph with a Polish Quill segmented body, pearl Sulky tag, and black-nail-polish wingcase. Imitates small dark mayfly nymphs in rivers worldwide.",
    history: `Nearly every trout river on the planet holds small dark mayflies. Devin Olsen began tying the Quilldigon around 2014 as he was experimenting with the Spanish perdigon style. The Polish-quill body looks uncannily like the banded segmentation of a natural mayfly nymph. You can tie it fully drab to be 100% imitative, but Devin finds even better success by adding a pearl Sulky tag or a fluorescent-orange thread hot-spot collar. It's one of the flies he fishes most often from his nymph box.`,
    fishing_tips: "The drab version works on picky fish; add the hot-spot variation when you need to pull a fish out of a lie.",
    when_to_use: "BWO, PMD, and mahogany mayfly hatches — year-round on any trout river.",
    imitates: ["baetis nymph", "mayfly nymph"],
    water_types: ["tailwater", "freestone", "spring creek"],
    sizes: ["14", "16", "18", "20"],
    hook_styles: ["jig hook", "standard nymph"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 16", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Silver Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 — Olive or Black", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon — 3-4 fibers", { match: "coq de leon" }),
      ing("tag", "Pearl Sulky Tinsel", { match: "Sulky Metallic", color: "pearl" }),
      ing("body", "Polish Quills — Olive / Natural / Amber", { match: "Polish Quills" }),
      ing("wingcase", "Black Nail Polish", { match: "", optional: true, notes: "Not a tying material per se — apply with brush" }),
      ing("hot_spot", "Fl. Orange 16/0 Veevus (optional)", { match: "Nano Silk", optional: true }),
    ],
  },
  {
    slug: "pheasant-tail-nymph",
    name: "Simple Pheasant Tail",
    overlap: true,
    category: "nymph",
    tagline: "Devin Olsen's quick, durable take on the world's most famous nymph.",
    origin_credit: "Frank Sawyer (original); Devin Olsen's simplified variant",
    video_url: null,
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/weiss-simple-pheasant-tail-nymph/", label: "Buy — Simple Pheasant Tail (Tactical Fly Fisher)" },
      { url: "https://www.tacticalflyfisher.com/hot-head-mary-pheasant-tail/", label: "Buy — Hot Head Pheasant Tail" },
    ],
    history: `The Pheasant Tail is arguably the most famous nymph in the world — Frank Sawyer tied the original in the 1950s on the River Avon in England. Devin Olsen's version is a quick, durable variation that uses Semperfli Nano Silk for the ribbing, which prevents trout teeth from shredding both the pheasant tail AND the rib. He ties drab variations for low clear water and sight-fishing, and adds a hot bead or fluorescent thread hot spot when he needs more attention. It's simple, it catches fish, and it belongs in every nymph box.`,
    when_to_use: "Year-round. Generic mayfly imitation from size 20 BWOs up to size 10 stones.",
    sizes: ["10", "12", "14", "16", "18", "20"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 16", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Silver Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 — Tan / Dark Tan / Brown", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon — 3-4 fibers", { match: "coq de leon" }),
      ing("body", "Pheasant Tail — 3-4 fibers", { match: "pheasant tail" }),
      ing("rib", "Semperfli Nano Silk 12/0 — Brown", { match: "Nano Silk" }),
      ing("hot_spot", "Fl. orange Veevus or Fl. pink Classic (optional)", { match: "Nano Silk", optional: true }),
    ],
  },
  {
    slug: "soft-hackle-carrot",
    name: "Soft Hackle Carrot",
    overlap: false,
    category: "nymph",
    tagline: "A Czech-team staple — hare's ear body pulsed by CDC and wrapped in hot orange.",
    origin_credit: "Devin Olsen (adapted from Czech team patterns)",
    video_url: "https://youtu.be/tuVUTl9B5F8",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/kjs-hot-ribbed-hares-ear/", label: "Buy — Hot Ribbed Hare's Ear (Tactical Fly Fisher)" },
      { url: "https://www.tacticalflyfisher.com/tungsten-bomb-kjs-jig/", label: "Buy — Tungsten Bomb KJ's Jig" },
    ],
    description: "A hare's-ear-bodied nymph with a fluorescent-orange Glo Brite rib, CDC hackle, and a shrimp-pink ice-dub collar. Impressionistic — looks like nothing and everything at once.",
    history: `The Soft Hackle Carrot is a pattern many anglers from the Czech national team swear by as their favorite nymph. Devin Olsen adapted it for American water. The hare's-ear dubbing and pulsing CDC hackle moderate the sink rate and give the fly a lifelike motion in the water, while the fluorescent-orange Glo Brite rib sets it apart from everything else in the drift. The 'carrot' name comes from the orange-ribbed, tapered silhouette — this is a caddis-water pattern, a PMD-window pattern, and a warm-month confidence fly in one.`,
    fishing_tips: "The CDC collar breathes on the drift — don't crowd it with too many wraps. Glo Brite #7 (golden olive) is the classic rib; try #5 for hotter water.",
    when_to_use: "Caddis hatches. Warm months. Point-fly duty on searching rigs.",
    imitates: ["caddis pupa", "mayfly nymph", "impressionistic"],
    water_types: ["freestone", "tailwater", "spring creek"],
    sizes: ["12", "14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 14", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Gold Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 — Dark Tan", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon — 3-4 fibers", { match: "coq de leon" }),
      ing("rib", "Glo Brite #7 or Fl. Orange Veevus in a dubbing loop", { match: "Glo Brite" }),
      ing("rib", "Semperfli Nano Silk 12/0 — Brown (counter-rib)", { match: "Nano Silk" }),
      ing("abdomen", "Hare's Ear / Squirrel dubbing", { match: "Hare-Tron" }),
      ing("hackle", "Natural CDC", { match: "CDC Puff", color: "natural" }),
      ing("collar", "Darker hare's ear OR UV Shrimp Pink Ice Dub", { match: "Ice Dub" }),
    ],
  },
  {
    slug: "walt-s-worm",
    name: "Walt's Worm",
    overlap: true,
    category: "nymph",
    tagline: "Walt Young's northeast classic — a hare's-ear sow-bug that looks like everything.",
    origin_credit: "Walt Young (original); Devin Olsen variant",
    video_url: null,
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/sexy-walts-worm-a-k-a-sob-czech-nymph/", label: "Buy — Sexy Walt's Worm (Tactical Fly Fisher)" },
    ],
    history: `The Walt's Worm has been a staple in the Northeast for decades — a simple hare's-ear body on a straight-shank hook that doubles as a sow-bug imitation in spring creeks and tailwaters that hold the leggy isopod. It also happens to be a great all-around buggy pattern that looks like nothing and everything at the same time. Trout tend to put it in their mouth to see what it tastes like. Devin Olsen fishes it in sizes from 10 all the way to 20 — a range few nymphs cover that well.`,
    when_to_use: "Sow-bug water, tailwaters with isopods, and any time you need a generic 'something buggy' point fly.",
    sizes: ["10", "12", "14", "16", "18", "20"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 16", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Silver Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 — Dark Tan", { match: "Nano Silk" }),
      ing("body", "Hare's Ear / Squirrel dubbing", { match: "Hare-Tron" }),
      ing("rib", "Semperfli Nano Silk 12/0 — Brown", { match: "Nano Silk" }),
      ing("hot_spot", "Fl. orange Veevus (optional)", { match: "Nano Silk", optional: true }),
    ],
  },
  {
    slug: "sexy-walts-worm",
    name: "Sexy Walt's Worm",
    overlap: true,
    category: "nymph",
    tagline: "Loren Williams' pearl-ribbed Walt's — the same drab pattern with a western-tailwater edge.",
    origin_credit: "Loren Williams (variant of Walt Young's original)",
    video_url: null,
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/sexy-walts-worm-a-k-a-sob-czech-nymph/", label: "Buy — Sexy Walt's (Tactical Fly Fisher)" },
      { url: "https://www.tacticalflyfisher.com/tungsten-bomb-sexy-walts-worm-sob-czech/", label: "Buy — Tungsten Bomb Sexy Walt's" },
    ],
    history: `The Sexy Walt's Worm was developed by former Fly Fishing Team USA member Loren Williams — a Pearl Sulky Tinsel–ribbed variant of Walt Young's original that gives the drab pattern just enough flash for western tailwaters. Devin Olsen adopted it years ago and calls it one of his confidence flies for the West's toughest tailwaters. Whether in size 10 or 20, it works.`,
    when_to_use: "Western tailwaters and spring creeks where the original Walt's needs a touch more attraction.",
    sizes: ["10", "12", "14", "16", "18", "20"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 16", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Silver Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 — Dark Tan", { match: "Nano Silk" }),
      ing("body", "Hare's Ear / Squirrel dubbing", { match: "Hare-Tron" }),
      ing("rib", "Sulky Pearl Tinsel", { match: "Sulky Metallic", color: "pearl" }),
      ing("hot_spot", "Fl. orange Veevus (optional)", { match: "Nano Silk", optional: true }),
    ],
  },
  {
    slug: "lite-brite-perdigon",
    name: "Lite Brite Perdigon",
    overlap: false,
    category: "nymph",
    tagline: "A Krystal Flash perdigon — the attractor counterpart to the Quilldigon.",
    origin_credit: "Devin Olsen",
    video_url: "https://youtu.be/M1SBOfd42xM",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/devin-olsens-lite-brite-perdigon/", label: "Buy — Lite Brite Perdigon (Tactical Fly Fisher)" },
    ],
    description: "A smooth-bodied perdigon nymph built with Krystal Flash for a flashy attractor counterpart to the Quilldigon. Sinks like a pellet, catches light, and rotates with the drab Quilldigon depending on fish preference.",
    history: `Devin Olsen's Spanish friend Luis Esteban Hernandez introduced him to the perdigon style back in 2014 when Devin was living in California. Perdigon translates to 'pellet' in English, and the flies sink exactly like small stones — the smooth body reduces drag and lets them drop deep with little weight. Luis favored a flashy orange perdigon; Devin expanded the idea with Krystal Flash in many colors. On any given day he switches between the Quilldigon (drab) and Lite Brite Perdigon (flashy) to see which the trout prefer. Between the two, he can almost always find a variation that works, regardless of what country he's fishing in.`,
    fishing_tips: "Carry multiple flash colors — black, UV blue, UV purple, UV pink, Rootbeer. The day's winning color changes fast.",
    when_to_use: "Point fly. Any time you'd fish a perdigon — tailwater to freestone.",
    imitates: ["attractor", "mayfly nymph"],
    water_types: ["tailwater", "freestone"],
    sizes: ["14", "16", "18", "20"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Dohiku 644 / HDJ / 301 / 302SP — size 16", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Silver Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Veevus 16/0 to match body", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon — 3-4 fibers", { match: "coq de leon" }),
      ing("body", "Hareline Krystal Flash (black / UV blue / UV purple / UV pink / Rootbeer)", { match: "Krystal Flash" }),
      ing("wingcase", "Black Nail Polish", { match: "", optional: true }),
      ing("hot_spot", "Fl. Orange Veevus (optional)", { match: "Nano Silk", optional: true }),
    ],
  },
  {
    slug: "mop-fly",
    name: "The Mop",
    overlap: true,
    category: "nymph",
    tagline: "A single microfiber strand tied to a hook — controversial, effective, irreplaceable.",
    origin_credit: "Jake Villwock (popularized); Devin Olsen variant",
    video_url: "https://youtu.be/TA-PU-5FjtY",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/mop-fly/", label: "Buy — Mop Fly (Tactical Fly Fisher)" },
    ],
    history: `Like the Blowtorch, Devin Olsen first fished The Mop at the 2014 World Fly Fishing Championships in the Czech Republic. A year or two earlier, the pattern began making waves among eastern US competition anglers. Like most anglers, Devin took one look and was skeptical. His teammate Pat Weiss disabused him of that skepticism during practice. Now The Mop is one of those flies he *has* to try on every new river. Sometimes it's a dud. Other times it's THE pattern — not only convincing tough trout to eat, but convincing big trout that they're missing a meal if it drifts by.`,
    when_to_use: "Big water, stained water, high runoff. Also as an attractor in clear water when nothing else moves a fish.",
    sizes: ["8", "10", "12"],
    recipe: [
      ing("hook", "Dohiku HDJ — size 10 or 12", { match: "Dohiku HDJ" }),
      ing("bead", "Copper or Black Nickel Slotted Tungsten", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Uni 8/0 — Tan", { match: "Uni Thread 8/0", color: "tan" }),
      ing("body", "Microfiber Mop body bound with thread", { match: "Mop Body" }),
      ing("collar", "Dark Hare's Ear / Squirrel dubbing or Ice Dub", { match: "Hare-Tron" }),
    ],
  },
  {
    slug: "front-end-loader-caddis",
    name: "Front End Loader Caddis",
    overlap: false,
    category: "dry",
    tagline: "A hackle-stacker caddis built to hold a tungsten dropper — dry-dropper anchor.",
    origin_credit: "Devin Olsen",
    video_url: "https://youtu.be/0JuOZxBBcAE",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/front-end-loader-caddis/", label: "Buy — Front End Loader Caddis (Tactical Fly Fisher)" },
    ],
    description: "A hackle-stacker elk hair caddis with a Callibaetis Super Fine body, Glo Brite tag, and grizzly hackle wrapped on a Sexi Floss post. Rides low in the film but holds up a heavy bead.",
    history: `Devin Olsen tied his first Front End Loader Caddis in 2013 during practice for the World Fly Fishing Championships in Norway. The brown trout in the rivers they were fishing weren't dense, so he was covering vast flats with dry-dropper rigs. He needed a dry fly that would hold up a tungsten bead but also sit in the film to convince the browns to eat on flat water. He took the hackle-stacker style from one of his favorite mayfly dries and merged it with an elk-hair caddis. The pairing worked perfectly on Norwegian brown trout and is now his favorite dry-dropper dry.`,
    fishing_tips: "The Sexi Floss hackle post keeps the hackle off the film — fish hangs low without sinking. Glo Brite tag is the trigger.",
    when_to_use: "Dry-dropper water. Caddis emergences in flat water.",
    imitates: ["caddis adult", "emerging caddis"],
    water_types: ["spring creek", "tailwater", "freestone"],
    sizes: ["10", "12", "14", "16"],
    hook_styles: ["standard nymph"],
    recipe: [
      ing("hook", "Dohiku 301 or 611 — size 12", { match: "Dohiku 301" }),
      ing("thread", "Veevus 16/0 — Dark Tan (rear); Semperfli 12/0 Beige (front)", { match: "Nano Silk" }),
      ing("tag", "Glo Brite #5, #7, #1, or #12", { match: "Glo Brite" }),
      ing("rib", "Pearl Sulky Tinsel", { match: "Sulky Metallic", color: "pearl" }),
      ing("rib", "Semperfli Nano Silk 12/0 — Brown (counter)", { match: "Nano Silk" }),
      ing("abdomen", "Callibaetis Super Fine or Purple Ice Dub", { match: "Super Fine" }),
      ing("wing", "Natural elk hair", { match: "", optional: true }),
      ing("hackle", "Grizzly dry-fly hackle", { match: "Saddle Hackle Grizzly" }),
    ],
  },
  {
    slug: "monster-dry",
    name: "Monster Dry",
    overlap: false,
    category: "dry",
    tagline: "A Spanish-style CDC V-wing mayfly that converts picky risers.",
    origin_credit: "Devin Olsen (adapted from Pablo of Spanish National Team)",
    video_url: null,
    affiliate_links: [],
    description: "A hare's-ear-dubbed mayfly dry with a CDC V-wing, Pearl Sulky rib, and Glo Brite wing divider. Sparse silhouette, perfect air-resistance balance — designed for the toughest risers.",
    history: `In 2019 Devin Olsen and Lance Egan hosted their friend Pablo from the Spanish National Fly Fishing Team in Utah. Pablo kept saying the fish were 'always Monster' — which Devin and Lance initially took as reference to his dry fly. The nickname stuck. The Monster Dry is Devin's version of the Spanish-style split-CDC V-wing mayfly. The V-wing has specific properties of air resistance, weight distribution, and wing profile that trout seem to love. The fly doesn't specifically imitate any insect, but it has moved fish during PMD hatches, caddis emergences, and yellow-sally sessions on heavily-pressured rivers. As a searching dry, it is equally effective.`,
    fishing_tips: "Build the V-wing carefully — one CDC feather split, not two. The split is what gives the right pitch and balance.",
    when_to_use: "Picky risers. Selective spring creek fish. Blind prospecting when no hatch is visible.",
    imitates: ["mayfly dun", "PMD", "caddis", "yellow sally"],
    water_types: ["spring creek", "tailwater", "freestone"],
    sizes: ["10", "12", "14", "16", "18"],
    hook_styles: ["dry", "standard nymph"],
    recipe: [
      ing("hook", "Dohiku 301 — size 14", { match: "Dohiku 301" }),
      ing("thread", "Veevus 16/0 — Dark Tan", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon — 5-6 fibers", { match: "coq de leon" }),
      ing("rib", "Pearl Sulky Tinsel", { match: "Sulky Metallic", color: "pearl" }),
      ing("rib", "Semperfli Nano Silk 12/0 — Brown (counter)", { match: "Nano Silk" }),
      ing("abdomen", "Hare's Ear dubbing (abdomen + thorax)", { match: "Hare-Tron" }),
      ing("wing", "High-quality CDC V-wing", { match: "CDC Puff" }),
      ing("wing", "Glo Brite #5 or #2 divider/indicator", { match: "Glo Brite" }),
    ],
  },
  {
    slug: "monster-midge",
    name: "Monster Midge",
    overlap: false,
    category: "dry",
    tagline: "The V-wing applied to a midge — for the toughest tailwater sippers.",
    origin_credit: "Devin Olsen (adapted from Pablo of Spanish National Team)",
    video_url: null,
    affiliate_links: [],
    description: "A black-thorax V-wing midge with Glo Brite indicator. For picky tailwater fish sipping in flat water.",
    history: `The Monster Midge came from a trip Devin Olsen took to visit Pablo in Spain. Pablo was fishing a simple midge pattern, but Devin recognized the same V-wing style he had seen on the Monster Dry. He dubbed this one the Monster Midge for the wing-style match. The fly is incredibly effective on tough sippers in flat water. Devin also ties it with the CDC wings reversed in a shuttlecock configuration — both styles work.`,
    fishing_tips: "A fiddly tie — but the V-wing is what makes it right. If sippers ignore standard midge patterns, this is what to try.",
    when_to_use: "Winter midge hatches on tailwaters. Summer midges on pressured water.",
    imitates: ["midge adult", "chironomid"],
    water_types: ["tailwater", "spring creek"],
    sizes: ["18", "20", "22"],
    hook_styles: ["dry"],
    recipe: [
      ing("hook", "Dohiku 301 — size 20", { match: "Dohiku 301" }),
      ing("thread", "Veevus 16/0 — Black", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon — 5-6 fibers", { match: "coq de leon" }),
      ing("thorax", "Super Fine Dry Fly Dubbing — Black", { match: "Super Fine", color: "black" }),
      ing("wing", "CDC V-wing", { match: "CDC Puff" }),
      ing("wing", "Glo Brite #5 or #2 divider/indicator", { match: "Glo Brite" }),
    ],
  },
  {
    slug: "backflop-jig",
    name: "Backflop Jig",
    overlap: false,
    category: "streamer",
    tagline: "A slim mink-zonker jig streamer for Euro-nymph streamer tactics.",
    origin_credit: "Devin Olsen",
    video_url: "https://youtu.be/_gIIs_tNTx8",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/back-flop-jig/", label: "Buy — Backflop Jig (Tactical Fly Fisher)" },
    ],
    description: "A zonker-strip jig streamer with a UV Polar Chenille underbody wrapped simultaneously with the strip. Heavy enough to sink fast, slim enough to move freely.",
    history: `When the nymphing slows, streamer fishing on a Euro-nymph leader is often deadly. Jigging a streamer past pressured fish is one of the best ways to pull trout out of their doldrums. Devin Olsen's favorite streamer for this presentation is the Backflop Jig. The mink/squirrel zonker provides all the movement, but the slim profile lets it sink quickly back to depth after being lifted by the rod tip. Compared to his nymphs, Devin over-weights the Backflop with lots of lead or extra tungsten beads buried under the body, ensuring depth in fast water.`,
    fishing_tips: "Over-weight with lead under the body — depth is everything. Match or contrast the chenille to the zonker color.",
    when_to_use: "Slow nymphing days. Deep runs where fish need to be triggered, not just drifted-over.",
    imitates: ["sculpin", "minnow", "leech"],
    water_types: ["freestone", "tailwater", "pocket water"],
    sizes: ["8", "10", "12"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Dohiku HDJ or Umpqua XC 400 — size 10", { match: "Dohiku HDJ" }),
      ing("bead", "Copper / Silver / Fl. Orange / Chartreuse Slotted Tungsten", { match: "Tungsten Slotted" }),
      ing("thread", "Uni 8/0 to match body", { match: "Uni Thread 8/0" }),
      ing("tail", "Mink or Squirrel zonker strip", { match: "Squirrel Zonker" }),
      ing("body", "Hareline UV Polar Chenille — Medium", { match: "Polar Chenille" }),
      ing("hackle", "Hen soft hackle (matching or contrasting)", { match: "Hen Cape" }),
    ],
  },

  // ────────────── GILBERT ROWLEY (8) ──────────────
  {
    slug: "lickety-split",
    name: "Lickety Split",
    overlap: false,
    category: "nymph",
    tagline: "Rowley's split-case Baetis emerger — black body, pink foam wingcase.",
    origin_credit: "Gilbert Rowley",
    video_url: "https://youtu.be/_uc403c5gGA",
    affiliate_links: [
      { url: "https://captureadventuremedia.com/product/lickety-split/", label: "Buy — Lickety Split (Capture Adventure Media)" },
    ],
    description: "A split-case Baetis emerger with an Ice Dub body, black holographic tinsel wingcase, and pink foam underwing. Durable, resin-coated, and Rowley's first commercial pattern with Rainy's.",
    history: `Nearly every trout river on Earth holds small dark mayflies. Gilbert Rowley is almost never without one on his nymph rig — and most of the time, it's a Lickety Split. He began developing the fly around a decade ago, searching for a split-case pattern that was durable in the color schemes he had found most productive. After months at the vise he landed on the black-and-pink combination that is still his favorite. It's the most durable split-case emerger he has ever fished — fish after fish fail to mangle it. As a side note, it was also his first pattern picked up commercially by Rainy's Flies.`,
    fishing_tips: "The pink foam is visible to you and a trigger for the trout. Resin-coat the wingcase for durability.",
    when_to_use: "BWO emergences, mayfly-activity days on any trout river.",
    imitates: ["baetis emerger", "mayfly emerger"],
    water_types: ["tailwater", "spring creek", "freestone"],
    sizes: ["14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Umpqua XC400BL Jig — size 16", { match: "Umpqua XC400BL Jig" }),
      ing("bead", "Gold Slotted Tungsten", { match: "Tungsten Slotted", color: "gold" }),
      ing("thread", "Uni Thread 8/0 — Black", { match: "Uni Thread 8/0", color: "black" }),
      ing("tail", "Coq de Leon", { match: "coq de leon" }),
      ing("rib", "4X tippet", { match: "", optional: true }),
      ing("wingcase", "Black Holographic Tinsel — Medium", { match: "Holographic Tinsel", color: "black" }),
      ing("wing", "Pink Foam underwing", { match: "Fly Foam Sheet", color: "pink" }),
      ing("coating", "Solarez Bone Dry or Sally Hansen Hard as Nails", { match: "Solarez Bone Dry" }),
    ],
  },
  {
    slug: "mayday-mayfly",
    name: "Mayday Mayfly",
    overlap: false,
    category: "nymph",
    tagline: "Rowley's attractor mayfly nymph — holographic body, hot orange rib, Simi Seal thorax.",
    origin_credit: "Gilbert Rowley",
    video_url: "https://youtu.be/E7GSijSpHSw",
    affiliate_links: [
      { url: "https://captureadventuremedia.com/product/mayday-mayfly/", label: "Buy — Mayday Mayfly (Capture Adventure Media)" },
    ],
    description: "A brown holographic-tinsel-bodied mayfly nymph with a hot orange wire rib and Simi Seal thorax. Inspired in part by the Rainbow Warrior underbody style.",
    history: `Gilbert Rowley started tying the Mayday Mayfly right out of college around 2010. The tinsel underbody on the abdomen was inspired by Lance Egan's Rainbow Warrior — this was before Lance and Gilbert had become friends, and Egan flies were already staples in Rowley's box. After some trial and error, he landed on a few variations that fished consistently well. The hot-orange wire rib serves as both segmentation and an attractor, and the Simi Seal dubbing adds a super-buggy element to the thorax. Fast to tie, reliable on the water — a searching-nymph go-to.`,
    fishing_tips: "Fl. orange rib is the trigger. Don't overdress the Simi Seal — a tight, compact thorax works best.",
    when_to_use: "Searching nymph. Attractor point-fly duty on unfamiliar water.",
    imitates: ["mayfly nymph", "attractor"],
    water_types: ["freestone", "tailwater", "pocket water"],
    sizes: ["14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Umpqua XC400BL Jig — size 16", { match: "Umpqua XC400BL Jig" }),
      ing("bead", "Gold Slotted Tungsten", { match: "Tungsten Slotted", color: "gold" }),
      ing("thread", "Veevus 14/0 — Fl. Orange", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon", { match: "coq de leon" }),
      ing("abdomen", "Holographic Tinsel — Brown Medium", { match: "Holographic Tinsel", color: "brown" }),
      ing("rib", "UTC Ultra Wire — Hot Orange Brassie", { match: "Ultra Wire Hot Orange" }),
      ing("coating", "Solarez Bone Dry", { match: "Solarez Bone Dry" }),
      ing("thorax", "Simi Seal Dubbing — Brown", { match: "Simi Seal", color: "brown" }),
    ],
  },
  {
    slug: "rowley-stone",
    name: "Rowley Stone",
    overlap: false,
    category: "nymph",
    tagline: "A net-back-foil stonefly with sculpin-olive sow-scud collar.",
    origin_credit: "Gilbert Rowley",
    video_url: "https://youtu.be/9IPLd3jxRSw",
    affiliate_links: [
      { url: "https://captureadventuremedia.com/product/rowley-stone/", label: "Buy — Rowley Stone (Capture Adventure Media)" },
    ],
    description: "A large stonefly nymph with Black Goose biot tail, dark brown Net Back foil abdomen, Semi Seal bronze-peacock dubbing, Krystal Flash and turkey-flat legs, and a Bighorn Orange sow-scud collar.",
    history: `Gilbert Rowley developed and tested the Rowley Stone on small streams in his home state of Utah. It took a couple of years to fine-tune the materials, but since then he has fished it across the Western US with great success. Anytime large stoneflies are in the river system, the Rowley Stone is his go-to. The key material is the Net Back foil, which gives the fly a beautiful segmented look that plain dubbing can't match. Gilbert carries the pattern in both the dark and golden versions, and tied with both heavy tungsten and lighter brass beads so he can adjust to water depth and speed.`,
    fishing_tips: "Tie both the tungsten and the brass-bead versions — one as an anchor, one for slower water. Net Back foil is the heart of the pattern.",
    when_to_use: "Stonefly water — pre-hatch, during hatches, and all season where stones exist.",
    imitates: ["stonefly nymph", "golden stone", "salmonfly"],
    water_types: ["freestone", "pocket water"],
    sizes: ["6", "8", "10"],
    hook_styles: ["standard nymph"],
    recipe: [
      ing("hook", "Dai-Riki 135 size 6 OR Hanak 230 BL size 8", { match: "Dai-Riki 135" }),
      ing("bead", "Gold Brass or Gold Tungsten", { match: "Tungsten Slotted", color: "gold" }),
      ing("thread", "UTC 140 — Black", { match: "Danville 140", color: "black" }),
      ing("tail", "Black Goose Biots", { match: "", optional: true }),
      ing("abdomen", "Net Back Foil — Dark Brown", { match: "Net Back", color: "dark brown" }),
      ing("rib", "3X tippet", { match: "", optional: true }),
      ing("thorax", "Simi Seal — Bronze Peacock", { match: "Simi Seal", color: "peacock" }),
      ing("legs", "Black Krystal Flash + Black Turkey Flats", { match: "Krystal Flash", color: "black" }),
      ing("collar", "Wapsi Sow Scud Dubbing — Bighorn Orange", { match: "Sow Scud", color: "orange" }),
    ],
  },
  {
    slug: "zebragon",
    name: "ZebraGon",
    overlap: false,
    category: "nymph",
    tagline: "Rowley's hybrid of a zebra midge, mayfly, and perdigon — a guide fly with endless variations.",
    origin_credit: "Gilbert Rowley",
    video_url: "https://youtu.be/rYm9BVFt7hs",
    affiliate_links: [
      { url: "https://captureadventuremedia.com/product/zebragon/", label: "Buy — ZebraGon (Capture Adventure Media)" },
    ],
    description: "A smooth-bodied mayfly/zebra-midge/perdigon hybrid with silver wire rib, black nail-polish wingcase, and UV resin. Olive is the default — change thread color to match any water.",
    history: `The ZebraGon is Rowley's take on the 'guide fly' — simple, quick to tie, and deeply effective. It borrows the shape of a mayfly, the abdomen of a zebra midge, the density of a perdigon, and the versatility to imitate any number of aquatic insects. Gilbert can add a thread hot-spot or dubbing collar to turn it into an attractor, or change the thread color to adjust to different river systems or seasons. Whether he's fishing a technical tailwater or a high-mountain freestone, the ZebraGon gets the job done year-round.`,
    fishing_tips: "Tie in multiple thread colors — olive, tan, black, red. The ZebraGon rotation is the fly box.",
    when_to_use: "Year-round. Point fly, dropper, attractor with a hotspot, or drab in clear water.",
    imitates: ["midge pupa", "mayfly nymph", "generic"],
    water_types: ["tailwater", "freestone", "spring creek"],
    sizes: ["14", "16", "18"],
    hook_styles: ["jig hook"],
    recipe: [
      ing("hook", "Umpqua XC400BL Jig — size 16", { match: "Umpqua XC400BL Jig" }),
      ing("bead", "Slotted Tungsten — Silver", { match: "Tungsten Slotted", color: "silver" }),
      ing("thread", "Veevus 14/0 — Olive (or preferred)", { match: "Nano Silk" }),
      ing("tail", "Coq de Leon", { match: "coq de leon" }),
      ing("rib", "UTC Ultra Wire — Silver Small", { match: "Ultra Wire Silver" }),
      ing("wingcase", "Black Nail Polish", { match: "", optional: true }),
      ing("coating", "Solarez Bone Dry", { match: "Solarez Bone Dry" }),
    ],
  },
  {
    slug: "pliva-perdigon",
    name: "Pliva Perdigon",
    overlap: false,
    category: "nymph",
    tagline: "A Veevus Body Quill perdigon with chartreuse rib and fl. orange hot spot.",
    origin_credit: "Gilbert Rowley (introduced via Devin Olsen; Bosnian origin)",
    video_url: "https://youtu.be/D-tuKpwbrX0",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/olive-hot-spot-jig-perdigon/", label: "Buy — Pliva Perdigon (Tactical Fly Fisher)" },
    ],
    description: "A slim olive-body perdigon with chartreuse power-thread rib, fl. orange hot spot, black nail-polish wingcase, and UV resin. Sinks like a stone through picky water.",
    history: `Devin Olsen introduced Gilbert Rowley to this fly the year after Devin fished the World Championships in Bosnia. It was shown to the US team by local guides, and it proved to be one of the most valuable flies in the competition. Since then, perdigon nymphs have reshaped fly fishing, and the Pliva is one of Gilbert's favorite variations. He ties it with and without a hot spot, depending on how technical the trout are — the drab version for selective fish, the orange-spot version when he wants attention. Because perdigons sink so quickly, the Pliva gets a rig to depth without split shot or heavy anchors.`,
    fishing_tips: "Lead wire under-body is optional — add it when you need extra weight without going up a bead size. Chartreuse rib is the tell.",
    when_to_use: "Tight-line nymphing, picky trout, thin-tippet work.",
    imitates: ["baetis nymph", "pmd nymph"],
    water_types: ["tailwater", "spring creek"],
    sizes: ["14", "16", "18", "20"],
    hook_styles: ["jig hook", "standard nymph"],
    recipe: [
      ing("hook", "Hanak 230 or Dohiku 302 — size 16", { match: "Hanak 230" }),
      ing("bead", "Slotted Tungsten — Copper or Gold 2.5mm", { match: "Tungsten Slotted", color: "copper", size: "2.5mm" }),
      ing("weight", ".015\" lead wire (optional)", { match: "", optional: true }),
      ing("tail", "Coq de Leon", { match: "coq de leon" }),
      ing("body", "Veevus Body Quill — Olive", { match: "Veevus Body Quill", color: "olive" }),
      ing("rib", "Chartreuse Veevus 140D Power Thread", { match: "Nano Silk" }),
      ing("hot_spot", "Veevus Fl. Orange 16/0", { match: "Nano Silk" }),
      ing("wingcase", "Black Nail Polish", { match: "", optional: true }),
      ing("coating", "Solarez Bone Dry", { match: "Solarez Bone Dry" }),
    ],
  },
  {
    slug: "rowleys-pw-nymph",
    name: "Rowley's PW Nymph",
    overlap: false,
    category: "nymph",
    tagline: "A Polish-woven caddis nymph — dark back, light belly, squirrel collar.",
    origin_credit: "Gilbert Rowley",
    video_url: "https://youtu.be/TSSk-0tjdCk",
    affiliate_links: [
      { url: "https://captureadventuremedia.com/product/rowleys-pw-nymph/", label: "Buy — Rowley's PW Nymph (Capture Adventure Media)" },
    ],
    description: "A Polish-woven free-living caddis larva with two-color embroidery floss bodies (Rusty Brown top / Yellow bottom), natural SLF Squirrel collar, and yellow thread hot spot.",
    history: `Rowley's PW Nymph is his take on a Polish Woven nymph — a pattern he didn't invent, but found his favorite color combination of after years of experimentation. By weaving two colors of embroidery floss together, the finished fly has a dark back and a light underbelly, which serves as both a free-living caddis larva imitation and a heavy anchor fly in larger sizes. The weaving technique looks intimidating, but after your first half-dozen it gets easy — and fun.`,
    fishing_tips: "Size 10: 4 strands of floss. Size 12: 3 strands. The weave is the magic; don't cheat it.",
    when_to_use: "Free-living caddis water. Anchor fly duty in deep, fast pocket water.",
    imitates: ["caddis larva", "free-living caddis"],
    water_types: ["freestone", "tailwater"],
    sizes: ["10", "12"],
    hook_styles: ["standard nymph"],
    recipe: [
      ing("hook", "Dai-Riki 135 — size 10", { match: "Dai-Riki 135" }),
      ing("bead", "Tungsten — Bronze or Gold", { match: "Tungsten Slotted", color: "bronze" }),
      ing("thread", "Uni Thread 6/0 — Camel", { match: "Uni Thread 6/0" }),
      ing("rib", "4X tippet", { match: "", optional: true }),
      ing("body", "Embroidery Floss — Rusty Brown 300 (top), Yellow 445 (bottom)", { match: "Embroidery Floss" }),
      ing("collar", "SLF Squirrel Dubbing — Natural", { match: "SLF Squirrel" }),
      ing("hot_spot", "UTC 70 Denier — Yellow", { match: "Danville 140" }),
    ],
  },
  {
    slug: "squirmy-wormy",
    name: "Squirmy Wormy",
    overlap: true,
    category: "nymph",
    tagline: "Silicone wiggle-worm — controversial, irreplaceable, fish catcher.",
    origin_credit: "Popularized by the Czech team; Gilbert Rowley variant",
    video_url: "https://youtu.be/Td1VaolBbmY",
    affiliate_links: [
      { url: "https://www.tacticalflyfisher.com/squirminator/", label: "Buy — Squirminator (Tactical Fly Fisher)" },
    ],
    history: `It's no secret — fish love worms. Being that the goal is catching fish as efficiently as possible, it follows that worm patterns belong in the box. Gilbert Rowley calls the Squirmy Wormy the single most productive worm pattern he has ever fished — it has pulling power, and often catches the largest fish of the day. The silicone material is the trigger, wiggling on the drift like nothing else. Devin Olsen introduced Rowley to the pattern years ago when the material was hard to find; today every fly shop carries it. Tied with a heavy tungsten bead, it doubles as an anchor fly that gets a rig to depth fast.`,
    when_to_use: "High-water and runoff. Also when the nymphing is slow and you need a pattern with pulling power.",
    sizes: ["10", "12", "14"],
    recipe: [
      ing("hook", "Hanak 230 or similar nymph hook — size 12", { match: "Hanak 230" }),
      ing("bead", "Tungsten — Copper or Silver", { match: "Tungsten Slotted", color: "copper" }),
      ing("thread", "Uni Thread 6/0 — Red (or to match)", { match: "Uni Thread 6/0", color: "red" }),
      ing("body", "Squirmy Wormy Material — Bloodworm Red", { match: "Squirmy Wormy" }),
    ],
  },
  {
    slug: "olsens-cdc-midge",
    name: "Olsen's CDC Midge",
    overlap: false,
    category: "dry",
    tagline: "Devin Olsen's long-leader CDC midge for the pickiest tailwater risers.",
    origin_credit: "Devin Olsen (presented by Gilbert Rowley in this book)",
    video_url: "https://youtu.be/SSv7HRotc50",
    affiliate_links: [],
    description: "A black Crystal Flash–bodied midge with CDC wing, pink CDC hot spot, and grizzly hackle. A specialist pattern for long-leader tailwater work.",
    history: `A few years ago Gilbert Rowley watched Devin Olsen catch trout on one of the most pressured tailwaters in the West — fish that leave most anglers scratching their heads. Long smooth glides, no broken water, easy to spot from the hiking trail and fished to non-stop. Devin was casting a dry-fly leader over 20' long with nearly flawless presentation, but when Rowley asked what fly, Devin showed him this CDC midge. Rowley has fished it on technical waters since and says it continues to produce — when it wasn't included in Devin's own section of the book, Rowley added it to his.`,
    fishing_tips: "Fish it on a 20'+ dry-fly leader. Presentation matters more than tippet size.",
    when_to_use: "Tailwater midge hatches. Long smooth glides with spotty risers.",
    imitates: ["midge adult", "chironomid"],
    water_types: ["tailwater"],
    sizes: ["18", "20"],
    hook_styles: ["dry"],
    recipe: [
      ing("hook", "Dohiku 301 — size 20", { match: "Dohiku 301" }),
      ing("thread", "Veevus 16/0 — Black", { match: "Nano Silk" }),
      ing("tail", "Crystal Flash — Black (shuck/tail)", { match: "Krystal Flash", color: "black" }),
      ing("body", "Crystal Flash — Black", { match: "Krystal Flash", color: "black" }),
      ing("wing", "CDC — White or Khaki", { match: "CDC Puff" }),
      ing("hot_spot", "CDC — Pink", { match: "CDC Puff", color: "pink" }),
      ing("hackle", "Grizzly Hackle", { match: "Saddle Hackle Grizzly" }),
    ],
  },
];

// ── Material resolution ──────────────────────────────────────────
// Resolve each ingredient's match text to a material_id where possible.
async function resolveMaterial(matchText, brand) {
  if (!matchText) return null;
  let q = supabase.from("tying_materials").select("id, name, brand").ilike("name", `%${matchText}%`).limit(1);
  if (brand) q = q.eq("brand", brand);
  const { data } = await q;
  return data?.[0]?.id || null;
}

// ── Execution ────────────────────────────────────────────────────
console.log(`\n🎣 Confidence Flies — Phase 2: Seeding ${FLIES.length} flies (8 overlap, ${FLIES.length - 8} new)\n`);

const stats = { flyInserted: 0, flyUpdated: 0, flyFailed: 0, ingInserted: 0, ingMatched: 0, ingUnmatched: 0 };

for (const fly of FLIES) {
  // Find or create canonical fly row
  const { data: existing } = await supabase
    .from("canonical_flies")
    .select("id, slug")
    .eq("slug", fly.slug)
    .maybeSingle();

  const payload = {
    slug: fly.slug,
    name: fly.name,
    category: fly.category,
    tagline: fly.tagline ?? null,
    history: fly.history ?? null,
    fishing_tips: fly.fishing_tips ?? null,
    when_to_use: fly.when_to_use ?? null,
    imitates: fly.imitates ?? null,
    water_types: fly.water_types ?? null,
    sizes: fly.sizes ?? null,
    hook_styles: fly.hook_styles ?? null,
    video_url: fly.video_url ?? null,
    affiliate_links: (fly.affiliate_links && fly.affiliate_links.length) ? fly.affiliate_links : null,
    origin_credit: fly.origin_credit ?? null,
  };

  // Only overwrite description on new flies — preserve existing curated descriptions on overlap
  if (!existing && fly.description) {
    payload.description = fly.description;
  }

  let flyId;
  if (existing) {
    flyId = existing.id;
    // For overlap, do a partial update — don't overwrite fields we don't want to clobber
    const patch = {};
    if (fly.tagline) patch.tagline = fly.tagline;
    if (fly.history) patch.history = fly.history;
    if (fly.when_to_use) patch.when_to_use = fly.when_to_use;
    if (fly.video_url) patch.video_url = fly.video_url;
    if (fly.affiliate_links && fly.affiliate_links.length) patch.affiliate_links = fly.affiliate_links;
    if (fly.origin_credit) patch.origin_credit = fly.origin_credit;
    const { error } = await supabase.from("canonical_flies").update(patch).eq("id", flyId);
    if (error) {
      console.error(`  ❌ UPDATE ${fly.slug}: ${error.message}`);
      stats.flyFailed++;
      continue;
    }
    stats.flyUpdated++;
    console.log(`  ✓ UPDATED   ${fly.slug}`);
  } else {
    const { data: inserted, error } = await supabase
      .from("canonical_flies")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      console.error(`  ❌ INSERT ${fly.slug}: ${error.message}`);
      stats.flyFailed++;
      continue;
    }
    flyId = inserted.id;
    stats.flyInserted++;
    console.log(`  ✓ INSERTED  ${fly.slug}`);
  }

  // Wipe existing recipe ingredients for this fly and re-seed
  await supabase.from("fly_recipe_ingredients").delete().eq("canonical_fly_id", flyId);

  for (let i = 0; i < fly.recipe.length; i++) {
    const item = fly.recipe[i];
    const materialId = item.match ? await resolveMaterial(item.match, item.brand) : null;
    if (materialId) stats.ingMatched++;
    else stats.ingUnmatched++;

    const { error } = await supabase.from("fly_recipe_ingredients").insert({
      canonical_fly_id: flyId,
      fly_pattern_id: null,
      material_id: materialId,
      material_name: item.label,
      role: item.role,
      is_optional: item.optional || false,
      step_position: i + 1,
      quantity: null,
      color_choice: item.color || null,
      size_choice: item.size || null,
      notes: item.notes || null,
    });
    if (error) {
      console.error(`    ⚠️  ingredient ${item.role}: ${error.message}`);
    } else {
      stats.ingInserted++;
    }
  }
}

const { count: totalFlies } = await supabase
  .from("canonical_flies")
  .select("*", { count: "exact", head: true });

const matchRate = ((stats.ingMatched / (stats.ingMatched + stats.ingUnmatched)) * 100).toFixed(1);

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Flies inserted: ${stats.flyInserted}`);
console.log(`  Flies updated:  ${stats.flyUpdated}`);
console.log(`  Flies failed:   ${stats.flyFailed}`);
console.log(`  Total flies now: ${totalFlies}`);
console.log(``);
console.log(`  Ingredients inserted: ${stats.ingInserted}`);
console.log(`  Ingredients matched:  ${stats.ingMatched} (${matchRate}%)`);
console.log(`  Ingredients unmatched:${stats.ingUnmatched}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
