-- =============================================
-- USGS River Gauge Population
-- Converts usgs_gauge_id from text → jsonb to support multiple gauges per river (sections)
-- =============================================

-- Step 1: Add a new jsonb column for structured gauge data
ALTER TABLE rivers ADD COLUMN IF NOT EXISTS usgs_gauges jsonb;

-- Step 2: Populate gauges for all US rivers
-- Format: [{"site_id": "...", "name": "...", "section": "..."}]

-- Provo River (UT) — Upper / Middle / Lower
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "10154200", "name": "Near Woodland", "section": "Upper Provo"},
  {"site_id": "10155100", "name": "Below Jordanelle Dam", "section": "Middle Provo"},
  {"site_id": "10155500", "name": "Near Charleston", "section": "Middle Provo (Heber Valley)"},
  {"site_id": "10159500", "name": "Below Deer Creek Dam", "section": "Lower Provo"},
  {"site_id": "10163000", "name": "At Provo", "section": "Lower Provo (Canyon)"}
]'::jsonb WHERE id = 'provo-river';

-- Madison River (MT) — Upper / Middle / Bear Trap
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06037500", "name": "Near West Yellowstone", "section": "Upper Madison"},
  {"site_id": "06038500", "name": "Below Hebgen Lake", "section": "Upper Madison (50-Mile Riffle)"},
  {"site_id": "06040000", "name": "Near Cameron", "section": "Middle Madison"},
  {"site_id": "06041000", "name": "Below Ennis Lake", "section": "Bear Trap Canyon"}
]'::jsonb WHERE id = 'river-madison';

-- Gallatin River (MT)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06043120", "name": "Above Deer Creek (Big Sky)", "section": "Upper Gallatin"},
  {"site_id": "06043500", "name": "Near Gallatin Gateway", "section": "Lower Canyon"}
]'::jsonb WHERE id = 'river-gallatin';

-- Yellowstone River (MT)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06191500", "name": "At Corwin Springs", "section": "Upper (Paradise Valley)"},
  {"site_id": "06192500", "name": "Near Livingston", "section": "Middle (Livingston)"}
]'::jsonb WHERE id = 'river-yellowstone';

-- Missouri River (MT)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06065500", "name": "Below Hauser Dam", "section": "Hauser Tailwater"},
  {"site_id": "06066500", "name": "Below Holter Dam", "section": "Holter Tailwater (Craig)"},
  {"site_id": "06074000", "name": "At Cascade", "section": "Mid-Canyon"}
]'::jsonb WHERE id = 'river-missouri';

-- Big Hole River (MT)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06024450", "name": "At Wisdom", "section": "Upper Big Hole"},
  {"site_id": "06024580", "name": "Near Wise River", "section": "Middle Big Hole"},
  {"site_id": "06025500", "name": "Near Melrose", "section": "Lower Big Hole"}
]'::jsonb WHERE id = 'river-big-hole';

-- Rock Creek (MT)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "12334510", "name": "Near Clinton", "section": "Rock Creek"}
]'::jsonb WHERE id = 'river-rock-creek';

-- Snake River (WY)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "13011000", "name": "Near Moran", "section": "Below Jackson Lake Dam"},
  {"site_id": "13013650", "name": "At Moose", "section": "Grand Teton (Moose-Wilson)"},
  {"site_id": "13022500", "name": "Above Reservoir near Alpine", "section": "Snake River Canyon"}
]'::jsonb WHERE id = 'river-snake-river';

-- North Platte River (WY)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06642000", "name": "At Alcova", "section": "Miracle Mile"},
  {"site_id": "06643500", "name": "Near Goose Egg", "section": "Grey Reef"},
  {"site_id": "06652800", "name": "Below Glendo Reservoir", "section": "Glendo Tailwater"}
]'::jsonb WHERE id = 'river-north-platte-wy';

-- Firehole River (YNP)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06036805", "name": "At Old Faithful", "section": "Upper Firehole"},
  {"site_id": "06036905", "name": "Near West Yellowstone", "section": "Lower Firehole"}
]'::jsonb WHERE id = 'river-firehole';

-- South Platte River (CO)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06700000", "name": "Above Cheesman Lake", "section": "Deckers"},
  {"site_id": "06701900", "name": "Below Cheesman Dam", "section": "Cheesman Canyon"}
]'::jsonb WHERE id = 'river-south-platte';

-- Arkansas River (CO)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "07087200", "name": "At Buena Vista", "section": "Upper Arkansas"},
  {"site_id": "07094500", "name": "At Parkdale", "section": "Royal Gorge"},
  {"site_id": "07109500", "name": "Below Pueblo Dam", "section": "Pueblo Tailwater"}
]'::jsonb WHERE id = 'river-arkansas-co';

-- Frying Pan River (CO)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "09080400", "name": "Near Ruedi", "section": "Below Ruedi Dam"}
]'::jsonb WHERE id = 'river-frying-pan';

