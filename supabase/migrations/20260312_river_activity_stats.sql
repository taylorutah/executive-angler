-- River activity stats view
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qlasxtfbodyxbcuchvxz/sql
CREATE OR REPLACE VIEW river_activity_stats AS
SELECT
  fs.river_id,
  COUNT(DISTINCT fs.id)                                                        AS total_sessions,
  COUNT(DISTINCT CASE WHEN fs.date >= NOW() - INTERVAL '30 days' THEN fs.id END) AS sessions_last_30d,
  COUNT(DISTINCT CASE WHEN fs.date >= NOW() - INTERVAL '7 days'  THEN fs.id END) AS sessions_last_7d,
  COALESCE(SUM(fs.total_fish), 0)                                              AS total_fish_recorded,
  ROUND(AVG(CASE WHEN fs.total_fish > 0 THEN fs.total_fish END), 1)            AS avg_fish_per_session,
  MAX(fs.date)                                                                 AS last_session_date,
  COUNT(DISTINCT c.id)                                                         AS total_catches
FROM fishing_sessions fs
LEFT JOIN catches c ON c.session_id = fs.id
WHERE fs.river_id IS NOT NULL
GROUP BY fs.river_id;

-- Grant read access to anon/authenticated roles
GRANT SELECT ON river_activity_stats TO anon, authenticated;
