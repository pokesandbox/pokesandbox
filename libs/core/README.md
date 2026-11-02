# core

The pure layer of the package layout described in
[03 § Package layout](../../docs/architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026).

**No I/O.** `libs/core` must not depend on mongoose, discord.js, Showdown, or React.
Import it through the `@core/*` alias (for example `@core/ports`).

| Folder        | Holds                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| `schemas/`    | Zod content/catalog schemas, `ContentKey`, shared id types             |
| `registries/` | Condition, effect, and fact registries                                 |
| `formulas/`   | Per-generation rule formulas (EXP, catch, escape, payout)              |
| `validation/` | Content validator                                                      |
| `ports/`      | Port interfaces (`BattlePort`, `Clock`, `Rng`, `Scheduler`)            |

## Commands

- `nx test core` runs the Jest tests.
- `nx lint core` runs ESLint.
