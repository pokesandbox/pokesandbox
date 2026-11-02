# Start Here

The one-page orientation for anyone joining PokeSandbox. Read this first, then the **Background** section of the epic you're working in (every issue links its parent epic).

## What PokeSandbox is
A Discord bot plus a web app that lets Discord servers **build their own Pokémon games ("regions")** and play them in Discord: a faithful Kanto remake, a fan region with custom Pokémon, a story-driven roleplay server. Server admins author regions (maps, encounters, trainers, story scripts, rules) in the web app, built for phones first; players play them through a `/play` menu, battle in a Showdown-powered battle system, and trade. The first public piece is the **Arena**: Showdown-style PvP and PvAI battles between server members, before any region exists. It's a non-commercial fan project.

## The plan

| Phase | Milestones | What ships |
|---|---|---|
| Foundations | **M0a** Platform Hygiene · **M0c** Arena Foundations · **M0b** Engine & Content Foundations | Org, CI, shared libraries; the battle library interfaces and a clean Showdown fork; the adventure engine and content primitives |
| Pre-MVP: Arena | **M1** Battle Core & Catalog · **M2** Arena Release 🚀 | Public PvP/PvAI in Discord (public release #1) |
| MVP: "Recreate Red/Blue/Yellow" | **CP0a–CP0c** Pallet Town · **CP1–CP6** badge by badge · **CP7** Champion · **CP8** Mewtwo · **MVP Release** 🚀 | Kanto Classic built with the tools, playable checkpoint by checkpoint (public playtests at CP4 and CP7 on the PokeSandbox server), then released (public release #2) |
| Later | Full-feature, then "Pie in the Sky" | Quests, custom content, events, co-op, … |

Two tracks run in parallel: **Arena** (M0c → M1 → M2, which needs only `libs/core` from M0a) and **content** (M0b → CP0a → … → CP8 → MVP Release). Details on the checkpoints: [`roadmap/mvp-checkpoints.md`](roadmap/mvp-checkpoints.md). Details: [`roadmap/mvp.md`](roadmap/mvp.md) and [`roadmap/roadmap.md`](roadmap/roadmap.md).

## The architecture in ten lines
1. **Monorepo** (Nx): `apps/bot` (discord.js + the FlowCord menu library), `apps/webapp` (Next.js + tRPC), `shared/` (Mongoose + Zod models), and new libraries `libs/core`, `libs/engine`, `libs/battle`, `libs/authoring` with enforced boundaries ([03](architecture/concepts/03-engine-boundary-and-game-loop.md)).
2. **Game rules live in `libs/engine`**, never in Discord handlers: `dispatch(journeyId, action) → events`, and renderers draw the events ([03](architecture/concepts/03-engine-boundary-and-game-loop.md), [26](architecture/concepts/26-discord-surface-and-ux-patterns.md)).
3. **Battles run on a fork of Pokémon Showdown** through `libs/battle` (BattleService): deterministic, persisted, and recoverable after restarts ([14](architecture/concepts/14-battle-system-and-showdown.md)).
4. **The catalog** is canon game data (species, moves, learnsets, items) imported from Showdown per generation into MongoDB ([12](architecture/concepts/12-content-catalog-species-moves-items.md)). Custom content and overrides layer on top ([27](architecture/concepts/27-server-content-library-and-overrides.md)).
5. **Regions are drafts that publish to immutable releases**, so admins can keep editing without breaking live players ([01](architecture/concepts/01-content-vs-state-and-publishing.md)).
6. **Conditions, gates, and effects** are the only way content gates and rewards anything; **scripts** are how story happens ([05](architecture/concepts/05-requirements.md), [06](architecture/concepts/06-effects.md), [07](architecture/concepts/07-scripts-triggers-and-events.md)).
7. **Players:** a *character* is the persona you play as; a *journey* is that character's playthrough of one region ([23](architecture/concepts/23-players-characters-journeys-and-scopes.md)).
8. **Rules are chosen per region, generation by generation**; the MVP is authentic Gen 1 ([18](architecture/concepts/18-rules-time-and-randomness.md)).
9. **Authoring** happens in the webapp, mobile-first, through `libs/authoring` commands; Discord is for play, plus Region Health and publishing. The existing Discord builders stay until the webapp has parity, hidden in production behind a feature flag ([16](architecture/concepts/16-authoring-validation-and-portability.md), [28](architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)).
10. **Every decision is recorded** in [`architecture/open-questions.md`](architecture/open-questions.md) (Q1–Q38 plus a "Smaller decisions" index). Concept docs' **Decisions** sections win over older text in the same doc.

## Where things live
| What | Where | Pattern to copy |
|---|---|---|
| Models (Zod + Mongoose) | `shared/src/models/` (export from `index.ts`) | `dexentry.model.ts`; `region/region.model.ts` for `zMapHydrator` (`models/utils.ts`) |
| DTOs (read shapes for bot and webapp) | `shared/src/dtos/` | `region.dto.ts` |
| Seed data | `scripts/seed/data/*.json`, registered in `scripts/seed/collections.ts` | the `dexentries` entry |
| Bot commands and menus | `apps/bot/src/interactions/` (admin builders under `…/regionManagement/`) | the Pokédex builder (`pokedex/`) |
| Webapp | `apps/webapp/` (moving off antd to Tailwind + a headless library: trial [M3-05](https://github.com/pokesandbox/pokesandbox/issues/202), migration [M3-07](https://github.com/pokesandbox/pokesandbox/issues/203)) | existing tRPC routers |
| New libraries | `libs/core`, `libs/battle`, `libs/engine`, `libs/authoring` (being created in M0a, M0c, M0b) | their scaffold issues |
| Showdown fork | separate repo, `pokesandbox/pokemon-showdown` | [M0c § Background](https://github.com/pokesandbox/pokesandbox/issues/122) |
| Design docs | `docs/architecture/concepts/` (one per topic) | the concept index in [`architecture/README.md`](architecture/README.md) |

**Model conventions:** the Zod schema is the source of truth (`fooSchema`), mirrored by the Mongoose schema (`fooDbSchema`); embedded sub-schemas are standalone `Schema` consts with `{ _id: false }`; map fields use `zMapHydrator`.

## Running it
- `npm run setup` once (env file, Mongo in Docker, seed), then `npm run start:bot` / `npm run start:app`.
- `npm run db:seed` after changing seed data.
- Tests run with Jest through Nx, e.g. `npx nx test shared`.

## How work is organized
- **Work is tracked as GitHub issues** on the [project board](https://github.com/orgs/pokesandbox/projects/1), grouped into epics within milestones. Each issue has a parent epic, priority, size, "blocked by" links, and checkable acceptance criteria; each epic has a **Background** section with the context its issues need. Issues that started as backlog drafts keep their draft ID (`M0C-03`) in the body. New issues use the issue templates; see [Writing issues](roadmap/github-project-setup.md#writing-issues).
- **The `agent-ready` label** means no design judgement is left; anyone (or an AI agent) can pick it up.
- **One PR per issue.** Every PR is reviewed by the owner. CI runs lint, typecheck, and tests.
- **If an issue leaves a real question open, ask the owner** rather than deciding it in code; answers get recorded in `open-questions.md`.

## Words you'll see
| Term | Meaning |
|---|---|
| Region | One game a server builds (e.g. Kanto Classic). A server can have several. |
| Release | An immutable published version of a region; players always play a release. |
| Catalog | Canon data shared by every region (species, moves, learnsets, items). |
| Library | A server's custom content and overrides, layered on the catalog. |
| Character / journey | The persona a player plays as / that persona's playthrough of one region. |
| BattleService | Our wrapper around Showdown that runs, persists, and recovers battles. |
| Arena / format | Region-free PvP and PvAI / the server's rules for legal teams (e.g. "Kanto 151 Lv50"). |
| Condition, gate, effect | "Is this allowed?", how a block is shown, and "what happens" (give item, set flag, …). |
| Script, passage | A story sequence (dialogue, choices, battles) / a block of prose and dialogue in one. |
| `speciesId`, `moveId` | Showdown IDs (`pikachu`, `thunderbolt`); custom content uses `<publisherId>:<slug>`. |

## Where to go next
| You want to work on | Start with |
|---|---|
| The Arena | [M0c: Arena Foundations](https://github.com/pokesandbox/pokesandbox/milestone/2), then [M1: Arena epics](https://github.com/pokesandbox/pokesandbox/issues/161) |
| Moves, learnsets, TMs | [Catalog: Moves & Learnsets](https://github.com/pokesandbox/pokesandbox/issues/156), then [TM/HM Lists](https://github.com/pokesandbox/pokesandbox/issues/196) (CP1) |
| The webapp builder | [Webapp Builder](https://github.com/pokesandbox/pokesandbox/issues/201) (CP1) and concept [28](architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md) |
| Platform, CI, data hygiene | [M0a: Platform Hygiene](https://github.com/pokesandbox/pokesandbox/milestone/1) |
| The engine and content primitives | [M0b: Engine & Content Foundations](https://github.com/pokesandbox/pokesandbox/milestone/3) |
| Going live (hosting, operations, the Arena's Discord side) | [M2: Arena Release](https://github.com/pokesandbox/pokesandbox/milestone/5) |
