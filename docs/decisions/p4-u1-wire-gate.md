# Program 4 U1 — wire the perf gate

**Lane:** P4 / U1  
**Branch:** `cursor/p4-u1-3c0f`  
**This lane must not edit `package.json` or `.github/workflows/design-gates.yml`.**

## npm script (parent adds to `package.json`)

```json
"check:perf": "npx tsx scripts/check-perf.ts docs/audits/perf-after.json"
```

## CI step (parent adds a `perf` job to `design-gates.yml`)

After `actions/checkout`, `actions/setup-node` (Node 22, npm cache), and `npm ci`:

```yaml
  perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npx tsx scripts/check-perf.ts docs/audits/perf-after.json
```

The script does **not** need a running server in check mode. It reads the committed report and compares it to `docs/audits/perf-baseline-2026-08-25.json`.

It always prints `page-loads: N / 9` and exits 1 if:

- `N < 9`
- a budgeted mobile load (`/`, `/rivers`, `/rivers/madison-river`, `/flies/library` at 390 + Slow 4G / 4× CPU) misses LCP < 2000ms, CLS < 0.05, or INP < 200ms
- any page-load misses the regression floors vs baseline (LCP +10%, CLS +0.02, TBT +15% with a 50ms TBT noise floor)

## Re-measure (local / agent, not the gate)

Needs a production server:

```bash
npm run build && npm start
npx tsx scripts/check-perf.ts --measure docs/audits/perf-after.json
```

Optional analyzer hook (no new dependency in `package.json`):

```bash
ANALYZE=1 npx --yes @next/bundle-analyzer
```

`next.config.ts` wraps with `@next/bundle-analyzer` only when `ANALYZE=1` and the package is present.

## Current after-report

`docs/audits/perf-after.json` is a measured run after the U1 fixes. `check:perf` exits 1 on remaining mobile LCP/CLS/INP misses documented in that file's `remainingMisses`. Do not treat a silent skip as a pass.
