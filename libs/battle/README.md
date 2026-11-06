# battle

The battle library from [14 § Package placement](../../docs/architecture/concepts/14-battle-system-and-showdown.md#package-placement-decided-oct-2026-its-own-library-libsbattle): `BattleService` runs live battles, timers, persistence and recovery, and AI players, on top of the Showdown fork. It is the only package that imports Showdown.

It implements the `BattlePort` and calls the engine back through the `ExternalActionResolver`. Both are typed in [`libs/core/src/ports/battle`](../core/src/ports/battle), so `libs/engine` and `libs/battle` never import each other. Import this library through the `@battle/*` alias.

**Status:** scaffold only. `BattleServiceDeps` is the one export; the Showdown implementation is M1.

## Commands

- `nx test battle` runs the Jest tests.
- `nx lint battle` runs ESLint.
