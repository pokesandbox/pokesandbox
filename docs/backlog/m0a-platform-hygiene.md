# M0a: Platform Hygiene (backlog draft)

**Outcome:** the org and CI exist, contributors and agents have the rules, `libs/core` and the enforced package boundaries are in place, and the data layer is safe for real player state. Everything else builds on this, but **most of it doesn't block Arena work**: the Arena path needs only `libs/core` (M0A-09) from here before M0c can start. See [M0c](m0c-arena-foundations.md).

**Hosting and production environments are in M2** ("Launch Readiness", see [`m2-launch-readiness.md`](m2-launch-readiness.md)). Development runs locally; hosting is the last step before going live.

The adventure engine skeleton (`libs/engine`, `dispatch`, the test harness) moved to [M0b](m0b-content-foundations.md#e-m0b-5--engine-skeleton), and `libs/battle` and `Clock`/`Rng` to [M0c](m0c-arena-foundations.md) (Oct 2026), so this milestone is only shared hygiene.

Refs: [`mvp.md`](../roadmap/mvp.md) · [`github-project-setup.md`](../roadmap/github-project-setup.md) · concepts [03](../architecture/concepts/03-engine-boundary-and-game-loop.md), [15](../architecture/concepts/15-persistence-concurrency-and-runtime.md)

## Start here
New to the project? Read [`docs/start-here.md`](../start-here.md) first (what PokeSandbox is, the plan, the repo, how work flows). Context specific to this file:
- **What M0a is:** plumbing that every later milestone relies on. Most issues are small and well specified, and several are good first issues (`agent-ready: yes`).
- **What you'll touch:** GitHub settings and workflows (`.github/`), Nx configuration (`nx.json`, `project.json` files), `shared/src/models` (indexes, the `speciesId` rename), and `docker-compose.yml` (local Mongo).
- **Order:** M0A-01 → M0A-02/03 are owner-led (the org move). M0A-24 (the owner's concept review) runs alongside everything. M0A-04 (CI), M0A-05 (agent rules), M0A-09 (`libs/core`), M0A-16 (replica set), M0A-20 (sprites), and M0A-21 (feature flags) can start any time. **M0A-22 (critical Dependabot alerts) is first in line.** M0A-17 → M0A-19 build on each other.
- **The one Arena dependency:** M0A-09 (`libs/core`). If you're here to help the Arena, do that one and then go to [M0c](m0c-arena-foundations.md).

---

## E-M0A-1 · Org & Delivery Setup
`Type: Epic` · `Priority: P0`

Move the repos to the org, get CI gating every PR, and give contributors and agents the rules they need to work safely.

### M0A-01 · Transfer repos to the org
`Type: Task` · `Parent: E-M0A-1` · `Priority: P0` · `Size: S` · `Labels: area:infra` · `Blocked by: —` · `agent-ready: no` · `Owner: owner`

**Summary:** Transfer `nbely/pokesandbox` and `nbely/pokemon-showdown` to the new org. Install the Claude GitHub App on the org.

**Acceptance criteria**
- Both repos live under the org. Old URLs redirect.
- The fork **keeps the name `pokemon-showdown`**, matching upstream so remotes, docs, and paths read the same (decided Nov 2026). Its default branch is unchanged.
- The Claude GitHub App is installed on the org with access to both repos.
- Branch protection on `master`: PRs required, owner review required, CI must pass (once M0A-04 lands).

### M0A-02 · Update repo references after the move
`Type: Task` · `Parent: E-M0A-1` · `Priority: P1` · `Size: S` · `Labels: area:docs` · `Blocked by: M0A-01` · `agent-ready: yes` · `Owner: agent`

**Summary:** Replace `nbely/...` links and references in README, issue templates, `agents.md`, `copilot-instructions.md`, and CODEOWNERS with the org paths.

**Acceptance criteria**
- `grep -r "github.com/nbely"` returns only intentional historical references.
- CODEOWNERS lists the owner for `*`.
- Links in the issue templates resolve.

**Refs:** [github-project-setup](../roadmap/github-project-setup.md)

### M0A-03 · GitHub bootstrap: labels, milestones, project
`Type: Task` · `Parent: E-M0A-1` · `Priority: P0` · `Size: S` · `Labels: area:infra` · `Blocked by: M0A-01` · `agent-ready: no` · `Owner: owner`

**Summary:** Run `scripts/github/bootstrap.sh` (authored alongside this backlog) to create the labels and milestones (M0a, M0b, M1–M6), and create the org Projects v2 board with the fields from `github-project-setup.md`.

**Acceptance criteria**
- All labels from `github-project-setup.md` exist, including `agent-ready`.
- Milestones M0a, M0b, and M1–M6 exist.
- The project has the Status, Priority, Size, Phase, Area, and Track fields and the views described.

### M0A-04 · CI: lint, typecheck, and unit tests on every PR
`Type: Task` · `Parent: E-M0A-1` · `Priority: P0` · `Size: M` · `Labels: area:infra` · `Blocked by: —` · `agent-ready: yes` · `Owner: agent`

**Summary:** A GitHub Actions workflow running `nx affected` lint, typecheck, and test on PRs and on pushes to `master`, with Node 22 and npm caching.

**Acceptance criteria**
- The workflow runs on `pull_request` and `push` to `master`.
- Uses `nx affected` with the correct base/head SHAs. A full run on `master`.
- Fails on lint errors, type errors, or test failures. Passes on the current `master`. Fix or explicitly skip pre-existing failures in this PR, with a note.
- The README shows a CI status badge.

### M0A-05 · Encode the architecture rules for contributors and agents
`Type: Task` · `Parent: E-M0A-1` · `Priority: P0` · `Size: M` · `Labels: area:docs` · `Blocked by: —` · `agent-ready: yes` · `Owner: agent`

**Summary:** Update `.github/agents.md` and `.github/copilot-instructions.md` with the decided rules, so humans and agents build the new shape and not the old one.

**Acceptance criteria**
- Document the package layering (`core` → `engine` / `battle` / `authoring` → apps) and the "apps compose, libs take ports" rule.
- Document content keys (region-scoped, separate from `_id`), Showdown IDs for canon content, and `<publisherId>:<slug>` for custom content.
- Document "no new logic in Discord menu handlers; gameplay goes through `engine.dispatch`, authoring through `authoring.execute`".
- Document conditions/effects/gates as the only gating and reward mechanisms.
- Document the cache policy (no hydrated mutable docs).
- Document the player terms and scopes: a **character** is the persona (original trainer of its Pokémon), a **journey** is one region's playthrough and holds engine state, and `user` / `character` / `journey` are the only scopes. Never call the player a "trainer" in code (that's NPC trainers). Effects never write to characters or users.
- Document the Discord rules: pure view builders, locked options always explain themselves, stable custom IDs for anything that must survive a restart, and the fixed engine-response wording.
- Document translation readiness ([30](../architecture/concepts/30-internationalization-readiness.md)): player-facing system text goes through `t(key, params)`, never hard-coded strings or sentence concatenation; every text item in a list has a stable `id`; events carry references, not finished text.
- Document live-state ownership: battles and timers carry `guildId`, run only under a battle lease, and are never assumed to live in a single process.
- Document the existing model code conventions, which live only in code today:
  - Zod entity schema is the source of truth, named `fooSchema`. The mirroring Mongoose schema is named `fooDbSchema`.
  - Embedded sub-schemas are standalone `Schema` consts with `{ _id: false }`.
  - Map fields are parsed with `zMapHydrator`.
- Each rule links its concept doc. Remove outdated guidance that contradicts the docs (e.g. "cache-first" for mutable docs).

**Refs:** [architecture README](../architecture/README.md), [03](../architecture/concepts/03-engine-boundary-and-game-loop.md), [23](../architecture/concepts/23-players-characters-journeys-and-scopes.md), [26](../architecture/concepts/26-discord-surface-and-ux-patterns.md), [02](../architecture/concepts/02-identity-and-references.md), [15](../architecture/concepts/15-persistence-concurrency-and-runtime.md)

### M0A-24 · Owner review: deep-dive concepts 09–30
`Type: Task` · `Parent: E-M0A-1` · `Priority: P1` · `Size: L` · `Labels: area:docs` · `Blocked by: —` · `agent-ready: no` · `Owner: owner`

**Summary:** Concepts 01–08 have had a full owner review. Concepts 09–30 were decided through Q&A but haven't been read end to end by the owner. Scrutinize each one before the work it drives starts, so nothing gets built on a decision that only looked right in isolation.

**Acceptance criteria**
- Each concept below is read in full, with its Decisions section checked against [`open-questions.md`](../architecture/open-questions.md) and the backlog issues that reference it. Tick when done:
  - [ ] [09 Transportation](../architecture/concepts/09-transportation.md)
  - [ ] [10 Wild Encounters](../architecture/concepts/10-encounters.md)
  - [ ] [11 NPCs, Trainers & Battle Definitions](../architecture/concepts/11-npcs-trainers-and-battle-definitions.md)
  - [ ] [12 Content Catalog](../architecture/concepts/12-content-catalog-species-moves-items.md)
  - [ ] [13 Pokémon Instances & Trading](../architecture/concepts/13-pokemon-instances-and-trading.md)
  - [ ] [14 Battle System & the Showdown Fork](../architecture/concepts/14-battle-system-and-showdown.md)
  - [ ] [15 Persistence, Concurrency & Runtime](../architecture/concepts/15-persistence-concurrency-and-runtime.md)
  - [ ] [16 Authoring, Validation & Portability](../architecture/concepts/16-authoring-validation-and-portability.md)
  - [ ] [17 Economy, Shops & Inventory](../architecture/concepts/17-economy-shops-inventory.md)
  - [ ] [18 Region Rules, Time & Randomness](../architecture/concepts/18-rules-time-and-randomness.md)
  - [ ] [19 Multiplayer, Social & Future-Proofing](../architecture/concepts/19-multiplayer-social-and-future-proofing.md)
  - [ ] [20 Database & Realtime Platform](../architecture/concepts/20-database-and-realtime-platform.md)
  - [ ] [21 Hosting & Environments](../architecture/concepts/21-hosting-and-environments.md)
  - [ ] [22 Adventure Log & Narration](../architecture/concepts/22-adventure-log-and-narration.md)
  - [ ] [23 Players: Characters, Journeys & Scopes](../architecture/concepts/23-players-characters-journeys-and-scopes.md)
  - [ ] [24 Shared State](../architecture/concepts/24-shared-state-region-and-server.md)
  - [ ] [25 Arena](../architecture/concepts/25-arena.md)
  - [ ] [26 Discord Surface & UX Patterns](../architecture/concepts/26-discord-surface-and-ux-patterns.md)
  - [ ] [27 Server Content Library & Overrides](../architecture/concepts/27-server-content-library-and-overrides.md)
  - [ ] [28 Webapp Authoring & Mobile-first UX](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)
  - [ ] [29 Flavor Text & Prose](../architecture/concepts/29-flavor-text-and-prose.md)
  - [ ] [30 Internationalization Readiness](../architecture/concepts/30-internationalization-readiness.md)
- Anything that changes a decision is recorded in `open-questions.md` (a new Q or the Smaller decisions index) and the concept's Decisions section, and the affected backlog issues are updated in the same PR.
- Priority order: the concepts the Arena path depends on first (14, 25, 26, 15, 21), then the content track (10, 11, 12, 13, 16, 18, 23), then the rest.

**Refs:** [architecture README](../architecture/README.md), [`open-questions.md`](../architecture/open-questions.md)

### M0A-06 · Scheduled agent pickup workflow
`Type: Task` · `Parent: E-M0A-1` · `Priority: P2` · `Size: M` · `Labels: area:infra` · `Blocked by: M0A-03, M0A-04` · `agent-ready: no` · `Owner: owner`

**Summary:** A scheduled workflow that picks the next eligible issue for an AI agent.

**Acceptance criteria**
- Selects the highest-priority issue that is `agent-ready`, unassigned, and unblocked in the current milestone.
- Never selects `Decision`/`Spike` issues or issues labeled `needs-decision`.
- Assigns before starting (no double pickup). Opens one PR per issue that links it.
- Can be disabled with a repo variable.

**Refs:** [github-project-setup § Team & workflow](../roadmap/github-project-setup.md#team--workflow-decided-oct-2026-q29)

### M0A-07 · Global slash command registration with per-server feature gating
`Type: Task` · `Parent: E-M0A-1` · `Priority: P1` · `Size: M` · `Labels: area:bot` · `Blocked by: M0A-21` · `agent-ready: no` · `Owner: junior`

**Summary:** Replace dev-guild-only registration (`interactions/guilds/1010726453974925402`) with global registration, plus a dev-guild override for local development.

**Acceptance criteria**
- Production registers commands globally. Dev mode registers to a configured test guild (env var).
- Each command declares an optional feature flag (M0A-21). Commands whose flag is on by default register globally; flag-off commands register as guild commands only on servers with an override (and to the dev test guild). The interaction handler checks the flag before running a command.
- The existing admin commands (`/region` and its builders) are tagged `discord.authoring`, so they're hidden in production and visible in dev (Q36).
- Fix while here: in `structures/managers/slashCommands.ts`, an ignored global command `return`s out of the whole manager (it should `continue`), and the commented-out global `rest.put` sends the command objects instead of the collected JSON bodies.
- Existing admin commands keep working in dev. The old guild-folder structure is removed or documented as dev-only.

### M0A-21 · Feature flag registry
`Type: Task` · `Parent: E-M0A-1` · `Priority: P1` · `Size: S` · `Labels: area:shared-models, area:bot, area:webapp` · `Blocked by: —` · `agent-ready: yes` · `Owner: agent`

**Summary:** A free, in-repo way to keep unreleased features off in production and on in dev ([21 § Feature flags](../architecture/concepts/21-hosting-and-environments.md#feature-flags-decided-oct-2026)). No hosted service.

**Acceptance criteria**
- `defineFlag(key, { description, defaults: { dev, staging, prod } })` and `isEnabled(key, { env, guildId? })`, with flag keys as a typed union so an unknown key is a compile error. Lives in `shared/` for now and moves to `libs/core` with M0A-09.
- Resolution order: `FEATURE_FLAGS` env var (`*` for all, `a,b` to enable, `-a` to disable), then `Server.settings.features[key]`, then the environment's default. Unit tests for each step.
- `.env.example` sets `FEATURE_FLAGS=*` for dev, so every command is visible locally.
- The first flag is `discord.authoring` (`dev: true, staging: true, prod: false`).
- A short section in the contributor docs: how to add a flag, and that a flag is removed when its feature is fully released.

**Refs:** [21 § Feature flags](../architecture/concepts/21-hosting-and-environments.md#feature-flags-decided-oct-2026), [28 § Transition](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md#transition-the-existing-discord-builders)

### M0A-22 · Fix the critical Dependabot alerts now
`Type: Task` · `Parent: E-M0A-1` · `Priority: P0` · `Size: M` · `Labels: area:infra, dependencies` · `Blocked by: —` · `agent-ready: no` · `Owner: senior`

**Summary:** Pulled ahead from M2-14: only the **critical** alerts, fixed now. High, moderate, and low alerts, Dependabot configuration, and the CI audit gate stay in M2-14. GitHub reported 15 critical alerts on the default branch (Oct 31, 2026); a local `npm audit` on the same commit showed 12 critical packages.

**What `npm audit` flagged as critical (Oct 31, 2026; re-check when starting):**

| Package | How it's pulled in | Runs in production? | Fix |
|---|---|---|---|
| `next` | direct (webapp) | yes | upgrade within 16.x (16.4.3 or later) |
| `next-auth`, `@auth/core` | direct (webapp sign-in) | yes | upgrade to the latest v5 beta |
| `form-data`, `proxy-addr`, `websocket-driver` | transitive | likely (check with `npm ls`) | `npm audit fix`, or bump the parent |
| `shell-quote` | transitive | check | `npm audit fix` |
| `koa`, `@module-federation/dts-plugin`, `@nx/vite`, `vitest`, `tinypool` | Nx tooling | no (dev and build only) | the Nx upgrade the advisory points to (`@nx/*` 24.x) |

**Acceptance criteria**
- Every **critical** alert is fixed (upgrade, replace, or remove) or dismissed in GitHub with a written reason (e.g. dev-only and not reachable). Production dependencies are fixed, not dismissed.
- The Nx major upgrade, if needed for the tooling alerts, runs through `nx migrate` in its own PR, separate from the runtime fixes.
- After each upgrade: the bot starts and the webapp signs in with Discord (manual check noted in the PR), and lint, typecheck, and tests pass.
- High, moderate, and low alerts are **not** in scope (M2-14).

**Refs:** [M2-14](m2-launch-readiness.md#m2-14--dependency-security-clear-dependabot-alerts-and-keep-them-cleared)

---

## E-M0A-2 · Shared Library Foundations
`Type: Epic` · `Priority: P0`

Create `libs/core` and the enforced package boundaries, plus shared logging. The libraries built on it come later: `libs/battle` in [M0c](m0c-arena-foundations.md), `libs/engine` in [M0b](m0b-content-foundations.md#e-m0b-5--engine-skeleton), `libs/authoring` in M0b.

### M0A-08 · Structured logging; keep debug events out of Mongo
`Type: Task` · `Parent: E-M0A-2` · `Priority: P1` · `Size: S` · `Labels: area:infra` · `Blocked by: M0A-09` · `agent-ready: yes` · `Owner: agent`

**Summary:** A structured JSON logger shared by the apps and libs (via an injected logger port), with correlation fields. Debug-level game events go to logs, never to Mongo collections.

**Acceptance criteria**
- A logger interface in `libs/core`, with an implementation in the apps. Libs never import a concrete logger.
- Fields: `env`, `actionId`, `journeyId`, `battleId`, `regionId`, `level`.
- Log level configured per environment.

**Refs:** [21 § Retention](../architecture/concepts/21-hosting-and-environments.md)

### M0A-09 · Scaffold `libs/core`
`Type: Task` · `Parent: E-M0A-2` · `Priority: P0` · `Size: S` · `Labels: area:engine` · `Blocked by: —` · `agent-ready: yes` · `Owner: agent`

**Acceptance criteria**
- An Nx library `libs/core` with a path alias `@core/*`, Jest, and lint.
- Folders for `schemas/`, `registries/`, `formulas/`, `validation/`, and `ports/`, each with an `index.ts`.
- No dependencies on mongoose, discord.js, or Showdown (enforced by M0A-10).
- **Follow-up:** move catalog models and helpers created earlier in `shared/` (M1-01, M1-03, M3-01, M3-03) into `libs/core`, as a separate PR if this one is already large.

**Refs:** [03 § Package layout](../architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026)

### M0A-10 · Enforce module boundaries
`Type: Task` · `Parent: E-M0A-2` · `Priority: P0` · `Size: S` · `Labels: area:infra` · `Blocked by: M0A-09` · `agent-ready: yes` · `Owner: agent`

**Summary:** Nx project tags plus the `@nx/enforce-module-boundaries` lint rule for the decided layering. Lands as soon as `libs/core` exists; each later library scaffold (M0C-01 `libs/battle`, M0B-23 `libs/engine`, M0B-16 `libs/authoring`) adds its own tag to the rules.

**Acceptance criteria**
- Tags: `scope:core`, `scope:engine`, `scope:battle`, `scope:authoring`, `scope:app-bot`, `scope:app-webapp`, `scope:shared`.
- `core` depends on nothing internal. `engine`, `battle`, and `authoring` depend only on `core`. `app-webapp` cannot depend on `battle`.
- Banned external imports inside libs: `discord.js` in all libs, `mongoose` in `core`/`engine`/`battle`/`authoring`, Showdown outside `battle`.
- A deliberately violating import fails `nx lint` (verified in the PR description).

**Refs:** [03 § Package layout](../architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026)

### M0A-23 · Message catalog and `t()` for system text
`Type: Task` · `Parent: E-M0A-2` · `Priority: P1` · `Size: S` · `Labels: area:bot, area:engine` · `Blocked by: M0A-09` · `agent-ready: yes` · `Owner: agent`

**Summary:** Translation ships much later, but system text must be translatable from the start ([30](../architecture/concepts/30-internationalization-readiness.md)).

**Acceptance criteria**
- A `t(key, params, locale?)` helper in `libs/core` using FormatJS's `intl-messageformat` (ICU MessageFormat), with an English message catalog in a format `next-intl` can also read, so the webapp shares it later. Unknown keys fail a test, not silently at runtime.
- Locale resolution helper: player preference (later) → interaction `locale` → server locale → `'en'`. Shared messages take the server locale.
- Numbers and money formatted with `Intl`.
- A lint rule or test that flags string literals passed directly as message content in renderers (new code only; existing menus are migrated as they're touched).
- Documented in the contributor rules (M0A-05).

**Refs:** [30](../architecture/concepts/30-internationalization-readiness.md)

---

## E-M0A-3 · Persistence & Data Basics
`Type: Epic` · `Priority: P0`

Make the data layer safe for real player state: transactions, constraints, a safe cache, and canon IDs.

### M0A-16 · Local Mongo as a single-node replica set
`Type: Task` · `Parent: E-M0A-3` · `Priority: P0` · `Size: S` · `Labels: area:infra` · `Blocked by: —` · `agent-ready: yes` · `Owner: agent`

**Acceptance criteria**
- `docker-compose.yml` starts Mongo with `--replSet` and auto-initiates the set.
- `npm run setup` still works end to end. A test or script proves `session.withTransaction` succeeds locally.
- `.env.example` connection string updated.

### M0A-17 · Indexes and unique constraints
`Type: Task` · `Parent: E-M0A-3` · `Priority: P0` · `Size: S` · `Labels: area:shared-models` · `Blocked by: M0A-16` · `agent-ready: yes` · `Owner: agent`

**Acceptance criteria**
- Unique `Server.serverId` and `User.userId`. `Location { regionId, ordinal }`.
- Indexes are declared in the schemas and created on startup (`autoIndex` in dev) or by a migration script (prod). Documented.
- `ensureServerInitialized` no longer creates duplicates under concurrent first use (test or reasoning in the PR).

**Refs:** [15](../architecture/concepts/15-persistence-concurrency-and-runtime.md)

### M0A-18 · Cache policy: no shared mutable documents
`Type: Task` · `Parent: E-M0A-3` · `Priority: P0` · `Size: M` · `Labels: area:bot` · `Blocked by: —` · `agent-ready: no` · `Owner: senior`

**Acceptance criteria**
- The cache stores only immutable/plain data (`lean()` objects, frozen in dev). No hydrated Mongoose documents in the cache.
- Admin edits use targeted atomic updates (`$set` on paths) instead of mutate-cached-doc-then-`save()`.
- Existing admin menus keep working (manual test list in the PR).

**Refs:** [15](../architecture/concepts/15-persistence-concurrency-and-runtime.md)

### M0A-19 · Rename DexEntry `showdownName` → `speciesId`, and reference species by ID
`Type: Task` · `Parent: E-M0A-3` · `Priority: P0` · `Size: M` · `Labels: area:shared-models` · `Blocked by: M0A-17` · `agent-ready: yes` · `Owner: agent`

**Summary:** `showdownName` already holds the Showdown ID for all 1,371 seed entries. Rename it to `speciesId` (library entries will use the same ID type, so "Showdown name" stops being accurate) and make it the only way content refers to a species.

**Acceptance criteria**
- `DexEntry.showdownName` renamed to `speciesId` in the model, Zod schema, DTOs, seed data, and `apps/bot/src/utils/searchPokemon.ts`.
- A unique index on `speciesId`. Canon entries only: library overrides and imports share species IDs by design and live in the library model later ([27 § Identity and uniqueness](../architecture/concepts/27-server-content-library-and-overrides.md#identity-and-uniqueness)).
- DexEntry's own links (`baseSpecies`, `prevo`, `evos`, `formes`) store `speciesId` strings instead of `{ id: ObjectId, name }`.
- Encounter slots (`wildTable` `speciesId`, today an ObjectId) and region pokedex slots reference `speciesId` strings. DTOs updated.
- Seed fix: `Unown-!` / `Unown-?` use Showdown's IDs `unownexclamation` / `unownquestion` (currently `unown!` / `unown?`). A test asserts every seed `speciesId` equals Showdown's `toID` of its Showdown name.
- A migration script for existing databases (rename the field, convert ObjectId references to IDs).
- `docs/erd.md` regenerated.
- **Follow-up:** if `Learnset` (M1-03) already exists, switch its orphan test from `showdownName` to `speciesId`.

**Refs:** [02](../architecture/concepts/02-identity-and-references.md), [12](../architecture/concepts/12-content-catalog-species-moves-items.md)

### M0A-20 · Sprite URL resolver and broken link fixes
`Type: Task` · `Parent: E-M0A-3` · `Priority: P2` · `Size: S` · `Labels: area:shared-models` · `Blocked by: —` · `agent-ready: yes` · `Owner: agent`

**Acceptance criteria**
- `resolveSpriteUrl(species, { gen, game, palette, shiny, facing })` is the only way UI code gets sprite URLs. It falls back to the Showdown sprite CDN, and returns `null` when nothing exists (e.g. a custom species with no art), so callers show text instead of a broken image. When the requested generation lacks the species, it tries the next generation up, then down ([18 § Sprite settings](../architecture/concepts/18-rules-time-and-randomness.md#sprite-settings-decided-nov-2026); the configurable `missing` policy and per-entry overrides come later). `facing: 'back'` falls back to the front sprite.
- Fix the 3 Gen 2 shiny entries that point at `imgur.com/<id>` pages (Weedle, Kakuna, Beedrill) to direct `i.imgur.com/<id>.png` images.
- Footprint/shape Bulbagarden hotlinks are listed in an issue for later mirroring (not fixed here).

**Refs:** [open-questions Q32](../architecture/open-questions.md)
