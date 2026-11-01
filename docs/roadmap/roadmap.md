# PokeSandbox Roadmap

The full product roadmap from foundations to "Pie in the Sky". It's based on the owner's roadmap draft (Oct 2026), restructured around the architecture decisions in [`../architecture/`](../architecture/README.md). The detailed MVP breakdown is in [`mvp.md`](mvp.md). The GitHub org and project setup is in [`github-project-setup.md`](github-project-setup.md).

## Phase overview

```
Phase 0  Foundations ─────────┐   engine package, conditions/effects, content keys, rules, infra
                              ▼
Phase 1  Pre-MVP: Arena ──────┤   catalog, team presets, BattleService, multi-user battles, AI   ► PUBLIC RELEASE #1
                              ▼
Phase 2  MVP: "Recreate RBY" ─┤   authoring (region map, NPCs, scripts, publish) + adventure play       ► PUBLIC RELEASE #2
                              ▼
Phase 3  Full-Feature Build ──┤   quests v2, custom content, trading, breeding, events, webapp
                              ▼
Phase 4  Pie in the Sky           co-op, RP adjudication, AI enrichments, dynamic custom moves
```

The ordering principle: **build each primitive once, at the earliest phase that needs it, in its final shape.** Phase 1 is deliberately the battle and Pokémon-data foundation that Phase 2 reuses. Phase 0 is small but non-negotiable: everything after it builds on the engine boundary.

---

## Phase 0: Foundations (pre-Arena)

**Goal:** Make the codebase ready to hold game rules, so nothing in Phase 1–2 gets built in a shape that must be rebuilt.

