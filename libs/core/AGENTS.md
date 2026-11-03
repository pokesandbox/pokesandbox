# libs/core: agent instructions

The pure base layer: content and catalog schemas, `ContentKey`, port interfaces, condition/effect/fact registries, per-generation formulas, and the validator. Folder map: [`README.md`](README.md). Root rules: [`../../AGENTS.md`](../../AGENTS.md).

## Rules ([03 § Package layout](../../docs/architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026))

- **No I/O.** No `mongoose`, `discord.js`, Showdown, React, network, filesystem, or `Date.now()` / `Math.random()`: time and randomness come in through the `Clock` and `Rng` ports.
- **Imports nothing internal.** `core` depends on no other workspace package (`@shared/*` included). Everything else may depend on it. Enforced by lint once #114 lands.
- **Ports are interfaces only**, and everything crossing them is serializable data (no class instances, functions, or documents), so a port can become an API call later.
- **No module-level singletons or state.** Registries are built and passed in, not global.
- **Zod schemas** follow the repo naming: `fooSchema`, types via `z.infer` ([`shared/AGENTS.md`](../../shared/AGENTS.md#model-conventions)).
- Import through the `@core/*` alias (e.g. `@core/ports`).

## Tests

Everything here is pure, so test it directly: `*.test.ts` next to the code, no mocks of I/O needed. `npx nx test core`.
