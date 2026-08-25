# P4 T4 — wire the empty-state gate

**Lane:** P4 / T4  
**Branch:** `cursor/p4-t4-3c0f`  
**Owns the script:** this lane  
**Owns `package.json` and `.github/workflows/design-gates.yml`:** Lane 0

## Script

```bash
npx tsx scripts/check-empty-states.ts
```

Asserts six first-run surfaces (`today`, `journal`, `flybox`, `rivers-mine`, `gear`, `insights`). Prints the list. Exits 1 if the count is under 6.

Source markers are always checked. Live load of the empty fixture runs when `EA_EMPTY_CHECK_URL` and `EA_FIXTURE_PASSWORD` are set (email defaults to `fixture-empty@executiveangler.com`, overridable with `EA_FIXTURE_EMPTY_EMAIL`).

Seed that fixture:

```bash
npx tsx scripts/seed-fixture-account.ts --empty
```

Password is `EA_FIXTURE_PASSWORD` (same secret as the populated fixture). No new committed password.

## Wiring (Lane 0)

Add to `package.json` scripts:

```json
"check:empty-states": "npx tsx scripts/check-empty-states.ts"
```

Add a step to the tokens / design-gates job:

```yaml
- run: npm run check:empty-states
```

Do not put the App Store review inbox in the workflow. The empty fixture is a different email.

## See Also

- [[river-alerts]] — T1 contract this branch also lands