-- Henry's Fork (ID)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "13041010", "name": "Below Coffee Pot Rapids", "section": "Box Canyon"},
  {"site_id": "13042500", "name": "Near Island Park", "section": "Harriman (Railroad Ranch)"},
  {"site_id": "13046000", "name": "Near Ashton", "section": "Lower Henry''s Fork"}
]'::jsonb WHERE id = 'river-henry-s-fork';

-- Silver Creek (ID)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "13150430", "name": "At Sportsman Access", "section": "Silver Creek Preserve"}
]'::jsonb WHERE id = 'river-silver-creek';

-- South Fork Boise (ID)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "13190500", "name": "At Anderson Ranch Dam", "section": "Below Anderson Ranch Dam"},
  {"site_id": "13192200", "name": "At Neal Bridge", "section": "Lower South Fork"}
]'::jsonb WHERE id = 'river-south-fork-boise';

-- Kenai River (AK)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "15258000", "name": "At Cooper Landing", "section": "Upper Kenai"},
  {"site_id": "15266110", "name": "Below Skilak Lake Outlet", "section": "Middle Kenai"},
  {"site_id": "15266300", "name": "At Soldotna", "section": "Lower Kenai"}
]'::jsonb WHERE id = 'river-kenai';

-- Deschutes River (OR)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "14056500", "name": "Below Wickiup Reservoir", "section": "Upper Deschutes"},
  {"site_id": "14092500", "name": "Near Madras", "section": "Lower Deschutes"},
  {"site_id": "14103000", "name": "At Moody near Biggs", "section": "Lower Deschutes (Mouth)"}
]'::jsonb WHERE id = 'river-deschutes';

-- Rogue River (OR)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "14335072", "name": "At Cole Rivers Hatchery", "section": "Holy Water (Below Lost Creek Dam)"},
  {"site_id": "14339000", "name": "At Dodge Bridge", "section": "Middle Rogue"},
  {"site_id": "14361500", "name": "At Grants Pass", "section": "Lower Rogue"}
]'::jsonb WHERE id = 'river-rogue';

-- McKenzie River (OR)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "14158850", "name": "Below Trail Bridge Dam", "section": "Upper McKenzie"},
  {"site_id": "14162500", "name": "Near Vida", "section": "Middle McKenzie"},
  {"site_id": "14163150", "name": "Below Leaburg Dam", "section": "Lower McKenzie"}
]'::jsonb WHERE id = 'river-mckenzie';

-- Letort Spring Run (PA)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "01569800", "name": "Near Carlisle", "section": "Letort Spring Run"}
]'::jsonb WHERE id = 'river-letort-spring-run';

-- Big Spring Creek (MT)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "06111800", "name": "Near Lewistown", "section": "Big Spring Creek"}
]'::jsonb WHERE id = 'river-big-spring';

-- Penns Creek (PA)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "01555000", "name": "At Penns Creek", "section": "Penns Creek"}
]'::jsonb WHERE id = 'river-penns-creek';

-- Au Sable River (MI)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "04135500", "name": "At Grayling", "section": "Holy Waters"},
  {"site_id": "04135700", "name": "South Branch near Luzerne", "section": "South Branch (Mason Tract)"},
  {"site_id": "04136500", "name": "At Mio", "section": "Below Mio Dam"}
]'::jsonb WHERE id = 'river-au-sable';

-- Pere Marquette River (MI)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "04122500", "name": "At Scottville", "section": "Pere Marquette River"}
]'::jsonb WHERE id = 'river-pere-marquette';

-- Manistee River (MI)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "04123500", "name": "Near Grayling", "section": "Upper Manistee"},
  {"site_id": "04124200", "name": "Near Mesick", "section": "Above Tippy Dam"},
  {"site_id": "04125550", "name": "Near Wellston", "section": "Below Tippy Dam"}
]'::jsonb WHERE id = 'river-manistee';

-- White River (AR)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "07057370", "name": "Near Norfork", "section": "Below Bull Shoals Dam"},
  {"site_id": "07060500", "name": "At Calico Rock", "section": "Middle Tailwater"}
]'::jsonb WHERE id = 'river-white-river-ar';

-- Norfork River (AR) — uses White River gauge as proxy
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "07057370", "name": "White River near Norfork", "section": "Norfork Tailwater Area"}
]'::jsonb WHERE id = 'river-norfork';

-- Little Red River (AR)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "07076000", "name": "Near Heber Springs", "section": "Below Greers Ferry Dam"},
  {"site_id": "07076517", "name": "Near Dewey", "section": "Lower Tailwater"}
]'::jsonb WHERE id = 'river-little-red';

-- Copper River (AK)
UPDATE rivers SET usgs_gauges = '[
  {"site_id": "15214000", "name": "At Million Dollar Bridge", "section": "Lower Copper River"}
]'::jsonb WHERE id = 'river-copper-river';

-- No USGS gauges for international rivers:
-- river-moy (Ireland), river-ponoi (Russia), river-eg-uur (Mongolia),
-- river-jardines-de-la-reina (Cuba), river-north-male-atoll (Maldives),
-- river-florida-keys-flats (saltwater flats, not river gauges)
-- river-bristol-bay (too many tributaries, no single gauge)
