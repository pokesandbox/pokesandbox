# PokeSandbox: agent instructions

A Discord bot plus a web app that lets Discord servers build their own Pokémon games ("regions") and play them in Discord. Read [`docs/start-here.md`](docs/start-here.md) for the product, the plan, and the glossary. This file holds the rules you must follow; [`CONTRIBUTING.md`](CONTRIBUTING.md) explains them for humans.

## Repo map

| Path            | What                                                                  |
| --------------- | --------------------------------------------------------------------- |
| `apps/bot`      | discord.js + FlowCord. Game host: Discord renderers, menus, handlers  |
| `apps/webapp`   | Next.js App Router + tRPC. Authoring (mobile-first), profiles         |
| `shared`        | Mongoose + Zod models and DTOs, DB connection, cache                  |
| `libs/core`     | Pure TypeScript: schemas, ports, registries, formulas. No I/O         |
| `libs/*` (soon) | `engine` (#153), `battle` (#123), `authoring` (#145), `presentation`  |
| `docs/`         | Architecture concepts, decision record (`open-questions.md`), roadmap |
| `scripts/`      | Seed data (`scripts/seed`), ERD generator, env setup                  |

Each package has its own `AGENTS.md`. Read it before changing code there.

## Commands

| Command                             | Use                                                                |
| ----------------------------------- | ------------------------------------------------------------------ |
| `npm run affected`                  | Lint, typecheck, and test what you changed (vs `origin/develop`)   |
| `npx nx <target> <project>`         | One target, e.g. `npx nx test shared`                              |
| `npm run format`                    | Prettier on the whole repo (the pre-commit hook does staged files) |
| `npm run erd:generate`              | Regenerate `docs/erd.md` after model changes                       |
| `npm run setup` / `npm run db:seed` | Local env, Mongo in Docker, seed data                              |

## Musts

Every change, human or agent. ⚙ = enforced by a hook or CI.

**Issues, branches, PRs**

- Work from an issue. One issue → one branch from `develop` → one PR into `develop`. This is a convention; the PR Gate only requires that the PR closes an open issue.
- ⚙ Never push to `develop` or `master` directly; changes reach them only through PRs.
- ⚙ Branch name: `<issue>-<kebab-description>`, e.g. `104-encode-architecture-rules`. Use it even when your tool or harness suggests another name.
- If a PR outgrows its issue (bigger than the issue's size, or a reviewer couldn't check the acceptance criteria from the PR alone), split the **issue**: narrow the original to what this PR delivers, and move the rest to a new sub-issue of the same epic. Every PR closes exactly one issue, its own:
  - PR 1 (`104-…`): `Closes #104`.
  - PR 2 (`215-…`, #215 being the new sub-issue): `Closes #215` and `Part of #104`.
  - Never put `Closes #104` on both. The first merge closes #104, the second PR then fails the Linked issue check, and the board shows #104 Done while work remains.
- ⚙ The PR body closes its issue (`Closes #N`) and follows [the template](.github/pull_request_template.md). Open it as a **draft**; mark it ready only when CI, Linked issue, and SonarCloud pass.
- Agents leave the template's two AI checkboxes **unchecked**. They are the human's attestation.

**Commits**

- ⚙ Subject: `[#<issue>] <type>(<scope>)?: <summary>`, at most 72 characters, imperative, no trailing period. Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `style`, `perf`, `build`. Example: `[#104] docs: add agent musts`.
- Add a body only to explain _why_. One logical change per commit: PRs are merged with merge commits, so every subject lands on `develop`.

**Before every push**

- ⚙ `npm run affected` passes (Claude Code blocks the push otherwise). It covers the projects you changed and everything that depends on them; a full-repo run isn't needed.
- Never use `--no-verify`, `.skip`/`.only`, or disable a lint rule to get green. If a failure isn't caused by your change, say so in the PR; don't work around it.

**Hygiene**

- ⚙ Stage files by name (no `git add -A` / `git add .`). Don't hand-format or reorder imports; the pre-commit hook does it. Don't reformat code you didn't change.
- Never commit `.env`, tokens, or real server IDs.
- No `any`, `@ts-ignore`, or non-null `!` without a one-line reason. No new dependency without a reason in the PR.
- Model changes: run `npm run erd:generate` and update `scripts/seed/data`.
- If your change makes this file, a package `AGENTS.md`, `CONTRIBUTING.md`, or a skill wrong, update it in the same PR.

**Tests**

- New behavior gets tests, named `*.test.ts(x)` and placed next to the code (⚙ CI rejects `*.spec.*` files). Test the behavior the acceptance criteria describe; a test that only executes lines without asserting anything meaningful doesn't count.
- ⚙ SonarCloud requires 80% coverage of new and changed lines in `apps/bot`, `apps/webapp`, `shared`, and `libs/core`. It runs only in CI, after you push, so check first: `npx nx test <project> --coverage` prints a summary and writes line detail to `coverage/<project>/index.html`.
- Libraries are tested headless with in-memory ports. Discord view builders are pure functions: test their output directly.

**When it's unclear**

- If the issue leaves a design question open, stop: comment on the issue, add `needs-decision`, and don't decide it in code.
- Never edit a concept doc's **Decisions** or `docs/architecture/open-questions.md` unless the issue says to. In a concept doc, Decisions win over the rest of the text.
- Undecided right now: where the Mongoose repositories behind the engine's ports live (`shared/` or a new lib). Ask on the issue; #153 settles it.

## Architecture rules

The code is mid-migration. Build the **target** shape below; don't copy the legacy patterns listed after it. Status shows whether the API exists yet.

| Rule                                                                                                                                                                                                                                                                                                                                                                          | Doc                                                                                                                                                                                              | Status                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Layering: `core` → `engine` / `battle` / `authoring` / `presentation` → apps. Libraries receive **ports** (repositories, `BattlePort`, `Clock`, `Rng`); only **apps compose** implementations. No module singletons. Everything crossing a port is serializable data. Libraries never import `discord.js`; only `libs/battle` imports Showdown; `mongoose` stays out of libs. | [03](docs/architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026)                                                                        | `core` live; lint enforcement #114                                                      |
| No new logic in Discord menu handlers. Gameplay goes through `engine.dispatch(journeyId, action)`; authoring goes through `authoring.execute(actor, command)`.                                                                                                                                                                                                                | [03](docs/architecture/concepts/03-engine-boundary-and-game-loop.md), [16](docs/architecture/concepts/16-authoring-validation-and-portability.md#authoring-the-same-pattern-for-region-building) | #153, #145. Until then, put new rules in pure functions in `libs/core`, not in handlers |
| Identity: ObjectIds for **documents** only (users, servers, characters, journeys, Pokémon). Authored content uses an opaque, region-scoped `key`, separate from `_id` (unique on `{ regionId, key }`). Canon content uses Showdown IDs (`pikachu`); custom content uses `<publisherId>:<slug>`. Keys are opaque. References point one way, child → parent.                    | [02](docs/architecture/concepts/02-identity-and-references.md#principles)                                                                                                                        | #138, #139, #120                                                                        |
| Conditions, gates, and effects are the only way to gate or reward anything. No bespoke requirement or reward fields. Effects are atomic, idempotent, and have no inline conditions.                                                                                                                                                                                           | [05](docs/architecture/concepts/05-requirements.md#4-a-standard-gate-envelope-for-anything-that-blocks-an-action-decided-oct-2026), [06](docs/architecture/concepts/06-effects.md)               | #126–#136                                                                               |
| Cache only immutable data (releases, catalog, `lean()` objects). Never cache, share, or close over hydrated mutable documents. Prefer atomic `$set` over load-mutate-save; multi-document writes use transactions.                                                                                                                                                            | [15](docs/architecture/concepts/15-persistence-concurrency-and-runtime.md#recommendations)                                                                                                       | #119, #117                                                                              |
| Players: a **user** is the Discord account; a **character** is the persona (original trainer of its Pokémon); a **journey** is one region's playthrough and holds all engine state. `user` / `character` / `journey` are the only scopes. Never call the player a "trainer" in code (that's NPC trainers). Effects never write to characters or users.                        | [23](docs/architecture/concepts/23-players-characters-journeys-and-scopes.md#scopes-decided-oct-2026)                                                                                            | design                                                                                  |
| Discord: renderers are pure view builders (no I/O). Locked options always explain themselves. Anything that must survive a restart uses stable custom IDs (`<feature>:<verb>:<recordId>`). FlowCord sessions hold IDs, not documents. Engine responses use the fixed wording in 26.                                                                                           | [26](docs/architecture/concepts/26-discord-surface-and-ux-patterns.md#menus-and-feedback)                                                                                                        | live                                                                                    |
| i18n readiness: player-facing system text goes through `t(key, params)` (ICU), never hard-coded strings or concatenated sentences. Every text item in a list has a stable `id`. Events carry references, not finished text.                                                                                                                                                   | [30](docs/architecture/concepts/30-internationalization-readiness.md#5-system-text-uses-message-keys)                                                                                            | `t()` #115                                                                              |
| Live state: battles, timers, challenges, and trades carry `guildId`, run only under a battle lease (`ownsGuild`), and are never assumed to live in one process. The webapp never runs battles or timers.                                                                                                                                                                      | [15](docs/architecture/concepts/15-persistence-concurrency-and-runtime.md#sharding-deploys-and-who-owns-live-state-decided-oct-2026)                                                             | #164                                                                                    |
| Unreleased features sit behind `isEnabled(flag)` from the typed flag registry; commands declare their flag.                                                                                                                                                                                                                                                                   | [21](docs/architecture/concepts/21-hosting-and-environments.md#feature-flags-decided-oct-2026)                                                                                                   | #109, #108                                                                              |
| Models: Zod `fooSchema` is the source of truth, mirrored by Mongoose `fooDbSchema`. Details in [`shared/AGENTS.md`](shared/AGENTS.md).                                                                                                                                                                                                                                        | [start-here](docs/start-here.md)                                                                                                                                                                 | live                                                                                    |

### Legacy: don't copy

| Pattern in today's code                                                                                | Instead                                                           | Retired by |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------- |
| Bot cache helpers that cache and `save()` hydrated docs (`apps/bot/src/cache`)                         | Fresh reads per action, `lean()` for cached reads, atomic updates | #119       |
| Logic inside `/region` builder handlers                                                                | `libs/authoring` commands                                         | #146–#148  |
| Bidirectional arrays (`Region.locations`, `Server.playerList`, `User.servers`, `Region.characterList`) | Child stores the parent ID                                        | #139       |
| ObjectId content references (`speciesId`, `itemId`, `toLocationId`)                                    | Showdown IDs and content keys                                     | #120, #138 |
| AND-only requirement buckets (`shared/src/models/requirement.ts`)                                      | Condition tree + gates                                            | #127       |
| `baseGeneration`                                                                                       | `RegionRules`                                                     | rules work |
| `/server` command prefixes                                                                             | Remove                                                            | #106       |
| Per-guild command folders (`interactions/guilds/dev`)                                                  | Global registration + feature flags                               | #108       |
| antd in the webapp                                                                                     | Tailwind + the chosen headless library                            | #202, #203 |
| DexEntry has no Zod schema                                                                             | Catalog rework                                                    | #120, #157 |

## More context

- [`docs/start-here.md`](docs/start-here.md): product, plan, glossary, where things live.
- [`docs/architecture/README.md`](docs/architecture/README.md): concept index. Don't read every concept doc; read the ones your issue links, Decisions first.
- [`docs/architecture/open-questions.md`](docs/architecture/open-questions.md): the decision record (Q1–Q38 and smaller decisions).
- The issue's parent epic has a **Background** section with the context its issues need.
- Skills in [`.claude/skills/`](.claude/skills/) (`start-issue`, `ship`, `add-shared-model`) walk through these procedures step by step, for tools that load them.
