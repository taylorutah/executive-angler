-- =============================================
-- River flow_type corrections — 2026-04-23
-- Run this in the Supabase SQL Editor if not already applied via API.
--
-- These three rows had incorrect flow_type tags that misrepresented the
-- dominant character of the fishery. flow_type is a single-value
-- "vibe indicator" per river (not per-section), so each row should
-- reflect the character anglers most associate with the river.
-- =============================================

-- Green River (Utah) — the EA "Green River" is the Flaming Gorge tailwater,
-- one of the three most iconic trout tailwaters in the American West. It is
-- not a freestone river.
UPDATE rivers SET flow_type = 'tailwater' WHERE id = 'green-river-utah';

-- Bighorn River (Wyoming) — below Boysen Dam ("Wedding of the Waters"
-- through Thermopolis) is dam-controlled cold water; this is a tailwater
-- fishery, not a freestone.
UPDATE rivers SET flow_type = 'tailwater' WHERE id = 'river-bighorn-wy';

-- Eagle River (Colorado) — mainstem Eagle from Tennessee Pass to Dotsero
-- is a classic freestone river. No mainstem dam; the prior 'tailwater'
-- tag appears to have been a mis-tag.
UPDATE rivers SET flow_type = 'freestone' WHERE id = 'river-eagle-co';