| Area | Deliverable | Concept |
|---|---|---|
| Engine | `libs/engine` package skeleton: `dispatch(action) → events`, per-journey lock, state revisions, action preconditions, one active `/play` session per journey, injected Clock/Rng, in-memory test harness | [03](../architecture/concepts/03-engine-boundary-and-game-loop.md), [18](../architecture/concepts/18-rules-time-and-randomness.md) |
| Primitives | Condition tree + predicate registry (evaluate/explain/validate/references); Effect union + executor (atomic, idempotent) | [05](../architecture/concepts/05-requirements.md), [06](../architecture/concepts/06-effects.md) |
| Identity | ContentKey type, Showdown-ID references, remove bidirectional arrays, indexes | [02](../architecture/concepts/02-identity-and-references.md) |
| Persistence | Mongo replica set (transactions), cache policy (immutable only), OCC helpers | [15](../architecture/concepts/15-persistence-concurrency-and-runtime.md) |
| Battle | `libs/battle` scaffold with port types in `libs/core`; Clock/Scheduler/Rng ports; fork: archive the 10 New Logora custom moves off `master` (Q28), rebase onto upstream, remove debug code, publish as `@pokesandbox/pokemon-showdown` (M0c). The sim patches (state injection, external choice hook, caught/ran endings, isolated custom-data dexes) are M1 and serve the adventure, not the Arena. | [14](../architecture/concepts/14-battle-system-and-showdown.md) |
| Org & platform | Move repos to the org, CI (lint, typecheck, unit tests), labels/project/milestones, global command registration behind feature flags, the critical Dependabot fixes, the message catalog (`t()`) for system text | [github-project-setup](github-project-setup.md), [21](../architecture/concepts/21-hosting-and-environments.md#feature-flags-decided-oct-2026), [30](../architecture/concepts/30-internationalization-readiness.md) |

Hosting and production operations are **not** Phase 0. They're the launch-readiness step at the end of Phase 1.

**Exit criteria:** an engine unit test can evaluate a condition tree and apply an effect list to an in-memory journey. The fork is rebased onto upstream, published as a package, and consumed by the monorepo.

---

## Phase 1: Pre-MVP "Arena" (public release #1)

**Bot only (decided Nov 2026).** The Arena release ships the Discord bot alone; the webapp goes public with the MVP release. Releasing one surface at a time gives each its own hypercare window instead of support load for both at once. The webapp may be deployed privately (staff, testers) before then.

**Goal:** Showdown-style battles between two server members (and vs AI) with teams validated against server-scoped Arena formats (canon content at launch; the server's custom content library joins later, [27](../architecture/concepts/27-server-content-library-and-overrides.md)). Battles run publicly, button-driven, independent of adventure state. This ships the hardest subsystem first and gets real users early.

| Area | Deliverable |
|---|---|
| Catalog | DB catalog imported from a pinned Showdown version (species, moves with per-gen data, learnsets) with Showdown as the battle executor; DexEntry `speciesId` (renamed from `showdownName`); ItemDefinition (battle-relevant subset) |
| Formats | `ArenaFormat` (server-scoped: species pool from canon / optional region dex at launch, server library later, bans, rules); built-in canon formats (flat Lv50, Showdown standard clauses) so the Arena works on a fresh server; piecemeal `RegionRules` with the Classic Gen 1 preset for adventure |
| Teams | `TeamPreset` model (user-owned across servers, cap 50); Showdown paste import/export + random legal team at launch; guided builder can follow the launch; TeamValidator against the format |
| Battles | `BattleService` (start/choose/events/persist/recover); Discord renderer (public turn message + ephemeral choice prompts); timers (PvP 90s, default move on timeout, forfeit after 3); forfeits; spectating |
| Multi-user | Challenge → accept → battle on BattleService-driven shared surfaces (plain discord.js handlers with stable IDs). FlowCord stays single-user for the `/arena` hub. Moving them onto FlowCord multi-user sessions is a later option, not a dependency. See [25 § Multiplayer boundary](../architecture/concepts/25-arena.md#multiplayer-boundary-with-flowcord-decided-oct-2026-q34) (Q34) |
| AI | AI profiles `random`, `basic`, `smart` (`smart` can follow the launch; trainer item use is for adventure trainers); PvAI against random legal teams generated from the format, difficulty via AI profile; admin-authored AI team sets later |
| Ops | **Launch readiness:** hosting (no-overlap deploys), Atlas + backups, deploy pipeline, monitoring, staging, dependency security (the last step before going public). Battle persistence with leases, so restarts and deploys never duplicate a battle. Battle history. |

**Exit criteria:**
- Two users on a public test server can build teams by paste, challenge, battle to completion with spectators, and survive a bot restart mid-battle.
- PvAI works at two difficulty levels.

---

## Phase 2: MVP "Recreate Red/Blue/Yellow" (public release #2)

**Goal:** An admin can build a complete Kanto (Pallet → Champion) using only PokeSandbox tools, publish it, and players can play it start to finish.

### Region building (admin)
**Webapp-first, mobile-first (Q36, [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)):** every builder feature below is a webapp screen on the shared `libs/authoring` commands, designed for phones first. Discord keeps Region Health, publishing, and Open in builder links, and the existing Pokédex, progression, and location builders keep working until the webapp has parity with them, hidden in production behind a feature flag until they're ready for a full release.
- Region config: name, currency, rules preset, starting location, respawn default.
- Regional pokedex (exists) + TM/HM list + learnset policy.
- Locations: kinds, grouping, directional edges with conditions, services, two-way toggle.
- Progression definitions (exists) + `choice` kind. Engine-managed flags.
- Explore and encounters: method registry, conditioned tables, the explore outcome table (wild / trainer / hidden item), traversal requirements (one-time and permanent route costs). No day/night for Kanto.
- NPCs and Trainers: trainer classes, conditioned party variants (rival keyed off `starterChoice`), default movesets (last 4 level-up moves), trainer items, AI profiles, rewards, engagement modes, generated gauntlets for multiple `onEnter` trainers.
- **Scripts & Triggers** (one system): dialogue, choices, battles, effects, branches. Templates for Gym Leader, Starter/Pick-N Gift, Forced Encounter, Gift NPC, In-game Trade, Gauntlet (Elite 4), Simple Talker.
- Effects (primitive): items, money (never below 0), Pokémon gifts (PC + swap offer when the party is full), progression/milestone/choice/flag, heal, respawn.
- Transportation networks: Fly and Ferry templates.
- Shops: conditioned entries, buy/sell, entries priced in a numeric progression (e.g. Game Corner coins).
- **Publish:** review (validator results + release diff, warnings shown before confirming) → immutable release. Rule changes on a live region are reviewed like any content. Pause/undeploy is separate from discovery. Release notes are opt-in.
- **Webapp builder** on the authoring commands: list/detail editors for every feature, plus the script step editor, region map (canvas on wide screens), encounter table grid, trainer party editor, shared condition builder, and Region Health. The webapp moves off antd to Tailwind plus a headless component library.
- Region export/import (JSON bundle) → the official "Kanto Classic" template (generator script for bulk data, builder tools for story, repo bundle as the source of truth).

### Playing
- Character creation and journey start (one active journey per user per region; restart archives the old journey with a 24h cooldown), onboarding via a `journeyStarted` script, starter pick, rival setup.
- `/play` hub (the only player command; ephemeral): location view, travel (with locked-edge explanations), Fly/transport. One active session per journey, and a new one resumes wherever the journey is, mid-battle included.
- Explore: weighted outcomes (wild, trainer, hidden item) by method; traversal costs; Repel.
- Battles: fight, switch, **bag items, catch, run** (needs the patch set's external choice hook); trainer battles; rival; gyms; Elite 4 gauntlet; whiteout → respawn.
- EXP and level-ups applied mid-battle (authentic), move learning prompts, evolution after battle (level/stone) and after trades.
- Player trading within a region (propose, pick privately, both confirm) at Pokémon Centers, plus in-game NPC trades; trade evolutions; Gen 1 traded-Pokémon rules.
- Party (reorder, summary), PC boxes (deposit/withdraw/release, overflow), bag (pockets, use/give/take).
- Shops, money from battles, heal at centers.
- Profile: badges/milestones, visited locations, dex seen/caught. Webapp profile and character pages with privacy settings.
- Permanent adventure log (trainer battles with turn digests, catches, milestones), viewable on the webapp.

**Exit criteria:**
- The "Kanto Classic" template publishes with zero validator errors.
- A playtester completes Pallet → Champion.
- The engine test suite runs a scripted bot through the first two gyms headlessly.

---

## Phase 3: Full-Feature Build

| Theme | Items | Builds on |
|---|---|---|
| Flavor (fast follow after the MVP) | Every flavor event beyond trainer lines (which are MVP), builder tabs, layered packs, the per-region battle text setting; canon pack v1: Gen 1 battle flavor for moves and statuses. Each later generation ships with its flavor. | Passages, MVP event hooks ([29](../architecture/concepts/29-flavor-text-and-prose.md)) |
| Quests v2 | Active quests (scripts + quest log), passive objectives (event listeners), loaner Pokémon, quiz stages, repeatable quests, passive-slot limits, tutorial-as-quest | Script VM, engine events |
| Narrative | Persistent dialogue choices (choice kind is already MVP), quest-local choices as script locals; authored encounter intros (location and method scenes, species first sightings and lines, also in trainer battles) | Conditions, scripts, passages, `journey.dex.seen` ([10](../architecture/concepts/10-encounters.md#encounter-intros-decided-nov-2026-post-mvp-the-mvp-shows-the-default-line)) |
| Effects++ | Teleport to any authored location (MVP has only `teleport: respawn` for Escape Rope / Dig / Teleport), start-script, new attach points (transport hops, quest stages) | Effect registry |
| Custom content | Server content library (fakemon/forms/types/moves/items reusable across a server's regions) injected into isolated Showdown dexes; per-Pokédex-entry sprite overrides (custom art, another set, or text) and the region's missing-sprite policy | Catalog layering, isolated custom-data dexes |
| Social | In-game PvP with adventure parties; Wonder Trade; GTS-style listings; cross-region trades (player trading is MVP) | PokemonInstance collection, BattleService |
| Breeding | Contained service + server pool; eggs; hatching | `storage.kind` |
| Happiness | Friendship evolutions, move unlocks | PokemonInstance.friendship |
| Rematches | Trainer/gym rematch variants (VS Seeker / phone) | Conditioned parties, `timer` kind |
| Server events | Server-wide events, giveaways, event quests, plot-NPC chance encounters, forced-loss/survival battles | `ServerState`, `chance` predicate, battle win-conditions |
| Community boss | Shared HP pool raid | State injection hook + `ServerState`/`RegionState` |
| Living region | Region state players shape together: first-X NPCs and gifts, NPCs that remember, shared goals, story chapters, trainer ghosts | `RegionState`, region facts/effects ([24](../architecture/concepts/24-shared-state-region-and-server.md)) |
| Environment | Weather/terrain by location, swarms, visible-spawn UI | Encounter conditions |
| Staff ops | Grant items/Pokémon/money/TMs with audit log | Effect executor |
| Webapp | Battle replays, richer journey and log views, bulk editing | MVP webapp builder, adventure log, region bundles |
| Translation | `Translation` records and builder tools, other-locale message catalogs, localized canon names, translated battle text, Discord command localizations, player locale preference | Readiness built from the start: `sourceLocale`, stable item IDs, message keys, events carrying references ([30](../architecture/concepts/30-internationalization-readiness.md)) |
| Discord authoring parity | Discord editors for new authoring features where worth it (a script step-list editor for small edits, quick encounter tweaks); turn the `discord.authoring` flag on in production once ready; remove an existing Discord builder only once the webapp has parity with it | `libs/authoring` commands shared by both clients ([28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)) |
| Narration | Narration on adventure log entries by the owner, invited co-authors, and narration moderators; thread capture; AI drafts | Adventure log ([22](../architecture/concepts/22-adventure-log-and-narration.md)) |
| Arena + adventure | Arena battles with copies of adventure Pokémon (format level scaling, stat-investment overrides) | PokemonInstance in Showdown set shape |
| Systems | Shop purchase limits and restocking, timed script waits (`timer` kind), level scaling, configurable trade evolution without trading, regional forms for Gen 2+ regions, `/bag`/`/party` shortcuts | Reserved fields in shops and `RegionRules` |

## Phase 4: Pie in the Sky

| Item | Key prerequisite already in place |
|---|---|
| Co-op (raids, 2-player doubles, co-op story) | `participants[]` on mode records; Showdown multi battles; 4+ players needs fork surgery |
| Energy/pacing toggle | Action cost hook in `dispatch` |
| Cross-region / cross-server travel, carry-over between regions, event regions | Character (persona) separate from Journey (per region); original trainer = character; Pokémon move between journeys |
| Configurable narration effects (approved roleplay boosts friendship or encounter odds) | Script approval step + adventure log |
| Webapp as a full play surface | `libs/engine` |
| Minigames at locations | Script steps / custom step types |
| Custom moves/abilities/items via strict templates | Inherit an existing move's mechanics + overrides, loaded like dex data (Q28) |
| RP quests + pluggable adjudication (mod queue / AI judge; participant vs approver roles) | Script `await: approval` step |
| AI enrichments (BYO key): narrative responses, battle commentary, NPC personalities, bonding sessions | Event renderers + optional narrator decorator |

---

## Cross-cutting tracks (run alongside every phase)
- **Docs & onboarding:** admin guides per builder screen, template walkthroughs, player help.
- **Quality:** engine unit tests per predicate/effect/step; validator tests; Showdown patch tests; e2e smoke on a test guild.
- **Observability:** structured logs keyed by `journeyId`/`battleId`/`actionId`; error reporting; basic metrics (active players, battles/hour).
- **Community:** alpha server, feedback channels, release notes generated from region and bot releases.
