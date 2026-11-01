# M0c: Arena Foundations (backlog draft)

**Outcome:** everything the Arena needs before BattleService (M1) can be built: the `libs/battle` package and its interfaces, the shared `Clock`/`Rng` ports, and a clean, rebased Showdown fork published as a package the monorepo can depend on. The Arena path is **M0c → M1 (BattleService, teams, formats, AI) → M2 (Arena release)**.

**Bare-minimum dependencies:** only `libs/core` (M0A-09) for the two library issues. The fork issues (E-M0C-2) live in the Showdown fork repo and depend on nothing in the monorepo, so they can start today. Nothing from M0b (adventure engine, conditions, authoring) is needed.

Refs: concepts [25](../architecture/concepts/25-arena.md) (Arena), [14](../architecture/concepts/14-battle-system-and-showdown.md) (battle system and the fork), [15](../architecture/concepts/15-persistence-concurrency-and-runtime.md) (live-state ownership) · [`mvp.md` § M0c](../roadmap/mvp.md#m0c-arena-foundations)

## Start here
New to the project? Read [`docs/start-here.md`](../start-here.md) first. Context specific to the Arena:

**What the Arena is, in Pokémon terms.** Showdown-style battles inside Discord: server members challenge each other (or an AI) with teams they import as Showdown pastes, battle in a public channel message others can watch, and pick moves in private prompts. It's the first public release, and it doesn't need any region or adventure features. Formats are per server (e.g. "Kanto 151 Lv50"), with built-in ones so it works on a fresh server ([25](../architecture/concepts/25-arena.md)).

**How the pieces fit**
| Piece | Where | What it does | Milestone |
|---|---|---|---|
| Showdown fork | `nbely/pokemon-showdown` (moving to the org) | The battle simulator: damage, turns, every mechanic. We keep a small, named patch set on top of upstream. | M0c (clean-up, rebase, package), M1 (patches) |
| `libs/battle` | monorepo, new Nx library | Our wrapper: `BattleService` runs live battles, timers, persistence and recovery, and AI players | M0c (interfaces), M1 (implementation) |
| Arena module | `apps/bot` | Discord side: challenges, the public battle message, private choice prompts, the `/arena` hub | M2 |

**Working on the fork**
- It's a fork of [smogon/pokemon-showdown](https://github.com/smogon/pokemon-showdown), based on an Aug 2023 upstream. Our changes vs upstream are listed in [14 § Current state of the fork](../architecture/concepts/14-battle-system-and-showdown.md#current-state-of-the-fork-branch-inventory-oct-2026): 10 hardcoded custom moves (New Logora), an HP-only `updatePlayerState` command, debug code, and a few exports. Branches: `master`, `dynamic-dex-data` (a proof of concept for injecting custom data), `rebase/8-5-23`, `fix-lint-issues`.
- Commands: `npm run build`, `npm test` (lint, then Mocha, then `tsc`), `npm run full-test`. Sim tests live in `test/sim/`.
- Showdown's architecture: battle logic in `sim/` (`battle.ts`, `battle-actions.ts`, `battle-stream.ts`), data in `data/` with one mod per older generation in `data/mods/genN/`. A battle is driven by text commands over a stream (`>start`, `>p1 move 1`), and it's **deterministic from its seed plus the list of inputs**, which is how we persist and recover battles.
- Keep every patch small, in its own commit, with sim tests, so upstream rebases stay cheap ([14 § Fork strategy](../architecture/concepts/14-battle-system-and-showdown.md#fork-strategy-options)).

**Order**
1. Fork: M0C-03 (archive the custom moves) → M0C-04 (rebase) → M0C-05 (remove debug code) → M0C-06 (publish as a package).
2. Monorepo, in parallel once M0A-09 exists: M0C-01 (`libs/battle` scaffold, with the port types in `libs/core`) and M0C-02 (`Clock`/`Rng`).
3. Then M1's Arena epics ([E-M1-3..5](m1-battle-core-and-catalog.md#arena-epics-e-m1-3-e-m1-4-e-m1-5)). The Arena needs none of the sim patches; those land in the Kanto checkpoints (CP0b, CP0c, CP2) and serve the adventure.

---

## E-M0C-1 · Battle Library Scaffold
`Type: Epic` · `Priority: P0`

The `libs/battle` package with its interfaces, and the time and randomness ports battles and the engine share. Moved here from M0a (Oct 2026) so Arena work isn't queued behind platform hygiene.

### M0C-01 · Scaffold `libs/battle` with its interfaces
`Type: Task` · `Parent: E-M0C-1` · `Priority: P0` · `Size: S` · `Labels: area:battle` · `Blocked by: M0A-09` · `agent-ready: yes` · `Owner: agent`

**Summary:** The package and types only. The Showdown implementation is M1.

**Acceptance criteria**
- The port **types** live in `libs/core` (`ports/battle`), because `libs/engine` and `libs/battle` may import `core` but never each other (M0A-10); `libs/battle` holds the implementation scaffold. Types: `BattlePort` (start/choose/inject/subscribe), `BattleSpec` (including the reserved `turnGate`), `StatePatch`, `BattleEvent`, `ExternalActionResolver`, `ExternalActionContext`/`Outcome`, and `TurnDigest` types.
- Everything crossing these interfaces is serializable (a test round-trips through `JSON`).
- No Showdown dependency yet.
- Adds `scope:battle` to the module-boundary rules (M0A-10) if those already exist.

**Refs:** [14 § Package placement](../architecture/concepts/14-battle-system-and-showdown.md), [22](../architecture/concepts/22-adventure-log-and-narration.md)

### M0C-02 · `Clock` and seeded `Rng`
`Type: Task` · `Parent: E-M0C-1` · `Priority: P1` · `Size: S` · `Labels: area:engine, area:battle` · `Blocked by: M0A-09` · `agent-ready: yes` · `Owner: agent`

**Acceptance criteria**
- Both ports live in `libs/core` (`ports/`), so `libs/battle` (turn timers) and `libs/engine` (encounters, rolls) share them.
- `Clock` port: a system implementation and a fixed/test implementation, plus a `Scheduler` port for timers that BattleService's turn deadlines use (M1).
- `Rng` port: a deterministic PRNG seeded by `hash(journeyId, actionId)`, with `int`, `float`, `pick`, and `weighted` helpers.
- Tests prove the same seed gives the same sequence.

**Refs:** [18 § Randomness](../architecture/concepts/18-rules-time-and-randomness.md)

---

## E-M0C-2 · Showdown Fork Clean-up & Packaging
`Type: Epic` · `Priority: P0`

Get the fork onto current upstream with only our deliberate changes left, and make the monorepo depend on it as a versioned package. The sim patches the adventure needs (state injection, the external choice hook, isolated custom-data dexes) stay in M1; PvP in the Arena needs none of them ([14](../architecture/concepts/14-battle-system-and-showdown.md#decisions-oct-2026)). Issues for this epic live in the fork repo.

### M0C-03 · Archive the custom moves and restore upstream tests
`Type: Task` · `Parent: E-M0C-2` · `Priority: P0` · `Size: S` · `Labels: area:showdown-fork` · `Blocked by: —` · `agent-ready: yes` · `Owner: any`

**Summary:** The 10 New Logora moves hardcoded in base data shift Metronome's pool and forced 3 upstream tests to be commented out. Preserve them on a branch, then remove them from `master` (Q28).

**Acceptance criteria**
- A branch `archive/new-logora-moves` holds the current `master` state of the moves (`data/moves.ts`, `data/text/moves.ts`) and `secondaryChanceCallback`.
- On `master`, the 10 moves (negative `num`s) and their text are removed, and `secondaryChanceCallback` is removed unless something else uses it.
- The 3 commented-out upstream tests (`twoturnmoves`, `counter`, `mirrormove`) are restored and pass.
- `npm test` passes.

**Refs:** [14 § Decisions](../architecture/concepts/14-battle-system-and-showdown.md#decisions-oct-2026)

### M0C-04 · Rebase onto current upstream
`Type: Task` · `Parent: E-M0C-2` · `Priority: P0` · `Size: M` · `Labels: area:showdown-fork` · `Blocked by: M0C-03` · `agent-ready: no` · `Owner: senior`

**Summary:** Bring the fork from its Aug 2023 base to current `smogon/pokemon-showdown` `master`, keeping only the deliberate changes. Among other upstream gains, this brings Showdown's localized text (`data/text/<lang>`: names, descriptions, and battle message templates in 8 languages), which translation will use later ([30](../architecture/concepts/30-internationalization-readiness.md#showdowns-translations)).

**Acceptance criteria**
- `upstream` remote configured; `master` rebased (or merged) onto current upstream, with our remaining changes as a short, named list of commits: the `updatePlayerState` command, the `RandomPlayerAI`/`Moves` exports, and the callable `buildSimulator()`.
- **Fallback** if the rebase is painful: start fresh from upstream `master` and re-apply only those changes as new commits (decided, Q20).
- `npm run full-test` passes. The PR lists each kept change and why.

**Refs:** [14 § Fork strategy](../architecture/concepts/14-battle-system-and-showdown.md#fork-strategy-options)

### M0C-05 · Remove debug code
`Type: Task` · `Parent: E-M0C-2` · `Priority: P1` · `Size: S` · `Labels: area:showdown-fork` · `Blocked by: M0C-04` · `agent-ready: yes` · `Owner: any`

**Acceptance criteria**
- The `pause`, `resume`, and `sendToJSON` debug commands are removed from `sim/battle-stream.ts`, along with any helpers only they used.
- `npm test` passes.

**Refs:** [14 § Current state of the fork](../architecture/concepts/14-battle-system-and-showdown.md#current-state-of-the-fork-branch-inventory-oct-2026)

### M0C-06 · Publish the fork as a versioned package
`Type: Task` · `Parent: E-M0C-2` · `Priority: P0` · `Size: M` · `Labels: area:showdown-fork, area:infra` · `Blocked by: M0C-04, M0A-01` · `agent-ready: no` · `Owner: senior`

**Summary:** The monorepo depends on the fork as a versioned package, not a git submodule (Q20).

**Acceptance criteria**
- Tagged releases of the fork published as **`@pokesandbox/pokemon-showdown`** to GitHub Packages or npm, mirroring upstream's `pokemon-showdown` package name so imports read the same as upstream's (`import { Dex } from '@pokesandbox/pokemon-showdown'`). The monorepo pins an exact version.
- A scheduled monthly workflow opens an upstream-sync PR in the fork.
- Links point at the fork's org location after the move (M0A-01). The repo keeps the name `pokemon-showdown`.
- **Follow-ups:** the catalog imports (M1-02, M1-03) switch from upstream `pokemon-showdown` to this package and re-run.

**Refs:** [14 § Decisions](../architecture/concepts/14-battle-system-and-showdown.md#decisions-oct-2026)
