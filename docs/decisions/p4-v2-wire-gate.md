# P4 V2 — wire the river integrity gate

**Lane:** V2 / V3  
**Branch:** `cursor/p4-v2-3c0f`  
The landing pass unions `check:river-integrity` into `package.json` and the
`tokens` job. Existing jobs stay.

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

Floor: **138** rivers printed. Exit 1 if the count is lower, or if any internal
destination / species / fly / hatch / article href is broken.

## Silent empty — report-only until Lane I

Landing 2026-08-26 measured **108** silent insets on current `main`. Cause:
`src/app/rivers/[slug]/page.tsx` always mounts `RiverLiveInset` →
`RiverConditionsCard`. That card returns `null` when there is no gauge
(HERO_DEK_QUIET-class: a live band that shows nothing). `FlowChart` already
says “No USGS gauge linked to this river.” The inset does not.

Those files are **not** in this lane’s owns list. Lane I owns the river
template. This landing does **not** invent USGS site ids and does **not**
restyle the inset. Silent-live is printed (`108 / 138`) and is **not** a
fail until Lane I ships an honest empty (“No USGS gauge mapped. We are not
guessing a number.”). Then flip the printed finding back to a fail; the
count should go to 0 without filling gauges.

A wrong gauge is worse than none.

## Timeline

- 2026-08-25 | Gate written; CI left unwired because silent-live exits 1.
- 2026-08-26 | Landing unions script + `tokens` step. Fail on floor / broken
  links only. Silent-live stays a printed finding.

## `verified_at`

V2 brief asked for a `verified_at` column and an admin staleness queue. The column does not exist. This lane does not own migrations or `/admin/content/rivers`. Cross-lane: add the column, surface “last checked”, rank generic / empty / unverified regs. Do not generate regulation text.
