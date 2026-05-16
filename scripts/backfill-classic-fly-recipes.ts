/**
 * Backfill canonical fly recipes for universally-documented public-domain
 * classics whose recipes are uncontroversial across primary sources
 * (Sawyer, Halladay, Hughes, Hafele, Caucci & Nastasi, Whitlock, the
 * standard Catskill/North Country/Western canon).
 *
 * Skipped intentionally: every named-tyer pattern where the recipe is
 * specific and proprietary (Egan, Olsen, Barr, Galloup, Craven, Lawson,
 * Mathews-only variants, etc.). Those should be added via the
 * add-fly-pattern skill with a sourced recipe per fly.
 *
 * Per feedback_fly_recipe_conventions.md:
 *   - hooks/threads/specialty dubbings → brand + model
 *   - beads/CDC/hackle/generic wire   → spec only, no brand
 *
 * Run: npx tsx scripts/backfill-classic-fly-recipes.ts        (dry-run)
 *      npx tsx scripts/backfill-classic-fly-recipes.ts --apply (writes)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  const envText = readFileSync(".env.local", "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* env may be set externally */
}

interface Slot {
  slot: string;
  material: string;
  description?: string;
  brand?: string;
  is_optional?: boolean;
}

const RECIPES: Record<string, Slot[]> = {
  // ── DRY FLIES ───────────────────────────────────────────────────────────
  adams: [
    { slot: "hook", material: "Standard dry fly, #12-22", description: "Tiemco TMC 100 or equivalent" },
    { slot: "thread", material: "Gray 8/0", description: "Veevus, UTC, or Uni" },
    { slot: "tail", material: "Mixed brown + grizzly hackle fibers" },
    { slot: "body", material: "Gray muskrat or superfine dun dubbing" },
    { slot: "wing", material: "Grizzly hen hackle tips, upright and divided" },
    { slot: "hackle", material: "Brown + grizzly dry fly hackle, mixed" },
  ],
  comparadun: [
    { slot: "hook", material: "Standard dry fly, #12-22", description: "Tiemco TMC 100 or equivalent" },
    { slot: "thread", material: "8/0, color to match body" },
    { slot: "tail", material: "Split microfibetts, dun" },
    { slot: "body", material: "Superfine dubbing, color to match natural" },
    { slot: "wing", material: "Comparadun deer hair fanned 180° over body" },
  ],
  "blue-winged-olive-comparadun": [
    { slot: "hook", material: "Standard dry fly, #16-22", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "tail", material: "Split dun microfibetts" },
    { slot: "body", material: "Olive superfine dubbing" },
    { slot: "wing", material: "Dun comparadun deer hair fanned 180°" },
  ],
  "bwo-sparkle-dun": [
    { slot: "hook", material: "Standard dry fly, #16-22", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "tail", material: "Brown or amber Z-lon trailing shuck" },
    { slot: "body", material: "Olive superfine dubbing" },
    { slot: "wing", material: "Dun deer hair fanned 180°" },
  ],
  "cdc-blue-winged-olive": [
    { slot: "hook", material: "Standard dry fly, #16-22", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "tail", material: "Dun microfibetts" },
    { slot: "body", material: "Olive superfine dubbing" },
    { slot: "wing", material: "Two natural dun CDC feathers, tied over body" },
  ],
  "blue-dun": [
    { slot: "hook", material: "Standard dry fly, #14-20", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Gray 8/0" },
    { slot: "tail", material: "Dun hackle fibers" },
    { slot: "body", material: "Gray muskrat or dun dubbing" },
    { slot: "wing", material: "Dun hen hackle tips, upright" },
    { slot: "hackle", material: "Medium dun dry fly hackle" },
  ],
  "march-brown": [
    { slot: "hook", material: "Standard dry fly, #10-14", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "tail", material: "Brown partridge hackle fibers" },
    { slot: "body", material: "Tan or fawn hare's ear dubbing" },
    { slot: "rib", material: "Yellow tying thread or fine gold wire" },
    { slot: "wing", material: "Wood duck flank, upright and divided" },
    { slot: "hackle", material: "Brown + grizzly dry fly hackle, mixed" },
  ],
  "quill-gordon": [
    { slot: "hook", material: "Standard dry fly, #12-16", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Gray 8/0" },
    { slot: "tail", material: "Medium dun hackle fibers" },
    { slot: "body", material: "Stripped peacock quill" },
    { slot: "wing", material: "Wood duck flank fibers, upright and divided" },
    { slot: "hackle", material: "Medium dun dry fly hackle" },
  ],
  humpy: [
    { slot: "hook", material: "Standard dry fly, #10-16", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Yellow or red 6/0", description: "Uni or Veevus" },
    { slot: "tail", material: "Moose body or elk hair" },
    { slot: "body", material: "Yellow or red floss underbody" },
    { slot: "wing", material: "Elk hair shellback brought forward; wing tips upright and divided" },
    { slot: "hackle", material: "Brown + grizzly dry fly hackle, mixed" },
  ],
  "olive-thorax-dun": [
    { slot: "hook", material: "Standard dry fly, #14-20", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "tail", material: "Dun hackle fibers, split V" },
    { slot: "body", material: "Olive superfine dubbing, thorax-style (thickest at thorax)" },
    { slot: "wing", material: "Dun turkey flat or hen hackle tips, single upright" },
    { slot: "hackle", material: "Dun dry fly hackle, clipped flat on underside" },
  ],
  "pale-morning-dun": [
    { slot: "hook", material: "Standard dry fly, #14-18", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Pale yellow 8/0" },
    { slot: "tail", material: "Dun hackle fibers" },
    { slot: "body", material: "Pale yellow-olive superfine dubbing" },
    { slot: "wing", material: "Light dun hen hackle tips, upright and divided" },
    { slot: "hackle", material: "Light dun dry fly hackle" },
  ],
  "sulphur-dun": [
    { slot: "hook", material: "Standard dry fly, #14-18", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Yellow 8/0" },
    { slot: "tail", material: "Light ginger hackle fibers" },
    { slot: "body", material: "Sulphur yellow superfine dubbing" },
    { slot: "wing", material: "Light dun hen hackle tips, upright and divided" },
    { slot: "hackle", material: "Light ginger dry fly hackle" },
  ],
  "rusty-spinner": [
    { slot: "hook", material: "Standard dry fly, #14-20", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Rust 8/0" },
    { slot: "tail", material: "Dun microfibetts, split V" },
    { slot: "body", material: "Rusty brown superfine dubbing" },
    { slot: "wing", material: "White poly yarn or organza, spent (horizontal)" },
  ],
  "trico-spinner": [
    { slot: "hook", material: "Standard dry fly, #20-24", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Black 8/0" },
    { slot: "tail", material: "White microfibetts, split V" },
    { slot: "body", material: "Black superfine dubbing or thread" },
    { slot: "wing", material: "White poly yarn or organza, spent (horizontal)" },
  ],
  "green-drake": [
    { slot: "hook", material: "Standard dry fly, #10-12", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Olive 6/0" },
    { slot: "tail", material: "Moose body fibers" },
    { slot: "body", material: "Pale olive deer hair extended body or olive dubbing" },
    { slot: "wing", material: "Dark dun turkey flat or hen tips, upright" },
    { slot: "hackle", material: "Dark dun + grizzly dyed olive, mixed" },
  ],
  "callibaetis-cripple": [
    { slot: "hook", material: "Curved emerger, #14-18", description: "Tiemco TMC 2487 or 2488" },
    { slot: "thread", material: "Tan 8/0" },
    { slot: "tail", material: "Brown Z-lon trailing shuck" },
    { slot: "body", material: "Tan or grayish superfine dubbing" },
    { slot: "wing", material: "Light dun deer hair, swept back over body" },
    { slot: "hackle", material: "Grizzly, palmered through thorax" },
  ],
  "purple-haze": [
    { slot: "hook", material: "Standard dry fly, #12-20", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Purple 8/0" },
    { slot: "tail", material: "Moose body fibers" },
    { slot: "body", material: "Purple Krystal Flash or purple dubbing" },
    { slot: "wing", material: "White calf body hair or poly yarn, parachute post" },
    { slot: "hackle", material: "Grizzly dry fly hackle, parachute style" },
  ],

  // ── CADDIS DRIES ────────────────────────────────────────────────────────
  "goddard-caddis": [
    { slot: "hook", material: "Standard dry fly, #10-16", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Tan 6/0" },
    { slot: "body", material: "Spun and trimmed natural deer hair, caddis-shape" },
    { slot: "hackle", material: "Brown dry fly hackle at head" },
    { slot: "antennae", material: "Two brown hackle stems, swept back", is_optional: true },
  ],
  "x-caddis": [
    { slot: "hook", material: "Curved emerger, #14-18", description: "Tiemco TMC 2487" },
    { slot: "thread", material: "Tan 8/0" },
    { slot: "tail", material: "Amber Z-lon trailing shuck" },
    { slot: "body", material: "Hare's ear or tan superfine dubbing" },
    { slot: "wing", material: "Natural deer hair, tied over body" },
  ],

  // ── TERRESTRIALS ────────────────────────────────────────────────────────
  "chernobyl-ant": [
    { slot: "hook", material: "2x long, #6-12", description: "Tiemco TMC 5212 or Daiichi 1280" },
    { slot: "thread", material: "Black 6/0", description: "UTC 140 or Uni 6/0" },
    { slot: "body", material: "Two layers of foam (black over tan or contrasting colors)" },
    { slot: "legs", material: "Round rubber legs, multiple sets" },
    { slot: "wing", material: "White poly yarn or McFlylon for visibility", is_optional: true },
  ],
  "foam-ant": [
    { slot: "hook", material: "Standard dry fly, #14-20", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Black 8/0" },
    { slot: "body", material: "Two black foam balls separated by thread waist" },
    { slot: "legs", material: "Black rubber legs (two strands at waist)" },
    { slot: "hackle", material: "Black hackle at waist, palmered short", is_optional: true },
  ],
  "flying-ant": [
    { slot: "hook", material: "Standard dry fly, #14-20", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Black or rust 8/0" },
    { slot: "body", material: "Two black or cinnamon dubbing balls separated by thread waist" },
    { slot: "wing", material: "White poly yarn or grizzly hackle tips, spent over body" },
    { slot: "hackle", material: "Black or brown dry fly hackle at waist" },
  ],
  "foam-beetle": [
    { slot: "hook", material: "Standard dry fly, #12-18", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Black 8/0" },
    { slot: "body", material: "Peacock herl wound over hook shank" },
    { slot: "shellback", material: "Black foam, pulled over body and trimmed" },
    { slot: "legs", material: "Black rubber legs (one strand each side)" },
    { slot: "wing", material: "Hi-vis pink or orange yarn on top", is_optional: true },
  ],
  inchworm: [
    { slot: "hook", material: "Standard dry or scud, #12-16", description: "Tiemco TMC 100 or TMC 2487" },
    { slot: "thread", material: "Chartreuse or green 8/0" },
    { slot: "body", material: "Chartreuse or green chenille, foam cylinder, or McFlylon" },
  ],
  "parachute-hopper": [
    { slot: "hook", material: "2x long dry, #8-14", description: "Tiemco TMC 5212" },
    { slot: "thread", material: "Tan 6/0" },
    { slot: "body", material: "Tan superfine dubbing or yellow foam" },
    { slot: "wing", material: "Mottled turkey, lacquered and tied tent-style; calf body hair parachute post" },
    { slot: "legs", material: "Knotted pheasant tail or rubber legs", is_optional: true },
    { slot: "hackle", material: "Grizzly dry fly hackle, parachute style" },
  ],
  "letort-cricket": [
    { slot: "hook", material: "Standard dry, #10-16", description: "Tiemco TMC 100" },
    { slot: "thread", material: "Black 6/0" },
    { slot: "body", material: "Black dubbing or black fur" },
    { slot: "wing", material: "Black goose quill section, lacquered, over body" },
    { slot: "head", material: "Black deer hair, spun and clipped flat" },
  ],

  // ── EMERGERS ────────────────────────────────────────────────────────────
  "pmd-emerger": [
    { slot: "hook", material: "Curved emerger, #14-18", description: "Tiemco TMC 2487 or 2488" },
    { slot: "thread", material: "Pale yellow 8/0" },
    { slot: "tail", material: "Amber Z-lon trailing shuck" },
    { slot: "body", material: "PMD yellow superfine dubbing" },
    { slot: "wing", material: "Light dun CDC or deer hair, sparse" },
  ],
  "bwo-loop-wing-emerger": [
    { slot: "hook", material: "Curved emerger, #16-22", description: "Tiemco TMC 2488" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "tail", material: "Brown Z-lon shuck" },
    { slot: "body", material: "Olive superfine dubbing" },
    { slot: "wing", material: "Z-lon or Antron, looped over thorax" },
    { slot: "thorax", material: "Olive superfine dubbing, slightly thicker than body" },
  ],
  "snowshoe-emerger": [
    { slot: "hook", material: "Curved emerger, #14-20", description: "Tiemco TMC 2487 or 2488" },
    { slot: "thread", material: "Tan or olive 8/0" },
    { slot: "tail", material: "Brown Z-lon shuck" },
    { slot: "body", material: "Superfine dubbing to match natural" },
    { slot: "wing", material: "Snowshoe rabbit foot hair, sparse over body" },
  ],
  "snowshoe-baetis-emerger": [
    { slot: "hook", material: "Curved emerger, #16-22", description: "Tiemco TMC 2488" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "tail", material: "Brown Z-lon shuck" },
    { slot: "body", material: "Olive superfine dubbing" },
    { slot: "wing", material: "Snowshoe rabbit foot hair, sparse over body" },
  ],
  "spotlight-emerger": [
    { slot: "hook", material: "Curved emerger, #16-22", description: "Tiemco TMC 2488" },
    { slot: "thread", material: "Olive or tan 8/0" },
    { slot: "tail", material: "Brown Z-lon shuck" },
    { slot: "body", material: "Superfine dubbing to match natural" },
    { slot: "thorax", material: "Pearl Mylar tinsel covered with UV resin (the 'spotlight')" },
    { slot: "wing", material: "Sparse CDC tied forward over the spotlight" },
  ],
  "emerging-caddis-pupa": [
    { slot: "hook", material: "Curved emerger, #12-18", description: "Tiemco TMC 2487" },
    { slot: "thread", material: "Olive or tan 8/0" },
    { slot: "body", material: "Olive, tan, or chartreuse caddis dubbing" },
    { slot: "rib", material: "Fine gold wire" },
    { slot: "wing", material: "Brown partridge or natural CDC, swept back" },
    { slot: "thorax", material: "Hare's ear dubbing" },
  ],
  "bead-head-caddis-pupa": [
    { slot: "hook", material: "Curved scud, #12-18", description: "Tiemco TMC 2457 or 2487" },
    { slot: "bead", material: "Brass or tungsten, gold or copper, sized to hook" },
    { slot: "thread", material: "Olive or brown 8/0" },
    { slot: "body", material: "Caddis green, olive, or tan dubbing" },
    { slot: "rib", material: "Fine gold or copper wire" },
    { slot: "thorax", material: "Hare's ear dubbing or peacock herl" },
    { slot: "collar", material: "Brown partridge hackle, sparse" },
  ],

  // ── NYMPHS ──────────────────────────────────────────────────────────────
  "pheasant-tail": [
    { slot: "hook", material: "2x long nymph, #12-20", description: "Tiemco TMC 5262 or equivalent" },
    { slot: "bead", material: "Copper tungsten, sized to hook", is_optional: true },
    { slot: "thread", material: "Brown 8/0", description: "Veevus or Uni" },
    { slot: "tail", material: "Pheasant tail fibers" },
    { slot: "body", material: "Pheasant tail fibers, wrapped" },
    { slot: "rib", material: "Fine copper wire" },
    { slot: "wing", material: "Pheasant tail fibers (wingcase, pulled over thorax)" },
    { slot: "thorax", material: "Peacock herl" },
    { slot: "legs", material: "Pheasant tail fiber tips, swept back" },
  ],
  "cdc-pheasant-tail": [
    { slot: "hook", material: "2x long nymph or jig, #14-20", description: "Tiemco TMC 5262 or Hanak 450" },
    { slot: "bead", material: "Tungsten, copper or gold, sized to hook" },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "tail", material: "Pheasant tail fibers" },
    { slot: "body", material: "Pheasant tail fibers, wrapped" },
    { slot: "rib", material: "Fine copper wire" },
    { slot: "collar", material: "Natural dun CDC, palmered as a soft hackle" },
  ],
  "soft-hackle-pheasant-tail": [
    { slot: "hook", material: "Wet fly or nymph, #12-18", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "tail", material: "Pheasant tail fibers" },
    { slot: "body", material: "Pheasant tail fibers" },
    { slot: "rib", material: "Fine copper wire" },
    { slot: "thorax", material: "Peacock herl" },
    { slot: "hackle", material: "Brown partridge or starling, one turn at head" },
  ],
  "hares-ear": [
    { slot: "hook", material: "2x long nymph, #10-18", description: "Tiemco TMC 5262" },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "tail", material: "Hare's mask guard hairs" },
    { slot: "body", material: "Hare's ear dubbing, picked out" },
    { slot: "rib", material: "Fine gold oval tinsel or wire" },
    { slot: "wing", material: "Mottled turkey or pheasant tail (wingcase)" },
    { slot: "thorax", material: "Hare's ear dubbing, slightly thicker" },
  ],
  "flashback-hares-ear": [
    { slot: "hook", material: "2x long nymph, #12-18", description: "Tiemco TMC 5262" },
    { slot: "bead", material: "Gold tungsten, sized to hook", is_optional: true },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "tail", material: "Hare's mask guard hairs" },
    { slot: "body", material: "Hare's ear dubbing" },
    { slot: "rib", material: "Fine gold wire" },
    { slot: "wing", material: "Pearl Mylar tinsel (flashback wingcase)" },
    { slot: "thorax", material: "Hare's ear dubbing, picked out" },
  ],
  "soft-hackle-hares-ear": [
    { slot: "hook", material: "Wet fly, #12-16", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "body", material: "Hare's ear dubbing, slim" },
    { slot: "rib", material: "Fine gold wire" },
    { slot: "hackle", material: "Brown partridge, one turn at head" },
  ],
  "prince-nymph": [
    { slot: "hook", material: "2x long nymph, #8-16", description: "Tiemco TMC 5262" },
    { slot: "bead", material: "Gold tungsten or brass, sized to hook", is_optional: true },
    { slot: "thread", material: "Black 8/0" },
    { slot: "tail", material: "Brown goose biots, split V" },
    { slot: "body", material: "Peacock herl" },
    { slot: "rib", material: "Fine gold or copper wire" },
    { slot: "hackle", material: "Brown hen, two turns" },
    { slot: "wing", material: "White goose biots, split V over thorax" },
  ],
  "squirrel-nymph": [
    { slot: "hook", material: "2x long nymph, #8-16", description: "Tiemco TMC 5262" },
    { slot: "thread", material: "Brown or black 8/0" },
    { slot: "tail", material: "Squirrel tail fibers" },
    { slot: "body", material: "Pine squirrel dubbing, picked out" },
    { slot: "rib", material: "Fine gold or copper wire" },
    { slot: "hackle", material: "Brown partridge or hen, sparse", is_optional: true },
  ],
  "czech-nymph": [
    { slot: "hook", material: "Curved scud, #8-14", description: "Tiemco TMC 2457 or Hanak 130" },
    { slot: "thread", material: "Brown or olive 8/0" },
    { slot: "underbody", material: "Lead-free wire wraps for weight" },
    { slot: "body", material: "Caddis-green, orange, or pink dubbing — segmented appearance" },
    { slot: "rib", material: "Fine monofilament" },
    { slot: "shellback", material: "Olive Scud Back or Thin Skin, pulled over body" },
  ],
  "polish-woven-nymph": [
    { slot: "hook", material: "Curved scud, #8-14", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Olive or brown 8/0" },
    { slot: "underbody", material: "Lead-free wire wraps for weight" },
    { slot: "body", material: "Two colors of Antron yarn or floss, woven for a two-tone segmented body" },
    { slot: "thorax", material: "Hare's ear or peacock dubbing" },
    { slot: "shellback", material: "Pearl Mylar or Scud Back, optional", is_optional: true },
  ],
  "scud-pattern": [
    { slot: "hook", material: "Curved scud, #12-18", description: "Tiemco TMC 2457 or 2487" },
    { slot: "thread", material: "Olive or tan 8/0" },
    { slot: "body", material: "Scud dubbing — olive, tan, gray, or pink" },
    { slot: "rib", material: "Fine monofilament or copper wire" },
    { slot: "shellback", material: "Scud Back or clear plastic, pulled over body" },
  ],
  "sow-bug": [
    { slot: "hook", material: "Curved scud, #12-18", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Gray 8/0" },
    { slot: "body", material: "Gray or tan dubbing, picked out on the underside" },
    { slot: "rib", material: "Fine silver or copper wire" },
    { slot: "shellback", material: "Pearl Mylar or Scud Back", is_optional: true },
  ],
  "midge-larva": [
    { slot: "hook", material: "Curved midge, #18-24", description: "Tiemco TMC 2487 or 2488" },
    { slot: "thread", material: "Red, olive, black, or cream 8/0 (= the body color)" },
    { slot: "body", material: "Tying thread, color of choice" },
    { slot: "rib", material: "Fine silver or copper wire" },
  ],
  "caddis-larva-green-rock-worm": [
    { slot: "hook", material: "Curved caddis, #12-16", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Olive 8/0" },
    { slot: "body", material: "Bright caddis-green dubbing or Antron yarn" },
    { slot: "rib", material: "Fine gold or copper wire" },
    { slot: "thorax", material: "Hare's ear or black dubbing" },
  ],
  "mop-fly": [
    { slot: "hook", material: "Curved scud or jig, #10-14", description: "Tiemco TMC 2457 or Hanak 450" },
    { slot: "bead", material: "Tungsten, color of choice, sized to hook" },
    { slot: "thread", material: "Color to match mop chenille, 6/0" },
    { slot: "body", material: "Single mop chenille finger" },
    { slot: "thorax", material: "Hare's ear or peacock dubbing" },
  ],
  "squirmy-wormy": [
    { slot: "hook", material: "Curved scud or jig, #10-16", description: "Tiemco TMC 2457" },
    { slot: "bead", material: "Tungsten, sized to hook", is_optional: true },
    { slot: "thread", material: "Color to match body, 8/0" },
    { slot: "body", material: "Squirmy Wormy or Worm chenille, single strand" },
  ],
  "walts-worm": [
    { slot: "hook", material: "2x long nymph or jig, #12-18", description: "Tiemco TMC 5262 or Hanak 450" },
    { slot: "bead", material: "Tungsten, copper or black, sized to hook", is_optional: true },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "body", material: "Hare's ear dubbing, picked out for a buggy profile" },
  ],

  // ── EGGS ────────────────────────────────────────────────────────────────
  "egg-pattern": [
    { slot: "hook", material: "Egg/scud, #10-14", description: "Tiemco TMC 2457 or Daiichi 1130" },
    { slot: "thread", material: "Color to match egg yarn, 6/0" },
    { slot: "body", material: "Egg yarn (McFlylon, Glo Bug yarn) spun and trimmed round" },
  ],
  "blood-dot-egg": [
    { slot: "hook", material: "Egg/scud, #10-14", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Pink or peach 6/0" },
    { slot: "body", material: "Two clumps of egg yarn — pale (cheese/peach) main color and a small red 'blood dot' insert" },
  ],
  "nuke-egg": [
    { slot: "hook", material: "Egg/scud, #10-14", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Pink, orange, or chartreuse 6/0" },
    { slot: "body", material: "Dense color egg yarn 'yolk' surrounded by a thin halo of contrasting yarn ('shell')" },
  ],
  "sucker-spawn": [
    { slot: "hook", material: "Curved scud, #12-16", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Pink or peach 6/0" },
    { slot: "body", material: "Angora yarn or chenille tied in loops along the shank to mimic spawn cluster" },
  ],
  "y2k-bug": [
    { slot: "hook", material: "Curved scud or egg hook, #12-16", description: "Tiemco TMC 2457" },
    { slot: "thread", material: "Pink or chartreuse 6/0" },
    { slot: "body", material: "Chenille — bright pink rear half, chartreuse or orange front half" },
  ],

  // ── WET FLIES / SOFT HACKLES ────────────────────────────────────────────
  "march-brown-wet": [
    { slot: "hook", material: "Wet fly, #10-14", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Brown 8/0" },
    { slot: "tail", material: "Brown partridge fibers" },
    { slot: "body", material: "Tan or fawn hare's ear dubbing" },
    { slot: "rib", material: "Fine gold wire" },
    { slot: "wing", material: "Hen pheasant wing quill section" },
    { slot: "hackle", material: "Brown partridge, two turns" },
  ],
  "partridge-and-green": [
    { slot: "hook", material: "Wet fly, #12-16", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Green 8/0", description: "Pearsall's silk if available" },
    { slot: "body", material: "Tying thread (silk), thinly varnished" },
    { slot: "thorax", material: "Hare's ear dubbing", is_optional: true },
    { slot: "hackle", material: "Brown partridge, 2-3 turns" },
  ],
  "soft-hackle-partridge-and-orange": [
    { slot: "hook", material: "Wet fly, #12-16", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Orange 8/0", description: "Pearsall's silk if available" },
    { slot: "body", material: "Tying thread (silk)" },
    { slot: "thorax", material: "Hare's ear dubbing", is_optional: true },
    { slot: "hackle", material: "Brown partridge, 2-3 turns" },
  ],
  "starling-and-herl": [
    { slot: "hook", material: "Wet fly, #14-18", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Black 8/0" },
    { slot: "body", material: "Peacock herl, 2-3 strands twisted" },
    { slot: "hackle", material: "Starling, 2 turns at head" },
  ],
  "black-spider": [
    { slot: "hook", material: "Wet fly, #14-18", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Black 8/0" },
    { slot: "body", material: "Tying thread, thinly varnished" },
    { slot: "hackle", material: "Starling or black hen, 2 turns at head" },
  ],
  "leadwing-coachman": [
    { slot: "hook", material: "Wet fly, #10-14", description: "Tiemco TMC 3761" },
    { slot: "thread", material: "Black 6/0" },
    { slot: "tail", material: "Brown hackle fibers", is_optional: true },
    { slot: "body", material: "Peacock herl" },
    { slot: "rib", material: "Fine gold wire", is_optional: true },
    { slot: "wing", material: "Mallard wing quill section, dark gray ('lead-wing')" },
    { slot: "hackle", material: "Brown hen, beard style" },
  ],
  "carey-special": [
    { slot: "hook", material: "Streamer/wet, 3x long, #6-10", description: "Tiemco TMC 5263" },
    { slot: "thread", material: "Black 6/0" },
    { slot: "body", material: "Peacock herl (classic) or olive/black chenille" },
    { slot: "rib", material: "Fine gold wire", is_optional: true },
    { slot: "hackle", material: "Ring-necked pheasant rump, 3-4 wraps at head — long and webby" },
  ],
  "picket-pin": [
    { slot: "hook", material: "Streamer/wet, 2x long, #6-12", description: "Tiemco TMC 5262" },
    { slot: "thread", material: "Black 6/0" },
    { slot: "tail", material: "Brown hackle fibers" },
    { slot: "body", material: "Peacock herl" },
    { slot: "rib", material: "Fine gold or copper wire" },
    { slot: "hackle", material: "Brown hackle, palmered over body" },
    { slot: "wing", material: "Gray squirrel tail" },
    { slot: "head", material: "Peacock herl wound at head" },
  ],

  // ── STREAMERS ───────────────────────────────────────────────────────────
  "olive-bugger": [
    { slot: "hook", material: "Streamer 4x long, #2-12", description: "Tiemco TMC 5263 or Daiichi 2220" },
    { slot: "thread", material: "Olive 6/0", description: "UTC 140 or Uni 6/0" },
    { slot: "tail", material: "Olive marabou with a few strands of olive Krystal Flash" },
    { slot: "body", material: "Olive chenille" },
    { slot: "rib", material: "Fine copper wire (counter-wrap)" },
    { slot: "hackle", material: "Olive saddle, palmered over body" },
  ],
  "muddler-minnow": [
    { slot: "hook", material: "Streamer 4x long, #2-12", description: "Tiemco TMC 5263" },
    { slot: "thread", material: "Tan or olive 3/0" },
    { slot: "tail", material: "Mottled turkey wing section" },
    { slot: "body", material: "Flat gold tinsel" },
    { slot: "wing", material: "Gray squirrel tail (underwing) and mottled turkey (overwing)" },
    { slot: "head", material: "Natural deer hair, spun and trimmed to a bullet shape with a flared collar" },
  ],
  zonker: [
    { slot: "hook", material: "Streamer 4x long, #2-8", description: "Tiemco TMC 5263" },
    { slot: "thread", material: "White or color of strip, 6/0" },
    { slot: "underbody", material: "Lead-free wire and Mylar piping" },
    { slot: "body", material: "Pearl or silver Mylar tubing" },
    { slot: "wing", material: "Rabbit zonker strip (natural, olive, black, white)" },
    { slot: "throat", material: "Red dubbing or Krystal Flash", is_optional: true },
  ],
  "woolly-worm": [
    { slot: "hook", material: "Streamer/wet 3x long, #4-12", description: "Tiemco TMC 5263 or 3761" },
    { slot: "thread", material: "Black 6/0" },
    { slot: "tail", material: "Red yarn or hackle fibers (classic)" },
    { slot: "body", material: "Chenille — black, olive, brown, or yellow" },
    { slot: "hackle", material: "Grizzly saddle, palmered over body" },
  ],
  "clouser-minnow-trout": [
    { slot: "hook", material: "Standard streamer, #6-10", description: "Tiemco TMC 5263 or Mustad 3366" },
    { slot: "thread", material: "White 6/0" },
    { slot: "eyes", material: "Lead or brass dumbbell eyes, tied on top of shank (fly rides hook-point up)" },
    { slot: "wing", material: "Bucktail in two layers — white belly, then flash, then olive/chartreuse/tan top — tied on opposite sides of the hook" },
  ],
};

async function main() {
  const apply = process.argv.includes("--apply");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Validate slugs against the DB; skip ones that already have a recipe.
  const slugs = Object.keys(RECIPES).filter((s) => RECIPES[s].length > 0);
  const { data: rows, error } = await supabase
    .from("flies")
    .select("id, slug, name, materials_list")
    .in("slug", slugs);
  if (error) {
    console.error("Lookup failed:", error);
    process.exit(1);
  }
  const bySlug = new Map((rows ?? []).map((r) => [r.slug, r]));

  const toWrite: { id: string; slug: string; name: string; mat: Slot[] }[] = [];
  const skipped: string[] = [];
  const missing: string[] = [];

  for (const slug of slugs) {
    const row = bySlug.get(slug);
    if (!row) {
      missing.push(slug);
      continue;
    }
    const existing = Array.isArray(row.materials_list)
      ? row.materials_list
      : [];
    if (existing.length > 0) {
      skipped.push(`${slug} (already has ${existing.length} slots)`);
      continue;
    }
    toWrite.push({ id: row.id, slug: row.slug, name: row.name, mat: RECIPES[slug] });
  }

  console.log(`Planned writes: ${toWrite.length}`);
  for (const r of toWrite) {
    console.log(`  ${r.slug.padEnd(38)} ${r.mat.length} slots — ${r.name}`);
  }
  if (skipped.length) {
    console.log(`\nSkipped (already populated): ${skipped.length}`);
    for (const s of skipped) console.log(`  ${s}`);
  }
  if (missing.length) {
    console.log(`\nNot found in DB: ${missing.length}`);
    for (const s of missing) console.log(`  ${s}`);
  }

  if (!apply) {
    console.log("\nDry-run only. Pass --apply to write.");
    return;
  }

  console.log("\nApplying...");
  let okCount = 0;
  let failCount = 0;
  for (const r of toWrite) {
    const { error: updateError } = await supabase
      .from("flies")
      .update({
        materials_list: r.mat,
        updated_at: new Date().toISOString(),
      })
      .eq("id", r.id);
    if (updateError) {
      console.error(`  ✗ ${r.slug}: ${updateError.message}`);
      failCount++;
    } else {
      console.log(`  ✓ ${r.slug}`);
      okCount++;
    }
  }
  console.log(`\nDone. ${okCount} updated, ${failCount} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
