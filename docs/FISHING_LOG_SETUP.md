# Fishing Log Feature — Setup Guide

## Overview
The fishing log feature imports your personal fishing data from Notion and displays it on Executive Angler at `/journal`.

## What Was Built
1. **Database Schema**: 6 new tables in Supabase
   - `fly_patterns` — Fly pattern catalog
   - `fishing_sessions` — Individual fishing sessions
   - `session_rigs` — Fly positions used in each session
   - `catches` — Fish caught in each session
   - `fishing_spots` — Named fishing locations
   - `angler_profiles` — User angler profiles

2. **Migration Script**: `scripts/migrate-fishing-log.ts`
   - Outputs SQL for manual execution in Supabase SQL Editor

3. **Import Script**: `scripts/import-notion-fishing.ts`
   - Reads from 3 Notion databases
   - Normalizes and imports data into Supabase

4. **UI Pages**:
   - `/journal` — Session list with summary stats
   - `/journal/[id]` — Individual session details

5. **Navigation**: Added "My Journal" link to Header for logged-in users

## Setup Steps

### Step 1: Run Database Migration

Run the migration to create tables:

```bash
npm run fishing:migrate
```

This will output the SQL. Copy the SQL and:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qlasxtfbodyxbcuchvxz/sql/new)
2. Paste the SQL into the SQL Editor
3. Click "Run" to execute

**Alternatively**, if you have `psql` installed, you can run:

```bash
cat supabase/migrations/fishing-log-schema.sql | \
  PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" \
  psql "postgresql://postgres.qlasxtfbodyxbcuchvxz:$SUPABASE_SERVICE_ROLE_KEY@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### Step 2: Import Notion Data

Set environment variables and run the import:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://qlasxtfbodyxbcuchvxz.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

npm run fishing:import
```

The import will:
1. Fetch all pages from the 3 Notion databases
2. Create rivers for unique river names found
3. Insert fly patterns
4. Insert fishing sessions
5. Insert session rigs (fly positions)
6. Insert catches linked to sessions

### Step 3: Verify Import

After import completes, check the counts:
- Fly patterns: Check count in output
- Rivers: Check count in output
- Sessions: Check count in output
- Rigs: Check count in output
- Catches: Check count in output

### Step 4: View in Browser

1. Run `npm run dev`
2. Go to http://localhost:3000
3. Sign in (or create account)
4. Click "My Journal" in the header
5. You should see your fishing sessions!

## Data Structure

### Notion → Supabase Mapping

**Fishing Log Database → fishing_sessions**
- Name → extracted river_name + river_id lookup
- Date → date
- Weather → weather
- Water Temp (F) → water_temp_f
- Water Clarity → water_clarity
- Total Fish Caught (rollup) → total_fish
- Notes → notes
- Fly - Position 1/2/3 → flies_notes (comma-separated)
- Tags → tags[]

**Fish Counts Database → catches**
- Session (relation) → session_id (via notion_id lookup)
- Species → species
- Length (inches) → length_inches
- Fly (relation) → fly_pattern_id (via notion_id lookup)
- Time → time
- Notes → notes

**Fly Patterns Database → fly_patterns**
- Name → name
- Type → type
- Size → size
- Hook → hook
- Materials → materials
- Notes → notes

## Troubleshooting

### Migration fails with "relation already exists"
This is OK! The SQL uses `CREATE TABLE IF NOT EXISTS`, so it's safe to re-run.

### Import fails with "user not found"
The import creates a default user `notion-import@executiveangler.com` if none exists. This is expected on first run.

### Sessions show but no catches
Check that the Fish Counts database has a "Session" relation property linking to Fishing Log pages.

### Rivers show as "Unknown River"
The import tries to extract river name from the session Name field. Format should be "Date - River Name" or just "River Name".

## Next Steps

- [ ] Add photo upload to sessions
- [ ] Add stats dashboard (fish per month, top rivers, etc.)
- [ ] Add session editing UI
- [ ] Add new session creation form
- [ ] Export to PDF/CSV
- [ ] Public profile sharing

## Files Changed

- `package.json` — Added `fishing:migrate` and `fishing:import` scripts
- `supabase/migrations/fishing-log-schema.sql` — Database schema
- `scripts/migrate-fishing-log.ts` — Migration script
- `scripts/import-notion-fishing.ts` — Notion import script
- `src/types/fishing-log.ts` — TypeScript types
- `src/app/journal/page.tsx` — Journal index page
- `src/app/journal/[id]/page.tsx` — Session detail page
- `src/components/layout/Header.tsx` — Added Journal link
