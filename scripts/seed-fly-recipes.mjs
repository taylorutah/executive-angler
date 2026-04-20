// Seed fly_recipe_ingredients for all 120 canonical flies.
// Each recipe is curated from common tying conventions; material_name is
// authoritative text shown in the UI, matcher is used to find a material_id
// in tying_materials when possible (for inventory owned-flag integration).
//
// Run: node scripts/seed-fly-recipes.mjs
//
// Idempotent: deletes existing canonical_fly rows in fly_recipe_ingredients
// before re-inserting.

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

// ── Ingredient helpers ───────────────────────────────────────────
// Each ingredient: { role, material_name, category?, keywords?[], optional? }
function ing(role, material_name, category, keywords = [], opts = {}) {
  return {
    role,
    material_name,
    category,
    keywords: Array.isArray(keywords) ? keywords : [keywords],
    is_optional: !!opts.optional,
    color_choice: opts.color_choice || null,
    size_choice: opts.size_choice || null,
    quantity: opts.quantity || null,
    notes: opts.notes || null,
  };
}

// Common ingredient generators
const HOOK = (name, keywords = [], size) =>
  ing("hook", name, "hook", keywords, { size_choice: size });
const THREAD = (color) =>
  ing("thread", `${color} tying thread 8/0 or 70 denier`, "thread", [color.toLowerCase(), "8/0", "70d"]);
const BEAD_TUNGSTEN = (color = "Gold", size) =>
  ing("bead", `Tungsten bead ${size} ${color}`, "bead", ["tungsten", color.toLowerCase(), size], { size_choice: size, color_choice: color });
const BEAD_BRASS = (color = "Gold") =>
  ing("bead", `Brass bead ${color}`, "bead", ["brass", color.toLowerCase()]);
const DUBBING = (name, keywords = []) =>
  ing("body", name, "dubbing", keywords);
const HACKLE = (color = "Brown", keywords = ["hackle"]) =>
  ing("hackle", `${color} dry-fly hackle`, "feather", [color.toLowerCase(), ...keywords]);
const HEN_HACKLE = (color = "Brown") =>
  ing("hackle", `${color} hen hackle`, "feather", ["hen", color.toLowerCase()]);
const RIBBING = (name, keywords) =>
  ing("ribbing", name, "ribbing", keywords);
const WIRE = (color = "Copper", size = "small") =>
  ing("ribbing", `${color} wire ${size}`, "wire", [color.toLowerCase(), size]);
const FLASH = (name, keywords) =>
  ing("flash", name, "flash", keywords);
const FOAM = (color = "Black", size = "2mm") =>
  ing("body", `${size} ${color} foam`, "foam", ["foam", color.toLowerCase(), size], { color_choice: color, size_choice: size });
const TAIL = (name, keywords = []) =>
  ing("tail", name, null, keywords);
const WING = (name, keywords = []) =>
  ing("wing", name, null, keywords);
const EYES_LEAD = () => ing("eye", "Dumbbell lead eyes", "eye", ["dumbbell", "lead"]);
const EYES_BEAD_CHAIN = () => ing("eye", "Bead chain eyes", "eye", ["bead chain"]);
const CHENILLE = (color = "Olive", keywords = []) =>
  ing("body", `${color} chenille`, "chenille", [color.toLowerCase(), ...keywords], { color_choice: color });
const RUBBER_LEGS = (color = "Black") =>
  ing("rubber", `${color} rubber legs`, "rubber", ["rubber", color.toLowerCase()]);
const SCUD_BACK = (color = "Clear") =>
  ing("shellback", `${color} Scud Back`, "synthetic", ["scud back", color.toLowerCase()]);
const UV_RESIN = () =>
  ing("head", "UV cure resin", "resin", ["uv", "clear"], { optional: true });

// ── Templates per fly type ───────────────────────────────────────
function dryFly({ hook, hookKws, tail, body, bodyKws, hackle, wing }) {
  return [
    HOOK(hook || "Standard dry fly hook", hookKws || ["dry"], "#12–#18"),
    THREAD("Brown"),
    TAIL(tail, []),
    DUBBING(body, bodyKws || []),
    HACKLE(hackle || "Brown"),
    wing ? WING(wing, []) : null,
  ].filter(Boolean);
}

function parachuteDry({ body, bodyKws, hackle, post, tail }) {
  return [
    HOOK("Standard dry fly hook (TMC 100, Daiichi 1180)", ["dry", "tmc 100", "1180"], "#12–#18"),
    THREAD("Gray"),
    TAIL(tail || "Hackle fibers, grizzly or brown", []),
    WING(post || "White calf body or polypropylene yarn", ["post", "poly", "calf"]),
    DUBBING(body, bodyKws || []),
    HACKLE(hackle || "Grizzly", ["parachute"]),
  ];
}

function classicNymph({ hook, bead, tail, body, rib, thorax, wingCase, hackle }) {
  return [
    HOOK(hook || "Standard nymph hook (TMC 3761, Daiichi 1550)", ["nymph", "tmc 3761", "1550"], "#12–#18"),
    bead || ing("bead", "Gold tungsten bead, sized to hook", "bead", ["tungsten", "gold"], { optional: true }),
    THREAD("Black"),
    tail ? TAIL(tail, []) : null,
    body,
    rib || WIRE("Copper", "small"),
    wingCase ? ing("wingCase", wingCase, null, [], { optional: true }) : null,
    thorax ? DUBBING(thorax, []) : null,
    hackle ? HEN_HACKLE(hackle) : null,
  ].filter(Boolean);
}

function streamer({ hook, tail, body, flash, collar, head }) {
  return [
    HOOK(hook || "Streamer hook (TMC 5262, Daiichi 2220)", ["streamer", "tmc 5262", "2220"], "#2–#8"),
    THREAD("Black"),
    TAIL(tail, []),
    body,
    flash || FLASH("Flashabou Pearl", ["flashabou", "pearl"]),
    collar ? HACKLE(collar) : null,
    head ? ing("head", head, null, [], {}) : null,
  ].filter(Boolean);
}

function softHackle({ hook, thread, tag, body, hackle }) {
  return [
    HOOK(hook || "Wet fly hook (Daiichi 1550)", ["wet", "1550"], "#12–#16"),
    THREAD(thread || "Orange"),
    tag ? ing("tag", tag, null, [], {}) : null,
    body,
    ing("hackle", hackle, "feather", ["partridge", "starling", "hen"]),
  ].filter(Boolean);
}

function eggFly({ hook, body }) {
  return [
    HOOK(hook || "Egg hook (TMC 105, Daiichi 1130)", ["egg", "tmc 105", "1130"], "#10–#14"),
    THREAD("Red"),
    body,
  ];
}

function midge({ hook, bead, body, rib, thorax }) {
  return [
    HOOK(hook || "Midge hook (TMC 2488, Daiichi 1110)", ["midge", "tmc 2488", "1110"], "#18–#24"),
    bead || ing("bead", "Silver tungsten bead 1.5mm", "bead", ["tungsten", "silver", "1.5"], { optional: true }),
    THREAD("Black"),
    body,
    rib ? rib : null,
    thorax ? DUBBING(thorax, []) : null,
  ].filter(Boolean);
}

