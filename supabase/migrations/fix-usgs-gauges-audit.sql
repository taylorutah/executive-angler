-- =============================================
-- USGS Gauge Audit Fixes — March 30, 2026
-- Run this in the Supabase SQL Editor
-- =============================================

-- Arkansas River (CO) — Fix: Replace dead Parkdale gauge (07094500, sensor returning -999999)
-- with Wellsville gauge (07093700) which is nearby and returning live data.
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"07087200","name":"At Buena Vista","section":"Upper Arkansas"},{"site_id":"07093700","name":"Near Wellsville","section":"Royal Gorge"},{"site_id":"07109500","name":"Below Pueblo Dam","section":"Pueblo Tailwater"}]' WHERE id = 'river-arkansas-co';

-- Norfork River (AR) — Fix: All actual North Fork River USGS gauges (07060000, 07059998, etc.)
-- are discontinued. White River near Norfork (07057370) remains the closest active gauge.
-- Norfork Dam releases are Army Corps controlled (SWPA), not USGS monitored.
-- Update section name to be more descriptive about the proxy.
UPDATE rivers SET usgs_gauge_id = '[{"site_id":"07057370","name":"White River near Norfork","section":"Norfork Tailwater (White River gauge)"}]' WHERE id = 'river-norfork';

-- =============================================
-- AUDIT NOTES (no changes needed):
--
-- Seasonal gauges (Alaska winter — will resume spring/summer):
--   - Kenai at Soldotna (15266300): gage height active, discharge seasonal
--   - Copper River (15214000): both parameters seasonal
--
-- Single-gauge rivers verified (no additional USGS gauges available):
--   - Penns Creek (PA): 01555000 only active IV gauge. Upstream 01554600 has no live data.
--   - Pere Marquette (MI): 04122500 only gauge on this river.
--   - Rock Creek (MT): 12334510 only gauge on this specific Rock Creek.
--   - Frying Pan (CO): 09080400 only gauge. Short tailwater, 1 is appropriate.
--   - Silver Creek (ID): 13150430 only gauge. Small spring creek.
--   - Big Spring Creek (MT): 06111800 only gauge. Small spring creek.
--   - Letort Spring Run (PA): 01569800 only gauge. Tiny spring creek.
--
-- All other 62 of 65 gauges verified returning live discharge data.
-- =============================================
