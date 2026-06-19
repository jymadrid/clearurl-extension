# Deep Project Optimization Requirements

## User Goal

Deeply optimize the ClearURL open source browser extension project.

## Derived Requirements

- Restore a reliable quality gate: `npm run lint`, `npm test`, and `npm run build` should be meaningful and pass where the repository environment allows.
- Optimize runtime correctness for the Manifest V3 URL cleaning flow, especially enable/disable behavior, whitelist behavior, dynamic rules, and custom rules.
- Improve test coverage so tests exercise real project implementation instead of only duplicated mock logic.
- Keep scope focused on extension behavior and engineering quality; avoid unrelated product redesign or broad documentation churn.
- Preserve existing user-facing behavior unless a change fixes a correctness, performance, or maintainability issue.

## Baseline Evidence

- `npm test -- --runInBand`: pass, but tests mostly use local mock URL cleaning logic.
- `npm run lint`: fail with 193 fixable errors and 33 warnings.
- `manifest.json`: static `tracking_rules` ruleset is enabled by default.
- `background.js`: `updateRules()` removes/recreates dynamic rules, but does not disable the static ruleset, so disabled/whitelisted states can still be bypassed by the static ruleset.
