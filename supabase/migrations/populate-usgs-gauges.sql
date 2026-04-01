-- =============================================
-- USGS River Gauge Population
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Stores JSON gauge arrays in the existing usgs_gauge_id text column
-- =============================================

-- Provo River (UT) — 4 gauges across Upper/Middle/Lower
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"10154200","name":"Near Woodland","section":"Upper Provo"},{"site_id":"10155100","name":"Below Jordanelle Dam","section":"Middle Provo"},{"site_id":"10159500","name":"Below Deer Creek Dam","section":"Lower Provo"},{"site_id":"10163000","name":"At Provo","section":"Lower Provo (Canyon)"}]' WHERE id = 'provo-river';

-- Madison River (MT) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06038500","name":"Below Hebgen Lake","section":"Upper Madison (50-Mile Riffle)"},{"site_id":"06040000","name":"Near Cameron","section":"Middle Madison"},{"site_id":"06041000","name":"Below Ennis Lake","section":"Bear Trap Canyon"}]' WHERE id = 'river-madison';

-- Gallatin River (MT) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06043120","name":"Above Deer Creek (Big Sky)","section":"Upper Gallatin"},{"site_id":"06043500","name":"Near Gallatin Gateway","section":"Lower Canyon"}]' WHERE id = 'river-gallatin';

-- Yellowstone River (MT) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06191500","name":"At Corwin Springs","section":"Upper (Paradise Valley)"},{"site_id":"06192500","name":"Near Livingston","section":"Middle (Livingston)"}]' WHERE id = 'river-yellowstone';

-- Missouri River (MT) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06065500","name":"Below Hauser Dam","section":"Hauser Tailwater"},{"site_id":"06066500","name":"Below Holter Dam","section":"Holter Tailwater (Craig)"},{"site_id":"06074000","name":"At Cascade","section":"Mid-Canyon"}]' WHERE id = 'river-missouri';

-- Big Hole River (MT) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06024450","name":"At Wisdom","section":"Upper Big Hole"},{"site_id":"06024580","name":"Near Wise River","section":"Middle Big Hole"},{"site_id":"06025500","name":"Near Melrose","section":"Lower Big Hole"}]' WHERE id = 'river-big-hole';

-- Rock Creek (MT) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"12334510","name":"Near Clinton","section":"Rock Creek"}]' WHERE id = 'river-rock-creek';

-- Snake River (WY) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"13011000","name":"Near Moran","section":"Below Jackson Lake Dam"},{"site_id":"13013650","name":"At Moose","section":"Grand Teton (Moose-Wilson)"},{"site_id":"13022500","name":"Near Alpine","section":"Snake River Canyon"}]' WHERE id = 'river-snake-river';

-- North Platte River (WY) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06642000","name":"At Alcova","section":"Miracle Mile"},{"site_id":"06643500","name":"Near Goose Egg","section":"Grey Reef"},{"site_id":"06652800","name":"Below Glendo Reservoir","section":"Glendo Tailwater"}]' WHERE id = 'river-north-platte-wy';

-- Firehole River (YNP) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06036805","name":"At Old Faithful","section":"Upper Firehole"},{"site_id":"06036905","name":"Near West Yellowstone","section":"Lower Firehole"}]' WHERE id = 'river-firehole';

-- South Platte River (CO) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06700000","name":"Above Cheesman Lake","section":"Deckers"},{"site_id":"06701900","name":"Below Cheesman Dam","section":"Cheesman Canyon"}]' WHERE id = 'river-south-platte';

-- Arkansas River (CO) — 3 gauges (Parkdale 07094500 dead, replaced with Wellsville 07093700)
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"07087200","name":"At Buena Vista","section":"Upper Arkansas"},{"site_id":"07093700","name":"Near Wellsville","section":"Royal Gorge"},{"site_id":"07109500","name":"Below Pueblo Dam","section":"Pueblo Tailwater"}]' WHERE id = 'river-arkansas-co';

-- Frying Pan River (CO) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"09080400","name":"Near Ruedi","section":"Below Ruedi Dam"}]' WHERE id = 'river-frying-pan';

-- Henry's Fork (ID) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"13041010","name":"Below Coffee Pot Rapids","section":"Box Canyon"},{"site_id":"13042500","name":"Near Island Park","section":"Harriman (Railroad Ranch)"},{"site_id":"13046000","name":"Near Ashton","section":"Lower Henrys Fork"}]' WHERE id = 'river-henry-s-fork';

