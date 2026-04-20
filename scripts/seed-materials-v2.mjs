/**
 * Seed Script: Fly-Tying Materials v2 — Expansion Pack
 * ~260 new items from Fulling Mill, HANAK, Fly Fish Food (Hareline/Flymen/Senyo/MFC),
 * Tactical Fly Fisher (Hends/Dohiku/Semperfli/Spirit River/Polish Quills/Solarez),
 * JS Fly Fishing + Feather-Craft (natural hair, natural feathers, specialty).
 *
 * Run dry-run:  node scripts/seed-materials-v2.mjs --dry-run
 * Run for real: node scripts/seed-materials-v2.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function slugify(brand, name) {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Common color defaults — used when agent flagged "colors not listed"
const CORE = ['black','white','olive','tan','brown'];
const DRY_TROUT = ['adams gray','tan','cream','olive','rusty brown'];
const STREAMER = ['black','white','olive','tan','brown','chartreuse','pink','purple','yellow'];
const EURO_HOT = ['hot orange','hot pink','chartreuse','red','black','olive'];
const DYED_FEATHER = ['natural','black','olive','brown','tan','grizzly','hot pink','chartreuse','purple'];

// =============================================================================
// HANAK — 11 new hooks (beyond our existing 9) + tungsten beads + thread/CDC
// =============================================================================
const hanak = [
  // New hooks (verified against flyhooks.org, jsflyfishing.com, tacticalflyfisher.com)
  { name: 'H100BL', brand: 'Hanak', category: 'hook', subcategory: 'dry', sizes: ['14','16','18','20','22','24'], finish: 'barbless', description: 'Extra-fine wire dry fly hook for small mayflies and midges.' },
  { name: 'H230BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Stillwater and wet fly hook with bent-in point, medium wire — one of HANAK\'s most popular curved nymph hooks.' },
  { name: 'H260BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Stillwater/wet fly hook, 2X long for longer mayfly and stonefly nymphs.' },
  { name: 'H290BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Competition nymph hook, standard shank.' },
  { name: 'H300BL', brand: 'Hanak', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Original Czech nymph hook, curved shank — go-to for scud and Czech nymph patterns.' },
  { name: 'H310BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Heavy buzzer and midge pupa hook.' },
  { name: 'H470BL', brand: 'Hanak', category: 'hook', subcategory: 'jig', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Czech-nymph style jig hook with curved shank.' },
  { name: 'H45XH', brand: 'Hanak', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'Jig Superb Trophy — extra-heavy wire for large nymphs and big-fish insurance.' },
  { name: 'H500BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Allround barbless hook for versatile trout patterns.' },
  { name: 'H900BL', brand: 'Hanak', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'barbless', description: 'Streamer and long-nymph hook, 4X long heavy wire — HANAK\'s competition-legal streamer standard.' },
  { name: 'H950BL', brand: 'Hanak', category: 'hook', subcategory: 'streamer', sizes: ['4','6','8','10'], finish: 'barbless', description: 'Streamer XL variant for smaller streamers and sculpins.' },
  { name: 'H970BL', brand: 'Hanak', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8'], finish: 'barbless', description: 'Streamer Wave hook — non-articulated streamers and large nymphs.' },

  // Tungsten beads — slotted (for jig hooks) + round
  { name: 'Tungsten Slotted Bead 1.5mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['1.5mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 20-22 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 2.0mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['2.0mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 18 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 2.5mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['2.5mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 16 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 2.8mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['2.8mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 14 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 3.0mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['3.0mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 12-14 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 3.3mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['3.3mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 12 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 3.5mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['3.5mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 10-12 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 4.0mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['4.0mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 10 jig nymphs.' },
  { name: 'Tungsten Slotted Bead 4.5mm', brand: 'Hanak', category: 'bead', subcategory: 'slotted', sizes: ['4.5mm'], colors: ['black nickel','gold','silver','copper','matte black','fluo orange','fluo pink','rainbow','anthracite'], material_type: 'tungsten slotted', description: 'Slotted tungsten bead for size 8 jig nymphs and small streamers.' },
  { name: 'Tungsten Round Bead Countersunk 2.0mm', brand: 'Hanak', category: 'bead', subcategory: 'round', sizes: ['2.0mm'], colors: ['black nickel','gold','silver','copper','matte black'], material_type: 'tungsten round', description: 'Countersunk round tungsten bead for standard (non-jig) nymphs.' },
  { name: 'Tungsten Round Bead Countersunk 2.5mm', brand: 'Hanak', category: 'bead', subcategory: 'round', sizes: ['2.5mm'], colors: ['black nickel','gold','silver','copper','matte black'], material_type: 'tungsten round', description: 'Countersunk round tungsten bead for size 16 nymphs.' },
  { name: 'Tungsten Round Bead Countersunk 3.0mm', brand: 'Hanak', category: 'bead', subcategory: 'round', sizes: ['3.0mm'], colors: ['black nickel','gold','silver','copper','matte black'], material_type: 'tungsten round', description: 'Countersunk round tungsten bead for size 14 nymphs.' },
  { name: 'Tungsten Round Bead Countersunk 3.5mm', brand: 'Hanak', category: 'bead', subcategory: 'round', sizes: ['3.5mm'], colors: ['black nickel','gold','silver','copper','matte black'], material_type: 'tungsten round', description: 'Countersunk round tungsten bead for size 12 nymphs.' },

  // Thread + CDC
  { name: 'Tying Thread 50D', brand: 'Hanak', category: 'thread', sizes: ['50 denier'], colors: ['black','white','olive','brown','tan','red','yellow','orange','hot pink','chartreuse'], material_type: 'polyester', weight: '50D', description: 'Ultra-fine competition thread for small perdigons and midges.' },
  { name: 'Tying Thread 80D', brand: 'Hanak', category: 'thread', sizes: ['80 denier'], colors: ['black','white','olive','brown','tan','red','yellow','orange','hot pink','chartreuse'], material_type: 'polyester', weight: '80D', description: 'Standard competition thread for trout nymphs and dries.' },
  { name: 'Tying Thread 120D', brand: 'Hanak', category: 'thread', sizes: ['120 denier'], colors: ['black','white','olive','brown','tan','red','yellow'], material_type: 'polyester', weight: '120D', description: 'Heavy competition thread for streamers and larger nymphs.' },
  { name: 'Body Quill', brand: 'Hanak', category: 'body', colors: ['natural','olive','brown','hot orange','pearl','black'], material_type: 'synthetic quill', description: 'Synthetic quill body material for segmented nymph and dry fly bodies.' },
  { name: 'CDC Feathers', brand: 'Hanak', category: 'feather', subcategory: 'cdc', colors: ['natural dun','natural tan','olive','brown','black','orange'], material_type: 'CDC', description: 'Premium Czech CDC feathers, selected and dyed for competition tying.' },
  { name: 'Tippet Ring 2mm', brand: 'Hanak', category: 'synthetic', subcategory: 'tippet ring', sizes: ['2mm'], material_type: 'stainless micro ring', description: 'Micro tippet ring for leader/tippet connections.' },
];

// =============================================================================
// FULLING MILL — ~65 items
// =============================================================================
const fullingMill = [
  // Barbless hooks (not already in DB)
  { name: 'Ultimate Dry FM5050', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Classic barbless dry fly hook, fine wire, wide gape.' },
  { name: 'Grab Gape FM5025', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Wide-gape barbless nymph for better hookup on heavy patterns.' },
  { name: 'Grab Gape Heavy FM5027', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Heavy-wire wide-gape variant for deep nymphing.' },
  { name: 'Heavyweight Champ FM5005', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16'], finish: 'barbless', description: 'Heavy-wire competition barbless nymph, wide gape.' },
  { name: 'Competition Heavyweight FM5095', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12'], finish: 'barbless', description: 'Competition heavyweight nymph hook for big stoneflies and weighted patterns.' },
  { name: 'Czech Nymph FM5065', brand: 'Fulling Mill', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16'], finish: 'barbless', description: 'Curved shank Czech nymph barbless, standard wire.' },
  { name: 'Czech Nymph Heavy FM5067', brand: 'Fulling Mill', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16'], finish: 'barbless', description: 'Heavy-wire Czech nymph for faster sinking.' },
  { name: 'Nymph FM5085', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Standard barbless nymph, all-purpose.' },
  { name: 'Heavyweight Grub FM5115', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Heavy-wire grub-curve barbless.' },
  { name: 'Grub Boss FM5120', brand: 'Fulling Mill', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'Grub-curve pattern hook, barbless.' },
  { name: 'Jig Force Short FM5125', brand: 'Fulling Mill', category: 'hook', subcategory: 'jig', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Short-shank jig for compact nymphs and midges.' },
  { name: 'Jig Force Long FM5130', brand: 'Fulling Mill', category: 'hook', subcategory: 'jig', sizes: ['6','8','10','12','14','16'], finish: 'barbless', description: 'Long-shank jig for streamers and larger nymphs.' },
  { name: 'Jig Force Straight Point FM5140', brand: 'Fulling Mill', category: 'hook', subcategory: 'jig', sizes: ['12','14','16','18'], finish: 'barbless', description: 'Straight-point jig variant for better penetration.' },
  { name: 'Tactical Midge FM5145', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['18','20','22','24'], finish: 'barbless', description: 'Small-hook barbless for midges and emergers.' },
  { name: 'Tactical Shorty FM5150', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Non-reflective matte-black short-shank tactical dry.' },
  { name: 'Tactical Big Bug FM5155', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['4','6','8','10'], finish: 'barbless', description: 'Non-reflective matte-black barbless for hoppers and terrestrials.' },
  { name: 'Complete Dry FM5160', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Classic barbless dry fly.' },
  { name: 'Complete Dry Long Shank FM5165', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['6','8','10','12','14'], finish: 'barbless', description: 'Long-shank dry for mayfly and stonefly imitations.' },
  { name: 'Ideal Trout FM5170', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Traditional trout dry fly hook, bronze finish.' },
  // Barbed hooks
  { name: 'All Purpose Light FM1180', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['8','10','12','14','16','18','20'], finish: 'standard', description: 'Light-wire multipurpose dry/wet.' },
  { name: 'All Purpose Grub FM1190', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'standard', description: 'Curved grub general nymph hook.' },
  { name: 'All Purpose Nymph FM1200', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16'], finish: 'standard', description: 'Classic nymph hook, medium wire.' },
  { name: 'Lightweight Grub FM1130', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['12','14','16','18'], finish: 'standard', description: 'Light-wire grub curve.' },
  { name: 'Super Grub FM1160', brand: 'Fulling Mill', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16'], finish: 'standard', description: 'Heavy-duty scud/grub hook.' },
  { name: 'Super Heavyweight Grub FM1167', brand: 'Fulling Mill', category: 'hook', subcategory: 'czech', sizes: ['8','10','12','14','16'], finish: 'standard', description: 'Extra-heavy wire matte black for Czech nymphs.' },
  { name: 'Living Larva FM1270', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['12','14','16','18'], finish: 'standard', description: 'Curved shank for caddis and midge larvae.' },
  { name: 'Down Eye Dry FM1310', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18'], finish: 'standard', description: 'Classic down-eye dry fly.' },
  { name: 'Nymph Special FM1710', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'standard', description: 'Standard barbed nymph.' },
  { name: 'Stealth Nymph Special FM1715', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'standard', description: 'Non-reflective matte-black barbed nymph.' },
  { name: 'Traditional Streamer FM2220', brand: 'Fulling Mill', category: 'hook', subcategory: 'streamer', sizes: ['4','6','8','10','12'], finish: 'standard', description: 'Classic long-shank streamer.' },
  { name: 'Stealth Streamer FM2225', brand: 'Fulling Mill', category: 'hook', subcategory: 'streamer', sizes: ['4','6','8','10','12'], finish: 'standard', description: 'Non-reflective matte-black streamer.' },
  { name: 'Stealth Jig FM6050', brand: 'Fulling Mill', category: 'hook', subcategory: 'streamer', sizes: ['4','6','8'], finish: 'standard', description: 'Heavy matte-black jig for articulated streamers.' },
  { name: 'Pike Hook', brand: 'Fulling Mill', category: 'hook', subcategory: 'streamer', sizes: ['1/0','2/0','3/0','4/0','5/0','6/0'], finish: 'standard', description: 'Heavy long-shank for pike and musky streamers.' },
  { name: 'Streamer Stripper Saltwater', brand: 'Fulling Mill', category: 'hook', subcategory: 'streamer', sizes: ['2','1','1/0','2/0'], finish: 'standard', description: 'Stainless saltwater-rated streamer hook.' },

  // Dubbing (22 items)
  { name: 'CDC Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['natural dun','natural tan','olive','brown','black','rusty brown'], material_type: 'CDC fiber', description: 'CDC-fiber dubbing for dry flies and emergers.' },
  { name: 'Argentine Hare Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['hare\'s ear','olive','black','brown','tan'], material_type: 'natural hare', description: 'Coarse natural hare for nymphs and spiky thoraxes.' },
  { name: 'Eco Warrior Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['light hare\'s ear','dark hare\'s ear','olive'], material_type: 'natural/synthetic blend', description: 'Eco blend all-round trout dubbing.' },
  { name: 'Flex Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['gray','olive','tan','black','brown'], material_type: 'stretchy synthetic', description: 'Stretchy synthetic for wet and dry patterns.' },
  { name: 'Eco Trigger Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['rusty trigger','hot orange','chartreuse','pink'], material_type: 'synthetic UV', description: 'Bright trigger dubbing with UV reflection.' },
  { name: 'Eco Rabbit Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['black','olive','tan','brown','hare\'s ear'], material_type: 'synthetic rabbit blend', description: 'Eco-friendly rabbit-substitute dubbing.' },
  { name: 'Tactical Microflash Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['bright orange','black','olive','brown','red'], material_type: 'synthetic with micro flash', description: 'Fine flash-infused dubbing for Euro nymphs.' },
  { name: 'Tactical Microflash Dub UV', brand: 'Fulling Mill', category: 'dubbing', colors: ['pearl','olive UV','black UV','brown UV'], material_type: 'synthetic UV', description: 'UV-reflective microflash for tactical nymphs.' },
  { name: 'Tactical SF Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['hot orange','black','olive','brown','pink'], material_type: 'super-fine synthetic', description: 'Super-fine dubbing for smaller Euro patterns.' },
  { name: 'Tactical Dry Fly Dub', brand: 'Fulling Mill', category: 'dubbing', colors: DRY_TROUT, material_type: 'water-repellent synthetic', description: 'Water-repellent synthetic for dry flies.' },
  { name: 'Tactical Peacock Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['black','peacock','bronze'], material_type: 'peacock blend', description: 'Peacock-herl blend for thoraxes.' },
  { name: 'Tactical Peacock Flash Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['red','black','peacock','olive'], material_type: 'peacock/flash blend', description: 'Flash-enhanced peacock blend.' },
  { name: 'Euro Nymph Body Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['brown olive','hare\'s ear','black','tan'], material_type: 'synthetic', description: 'Body dubbing for Euro nymph abdomens.' },
  { name: 'Euro Nymph Thorax Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['black','brown','olive','hot pink'], material_type: 'spiky synthetic', description: 'Spiky thorax dubbing for Euro nymphs.' },
  { name: 'Euro Nymph Flash Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['brown gold','pearl','copper','black'], material_type: 'flash-infused', description: 'Flash-infused dubbing for hot-spot thoraxes.' },
  { name: 'Ultra Nymph Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['olive','brown','black','tan','hare\'s ear'], material_type: 'fine synthetic', description: 'Fine nymph dubbing for slim profiles.' },
  { name: 'Ultra Dry Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['onyx','cream','olive','tan','rusty brown'], material_type: 'fine synthetic', description: 'Fine dry-fly dubbing.' },
  { name: 'Voodoo Streamer Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['bronze peacock','black','olive','tan','white'], material_type: 'long-fiber synthetic', description: 'Long-fiber streamer dubbing.' },
  { name: 'Sculpin-Stacker Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['black UV','olive UV','tan','natural','white'], material_type: 'long-fiber synthetic', description: 'Sculpin-specific long-fiber dubbing.' },
  { name: 'Micro Minnow Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['black UV','white','olive','tan','pearl'], material_type: 'synthetic', description: 'Small baitfish streamer dubbing.' },
  { name: 'Seal X Dubbing', brand: 'Fulling Mill', category: 'dubbing', colors: ['black','claret','olive','red','orange'], material_type: 'seal substitute', description: 'Seal substitute for classic salmon and wet patterns.' },
  { name: 'Salty Shrimp Dub', brand: 'Fulling Mill', category: 'dubbing', colors: ['ghost','pink','olive','tan','orange'], material_type: 'synthetic', description: 'Saltwater shrimp/crab dubbing.' },

  // Pro Thread + Floss
  { name: 'Pro Thread Flat 70D', brand: 'Fulling Mill', category: 'thread', weight: '70D', colors: ['black','white','olive','brown','tan','red','yellow','orange','grey'], material_type: 'flat waxed polyester', description: 'Flat-profile waxed thread for small trout nymphs, dries, emergers, wets.' },
  { name: 'Pro Thread Flat 210D', brand: 'Fulling Mill', category: 'thread', weight: '210D', colors: ['black','white','olive','brown','tan','chartreuse','red'], material_type: 'flat waxed polyester', description: 'Heavy flat thread for streamers and saltwater patterns.' },
  { name: 'Pro Thread Twisted 70D', brand: 'Fulling Mill', category: 'thread', weight: '70D', colors: ['black','white','olive','brown','tan','red','yellow'], material_type: 'twisted polyester', description: 'Twisted thread for precision small-fly work.' },
  { name: 'Pro Thread Twisted 110D', brand: 'Fulling Mill', category: 'thread', weight: '110D', colors: ['black','white','olive','brown','tan','red'], material_type: 'twisted polyester', description: 'Medium twisted for standard trout flies.' },
  { name: 'Pro Thread Twisted 140D', brand: 'Fulling Mill', category: 'thread', weight: '140D', colors: ['black','white','olive','brown','chartreuse'], material_type: 'twisted polyester', description: 'Heavy twisted for poppers and saltwater baitfish.' },
  { name: 'Pro Floss 110D', brand: 'Fulling Mill', category: 'thread', subcategory: 'floss', weight: '110D', colors: ['hot orange','hot pink','chartreuse','red','yellow','black','white'], material_type: 'floss', description: 'Floss for tags, ribs, and high-vis dry fly posts.' },
  { name: 'Pro Floss 340D', brand: 'Fulling Mill', category: 'thread', subcategory: 'floss', weight: '340D', colors: ['hot orange','hot pink','chartreuse','red','yellow','black'], material_type: 'floss', description: 'Heavy floss for larger patterns and saltwater tags.' },

  // Misc
  { name: 'Silicone Legs', brand: 'Fulling Mill', category: 'rubber', colors: ['glitter','barred','black','olive','tan','brown','chartreuse','hot orange','hot pink'], material_type: 'silicone', description: 'Silicone rubber legs for terrestrials and nymphs.' },
  { name: 'Round Rubber Legs', brand: 'Fulling Mill', category: 'rubber', sizes: ['fine','medium','large'], colors: ['black','white','olive','brown','tan','yellow','red','orange','chartreuse','hot pink','purple','blue','gray','natural','grizzly','barred'], material_type: 'natural rubber', description: 'Traditional rubber legs for foam flies and Pat\'s Rubber Legs.' },
  { name: 'Mini Marabou', brand: 'Fulling Mill', category: 'feather', colors: ['black','olive','white','tan','brown','yellow','orange','chartreuse','hot pink','red'], material_type: 'marabou plume', description: 'Small marabou plumes for micro-streamers.' },
  { name: 'Shrimp Eyes', brand: 'Fulling Mill', category: 'eye', sizes: ['small','medium','large'], colors: ['black'], material_type: 'dumbbell shrimp eye', description: 'Dumbbell shrimp eyes for saltwater patterns.' },
  { name: 'Changer Chenille', brand: 'Fulling Mill', category: 'chenille', colors: ['black','white','olive','tan','brown','chartreuse','pink','purple'], material_type: 'articulated-streamer chenille', description: 'Articulated-streamer chenille body material.' },
  { name: 'Extra Small Cactus Chenille', brand: 'Fulling Mill', category: 'chenille', sizes: ['extra small'], colors: ['pearl','olive','black','red','chartreuse','copper'], material_type: 'cactus chenille', description: 'Fine cactus chenille for small Euro nymphs and egg patterns.' },
];

// =============================================================================
// HARELINE / FLYMEN / SENYO / MFC / RAINY'S / HEDRON (via Fly Fish Food)
// =============================================================================
const fffVendors = [
  // Senyo's
  { name: 'Laser Dub', brand: 'Senyo\'s', category: 'dubbing', colors: ['black','white','olive','tan','brown','grey','purple','hot pink','fl chartreuse','fl hot orange','fl blue','fl fuchsia','sculpin olive','silver minnow belly','shrimp pink','rusty bronze'], material_type: 'ice dub + acrylic blend', description: 'Greg Senyo\'s signature blend of Ice Dub and 0.5-1 denier acrylic fibers for streamer heads, wings, and dubbed bodies.' },
  { name: 'Fusion Dub', brand: 'Senyo\'s', category: 'dubbing', colors: ['baby bow','smolt','sculpin olive','hot olive','white','rusty copper','purple haze','hot pink','chartreuse'], material_type: 'long-fiber translucent', description: 'Longer-fiber translucent dubbing with multi-color blends for streamer heads and collars.' },
  { name: 'Shaggy Dub', brand: 'Senyo\'s', category: 'dubbing', colors: ['black','olive','rusty brown','purple','hot pink','white','chartreuse'], material_type: 'spandex microfiber', description: 'Shaggy spandex micro-fiber with built-in movement for nymphs, steelhead, and streamer bodies.' },

  // Hareline — streamer body materials
  { name: 'Pseudo Hair', brand: 'Hareline', category: 'synthetic', sizes: ['3.25 inch'], colors: ['black','white','olive','tan','brown','chartreuse','pink','purple','yellow','sculpin olive'], material_type: 'synthetic arctic fox', description: 'Thin synthetic arctic-fox substitute with underfur for tapered streamer wings.' },
  { name: 'Congo Hair', brand: 'Hareline', category: 'synthetic', colors: ['black','white','olive','tan','chartreuse','pink','purple','chrome','baitfish brown'], material_type: 'kinked synthetic fiber', description: 'Kinked synthetic streamer fiber for baitfish and tapered streamer wings.' },
  { name: 'Icelandic Sheep Hair', brand: 'Hareline', category: 'synthetic', sizes: ['6-8 inch'], colors: ['black','white','olive','tan','brown','chartreuse','hot pink','yellow','purple','red','natural'], material_type: 'natural sheep hair', description: 'Long, soft, marabou-like natural sheep hair with subtle curl for large streamers and poppers.' },
  { name: 'Polar Chenille Standard', brand: 'Hareline', category: 'chenille', colors: ['black','brown','chartreuse','copper','dark gray olive','gold','gray olive','hot pink','olive','olive brown','pearl','purple'], material_type: 'translucent fiber chenille', description: 'Long translucent fibers on a twisted core that undulate like marabou; palmered as hackle or underwing.' },
  { name: 'UV Polar Chenille Micro', brand: 'Hareline', category: 'chenille', sizes: ['micro'], colors: ['UV black','UV brown','UV chartreuse','UV dark gray olive','UV fuchsia','UV gray olive','UV olive','UV olive brown','UV purple','UV red','UV clear'], material_type: 'UV translucent chenille', description: 'Smaller-scale UV-treated polar chenille for trout streamers and smaller patterns.' },
  { name: 'UV Polar Chenille Medium', brand: 'Hareline', category: 'chenille', sizes: ['medium'], colors: ['UV black','UV brown','UV chartreuse','UV dark gray olive','UV fuchsia','UV gray olive','UV olive','UV olive brown','UV purple','UV red','UV clear'], material_type: 'UV translucent chenille', description: 'Medium-size loose fibers; core streamer staple.' },
  { name: 'Palmer Chenille', brand: 'Hareline', category: 'chenille', sizes: ['small','medium','large'], colors: ['black','olive','brown','tan','white','chartreuse','pink','purple'], material_type: 'fine palmering chenille', description: 'Fine-fibered chenille designed for palmering as body/hackle substitute.' },
  { name: 'Magnum Rabbit Strips', brand: 'Hareline', category: 'tail', sizes: ['1/4 inch zonker'], colors: ['black','white','olive','dark olive','brown','tan','natural gray','purple','pink','chartreuse','barred olive','barred black','barred tan','barred purple','tiger barred'], material_type: 'natural fur strip', description: '1/4 inch wide Grade-A rabbit zonker strips for bass, pike, and large trout streamers.' },
  { name: 'Crosscut Rabbit Strips', brand: 'Hareline', category: 'tail', sizes: ['1/8 inch crosscut'], colors: ['black','white','olive','dark olive','brown','tan','natural gray','purple','pink','chartreuse','rust','barred olive','barred black','barred tan'], material_type: 'natural fur strip', description: 'Cut against the grain for wrapping as a body; slimmer profile than zonker-cut.' },
  { name: 'Extra Select Craft Fur', brand: 'Hareline', category: 'synthetic', sizes: ['3 inch'], colors: ['white','black','tan','olive','yellow','chartreuse','pink','purple','brown','gray','rust','silver minnow'], material_type: 'synthetic craft fur', description: 'Longer, finer craft fur used in Redfish Crack, Mini Leech, and many Cheech streamers.' },
  { name: 'Ice Fur', brand: 'Hareline', category: 'synthetic', sizes: ['3 inch'], colors: ['pearl','UV pearl','olive','black','tan','pink','chartreuse','silver minnow','peacock','purple'], material_type: 'sparkle craft fur', description: 'Craft fur with integrated sparkle — marabou-like movement.' },
  { name: 'Ice Dub', brand: 'Hareline', category: 'dubbing', colors: ['peacock','UV peacock eye','black','white','tan','UV tan','UV pearl','silver minnow belly','olive','UV olive','brown','UV brown','rusty brown','shrimp pink','purple','fl fire orange','fl chartreuse','red','golden stone','callibaetis','sow scud'], material_type: 'synthetic sparkle', description: 'Flagship sparkle dubbing — the most-tied sparkle dubbing in the trout world.' },
  { name: 'Lite Brite', brand: 'Hareline', category: 'flash', colors: ['pearl','rainbow','silver','gold','copper','peacock','olive','chartreuse','minnow belly','rusty copper'], material_type: 'chopped flashabou dubbing', description: 'Chopped flash dubbing; brighter, coarser Ice Dub alternative.' },
  { name: 'UV Sparkle Yarn', brand: 'Hareline', category: 'synthetic', colors: ['UV pearl','UV tan','UV olive','UV pink','UV chartreuse','UV brown','UV peacock'], material_type: 'UV sparkle yarn', description: 'UV-treated sparkle yarn for egg patterns, hot spots, and small streamer bodies.' },
  { name: 'Round Rubber Legs', brand: 'Hareline', category: 'rubber', sizes: ['fine','medium','large'], colors: ['black','brown','white','red','orange','purple','chartreuse','yellow','olive','tan'], material_type: 'natural rubber strand', description: 'Round rubber leg strands; workhorse for Pat\'s Rubber Legs and Girdle Bugs.' },
  { name: 'Grizzly Barred Rubber Legs', brand: 'Hareline', category: 'rubber', sizes: ['fine','medium','large'], colors: ['black/white','brown/white','olive/black','tan/black','red/black','purple/black'], material_type: 'barred rubber strand', description: 'Round rubber with bold black barring for stonefly and streamer legs.' },
  { name: 'Sili Legs', brand: 'Hareline', category: 'rubber', colors: ['clear barred black','pumpkin green flake','black red flake','chartreuse barred','watermelon red flake','hot pink','white pearl','black','olive barred','brown barred'], material_type: 'silicone leg strip', description: 'Flat silicone bass/terrestrial legs in a broad color/flake range.' },
  { name: 'Crazy Legs', brand: 'Hareline', category: 'rubber', colors: ['pumpkin chartreuse','clear silver flake','black silver flake','chartreuse','white pearl','olive black flake'], material_type: 'flaked silicone', description: 'Silicone legs with metallic flake embedded — bass/warmwater favorite.' },
  { name: 'Double Barred Heavy Duty Silicone Legs', brand: 'Hareline', category: 'rubber', sizes: ['standard','magnum'], colors: ['black/chartreuse','olive/black','brown/black','pumpkin/black','clear/black'], material_type: 'double-barred silicone', description: 'Heavier silicone legs with two-tone barring for larger bass and pike flies.' },
  { name: 'Thin Fly Foam', brand: 'Hareline', category: 'foam', sizes: ['1mm','2mm'], colors: ['black','white','tan','brown','olive','yellow','chartreuse','orange','red','hot pink'], material_type: 'closed-cell sheet foam', description: 'Thin closed-cell foam sheets for wings, indicators, and small terrestrials.' },
  { name: 'Fly Foam Thick', brand: 'Hareline', category: 'foam', sizes: ['3mm','6mm'], colors: ['black','white','tan','brown','olive','yellow','chartreuse','orange','red','hot pink'], material_type: 'closed-cell sheet foam', description: 'Thicker sheet foam for hopper bodies, bass bugs, chubbies.' },
  { name: 'Mini Flat Braid', brand: 'Hareline', category: 'flash', sizes: ['1/32 inch','1/16 inch'], colors: ['pearl','gold','silver','copper','black','pink','chartreuse','peacock'], material_type: 'pearlescent braid', description: 'Flat braid for nymph bodies — popularized on Rainbow Warriors.' },
  { name: 'UV Krystal Flash', brand: 'Hareline', category: 'flash', colors: ['UV pearl','UV tan','UV pink','UV olive','UV chartreuse','UV copper'], material_type: 'UV twisted flash', description: 'UV-reactive Krystal Flash for steelhead and trout streamers.' },
  { name: 'Strung Marabou Blood Quill', brand: 'Hareline', category: 'feather', colors: ['black','white','olive','olive brown','brown','tan','yellow','chartreuse','hot pink','purple','red','orange','gray','golden olive'], material_type: 'turkey marabou', description: 'Workhorse marabou for Wooly Buggers and streamer tails.' },
  { name: 'Wooly Bugger Marabou', brand: 'Hareline', category: 'feather', colors: ['black','olive','brown','white','tan','purple','chartreuse','hot pink'], material_type: 'marabou plumes', description: 'Shorter, fuller marabou plumes selected for bugger tails.' },
  { name: 'Bucktail Whole Tail', brand: 'Hareline', category: 'tail', sizes: ['small','medium','large'], colors: ['natural brown','natural white','black','olive','chartreuse','hot pink','yellow','red','purple','brown','tan','orange','blue'], material_type: 'deer tail', description: 'Whole dyed/natural bucktails for Clouser Minnows, streamers, and saltwater patterns.' },

  // MFC
  { name: 'Centipede Legs', brand: 'Montana Fly Co', category: 'rubber', sizes: ['mini','small','medium','large'], colors: ['barred black','barred brown','barred olive','barred orange','barred tan','barred white','barred yellow','black','brown','olive','orange','tan','white','yellow'], material_type: 'barred round rubber', description: 'Perfectly back-barred round rubber — the Morrish Hopper and Chubby Chernobyl standard.' },
  { name: 'Sexi Floss', brand: 'Montana Fly Co', category: 'rubber', sizes: ['small','medium'], colors: ['black','red','olive','brown','chartreuse','pink','orange','yellow','purple'], material_type: 'flat stretch floss', description: 'Flat stretch-floss legs for tiny nymphs and terrestrials.' },

  // Flymen Fishing Co
  { name: 'Next Generation Articulated Shank', brand: 'Flymen', category: 'body', subcategory: 'shank', sizes: ['6mm','8mm','10mm','15mm','20mm','35mm','45mm','55mm','65mm','80mm'], colors: ['black nickel'], material_type: 'stainless wire shank', description: 'Wire articulation shanks for building Chocklett Game Changer-style multi-section streamers.' },
  { name: 'Senyo\'s Micro Shank', brand: 'Flymen', category: 'body', subcategory: 'shank', sizes: ['6mm','8mm'], colors: ['black nickel'], material_type: 'micro articulation shank', description: 'Micro shank system for trout-size articulated streamers.' },
  { name: 'Chocklett\'s Big Game Shank', brand: 'Flymen', category: 'body', subcategory: 'shank', sizes: ['28mm','40mm','80mm'], colors: ['black nickel'], material_type: 'heavy articulation shank', description: 'Heavy-gauge shanks for pike, musky, saltwater Game Changers.' },
  { name: 'Fish-Skull Living Eyes', brand: 'Flymen', category: 'eye', sizes: ['1.5mm','2.5mm','4mm','5mm','6.5mm','7mm','10mm'], colors: ['ice','fire','earth','reaper','silver','red'], material_type: '3D holographic eye', description: '3D domed holographic eyes for streamers — the de facto Game Changer eye.' },
  { name: 'Chocklett\'s Body Wrap', brand: 'Flymen', category: 'synthetic', colors: ['pearl','olive','tan','rust','chartreuse','black','white','gray'], material_type: 'game changer body material', description: 'Flash/fiber material specifically designed for wrapping Game Changer bodies.' },

  // Rainy's
  { name: 'Foam Cylinders', brand: 'Rainy\'s', category: 'foam', sizes: ['1/8 inch','3/16 inch','1/4 inch','3/8 inch','1/2 inch'], colors: ['black','white','tan','brown','olive','yellow','chartreuse','gray'], material_type: 'pre-shaped cylinder', description: 'Pre-cut foam cylinders for Chubby Chernobyl, hopper, and ant bodies.' },
  { name: 'Hopper Bodies Pre-Shaped', brand: 'Rainy\'s', category: 'foam', sizes: ['small','medium','large'], colors: ['tan','yellow','pink','olive','orange'], material_type: 'molded hopper body', description: 'Pre-molded 2-tone foam hopper bodies for fast tying.' },

  // Hedron / Wapsi expansions
  { name: 'Flashabou Original', brand: 'Hedron', category: 'flash', colors: ['silver','gold','copper','pearl','black','red','blue','purple','olive','chartreuse','hot pink','kelly green','peacock','rainbow'], material_type: 'mylar flash', description: 'Thin mylar flash — the most-used flash in fly tying.' },
  { name: 'Mirage Flashabou', brand: 'Hedron', category: 'flash', colors: ['opal','gold','silver','copper','blue','green','pink'], material_type: 'holographic mylar', description: 'Holographic iridescent version of Flashabou.' },
  { name: 'Northern Bucktail', brand: 'Wapsi', category: 'tail', sizes: ['medium','large'], colors: ['natural brown','natural white','black','olive','chartreuse','hot pink','yellow','red','purple','tan','orange'], material_type: 'northern deer tail', description: 'Stiffer, longer-fibered bucktail preferred for saltwater and large streamers.' },
];

// =============================================================================
// TACTICAL FLY FISHER — Hends, Dohiku, Semperfli, Spirit River, Polish Quills, Solarez
// =============================================================================
const tff = [
  // Hends (beyond our existing 30)
  { name: 'Body Quill', brand: 'Hends', category: 'body', colors: ['okrova','natural','olive','brown','peacock'], material_type: 'synthetic stripped quill', description: 'Dyed synthetic quill for segmented nymph/dry bodies — classic Euro nymph look.' },
  { name: 'Body Quill Pearlescent', brand: 'Hends', category: 'body', colors: ['pearl white','pearl olive','pearl peach'], material_type: 'pearlescent quill', description: 'Pearlescent-coated quill body for flashy perdigon and midge bodies.' },
  { name: 'Krystal Flash Gasolina', brand: 'Hends', category: 'flash', colors: ['gasolina','pearl','UV pearl','UV pink','UV olive'], material_type: 'twisted flash', description: 'Hends-branded krystal flash in Czech competition color palette.' },
  { name: 'Pearl Scudback', brand: 'Hends', category: 'body', sizes: ['narrow','wide'], colors: ['pearl','clear','olive'], material_type: 'shellback foil', description: 'Pearlescent shellback strip for scuds, sowbugs, and shrimp patterns.' },
  { name: 'Flat Lead Wire', brand: 'Hends', category: 'wire', subcategory: 'lead', sizes: ['small','medium','large'], colors: ['lead gray'], material_type: 'flat lead', description: 'Flat lead underbody wire for slim jig nymphs without adding diameter.' },
  { name: 'Muskrat Zonker Strips', brand: 'Hends', category: 'tail', colors: ['natural muskrat'], material_type: 'natural fur strip', description: 'Soft natural fur strips for streamers and leeches.' },
  { name: 'Pearlescent Shellback', brand: 'Hends', category: 'body', sizes: ['narrow','wide'], colors: ['pearl','rainbow'], material_type: 'shellback foil', description: 'Pearlescent back foil for scuds and stoneflies.' },
  { name: 'Perdigon Body Material Fine', brand: 'Hends', category: 'body', sizes: ['1-69 fine'], colors: ['silver','gold','pearl','copper','olive','black'], material_type: 'fine mylar tinsel', description: 'Fine-gauge metallic mylar for slim perdigon body wraps.' },
  { name: 'Perdigon Body Material Medium', brand: 'Hends', category: 'body', sizes: ['1-32 medium'], colors: ['silver','gold','pearl','copper','olive','black'], material_type: 'medium mylar tinsel', description: 'Medium-gauge mylar for larger perdigon bodies (size 10-14).' },
  { name: 'Spectra Dubbing', brand: 'Hends', category: 'dubbing', colors: ['black','olive','brown','tan','hare\'s ear','peacock','hot orange','hot pink','chartreuse','red','pearl','golden olive','rusty brown','cream','natural'], material_type: 'synthetic sparkle', description: 'Sparkly synthetic dubbing — the Czech competition standard.' },
  { name: 'Spectra Flashback', brand: 'Hends', category: 'flash', colors: ['pearl','black','olive','gold','silver'], material_type: 'synthetic flash', description: 'Coarse synthetic flash for wingcases and flashbacks.' },
  { name: 'Spectra Rainbow Dubbing', brand: 'Hends', category: 'dubbing', colors: ['rainbow 1','rainbow 2','rainbow 3','multi-blend'], material_type: 'multi-color sparkle', description: 'Multi-tone Spectra variant for hot-spot and attractor nymphs.' },
  { name: 'Squirrel Zonker Strips 4mm', brand: 'Hends', category: 'tail', sizes: ['4mm'], colors: ['natural squirrel'], material_type: 'natural fur strip', description: 'Fine 4mm squirrel zonker strips for small streamers and leeches.' },

  // Dohiku (beyond existing 5)
  { name: 'HDB Blob Hook', brand: 'Dohiku', category: 'hook', subcategory: 'streamer', sizes: ['8','10','12'], finish: 'barbless', description: 'Wide-gape blob/booby hook for competition stillwater.' },
  { name: 'HDC 303 Short Nymph', brand: 'Dohiku', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16'], finish: 'barbless', description: 'Short-shank curved nymph hook — popular caddis pupa platform.' },
  { name: 'HDD 301 Dry', brand: 'Dohiku', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20','22'], finish: 'barbless', description: 'Standard-length down-eye dry fly hook, fine wire.' },
  { name: 'HDG 611 Scud', brand: 'Dohiku', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Heavy curved scud hook, wide gape for Czech nymphs.' },
  { name: 'HDG 644 Caddis', brand: 'Dohiku', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Scud/caddis pupa hook, Euro-nymph standard curve.' },
  { name: 'HDG 645 Caddis Long', brand: 'Dohiku', category: 'hook', subcategory: 'czech', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Caddis/scud hook, slightly longer than HDG 644.' },
  { name: 'HDJ Jig Hook', brand: 'Dohiku', category: 'hook', subcategory: 'jig', sizes: ['10','12','14','16','18'], finish: 'barbless', description: '60-degree jig hook for slotted-bead perdigons.' },
  { name: 'HDN 302 Nymph', brand: 'Dohiku', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Classic straight-shank competition nymph hook.' },
  { name: 'HDN 302 SP Jig', brand: 'Dohiku', category: 'hook', subcategory: 'jig', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Jig-bend version of the HDN 302 for slotted tungsten.' },
  { name: 'HDN 302 SPR Light Jig', brand: 'Dohiku', category: 'hook', subcategory: 'jig', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Light-wire jig nymph; reduces hook weight for slower sink.' },
  { name: 'HDP Universal', brand: 'Dohiku', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Universal wet/dry platform, straight eye.' },
  { name: 'HDV 304 Wet Fly', brand: 'Dohiku', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Versatile wet fly/soft hackle hook.' },
  { name: 'HDW Streamer', brand: 'Dohiku', category: 'hook', subcategory: 'streamer', sizes: ['6','8','10','12'], finish: 'barbless', description: 'Long-shank streamer and lake wet-fly hook.' },
  { name: 'Stripped Peacock Quills', brand: 'Dohiku', category: 'body', colors: ['natural','olive','brown','black','dyed red'], material_type: 'stripped peacock quill', description: 'Hand-stripped peacock quills, Euro-nymph favorite for ribbing.' },

  // Semperfli (beyond existing 20)
  { name: 'Classic Waxed Thread 8/0', brand: 'Semperfli', category: 'thread', weight: '8/0 240yd', colors: ['black','white','olive','brown','tan','red','yellow','orange','rusty brown','chartreuse','hot pink','grey'], material_type: 'waxed polyester', description: 'Workhorse 8/0 waxed thread for standard nymphs and wets.' },
  { name: 'Classic Waxed Thread 12/0', brand: 'Semperfli', category: 'thread', weight: '12/0 240yd', colors: ['black','white','olive','brown','tan','red','yellow','chartreuse','grey'], material_type: 'waxed polyester', description: 'Fine 12/0 for small dries and midges.' },
  { name: 'Classic Waxed Thread 18/0', brand: 'Semperfli', category: 'thread', weight: '18/0 240yd', colors: ['black','white','olive','brown','tan','grey'], material_type: 'waxed polyester', description: 'Ultra-fine for size 22+ midges.' },
  { name: 'Nano Silk 18/0', brand: 'Semperfli', category: 'thread', weight: '30 denier 18/0', colors: ['black','white','olive','tan','red','yellow','brown','chartreuse'], material_type: 'GSP nanosilk', description: 'Gel-spun ultra-strong thread, tiny diameter, for jig nymphs and small flies.' },
  { name: 'Kapok Dry Fly Dubbing', brand: 'Semperfli', category: 'dubbing', colors: ['adams gray','olive','cream','tan','rusty brown','dark olive','black','yellow','hare\'s ear','light dun'], material_type: 'kapok fiber', description: 'Naturally water-repellent kapok dubbing for dries — floats without floatant.' },
  { name: 'Ice Dubbing', brand: 'Semperfli', category: 'dubbing', colors: ['peacock','black','olive','tan','brown','pearl','hot orange','hot pink','chartreuse','red','purple'], material_type: 'holographic ice dubbing', description: 'Holographic ice dubbing for thoraxes and hot spots.' },
  { name: 'Dirty Bug Yarn', brand: 'Semperfli', category: 'dubbing', colors: ['olive','brown','tan','dark olive','hare\'s ear'], material_type: 'blended yarn', description: 'Scruffy blended yarn for Czech nymphs and buggy bodies.' },
  { name: 'Fluoro Brite Floss', brand: 'Semperfli', category: 'thread', subcategory: 'floss', colors: ['hot pink','chartreuse','orange','red','yellow'], material_type: 'fluoro floss', description: 'Fluorescent floss for hot spots and tags.' },
  { name: 'Glo-Bright Floss', brand: 'Semperfli', category: 'thread', subcategory: 'floss', colors: ['hot orange','chartreuse','hot pink','red','yellow','white'], material_type: 'fluoro floss', description: 'Super-bright floss for steelhead and trigger spots.' },
  { name: 'Gel Core Body Micro Fritz', brand: 'Semperfli', category: 'chenille', sizes: ['micro'], colors: ['red','olive','pearl','black','orange','chartreuse'], material_type: 'micro fritz', description: 'Tiny fritz for competition blob and cormorant patterns.' },
  { name: 'EggStatic Egg Fritz 15mm', brand: 'Semperfli', category: 'chenille', sizes: ['15mm'], colors: ['sunrise','apricot','pale pink','orange','red','cheese'], material_type: 'egg fritz', description: 'Egg-pattern fritz in translucent egg shades.' },
  { name: 'Mopster Mop Chenille', brand: 'Semperfli', category: 'chenille', colors: ['tan','olive','pink','white','brown','chartreuse'], material_type: 'mop fiber', description: 'Mop chenille for mop flies and squirmy alternatives.' },
  { name: 'Wire 0.2mm', brand: 'Semperfli', category: 'wire', sizes: ['0.2mm'], colors: ['copper','gold','silver','red','black','olive','chartreuse','hot pink','blue','green'], material_type: 'colored fine wire', description: 'Ultra-fine colored wire for ribs on small perdigons.' },
  { name: 'Mono Ribbing', brand: 'Semperfli', category: 'ribbing', sizes: ['fine','medium'], colors: ['clear','amber','black','olive'], material_type: 'mono filament', description: 'Clear and colored mono rib for dries and emergers.' },

  // Spirit River UV2
  { name: 'UV2 Scud Shrimp Dubbing', brand: 'Spirit River', category: 'dubbing', colors: ['scud tan','pink','olive','orange'], material_type: 'UV2 synthetic', description: 'UV-reflective dubbing tuned for scud/sowbug/shrimp color spectrum.' },
  { name: 'UV2 Seal-X Dubbing', brand: 'Spirit River', category: 'dubbing', colors: ['black','olive','claret','red','orange','yellow','purple','brown','tan','white','hot pink','chartreuse'], material_type: 'UV2 seal substitute', description: 'UV-enhanced seal substitute, long-fibered buggy dubbing.' },
  { name: 'UV2 Coq de Leon CDL', brand: 'Spirit River', category: 'feather', subcategory: 'coq de leon', colors: ['pardo','indio'], material_type: 'UV2 CDL', description: 'UV-treated Coq de Leon — competition tail fibers for perdigons.' },
  { name: 'UV2 Goose Biots', brand: 'Spirit River', category: 'feather', subcategory: 'biot', colors: ['black','brown','olive','tan','white','red','yellow','chartreuse','hot pink','orange'], material_type: 'UV2 biots', description: 'UV-treated goose biots for segmented bodies and wingcases.' },
  { name: 'UV2 Turkey Biots', brand: 'Spirit River', category: 'feather', subcategory: 'biot', colors: ['black','brown','olive','tan','white','golden stone','rusty brown'], material_type: 'UV2 biots', description: 'UV-treated turkey biots, larger than goose.' },
  { name: 'UV2 Marabou', brand: 'Spirit River', category: 'feather', subcategory: 'marabou', colors: ['black','white','olive','brown','tan','chartreuse','hot pink','purple','red','yellow','orange'], material_type: 'UV2 marabou', description: 'UV-enhanced marabou for streamers and jigs.' },
  { name: 'UV2 Rabbit Strips', brand: 'Spirit River', category: 'tail', colors: ['black','white','olive','brown','tan','purple','pink','chartreuse','natural'], material_type: 'UV2 zonker', description: 'UV-enhanced rabbit zonkers.' },
  { name: 'UV2 Pheasant Tail', brand: 'Spirit River', category: 'feather', colors: ['natural','olive','black','brown'], material_type: 'UV2 pheasant', description: 'UV-enhanced pheasant tail — upgrade for PT nymphs.' },
  { name: 'Estaz Chenille Grande 30mm', brand: 'Spirit River', category: 'chenille', sizes: ['30mm'], colors: ['pearl','chartreuse','hot pink','red','black','orange','white','purple','olive'], material_type: 'estaz', description: 'Large estaz for streamers and blobs.' },
  { name: 'Estaz Chenille Medium 15mm', brand: 'Spirit River', category: 'chenille', sizes: ['15mm'], colors: ['pearl','chartreuse','hot pink','red','black','orange','white','purple','olive','peacock','copper'], material_type: 'estaz', description: 'Medium estaz, standard for Woolly Buggers and blobs.' },
  { name: 'Squirmy Wormies', brand: 'Spirit River', category: 'synthetic', colors: ['pink','red','tan','cream','brown','worm'], material_type: 'silicone worm', description: 'Stretchy silicone worm material for squirmy patterns.' },
  { name: 'UV2 Fine and Dry Dubbing', brand: 'Spirit River', category: 'dubbing', colors: ['adams gray','cream','olive','tan','rusty brown','callibaetis','PMD','BWO olive','sulfur','hendrickson'], material_type: 'UV2 fine dry', description: 'UV-reactive fine dry fly dubbing, finer grade than standard UV2.' },
  { name: 'UV2 Fusion Egg Beads', brand: 'Spirit River', category: 'bead', subcategory: 'egg', colors: ['cheese','apricot','oregon cheese','pink','chartreuse','orange'], material_type: 'UV soft egg', description: 'UV-reactive soft egg beads for egg patterns.' },

  // Polish Quills
  { name: 'Polish CDC Natural', brand: 'Polish Quills', category: 'feather', subcategory: 'cdc', colors: ['natural dun','natural tan'], material_type: 'premium CDC', description: 'Hand-selected Polish CDC, competition-grade.' },
  { name: 'Polish CDC Dyed', brand: 'Polish Quills', category: 'feather', subcategory: 'cdc', colors: ['olive','brown','black','pink','dun','yellow','hot orange'], material_type: 'premium dyed CDC', description: 'Dyed Polish CDC in vibrant competition colors.' },
  { name: 'Stripped Peacock Quills', brand: 'Polish Quills', category: 'body', colors: ['natural'], material_type: 'peacock quill', description: 'Hand-stripped peacock quills for ribbing and bodies.' },

  // Solarez
  { name: 'Bone Dry Ultra Thin', brand: 'Solarez', category: 'resin', sizes: ['0.5 oz'], colors: ['clear'], material_type: 'UV-cure thin', description: 'Ultra-thin UV resin, no tack, perfect for perdigon coatings.' },
  { name: 'Bone Dry BLACK Ultra Thin', brand: 'Solarez', category: 'resin', sizes: ['0.5 oz'], colors: ['black'], material_type: 'UV-cure thin pigmented', description: 'Black-pigmented ultra-thin UV resin for wingcases and heads.' },
  { name: 'UV Cure Color Resin', brand: 'Solarez', category: 'resin', sizes: ['5g'], colors: ['red','black','amber','olive','blue'], material_type: 'UV-cure pigmented', description: 'Colored UV resins for hot spots and tags.' },

  // UV resins — additional
  { name: 'UV Clear Fly Finish Thick', brand: 'Loon Outdoors', category: 'resin', colors: ['clear'], material_type: 'UV-cure thick', description: 'Loon\'s thick UV resin for heads, epoxy substitute.' },
  { name: 'UV Clear Fly Finish Thin', brand: 'Loon Outdoors', category: 'resin', colors: ['clear'], material_type: 'UV-cure thin', description: 'Loon\'s thin UV resin for shellbacks and perdigons.' },
  { name: 'UV Clear Fly Finish Flow', brand: 'Loon Outdoors', category: 'resin', colors: ['clear'], material_type: 'UV-cure flow', description: 'Loon\'s flow-viscosity UV resin — between thick and thin.' },
  { name: 'High Gloss Head Cement', brand: 'Hareline', category: 'resin', sizes: ['1 oz'], colors: ['clear'], material_type: 'lacquer', description: 'Classic high-gloss head cement.' },
  { name: 'Hard as Hull Head Cement', brand: 'Hareline', category: 'resin', colors: ['clear'], material_type: 'lacquer', description: 'Durable multi-coat head cement.' },
  { name: 'Brush On Zap-a-Gap', brand: 'Zap-a-Gap', category: 'resin', colors: ['clear'], material_type: 'cyanoacrylate', description: 'Brush-on CA glue, thicker than standard Zap.' },

  // Veniard
  { name: '3mm Stretch Worm Chenille', brand: 'Veniard', category: 'synthetic', sizes: ['3mm'], colors: ['chewing gum pink','red','tan','brown','olive'], material_type: 'stretch worm', description: 'Stretchy silicone-style chenille for squirmy/worm patterns.' },
  { name: 'Hand Stripped Peacock Quills', brand: 'Veniard', category: 'body', colors: ['natural'], material_type: 'peacock quill', description: 'Premium hand-stripped peacock quills.' },
];

// =============================================================================
// JS FLY FISHING + FEATHER-CRAFT — natural hair, feathers, specialty
// =============================================================================
const jsFeatherCraft = [
  // Natural hair (biggest gap)
  { name: 'Deer Belly Hair', brand: 'Varner\'s', category: 'body', subcategory: 'deer', colors: ['natural','black','olive','brown','tan','yellow','chartreuse'], material_type: 'deer belly hair', description: 'Long-fiber deer belly preferred for spinning bass bug heads and large dry flies.' },
  { name: 'Short Fine Deer Hair', brand: 'Varner\'s', category: 'body', subcategory: 'deer', colors: ['natural','tan','olive','dun'], material_type: 'fine deer hair', description: 'Fine, short deer hair ideal for Comparadun wings and small caddis.' },
  { name: 'Late Season Big Bug Deer Hair', brand: 'Varner\'s', category: 'body', subcategory: 'deer', sizes: ['3x4 patch','4x8 patch'], colors: ['natural winter coat'], material_type: 'dense winter deer hair', description: 'Dense winter-coat deer hair for spinning and stacking on large bass/pike bugs.' },
  { name: 'Deer Body Hair', brand: 'Hareline', category: 'body', subcategory: 'deer', colors: ['natural','black','olive','brown','tan','yellow','chartreuse','red','hot pink','gray'], material_type: 'deer body hair', description: 'Standard deer body hair patch for Elk Hair Caddis, Comparaduns, and general dry fly wings.' },
  { name: 'Coastal Deer Hair', brand: 'Hareline', category: 'body', subcategory: 'deer', colors: ['natural tan'], material_type: 'coastal deer hair', description: 'Finer, shorter coastal deer hair specifically for small Comparaduns and caddis wings.' },
  { name: 'Premium Northern Deer Body Hair', brand: 'Feather-Craft', category: 'body', subcategory: 'deer', colors: ['natural'], material_type: 'northern deer hair', description: 'House-brand northern deer body hair selected for dry fly wings.' },
  { name: 'Deer Belly', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'deer', colors: ['natural','black','olive','brown','tan','yellow','chartreuse'], material_type: 'deer belly hair', description: 'Premium deer belly hair for spinning bass bugs and muddlers.' },
  { name: 'Natural Deer Hock', brand: 'Nature\'s Spirit', category: 'tail', subcategory: 'deer', colors: ['natural brown'], material_type: 'deer hock', description: 'Stiff deer hock hair for tailing dry flies (Humpy, Wulff patterns).' },
  { name: 'Bleached Deer Hock', brand: 'Nature\'s Spirit', category: 'tail', subcategory: 'deer', colors: ['bleached cream'], material_type: 'deer hock', description: 'Bleached deer hock for light-tailed dries.' },
  { name: 'Select Cow Elk', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'elk', colors: ['natural'], material_type: 'cow elk hair', description: 'Larger, coarser elk hair for Stimulators and big attractor dries.' },
  { name: 'Spinning Deer Hair', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'deer', colors: ['natural','black','olive','brown','tan','yellow','chartreuse','red'], material_type: 'deer hair for spinning', description: 'Deer hair specifically graded for spinning and stacking — longer and hollower than standard body hair.' },
  { name: 'Stimulator Deer Hair', brand: 'Nature\'s Spirit', category: 'wing', subcategory: 'deer', colors: ['natural','bleached'], material_type: 'stiff deer hair', description: 'Stiff, straight deer hair selected for Stimulator-style down wings.' },
  { name: 'Moose Mane', brand: 'Nature\'s Spirit', category: 'tail', subcategory: 'moose', colors: ['natural black','natural brown'], material_type: 'moose mane hair', description: 'Multi-tone moose mane for segmented bodies and tails.' },
  { name: 'Caribou Hair', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'caribou', colors: ['natural'], material_type: 'caribou hair', description: 'Soft, spinning-friendly caribou for small bass bugs and muddlers.' },
  { name: 'Cow Elk Flank', brand: 'Feather-Craft', category: 'body', subcategory: 'elk', colors: ['natural'], material_type: 'cow elk flank', description: 'House-brand cow elk flank patch for dry fly wings.' },
  { name: 'Coyote Premium Wing Fur', brand: 'Nature\'s Spirit', category: 'wing', colors: ['natural'], material_type: 'coyote fur', description: 'Fine coyote fur used for wet fly and streamer wings.' },
  { name: 'Yeti Hair', brand: 'Nature\'s Spirit', category: 'synthetic', colors: ['white','black','olive','tan','chartreuse','pink'], material_type: 'translucent synthetic', description: 'Translucent long-fiber synthetic for streamers and saltwater flies.' },
  { name: 'Synthetic Yak Hair', brand: 'Nature\'s Spirit', category: 'synthetic', colors: ['white','black','olive','tan','chartreuse','pink','brown'], material_type: 'synthetic yak', description: 'Long synthetic fibers replacing natural yak for large streamers.' },
  { name: 'Pastel Northern Bucktail', brand: 'Spirit River', category: 'tail', sizes: ['large'], colors: ['pastel pink','pastel olive','pastel tan','pastel yellow','pastel blue'], material_type: 'pastel-dyed bucktail', description: 'Softer pastel-dyed bucktail for baitfish imitations and subtle saltwater patterns.' },

  // Natural feathers
  { name: 'Pro Jungle Cock', brand: 'Hareline', category: 'feather', subcategory: 'jungle cock', colors: ['natural'], material_type: 'genuine jungle cock', description: 'Genuine jungle cock nails for classic salmon and streamer eyes.' },
  { name: 'Real Fake Jungle Cock Eyes', brand: 'Hareline', category: 'eye', subcategory: 'jungle cock sub', colors: ['natural-look'], material_type: 'printed synthetic', description: 'Printed synthetic jungle cock substitute; cheaper alternative to real nails.' },
  { name: 'UV-3D Imitation Jungle Cock Eyes', brand: 'Hareline', category: 'eye', subcategory: 'jungle cock sub', colors: ['natural imitation'], material_type: '3D UV synthetic', description: '3D embossed UV-reactive synthetic jungle cock eyes.' },
  { name: 'Mylar Imitation Jungle Cock Eyes', brand: 'Wapsi', category: 'eye', subcategory: 'jungle cock sub', colors: ['silver','pearl','gold'], material_type: 'mylar stick-on', description: 'Mylar stick-on jungle cock eye substitute.' },
  { name: 'Wild Turkey Tail Feathers Large', brand: 'Feather-Craft', category: 'feather', subcategory: 'turkey', colors: ['natural mottled'], material_type: 'wild turkey tail', description: 'House-brand large wild turkey tail for wing quill sections.' },
  { name: 'Heritage Turkey Tail', brand: 'Generic', category: 'feather', subcategory: 'turkey', colors: ['natural mottled brown'], material_type: 'heritage turkey tail', description: 'Heritage-breed turkey tail pair for pheasant tail substitute wings and quill bodies.' },
  { name: 'Cinnamon Tip Turkey Tail', brand: 'Generic', category: 'feather', subcategory: 'turkey', colors: ['natural cinnamon'], material_type: 'cinnamon turkey tail', description: 'Cinnamon-tipped turkey tail for hopper/caddis wings and bodies.' },
  { name: 'Turkey Biots', brand: 'Wapsi', category: 'feather', subcategory: 'biot', colors: ['natural','black','olive','brown','tan','white','golden stone','rusty brown','orange'], material_type: 'turkey biots', description: 'Stripped turkey biots for stonefly and small midge bodies.' },
  { name: 'Premo Turkey Flats', brand: 'Wapsi', category: 'wing', subcategory: 'turkey', colors: ['natural','white','dun','olive','black','tan','yellow'], material_type: 'turkey flats', description: 'Turkey flat feathers for parachute posts and wing cases.' },
  { name: 'Dyed Turkey Rounds', brand: 'Feather-Craft', category: 'feather', subcategory: 'turkey', colors: ['black','olive','brown','red','yellow'], material_type: 'dyed turkey rounds', description: 'House-brand dyed turkey round feathers for wing cases.' },
  { name: 'Duck Cul de Canard CDC', brand: 'Nature\'s Spirit', category: 'feather', subcategory: 'cdc', colors: ['natural dun','natural tan','white','olive','brown','black'], material_type: 'premium CDC', description: 'Premium CDC feathers — grade varies by color.' },
  { name: 'Mallard Flank', brand: 'Nature\'s Spirit', category: 'feather', subcategory: 'mallard', colors: ['natural bronze','wood duck','lemon','olive'], material_type: 'mallard flank', description: 'Barred mallard flank for wood duck substitute wings.' },
  { name: 'Duck Quills', brand: 'Nature\'s Spirit', category: 'wing', subcategory: 'duck', colors: ['natural','dun','olive','black','red'], material_type: 'duck quills', description: 'Matched duck quill pairs for traditional wet fly wings.' },
  { name: 'Select Hen Saddle', brand: 'Nature\'s Spirit', category: 'feather', subcategory: 'hen', colors: ['natural','grizzly','olive','brown','black','dun'], material_type: 'hen saddle', description: 'Soft hackle hen saddle patches with webby feathers.' },
  { name: 'Barred Variant Strung Schlappen', brand: 'Nature\'s Spirit', category: 'feather', subcategory: 'schlappen', colors: ['barred olive','barred black','barred brown','barred tan','barred white'], material_type: 'barred schlappen', description: 'Long-fiber barred schlappen for streamer collars and tails.' },
  { name: 'Stripped Goose Biot', brand: 'Nature\'s Spirit', category: 'wing', subcategory: 'biot', colors: ['natural','black','olive','brown','tan','white','red','yellow','chartreuse'], material_type: 'goose biot', description: 'Stripped goose biots for larger stonefly and midge bodies.' },
  { name: 'Select Goose Shoulder', brand: 'Nature\'s Spirit', category: 'feather', subcategory: 'goose', colors: ['natural','black','red','yellow','blue'], material_type: 'goose shoulder', description: 'Classic Atlantic salmon and streamer wing material.' },
  { name: 'Dyed Peacock Strung Herl', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'peacock', colors: ['natural','red','olive','orange','chartreuse','purple','blue'], material_type: 'dyed peacock herl', description: 'Dyed peacock herl for non-standard body colors beyond natural.' },
  { name: 'Bleached Peacock Sticks', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'peacock', colors: ['bleached','dyed olive','dyed brown'], material_type: 'bleached peacock sticks', description: 'Bleached and dyed peacock quills/sticks for quill-body flies.' },
  { name: 'Turkey Biot Quill Pieces', brand: 'Nature\'s Spirit', category: 'body', subcategory: 'biot', colors: ['natural','black','olive','brown','tan'], material_type: 'turkey biot quill', description: 'Pre-cut turkey biot quill pieces for stonefly bodies.' },
  { name: 'Barred Marabou', brand: 'Montana Fly Co', category: 'feather', subcategory: 'marabou', colors: ['barred black','barred olive','barred brown','barred tan','barred white','barred yellow'], material_type: 'barred marabou', description: 'Barred marabou for streamer tails (Galloup-style).' },
  { name: 'Barred Schlappen', brand: 'Montana Fly Co', category: 'feather', subcategory: 'schlappen', colors: ['barred black','barred olive','barred brown','barred white'], material_type: 'barred schlappen', description: 'Barred schlappen for streamer collars.' },
  { name: 'Galloup\'s Fish Feathers', brand: 'Montana Fly Co', category: 'feather', colors: ['black','olive','brown','white','tan','purple','chartreuse','yellow'], material_type: 'long webby feather', description: 'Kelly Galloup-specified long webby feathers for articulated streamers.' },
  { name: 'Premium Bugger Bou', brand: 'Nature\'s Spirit', category: 'feather', subcategory: 'marabou', colors: ['black','olive','brown','white','tan','purple','chartreuse','hot pink','red','yellow'], material_type: 'premium marabou', description: 'Premium grade marabou selected specifically for bugger tails.' },

  // Dubbing / Synthetic expansions
  { name: 'UV2 Seal-X Dubbing Dispenser', brand: 'Spirit River', category: 'dubbing', colors: ['multi-color dispenser'], material_type: 'UV2 seal substitute', description: 'UV2 seal substitute dubbing in multi-color dispenser box.' },
  { name: 'UV2 Diamond Brite Dubbing Dispenser', brand: 'Spirit River', category: 'dubbing', colors: ['multi-color dispenser'], material_type: 'UV2 diamond-faceted flash', description: 'UV2 sparkle dubbing with diamond-faceted flash in dispenser.' },
  { name: 'UV2 Strung Saddle', brand: 'Spirit River', category: 'feather', subcategory: 'saddle', colors: ['black','olive','brown','grizzly','hot pink','chartreuse'], material_type: 'UV2 strung saddle', description: 'UV-reactive strung saddle hackle.' },
  { name: 'Fine Natural Dubbing Rainbow Blend', brand: 'Nature\'s Spirit', category: 'dubbing', colors: ['rainbow blend'], material_type: 'natural fur dubbing', description: 'Fine natural fur dubbing blended across multiple tones.' },
  { name: 'Scud-Lisios Dubbing', brand: 'Nature\'s Spirit', category: 'dubbing', colors: ['scud tan','pink','orange','olive'], material_type: 'scud dubbing blend', description: 'Scud-specific blended dubbing (Lisios recipe).' },
  { name: 'Krystal Core Leech Yarn', brand: 'Nature\'s Spirit', category: 'body', colors: ['black','olive','brown','purple','red','rust'], material_type: 'krystal-flash-cored yarn', description: 'Krystal-flash-cored leech yarn for streamer bodies.' },
  { name: 'Senyo\'s Dirty Bird Dubbing', brand: 'Montana Fly Co', category: 'dubbing', colors: ['olive','tan','black','white','sculpin','rust','pearl'], material_type: 'streamer dubbing blend', description: 'Greg Senyo streamer dubbing blend.' },
  { name: 'Trina\'s Squirm Material', brand: 'Montana Fly Co', category: 'synthetic', colors: ['worm pink','red','tan','cream'], material_type: 'silicone body', description: 'Squirmy-wormy-style silicone body material.' },
  { name: 'Teardrop Streamer Beads', brand: 'Montana Fly Co', category: 'bead', subcategory: 'streamer', sizes: ['6mm'], colors: ['black nickel','gold','silver','copper'], material_type: 'tungsten teardrop', description: 'Teardrop-shaped weighted streamer beads.' },
  { name: 'Super Hair', brand: 'Wapsi', category: 'body', colors: ['white','black','olive','tan','chartreuse','pink','blue'], material_type: 'saltwater synthetic fiber', description: 'Fine crinkled synthetic saltwater fiber (Ultra Hair family).' },
  { name: 'Faux Bucktail', brand: 'Flymen', category: 'tail', colors: ['white','black','olive','tan','chartreuse','pink'], material_type: 'synthetic bucktail sub', description: 'Synthetic bucktail substitute with straighter taper.' },
  { name: 'Flash Blend', brand: 'Steve Farrar', category: 'flash', colors: ['white','tan','olive','chartreuse','pink','sardine','bunker','pilchard'], material_type: 'pre-blended flash+fiber', description: 'Pre-blended flash-plus-fiber for saltwater streamers.' },
  { name: 'Scales \'N Tails Baitfish Blend', brand: 'Montana Fly Co', category: 'synthetic', colors: ['sardine','bunker','pilchard','olive','tan','pearl'], material_type: 'pre-blended baitfish', description: 'Pre-blended baitfish profile material.' },
];

// =============================================================================
// MAIN
// =============================================================================
const all = [...hanak, ...fullingMill, ...fffVendors, ...tff, ...jsFeatherCraft];

// Generate slugs and dedupe within this batch
const seen = new Set();
const records = [];
for (const m of all) {
  const slug = slugify(m.brand, m.name);
  if (seen.has(slug)) {
    console.warn(`WARN: duplicate slug within batch: ${slug}`);
    continue;
  }
  seen.add(slug);
  records.push({
    slug,
    name: m.name,
    brand: m.brand,
    category: m.category,
    subcategory: m.subcategory || null,
    sizes: m.sizes || null,
    colors: m.colors || null,
    material_type: m.material_type || null,
    weight: m.weight || null,
    finish: m.finish || null,
    description: m.description || null,
    is_verified: true,
    popularity: 0,
  });
}

console.log(`Prepared ${records.length} records`);
console.log(`Batches: HANAK=${hanak.length}, FullingMill=${fullingMill.length}, FFFVendors=${fffVendors.length}, TFF=${tff.length}, JS/FC=${jsFeatherCraft.length}`);

// Check for existing slugs
const { data: existing, error: fetchErr } = await supabase
  .from('tying_materials')
  .select('slug');
if (fetchErr) {
  console.error('Error fetching existing slugs:', fetchErr);
  process.exit(1);
}
const existingSlugs = new Set((existing || []).map(r => r.slug));
const newOnly = records.filter(r => !existingSlugs.has(r.slug));
const updates = records.filter(r => existingSlugs.has(r.slug));
console.log(`\nExisting in DB: ${existingSlugs.size}`);
console.log(`NEW (not in DB): ${newOnly.length}`);
console.log(`Will UPDATE (slug collision): ${updates.length}`);

if (updates.length > 0) {
  console.log('\nSlug collisions (these will be upserted/updated):');
  for (const u of updates) console.log(`  ${u.slug}`);
}

if (DRY_RUN) {
  console.log('\n[DRY RUN] No writes performed. Re-run without --dry-run to load.');
  process.exit(0);
}

// Upsert in chunks of 100
console.log('\nUpserting...');
const CHUNK = 100;
let totalOk = 0;
for (let i = 0; i < records.length; i += CHUNK) {
  const chunk = records.slice(i, i + CHUNK);
  const { data, error } = await supabase
    .from('tying_materials')
    .upsert(chunk, { onConflict: 'slug' })
    .select('slug');
  if (error) {
    console.error(`Chunk ${i}:`, error);
    process.exit(1);
  }
  totalOk += (data || []).length;
  console.log(`  Chunk ${i}-${i + chunk.length}: ${(data || []).length} upserted`);
}

console.log(`\nDONE. Upserted ${totalOk} records.`);
