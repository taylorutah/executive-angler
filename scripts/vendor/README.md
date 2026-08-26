Vendored [axe-core](https://github.com/dequelabs/axe-core) 4.11.1 (`axe.min.js`).

Lane U2 cannot edit `package.json`. The a11y gate loads this file so
`npx tsx scripts/check-a11y.ts` runs without a new npm dependency.

When Lane 0 / CI wiring lands, replace this copy with `@axe-core/playwright`
(see `docs/decisions/p4-u2-wire-gate.md`). Licence: MPL-2.0, `axe.LICENSE`.
