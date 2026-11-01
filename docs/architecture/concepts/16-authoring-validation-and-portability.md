# 16: Authoring, Validation & Portability

> **TL;DR:** A region builder is only as good as its **validator**. Make "playability validation" a first-class engine module that runs on publish (and on demand as a "Region Health" report): referential integrity, graph reachability, starter reachability, softlock detection, and balance warnings. Make the compiled release **exportable/importable as JSON**. That's your template system, test fixtures, seed data, backup, and community sharing in one feature.

**MVP impact:** High · **Cost to change later:** Low–medium (but missing it means shipped regions that soft-lock players)

## Current shape
- Discord menu builder (FlowCord) for pokedex, progression, and basic locations.
- `deployable` is a stored boolean that's never computed.
- No integrity checks on delete. Seed data is exported/imported via scripts (`db:export` / `db:seed`), which is a good starting point for a portable format.

## Validator design

```ts
validateRegion(draft) → { errors: Issue[]; warnings: Issue[]; info: Issue[] }
Issue { code: 'EDGE_TARGET_MISSING' | 'UNREACHABLE_LOCATION' | …; severity; subject: Ref; message; fixHint? }
```

**Tier 1: structural (MVP)**
- Every referenced key exists (edges, NPC locations, trainer refs, script labels, items, species in the regional dex).
- Every condition and effect passes its registry `validate()`.
- Starting location set. The starter gift is reachable from the start via `journeyStarted` or an `enterLocation` trigger (your roadmap item).
- Trainer parties: species legal, levels 1–100, moves learnable (warning).
- Encounter tables: species in the regional dex, weights > 0.

**Tier 2: graph & progression (MVP-lite → later)**
- **Reachability**: BFS from the start, treating conditions as satisfiable if *some* reachable script/effect can grant what they need. This builds a progression dependency graph from the predicates' `references()` and the effects' writes. Flags:
  - Locations nobody can reach.
  - Milestones nothing grants.
  - Conditions on flags nothing sets.
  - **Cut/Surf soft-locks** (the HM needed to leave an area is only obtainable behind that area).
- A heal point is reachable before the first forced battle.
- Party-variant coverage: for the rival, every `starterChoice` option has a matching party.

**Tier 3: balance hints (later)**
- Level curve per area vs gym leader levels. Money curve vs shop prices. "Route has no encounters". Gym type coverage.

These are **warnings**, never blockers, so creative non-standard games still publish.

## Portability: region bundles
- The compiled release (see [01](01-content-vs-state-and-publishing.md)) serializes to a versioned JSON (or YAML) bundle with content keys (see [02](02-identity-and-references.md)).
- **Import** creates a new draft region from a bundle (rekeying is optional, since keys are region-scoped).
- The bundle includes the region's flavor entries and pack settings ([29](29-flavor-text-and-prose.md)) and its translations ([30](30-internationalization-readiness.md)), so export/import stays lossless as those features arrive.
- This gives you:
  - **Template regions** ("Start from Kanto Classic") via the clone-wholesale approach you described in the original plan.
  - **Seed data** and **test fixtures** (the engine test harness loads a bundle).
  - **Backups** and moving regions between servers.
  - Power-user authoring in a text editor, and later community sharing.

## Authoring: the same pattern for region building

> **Decision (Oct 2026):** Option C was adopted for gameplay. Because a webapp builder is likely (more screen space, custom controls such as graph and script editors), admin authoring follows the same pattern.

Once two clients (FlowCord admin menus and the webapp) can both edit a region, any rule that lives in a client gets duplicated and drifts. Examples:
- Delete a location → remove inbound edges.
- The two-way connection toggle.
- Content key generation.
- "Used by" checks before delete.
- Condition and effect validation.
- Permission checks.

```
FlowCord admin menus ─┐
                      ├─► libs/authoring ─► draft content repos (Mongo)
Webapp builder (tRPC) ┘    commands in        │
                           results out        └─► publish ─► validator ─► RegionRelease
```

```ts
type AuthoringCommand =
  | { type: 'location.create'; regionId; name; kind; parentKey? }
  | { type: 'location.connect'; regionId; from; to; twoWay: boolean; condition? }
  | { type: 'location.delete'; regionId; key }   // cascades inbound edges, or refuses with "used by"
  | { type: 'progression.upsert'; regionId; key?; definition }
  | { type: 'script.update'; regionId; key; steps }
  | { type: 'region.publish'; regionId }
  | …;

authoring.execute(actor, command) → { ok: true; changes: ContentChange[]; warnings: Issue[]; suggestions: Suggestion[] } | { ok: false; issues: Issue[] }
// suggestions: follow-up commands a client may offer (e.g. after adding HM Fly: "Enable traditional Fly travel?"). Empty in MVP; the hook exists so builder shortcuts are additive later.
```

