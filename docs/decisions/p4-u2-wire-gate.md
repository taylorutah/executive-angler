# P4 / U2 — wire the a11y gate

Lane U2 owns `scripts/check-a11y.ts` and cannot edit `package.json` or
`.github/workflows/design-gates.yml`. Add the following after this PR merges.

## npm script

In `package.json` `"scripts"`:

```json
"check:a11y": "npx tsx scripts/check-a11y.ts"
```

Optional later, once this lane may touch the lockfile:

```json
"@axe-core/playwright": "^4.11.0"
```

Until then the script injects the vendored `scripts/vendor/axe.min.js`.

## CI step

New job on the design-gates workflow, same fixture secrets as `harness` /
`visual` / `contrast-rendered`. Do **not** point them at the App Store review
inbox.

```yaml
  a11y:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: https://qlasxtfbodyxbcuchvxz.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_SITE_URL: https://www.executiveangler.com
      EA_FIXTURE_EMAIL: ${{ secrets.EA_FIXTURE_EMAIL }}
      EA_FIXTURE_PASSWORD: ${{ secrets.EA_FIXTURE_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - name: Require fixture secrets
        run: |
          if [ -z "${EA_FIXTURE_EMAIL}" ] || [ -z "${EA_FIXTURE_PASSWORD}" ]; then
            echo "EA_FIXTURE_EMAIL / EA_FIXTURE_PASSWORD are empty."
            exit 1
          fi
          echo "fixture secrets present (values not printed)"
      - run: npm run start -- -p 3000 &
      - run: npx --yes wait-on http://localhost:3000 --timeout 60000
      - run: npm run check:a11y
        env:
          BASE_URL: http://localhost:3000
          A11Y_SCREENSHOTS: "1"
```

The script fails if page-loads < 80, or if axe reports any `serious` or
`critical` violation (color-contrast excluded — that is `check:contrast` /
`check:contrast:rendered`).

## See Also

- [[p4-u2-cross-lane]]
- [[p4-lane0-harness]]

## Timeline

- 2026-08-25 | Gate written; npm script + CI job left for a wiring PR.
