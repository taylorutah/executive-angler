# P4 V2 — wire the river integrity gate

**Lane:** V2 / V3  
**Branch:** `cursor/p4-v2-3c0f`  
**This PR does not edit** `package.json` or `.github/workflows/design-gates.yml`.

## npm script

Add exactly this to `package.json` `"scripts"`:

```json
"check:river-integrity": "npx tsx scripts/check-river-integrity.ts"
```

Optional local write of the audit tables:

```bash
npx tsx scripts/check-river-integrity.ts --write
```

`--write` is not for CI.

## CI step

Add to the `tokens` job in `.github/workflows/design-gates.yml`, after `check:image-hosts`, with the same public Supabase env the other jobs already use:

```yaml
      - run: npm run check:river-integrity
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://qlasxtfbodyxbcuchvxz.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ env.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

If that job does not already export the anon key at the job `env:` level, copy the two `NEXT_PUBLIC_SUPABASE_*` lines from the `contrast-rendered` job verbatim onto this step. The script is read-only REST against public tables. It does not need the service role or the fixture account.

Floor: **138** rivers printed. Exit 1 if the count is lower, if any internal destination / species / fly / hatch / article href is broken, or if a river page mounts the live-data inset with no USGS site id.

## Silent empty — do not wire the live-data fail until Lane I

Today the script exits 1 on **108** rivers. Cause: `src/app/rivers/[slug]/page.tsx` always mounts `RiverLiveInset` → `RiverConditionsCard`. That card returns `null` when there is no gauge (HERO_DEK_QUIET-class: a live band that shows nothing). `FlowChart` already says “No USGS gauge linked to this river.” The inset does not.

Those files are **not** in this lane’s owns list. Lane I owns the river template.

Wire the gate in two moves:

1. **Now (links + floor only)** — if you need a green job before Lane I: temporarily the script still fails on silent live. Do not add it to CI until step 2, *or* land Lane I first.
2. **After Lane I** ships an honest empty on the dusk inset (“No USGS gauge mapped. We are not guessing a number.”) — then add the step above. The 108 should go to 0 without filling gauges.

A wrong gauge is worse than none. Do not invent site ids to turn the gate green.

## `verified_at`

V2 brief asked for a `verified_at` column and an admin staleness queue. The column does not exist. This lane does not own migrations or `/admin/content/rivers`. Cross-lane: add the column, surface “last checked”, rank generic / empty / unverified regs. Do not generate regulation text.
