# MVP Roadmap: Pre-MVP Arena → "Recreate Red/Blue/Yellow"

This doc breaks Phases 0–2 of [`roadmap.md`](roadmap.md) into **GitHub milestones → epics → candidate issues**, plus a gap matrix against the owner's MVP feature list. Issue titles are written so they can be pasted directly into issues. Sizes: S (≤1 day), M (2–4 days), L (1–2 weeks), XL (split further).

> Sequencing follows the decisions in [`../architecture/open-questions.md`](../architecture/open-questions.md). Epics name the Q-numbers they implement.

## Milestones at a glance

| # | Milestone | Outcome | Depends on |
|---|---|---|---|
| M0a | **Platform Hygiene** | Org/CI, agent rules, `libs/core` + boundaries, persistence basics, species IDs | — |
| M0c | **Arena Foundations** | `libs/battle` interfaces, `Clock`/`Rng`, the fork cleaned up, rebased, and packaged | `libs/core` ([M0A-09](https://github.com/pokesandbox/pokesandbox/issues/113)) only |
| M0b | **Engine & Content Foundations** | Engine skeleton (`libs/engine`, `dispatch`), conditions/effects/gates, content keys + model cleanup, authoring layer, releases | M0a, M0c's battle interfaces |
| M1 | **Battle Core & Catalog** | BattleService, moves/learnsets catalog, teams and formats, AI (the sim patches moved to the checkpoints) | M0c |
| M2 | **Arena Release (Pre-MVP)** 🚀 | Public PvP/PvAI in Discord; hosting & operations (launch readiness) | M1 |
| CP0a | **Pallet Town: talk & walk** | New journey, Oak's intro, starter, rival's name, Pallet ↔ Route 1 ↔ Viridian, published from the generated bundle | M0b |
| CP0b | **Pallet Town: first battle** | The rival battle in Oak's lab: adventure battles in `/play`, trainer lines, EXP and level-ups | CP0a, M1 BattleService |
| CP0c | **Pallet Town: into the grass** | Route 1 wild battles, Oak's Parcel, Pokédex and Poké Balls, catching, bag, mart, Pokémon Center, whiteout | CP0b |
| CP1 | **Boulder Badge** | Viridian Forest, Brock, Route 22 rival; the webapp builder (private) authoring its first stretch | CP0c, the headless UI trial |
| CP2 | **Cascade Badge** | Mt. Moon, Cerulean, Nugget Bridge, Misty; player trading and Gen 1 obedience | CP1 |
| CP3 | **Thunder Badge** | S.S. Anne, Cut, Lt. Surge; ferries, fishing | CP2 |
| CP4 | **Rainbow Badge** 🧪 | Rock Tunnel, Lavender, Celadon, Game Corner, Erika. **Public playtest #1** on the PokeSandbox server | CP3 |
| CP5 | **Soul & Marsh (6 badges)** | Pokémon Tower, Snorlax, Fuchsia, Silph Co., Saffron; Fly | CP4 |
| CP6 | **Volcano & Earth (8 badges)** | Surf, Seafoam, Cinnabar, Power Plant, Giovanni | CP5 |
| CP7 | **Champion** 🧪 | Victory Road, Elite Four, Champion. **Public playtest #2** on the PokeSandbox server | CP6 |
| CP8 | **Mewtwo** | Cerulean Cave and Mewtwo: Kanto Classic complete | CP7 |
| MVP | **MVP Release** 🚀 | Webapp public, trust and safety, load test, guides, discovery | CP8 |

```
M0a (libs/core) ──► M0c ──► M1 ──► M2 🚀 (Arena, bot only)
      └──────────► M0b ──► CP0a ► CP0b ► CP0c ► CP1 ► … ► CP7 ► CP8 ► MVP 🚀
                                (M1's BattleService feeds CP0b)
```

The Arena track (M0c → M1 → M2) needs only `libs/core` from M0a; the rest of M0a is hygiene that runs alongside. The content track (M0b → CP0a → …) runs in parallel.

> **The MVP is built as playable Kanto checkpoints (decided Nov 2026):** CP0a–CP0c (Pallet Town), then badge by badge to CP7 (Champion) and CP8 (Mewtwo), then the MVP Release. Each checkpoint is a published release of Kanto Classic with a headless playthrough test, and each pulls in the systems its stretch first needs. They replace the old system milestones M3 (Region Authoring), M4 (Interaction Engine), M5 (Adventure Core), and M6 (Kanto Classic & MVP Release); how a checkpoint works is in [`mvp-checkpoints.md`](mvp-checkpoints.md). Draft IDs like `M3-01` keep their names; only their milestone changed.

### Re-sequencing: Arena critical path (decided Oct 2026, after Q29)
With ~1 senior full-time-ish, possibly a second senior, 2 junior-to-mid devs, and every PR reviewed by the owner, M0 as written is too big to sit in front of the Arena. **The Arena doesn't need most of M0.** It needs no conditions/effects, scripts, content keys, releases, or authoring layer. Decision: split M0 into M0a and M0b, as in the table above. **Refined (Oct 2026):** M0a became shared hygiene only, Arena-specific foundations moved to a new **M0c** (so an Arena contributor isn't queued behind hygiene), and the adventure engine skeleton moved into M0b.
- The Arena track (M0c → M1 → M2) and the content track (M0b → CP0a…) can run in parallel. Seniors own the foundation-heavy work (engine, fork rebase/patches, BattleService, conditions/effects). Juniors take well-specified issues: catalog seed data, item definitions, renderers, builder menus, webapp editors, tests.
- **Timeline honesty:** an end-of-year Arena (~9 weeks from late Oct) would need `libs/core`, M0c, M1, and M2 done with this team while also standing up hosting/CI. That's possible only if the Arena scope stays tight: paste import, built-in formats, `basic` AI, timers, restart recovery. Hosting and operations sit at the end of M2 (launch readiness), not in front of development. Plan for **end of year as a stretch, Q1 as realistic**, and re-estimate once M0a's and M0c's issues are sized.

---

## Gap matrix (owner's MVP list → status → milestone)

Legend: ✅ exists · 🟡 partial · ❌ missing

### Pre-MVP Arena
| Feature | Status | Milestone |
|---|---|---|
| Build teams for server-scoped Arena formats | ❌ | M1 |
| Showdown battles between two members, button-driven | ❌ | M1/M2 |
| Public channel battles / spectating | ❌ | M2 |
| Player vs AI (pick AI team or random by tier) | ❌ | M2 |

### Region building (admin)
| Feature | Status | Milestone | Notes |
|---|---|---|---|
| Create/configure region: name | ✅ | — | |
| Currency, starters, starting location | 🟡 (`currencyType` only) | CP0a/CP1 | Starter = pick-1 gift script |
| Regional pokedex | ✅ | — | Switch refs to species IDs (M0a) |
| Locations: create | ✅ | — | |
| Locations: connect (directional) / gate | 🟡 (schema only, builder "coming soon") | CP0a (engine), CP1 (builder) | Conditions replace requirements |
| Wild encounter tables | 🟡 (schema only) | CP0c (engine), CP1 (builder) | Method registry, conditions |
| Trainers/NPCs (dialogue, rewards, placement, gym-leader tier) | ❌ | CP0a–CP1 | |
| NPC party variants by progression | ❌ | CP0b | Conditioned parties |
| Conditional triggers (forced dialogue/battles/effects, once/repeatable) | ❌ | CP0a–CP1 | Script system |
| Effects primitive | ❌ | M0b | |
| Pick-1 gift rewards | ❌ | CP0a | Script template |
| Battle gauntlets (Elite 4) | ❌ | CP2, CP7 | Script template |
| Transportation networks (Fly, ferry…) | ❌ (`transportationTypes: string[]`) | CP3, CP5 | |
| Shops | ❌ | CP0c, CP4 | |
| TM/HM list | ❌ | CP1 | |
| Progression definitions (milestone/numeric/boolean) | ✅ | — | |
| Progression `choice` kind | ❌ | M0b | |
| Deploy/undeploy with playability validation | 🟡 (toggle only, `deployable` never computed) | M0b, CP1 | Publish → release |

### Playing
| Feature | Status | Milestone |
|---|---|---|
| Create character + start journey (1 active journey per user per region), onboarding, starter, rival setup | ❌ | CP0a |
| Travel graph with gating; map/current location | ❌ | CP0a |
| Fly / transport | ❌ | CP3, CP5 |
| Wild encounters (random, fishing, time) | ❌ | CP0c, CP3 |
| Battles: fight/switch | ❌ | M1, CP0b |
| Battles: run, bag items, catch | ❌ | CP0c |
| Trainer battles, rival, gyms, Elite 4 | ❌ | CP0b–CP7 |
| EXP, level-ups, moves, evolution | ❌ | CP0b–CP2 |
| Party management, summaries | ❌ | CP0a, CP2 |
| Trading between players (same region) | ❌ | CP2 |
| PC boxes | ❌ | CP2 |
| Inventory/bag | ❌ | CP0c |
| Shops buy/sell; money from battles | ❌ | CP0b, CP0c |
| Heal at centers; respawn on whiteout | ❌ | CP0c |
| Profile/character view | ❌ | CP0c (Discord), MVP Release (webapp) |
| Progression tracking (badges, visited) | ❌ | CP1 |

---

## M0a: Platform Hygiene

> Issues: [M0a milestone](https://github.com/pokesandbox/pokesandbox/milestone/1)

**Epic: Org & Delivery Setup**
- [ ] Move `pokesandbox` and `pokemon-showdown` (name unchanged) to the org; update README links, CODEOWNERS, agents.md (S)
- [ ] CI: lint + typecheck + unit tests on PR (M)
- [ ] Create labels (incl. `agent-ready`), issue types, milestones, and project board per [`github-project-setup.md`](github-project-setup.md) (S)
- [ ] Owner review: deep-dive concepts 09–30 and record any changed decisions ([M0A-24](https://github.com/pokesandbox/pokesandbox/issues/105)) (L)
- [ ] Feature flag registry: env override (`FEATURE_FLAGS=*` in dev), per-server override, per-environment defaults; `discord.authoring` off in prod ([M0A-21](https://github.com/pokesandbox/pokesandbox/issues/109)) (S)
- [ ] Fix the critical Dependabot alerts now (Next.js, NextAuth, transitive runtime packages; Nx tooling upgrade in its own PR); high and below stay in [M2-14](https://github.com/pokesandbox/pokesandbox/issues/187) ([M0A-22](https://github.com/pokesandbox/pokesandbox/issues/110)) (M)
- [ ] Deprecate custom command prefixes: remove the `/server` Prefix option, its commands, the message-command pipeline, and `Server.prefixes` ([M0A-25](https://github.com/pokesandbox/pokesandbox/issues/106)) (S)
- [ ] Switch slash commands to global registration; flag-off commands only as guild commands on override servers ([M0A-07](https://github.com/pokesandbox/pokesandbox/issues/108)) (M)

**Epic: Shared Library Foundations**
- [ ] Structured logging port; debug events out of Mongo (S)
- [ ] Scaffold `libs/core` (shared schemas, registries home) (S)
- [ ] Message catalog + `t()` (ICU MessageFormat, English only) for all player-facing system text; no sentence concatenation ([M0A-23](https://github.com/pokesandbox/pokesandbox/issues/115)) (S)
- [ ] Nx module-boundary tags + lint rule enforcing core/engine/battle/authoring layering (webapp must not import battle); each later library adds its tag (S)

## M0c: Arena Foundations

> Issues: [M0c milestone](https://github.com/pokesandbox/pokesandbox/milestone/2)

**Epic: Battle Library Scaffold**
- [ ] Scaffold `libs/battle`; `BattlePort`/`ExternalActionResolver` interface types in `libs/core` ports (S)
- [ ] `Clock`, `Scheduler`, and seeded `Rng` ports in `libs/core` (S)

**Epic: Showdown Fork Clean-up & Packaging** (Q20, decided)
- [ ] Preserve the 10 custom moves on an archive branch. Remove them from `master` and restore the 3 commented-out upstream tests (S)
- [ ] Rebase onto current upstream (fallback: fresh from upstream + re-apply kept changes as new commits) (M)
- [ ] Remove debug code (`pause`/`resume`/`sendToJSON`) (S)
- [ ] Publish as a versioned package consumed by the monorepo (then re-point the catalog imports [M1-02](https://github.com/pokesandbox/pokesandbox/issues/158)/[M1-03](https://github.com/pokesandbox/pokesandbox/issues/159) at it and re-run). Set up the monthly upstream-sync PR. The repo keeps the name `pokemon-showdown` (M)

**Epic: Persistence & Data Basics**
- [ ] docker-compose Mongo as a replica set (transactions) for local dev (S)
- [ ] Cache policy: stop caching hydrated mutable docs. Use atomic `$set` for admin edits (M)
- [ ] Indexes and unique constraints across models (S)
- [ ] Reference species/items by Showdown ID. Rename DexEntry `showdownName` → `speciesId`. Fix the 3 broken Gen 2 shiny sprite links (M)

## M0b: Engine & Content Foundations

> Issues: [M0b milestone](https://github.com/pokesandbox/pokesandbox/milestone/3)

**Epic: Engine Skeleton** (Q18)
- [ ] Scaffold `libs/engine` (pure TS, no discord.js) with repository and ContentProvider interfaces (M)
- [ ] `dispatch(journeyId, action)` with per-journey lock, revisions, action preconditions, session claims, action/event types, and error model (L)
- [ ] In-memory test harness (M)

**Epic: Conditions & Effects** (Q17)
- [ ] Condition tree (`all/any/not`) + fact/operator registry (evaluate/explain/validate/references) + scoped evaluation context (M)
- [ ] MVP facts: `milestone.has`, `milestone.count`, `choice.value`, `flag`, `bag.count`, `visited` (incl. `$target`), `party.knowsMove`, `party.hasSpecies`, `dex.caughtCount`, `progression.value`, `location.cleared`, `location.visit.*`, `location.trainersDefeated` (L)
- [ ] Gate envelope (`presentation`, `latch`, `cost`) + `checkGate` + `gateBlocked` event (M)
- [ ] Effect union + registry + atomic executor with idempotency (L)
- [ ] MVP effects: currency, item, progression, milestone (grant/revoke), choice, flag, setRespawn, `teleport: respawn` (Escape Rope / Dig / Teleport), random (L). `givePokemon` (PC + swap offer) and `heal` land in CP0a with `PokemonInstance`.

**Epic: Model Cleanup & Identity** (Q19, Q21)
- [ ] ContentKey type + generator. Add `key` to Location with `{ regionId, key }` unique index (S)
- [ ] Remove `Region.locations/characterList/shops/quests/transportationTypes`, `Server.playerList`, `User.servers`. Add `Region.serverId` (M)
- [ ] Progression `choice` kind (+ builder) (M)
- [ ] Flag conventions (reserved prefixes) (S)
- [ ] Inbound-edge cleanup and "used by" guard on deletes (M)

**Epic: Authoring Layer & Releases** (Q15, Q18)
- [ ] Scaffold `libs/authoring` (`execute(actor, command)`, per-entity OCC, role checks, `ContentChange` + `suggestions` output) (M)
- [ ] Migrate existing admin menus (pokedex, progression, locations) onto `libs/authoring` commands; they keep working until the webapp has parity with them, hidden in production behind the `discord.authoring` flag (Q36) (M)
- [ ] `RegionRelease` model + publish/compile + `ContentProvider` + deployment status (draft/live/paused) separate from discovery (L)

## M1: Battle Core & Catalog

**Adventure-only items moved to the checkpoints (Nov 2026).** M1 holds what the Arena needs plus the moves and learnsets catalog. The sim patches, `ItemDefinition`, `RegionRules`, and the Gen 1 formulas moved to the checkpoint that first needs them (CP0a–CP2). The **isolated custom-data dexes** (and assembling mixed-generation data into them) moved **past the MVP**: Kanto Classic is pure Gen 1, so Showdown's own `gen1` mod covers it, and the MVP ships only the Classic Gen 1 preset. They return with custom content, mixed-generation rules, and library-based Arena formats ([27](../architecture/concepts/27-server-content-library-and-overrides.md)).

**Epic: Catalog**
- [ ] Canon catalog import from Showdown (pinned version): SpeciesDefinition, MoveDefinition (per-gen data via the resolved Dex, behavior `hooks`, text), Learnset (per-gen sources) into Mongo; re-runnable with diff on upgrades (L). Moves and learnsets: [E-M1-2](https://github.com/pokesandbox/pokesandbox/issues/156)
- [ ] Catalog read service + move detail display (M)

**Epic: Teams** ([E-M1-4](https://github.com/pokesandbox/pokesandbox/issues/168))
- [ ] `PokemonSet` shared type and `TeamPreset` model ([M1-11](https://github.com/pokesandbox/pokesandbox/issues/169)) (S)
- [ ] `ArenaFormat` model (server-scoped) + built-in canon formats → Showdown custom format + TeamValidator ([M1-12](https://github.com/pokesandbox/pokesandbox/issues/170)) (M)
- [ ] Showdown paste import/export ([M1-13](https://github.com/pokesandbox/pokesandbox/issues/171)) (M)
- [ ] Guided team builder (Components v2 + FlowCord submenu/pagination flows; reuse the Pokédex builder's Pokémon search flow; autocomplete for moves). Can follow the Arena launch (L)
- [ ] Random legal team for a format + per-Pokémon validation error messages ([M1-14](https://github.com/pokesandbox/pokesandbox/issues/172)) (M)

**Epic: BattleService** ([E-M1-3](https://github.com/pokesandbox/pokesandbox/issues/161))
- [ ] BattleService start/choose/events API, in-process ([M1-05](https://github.com/pokesandbox/pokesandbox/issues/162)) (L)
- [ ] Battle persistence (seed + input log, `guildId`), battle leases (`ownerInstance` + heartbeat) and `ownsGuild` ownership, recovery on boot of owned unleased battles only (test: two overlapping processes run each battle once), compressed retention (7-day support window for adventure battles; Arena per replay policy) ([M1-06](https://github.com/pokesandbox/pokesandbox/issues/163), [M1-07](https://github.com/pokesandbox/pokesandbox/issues/164)) (M)
- [ ] Protocol → GameEvent translation; battle text from Showdown's text data, not hand-written strings ([M1-09](https://github.com/pokesandbox/pokesandbox/issues/166)) (M)
- [ ] Discord battle view builders (pure `BattleView` → Components v2: turn messages, both actives with level/HP/status, the two sprites as separate images, choice prompts; a composed side-by-side image is post-MVP). The Arena wiring is in M2 [E-M2-2](https://github.com/pokesandbox/pokesandbox/issues/190) ([M1-10](https://github.com/pokesandbox/pokesandbox/issues/167)) (M)
- [ ] Turn timers and timeout policy in BattleService: persisted per-side deadlines, `default` choice on timeout, forfeit after 3 consecutive, fresh window on recovery, `choose` with `rqid` + per-battle queue ([M1-08](https://github.com/pokesandbox/pokesandbox/issues/165)) (M). Contract in [25 § Ownership](../architecture/concepts/25-arena.md#ownership)

**Epic: AI Players** ([E-M1-5](https://github.com/pokesandbox/pokesandbox/issues/173))
- [ ] AI player interface + `random` profile ([M1-15](https://github.com/pokesandbox/pokesandbox/issues/174)) (S)
- [ ] `basic` profile using `@smogon/calc` ([M1-16](https://github.com/pokesandbox/pokesandbox/issues/175)) (M), plus trainer item use (heal at low HP, cure status) shared by all non-random profiles, needing the external choice hook and not needed for the Arena ([M1-17](https://github.com/pokesandbox/pokesandbox/issues/176)) (S)
- [ ] `smart` profile (switching, status, items); the Arena can launch without it ([M1-18](https://github.com/pokesandbox/pokesandbox/issues/177)) (L)

## M2: Arena Release 🚀

> **FlowCord is no longer on the critical path (decided Oct 2026, Q34).** FlowCord menus are single-person actionable. BattleService owns rounds and timers. The Arena's shared surfaces (challenges, public battle message, participant checks, private prompts) are plain discord.js handlers behind a `BattleSurface` port ([E-M2-2](https://github.com/pokesandbox/pokesandbox/issues/190)), and FlowCord runs the single-user `/arena` hub. The FlowCord issues that would help (flowcord#105–#107) are listed in [E-M2-2 § Background](https://github.com/pokesandbox/pokesandbox/issues/190). See [25 § Multiplayer boundary](../architecture/concepts/25-arena.md#multiplayer-boundary-with-flowcord-decided-oct-2026-q34).

**Epic: Launch Readiness: Hosting & Operations** (Q30, see [21](../architecture/concepts/21-hosting-and-environments.md); [E-M2-1](https://github.com/pokesandbox/pokesandbox/issues/179))
Scheduled last on the Arena track. Development runs locally until then.
- [ ] Choose and set up a managed app host (or the offered family host): always-on bot service, env secrets; able to add a webapp service later (M)
- [ ] Atlas: prod database on the free cluster, separate staging/dev databases, IP allowlist, least-privilege users (S)
- [ ] Nightly `mongodump` backups to object storage with retention + a tested restore (M)
- [ ] GitHub Actions deploy: version tag → prod; `master` → staging (staging added before the Arena goes public) (M)
- [ ] Error monitoring (Sentry) + bot heartbeat (S)
- [ ] Dependency security: clear the remaining Dependabot alerts (high fixed or justified, moderate/low triaged; critical already done in [M0A-22](https://github.com/pokesandbox/pokesandbox/issues/110)), enable Dependabot updates, CI audit gate ([M2-14](https://github.com/pokesandbox/pokesandbox/issues/187)) (M)

- [ ] Challenge/accept/decline: direct + open challenges, atomic claim, 5-min expiry ([M2-09](https://github.com/pokesandbox/pokesandbox/issues/192)) (M)
- [ ] Arena interaction router with stable custom IDs ([M2-08](https://github.com/pokesandbox/pokesandbox/issues/191)) + private choice prompts ([M2-11](https://github.com/pokesandbox/pokesandbox/issues/194)) (M)
- [ ] `/arena` hub: teams, challenge member, battle AI (M)
- [ ] Public battle message projector + spectating, re-attached after restart ([M2-10](https://github.com/pokesandbox/pokesandbox/issues/193)) (M)
- [ ] Arena scenario tests + restart drill ([M2-12](https://github.com/pokesandbox/pokesandbox/issues/195)) (S)
- [ ] PvAI: random legal team generated from the format, difficulty by AI profile (M)
- [ ] Battle history list (per user) (S)
- [ ] Alpha test on the community server; feedback triage (M)
- [ ] Release notes + admin/player docs (S)
- [ ] Discord verification readiness: no privileged intents (prefix commands removed in [M0A-25](https://github.com/pokesandbox/pokesandbox/issues/106)), privacy policy and terms published, verification application at 75 servers ([M2-15](https://github.com/pokesandbox/pokesandbox/issues/188)) (M)
- [ ] `/account delete` for Arena data ([M2-16](https://github.com/pokesandbox/pokesandbox/issues/189)) (M)

## The Kanto checkpoints (CP0a–CP8)
> **Authoring is webapp-first and mobile-first (decided Oct 2026, Q36, [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)).** Builder items are webapp screens on `libs/authoring` commands. Discord keeps Region Health, publishing, and Open in builder links; the existing Pokédex, progression, and location builders keep working until the webapp has parity with them, hidden in production behind the `discord.authoring` flag (on in dev).

**Every checkpoint's exit criteria** ([`mvp-checkpoints.md`](mvp-checkpoints.md#how-a-checkpoint-works)): a published Kanto Classic release that plays from a new journey to the checkpoint's end; a headless playthrough test to that point in CI; a human playtest of the new stretch, with friction filed as issues; the stretch's content in the repo bundle; and (from CP1) every builder screen that stretch's content needs. Each checkpoint also adds its stretch of **generated data** (locations, encounters, trainers and lines, marts, TMs) and **authored story** (scripts, gates).

**Kanto Classic adaptations (decided Oct 2026).** These keep MVP scope down without special mechanics:
- **No Safari Zone in MVP** (bait/rock/ball mechanics deferred). Its key rewards come another way, e.g. a Fuchsia NPC gift script gives HM03 Surf, and the Warden gives HM04 Strength directly or via a simpler fetch.
- **No unidentifiable-ghost mechanic.** Pokémon Tower's upper floors are gated on `bag.count silph-scope ≥ 1` (presentation `attemptable`, with a "the ghosts block your way" script). The rival battle stays reachable *outside* that gate (lobby/first floor), so story order matches RBY. The Marowak ghost is a scripted `wildBattle` behind the gate.

## CP0a: Pallet Town, talk & walk
- [ ] Generator script, first stretch: bulk Kanto data → region bundle; extended stretch by stretch at every checkpoint (L)
- [ ] Region bundle export/import (JSON), deterministic and lossless; canonical bundle in repo (`templates/kanto-classic/`); CI validation; deploy-time install (M)
- [ ] Headless playthrough harness: scripted journeys run against the bundle in CI (each checkpoint adds its path) (M)
- [ ] Piecemeal `RegionRules` model with compatibility validation and the "Classic Gen 1" preset (data dimensions now; formulas arrive with the checkpoints that use them); switch [M1-04](https://github.com/pokesandbox/pokesandbox/issues/160) and [M3-03](https://github.com/pokesandbox/pokesandbox/issues/199) from their "default Gen 1" to the region's rules (M)
- [ ] Journey + PokemonInstance models (with reserved `tags`, Q37), OCC, transactions; engine events (evolution, level-up, catch, travel, heal) carry the Pokémon's identity for later flavor (M)
- [ ] Character creation (with an `idNo`; the character is the original trainer of Pokémon it obtains) + journey start (1 active journey per user per region) + name slots (`Journey.names`; Kanto Classic names the rival) + restart (archive, 24h cooldown) + admin reset + onboarding trigger + release-version migration rules (M)
- [ ] Script + Trigger models (M)
- [ ] Script VM, core steps: `passage` (prose, dialogue lines, images; `say` as shorthand), `choice`, `if`, `effects`, `askName`, `heal`, `travel`, `goto/label/end`, `{name:<slot>}` placeholders (L)
- [ ] Mode machine + persisted script cursor + resume on input (M)
- [ ] Trigger dispatch: journeyStarted (payload: `newCharacter`, `carriedPokemon`), enterLocation (optional `from`/`via` filters; any arrival counts), interact; once/priority/forced (M)
- [ ] NPC model (placements with single/everywhere presence and per-placement interact, trainer, engagement) (M)
- [ ] `givePokemon` effect (PC + swap offer) and the Starter/Pick-N Gift and Simple Talker templates (M)
- [ ] Passage renderer: Components v2, `dialogue` and `prose` styles, markdown, auto-paging by text/component budget, choices on the last page (M)
- [ ] `/play` hub renderer (mode-aware): claims the session (newest wins), resumes any mode incl. mid-battle requests and pending prompts, and shuts down superseded sessions cleanly (L)
- [ ] Travel action (conditions, locked explanations, enter triggers, `visited:<key>` flags) (M)
- [ ] Party view/summary (S)
- [ ] `adventure.play` feature flag: adventure play only on servers with the override (the PokeSandbox server) until the MVP Release (S)

## CP0b: Pallet Town, first battle
- [ ] Fork patch: generalized state injection (any side; HP/status/PP/fainted state; level/stats/move slots mid-battle for authentic level-ups), every injection recorded in the input log so recovery replays it, with sim tests (M)
- [ ] Adventure battles in `/play`: BattleService `trainer` kind, the await-in-action pattern, the [M1-10](https://github.com/pokesandbox/pokesandbox/issues/167) battle view, resume after restart (M)
- [ ] Script VM `battle` step (`canLose`, `onWin`/`onLose`; the first rival battle can be lost without a whiteout) (S)
- [ ] TrainerClass registry (canon seed) + Trainer with conditioned party variants (the rival's team by starter) (M)
- [ ] Trainer intro and defeat lines: minimal flavor slice (`FlavorEntry` in the region layer, resolver for `battle.trainerIntro` / `battle.trainerDefeat` matching trainer → class → default) ([29](../architecture/concepts/29-flavor-text-and-prose.md#mvp-scope)) (M)
- [ ] Trainer battles: party variant selection, AI profile, payout, defeat flags (M)
- [ ] Gen 1 EXP and payout formulas, DVs/Stat Exp, the four growth curves (floored, level 1 clamped: intended behavior, no glitches), with pret/pokered test vectors ([18](../architecture/concepts/18-rules-time-and-randomness.md#reference-test-vectors)) (M)
- [ ] EXP and level-ups mid-battle (state injection), in-battle move-learn prompts (M)

## CP0c: Pallet Town, into the grass
- [ ] Fork patch: external choice hook (bag/catch/run consume the turn) + `caught`/`ran` end reasons (L)
- [ ] ItemDefinition model + Gen 1 item seed (pockets, prices, field/battle handlers) (L)
- [ ] Gen 1 catch and escape formulas, with test vectors (S)
- [ ] Encounter method registry + conditioned encounter tables (engine side; the builder screen is CP1) (M)
- [ ] Explore action: the weighted outcome table with `wild` outcomes (trainer and item outcomes arrive in CP1) (S)
- [ ] Wild battles: catch, run odds, bag in battle (via the hook), Script VM `wildBattle` step; the default intro line, with the encounter start event carrying `firstSighting` and a resolved `intro` reference so authored intros can be added later ([10](../architecture/concepts/10-encounters.md#encounter-intros-decided-nov-2026-post-mvp-the-mvp-shows-the-default-line)) (L)
- [ ] Bag: pockets, use outside battle, key items (Oak's Parcel) (M)
- [ ] Shops: buy/sell (the Viridian Mart), Script VM `shop` step; money never below 0 (S)
- [ ] Heal points (restore HP, status, and PP) + respawn + whiteout (S)
- [ ] Pokédex seen/caught on the profile (S)

## CP1: Boulder Badge
**Epic: Webapp Builder (Q24, Q36)** ([E-M3-2](https://github.com/pokesandbox/pokesandbox/issues/201))
- [ ] **First, before any webapp authoring work (can start any time):** headless library trial, React Aria vs Base UI under shadcn/ui; the owner picks ([M3-05](https://github.com/pokesandbox/pokesandbox/issues/202)) (S)
- [ ] Move off antd onto Tailwind + the chosen library, remove antd and `@ant-design/*`, Tailwind 4 if the chosen library expects it ([M3-07](https://github.com/pokesandbox/pokesandbox/issues/203)) (M)
- [ ] Webapp builder shell, mobile-first: Discord-role-checked access to a region's draft, list/detail layout, entity-level conflict handling, Playwright tests at phone width; blocked by [M3-05](https://github.com/pokesandbox/pokesandbox/issues/202) and [M3-07](https://github.com/pokesandbox/pokesandbox/issues/203) ([M3-06](https://github.com/pokesandbox/pokesandbox/issues/204)) (M)
- [ ] Shared builder components: search combobox (species/moves/items), sortable list, confirm dialog, passage editor with Discord preview (M)
- [ ] Open in builder links from `/region` (plain URLs, Discord OAuth sign-in) (S)
- [ ] Shared condition builder component (flat "all of" + one nesting level + templates) (L)
- [ ] Region config screen: currency object, starting location, respawn, rules preset (M)
- [ ] Location screens: kinds, grouping (`parentKey`), description and conditioned `descriptionVariants` as `Passage`s (Q37), services, tags; connections with the two-way toggle and labels; list/detail region map (L)
- [ ] Encounter table grid (M)
- [ ] Trainer party editor with conditioned variants (unset moves default to the last 4 level-up moves from the region's learnsets) and the "Lines" tab (M)
- [ ] Validator Tier 1 + basic Tier 2 + Region Health (webapp view, plus a `/region` summary in Discord) (L)

**Epic: Webapp Hosting (private)** (deferred from M2, decided Nov 2026: the Arena release is bot-only). Lands before CP1's stretch is authored on the PokeSandbox server; staff and testers only until the MVP Release.
- [ ] Webapp Dockerfile and compose profile (S)
- [ ] Webapp service on the host, domain with TLS, Discord OAuth redirect URIs, secrets (M)
- [ ] Webapp in the deploy pipeline and staging; Sentry and an uptime check (S)

**Adventure**
- [ ] Explore outcomes `trainer` and `item`, trainer engagement (`onTalk`, `onExplore`, `onEnter`), hidden items (M)
- [ ] Trigger events `battleEnd` and `explore` (S)
- [ ] Traversal requirements: location progress counters (lifetime/visit), one-time + permanent costs, compiled exit gates with explanations (M)
- [ ] Templates: Gym Leader, Forced Encounter (the Route 22 rival), Gift NPC (M)
- [ ] TM/HM lists ([E-M3-1](https://github.com/pokesandbox/pokesandbox/issues/196)) and teaching a TM from the bag (M)
- [ ] Post-battle level evolution (S)
- [ ] AI trainer item use ([M1-17](https://github.com/pokesandbox/pokesandbox/issues/176)) (S)
- [ ] Profile: badge case, milestones, visited (M)
- [ ] Adventure log: engine-written entries (trainer battles with turn digests, catches, trades, releases, wild rollups, milestones, evolutions, scenes; Pokémon stored as snapshots so entries survive the 30-day release purge); ephemeral opponent Pokémon from recipes. The webapp log view arrives with the MVP Release (M)

## CP2: Cascade Badge
- [ ] Script step editor (webapp) (L)
- [ ] Templates: Gauntlet (Nugget Bridge), In-game Trade; Script VM `npcTrade` step (M)
- [ ] Stone evolution, Repel (safe steps), Escape Rope / Dig / Teleport via `teleport: respawn` (M)
- [ ] PC boxes: deposit/withdraw/release, overflow, access per `RegionRules.systems.storage.access`; party reorder; full party → PC + "Swap into party?" offer for gifts and catches (M)
- [ ] **Trading** (Q35): `Trade` record + shared trade message + private Pokémon pickers (reusing the M2 Arena surface patterns), confirm-reset on offer change, expiry (M)
- [ ] Two-journey engine action: ordered leases, re-checks, owner swap in one transaction, both revisions and Pokédexes updated; `trading.access` precondition; per-user rate limit (M)
- [ ] Post-trade evolution (Kadabra, Machoke, Graveler, Haunter); Gen 1 traded-Pokémon EXP bonus (S)
- [ ] Fork patch: Gen 1 obedience as an additive custom rule (`onBeforeMove`, cap on `pokemon.m` set via state injection, pret/pokered `CheckForDisobedience` behavior and test vectors). First, a sim test proving a format rule's `onBeforeMove` fires; if not, find the narrowest hook before touching sim core ([14](../architecture/concepts/14-battle-system-and-showdown.md#fork-strategy-options)) (M)
- [ ] Engine side of obedience: each traded Pokémon's cap from badges and `RegionRules.obedience`, passed in the `BattleSpec` (S)

## CP3: Thunder Badge
- [ ] Transport networks + the Ferry template + the transport builder screen (M)
- [ ] Transport action: destinations grouped by area, fares shown, unaffordable options locked with the reason (S)
- [ ] Fishing methods (Old/Good/Super Rod) in the encounter method registry (S)
- [ ] Key-item and field-move gates (S.S. Ticket, Cut) through conditions, with locked explanations (S)

## CP4: Rainbow Badge 🧪 (public playtest #1)
- [ ] Shops with conditioned entries and progression-priced entries (Game Corner coins) + the shop builder screen (M)
- [ ] Release chunking for large regions + rollback hooks (publish core lands in M0b) (M)
- [ ] Extend `/account delete` to adventure data ([M6-02](https://github.com/pokesandbox/pokesandbox/issues/207)), before community members start playing (M)
- [ ] Public playtest on the PokeSandbox server: `adventure.play` stays limited to that server; feedback triage (M)

## CP5: Soul & Marsh (6 badges)
- [ ] Fly network (template, HM02), Fly destination lists grouped and paginated (S)
- [ ] Region map canvas for wide screens (directional/two-way edges, grouping, gate badges) (L)
- [ ] Scripted static encounters (Snorlax), Card Key gates, gifts with a full party (Lapras) (S)

## CP6: Volcano & Earth (8 badges)
- [ ] Surf (method and gate), Strength gates (simplified), the fossil revival script (S)

## CP7: Champion 🧪 (public playtest #2)
- [ ] Gauntlet `resetOnLoss` and `lockedUntilComplete`; Hall of Fame milestone and log entry (S)
- [ ] `smart` AI profile for the League, if not already done in M1 ([M1-18](https://github.com/pokesandbox/pokesandbox/issues/177)) (L)
- [ ] Human playtest Pallet → Champion; balance pass (L)
- [ ] Public playtest #2 on the PokeSandbox server; feedback triage (M)

## CP8: Mewtwo
- [ ] Post-Champion gate, Cerulean Cave, Mewtwo; Kanto Classic complete, with the full headless playthrough in CI (M)

## MVP Release 🚀
- [ ] Webapp goes public: player profile and character pages (with their journeys), privacy settings, the adventure log view (M)
- [ ] Report content + staff takedown tools for discovery, public pages, and narration ([M6-01](https://github.com/pokesandbox/pokesandbox/issues/206)) (L)
- [ ] Load test: N concurrent players + battles on target hosting (M)
- [ ] Dependency security re-check: no open critical/high Dependabot alerts before release (S)
- [ ] Admin guide + player guide + template walkthrough (M)
- [ ] Public release + discovery listing (S)