function terrestrial({ hook, body, legs, indicator, wing }) {
  return [
    HOOK(hook || "Dry fly / terrestrial hook (TMC 100, TMC 5212)", ["dry", "terrestrial", "tmc 100"], "#8–#14"),
    THREAD("Black"),
    body,
    legs ? RUBBER_LEGS(legs) : null,
    indicator ? ing("hotspot", indicator, "foam", ["foam", "orange"], { optional: true }) : null,
    wing ? WING(wing, []) : null,
  ].filter(Boolean);
}

// ── The recipes: slug → ingredient list ──────────────────────────
const RECIPES = {
  // ============ DRY FLIES (25) ============
  "adams": dryFly({
    tail: "Brown + grizzly hackle fibers",
    body: "Muskrat gray dubbing",
    bodyKws: ["muskrat", "gray"],
    hackle: "Brown & grizzly mixed",
    wing: "Grizzly hackle tips",
  }),
  "parachute-adams": parachuteDry({
    tail: "Brown & grizzly hackle fibers",
    body: "Adams gray dubbing",
    bodyKws: ["gray", "adams"],
    hackle: "Grizzly",
    post: "White calf body or poly yarn",
  }),
  "blue-dun": dryFly({
    tail: "Blue dun hackle fibers",
    body: "Blue/gray dubbing",
    bodyKws: ["blue", "gray"],
    hackle: "Blue dun",
    wing: "Dun hen hackle tips",
  }),
  "blue-winged-olive-comparadun": [
    HOOK("Standard dry fly hook (TMC 100)", ["dry", "tmc 100"], "#16–#20"),
    THREAD("Olive"),
    TAIL("Microfibbets, dun", ["microfibbet"]),
    WING("Comparadun deer hair, natural", ["deer", "comparadun"]),
    DUBBING("Olive BWO dubbing", ["olive", "bwo"]),
  ],
  "bwo-parachute": parachuteDry({
    tail: "Olive microfibbets",
    body: "Olive dubbing",
    bodyKws: ["olive"],
    hackle: "Blue dun",
    post: "White poly yarn",
  }),
  "callibaetis-cripple": [
    HOOK("Klinkhammer / emerger hook (TMC 2487)", ["emerger", "tmc 2487"], "#14–#18"),
    THREAD("Gray"),
    TAIL("Zelon shuck, gray", ["zelon", "shuck"]),
    DUBBING("Callibaetis gray dubbing", ["gray", "callibaetis"]),
    WING("Grizzly or dun hackle tips, spent", ["hackle", "grizzly"]),
    HACKLE("Grizzly"),
  ],
  "cdc-blue-winged-olive": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#18–#20"),
    THREAD("Olive"),
    TAIL("Microfibbets, dun", ["microfibbet"]),
    DUBBING("Olive superfine dubbing", ["olive", "superfine"]),
    WING("Natural dun CDC", ["cdc"]),
  ],
  "comparadun": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#12–#18"),
    THREAD("Tan"),
    TAIL("Microfibbets, tan", ["microfibbet"]),
    WING("Comparadun deer hair", ["deer", "comparadun"]),
    DUBBING("Sulphur or PMD dubbing", ["sulphur", "pmd"]),
  ],
  "elk-hair-caddis": [
    HOOK("Standard dry fly hook (TMC 100)", ["dry", "tmc 100"], "#12–#18"),
    THREAD("Tan"),
    DUBBING("Caddis tan dubbing", ["tan"]),
    HACKLE("Brown", ["palmered"]),
    WIRE("Gold", "small"),
    WING("Natural elk hair", ["elk"]),
  ],
  "goddard-caddis": [
    HOOK("Standard dry fly hook (TMC 100)", ["dry", "tmc 100"], "#10–#16"),
    THREAD("Tan"),
    ing("body", "Spun deer hair, clipped to shape", null, ["deer", "clipped"]),
    HACKLE("Brown"),
    ing("antennae", "Stripped brown hackle stems", null, [], { optional: true }),
  ],
  "green-drake": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#10–#12"),
    THREAD("Olive"),
    TAIL("Moose body hair", ["moose"]),
    DUBBING("Green drake olive dubbing", ["olive", "drake"]),
    HACKLE("Dun & olive grizzly mixed"),
    WING("Dark dun hackle tips", ["hackle tip"]),
  ],
  "griffiths-gnat": [
    HOOK("Midge/dry hook (TMC 100)", ["dry", "tmc 100", "midge"], "#18–#22"),
    THREAD("Black"),
    ing("body", "Peacock herl", null, ["peacock"]),
    HACKLE("Grizzly", ["palmered"]),
  ],
  "henrys-fork-hopper": [
    HOOK("Dry fly hook (TMC 5212)", ["dry", "hopper", "5212"], "#8–#12"),
    THREAD("Tan"),
    ing("body", "Yellow poly yarn wrapped", "synthetic", ["poly", "yellow"]),
    WING("Elk hair, tan", ["elk"]),
    HACKLE("Grizzly", ["palmered"]),
    ing("legs", "Knotted pheasant tail fibers", null, ["pheasant"], { optional: true }),
  ],
  "humpy": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#10–#16"),
    THREAD("Red"),
    TAIL("Moose or elk body hair", ["moose", "elk"]),
    ing("shellback", "Deer or elk hair back", null, ["deer", "elk"]),
    ing("body", "Red tying thread underbody", "thread", ["red"]),
    WING("Deer hair, tips forward", ["deer"]),
    HACKLE("Brown & grizzly mixed"),
  ],
  "march-brown": dryFly({
    tail: "Pheasant tail fibers",
    body: "Tan or amber dubbing",
    bodyKws: ["tan", "amber"],
    hackle: "Brown",
    wing: "Wood duck flank",
  }),
  "olive-thorax-dun": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#14–#18"),
    THREAD("Olive"),
    TAIL("Blue dun hackle fibers", []),
    DUBBING("Olive dubbing", ["olive"]),
    WING("Turkey flat, dun", ["turkey", "dun"]),
    HACKLE("Blue dun", ["thorax"]),
  ],
  "pale-morning-dun": dryFly({
    tail: "Light ginger hackle fibers",
    body: "PMD yellow/olive dubbing",
    bodyKws: ["pmd", "sulphur", "yellow"],
    hackle: "Light ginger",
    wing: "Light dun hackle tips",
  }),
  "quill-gordon": dryFly({
    tail: "Medium dun hackle fibers",
    body: "Stripped peacock quill",
    bodyKws: ["peacock"],
    hackle: "Medium dun",
    wing: "Wood duck flank",
  }),
  "royal-wulff": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#10–#16"),
    THREAD("Black"),
    TAIL("Moose or elk body hair", ["moose", "elk"]),
    ing("body", "Peacock herl / red floss / peacock herl", null, ["peacock", "red"]),
    WING("White calf body or calf tail", ["calf", "white"]),
    HACKLE("Brown & grizzly mixed"),
  ],
  "rusty-spinner": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#14–#20"),
    THREAD("Rusty brown"),
    TAIL("Microfibbets, dun, split", ["microfibbet"]),
    DUBBING("Rusty brown dubbing", ["rusty", "brown"]),
    WING("Poly yarn or hackle tips, spent", ["poly", "hackle"]),
  ],
  "sparkle-dun": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#14–#20"),
    THREAD("Tan"),
    TAIL("Zelon trailing shuck, amber", ["zelon", "shuck"]),
    WING("Comparadun deer hair", ["deer", "comparadun"]),
    DUBBING("PMD or BWO dubbing", ["pmd", "bwo"]),
  ],
  "stimulator": [
    HOOK("Stimulator / streamer-dry hook (TMC 200R)", ["200r", "stimulator"], "#8–#14"),
    THREAD("Orange"),
    TAIL("Elk hair", ["elk"]),
    ing("body", "Yellow or orange dubbing, palmered with brown hackle", "dubbing", ["yellow", "orange"]),
    HACKLE("Brown", ["palmered"]),
    WING("Elk hair, natural", ["elk"]),
    HACKLE("Grizzly", ["thorax", "palmered"]),
  ],
  "sulphur-dun": dryFly({
    tail: "Light dun or ginger hackle fibers",
    body: "Sulphur yellow dubbing",
    bodyKws: ["sulphur", "yellow"],
    hackle: "Light ginger",
    wing: "Light dun hackle tips",
  }),
  "trico-spinner": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#20–#24"),
    THREAD("Black"),
    TAIL("Microfibbets, white, split", ["microfibbet"]),
    DUBBING("Black superfine dubbing", ["black", "superfine"]),
    WING("White poly yarn, spent", ["poly", "white"]),
  ],
  "x-caddis": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#14–#18"),
    THREAD("Tan"),
    TAIL("Amber Zelon shuck", ["zelon", "amber"]),
    DUBBING("Caddis tan dubbing", ["tan"]),
    WING("Deer hair, light", ["deer"]),
  ],

  // ============ NYMPHS (38) ============
  "bead-head-caddis-pupa": classicNymph({
    bead: BEAD_TUNGSTEN("Gold", "2.5mm"),
    tail: null,
    body: DUBBING("Caddis green/olive dubbing", ["green", "olive"]),
    rib: WIRE("Gold", "small"),
    thorax: "Peacock herl or brown dubbing",
    hackle: "Brown",
  }),
  "blowtorch": [
    HOOK("Jig nymph hook (Hanak H400BL)", ["jig"], "#12–#16"),
    BEAD_TUNGSTEN("Copper", "3.3mm"),
    THREAD("Fluorescent orange"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pheasant tail fibers wrapped", null, ["pheasant"]),
    WIRE("Copper", "small"),
    ing("hotspot", "Orange thread collar behind bead", "thread", ["orange"]),
    DUBBING("Ice Dub UV Black (thorax)", ["ice dub", "black"]),
  ],
  "copper-john": [
    HOOK("Nymph hook (TMC 5262)", ["nymph", "tmc 5262"], "#12–#18"),
    BEAD_TUNGSTEN("Gold", "3.3mm"),
    THREAD("Black"),
    TAIL("Brown goose biots", ["biot", "brown"]),
    ing("body", "Copper wire, medium", "wire", ["copper", "medium"]),
    ing("wingCase", "Peacock herl over pearl Flashabou, epoxy over", null, ["peacock", "flashabou"]),
    DUBBING("Peacock dubbing (thorax)", ["peacock"]),
    ing("legs", "Hen back fibers", "feather", ["hen"], { optional: true }),
  ],
  "czech-nymph": [
    HOOK("Scud hook (TMC 2457)", ["scud", "2457"], "#10–#14"),
    BEAD_TUNGSTEN("Gold", "3.3mm", { optional: true }),
    THREAD("Brown"),
    DUBBING("Orange/brown SLF dubbing", ["slf", "orange", "brown"]),
    WIRE("Copper", "small"),
    SCUD_BACK("Clear"),
    ing("hotspot", "Hot pink or orange thread band", "thread", ["pink", "orange"], { optional: true }),
  ],
  "deep-sparrow-nymph": [
    HOOK("Wet/nymph hook (TMC 3761)", ["nymph", "3761"], "#10–#14"),
    BEAD_TUNGSTEN("Black Nickel", "3.3mm"),
    THREAD("Black"),
    TAIL("Pheasant rump fibers", ["pheasant"]),
    DUBBING("Peacock & black dubbing mix", ["peacock", "black"]),
    HEN_HACKLE("Brown partridge"),
  ],
  "duracell-jig": [
    HOOK("Jig nymph hook (Hanak H450)", ["jig"], "#12–#18"),
    BEAD_TUNGSTEN("Copper", "3.3mm"),
    THREAD("Brown"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Pheasant tail fibers", null, ["pheasant"]),
    WIRE("Copper", "small"),
    ing("hotspot", "UV Ice Dub (purple or blue) collar", "dubbing", ["ice dub", "uv"]),
  ],
  "flashback-hares-ear": [
    HOOK("Nymph hook (TMC 3761)", ["nymph", "3761"], "#12–#18"),
    BEAD_TUNGSTEN("Gold", "3.3mm", { optional: true }),
    THREAD("Brown"),
    TAIL("Partridge fibers or hare mask", ["partridge", "hare"]),
    DUBBING("Hare's ear dubbing", ["hare", "ear"]),
    WIRE("Gold", "small"),
    ing("wingCase", "Pearl Flashabou or Mylar", "flash", ["pearl", "flashabou", "mylar"]),
    DUBBING("Hare's ear dubbing, picked out (thorax)", ["hare", "ear"]),
  ],
  "frenchie": [
    HOOK("Jig nymph hook (TMC 403BLJ)", ["jig"], "#12–#18"),
    BEAD_TUNGSTEN("Gold", "3.3mm"),
    THREAD("Brown"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Pheasant tail fibers", null, ["pheasant"]),
    WIRE("Copper", "small"),
    ing("hotspot", "Pink or orange hot-spot dubbing", "dubbing", ["pink", "orange", "hot spot"]),
  ],
  "caddis-larva-green-rock-worm": [
    HOOK("Scud/caddis hook (TMC 2457)", ["scud", "2457"], "#12–#16"),
    BEAD_TUNGSTEN("Gold", "2.5mm", { optional: true }),
    THREAD("Olive"),
    DUBBING("Caddis green dubbing", ["caddis", "green"]),
    WIRE("Gold", "small"),
    DUBBING("Brown or black dubbing (thorax)", ["brown", "black"]),
  ],
  "hares-ear-nymph": [
    HOOK("Nymph hook (TMC 3761)", ["nymph", "3761"], "#12–#18"),
    BEAD_TUNGSTEN("Gold", "3.3mm", { optional: true }),
    THREAD("Brown"),
    TAIL("Hare's mask guard hairs", ["hare", "mask"]),
    DUBBING("Hare's ear dubbing", ["hare", "ear"]),
    WIRE("Gold", "small"),
    ing("wingCase", "Mottled turkey tail", null, ["turkey"]),
    DUBBING("Hare's ear dubbing, picked out (thorax)", ["hare"]),
  ],
  "iron-lotus": [
    HOOK("Jig nymph hook (Hanak H450)", ["jig"], "#14–#18"),
    BEAD_TUNGSTEN("Copper", "3.0mm"),
    THREAD("Rusty brown"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Stripped peacock quill, coated with UV resin", null, ["peacock", "quill"]),
    ing("wingCase", "Black Thin Skin or Mylar", "synthetic", ["thin skin", "black"]),
    DUBBING("Ice Dub UV Black (thorax)", ["ice dub", "black"]),
    UV_RESIN(),
  ],
  "jig-perdigon": [
    HOOK("Jig nymph hook (Hanak H400BL)", ["jig"], "#12–#18"),
    BEAD_TUNGSTEN("Silver", "3.3mm"),
    THREAD("Black or brown"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Pheasant tail or thread body, coated UV resin", null, ["pheasant", "thread"]),
    ing("wingCase", "Black or brown nail polish wing case", null, [], { optional: true }),
    UV_RESIN(),
  ],
  "jig-ptn": [
    HOOK("Jig nymph hook (Hanak H400BL)", ["jig"], "#12–#18"),
    BEAD_TUNGSTEN("Gold", "3.3mm"),
    THREAD("Brown"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pheasant tail fibers wrapped", null, ["pheasant"]),
    WIRE("Copper", "small"),
    DUBBING("Peacock or hare's ear dubbing (thorax)", ["peacock", "hare"]),
  ],
  "juju-baetis": [
    HOOK("Scud hook (TMC 2488 or 2457)", ["2488", "2457"], "#18–#22"),
    THREAD("Black"),
    TAIL("Brown microfibbets", ["microfibbet"]),
    ing("body", "Black & white Super Hair, epoxy coated", "synthetic", ["super hair"]),
    ing("wingCase", "Black Thin Skin", "synthetic", ["thin skin", "black"]),
    DUBBING("Black Ice Dub (thorax)", ["ice dub", "black"]),
    UV_RESIN(),
  ],
  "lightning-bug": [
    HOOK("Nymph hook (TMC 3761)", ["nymph", "3761"], "#14–#18"),
    BEAD_TUNGSTEN("Silver", "2.8mm"),
    THREAD("Black"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pearl Mylar tinsel", "ribbing", ["pearl", "mylar"]),
    WIRE("Silver", "small"),
    ing("wingCase", "Pearl Flashabou", "flash", ["pearl"]),
    DUBBING("Peacock herl (thorax)", ["peacock"]),
  ],
  "micro-mayfly": [
    HOOK("Jig hook (TMC 403BLJ)", ["jig"], "#16–#20"),
    BEAD_TUNGSTEN("Copper", "2.5mm"),
    THREAD("Brown"),
    TAIL("CDL fibers", ["cdl", "coq de leon"]),
    ing("body", "Stripped peacock quill", null, ["peacock"]),
    ing("wingCase", "Black Thin Skin", "synthetic", ["thin skin"]),
    DUBBING("Brown hot-spot collar", ["brown"]),
  ],
  "mop-fly": [
    HOOK("Jig or wet hook (TMC 2457)", ["jig", "2457"], "#10–#14"),
    BEAD_TUNGSTEN("Gold", "3.3mm"),
    THREAD("Tan or olive"),
    ing("body", "Mop fiber (microfiber mop strand)", "synthetic", ["mop"]),
    DUBBING("Hare's ear dubbing collar", ["hare"]),
  ],
  "partridge-and-green": softHackle({
    thread: "Green",
    tag: "Gold tinsel tag",
    body: "Green silk floss or Uni-floss",
    hackle: "Brown partridge",
  }),
  "soft-hackle-partridge-and-orange": softHackle({
    thread: "Orange",
    body: ing("body", "Orange silk floss", "thread", ["orange", "silk"]),
    hackle: "Brown partridge",
  }),
  "stonefly-nymph": [
    HOOK("3xl nymph hook (TMC 5263)", ["5263", "streamer"], "#4–#10"),
    THREAD("Brown"),
    TAIL("Brown goose biots", ["biot", "brown"]),
    ing("body", "Brown & tan variegated chenille", "chenille", ["variegated", "brown"]),
    RUBBER_LEGS("Brown"),
    ing("antennae", "Brown goose biots", null, [], { optional: true }),
  ],
  "perdigon": [
    HOOK("Jig nymph hook (Hanak H400BL)", ["jig"], "#14–#18"),
    BEAD_TUNGSTEN("Silver", "3.3mm"),
    THREAD("Brown or black"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Pheasant tail fibers, coated UV resin", null, ["pheasant"]),
    ing("hotspot", "Black or brown nail polish wing case", null, [], { optional: true }),
    UV_RESIN(),
  ],
  "pheasant-tail-nymph": [
    HOOK("Nymph hook (TMC 3761)", ["nymph", "3761"], "#14–#20"),
    BEAD_TUNGSTEN("Gold", "2.5mm", { optional: true }),
    THREAD("Brown"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pheasant tail fibers wrapped", null, ["pheasant"]),
    WIRE("Copper", "small"),
    ing("wingCase", "Pheasant tail fibers", null, ["pheasant"]),
    DUBBING("Peacock herl (thorax)", ["peacock"]),
  ],
  "cdc-pheasant-tail": [
    HOOK("Nymph hook (TMC 3761)", ["nymph", "3761"], "#14–#18"),
    BEAD_TUNGSTEN("Copper", "2.5mm"),
    THREAD("Brown"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pheasant tail fibers", null, ["pheasant"]),
    WIRE("Copper", "small"),
    ing("hackle", "Natural dun CDC collar", "feather", ["cdc"]),
  ],
  "polish-woven-nymph": [
    HOOK("Curved scud hook (TMC 2457)", ["scud", "2457"], "#10–#14"),
    BEAD_TUNGSTEN("Gold", "3.3mm"),
    THREAD("Brown"),
    ing("body", "Olive & cream woven floss or V-rib", "synthetic", ["floss", "v-rib"]),
    DUBBING("Hare's ear dubbing (thorax)", ["hare"]),
  ],
  "prince-nymph": [
    HOOK("Nymph hook (TMC 5263)", ["5263"], "#12–#16"),
    BEAD_TUNGSTEN("Gold", "3.3mm", { optional: true }),
    THREAD("Black"),
    TAIL("Brown goose biots", ["biot", "brown"]),
    ing("body", "Peacock herl", null, ["peacock"]),
    WIRE("Gold", "small"),
    HEN_HACKLE("Brown"),
    WING("White goose biots, split V", ["biot", "white"]),
  ],
  "quasimodo-pheasant-tail": [
    HOOK("Jig nymph hook", ["jig"], "#14–#18"),
    BEAD_TUNGSTEN("Black Nickel", "3.0mm"),
    THREAD("Black"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Pheasant tail fibers", null, ["pheasant"]),
    WIRE("Copper", "small"),
    ing("hotspot", "Red holographic tinsel band", "flash", ["red", "holographic"]),
    DUBBING("Black Ice Dub (thorax)", ["ice dub", "black"]),
  ],
  "rainbow-warrior": [
    HOOK("Nymph hook (TMC 2488)", ["2488"], "#16–#20"),
    BEAD_TUNGSTEN("Silver", "2.3mm"),
    THREAD("Red"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pearl Mylar or pearl tinsel", "ribbing", ["pearl"]),
    DUBBING("Rainbow Sow-Scud dubbing (thorax)", ["sow scud", "rainbow"]),
  ],
  "san-juan-worm": [
    HOOK("Scud hook (TMC 2457)", ["scud", "2457"], "#10–#14"),
    THREAD("Red"),
    ing("body", "Red ultra chenille or micro chenille", "chenille", ["red", "micro"]),
  ],
  "scud-pattern": [
    HOOK("Scud hook (TMC 2457)", ["scud", "2457"], "#12–#18"),
    BEAD_TUNGSTEN("Gold", "2.5mm", { optional: true }),
    THREAD("Olive"),
    TAIL("Partridge or mallard fibers", ["partridge"]),
    DUBBING("Scud olive/pink/orange dubbing", ["scud", "olive"]),
    WIRE("Gold", "small"),
    SCUD_BACK("Clear"),
  ],
  "sexy-walts-worm": [
    HOOK("Jig nymph hook", ["jig"], "#12–#16"),
    BEAD_TUNGSTEN("Gold", "3.3mm"),
    THREAD("Brown"),
    DUBBING("Hare's ear dubbing", ["hare"]),
    WIRE("Copper", "small"),
    ing("hotspot", "Pearl Mylar tinsel belly strip", "ribbing", ["pearl"]),
    ing("hotspot", "Red or orange thread hot-spot", "thread", ["red", "orange"]),
  ],
  "sow-bug": [
    HOOK("Scud hook (TMC 2457)", ["scud", "2457"], "#14–#18"),
    BEAD_TUNGSTEN("Gold", "2.3mm", { optional: true }),
    THREAD("Gray"),
    DUBBING("Sow-Scud gray dubbing", ["sow scud", "gray"]),
    WIRE("Silver", "small"),
    SCUD_BACK("Clear"),
  ],
  "squirmy-wormy": [
    HOOK("Jig or scud hook", ["jig", "scud"], "#10–#14"),
    BEAD_TUNGSTEN("Pink", "3.3mm", { optional: true }),
    THREAD("Pink"),
    ing("body", "Squirmy Wormy material (pink, red, or worm brown)", "synthetic", ["squirmy"]),
  ],
  "squirrel-nymph": [
    HOOK("Nymph hook (TMC 3761)", ["nymph", "3761"], "#10–#16"),
    BEAD_TUNGSTEN("Gold", "3.3mm", { optional: true }),
    THREAD("Black"),
    TAIL("Squirrel tail guard hairs", ["squirrel"]),
    DUBBING("Pine squirrel dubbing", ["squirrel"]),
    WIRE("Gold", "small"),
    DUBBING("Squirrel dubbing, picked out (thorax)", ["squirrel"]),
  ],
  "surveyor": [
    HOOK("Jig nymph hook", ["jig"], "#14–#18"),
    BEAD_TUNGSTEN("Copper", "3.0mm"),
    THREAD("Brown"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    ing("body", "Pheasant tail, UV resin coated", null, ["pheasant"]),
    ing("hotspot", "Orange thread hot-spot", "thread", ["orange"]),
    UV_RESIN(),
  ],
  "tungsten-jig-hares-ear": [
    HOOK("Jig nymph hook", ["jig"], "#12–#16"),
    BEAD_TUNGSTEN("Copper", "3.3mm"),
    THREAD("Brown"),
    TAIL("Hare's mask fibers", ["hare"]),
    DUBBING("Hare's ear dubbing", ["hare"]),
    WIRE("Copper", "small"),
    DUBBING("Hare's ear picked out (thorax)", ["hare"]),
  ],
  "tungsten-torpedo": [
    HOOK("Jig nymph hook", ["jig"], "#14–#18"),
    BEAD_TUNGSTEN("Silver", "3.3mm"),
    THREAD("Black"),
    TAIL("Coq de Leon fibers", ["coq de leon", "cdl"]),
    ing("body", "Pearl Mylar tinsel, UV resin coated", "ribbing", ["pearl"]),
    ing("hotspot", "Red or orange thread band", "thread", ["red", "orange"]),
    UV_RESIN(),
  ],
  "twenty-incher": [
    HOOK("3xl nymph hook (TMC 5263)", ["5263"], "#6–#10"),
    BEAD_TUNGSTEN("Gold", "3.8mm", { optional: true }),
    THREAD("Brown"),
    TAIL("Brown goose biots", ["biot", "brown"]),
    ing("body", "Peacock herl ribbed with copper wire", null, ["peacock"]),
    WIRE("Copper", "medium"),
    ing("wingCase", "Turkey tail", null, ["turkey"]),
    DUBBING("Peacock herl (thorax)", ["peacock"]),
    HEN_HACKLE("Brown"),
  ],
  "two-bit-hooker": [
    HOOK("Jig nymph hook (TMC 403BLJ)", ["jig"], "#14–#18"),
    BEAD_TUNGSTEN("Copper", "2.5mm"),
    BEAD_TUNGSTEN("Copper", "2.3mm"),
    THREAD("Brown"),
    TAIL("Coq de Leon fibers", ["cdl"]),
    ing("body", "Pheasant tail fibers", null, ["pheasant"]),
    WIRE("Copper", "small"),
    DUBBING("Black peacock Ice Dub (thorax)", ["ice dub", "black"]),
  ],
  "walt-s-worm": [
    HOOK("Nymph hook (TMC 3761)", ["3761"], "#10–#16"),
    BEAD_TUNGSTEN("Gold", "3.3mm", { optional: true }),
    THREAD("Tan"),
    DUBBING("Hare's ear dubbing", ["hare", "ear"]),
    WIRE("Copper", "small", { optional: true }),
  ],

  // ============ EMERGERS (14) ============
  "barrs-emerger": [
    HOOK("Emerger hook (TMC 2487)", ["emerger", "2487"], "#16–#20"),
    THREAD("Olive"),
    TAIL("Brown hackle fibers or microfibbets", []),
    DUBBING("Olive BWO dubbing", ["olive"]),
    ing("wingCase", "Pearl Flashabou", "flash", ["pearl"]),
    DUBBING("Dark brown dubbing (thorax)", ["brown"]),
    HEN_HACKLE("Brown", ["hen", "legs"]),
  ],
  "bwo-loop-wing-emerger": [
    HOOK("Emerger hook (TMC 2487)", ["emerger", "2487"], "#18–#20"),
    THREAD("Olive"),
    TAIL("Olive Zelon shuck", ["zelon"]),
    DUBBING("Olive dubbing", ["olive"]),
    WING("Dun CDC or snowshoe, looped", ["cdc", "snowshoe"]),
    DUBBING("Olive dubbing (thorax)", ["olive"]),
  ],
  "cdc-emerger": [
    HOOK("Emerger hook (TMC 2487)", ["emerger", "2487"], "#16–#20"),
    THREAD("Color to match body"),
    TAIL("Zelon trailing shuck", ["zelon"]),
    DUBBING("Mayfly dubbing (color to match)", []),
    WING("CDC natural dun, tied over", ["cdc"]),
  ],
  "emerging-caddis-pupa": [
    HOOK("Scud/emerger hook (TMC 2457)", ["2457"], "#14–#18"),
    BEAD_TUNGSTEN("Gold", "2.5mm", { optional: true }),
    THREAD("Olive"),
    DUBBING("Caddis green dubbing", ["caddis", "green"]),
    WIRE("Gold", "small"),
    WING("Natural CDC, tied over", ["cdc"]),
    DUBBING("Brown dubbing (thorax)", ["brown"]),
  ],
  "film-critic": [
    HOOK("Emerger hook (TMC 2487)", ["2487"], "#16–#20"),
    THREAD("Olive"),
    TAIL("Amber Zelon shuck", ["zelon"]),
    DUBBING("Olive superfine dubbing", ["olive"]),
    WING("Natural dun CDC and deer hair, looped", ["cdc", "deer"]),
    HACKLE("Dun grizzly"),
  ],
  "klinkhammer-special": [
    HOOK("Klinkhammer hook (TMC 2487)", ["klink", "2487"], "#12–#18"),
    THREAD("Tan"),
    ing("body", "Fine olive or tan Antron dubbing", "dubbing", ["antron"]),
    WING("White poly yarn post", ["poly", "post"]),
    HACKLE("Blue dun parachute", ["parachute"]),
    DUBBING("Peacock herl (thorax)", ["peacock"]),
  ],
  "last-chance-cripple": [
    HOOK("Emerger hook (TMC 2487)", ["2487"], "#16–#20"),
    THREAD("Olive or rusty"),
    TAIL("Partridge fibers, trailing shuck", ["partridge"]),
    DUBBING("Rusty or olive dubbing", ["rusty", "olive"]),
    WING("Light dun Z-Lon or poly", ["zelon", "poly"]),
    HACKLE("Blue dun"),
  ],
  "pmd-emerger": [
    HOOK("Emerger hook (TMC 2487)", ["2487"], "#16–#18"),
    THREAD("Yellow"),
    TAIL("Zelon amber shuck", ["zelon"]),
    DUBBING("PMD yellow/olive dubbing", ["pmd", "yellow"]),
    WING("Natural dun CDC", ["cdc"]),
  ],
  "quigley-cripple": [
    HOOK("Emerger hook (TMC 2487)", ["2487"], "#14–#18"),
    THREAD("Tan"),
    TAIL("Marabou fibers as shuck", ["marabou"]),
    DUBBING("Light tan dubbing", ["tan"]),
    WING("Deer hair, tied forward", ["deer"]),
    HACKLE("Grizzly"),
  ],
  "rs2": [
    HOOK("Emerger hook (TMC 2488)", ["2488"], "#18–#22"),
    THREAD("Gray or olive"),
    TAIL("Brown microfibbets, split", ["microfibbet"]),
    DUBBING("Adams gray or olive dubbing", ["gray", "olive"]),
    WING("White or dun CDC / snowshoe", ["cdc", "snowshoe"]),
  ],
  "snowshoe-baetis-emerger": [
    HOOK("Emerger hook (TMC 2488)", ["2488"], "#18–#20"),
    THREAD("Olive"),
    TAIL("Olive Zelon shuck", ["zelon"]),
    DUBBING("Olive superfine dubbing", ["olive"]),
    WING("Natural snowshoe rabbit foot", ["snowshoe"]),
  ],
  "snowshoe-emerger": [
    HOOK("Emerger hook (TMC 2487)", ["2487"], "#14–#18"),
    THREAD("Tan or olive"),
    TAIL("Zelon shuck", ["zelon"]),
    DUBBING("Mayfly dubbing, color to match", []),
    WING("Snowshoe rabbit foot", ["snowshoe"]),
  ],
  "spotlight-emerger": [
    HOOK("Emerger hook (TMC 2487)", ["2487"], "#16–#20"),
    THREAD("Olive or brown"),
    TAIL("Amber Zelon shuck", ["zelon"]),
    DUBBING("Olive or brown dubbing", ["olive"]),
    WING("White high-vis poly yarn (spotlight)", ["poly", "white"]),
    HACKLE("Dun grizzly"),
  ],
  "matthews-sparkle-emerger": [
    HOOK("Scud/emerger hook (TMC 2457)", ["2457"], "#14–#18"),
    THREAD("Olive"),
    ing("body", "Olive Antron or sparkle yarn (shuck)", "synthetic", ["antron", "sparkle"]),
    DUBBING("Caddis olive dubbing", ["caddis", "olive"]),
    WING("Light deer hair, tented", ["deer"]),
  ],

  // ============ STREAMERS (15) ============
  "autumn-splendor": [
    HOOK("Streamer hook (TMC 5263)", ["5263"], "#2–#6"),
    EYES_BEAD_CHAIN(),
    THREAD("Orange"),
    TAIL("Orange marabou", ["marabou"]),
    ing("body", "Orange cactus chenille", "chenille", ["orange"]),
    FLASH("Copper Flashabou", ["copper", "flashabou"]),
    HACKLE("Yellow schlappen", ["schlappen"]),
    HACKLE("Grizzly schlappen, dyed yellow", ["schlappen", "grizzly"]),
  ],
  "barely-legal": [
    HOOK("Articulated streamer hooks, front & rear (Gamakatsu B10S)", ["streamer", "articulated", "b10s"], "#2"),
    THREAD("White"),
    TAIL("White marabou + pearl Flashabou", ["marabou", "pearl"]),
    ing("body", "Pearl Ice Dub wrapped and schlappen collar", "dubbing", ["ice dub", "pearl"]),
    FLASH("Pearl Flashabou", ["pearl", "flashabou"]),
    HACKLE("White schlappen collar", ["schlappen"]),
    EYES_LEAD(),
  ],
  "circus-peanut": [
    HOOK("Articulated streamer hooks (Gamakatsu B10S)", ["streamer", "b10s"], "#2"),
    THREAD("Brown or olive"),
    TAIL("Olive marabou, rear hook", ["marabou"]),
    ing("body", "Olive & copper cactus chenille", "chenille", ["olive", "copper"]),
    RUBBER_LEGS("Brown/Olive"),
    HACKLE("Brown schlappen collar", ["schlappen"]),
    EYES_LEAD(),
  ],
  "clouser-minnow-trout": [
    HOOK("Streamer hook (Mustad 3366 or TMC 5263)", ["5263", "streamer"], "#4–#8"),
    EYES_LEAD(),
    THREAD("White"),
    TAIL(null, []), // Clousers don't have a tail
    ing("body", "Bucktail white belly + chartreuse back", "synthetic", ["bucktail"]),
    FLASH("Pearl Krystal Flash", ["krystal flash", "pearl"]),
  ].filter(Boolean),
  "double-bunny": [
    HOOK("Streamer hook (TMC 5263)", ["5263"], "#2–#6"),
    EYES_LEAD(),
    THREAD("Olive"),
    ing("body", "Two rabbit strips laminated, belly & back", null, ["zonker", "rabbit"]),
    FLASH("Olive Flashabou", ["olive", "flashabou"]),
    RUBBER_LEGS("Olive/Black"),
  ],
  "home-invader": [
    HOOK("Articulated streamer hooks", ["streamer", "articulated"], "#2"),
    THREAD("Black"),
    TAIL("Marabou + Flashabou", ["marabou"]),
    ing("body", "Pine squirrel zonker strip, palmered", null, ["zonker", "squirrel"]),
    FLASH("Pearl Flashabou", ["pearl", "flashabou"]),
    HACKLE("Grizzly schlappen collar", ["schlappen", "grizzly"]),
    EYES_LEAD(),
  ],
  "kreelex": [
    HOOK("Streamer hook (TMC 5263)", ["5263"], "#2–#6"),
    EYES_LEAD(),
    THREAD("Red"),
    ing("body", "Gold & silver Flashabou, layered", "flash", ["flashabou", "gold", "silver"]),
  ],
  "meat-whistle": [
    HOOK("Jig streamer hook (Gamakatsu B10S or 60° jig)", ["jig", "b10s"], "#2–#4"),
    BEAD_TUNGSTEN("Copper", "5.5mm"),
    THREAD("Brown"),
    TAIL("Brown marabou + Flashabou", ["marabou"]),
    ing("body", "Brown rabbit strip, palmered", null, ["rabbit", "zonker"]),
    RUBBER_LEGS("Brown"),
  ],
  "muddler-minnow": [
    HOOK("Streamer hook (TMC 5263)", ["5263"], "#4–#10"),
    THREAD("Brown"),
    TAIL("Turkey quill slips", ["turkey"]),
    ing("body", "Gold Mylar tinsel", "ribbing", ["mylar", "gold"]),
    WING("Gray squirrel tail + turkey quill", ["squirrel", "turkey"]),
    ing("head", "Natural deer hair, spun & clipped", null, ["deer"]),
  ],
  "olive-bugger": [
    HOOK("Streamer hook (TMC 5262)", ["5262"], "#6–#10"),
    BEAD_TUNGSTEN("Gold", "3.8mm", { optional: true }),
    THREAD("Olive"),
    TAIL("Olive marabou", ["marabou"]),
    FLASH("Pearl Krystal Flash", ["krystal flash", "pearl"]),
    ing("body", "Olive chenille", "chenille", ["olive"]),
    HACKLE("Olive or grizzly", ["palmered"]),
  ],
  "sculpzilla": [
    HOOK("Articulated streamer hooks", ["articulated", "streamer"], "#4"),
    EYES_LEAD(),
    THREAD("Olive"),
    TAIL("Olive marabou, rear hook", ["marabou"]),
    ing("body", "Sculpin Helmet head + pine squirrel collar", "synthetic", ["sculpin", "squirrel"]),
    FLASH("Copper Flashabou", ["flashabou"]),
  ],
  "sex-dungeon": [
    HOOK("Articulated streamer hooks (Gamakatsu B10S)", ["articulated", "b10s"], "#2"),
    THREAD("Olive or brown"),
    TAIL("Olive marabou + Flashabou", ["marabou"]),
    ing("body", "Olive cross-cut rabbit strip, palmered", null, ["rabbit", "zonker"]),
    RUBBER_LEGS("Olive"),
    HACKLE("Schlappen collar, olive", ["schlappen"]),
    EYES_LEAD(),
  ],
  "slumpbuster": [
    HOOK("Streamer hook (TMC 5263)", ["5263"], "#4–#8"),
    BEAD_TUNGSTEN("Black", "4.6mm"),
    THREAD("Black"),
    ing("body", "Pine squirrel zonker strip, wound as body", null, ["squirrel", "zonker"]),
    FLASH("Pearl Flashabou", ["flashabou", "pearl"]),
  ],
  "woolly-bugger": [
    HOOK("Streamer hook (TMC 5262)", ["5262"], "#6–#10"),
    BEAD_TUNGSTEN("Gold", "3.8mm", { optional: true }),
    THREAD("Black"),
    TAIL("Black marabou", ["marabou"]),
    FLASH("Pearl Krystal Flash", ["krystal flash", "pearl"]),
    ing("body", "Black chenille", "chenille", ["black"]),
    HACKLE("Black saddle hackle", ["palmered", "saddle"]),
  ],
  "zonker": [
    HOOK("Streamer hook (TMC 5263)", ["5263"], "#4–#8"),
    THREAD("Red"),
    ing("body", "Silver Mylar tubing", "ribbing", ["mylar", "silver"]),
    WING("Natural rabbit zonker strip", ["zonker", "rabbit"]),
    EYES_BEAD_CHAIN(),
  ],

  // ============ WET FLIES (10) ============
  "black-spider": softHackle({
    thread: "Black",
    body: ing("body", "Black silk floss or tying thread", "thread", ["black", "silk"]),
    hackle: "Starling neck hackle",
  }),
  "carey-special": [
    HOOK("Wet fly hook (TMC 5263)", ["5263", "wet"], "#6–#10"),
    THREAD("Brown"),
    TAIL("Pheasant rump fibers", ["pheasant"]),
    ing("body", "Peacock herl", null, ["peacock"]),
    HEN_HACKLE("Brown pheasant rump", ["pheasant"]),
  ],
  "leadwing-coachman": [
    HOOK("Wet fly hook (Daiichi 1550)", ["1550", "wet"], "#10–#14"),
    THREAD("Black"),
    ing("body", "Peacock herl", null, ["peacock"]),
    WIRE("Gold", "small"),
    WING("Gray duck quill slips", ["duck", "quill"]),
    HEN_HACKLE("Brown"),
  ],
  "march-brown-wet": [
    HOOK("Wet fly hook", ["wet", "1550"], "#10–#14"),
    THREAD("Brown"),
    TAIL("Pheasant tail fibers", ["pheasant"]),
    DUBBING("Brown/tan dubbing", ["brown", "tan"]),
    WIRE("Gold", "small"),
    WING("Hen pheasant or turkey quill", ["pheasant", "turkey"]),
    HEN_HACKLE("Brown partridge"),
  ],
  "partridge-and-green": softHackle({
    thread: "Green",
    body: ing("body", "Green silk floss", "thread", ["green", "silk"]),
    hackle: "Brown partridge",
  }),
  "picket-pin": [
    HOOK("Wet fly hook (Daiichi 1550)", ["1550"], "#8–#12"),
    THREAD("Black"),
    TAIL("Brown hackle fibers", []),
    ing("body", "Peacock herl", null, ["peacock"]),
    HACKLE("Brown", ["palmered"]),
    WING("Gray squirrel tail", ["squirrel"]),
    ing("head", "Peacock herl", null, ["peacock"]),
  ],
  "soft-hackle-hares-ear": softHackle({
    thread: "Brown",
    body: DUBBING("Hare's ear dubbing", ["hare", "ear"]),
    hackle: "Brown partridge",
  }),
  "soft-hackle-pheasant-tail": softHackle({
    thread: "Brown",
    body: ing("body", "Pheasant tail fibers", null, ["pheasant"]),
    hackle: "Brown partridge",
  }),
  "starling-and-herl": softHackle({
    thread: "Black",
    body: ing("body", "Peacock herl", null, ["peacock"]),
    hackle: "Starling hackle",
  }),
  "woolly-worm": [
    HOOK("Wet fly hook (TMC 5263)", ["5263"], "#8–#12"),
    THREAD("Black"),
    TAIL("Red yarn or hackle fibers", ["yarn", "red"]),
    ing("body", "Black chenille", "chenille", ["black"]),
    HACKLE("Grizzly", ["palmered"]),
  ],

  // ============ EGGS (6) ============
  "blood-dot-egg": eggFly({
    body: ing("body", "Pink egg yarn with red center spot", "synthetic", ["egg yarn", "pink"]),
  }),
  "egg-pattern": eggFly({
    body: ing("body", "Pink or peach egg yarn (McFly Foam)", "synthetic", ["egg yarn", "pink", "peach"]),
  }),
  "glo-bug": eggFly({
    body: ing("body", "Chartreuse or peach egg yarn (Glo-Bug yarn)", "synthetic", ["egg yarn", "chartreuse"]),
  }),
  "nuke-egg": [
    HOOK("Egg hook (TMC 105)", ["egg"], "#10–#14"),
    THREAD("Red"),
    ing("body", "Orange egg yarn with white veil over top", "synthetic", ["egg yarn"]),
  ],
  "sucker-spawn": [
    HOOK("Egg hook (TMC 105)", ["egg"], "#10–#14"),
    THREAD("Pink"),
    ing("body", "Pink Angora yarn, looped in sequential loops", "synthetic", ["yarn", "pink"]),
  ],
  "y2k-bug": [
    HOOK("Egg hook (TMC 105)", ["egg"], "#10–#14"),
    THREAD("Fire orange"),
    ing("body", "Chartreuse egg yarn bottom, orange over top", "synthetic", ["egg yarn"]),
  ],

  // ============ TERRESTRIALS (8) ============
  "chernobyl-ant": terrestrial({
    body: FOAM("Tan", "2mm"),
    legs: "Brown",
    indicator: "Orange foam indicator",
  }),
  "daves-hopper": [
    HOOK("Dry fly hook (TMC 5212)", ["5212"], "#8–#12"),
    THREAD("Yellow"),
    TAIL("Red calf tail", ["calf"]),
    ing("body", "Yellow wool yarn", "synthetic", ["yarn", "yellow"]),
    HACKLE("Brown", ["palmered"]),
    WING("Turkey quill, mottled", ["turkey"]),
    ing("legs", "Knotted pheasant tail fibers", null, ["pheasant"]),
    ing("head", "Natural deer hair, spun & clipped", null, ["deer"]),
  ],
  "flying-ant": terrestrial({
    body: FOAM("Black", "2mm"),
    legs: "Black",
    wing: "Clear web wing or CDC",
  }),
  "foam-ant": terrestrial({
    body: FOAM("Black", "2mm"),
    legs: "Black",
    indicator: "Orange foam indicator",
  }),
  "foam-beetle": [
    HOOK("Dry fly hook (TMC 100)", ["dry", "tmc 100"], "#12–#16"),
    THREAD("Black"),
    ing("body", "Peacock herl underbody", null, ["peacock"]),
    ing("shellback", "Black 2mm foam", "foam", ["foam", "black"]),
    RUBBER_LEGS("Black"),
    ing("hotspot", "Orange indicator foam", "foam", ["foam", "orange"], { optional: true }),
  ],
  "inchworm": [
    HOOK("Dry fly hook (TMC 2488)", ["2488"], "#12–#14"),
    THREAD("Chartreuse"),
    ing("body", "Chartreuse foam wrapped as body", "foam", ["chartreuse"]),
  ],
  "letort-cricket": [
    HOOK("Dry fly hook (TMC 5212)", ["5212"], "#10–#14"),
    THREAD("Black"),
    ing("body", "Black dubbing", "dubbing", ["black"]),
    WING("Black goose quill slip", ["quill", "black"]),
    ing("head", "Dark deer hair, spun & clipped", null, ["deer"]),
  ],
  "parachute-hopper": [
    HOOK("Dry fly hook (TMC 5212)", ["5212"], "#8–#14"),
    THREAD("Tan"),
    DUBBING("Tan dubbing", ["tan"]),
    WING("Elk hair", ["elk"]),
    ing("legs", "Knotted pheasant tail fibers", null, ["pheasant"]),
    WING("White poly yarn post", ["poly", "white"]),
    HACKLE("Grizzly parachute", ["parachute"]),
  ],

  // ============ MIDGES (4) ============
  "midge-larva": [
    HOOK("Midge hook (TMC 2488)", ["2488"], "#18–#22"),
    THREAD("Red or black"),
    ing("body", "Tying thread wrapped smooth", "thread", []),
    WIRE("Silver", "extra-small"),
  ],
  "thread-midge": [
    HOOK("Midge hook (TMC 2488)", ["2488"], "#20–#24"),
    THREAD("Black"),
    ing("body", "Tying thread wrapped, UV resin coated", "thread", []),
    WIRE("Silver", "extra-small", { optional: true }),
    UV_RESIN(),
  ],
  "top-secret-midge": [
    HOOK("Midge hook (TMC 2488)", ["2488"], "#20–#24"),
    THREAD("Black"),
    TAIL("White Antron as shuck", ["antron", "white"]),
    ing("body", "Black thread, UV resin coated", "thread", ["black"]),
    WIRE("White or silver", "extra-small"),
    DUBBING("Black Ice Dub (thorax)", ["ice dub", "black"]),
    UV_RESIN(),
  ],
  "zebra-midge": [
    HOOK("Midge hook (TMC 2488)", ["2488"], "#18–#22"),
    BEAD_TUNGSTEN("Silver", "1.5mm"),
    THREAD("Black"),
    ing("body", "Black tying thread, smooth", "thread", ["black"]),
    WIRE("Silver", "extra-small"),
  ],
};

// ── Material matching ────────────────────────────────────────────
function bestMaterialMatch(materials, ing) {
  if (!ing.category || !ing.keywords || ing.keywords.length === 0) return null;
  const pool = materials.filter(m => m.category === ing.category);
  if (pool.length === 0) return null;

  let best = null;
  let bestScore = 0;
  for (const m of pool) {
    const haystack = `${m.name} ${m.brand || ""}`.toLowerCase();
    let score = 0;
    for (const kw of ing.keywords) {
      if (kw && haystack.includes(String(kw).toLowerCase())) score++;
    }
    if (score > bestScore) {
      best = m;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching canonical flies + materials...");
  const { data: flies } = await supabase
    .from("canonical_flies")
    .select("id, slug, name");
  const { data: materials } = await supabase
    .from("tying_materials")
    .select("id, name, brand, category");

  console.log(`${flies.length} canonical flies, ${materials.length} materials`);

  // Clear existing canonical recipe rows
  console.log("Clearing existing canonical fly_recipe_ingredients rows...");
  const { error: delErr } = await supabase
    .from("fly_recipe_ingredients")
    .delete()
    .not("canonical_fly_id", "is", null);
  if (delErr) {
    console.error("Delete error:", delErr);
    process.exit(1);
  }

  let totalRows = 0;
  let matchedRows = 0;
  let missingRecipes = [];
  let inserts = [];

  for (const fly of flies) {
    const recipe = RECIPES[fly.slug];
    if (!recipe) {
      missingRecipes.push(fly.slug);
      continue;
    }
    recipe.forEach((ingredient, idx) => {
      const match = bestMaterialMatch(materials, ingredient);
      if (match) matchedRows++;
      totalRows++;
      inserts.push({
        canonical_fly_id: fly.id,
        fly_pattern_id: null,
        material_id: match?.id || null,
        material_name: ingredient.material_name,
        step_position: idx + 1,
        role: ingredient.role,
        quantity: ingredient.quantity,
        notes: ingredient.notes,
        color_choice: ingredient.color_choice,
        size_choice: ingredient.size_choice,
        is_optional: ingredient.is_optional,
      });
    });
  }

  console.log(`\nPrepared ${inserts.length} ingredient rows across ${flies.length - missingRecipes.length} flies.`);
  console.log(`Material match rate: ${matchedRows}/${totalRows} = ${Math.round((matchedRows/totalRows)*100)}%`);
  if (missingRecipes.length > 0) {
    console.log(`\nFlies without a defined recipe (${missingRecipes.length}):`);
    missingRecipes.forEach(s => console.log(`  - ${s}`));
  }

  // Batch insert (500 per call to keep under payload limits)
  console.log("\nInserting rows...");
  const batch = 500;
  for (let i = 0; i < inserts.length; i += batch) {
    const slice = inserts.slice(i, i + batch);
    const { error } = await supabase.from("fly_recipe_ingredients").insert(slice);
    if (error) {
      console.error(`Batch ${i}-${i+slice.length} insert error:`, error);
      process.exit(1);
    }
  }

  console.log(`\n✅ Seeded ${inserts.length} fly_recipe_ingredients rows.`);
}

main().catch(e => { console.error(e); process.exit(1); });
