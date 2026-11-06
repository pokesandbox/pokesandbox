# libs/battle: agent instructions

Runs live battles on the Showdown fork and implements the `BattlePort` from `@core/ports`. Overview: [`README.md`](README.md). Root rules: [`../../AGENTS.md`](../../AGENTS.md).

## Rules ([14](../../docs/architecture/concepts/14-battle-system-and-showdown.md), [03 § Package layout](../../docs/architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026))

- **Depends only on `libs/core`.** Never import `libs/engine`, `@shared/*`, `discord.js`, or `mongoose`. Enforced by `nx lint` (tag `scope:battle`).
- **The only package that imports Showdown** (`@pokesandbox/pokemon-showdown`, `@smogon/calc`).
- **No game rules.** EXP, catch, escape, and item effects belong to the engine; ask it through the injected `ExternalActionResolver`. Battle code never reads journeys.
- **Port data is defined in core.** Add or change `BattleSpec`, `StatePatch`, `BattleEvent`, and the external-action types in `libs/core/src/ports/battle`, as Zod schemas, not here.
- **Dependencies come in through `BattleServiceDeps`.** No module singletons; time, timers, and randomness come through the `Clock`, `Scheduler`, and `Rng` ports (#124).
- Import through the `@battle/*` alias.

## Tests

Test headless with in-memory ports: `*.test.ts` next to the code. `npx nx test battle`.
