/**
 * sync-waypoints.mjs
 * Extracts access point coordinates from the static rivers.ts file
 * and pushes them into Supabase rivers.access_points JSONB column.
 *
 * Each access point in Supabase becomes:
 * { name, latitude, longitude, description, parking }
 *
 * Run: node scripts/sync-waypoints.mjs
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qlasxtfbodyxbcuchvxz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Parse rivers.ts with a regex approach ──────────────────────────────────
const src = readFileSync('src/data/rivers.ts', 'utf8');

// Split on top-level river objects by finding "  {" at the start
// Instead, use a different approach: eval the exported array
// We'll use a transpile trick via dynamic import after writing a temp JSON

// Extract all river blocks between { id: "..." ... } at top level
// Strategy: find each id: "..." then capture the accessPoints array for it

function extractRivers(src) {
  const rivers = [];

  // Find all river id positions
  const idRegex = /\{\s*\n\s*id:\s*["']([^"']+)["']/g;
  let idMatch;
  const positions = [];

  while ((idMatch = idRegex.exec(src)) !== null) {
    positions.push({ id: idMatch[1], start: idMatch.index });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].start;
    const end = i + 1 < positions.length ? positions[i + 1].start : src.length;
    const block = src.slice(start, end);

    // Extract accessPoints array from this block
    const apStart = block.indexOf('accessPoints:');
    if (apStart === -1) continue;

    // Find the opening bracket
    const bracketStart = block.indexOf('[', apStart);
    if (bracketStart === -1) continue;

    // Find matching closing bracket
    let depth = 0;
    let bracketEnd = -1;
    for (let j = bracketStart; j < block.length; j++) {
      if (block[j] === '[') depth++;
      else if (block[j] === ']') {
        depth--;
        if (depth === 0) { bracketEnd = j; break; }
      }
    }
    if (bracketEnd === -1) continue;

    const apBlock = block.slice(bracketStart, bracketEnd + 1);

    // Extract individual access points
    const accessPoints = [];
    // Find each { name: ... } object in the array
    const apObjRegex = /\{[^{}]*?name:\s*["']([^"']+)["'][^{}]*?\}/gs;
    let apMatch;
    while ((apMatch = apObjRegex.exec(apBlock)) !== null) {
      const obj = apMatch[0];
      const name = apMatch[1];

      const latMatch = obj.match(/latitude:\s*([-\d.]+)/);
      const lngMatch = obj.match(/longitude:\s*([-\d.]+)/);
      const descMatch = obj.match(/description:\s*["']([^"']+)["']/);
      const parkingMatch = obj.match(/parking:\s*(true|false)/);

      if (latMatch && lngMatch) {
        accessPoints.push({
          name,
          latitude: parseFloat(latMatch[1]),
          longitude: parseFloat(lngMatch[1]),
          description: descMatch ? descMatch[1] : null,
          parking: parkingMatch ? parkingMatch[1] === 'true' : null,
        });
      } else {
        // No coords — just store name
        accessPoints.push({ name });
      }
    }

    if (accessPoints.length > 0) {
      rivers.push({ id: positions[i].id, accessPoints });
    }
  }

  return rivers;
}

const rivers = extractRivers(src);
console.log(`Parsed ${rivers.length} rivers with access points`);

const withCoords = rivers.filter(r => r.accessPoints.some(ap => ap.latitude));
const withoutCoords = rivers.filter(r => !r.accessPoints.some(ap => ap.latitude));
console.log(`  - ${withCoords.length} rivers have at least one access point with coordinates`);
console.log(`  - ${withoutCoords.length} rivers have access points without coordinates`);

// ── Push to Supabase ───────────────────────────────────────────────────────
let updated = 0;
let errors = 0;

for (const river of rivers) {
  const { error } = await supabase
    .from('rivers')
    .update({ access_points: river.accessPoints })
    .eq('id', river.id);

  if (error) {
    console.error(`  ❌ ${river.id}: ${error.message}`);
    errors++;
  } else {
    console.log(`  ✅ ${river.id} — ${river.accessPoints.length} access points`);
    updated++;
  }
}

console.log(`\nDone. ${updated} rivers updated, ${errors} errors.`);
