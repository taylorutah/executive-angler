// Phase 1: Seed missing tying_materials used by Confidence Flies (Egan/Olsen/Rowley).
//
// Data model (matches existing conventions, especially the TMC 100 / Dumbbell Eyes pattern):
//   brand        → manufacturer (e.g. "Wapsi")
//   name         → product line (e.g. "Sow Scud Dubbing")
//   subcategory  → product-line-slug used for grouping
//   colors       → array of color variants available
//   sizes        → array of size variants available (optional)
//   material_type, weight, finish, description, image_url, vendor_url → metadata
//
// Run: node scripts/seed-confidence-materials.mjs
// Idempotent: upserts by slug.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ── Load env ─────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mat({
  brand,
  name,
  category,
  subcategory,
  colors = null,
  sizes = null,
  material_type = null,
  weight = null,
  finish = null,
  description,
  vendor_url = null,
}) {
  return {
    slug: slugify(`${brand}-${name}`),
    brand,
    name,
    category,
    subcategory,
    colors,
    sizes,
    material_type,
    weight,
    finish,
    description,
    vendor_url,
    is_verified: true,
  };
}

// ── Material Catalog ─────────────────────────────────────────────
// Each entry is a product line; variants live in colors/sizes arrays.
const MATERIALS = [
  // ── HOOKS ───────────────────────────────────────────────────────
  mat({
    brand: "Hanak",
    name: "Hanak 400 BL Jig",
    category: "hook",
    subcategory: "jig",
    sizes: ["10", "12", "14", "16", "18", "20"],
    finish: "black nickel",
    description:
      "Czech-made barbless jig hook with a 60-degree bend — the gold standard for euro-nymphing competition flies. Strong wire, sharp chemically-sharpened point.",
  }),
  mat({
    brand: "Hanak",
    name: "Hanak 300 BL Original Czech Nymph",
    category: "hook",
    subcategory: "nymph",
    sizes: ["8", "10", "12", "14", "16"],
    finish: "black nickel",
    description:
      "Curved barbless Czech nymph hook built for weighted scud/caddis pupa patterns. Short shank, wide gape.",
  }),
  mat({
    brand: "Hanak",
    name: "Hanak 230 BL",
    category: "hook",
    subcategory: "nymph",
    sizes: ["10", "12", "14", "16", "18", "20"],
    finish: "black nickel",
    description:
      "Standard-length barbless competition nymph hook. Workhorse for classic nymph patterns where a jig profile is not required.",
  }),
  mat({
    brand: "Dohiku",
    name: "Dohiku HDJ",
    category: "hook",
    subcategory: "jig",
    sizes: ["10", "12", "14", "16", "18"],
    finish: "black nickel",
    description:
      "Slovenian competition jig hook favored by Lance Egan and many Team USA tiers. Slightly heavier wire than Hanak 400.",
  }),
  mat({
    brand: "Dohiku",
    name: "Dohiku 301",
    category: "hook",
    subcategory: "nymph",
    sizes: ["10", "12", "14", "16", "18", "20"],
    finish: "black nickel",
    description:
      "Curved barbless nymph hook — versatile for standard nymphs, emergers, and soft hackles.",
  }),
  mat({
    brand: "Dohiku",
    name: "Dohiku 644",
    category: "hook",
    subcategory: "dry",
    sizes: ["12", "14", "16", "18", "20"],
    finish: "black nickel",
    description:
      "Barbless dry-fly hook — light wire, wide gape, straight eye. Great for CDC patterns and parachutes.",
  }),
  mat({
    brand: "Dohiku",
    name: "Dohiku 302SP",
    category: "hook",
    subcategory: "nymph",
    sizes: ["12", "14", "16", "18", "20"],
    finish: "black nickel",
    description:
      "Short-shank barbless scud/shrimp/emerger hook with extra-wide gape.",
  }),
  mat({
    brand: "Dohiku",
    name: "Dohiku 611",
    category: "hook",
    subcategory: "nymph",
    sizes: ["10", "12", "14", "16"],
    finish: "black nickel",
    description:
      "Long-shank barbless nymph hook for stoneflies and streamer-style nymphs.",
  }),
  mat({
    brand: "Umpqua",
    name: "Umpqua XC400BL Jig",
    category: "hook",
    subcategory: "jig",
    sizes: ["12", "14", "16", "18"],
    finish: "black nickel",
    description:
      "Umpqua's answer to the Hanak 400 — barbless jig hook with competition-grade steel. Used extensively by the Fly Fishing Team USA.",
  }),
  mat({
    brand: "Umpqua",
    name: "Umpqua XC 400",
    category: "hook",
    subcategory: "nymph",
    sizes: ["10", "12", "14", "16", "18"],
    finish: "black nickel",
    description:
      "Standard-shank barbless competition nymph hook from Umpqua's XC series.",
  }),
  mat({
    brand: "Tiemco",
    name: "TMC 2499SP-BL",
    category: "hook",
    subcategory: "nymph",
    sizes: ["12", "14", "16", "18", "20"],
    finish: "black",
    description:
      "Tiemco's short-point barbless 2X-heavy curved nymph hook — classic choice for Rainbow Warriors and Frenchies tied on curved shanks.",
  }),
  mat({
    brand: "Dai-Riki",
    name: "Dai-Riki 135",
    category: "hook",
    subcategory: "nymph",
    sizes: ["6", "8", "10", "12", "14"],
    finish: "bronze",
    description:
      "Curved caddis/scud/nymph hook with 2X heavy wire. Economy competitor to TMC 2457.",
  }),

  // ── BEADS (slotted tungsten — coverage gap) ─────────────────────
  mat({
    brand: "Hareline",
    name: "Slotted Tungsten Bead Pink",
    category: "bead",
    subcategory: "tungsten-slotted",
    colors: ["metallic pink", "hot pink", "light pink"],
    sizes: ["2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.3mm", "3.8mm", "4.6mm"],
    description: "Slotted tungsten bead in pink shades — hot attractor head for euro nymphs.",
  }),
  mat({
    brand: "Hareline",
    name: "Slotted Tungsten Bead Orange",
    category: "bead",
    subcategory: "tungsten-slotted",
    colors: ["fluorescent orange", "matte orange"],
    sizes: ["2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.3mm", "3.8mm", "4.6mm"],
    description: "Slotted tungsten bead in fluorescent orange — high-vis attractor head.",
  }),
  mat({
    brand: "Hareline",
    name: "Slotted Tungsten Bead Chartreuse",
    category: "bead",
    subcategory: "tungsten-slotted",
    colors: ["fluorescent chartreuse"],
    sizes: ["2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.3mm"],
    description: "Slotted tungsten bead in fluorescent chartreuse — strike-trigger attractor head.",
  }),
  mat({
    brand: "Hareline",
    name: "Slotted Tungsten Bead Bronze",
    category: "bead",
    subcategory: "tungsten-slotted",
    colors: ["bronze"],
    sizes: ["2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.3mm", "3.8mm"],
    description: "Slotted tungsten bead in bronze — subtle natural finish for tan/olive nymphs.",
  }),

  // ── DUBBING ─────────────────────────────────────────────────────
  mat({
    brand: "Wapsi",
    name: "Sow Scud Dubbing",
    category: "dubbing",
    subcategory: "sow-scud",
    colors: [
      "rainbow",
      "bighorn orange",
      "tan",
      "olive",
      "pink",
      "shrimp pink",
      "gray",
      "amber",
      "dark brown",
    ],
    description:
      "Coarse translucent dubbing with a subtle sparkle — the original scud/sowbug blend. 'Rainbow' is the signature attractor color for tail-water trout.",
  }),
  mat({
    brand: "Hareline",
    name: "Hare-Tron Dubbing",
    category: "dubbing",
    subcategory: "hare-tron",
    colors: [
      "natural",
      "dark hare's ear",
      "olive",
      "tan",
      "black",
      "rust",
      "peacock",
      "golden stone",
    ],
    description:
      "Classic hare's ear blend spiked with Antron fibers for extra movement and flash. Dubs tight or shaggy for a full range of nymphs.",
  }),
  mat({
    brand: "Arizona Fly Fishing",
    name: "Arizona Synthetic Dubbing",
    category: "dubbing",
    subcategory: "synthetic",
    colors: [
      "peacock",
      "black peacock",
      "burnt olive",
      "rusty brown",
      "callibaetis",
      "dirty olive",
      "hare's ear",
    ],
    description:
      "Fine synthetic dubbing with a subtle flash — ties smooth bodies on small nymphs without the bulk of natural dubbings.",
  }),
  mat({
    brand: "Arizona Fly Fishing",
    name: "Simi Seal Dubbing",
    category: "dubbing",
    subcategory: "simi-seal",
    colors: [
      "peacock",
      "canadian olive",
      "brown",
      "burnt orange",
      "black",
      "bronze peacock",
      "leech",
    ],
    description:
      "John Rohmer's synthetic seal substitute — long fibers with iridescent flash, prized for leeches, buggers, and attractor nymphs.",
  }),
  mat({
    brand: "Arizona Fly Fishing",
    name: "Mega Simi Seal Dubbing",
    category: "dubbing",
    subcategory: "simi-seal",
    colors: ["dirty olive", "peacock", "black", "canadian olive", "rusty brown"],
    description:
      "Larger-fiber version of Simi Seal — ideal for bigger nymphs, buggers, and Czech-nymph-style patterns.",
  }),
  mat({
    brand: "Wapsi",
    name: "Super Fine Dry Fly Dubbing",
    category: "dubbing",
    subcategory: "super-fine",
    colors: [
      "adams gray",
      "rusty brown",
      "pmd",
      "bwo olive",
      "tan",
      "callibaetis",
      "black",
      "light olive",
    ],
    description:
      "The benchmark dry-fly dubbing — ultra-fine synthetic fibers dub tight and shed water. Non-absorbent and easy to spin in a tight thread.",
  }),
  mat({
    brand: "Hareline",
    name: "Ripple Ice Dub",
    category: "dubbing",
    subcategory: "ice-dub",
    colors: [
      "mother of pearl",
      "uv pearl",
      "copper",
      "peacock",
      "black peacock",
      "rainbow",
    ],
    description:
      "Longer-fiber Ice Dub variant with a crinkled sparkle — doubles as a flash tail or collar. Signature material for perdigon wing cases.",
  }),
  mat({
    brand: "Hareline",
    name: "SLF Squirrel Dubbing",
    category: "dubbing",
    subcategory: "slf",
    colors: ["natural", "olive", "black", "rust", "hare's ear"],
    description:
      "Synthetic Living Fiber blend of squirrel underfur and guard hair — spiky movement for nymph collars and hot spots.",
  }),

  // ── THREAD ──────────────────────────────────────────────────────
  mat({
    brand: "UTC",
    name: "Danville 140 Denier",
    category: "thread",
    subcategory: "flat-wax",
    sizes: ["140D"],
    colors: [
      "white",
      "black",
      "olive",
      "red",
      "chartreuse",
      "fluorescent orange",
      "tan",
      "brown",
    ],
    description:
      "Flat waxed nylon thread — lays flat for smooth underbodies and tinsel ribbing. Standard for streamers and Rainbow Warrior–style builds.",
  }),
  mat({
    brand: "UNI Products",
    name: "Uni Thread 8/0",
    category: "thread",
    subcategory: "standard",
    sizes: ["8/0"],
    colors: [
      "black",
      "white",
      "tan",
      "olive",
      "red",
      "brown",
      "fire orange",
      "gray",
      "camel",
    ],
    description:
      "Classic all-purpose tying thread — workhorse for nymphs and dries size 12–20. Strong and easy to control.",
  }),
  mat({
    brand: "UNI Products",
    name: "Uni Thread 6/0",
    category: "thread",
    subcategory: "standard",
    sizes: ["6/0"],
    colors: ["black", "white", "red", "olive", "tan", "camel", "fluorescent red"],
    description:
      "Heavier Uni thread for streamers, large nymphs, and bass bugs where more wraps-per-turn body bulk is desired.",
  }),
  mat({
    brand: "Glo Brite",
    name: "Glo Brite Floss",
    category: "thread",
    subcategory: "fluorescent-floss",
    colors: [
      "#1 crimson",
      "#2 phosphor yellow",
      "#3 deep red",
      "#4 fluorescent pink",
      "#5 orange",
      "#6 hot orange",
      "#7 golden olive",
      "#8 signal green",
      "#9 lime",
      "#10 chartreuse",
      "#11 neon magenta",
      "#12 purple",
    ],
    description:
      "Fluorescent multifilament floss from the UK salmon/spey tradition — numbered color system. Glo Brite #7 (golden olive) is an iconic hot-spot material.",
  }),

  // ── WIRE / RIBBING ──────────────────────────────────────────────
  mat({
    brand: "UTC",
    name: "Ultra Wire Hot Orange",
    category: "wire",
    subcategory: "ultra-wire",
    sizes: ["x-small", "small", "brassie", "medium", "large"],
    colors: ["hot orange"],
    description:
      "Fluorescent hot-orange Ultra Wire — the go-to ribbing for Frenchies and hot-collar euro nymphs.",
  }),
  mat({
    brand: "UTC",
    name: "Ultra Wire Sculpin Olive",
    category: "wire",
    subcategory: "ultra-wire",
    sizes: ["x-small", "small", "brassie", "medium"],
    colors: ["sculpin olive"],
    description: "Olive UTC Ultra Wire — natural-toned ribbing for scuds and olive nymphs.",
  }),
  mat({
    brand: "UTC",
    name: "Ultra Wire Silver",
    category: "wire",
    subcategory: "ultra-wire",
    sizes: ["x-small", "small", "brassie", "medium", "large"],
    colors: ["silver"],
    description: "Classic silver UTC Ultra Wire for midges, caddis pupa, and attractor nymphs.",
  }),
  mat({
    brand: "UTC",
    name: "Ultra Wire Red",
    category: "wire",
    subcategory: "ultra-wire",
    sizes: ["x-small", "small", "brassie", "medium"],
    colors: ["red"],
    description: "Red UTC Ultra Wire — go-to ribbing for zebra midges and red-wired attractors.",
  }),

  // ── FLASH / TINSEL ──────────────────────────────────────────────
  mat({
    brand: "UTC",
    name: "Flashback Tinsel",
    category: "flash",
    subcategory: "mylar",
    sizes: ["small", "medium", "large", "extra-large"],
    colors: ["black", "pearl", "gold", "silver", "copper", "rainbow", "holographic silver"],
    description:
      "Flat Mylar tinsel for wing cases, flashbacks, and bodies. 'Black - Large' is the signature Iron Lotus wing-case material.",
  }),
  mat({
    brand: "Sulky",
    name: "Sulky Metallic Tinsel",
    category: "flash",
    subcategory: "metallic-thread",
    colors: [
      "opalescent (8040)",
      "gold",
      "silver",
      "copper",
      "pearl",
      "black",
      "holographic gold",
    ],
    description:
      "Sewing-industry metallic tinsel adopted by tiers for fine-diameter ribbing. Opalescent 8040 is the pearl-flash ribbing used on Rowley's perdigons.",
  }),
  mat({
    brand: "Hedron",
    name: "Holographic Tinsel",
    category: "flash",
    subcategory: "holographic",
    sizes: ["small", "medium", "large"],
    colors: ["silver", "gold", "copper", "brown", "rainbow", "red", "green"],
    description:
      "Holographic flat tinsel with a shattered-light effect. Brown - Medium is Rowley's PW Nymph abdomen ribbing.",
  }),
  mat({
    brand: "Loon Outdoors",
    name: "UV Clear Fly Finish Flow",
    category: "resin",
    subcategory: "UV-resin",
    description:
      "Low-viscosity UV-cure resin — wicks into thread bodies, perdigon wing cases, and zebra midges without doming. Cures tack-free in seconds.",
  }),
  mat({
    brand: "Solarez",
    name: "Solarez Bone Dry",
    category: "resin",
    subcategory: "UV-resin",
    description:
      "Ultra-thin UV-cure resin — cures rock-hard with no tack, perfect for perdigons and small nymph wing cases.",
  }),

  // ── SYNTHETIC BODY MATERIALS ────────────────────────────────────
  mat({
    brand: "Polish Quills",
    name: "Polish Quills",
    category: "synthetic",
    subcategory: "quill-body",
    colors: [
      "olive",
      "natural",
      "amber",
      "gray",
      "brown",
      "black",
      "yellow",
      "red",
      "rusty brown",
    ],
    description:
      "Stripped-and-dyed peacock-style quill bodies from Poland — produces a segmented biot look with zero bulk. Rowley's signature abdomen material for Pliva Perdigons and Quilldigons.",
  }),
  mat({
    brand: "Veevus",
    name: "Veevus Body Quill",
    category: "synthetic",
    subcategory: "body-quill",
    colors: ["olive", "natural", "amber", "brown", "black", "rust"],
    description:
      "Veevus's flat mono body-quill — extruded body material that wraps smooth and translucent. Used in place of natural quills for segmented nymph and midge bodies.",
  }),
  mat({
    brand: "Hareline",
    name: "UV Polar Chenille",
    category: "chenille",
    subcategory: "polar-chenille",
    sizes: ["micro", "small", "medium", "large"],
    colors: [
      "mother of pearl",
      "uv pearl",
      "uv black",
      "uv olive",
      "uv tan",
      "copper",
      "peacock",
    ],
    description:
      "Flashy palmer-able chenille with UV-reactive fibers — wraps into buggy collars and full body wraps. Rowley uses medium UV Polar Chenille on the ZebraGon alongside a zonker strip.",
  }),
  mat({
    brand: "Wapsi",
    name: "Squirrel Zonker Strip",
    category: "synthetic",
    subcategory: "zonker",
    colors: [
      "sculpin olive",
      "natural",
      "black",
      "white",
      "olive",
      "rust",
      "tan",
      "gray",
    ],
    description:
      "Tanned squirrel-hide zonker strip — finer profile than rabbit for smaller streamers and articulated nymphs. Sculpin Olive is the ZebraGon tail.",
  }),
  mat({
    brand: "Wapsi",
    name: "Foam Ant Bodies",
    category: "foam",
    subcategory: "pre-formed",
    sizes: ["small", "medium", "large", "XL"],
    colors: ["black", "brown", "red", "tan", "cinnamon"],
    description:
      "Pre-formed two-segment foam ant bodies. Bionic Ant 2.0 uses the XL Black.",
  }),
  mat({
    brand: "Wapsi",
    name: "Uni Flex",
    category: "rubber",
    subcategory: "flat-leg",
    colors: ["black", "white", "brown", "olive", "tan", "red"],
    description:
      "Flat synthetic leg material with subtle sheen — wraps like a leg or tails out from a hot spot. Bionic Ant leg.",
  }),
  mat({
    brand: "Generic",
    name: "Mop Body (Microfiber)",
    category: "synthetic",
    subcategory: "mop",
    colors: [
      "chartreuse",
      "tan",
      "cream",
      "olive",
      "pink",
      "orange",
      "yellow",
      "white",
    ],
    description:
      "Single fiber cut from a microfiber car-wash mitt or chenille mop. The body of The Mop fly — controversial, effective, irreplaceable.",
  }),
  mat({
    brand: "Spirit River",
    name: "Squirmy Wormy Material",
    category: "synthetic",
    subcategory: "silicone-worm",
    colors: [
      "bloodworm red",
      "earthworm brown",
      "hot pink",
      "fluorescent pink",
      "cerise",
      "tan",
      "olive",
      "purple",
      "orange",
    ],
    description:
      "Stretchy silicone worm body — wiggles on the drift like nothing else. Tie with a light hand so the silicone stays intact.",
  }),
  mat({
    brand: "Enrico Puglisi",
    name: "EP Trigger Point Fibers",
    category: "synthetic",
    subcategory: "trigger-point",
    colors: ["white", "dun", "black", "tan", "olive", "callibaetis"],
    description:
      "Fine, glossy synthetic wing fiber — stays upright when spun around a thread base. Olsen uses White on his dries for high-vis mayfly wings.",
  }),
  mat({
    brand: "Wapsi",
    name: "Antron Yarn Carded",
    category: "synthetic",
    subcategory: "antron-yarn",
    colors: [
      "pmd shuck / olive",
      "rusty brown",
      "cream",
      "amber",
      "medium olive",
      "callibaetis",
      "light dun",
    ],
    description:
      "Carded Antron yarn for shucks, Klinkhammer posts, and trailing-shuck emergers. PMD Shuck/Olive is Olsen's Mayday Mayfly shuck.",
  }),
  mat({
    brand: "Generic",
    name: "Net Back Foil",
    category: "synthetic",
    subcategory: "net-back",
    colors: ["dark brown", "natural", "olive", "tan", "black"],
    description:
      "Pressure-printed foil backing material with a scale/segmentation pattern — used as a wing case or shellback. Rowley's Backflop Jig wing case.",
  }),
  mat({
    brand: "Generic",
    name: "Embroidery Floss",
    category: "synthetic",
    subcategory: "floss",
    colors: [
      "rusty brown (300)",
      "yellow (445)",
      "black",
      "olive",
      "tan",
      "red",
      "white",
    ],
    description:
      "Six-strand cotton embroidery floss — cheap, lays flat, and dyes well. Olsen uses paired colors (Rusty Brown 300 + Yellow 445) for two-tone bodies like the Corn-Fed Caddis.",
  }),

  // ── FEATHERS / HACKLE ───────────────────────────────────────────
  mat({
    brand: "Whiting Farms",
    name: "Brahma Hen Saddle",
    category: "feather",
    subcategory: "hen-saddle",
    colors: [
      "mottled gray / dyed golden olive",
      "mottled gray / natural",
      "mottled brown / dyed pmd",
      "mottled black",
      "grizzly / dyed olive",
    ],
    description:
      "Whiting's cross-bred Brahma hen — webby, mottled feathers that collar soft-hackles and emergers with a bug-like motion. The Mottled Gray / Golden Olive is Rowley's Soft Hackle Carrot collar.",
  }),
];

