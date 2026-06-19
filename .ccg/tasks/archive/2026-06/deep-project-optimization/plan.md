# Plan

## Phase 1: Quality Gate

- Run formatter/lint fixer on existing JavaScript/CSS/JSON where safe.
- Re-run lint and address remaining errors without broad refactors.

## Phase 2: Runtime Rule Optimization

- Ensure the static DNR ruleset does not keep cleaning URLs when the extension is disabled or when dynamic whitelist-aware rules are active.
- Keep one authoritative dynamic rules path with whitelist exclusions.
- Harden custom rule normalization/validation before building regexes or DNR rules.
- Reduce avoidable repeated work in URL cleaning and badge updates where local and low risk.

## Phase 3: Tests

- Add tests against actual `background.js` behavior with Chrome API mocks.
- Cover initialization/updateRules, disabled state, whitelist exclusions, custom rule validation, and URL cleaning.

## Phase 4: Verification And Review

- Run `npm run lint`, `npm test -- --runInBand`, and `npm run build`.
- Run external model review if available; if a configured backend is unavailable, record the environment limitation and perform local review.
- Archive the CCG task after completion.
