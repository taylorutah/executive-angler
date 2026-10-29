-- Arizona Rim waters (18 rows). Insert-only; ON CONFLICT DO NOTHING.
-- Apply in Supabase after merge. Do not run from CI against production without approval.
-- Prepared 2026-10-29 for Executive Angler.

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-oak-creek-arizona',
  'oak-creek-arizona',
  'Oak Creek',
  'dest-arizona',
  'Oak Creek cuts through red rock country north of Sedona on Coconino National Forest land. The fly-fishing reach most anglers mean runs along State Route 89A from Sedona toward Pine Flat, where stocked rainbow trout and wild brown trout hold in pocket water and long glides. Arizona Game and Fish lists Oak Creek as a hatchery Gila trout water and reports summer flows near Sedona in the low 30s cfs with water temperatures that can climb past 67 degrees by mid-July, so plan around heat the same way you would on any Rim Country creek.

Special regulations matter here. Commission Order 40 makes the stretch from the Slide Rock State Park bridge upstream to the Sterling Springs Hatchery line catch and release for trout on artificial flies and lures with barbless hooks, including West Fork Oak Creek. Below Slide Rock, statewide trout limits apply while bass and catfish remain unlimited. Live baitfish are not allowed in Coconino County.

We have not published a month-by-month hatch chart or a hosted hero photograph for this page yet. Use the USGS gauge mapped below for flows, carry a thermometer in summer, and confirm current AZGFD stocking and access notices before you drive. Slide Rock and Grasshopper Point day-use coordinates are still on our sourcing list.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'spring creek',
  'intermediate',
  'wade',
  ARRAY['Rainbow Trout', 'Brown Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. From the State Route 89A bridge at Slide Rock State Park upstream to the Sterling Springs Hatchery property line, including West Fork Oak Creek: catch and release for trout only, artificial fly and lure only, barbless hooks. Below Slide Rock, statewide trout limits apply. Bass and catfish are unlimited. Live baitfish are prohibited in Coconino County waters.',
  '[{"name":"Manzanita Campground","latitude":34.94167,"longitude":-111.74167,"parking":true,"description":"Coconino National Forest campground on Oak Creek (Recreation.gov facility 234287)."},{"name":"Cave Springs Campground","latitude":34.99639,"longitude":-111.73917,"parking":true,"description":"USFS campground on Oak Creek above Sedona (Recreation.gov 232194)."},{"name":"Pine Flat Campground West","latitude":35.0125,"longitude":-111.73806,"parking":true,"description":"Upper canyon campground on Oak Creek (Recreation.gov 232320)."}]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  34.852,
  -111.8395,
  '{"sw":[34.678,-111.942],"ne":[35.026,-111.737]}'::jsonb,
  '[]'::jsonb,
  'Oak Creek Arizona Fly Fishing Guide | Executive Angler',
  'Fly fishing Oak Creek above Sedona, Arizona. C&R trout above Slide Rock, USGS 09504420, forest campground access, and CO40 regulations.',
  false,
  '[{"site_id":"09504420","name":"Oak Creek near Sedona, AZ","section":"Oak Creek canyon"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-west-fork-oak-creek',
  'west-fork-oak-creek',
  'West Fork Oak Creek',
  'dest-arizona',
  'West Fork Oak Creek is the narrow canyon tributary that joins mainstem Oak Creek near Call of the Canyon. It is one of the most photographed walks in Arizona, but the fishing is technical pocket water governed by strict trout rules. Commission Order 40 lists West Fork Oak Creek as catch and release for trout on artificial flies and lures with barbless hooks only.

A live USGS station near the mouth reports flows for the West Fork reach. We do not yet have verified public trailhead coordinates or day-use fee language stored for Call of the Canyon, and we have not confirmed a published species list for this fork in AZGFD documents used for this page. Treat trout as the managed target under the special regulation and release everything you cannot identify with confidence.

There is no month-by-month hatch chart on file and no hosted hero image yet. Pair this page with the main Oak Creek guide for forest access context, and check Coconino National Forest notices for parking or seasonal restrictions before you hike in.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'spring creek',
  'intermediate',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. West Fork Oak Creek: catch and release for trout only, artificial fly and lure only, barbless hooks (Commission Order 40).',
  '[]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  35.0165,
  -111.83,
  '{"sw":[34.987,-111.914],"ne":[35.046,-111.746]}'::jsonb,
  '[]'::jsonb,
  'West Fork Oak Creek Fly Fishing Guide | Executive Angler',
  'West Fork Oak Creek near Sedona: C&R trout water, USGS 09504350, barbless fly and lure rules under Arizona CO40 (2025-26).',
  false,
  '[{"site_id":"09504350","name":"West Fork Oak Creek near Sedona, AZ","section":"West Fork canyon"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-east-verde-river-arizona',
  'east-verde-river',
  'East Verde River',
  'dest-arizona',
  'The East Verde River drains the Mogollon Rim country between Payson and Pine. The upper river carries wild rainbow trout and receives hatchery plants on AZGFD schedules, while the lower canyon warms and holds smallmouth bass. Arizona Game and Fish lists the East Verde as a hatchery Gila trout water and notes terrestrials and standard western nymphs during summer reports, but we have not turned those seasonal fly notes into a stored hatch chart.

Commission Order 40 requires catch and release for trout from the source to the Salt River Project pumphouse on artificial flies and lures with single-pointed barbless hooks. Below the pumphouse, statewide trout limits return. Two USGS stations cover the pipeline diversion near Pine and the lower river near Childs.

Public access names such as the SRP pumphouse, Water Wheel, and Second Crossing still need sourced coordinates before we map them. There is no hosted hero photograph yet. Use the gauges for flow context, fish early when Rim Country creeks warm, and confirm stocking on the current AZGFD fishing report.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY['Rainbow Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. From the source downstream to the Salt River Project pumphouse: catch and release for trout only, artificial fly and lure only, single-pointed barbless hooks. Below the pumphouse, statewide trout limits apply. Bass and catfish are unlimited.',
  '[]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  34.3365,
  -111.4585,
  '{"sw":[34.223,-111.665],"ne":[34.45,-111.252]}'::jsonb,
  '[]'::jsonb,
  'East Verde River Arizona Fly Fishing Guide | Executive Angler',
  'East Verde River near Payson and Pine: wild and stocked rainbows, C&R upper water, two USGS gauges, and CO40 barbless fly rules.',
  false,
  '[{"site_id":"09507580","name":"East Verde River diversion from East Clear Creek near Pine, AZ","section":"C.C. Cragin pipeline release"},{"site_id":"09507980","name":"East Verde River near Childs, AZ","section":"Lower East Verde"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-east-clear-creek-arizona',
  'east-clear-creek',
  'East Clear Creek',
  'dest-arizona',
  'East Clear Creek flows off the Mogollon Rim toward the Little Colorado River drainage. Most anglers reach it from the Blue Ridge and C.C. Cragin Reservoir area, where East Clear Creek is impounded for municipal supply. Commission Order 40 does not list a special trout rule for the creek itself, so statewide trout limits apply unless AZGFD updates the booklet.

We do not yet store a confirmed sport-fish species list for the creek reach independent of the reservoir. Native Little Colorado spinedace are a concern in this system, so identify fish carefully and avoid handling non-target species unnecessarily. Kinder Crossing and Horse Crossing trailheads are named in forest literature but lack verified coordinates on this page.

There is no live USGS stream gauge on East Clear Creek in our mapping. The Clear Creek near Winslow station is a different river system and is intentionally not linked here. Hatch chart and hero image remain empty pending sourced entomology and photography.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. No special trout regulation is listed for East Clear Creek in Commission Order 40; statewide trout limits apply. Native Little Colorado spinedace occur in this drainage and deserve careful handling.',
  '[{"name":"Rock Crossing Campground","latitude":34.56433,"longitude":-111.21875,"parking":true,"description":"Campground at Blue Ridge and C.C. Cragin Reservoir, which impounds East Clear Creek (Recreation.gov 10107666)."}]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.546,
  -111.1905,
  '{"sw":[34.465,-111.341],"ne":[34.627,-111.04]}'::jsonb,
  '[]'::jsonb,
  'East Clear Creek Arizona Fly Fishing Guide | Executive Angler',
  'East Clear Creek on the Mogollon Rim: Blue Ridge reservoir access, statewide trout limits, no on-stream USGS gauge mapped yet.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-west-clear-creek-arizona',
  'west-clear-creek',
  'West Clear Creek',
  'dest-arizona',
  'West Clear Creek is a canyon wilderness fishery west of Camp Verde in the West Clear Creek Wilderness. Trout share the lower creek with smallmouth bass when summer water temperatures climb into the mid 70s, as AZGFD field reports have noted. Roundtail chub, a native species, also occur here and should be released unharmed.

Commission Order 40 applies statewide trout limits while bass and catfish remain unlimited. A USGS station near Camp Verde gives a lower-canyon flow reference, but reaching the famous pool and trail system requires serious hiking through Bull Pen and related trailheads we have not yet pinned with sourced coordinates.

This is advanced wading in a remote canyon, not a roadside stocker creek. We have no stored hatch chart or hero image. Use the gauge as a trend line, start early in summer, and pack out everything you pack in.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'advanced',
  'wade',
  ARRAY['Rainbow Trout', 'Brown Trout', 'Smallmouth Bass'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on West Clear Creek. Smallmouth bass, largemouth bass, and catfish are unlimited. Release roundtail chub unharmed where encountered (AZGFD 2025-26 guidance).',
  '[]'::jsonb,
  ARRAY['March', 'April', 'May', 'September', 'October'],
  34.5275,
  -111.6165,
  '{"sw":[34.504,-111.829],"ne":[34.551,-111.404]}'::jsonb,
  '[]'::jsonb,
  'West Clear Creek Arizona Fly Fishing Guide | Executive Angler',
  'West Clear Creek wilderness water near Camp Verde: USGS 09505800, trout and bass, roundtail chub release, and CO40 statewide limits.',
  false,
  '[{"site_id":"09505800","name":"West Clear Creek near Camp Verde, AZ","section":"Lower West Clear Creek"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-tonto-creek-arizona',
  'tonto-creek-arizona',
  'Tonto Creek (upper Rim)',
  'dest-arizona',
  'Upper Tonto Creek below the Mogollon Rim is a stocked rainbow trout creek within Tonto National Forest. Arizona Game and Fish weekly stocking lists include Tonto Creek in summer, and the hatchery program on the creek supports those plants. This page scopes the Rim country water around Kohls Ranch and Christopher Creek, not the lower river above Roosevelt Lake.

Commission Order 40 applies statewide trout limits here. The USGS Tonto Creek above Gun Creek station is far downstream of this trout water, so we leave the gauge field empty rather than imply flows on the upper creek.

Two forest campgrounds provide sourced access coordinates. Tonto Creek Hatchery coordinates remain a gap. There is no hatch chart or hero image stored yet. Confirm the weekly AZGFD stocking report before you drive up from Payson.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'beginner',
  'wade',
  ARRAY['Rainbow Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on upper Tonto Creek. Tonto Creek from Gisela downstream is open to fathead minnow bait under Commission Order 40; that reach is far below this upper Rim page scope.',
  '[{"name":"Upper Tonto Creek Campground","latitude":34.33931,"longitude":-111.09422,"parking":true,"description":"Tonto National Forest campground (Recreation.gov 10215934)."},{"name":"Ponderosa Campground","latitude":34.29889,"longitude":-111.11417,"parking":true,"description":"Tonto National Forest campground on upper Tonto Creek (Recreation.gov 234563)."}]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  34.32,
  -111.104,
  '{"sw":[34.28,-111.15],"ne":[34.39,-111.02]}'::jsonb,
  '[]'::jsonb,
  'Tonto Creek Arizona Fly Fishing Guide | Executive Angler',
  'Upper Tonto Creek on the Mogollon Rim: stocked rainbows, forest campground access, statewide trout limits, no USGS gauge mapped here.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-christopher-creek-arizona',
  'christopher-creek',
  'Christopher Creek',
  'dest-arizona',
  'Christopher Creek is a small Mogollon Rim tributary near the community of Christopher Creek east of Payson. Arizona Game and Fish stocks rainbow trout here through the summer and lists the creek as a hatchery Gila trout water on regional inventories. The fishing is short, friendly wade water close to campgrounds, which makes it a good family counterpoint to bigger Rim rivers.

Commission Order 40 applies statewide trout limits. We have not found a live USGS gauge on the creek itself, so the river page shows an honest no-gauge state. Hatch chart and hero image fields are intentionally empty until we have published entomology and hosted photography.

Use the mapped campground access points as trailheads, check the current stocking schedule, and avoid fishing afternoons when Rim creeks push past 67 degrees in late summer.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'beginner',
  'wade',
  ARRAY['Rainbow Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Christopher Creek.',
  '[{"name":"Christopher Creek Campground","latitude":34.30806,"longitude":-111.03472,"parking":true,"description":"Tonto National Forest campground (Recreation.gov 231896)."},{"name":"Sharp Creek Campground","latitude":34.29972,"longitude":-110.99806,"parking":true,"description":"Nearby Tonto National Forest campground (Recreation.gov 233898)."}]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  34.34,
  -111.0475,
  '{"sw":[34.31,-111.073],"ne":[34.369,-111.022]}'::jsonb,
  '[]'::jsonb,
  'Christopher Creek Arizona Fly Fishing Guide | Executive Angler',
  'Christopher Creek near Payson: stocked rainbow trout, two USFS campground access points, and statewide CO40 trout limits.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-woods-canyon-creek-arizona',
  'woods-canyon-creek',
  'Woods Canyon Creek',
  'dest-arizona',
  'Woods Canyon Creek is a short tributary below Woods Canyon Lake in the Apache-Sitgreaves Rim Lakes country. The lake receives trout plants, but we have not verified a separate sport-fish species statement for the creek itself in the AZGFD sources used for this page, so the species field stays empty rather than guessing.

Commission Order 40 applies statewide trout limits on the creek while Woods Canyon Lake carries unlimited bass and catfish under lake regulations. Two Rim Lakes campgrounds provide sourced access coordinates near the lake outlet. There is no USGS gauge, hatch chart, or hero image on file. Treat this as thin, high-elevation pocket water and confirm forest road conditions before you tow a trailer up from Payson or Heber.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Woods Canyon Creek. Woods Canyon Lake has unlimited bass and catfish under Commission Order 40 lake listings.',
  '[{"name":"Spillway Campground","latitude":34.33194,"longitude":-110.93639,"parking":true,"description":"Apache-Sitgreaves NF Rim Lakes campground (Recreation.gov 232203)."},{"name":"Aspen Campground","latitude":34.32667,"longitude":-110.94583,"parking":true,"description":"Rim Lakes campground near Woods Canyon Lake (Recreation.gov 232190)."}]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.363,
  -110.939,
  '{"sw":[34.358,-110.989],"ne":[34.368,-110.889]}'::jsonb,
  '[]'::jsonb,
  'Woods Canyon Creek Arizona Fly Fishing Guide | Executive Angler',
  'Woods Canyon Creek below Woods Canyon Lake: short Rim creek, campground access, statewide trout limits, species list not yet sourced.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-canyon-creek-arizona',
  'canyon-creek-arizona',
  'Canyon Creek (Rim)',
  'dest-arizona',
  'Canyon Creek on the Tonto National Forest is a Mogollon Rim classic with a hatchery road, weekly summer stocking, and a wild brown trout component in the lower canyon. Arizona Game and Fish 2025 summer reports note speckled dace and desert sucker as native species anglers may see while nymphing for trout.

Commission Order 40 splits the river at OW Bridge. Upstream carries statewide trout limits, while the reach from OW Bridge to the Fort Apache Reservation boundary is catch and release for trout on artificial flies and lures with single-pointed barbless hooks. The USFS Canyon Creek recreation area opens seasonally and uses rough forest roads that may require chains after storms.

We still need sourced coordinates for OW Bridge and Canyon Creek Hatchery before we map access pins. No USGS gauge sits on the trout reach, and we store no hatch chart or hero image yet. Fish early on the lower catch and release section when water warms, and call the Payson Ranger District for road status.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY['Rainbow Trout', 'Brown Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Upstream of OW Bridge: statewide trout limits. From OW Bridge to the Fort Apache Reservation boundary: catch and release for trout only, artificial fly and lure only, single-pointed barbless hooks.',
  '[]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.067,
  -110.754,
  '{"sw":[33.81,-110.85],"ne":[34.324,-110.658]}'::jsonb,
  '[]'::jsonb,
  'Canyon Creek Arizona Fly Fishing Guide | Executive Angler',
  'Canyon Creek on the Tonto Rim: stocked rainbows, wild browns, OW Bridge C&R section, and CO40 special regulations.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-pine-creek-arizona',
  'pine-creek-arizona',
  'Pine Creek (upper)',
  'dest-arizona',
  'Upper Pine Creek above the community of Pine is a remote wild rainbow trout stream in Gila County. Arizona Game and Fish surveys have reported strong wild rainbow densities in recent years, but the agency also treats access as sensitive, so we are not publishing trailhead coordinates without a verified public source.

Commission Order 40 applies statewide trout limits unless the current booklet adds a special rule. Tonto Natural Bridge State Park sits on Pine Creek downstream, but we have not sourced coordinates or fishing rules for that park reach on this page. There is no USGS gauge, hatch chart, or hero image stored.

This is advanced, leave-no-trace water. Contact AZGFD Region 2 if you need current access guidance, and expect to hike rather than pull off a highway guardrail.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'advanced',
  'wade',
  ARRAY['Rainbow Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on upper Pine Creek unless AZGFD posts a special regulation.',
  '[]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  34.337,
  -111.4375,
  '{"sw":[34.222,-111.492],"ne":[34.452,-111.383]}'::jsonb,
  '[]'::jsonb,
  'Pine Creek Arizona Fly Fishing Guide | Executive Angler',
  'Upper Pine Creek wild rainbow trout water above Pine, Arizona: remote Rim fishery, statewide CO40 limits, no mapped public access yet.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-barbershop-canyon-creek-arizona',
  'barbershop-canyon-creek',
  'Barbershop Canyon Creek',
  'dest-arizona',
  'Barbershop Canyon Creek is a small East Clear Creek tributary in Coconino County on the Mogollon Rim. GNIS maps the canyon, but Arizona Game and Fish does not list a dedicated sport-fish profile for this tributary in the sources we used while building this page, so species, access, and hatches remain unsourced.

Commission Order 40 carries no special entry for Barbershop Canyon, meaning statewide trout limits would apply if trout are present. We publish the page because Taylor approved a standalone row, but you should treat fishing information here as location and regulation context only until biologists or forest access pages confirm targets and trailheads.

There is no USGS gauge, access point, hatch chart, or hero image on file. Do not drive here expecting a signed fishing pullout.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'advanced',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. No special regulation is listed for Barbershop Canyon in Commission Order 40; statewide trout limits apply if trout are present.',
  '[]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.483,
  -111.184,
  '{"sw":[34.416,-111.206],"ne":[34.55,-111.162]}'::jsonb,
  '[]'::jsonb,
  'Barbershop Canyon Creek Fly Fishing Guide | Executive Angler',
  'Barbershop Canyon Creek, an East Clear Creek tributary on the Rim: thin data, statewide CO40 limits, map bounds only for now.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-ellison-creek-arizona',
  'ellison-creek',
  'Ellison Creek',
  'dest-arizona',
  'Ellison Creek is a short East Verde River tributary below the Mogollon Rim near Payson. It appears in hydrology datasets as Gila County stream GNIS 28882, distinct from similarly named creeks elsewhere in Arizona.

We do not yet have AZGFD or USFS sourced statements for sport-fish species, public access, or hatches on Ellison Creek itself. Commission Order 40 applies statewide trout limits by default. This standalone page marks the water on the map for planners, but it is data-thin compared with neighboring East Verde or Tonto pages.

No USGS gauge, access pins, hatch chart, or hero image are stored. Verify road and property boundaries on the ground before you fish.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'advanced',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Ellison Creek unless AZGFD posts a special regulation.',
  '[]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.3755,
  -111.221,
  '{"sw":[34.348,-111.28],"ne":[34.403,-111.162]}'::jsonb,
  '[]'::jsonb,
  'Ellison Creek Arizona Fly Fishing Guide | Executive Angler',
  'Ellison Creek near Payson: East Verde tributary on the Rim with statewide CO40 trout limits and limited sourced fishing data.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-haigler-creek-arizona',
  'haigler-creek',
  'Haigler Creek',
  'dest-arizona',
  'Haigler Creek flows through Tonto National Forest country near Young between Payson and the Sierra Ancha. Arizona Game and Fish stocks rainbow trout on summer schedules and lists Haigler Creek as a hatchery Gila trout water in regional summaries.

Commission Order 40 applies statewide trout limits. Haigler Canyon Campground and the Haigler Creek recreation site are named in forest literature, but we still lack Recreation.gov coordinates to map them safely, so access points remain empty.

There is no USGS stream gauge, stored hatch chart, or hero image. Pair AZGFD stocking reports with a forest map before you leave cell service.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY['Rainbow Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Haigler Creek.',
  '[]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  34.2105,
  -110.962,
  '{"sw":[34.206,-111.097],"ne":[34.215,-110.827]}'::jsonb,
  '[]'::jsonb,
  'Haigler Creek Arizona Fly Fishing Guide | Executive Angler',
  'Haigler Creek near Young, Arizona: stocked rainbows, hatchery Gila trout water listing, statewide CO40 trout limits.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-willow-springs-canyon-creek-arizona',
  'willow-springs-canyon-creek',
  'Willow Springs Canyon Creek',
  'dest-arizona',
  'Willow Springs Canyon Creek drains the Willow Springs Lake basin on the Mogollon Rim before joining Chevelon Canyon downstream. The lake is a destination unto itself, but we do not have a sourced sport-fish list for the creek independent of lake stocking, so species stay blank.

Commission Order 40 applies statewide trout limits here, while Chevelon Creek from the Willow Springs Creek confluence to Chevelon Crossing carries a two-trout artificial fly and lure rule you must obey once you hike downstream of the confluence. Sinkhole Campground provides a sourced coordinate near the lake.

No USGS gauge, hatch chart, or hero image is stored. Read Chevelon regulations before you link up canyons in one trip.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Willow Springs Canyon Creek. Related Chevelon Creek regulations apply downstream of the confluence: two trout, artificial fly and lure only, from the Willow Springs Creek confluence to Chevelon Crossing.',
  '[{"name":"Sinkhole Campground","latitude":34.30481,"longitude":-110.88542,"parking":true,"description":"Campground near Willow Springs Lake (Recreation.gov 256344)."}]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.3215,
  -110.8715,
  '{"sw":[34.285,-110.889],"ne":[34.358,-110.854]}'::jsonb,
  '[]'::jsonb,
  'Willow Springs Canyon Creek Fly Fishing Guide | Executive Angler',
  'Willow Springs Canyon Creek near Willow Springs Lake: campground access, Chevelon-related CO40 rules downstream, species not sourced.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-cherry-creek-arizona',
  'cherry-creek-arizona',
  'Cherry Creek (Gila County)',
  'dest-arizona',
  'Cherry Creek in Gila County is not the similarly named Yavapai County stream. The GNIS extent runs from the Young area toward Globe, but much of the upper drainage is private ranch land with uncertain public access.

Commission Order 40 applies statewide trout limits. The USGS Cherry Creek near Globe station sits on a lower reach far from the small upper creek water anglers discuss near Young, so we intentionally leave gauges empty rather than mislead you with downstream flows.

Species, access, hatch chart, and hero image remain unsourced on this page. Treat it as a planning placeholder until AZGFD or land managers publish walk-in access you can cite.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'advanced',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Cherry Creek unless a special regulation is posted.',
  '[]'::jsonb,
  ARRAY['April', 'May', 'June', 'September', 'October'],
  33.956,
  -110.862,
  '{"sw":[33.671,-110.923],"ne":[34.241,-110.801]}'::jsonb,
  '[]'::jsonb,
  'Cherry Creek Arizona Fly Fishing Guide | Executive Angler',
  'Cherry Creek near Young and Globe, Arizona: Gila County water, statewide CO40 limits, no USGS gauge mapped on upper trout reaches.',
  false,
  '[]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-chevelon-creek-arizona',
  'chevelon-creek',
  'Chevelon Creek',
  'dest-arizona',
  'Chevelon Creek is a long Mogollon Rim drainage flowing toward the Little Colorado River. Commission Order 40 packs several rules into one system: a two-trout artificial fly and lure section from the Willow Springs Creek confluence through Chevelon Canyon and Chevelon Canyon Lake, a seasonal unlimited rainbow trout reach from Chevelon Crossing downstream, and unlimited bass and catfish on Chevelon Canyon Lake.

Two USGS stations on Chevelon Fork and lower Chevelon Creek give flow context for planning, though neither replaces on-the-ground readings in the canyon. We have not verified a published species list in the AZGFD sources used here, so rainbow and brown trout rumors stay out of the species array until confirmed.

Chevelon Crossing and canyon trailheads still need sourced coordinates. Hatch chart and hero image fields are empty. Read the regulation block carefully before you pack a limit string for multiple sections in one day.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. From the Willow Springs Creek confluence through Chevelon Canyon, including Chevelon Canyon Lake: two trout, artificial fly and lure only. Chevelon Crossing to the Little Colorado River: unlimited rainbow trout September 1 through March 31. Chevelon Canyon Lake: unlimited bass and catfish.',
  '[]'::jsonb,
  ARRAY['May', 'June', 'September', 'October'],
  34.655,
  -110.708,
  '{"sw":[34.358,-110.89],"ne":[34.952,-110.526]}'::jsonb,
  '[]'::jsonb,
  'Chevelon Creek Arizona Fly Fishing Guide | Executive Angler',
  'Chevelon Creek and canyon: CO40 two-trout fly water, seasonal unlimited rainbow rule, USGS Chevelon Fork and lower creek gauges.',
  false,
  '[{"site_id":"09397500","name":"Chevelon Fork below Wildcat Canyon near Winslow, AZ","section":"Chevelon Fork"},{"site_id":"09398000","name":"Chevelon Creek near Winslow, AZ","section":"Lower Chevelon Creek"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-show-low-creek-arizona',
  'show-low-creek',
  'Show Low Creek',
  'dest-arizona',
  'Show Low Creek is an urban community fishery running through Show Low and Lakeside on the Colorado Plateau. Arizona Game and Fish stocks rainbow trout through the summer community fishing program, and Commission Order 40 lists detailed daily bag rules for the creek within city limits plus a two-trout rule at Show Low Creek Meadow.

This is a different experience from wilderness Rim creeks: sidewalks, parks, and lake impoundments such as Fool Hollow appear along the same drainage. A USGS station near Lakeside provides flow context.

We still need sourced coordinates for Show Low Creek Meadow and Fool Hollow Lake Recreation Area before we map access pins. Hatch chart and hero image remain empty. Respect posted city access and the community fishing program limits even when trout look easy.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'beginner',
  'wade',
  ARRAY['Rainbow Trout'],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Show Low Creek within the city of Show Low: two trout, two catfish, one bass with a 13-inch minimum, five sunfish, and one white amur with a 30-inch minimum. Show Low Creek Meadow is a two-trout community fishing program water. Fool Hollow and Show Low lakes on the creek have separate lake rules.',
  '[]'::jsonb,
  ARRAY['March', 'April', 'May', 'June', 'September', 'October'],
  34.298,
  -110.0435,
  '{"sw":[34.171,-110.107],"ne":[34.425,-109.98]}'::jsonb,
  '[]'::jsonb,
  'Show Low Creek Arizona Fly Fishing Guide | Executive Angler',
  'Show Low Creek community fishery: CFP trout limits, USGS 09390500, urban Rim water near Show Low and Lakeside, Arizona.',
  false,
  '[{"site_id":"09390500","name":"Show Low Creek near Lakeside, AZ","section":"Show Low Creek"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rivers (
  id, slug, name, destination_id, description,
  hero_image_url, thumbnail_url, hero_image_alt, hero_image_credit, hero_image_credit_url,
  length_miles, flow_type, difficulty, wading_type, primary_species,
  regulations, access_points, best_months, latitude, longitude, map_bounds,
  hatch_chart, meta_title, meta_description, featured, usgs_gauge_id,
  ea_destination_id, additional_destination_ids
) VALUES (
  'river-wet-beaver-creek-arizona',
  'wet-beaver-creek',
  'Wet Beaver Creek',
  'dest-arizona',
  'Wet Beaver Creek flows through the Wet Beaver Wilderness west of Rimrock and Lake Montezuma. Commission Order 40 groups Wet and Dry Beaver creeks with statewide trout limits, unlimited bass and catfish, and guidance to release native suckers and roundtail chub unharmed. AZGFD summer reports noted flows near seven cfs with warm afternoons, so trout fishing is a shoulder-season game.

A USGS station near Rimrock tracks Wet Beaver Creek flows. Bell Trail and V-Bar-V Heritage Site are the famous access names, but we have not stored sourced trailhead coordinates yet, and Beaver Creek Campground did not appear in Recreation.gov searches used for this brief.

Trout presence and stocking status are not confirmed in the sources backing this page, so the species array stays empty. Hatch chart and hero image are also empty. Pack water and expect a hike through red rock country rather than a pullout creek.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'freestone',
  'intermediate',
  'wade',
  ARRAY[]::text[],
  'Arizona fishing license required. Rules below cite Arizona Game and Fish Commission Order 40 (2025-26). Unless a special regulation applies, the statewide trout limit is four trout per day in any combination of species. Statewide trout limits apply on Wet Beaver Creek under the Wet and Dry Beaver Creek listing. Bass and catfish are unlimited. Release native suckers and roundtail chub unharmed (AZGFD 2025-26 guidance).',
  '[]'::jsonb,
  ARRAY['March', 'April', 'May', 'June', 'September', 'October'],
  34.6705,
  -111.677,
  '{"sw":[34.625,-111.826],"ne":[34.716,-111.528]}'::jsonb,
  '[]'::jsonb,
  'Wet Beaver Creek Arizona Fly Fishing Guide | Executive Angler',
  'Wet Beaver Creek near Rimrock: USGS 09505200, CO40 trout and bass rules, roundtail chub release, Wet Beaver Wilderness access gaps.',
  false,
  '[{"site_id":"09505200","name":"Wet Beaver Creek near Rimrock, AZ","section":"Wet Beaver Creek"}]',
  NULL,
  ARRAY[]::text[]
) ON CONFLICT (id) DO NOTHING;

-- Read-back verification (run after apply)
SELECT slug, name, destination_id, flow_type, difficulty,
       array_length(primary_species, 1) AS species_count,
       jsonb_array_length(access_points) AS access_count,
       jsonb_array_length(hatch_chart) AS hatch_months,
       usgs_gauge_id,
       featured
FROM public.rivers
WHERE id IN ('river-oak-creek-arizona', 'river-west-fork-oak-creek', 'river-east-verde-river-arizona', 'river-east-clear-creek-arizona', 'river-west-clear-creek-arizona', 'river-tonto-creek-arizona', 'river-christopher-creek-arizona', 'river-woods-canyon-creek-arizona', 'river-canyon-creek-arizona', 'river-pine-creek-arizona', 'river-barbershop-canyon-creek-arizona', 'river-ellison-creek-arizona', 'river-haigler-creek-arizona', 'river-willow-springs-canyon-creek-arizona', 'river-cherry-creek-arizona', 'river-chevelon-creek-arizona', 'river-show-low-creek-arizona', 'river-wet-beaver-creek-arizona')
ORDER BY slug;