// ── Insert / Upsert ──────────────────────────────────────────────
console.log(`\n🎣 Confidence Flies — Phase 1: Seeding ${MATERIALS.length} materials\n`);

let inserted = 0;
let updated = 0;
let failed = 0;

for (const m of MATERIALS) {
  // Check if slug already exists
  const { data: existing } = await supabase
    .from("tying_materials")
    .select("id, slug")
    .eq("slug", m.slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("tying_materials")
      .update({
        brand: m.brand,
        name: m.name,
        category: m.category,
        subcategory: m.subcategory,
        colors: m.colors,
        sizes: m.sizes,
        material_type: m.material_type,
        weight: m.weight,
        finish: m.finish,
        description: m.description,
        vendor_url: m.vendor_url,
        is_verified: m.is_verified,
      })
      .eq("id", existing.id);
    if (error) {
      console.error(`  ❌ UPDATE ${m.slug}: ${error.message}`);
      failed++;
    } else {
      updated++;
    }
  } else {
    const { error } = await supabase.from("tying_materials").insert({
      brand: m.brand,
      name: m.name,
      category: m.category,
      subcategory: m.subcategory,
      colors: m.colors,
      sizes: m.sizes,
      material_type: m.material_type,
      weight: m.weight,
      finish: m.finish,
      description: m.description,
      vendor_url: m.vendor_url,
      is_verified: m.is_verified,
      slug: m.slug,
    });
    if (error) {
      console.error(`  ❌ INSERT ${m.slug}: ${error.message}`);
      failed++;
    } else {
      inserted++;
    }
  }
}

const { count } = await supabase
  .from("tying_materials")
  .select("*", { count: "exact", head: true });

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Inserted: ${inserted}`);
console.log(`  Updated:  ${updated}`);
console.log(`  Failed:   ${failed}`);
console.log(`  Total materials now: ${count}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