-- Silver Creek (ID) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"13150430","name":"At Sportsman Access","section":"Silver Creek Preserve"}]' WHERE id = 'river-silver-creek';

-- South Fork Boise (ID) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"13190500","name":"At Anderson Ranch Dam","section":"Below Anderson Ranch Dam"},{"site_id":"13192200","name":"At Neal Bridge","section":"Lower South Fork"}]' WHERE id = 'river-south-fork-boise';

-- Kenai River (AK) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"15258000","name":"At Cooper Landing","section":"Upper Kenai"},{"site_id":"15266110","name":"Below Skilak Lake","section":"Middle Kenai"},{"site_id":"15266300","name":"At Soldotna","section":"Lower Kenai"}]' WHERE id = 'river-kenai';

-- Deschutes River (OR) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"14056500","name":"Below Wickiup Reservoir","section":"Upper Deschutes"},{"site_id":"14092500","name":"Near Madras","section":"Lower Deschutes"},{"site_id":"14103000","name":"At Moody near Biggs","section":"Lower Deschutes (Mouth)"}]' WHERE id = 'river-deschutes';

-- Rogue River (OR) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"14335072","name":"At Cole Rivers Hatchery","section":"Holy Water (Below Lost Creek Dam)"},{"site_id":"14339000","name":"At Dodge Bridge","section":"Middle Rogue"},{"site_id":"14361500","name":"At Grants Pass","section":"Lower Rogue"}]' WHERE id = 'river-rogue';

-- McKenzie River (OR) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"14158850","name":"Below Trail Bridge Dam","section":"Upper McKenzie"},{"site_id":"14162500","name":"Near Vida","section":"Middle McKenzie"},{"site_id":"14163150","name":"Below Leaburg Dam","section":"Lower McKenzie"}]' WHERE id = 'river-mckenzie';

-- Letort Spring Run (PA) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"01569800","name":"Near Carlisle","section":"Letort Spring Run"}]' WHERE id = 'river-letort-spring-run';

-- Big Spring Creek (MT) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"06111800","name":"Near Lewistown","section":"Big Spring Creek"}]' WHERE id = 'river-big-spring';

-- Penns Creek (PA) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"01555000","name":"At Penns Creek","section":"Penns Creek"}]' WHERE id = 'river-penns-creek';

-- Au Sable River (MI) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"04135500","name":"At Grayling","section":"Holy Waters"},{"site_id":"04135700","name":"South Branch near Luzerne","section":"South Branch (Mason Tract)"},{"site_id":"04136500","name":"At Mio","section":"Below Mio Dam"}]' WHERE id = 'river-au-sable';

-- Pere Marquette River (MI) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"04122500","name":"At Scottville","section":"Pere Marquette River"}]' WHERE id = 'river-pere-marquette';

-- Manistee River (MI) — 3 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"04123500","name":"Near Grayling","section":"Upper Manistee"},{"site_id":"04124200","name":"Near Mesick","section":"Above Tippy Dam"},{"site_id":"04125550","name":"Near Wellston","section":"Below Tippy Dam"}]' WHERE id = 'river-manistee';

-- White River (AR) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"07057370","name":"Near Norfork","section":"Below Bull Shoals Dam"},{"site_id":"07060500","name":"At Calico Rock","section":"Middle Tailwater"}]' WHERE id = 'river-white-river-ar';

-- Norfork River (AR) — 1 gauge (all actual North Fork gauges discontinued; Army Corps controls dam releases)
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"07057370","name":"White River near Norfork","section":"Norfork Tailwater (White River gauge)"}]' WHERE id = 'river-norfork';

-- Little Red River (AR) — 2 gauges
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"07076000","name":"Near Heber Springs","section":"Below Greers Ferry Dam"},{"site_id":"07076517","name":"Near Dewey","section":"Lower Tailwater"}]' WHERE id = 'river-little-red';

-- Copper River (AK) — 1 gauge
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"15214000","name":"At Million Dollar Bridge","section":"Lower Copper River"}]' WHERE id = 'river-copper-river';

-- Bristol Bay (AK) — no single gauge (too many tributaries)
-- Florida Keys Flats — saltwater, no river gauges
-- River Moy (Ireland) — no USGS coverage
-- Ponoi River (Russia) — no USGS coverage
-- Eg-Uur River (Mongolia) — no USGS coverage
-- Jardines de la Reina (Cuba) — no USGS coverage
-- North Malé Atoll (Maldives) — no USGS coverage