**How it differs from the gameplay engine:**

| | `libs/engine` (play) | `libs/authoring` (build) |
|---|---|---|
| Operates on | Journey state + a published release | Draft content documents |
| Concurrency | Per-journey lock, optimistic concurrency on Journey | Per-entity optimistic concurrency (`version` per location/script/etc.). On conflict, return "this was changed by X, reload" instead of a silent overwrite. |
| Validation | Conditions evaluated at runtime | Schema validation per command + Region Health (the full validator) on demand and at publish |
| Output | `GameEvent[]` for renderers | `ContentChange[]` (for the audit log, cache invalidation, and the webapp's live refresh) |
| Auth | Journey owner | `actor` = Discord user + server role check (admin/mod role IDs). The webapp resolves roles through the bot or the Discord API, never trusting the browser. |

**Shared foundation.** Both packages build on one core of content schemas, the condition/effect registries, and the validator. The validator needs the registries' `validate()` and `references()`, and the engine needs `evaluate()`. Suggested layout:
- `libs/core`: content schemas, ContentKey, registries, validator.
- `libs/engine`: runtime.
- `libs/authoring`: admin commands.

Zod command schemas double as form schemas in the webapp and modal validation in Discord.

**What each client is for (Q36, [28](28-webapp-authoring-and-mobile-first-ux.md)):**
- **Webapp builder (mobile-first):** all MVP authoring: settings and rules, locations and the map, encounters, NPCs, trainers, scripts and templates, shops, transport, TM/HM lists, Region Health, the publish review, and JSON import/export.
- **Discord (`/region`):** Region Health summary, publishing, and Open in builder links. The existing Discord builders stay until the webapp reaches parity with them, behind a feature flag that hides them in production.

Both call the same commands, so a Discord editor can be added for any feature later without duplicating rules.

**Migration:** new builder features (connections, encounters, NPCs, scripts, shops) go through `libs/authoring` from day one, with webapp UIs. The existing Pokédex, progression, and locations menus move onto authoring commands during M0b (M0B-17..19), which is also when they adopt content keys and conditions. They keep working until the webapp has parity, hidden in production behind the `discord.authoring` feature flag (on in dev) until they're ready for a full release ([28 § Transition](28-webapp-authoring-and-mobile-first-ux.md#transition-the-existing-discord-builders)).

## Builder UX notes
- The builder should surface **"used by"** before deletes ("Badges is used by 4 conditions. Delete anyway?").
- **Region Health** shows validator output grouped by severity, with jump links into the relevant editor. `/region` shows a summary with Open in builder links.
- **Templates over raw editors** (Gym Leader, Route, Pokémon Center, Starter Gift) keep the "learn by building" goal while preventing 30-step setups.
- **Preview/playtest:** "Play draft as test journey". It's the fastest feedback loop for authors (later, but design the engine to support it: a release built from the draft, and a journey flagged `isTest`).
- Discord is good for quick actions and poor for 200-node graphs and long step lists, which is why MVP authoring is webapp-first ([28](28-webapp-authoring-and-mobile-first-ux.md)).

## MVP scope
- Tier 1 and basic Tier 2 (reachability ignoring conditions, plus "grants exist for required milestones/flags"), the Region Health view, delete-guard "used by", and JSON export/import of a region.

## Official templates (decided Oct 2026)
**Question:** should official templates like Kanto Classic be generated by a script, or built by hand on the PokeSandbox server?

**Proposal: both, with the repo as the source of truth.** *Built with the tools, versioned as code.*

| Step | How |
|---|---|
| 1. **Bulk canon data by script** | A one-time generator turns datamined game data into a region bundle: locations and connections, encounter tables (e.g. PokeAPI has Red/Blue/Yellow encounter data), trainers and parties with their pre-battle and defeat lines (from pret/pokered's text), marts, items, TM list. Hundreds of trainers and tables by hand in Discord would take weeks and add nothing. |
| 2. **Story and polish in the tools** | Import the generated bundle on the PokeSandbox HQ server, then author scripts, dialogue, gates, and gym templates **with the builder**. This is M6's dogfooding: every friction point found becomes a builder issue. |
| 3. **Export to the repo** | The exported bundle (`templates/kanto-classic/`) is the canonical version. Stable content keys and `_label`s make diffs reviewable in PRs, and export must be deterministic (sorted keys, stable ordering). |
| 4. **CI validates it** | The validator runs on the bundle, and the headless engine playthrough (to badge 2, later the whole game) runs against it. The template doubles as the MVP acceptance test. |
| 5. **Deploy from the repo** | Releases install or update the official template from the repo bundle (a seed/migration step). Servers import it like any template. |

Editing afterwards works either way: fix it in the tools on the HQ server and re-export (PR), or edit the JSON for mechanical bulk changes and re-import. **Round-trip export/import must be lossless.** That's a requirement of the bundle format and is tested in CI.

| Option | For | Against |
|---|---|---|
| Script only | Reproducible, reviewable, fast | Doesn't exercise the builder (the MVP's real product). Scripted content can drift from what the tools can express. |
| HQ server only | Full dogfooding | No review or history. The production DB is the only copy. Bulk data entry is slow. |
| **Hybrid: script for bulk, tools for story, repo as truth** | Fast, reviewable, tested, and dogfoods the builder | Needs lossless, deterministic export/import (already needed for templates and backups) |

**Versioning & "pull template updates" for clones.** The hybrid approach supports it:
- Each deploy that changes the canonical bundle publishes a new **immutable template release** (v1, v2, …). Template releases are kept forever, because they're the merge bases.
- A clone records `clonedFrom: { templateId, version }`. Pulling updates is a three-way merge **by content key**: base (the version you cloned) vs latest template vs your copy. See the worked example in [02](02-identity-and-references.md#worked-example-copying-a-template-region-to-another-server).
- **Key stability is the one hard rule.** After the first generation, the repo bundle is the source of truth and the generator is never re-run blindly. If generation is re-run, it must **reuse existing keys** (via a natural-identity → key map committed alongside the bundle). Otherwise every clone would see "everything deleted and re-added". CI checks that no existing key disappears between template versions unless the entry was intentionally removed.

**Data-source caution:** prefer openly licensed sources (e.g. PokeAPI) for generated data, and keep the generator plus its sources documented in the repo.

## Webapp editors (decided Oct 2026; revised by Q36)
MVP authoring is **webapp-first and mobile-first** ([28](28-webapp-authoring-and-mobile-first-ux.md)). This replaces the earlier plan of Discord-complete authoring with targeted webapp editors. The editors below are the ones that most need a real screen; every other MVP builder feature (region settings and rules, progressions, shops, transport networks, NPC basics, TM/HM lists) gets a webapp form too. All of them are built on the same `libs/authoring` commands (per-entity optimistic concurrency, role checks), so a Discord editor can be added for any of them later.

| Editor | Why Discord struggles | Webapp shape (phone first; wide screens get more) |
|---|---|---|
| **Script step editor** | Long ordered step lists, labels/branches, multi-paragraph dialogue | Step list with drag handles and move up/down, a full-screen step editor, inline passage editing with a Discord preview, template insertion |
| **Region map** | Hundreds of locations and directional edges, grouping, traversal gates | List/detail of locations with their connections on phones; a node-edge canvas (e.g. React Flow) with two-way edge drawing and gate badges on wide screens |
| **Encounter table grid** | Species × level range × weight × method × condition | One row per encounter as a card on phones, a spreadsheet-style grid on wide screens, with species search and a weight-percentage preview |
| **Trainer party editor** | Up to 6 Pokémon × moves/levels × conditioned party variants | Variant tabs, each with a party list; learnset-aware move pickers; condition per variant |
| **Condition builder** (shared component) | Nested any/all/not trees | Tree editor used inside every editor above |
| **Region Health** (read-only) | Long validator reports with cross-links | Grouped issue list linking to the relevant editor |

## Open questions
- ~~Block publish on errors only?~~ **Decided (Oct 2026):** yes. Errors block. Warnings and info never block, but they are **shown before the publish button is pressed**: publishing is two steps, a review (validation results plus the release diff) and then a confirm. The confirm is tied to the reviewed draft, so if the draft changes in between, the review runs again.
- ~~Official Kanto template?~~ **Decided (Q25):** yes, see [Official templates](#official-templates-decided-oct-2026).
- ~~Webapp builder in MVP?~~ **Decided (Q24, revised by Q36):** MVP authoring is webapp-first and mobile-first, see [Webapp editors](#webapp-editors-decided-oct-2026-revised-by-q36) and [28](28-webapp-authoring-and-mobile-first-ux.md).
