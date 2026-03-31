/**
 * Seed Script: Fly-Tying Materials Database
 * ~1,000 real products across hooks, beads, threads, dubbing, feathers, flash, wire, and more.
 * Run: npx tsx scripts/seed-materials.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MaterialSeed {
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  sizes?: string[];
  colors?: string[];
  material_type?: string;
  weight?: string;
  finish?: string;
  description?: string;
}

function slugify(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// =============================================
// HOOKS (~200)
// =============================================
const hooks: MaterialSeed[] = [
  // Tiemco
  { name: 'TMC 100', brand: 'Tiemco', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20','22'], finish: 'standard', description: 'Standard dry fly hook, 1x fine wire' },
  { name: 'TMC 100SP-BL', brand: 'Tiemco', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Barbless dry fly, competition legal' },
  { name: 'TMC 2457', brand: 'Tiemco', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'standard', description: '2x heavy, 2x short nymph/scud hook' },
  { name: 'TMC 2488', brand: 'Tiemco', category: 'hook', subcategory: 'nymph', sizes: ['14','16','18','20','22','24'], finish: 'standard', description: 'Wide gape scud/emerger hook' },
  { name: 'TMC 2488H', brand: 'Tiemco', category: 'hook', subcategory: 'nymph', sizes: ['14','16','18','20','22'], finish: 'standard', description: 'Heavy wire version of 2488' },
  { name: 'TMC 3761', brand: 'Tiemco', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'standard', description: 'Standard nymph, 1x long, 1x heavy' },
  { name: 'TMC 3769', brand: 'Tiemco', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16'], finish: 'standard', description: '2x heavy nymph, sproat bend' },
  { name: 'TMC 5262', brand: 'Tiemco', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'standard', description: '2x long, 2x heavy streamer' },
  { name: 'TMC 5263', brand: 'Tiemco', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'standard', description: '3x long streamer hook' },
  { name: 'TMC 200R', brand: 'Tiemco', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16','18'], finish: 'standard', description: '3x long, curved nymph/stonefly' },
  { name: 'TMC 900BL', brand: 'Tiemco', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Barbless standard dry fly' },
  { name: 'TMC 102Y', brand: 'Tiemco', category: 'hook', subcategory: 'dry', sizes: ['15','17','19','21','23','25'], finish: 'standard', description: 'Fine wire dry, wide gape, down eye' },
  // Daiichi
  { name: '1130', brand: 'Daiichi', category: 'hook', subcategory: 'scud', sizes: ['10','12','14','16','18','20'], finish: 'standard', description: 'Wide gape scud/emerger hook' },
  { name: '1180', brand: 'Daiichi', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20','22'], finish: 'standard', description: 'Standard dry fly hook' },
  { name: '1190', brand: 'Daiichi', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Barbless dry fly' },
  { name: '1260', brand: 'Daiichi', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16','18'], finish: 'standard', description: '2x long curved nymph' },
  { name: '1510', brand: 'Daiichi', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'standard', description: 'Heavy nymph/wet fly hook' },
  { name: '1530', brand: 'Daiichi', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16'], finish: 'standard', description: 'Curved nymph, heavy wire' },
  { name: '1550', brand: 'Daiichi', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16'], finish: 'standard', description: 'Traditional wet fly/nymph' },
  { name: '1560', brand: 'Daiichi', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10','12'], finish: 'standard', description: '2x long, heavy wire streamer' },
  { name: '2220', brand: 'Daiichi', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'standard', description: '4x long streamer' },
  // Hanak
  { name: 'H450BL', brand: 'Hanak', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'Jig hook, wide gape, competition' },
  { name: 'H390BL', brand: 'Hanak', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'Jig hook, standard gape' },
  { name: 'H400BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18','20'], finish: 'barbless', description: 'Czech nymph, curved shank' },
  { name: 'H200BL', brand: 'Hanak', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Dry fly, barbless, fine wire' },
  { name: 'H130BL', brand: 'Hanak', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20','22'], finish: 'barbless', description: 'Klinkhamer style, wide gape' },
  { name: 'H333BL', brand: 'Hanak', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'Heavyweight jig nymph' },
  // Fulling Mill
  { name: '5050 Competition Heavyweight', brand: 'Fulling Mill', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'Competition jig hook, heavy wire' },
  { name: '5060 Grab Gape', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Wide gape nymph hook' },
  { name: '5045 Heavyweight Czech', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Czech nymph, curved, heavy' },
  { name: '35005 Dry Fly Supreme', brand: 'Fulling Mill', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Fine wire dry fly' },
  { name: '35045 All Purpose Nymph', brand: 'Fulling Mill', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: 'General purpose nymph' },
  // Firehole Sticks
  { name: '633', brand: 'Firehole Sticks', category: 'hook', subcategory: 'jig', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: '60 degree jig hook' },
  { name: '516', brand: 'Firehole Sticks', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'barbless', description: '1x long nymph/wet fly' },
  { name: '718', brand: 'Firehole Sticks', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'barbless', description: '3x long streamer' },
  { name: '413', brand: 'Firehole Sticks', category: 'hook', subcategory: 'dry', sizes: ['12','14','16','18','20'], finish: 'barbless', description: 'Standard dry fly' },
  { name: '811', brand: 'Firehole Sticks', category: 'hook', subcategory: 'scud', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Scud/emerger curved hook' },
  // Ahrex
  { name: 'FW501 Dry Fly Traditional', brand: 'Ahrex', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Traditional dry fly' },
  { name: 'FW510 Curved Dry', brand: 'Ahrex', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Emerger/curved dry' },
  { name: 'FW520 Emerger', brand: 'Ahrex', category: 'hook', subcategory: 'nymph', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Emerger/light nymph' },
  { name: 'FW531 Sedge Dry', brand: 'Ahrex', category: 'hook', subcategory: 'dry', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Caddis/sedge dry fly' },
  { name: 'FW550 Mini Jig', brand: 'Ahrex', category: 'hook', subcategory: 'jig', sizes: ['10','12','14','16','18'], finish: 'barbless', description: 'Mini jig hook' },
  { name: 'FW551 Barbless Jig', brand: 'Ahrex', category: 'hook', subcategory: 'jig', sizes: ['6','8','10','12','14','16'], finish: 'barbless', description: 'Standard jig hook barbless' },
  { name: 'FW560 Nymph Traditional', brand: 'Ahrex', category: 'hook', subcategory: 'nymph', sizes: ['6','8','10','12','14','16','18'], finish: 'barbless', description: 'Traditional nymph hook' },
  { name: 'FW580 Wet Fly', brand: 'Ahrex', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16'], finish: 'barbless', description: 'Wet fly/soft hackle' },
  { name: 'TP610 Trout Predator', brand: 'Ahrex', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'barbless', description: 'Streamer hook, strong wire' },
  // Gamakatsu
  { name: 'C12-BM', brand: 'Gamakatsu', category: 'hook', subcategory: 'nymph', sizes: ['8','10','12','14','16','18'], finish: 'standard', description: 'Nymph/wet, micro barb' },
  { name: 'R10-B', brand: 'Gamakatsu', category: 'hook', subcategory: 'dry', sizes: ['10','12','14','16','18','20'], finish: 'barbless', description: 'Barbless dry fly' },
  { name: 'S10-4S2', brand: 'Gamakatsu', category: 'hook', subcategory: 'streamer', sizes: ['2','4','6','8','10'], finish: 'standard', description: 'Stinger/streamer hook' },
];

// =============================================
// BEADS (~100)
// =============================================
const beads: MaterialSeed[] = [
  // Tungsten slotted
  ...['2.0mm','2.3mm','2.5mm','2.8mm','3.0mm','3.3mm','3.5mm','3.8mm','4.0mm','4.6mm','5.5mm'].flatMap(size =>
    ['Copper','Gold','Black Nickel','Silver','Matte Black'].map(color => ({
      name: `Tungsten Slotted Bead ${size} ${color}`,
      brand: 'Generic',
      category: 'bead' as const,
      subcategory: 'tungsten-slotted',
      sizes: [size],
      colors: [color.toLowerCase()],
      material_type: 'tungsten',
      finish: 'slotted',
      description: `Slotted tungsten bead, ${size}, ${color.toLowerCase()}`,
    }))
  ),
  // Hot beads
  ...['2.3mm','2.5mm','2.8mm','3.0mm','3.3mm','3.5mm'].flatMap(size =>
    ['Hot Orange','Hot Pink','Hot Chartreuse','Fluorescent Red'].map(color => ({
      name: `Tungsten Hot Bead ${size} ${color}`,
      brand: 'Generic',
      category: 'bead' as const,
      subcategory: 'tungsten-hot',
      sizes: [size],
      colors: [color.toLowerCase()],
      material_type: 'tungsten',
      finish: 'slotted',
      description: `Hot color tungsten bead, ${size}, ${color.toLowerCase()}`,
    }))
  ),
  // Brass beads
  ...['2.0mm','2.5mm','3.0mm','3.5mm','4.0mm'].flatMap(size =>
    ['Gold','Copper','Black Nickel'].map(color => ({
      name: `Brass Bead ${size} ${color}`,
      brand: 'Generic',
      category: 'bead' as const,
      subcategory: 'brass',
      sizes: [size],
      colors: [color.toLowerCase()],
      material_type: 'brass',
      finish: 'standard',
      description: `Brass bead, ${size}, ${color.toLowerCase()}`,
    }))
  ),
  // Countersunk tungsten
  ...['2.0mm','2.5mm','3.0mm','3.5mm','4.0mm'].flatMap(size =>
    ['Gold','Copper','Black Nickel'].map(color => ({
      name: `Tungsten Countersunk ${size} ${color}`,
      brand: 'Generic',
      category: 'bead' as const,
      subcategory: 'tungsten-countersunk',
      sizes: [size],
      colors: [color.toLowerCase()],
      material_type: 'tungsten',
      finish: 'countersunk',
      description: `Countersunk tungsten bead, ${size}, ${color.toLowerCase()}`,
    }))
  ),
  // Glass beads
  ...['small','medium','large'].flatMap(size =>
    ['Clear','Olive','Amber','Root Beer'].map(color => ({
      name: `Glass Bead ${size} ${color}`,
      brand: 'Generic',
      category: 'bead' as const,
      subcategory: 'glass',
      sizes: [size],
      colors: [color.toLowerCase()],
      material_type: 'glass',
      finish: 'standard',
      description: `Glass bead, ${size}, ${color.toLowerCase()}`,
    }))
  ),
];

// =============================================
// THREADS (~80)
// =============================================
const threads: MaterialSeed[] = [
  // Semperfli
  ...['Black','White','Red','Olive','Brown','Gray','Orange','Yellow','Pink','Purple','Tan','Cream'].map(color => ({
    name: `Nano Silk 30D ${color}`,
    brand: 'Semperfli',
    category: 'thread' as const,
    subcategory: 'nano-silk',
    sizes: ['30D'],
    colors: [color.toLowerCase()],
    material_type: 'GSP',
    weight: '30 denier',
    description: `Ultra-fine GSP thread, 30 denier, ${color.toLowerCase()}`,
  })),
  ...['Black','White','Red','Olive','Brown','Hot Orange','Fluorescent Pink','Gray'].map(color => ({
    name: `Nano Silk 18/0 ${color}`,
    brand: 'Semperfli',
    category: 'thread' as const,
    subcategory: 'nano-silk',
    sizes: ['18/0'],
    colors: [color.toLowerCase()],
    material_type: 'GSP',
    weight: '18/0',
    description: `Ultra-fine thread, 18/0, ${color.toLowerCase()}`,
  })),
  // UTC
  ...['Black','White','Red','Olive','Brown','Gray','Orange','Yellow','Tan','Rusty Brown','Wine','Chartreuse'].map(color => ({
    name: `Ultra Thread 70 ${color}`,
    brand: 'UTC',
    category: 'thread' as const,
    subcategory: 'standard',
    sizes: ['70 denier'],
    colors: [color.toLowerCase()],
    material_type: 'standard',
    weight: '70 denier',
    description: `Standard tying thread, 70 denier (6/0), ${color.toLowerCase()}`,
  })),
  ...['Black','White','Red','Olive','Brown','Tan'].map(color => ({
    name: `Ultra Thread 140 ${color}`,
    brand: 'UTC',
    category: 'thread' as const,
    subcategory: 'standard',
    sizes: ['140 denier'],
    colors: [color.toLowerCase()],
    material_type: 'standard',
    weight: '140 denier',
    description: `Heavy tying thread, 140 denier (3/0), ${color.toLowerCase()}`,
  })),
  // Veevus
  ...['Black','White','Olive','Brown','Red','Orange','Gray'].map(color => ({
    name: `Veevus 14/0 ${color}`,
    brand: 'Veevus',
    category: 'thread' as const,
    subcategory: 'fine',
    sizes: ['14/0'],
    colors: [color.toLowerCase()],
    material_type: 'standard',
    weight: '14/0',
    description: `Fine tying thread, 14/0, ${color.toLowerCase()}`,
  })),
  ...['Black','White','Olive','Brown','Red','Gray','Tan'].map(color => ({
    name: `Veevus 8/0 ${color}`,
    brand: 'Veevus',
    category: 'thread' as const,
    subcategory: 'standard',
    sizes: ['8/0'],
    colors: [color.toLowerCase()],
    material_type: 'standard',
    weight: '8/0',
    description: `Standard thread, 8/0, ${color.toLowerCase()}`,
  })),
  // UNI
  ...['Black','White','Red','Olive','Camel','Rusty Dun','Iron Gray','Fire Orange'].map(color => ({
    name: `UNI-Thread 8/0 ${color}`,
    brand: 'UNI Products',
    category: 'thread' as const,
    subcategory: 'standard',
    sizes: ['8/0'],
    colors: [color.toLowerCase()],
    material_type: 'waxed',
    weight: '8/0',
    description: `Waxed tying thread, 8/0, ${color.toLowerCase()}`,
  })),
  ...['Black','White','Red','Olive','Camel'].map(color => ({
    name: `UNI-Thread 6/0 ${color}`,
    brand: 'UNI Products',
    category: 'thread' as const,
    subcategory: 'standard',
    sizes: ['6/0'],
    colors: [color.toLowerCase()],
    material_type: 'waxed',
    weight: '6/0',
    description: `Waxed tying thread, 6/0, ${color.toLowerCase()}`,
  })),
];

// =============================================
// DUBBING (~150)
// =============================================
const dubbing: MaterialSeed[] = [
  // Hends Spectra
  ...Array.from({ length: 30 }, (_, i) => ({
    name: `Spectra Dubbing #${i + 1}`,
    brand: 'Hends',
    category: 'dubbing' as const,
    subcategory: 'synthetic',
    colors: [`#${i + 1}`],
    material_type: 'synthetic blend',
    description: `Fine synthetic dubbing, color #${i + 1}`,
  })),
  // Ice Dub
  ...['Peacock','Olive','Pheasant Tail','Tan','Brown','Black','UV Brown','UV Olive','UV Shrimp Pink','Hares Ear','Callibaetis','UV Pearl','UV Purple','UV Chartreuse','Rust Brown'].map(color => ({
    name: `Ice Dub ${color}`,
    brand: 'Hareline',
    category: 'dubbing' as const,
    subcategory: 'ice-dub',
    colors: [color.toLowerCase()],
    material_type: 'synthetic sparkle',
    description: `Sparkle dubbing with flash, ${color.toLowerCase()}`,
  })),
  // Superfine
  ...['Adams Gray','BWO Olive','Callibaetis','Cinnamon','Cream','Dark Olive','March Brown','PMD','Pale Morning Dun','Sulphur','Tan','Black'].map(color => ({
    name: `Superfine Dry Fly Dubbing ${color}`,
    brand: 'Hareline',
    category: 'dubbing' as const,
    subcategory: 'superfine',
    colors: [color.toLowerCase()],
    material_type: 'synthetic fine',
    description: `Ultra-fine dry fly dubbing, ${color.toLowerCase()}`,
  })),
  // SLF
  ...['Dark Hares Ear','Light Hares Ear','Olive','Dark Olive','Pheasant Tail','Fiery Brown','Claret','Black','Hot Orange','Squirrel'].map(color => ({
    name: `SLF Dubbing ${color}`,
    brand: 'Wapsi',
    category: 'dubbing' as const,
    subcategory: 'natural-blend',
    colors: [color.toLowerCase()],
    material_type: 'natural/synthetic blend',
    description: `SLF dubbing blend, ${color.toLowerCase()}`,
  })),
  // Natural
  { name: 'Hares Ear Dubbing Natural', brand: 'Hareline', category: 'dubbing', subcategory: 'natural', colors: ['natural'], material_type: 'natural rabbit', description: 'Natural hares ear dubbing, with guard hairs' },
  { name: 'Hares Ear Dubbing Dark', brand: 'Hareline', category: 'dubbing', subcategory: 'natural', colors: ['dark'], material_type: 'natural rabbit', description: 'Dark hares ear dubbing' },
  { name: 'Hares Ear Plus', brand: 'Hareline', category: 'dubbing', subcategory: 'natural', colors: ['natural','dark','olive','tan'], material_type: 'natural rabbit with flash', description: 'Hares ear with sparkle flash fibers' },
  { name: 'Rabbit Dubbing Natural', brand: 'Hareline', category: 'dubbing', subcategory: 'natural', colors: ['natural','olive','tan','brown','black','cream','orange'], material_type: 'natural rabbit', description: 'Fine rabbit dubbing' },
  { name: 'Squirrel Dubbing', brand: 'Hareline', category: 'dubbing', subcategory: 'natural', colors: ['natural','olive','brown','fox'], material_type: 'natural squirrel', description: 'Spiky squirrel dubbing, great for nymphs' },
  // Antron
  ...['Olive','Cream','Tan','Brown','Sulphur','PMD','BWO','Black','White','Gray','Orange','March Brown'].map(color => ({
    name: `Antron Dubbing ${color}`,
    brand: 'Wapsi',
    category: 'dubbing' as const,
    subcategory: 'antron',
    colors: [color.toLowerCase()],
    material_type: 'trilobal antron',
    description: `Antron sparkle dubbing, ${color.toLowerCase()}`,
  })),
];

// =============================================
// FEATHERS / HACKLE (~80)
// =============================================
const feathers: MaterialSeed[] = [
  // Whiting
  ...['Grizzly','White','Black','Brown','Dun','Ginger','Cream','Badger','Furnace','Coachman Brown'].map(color => ({
    name: `100s Saddle Hackle ${color}`,
    brand: 'Whiting Farms',
    category: 'feather' as const,
    subcategory: 'saddle-hackle',
    colors: [color.toLowerCase()],
    material_type: 'rooster saddle',
    description: `100-pack saddle hackle, ${color.toLowerCase()}`,
  })),
  ...['Grizzly','White','Black','Brown','Dun','Ginger','Cream'].map(color => ({
    name: `Pro Grade Cape ${color}`,
    brand: 'Whiting Farms',
    category: 'feather' as const,
    subcategory: 'dry-fly-cape',
    colors: [color.toLowerCase()],
    material_type: 'rooster cape',
    description: `Dry fly hackle cape, ${color.toLowerCase()}`,
  })),
  ...['Grizzly','Brown','Dun','Black','Cream'].map(color => ({
    name: `Hen Cape ${color}`,
    brand: 'Whiting Farms',
    category: 'feather' as const,
    subcategory: 'hen-hackle',
    colors: [color.toLowerCase()],
    material_type: 'hen cape',
    description: `Soft hackle hen cape, ${color.toLowerCase()}`,
  })),
  // CDC
  ...['Natural','White','Olive','Tan','Black','Dun','Brown'].map(color => ({
    name: `CDC Puffs ${color}`,
    brand: 'Hareline',
    category: 'feather' as const,
    subcategory: 'CDC',
    colors: [color.toLowerCase()],
    material_type: 'CDC',
    description: `CDC puffs, ${color.toLowerCase()}`,
  })),
  ...['Natural','Dun','Olive','Tan','Brown','White'].map(color => ({
    name: `CDC Feathers ${color}`,
    brand: 'Hareline',
    category: 'feather' as const,
    subcategory: 'CDC',
    colors: [color.toLowerCase()],
    material_type: 'CDC',
    description: `Bulk CDC feathers, ${color.toLowerCase()}`,
  })),
  // Partridge / Soft Hackle
  { name: 'Hungarian Partridge Skin', brand: 'Hareline', category: 'feather', subcategory: 'soft-hackle', colors: ['natural'], material_type: 'partridge', description: 'Hungarian partridge skin for soft hackles' },
  { name: 'Coq de Leon Feathers', brand: 'Whiting Farms', category: 'feather', subcategory: 'coq-de-leon', colors: ['medium pardo','dark pardo','indio','flor de escoba'], material_type: 'Coq de Leon', description: 'Spanish Coq de Leon feathers for tails and wings' },
  { name: 'Starling Skin', brand: 'Hareline', category: 'feather', subcategory: 'soft-hackle', colors: ['natural'], material_type: 'starling', description: 'Starling skin for soft hackle and wing cases' },
  // Marabou
  ...['White','Black','Olive','Brown','Yellow','Chartreuse','Tan','Gray','Orange','Sculpin Olive','Blood Red'].map(color => ({
    name: `Marabou Plumes ${color}`,
    brand: 'Hareline',
    category: 'feather' as const,
    subcategory: 'marabou',
    colors: [color.toLowerCase()],
    material_type: 'turkey marabou',
    description: `Marabou plumes, ${color.toLowerCase()}`,
  })),
  // Ostrich
  ...['Black','White','Olive','Brown','Tan','Gray'].map(color => ({
    name: `Ostrich Herl ${color}`,
    brand: 'Hareline',
    category: 'feather' as const,
    subcategory: 'ostrich',
    colors: [color.toLowerCase()],
    material_type: 'ostrich',
    description: `Ostrich herl plumes, ${color.toLowerCase()}`,
  })),
  // Peacock
  { name: 'Peacock Herl', brand: 'Hareline', category: 'feather', subcategory: 'peacock', colors: ['natural'], material_type: 'peacock', description: 'Natural peacock herl, full strung' },
  { name: 'Peacock Sword', brand: 'Hareline', category: 'feather', subcategory: 'peacock', colors: ['natural'], material_type: 'peacock sword', description: 'Peacock sword feathers' },
  // Pheasant
  { name: 'Ring-necked Pheasant Tail', brand: 'Hareline', category: 'feather', subcategory: 'pheasant', colors: ['natural'], material_type: 'pheasant tail', description: 'Pheasant tail fibers, the most essential material in fly tying' },
  { name: 'Pheasant Rump Feathers', brand: 'Hareline', category: 'feather', subcategory: 'pheasant', colors: ['natural','olive','brown'], material_type: 'pheasant rump', description: 'Pheasant rump feathers for soft hackle' },
];

// =============================================
// FLASH / RIBBING / WIRE (~80)
// =============================================
const flashAndWire: MaterialSeed[] = [
  // Flashabou
  ...['Pearl','Silver','Gold','Olive','Copper','Black','Holographic Silver','Holographic Gold','UV Pearl','Red','Orange','Chartreuse','Pink'].map(color => ({
    name: `Flashabou ${color}`,
    brand: 'Hedron',
    category: 'flash' as const,
    subcategory: 'flashabou',
    colors: [color.toLowerCase()],
    material_type: 'mylar',
    description: `Flashabou tinsel, ${color.toLowerCase()}`,
  })),
  // Krystal Flash
  ...['Pearl','UV Pearl','Olive','Gold','Copper','Black','Silver','Root Beer','Peacock','Chartreuse'].map(color => ({
    name: `Krystal Flash ${color}`,
    brand: 'Hedron',
    category: 'flash' as const,
    subcategory: 'krystal-flash',
    colors: [color.toLowerCase()],
    material_type: 'crystal',
    description: `Krystal Flash, ${color.toLowerCase()}`,
  })),
  // Ultra Wire
  ...['Brassie','Small','Medium','Large'].flatMap(size =>
    ['Copper','Gold','Silver','Red','Green','Black','Brown','Wine','Hot Orange','Chartreuse'].map(color => ({
      name: `Ultra Wire ${size} ${color}`,
      brand: 'UTC',
      category: 'wire' as const,
      subcategory: 'ultra-wire',
      sizes: [size.toLowerCase()],
      colors: [color.toLowerCase()],
      material_type: 'copper wire',
      description: `UTC Ultra Wire, ${size.toLowerCase()}, ${color.toLowerCase()}`,
    }))
  ),
  // French Tinsel
  ...['Gold','Silver','Copper'].flatMap(color =>
    ['Small','Medium','Large'].map(size => ({
      name: `French Tinsel ${size} ${color}`,
      brand: 'UNI Products',
      category: 'ribbing' as const,
      subcategory: 'french-tinsel',
      sizes: [size.toLowerCase()],
      colors: [color.toLowerCase()],
      material_type: 'flat tinsel',
      description: `French tinsel, ${size.toLowerCase()}, ${color.toLowerCase()}`,
    }))
  ),
  // Mylar Tinsel
  ...['Gold/Silver','Pearl','Copper','Red/Green','Black/Silver'].flatMap(color =>
    ['Small','Medium','Large'].map(size => ({
      name: `Mylar Tinsel ${size} ${color}`,
      brand: 'UNI Products',
      category: 'ribbing' as const,
      subcategory: 'mylar-tinsel',
      sizes: [size.toLowerCase()],
      colors: [color.toLowerCase()],
      material_type: 'mylar',
      description: `Mylar tinsel, ${size.toLowerCase()}, ${color.toLowerCase()}`,
    }))
  ),
];

// =============================================
// EVERYTHING ELSE (~100)
// Foam, rubber, synthetics, UV resin, etc.
// =============================================
const misc: MaterialSeed[] = [
  // Foam
  ...['White','Black','Olive','Tan','Yellow','Orange','Chartreuse'].flatMap(color =>
    ['1mm','2mm','3mm'].map(size => ({
      name: `Fly Foam Sheet ${size} ${color}`,
      brand: 'Hareline',
      category: 'foam' as const,
      subcategory: 'sheet',
      sizes: [size],
      colors: [color.toLowerCase()],
      material_type: 'closed cell EVA',
      description: `Fly tying foam sheet, ${size}, ${color.toLowerCase()}`,
    }))
  ),
  // Foam cylinders
  ...['White','Black','Olive','Tan','Yellow','Chartreuse'].map(color => ({
    name: `Foam Cylinders ${color}`,
    brand: 'Rainy\'s',
    category: 'foam' as const,
    subcategory: 'cylinder',
    sizes: ['small','medium','large'],
    colors: [color.toLowerCase()],
    material_type: 'closed cell',
    description: `Pre-cut foam cylinders, ${color.toLowerCase()}`,
  })),
  // Rubber legs
  ...['Black','White','Olive','Brown','Tan','Pumpkin','Barred Olive','Barred Tan','Barred Black','Speckled Orange','Centipede Tan'].map(color => ({
    name: `Round Rubber Legs ${color}`,
    brand: 'Hareline',
    category: 'rubber' as const,
    subcategory: 'round-legs',
    sizes: ['small','medium','large'],
    colors: [color.toLowerCase()],
    material_type: 'silicone rubber',
    description: `Round rubber legs, ${color.toLowerCase()}`,
  })),
  ...['Olive/Black','Tan/Brown','White/Black','Chartreuse/Black'].map(color => ({
    name: `Barred Sili Legs ${color}`,
    brand: 'Hareline',
    category: 'rubber' as const,
    subcategory: 'sili-legs',
    colors: [color.toLowerCase()],
    material_type: 'silicone',
    description: `Barred silicone legs, ${color.toLowerCase()}`,
  })),
  // UV Resin
  { name: 'UV Clear Fly Finish Thin', brand: 'Loon Outdoors', category: 'resin', subcategory: 'UV-resin', material_type: 'UV cure', description: 'Thin UV cure resin for wing cases and coatings' },
  { name: 'UV Clear Fly Finish Thick', brand: 'Loon Outdoors', category: 'resin', subcategory: 'UV-resin', material_type: 'UV cure', description: 'Thick UV cure resin for building heads' },
  { name: 'UV Clear Fly Finish Flow', brand: 'Loon Outdoors', category: 'resin', subcategory: 'UV-resin', material_type: 'UV cure', description: 'Flow-formula UV resin, self-leveling' },
  { name: 'Solarez Bone Dry', brand: 'Solarez', category: 'resin', subcategory: 'UV-resin', material_type: 'UV cure', description: 'UV cure resin, bone dry finish' },
  { name: 'Solarez Thin Hard', brand: 'Solarez', category: 'resin', subcategory: 'UV-resin', material_type: 'UV cure', description: 'Thin hard UV cure resin' },
  // Synthetic fibers
  ...['White','Black','Olive','Tan','Brown','Sculpin Olive','Chartreuse'].map(color => ({
    name: `EP Fiber ${color}`,
    brand: 'Enrico Puglisi',
    category: 'synthetic' as const,
    subcategory: 'EP-fiber',
    colors: [color.toLowerCase()],
    material_type: 'synthetic fiber',
    description: `EP synthetic fiber for streamers, ${color.toLowerCase()}`,
  })),
  ...['Pearl','Olive','Brown','Black','White','UV Chartreuse'].map(color => ({
    name: `Ice Chenille ${color}`,
    brand: 'Hareline',
    category: 'chenille' as const,
    subcategory: 'ice-chenille',
    colors: [color.toLowerCase()],
    sizes: ['small','medium','large'],
    material_type: 'ice chenille',
    description: `Ice chenille, ${color.toLowerCase()}`,
  })),
  // Vernille / micro chenille
  ...['Black','White','Olive','Red','Tan','Brown','Cream','Midge Green','Midge Red'].map(color => ({
    name: `Micro Chenille ${color}`,
    brand: 'Hareline',
    category: 'chenille' as const,
    subcategory: 'micro',
    colors: [color.toLowerCase()],
    sizes: ['micro'],
    material_type: 'micro chenille',
    description: `Micro chenille (vernille), ${color.toLowerCase()}`,
  })),
  // Eyes
  { name: 'Dumbbell Eyes Lead', brand: 'Hareline', category: 'eye', subcategory: 'dumbbell', sizes: ['small','medium','large','extra-large'], colors: ['plain','painted black','painted red/white','painted chartreuse'], material_type: 'lead', description: 'Lead dumbbell eyes for weighted streamers' },
  { name: 'Bead Chain Eyes', brand: 'Hareline', category: 'eye', subcategory: 'bead-chain', sizes: ['small','medium','large'], colors: ['silver','gold','black'], material_type: 'metal', description: 'Bead chain eyes, moderate weight' },
  { name: 'Pseudo Eyes', brand: 'Hareline', category: 'eye', subcategory: 'pseudo', sizes: ['3mm','4mm','5mm','6mm'], colors: ['clear','amber','chartreuse','red'], material_type: 'epoxy', description: 'Stick-on 3D molded eyes' },
  // Biots
  ...['Natural','Olive','Brown','Black','Tan','Red','Orange','BWO'].map(color => ({
    name: `Goose Biot ${color}`,
    brand: 'Hareline',
    category: 'feather' as const,
    subcategory: 'biot',
    colors: [color.toLowerCase()],
    material_type: 'goose biot',
    description: `Goose biots for tails and bodies, ${color.toLowerCase()}`,
  })),
  // Scud backs
  ...['Clear','Olive','Tan','Orange'].map(color => ({
    name: `Scud Back ${color}`,
    brand: 'Hareline',
    category: 'synthetic' as const,
    subcategory: 'scud-back',
    colors: [color.toLowerCase()],
    sizes: ['1/8"','3/16"','1/4"'],
    material_type: 'stretch vinyl',
    description: `Scud/shrimp back material, ${color.toLowerCase()}`,
  })),
  // Thin skin
  ...['Mottled Oak','Mottled Olive','Black','Brown','Golden Stone'].map(color => ({
    name: `Thin Skin ${color}`,
    brand: 'Hareline',
    category: 'synthetic' as const,
    subcategory: 'thin-skin',
    colors: [color.toLowerCase()],
    material_type: 'printed synthetic',
    description: `Thin skin wing case material, ${color.toLowerCase()}`,
  })),
];

async function seed() {
  const allMaterials = [...hooks, ...beads, ...threads, ...dubbing, ...feathers, ...flashAndWire, ...misc];
  console.log(`Seeding ${allMaterials.length} tying materials...`);

  // Prepare rows
  const rows = allMaterials.map(m => ({
    slug: slugify(m.brand, m.name),
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
  }));

  // Deduplicate slugs
  const seen = new Set<string>();
  const uniqueRows = rows.filter(r => {
    if (seen.has(r.slug)) return false;
    seen.add(r.slug);
    return true;
  });

  console.log(`${uniqueRows.length} unique materials after deduplication`);

  // Batch insert (Supabase limit is 1000 per request)
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < uniqueRows.length; i += batchSize) {
    const batch = uniqueRows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('tying_materials')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} materials`);
    }
  }

  console.log(`Done! ${inserted} materials seeded.`);

  // Print category breakdown
  const categoryCount = new Map<string, number>();
  uniqueRows.forEach(r => {
    categoryCount.set(r.category, (categoryCount.get(r.category) || 0) + 1);
  });
  console.log('\nCategory breakdown:');
  for (const [cat, count] of Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

seed().catch(console.error);
