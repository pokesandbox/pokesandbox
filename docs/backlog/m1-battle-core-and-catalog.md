# M1: Battle Core & Catalog (backlog draft, partial)

Drafted so far: the **moves and learnsets catalog** epic (E-M1-2), which can start now and run in parallel with M0a, and the **Arena epics** ([E-M1-3 BattleService, E-M1-4 Teams & Formats, E-M1-5 AI Players](#arena-epics-e-m1-3-e-m1-4-e-m1-5)), which M2 builds on. Still to draft: the fork patches (E-M1-1, reserved), items, `RegionRules`, and the Gen 1 implementations; the adventure needs those, the Arena doesn't. Fork clean-up, rebase, and packaging moved to [M0c](m0c-arena-foundations.md).

Refs: concept [12](../architecture/concepts/12-content-catalog-species-moves-items.md), [`mvp.md` § M1](../roadmap/mvp.md#m1-battle-core--catalog)

## E-M1-2 · Catalog: Moves & Learnsets
`Type: Epic` · `Priority: P0`

Import every canon move and learnset from a pinned Showdown version into the DB catalog, with per-generation data, so authoring, display, validation, and TM/HM lists ([E-M3-1](m3-region-authoring.md)) can read them. Showdown stays the battle engine; the catalog holds data only ([12 § Moves](../architecture/concepts/12-content-catalog-species-moves-items.md#moves-import-and-showdown-callbacks-decided-oct-2026)).

### Start here (no prior context needed)

**What you're building, in Pokémon terms.** PokeSandbox lets Discord servers build their own Pokémon regions (Kanto remakes, fan regions) and play them in Discord. Regions can follow any generation's rules piece by piece, so the app needs every canon move and every species' learnset **for every generation**: Gen 1 Bite is Normal-type with a 10% flinch, Gen 2+ Bite is Dark; Gen 1 Pikachu learns Thunderbolt by TM, and so on. This epic imports that data into our MongoDB so the rest of the app can read it. Then E-M3-1 lets each region define its own TM/HM case (Gen 1's TM24 is Thunderbolt; other generations number differently).

**Repo layout, setup, and conventions** are in [`docs/start-here.md`](../start-here.md) (models in `shared/src/models/`, seed data in `scripts/seed/`, the Pokédex builder menus under `apps/bot/src/interactions/…/regionManagement/pokedex/` for M1-04). Design decisions for this epic: concept [12](../architecture/concepts/12-content-catalog-species-moves-items.md), sections "Moves" and "Learnsets".

**Pokémon Showdown in five minutes**
- Showdown is the open-source battle simulator behind play.pokemonshowdown.com. It has complete, maintained data for every generation, which is why we import from it. It also runs our battles later, but this epic only reads its data.
- It's on npm as `pokemon-showdown`. Install an exact version as a dev dependency for the import scripts (e.g. `npm i -D pokemon-showdown@<exact version>`). Each import records that version in a `CatalogVersion` and stamps the catalog version's ID on every record.
- **IDs:** everything is keyed by an ID: lowercase, alphanumeric only. `toID('Thunder Bolt') === 'thunderbolt'`, `toID('Mr. Mime') === 'mrmime'`. Ours use the same IDs (`moveId`, `speciesId`).
- **Per-generation data:** each older generation is a "mod" (`data/mods/gen1` … `gen8`) that only stores what differs from the next generation up, with base `data/` being Gen 9. **You never need to read those files.** Ask the API for a generation and it hands you fully resolved data:
  ```ts
  import { Dex, toID } from 'pokemon-showdown';

  const gen1 = Dex.mod('gen1');                 // Dex.mod('gen2') … Dex.mod('gen8'); plain `Dex` is Gen 9
  const bite = gen1.moves.get('bite');
  bite.type;          // 'Normal' in Gen 1 (Dex.moves.get('bite').type is 'Dark')
  bite.category;      // per-gen correct (pre-Gen 4 categories come from type)
  bite.shortDesc;     // the description text for that generation
  bite.isNonstandard; // null when the move exists in this gen; 'Past' (removed) / 'Future' (not yet) / 'CAP' (fan-made: skip)

  gen1.moves.all();                              // every move as that generation sees it
  gen1.data.Moves['bite'];                       // the raw resolved entry: plain data plus any callback functions
  ```
- **Callbacks:** some moves have functions in their data (`basePowerCallback`, `onHit`, `onModifyType`, …). Those are battle behavior. We **don't** copy them, only record their names (the `hooks` field), e.g. from `Object.keys(entry).filter(k => typeof entry[k] === 'function')`.
- **Learnsets:** `dex.species.getLearnsetData(speciesId).learnset` (the API name in 0.11.x; check the pinned version) gives `moveId → source codes`, e.g. `thunderbolt: ['9M', '8M', …, '1M']`. The code is `<gen><method><detail>`: `L15` level 15, `M` TM/HM, `T` tutor, `E` egg, `S0` event, `V` Virtual Console. So `1L15` = learned at level 15 in Gen 1.
- **Learnset gotchas:**
  - Some forms have no learnset of their own and share their base species' (Showdown marks the link with `changesFrom` / `baseSpecies`). Store the base species' learnset under the form's ID, or record the fallback, so no form ends up with an empty move list.
  - A species' learnset doesn't include moves only its pre-evolution learns. That's correct for display (it matches the games' level-up lists), so don't merge them.
  - Gen 1 and Gen 2 learnsets live in the same data with `1…` and `2…` codes, so filter by the leading digit.

**Words used in these issues**
- **Catalog:** global, canon game data shared by every region (species, moves, learnsets, items).
- **`GenId`:** `'gen1'` … `'gen9'`.
- **`ResolvedLearnset`:** a learnset already filtered to one generation and grouped by method (`levelUp`, `machine`, `tutor`, `egg`, `event`). Everything outside the catalog reads this, never raw codes.
- **Region content:** things a region's admins author (locations, NPCs, its TM/HM list). It's published as versioned releases. You only touch it in E-M3-1.

**Notes for whoever picks this up**
- **Where models live for now:** `shared/src/models`, next to `DexEntry`. They move to `libs/core` when M0A-09 lands; keep them free of Discord and bot imports so the move is mechanical.
- **Model conventions:** the Zod schema is the source of truth (`moveDefinitionSchema`), mirrored by the Mongoose schema (`moveDefinitionDbSchema`). Embedded sub-schemas are standalone `Schema` consts with `{ _id: false }`. Map fields are parsed with `zMapHydrator`.
- **Which Showdown:** until the fork is published as a package (M0C-06), import from the upstream `pokemon-showdown` npm package at an exact pinned version, as a dev dependency of the import script. Each import writes one `CatalogVersion` (M1-01) and stamps its ID on every record.
- **IDs:** moves and species are keyed by Showdown IDs (`toID`), never ObjectIds. Species use the same string `DexEntry.showdownName` holds today; M0A-19 renames that field to `speciesId`.

**Changes once foundations land.** This epic starts before the foundations it will eventually sit on, so some issues get small follow-ups. Each one is also listed on the foundation issue that triggers it, so it isn't lost:

| When this lands | Follow-up | Affects |
|---|---|---|
| `libs/core` (M0A-09) + module boundaries (M0A-10) | Move the catalog models and helpers from `shared/` into `libs/core`. Mechanical if they stay free of Discord/bot imports. | M1-01, M1-03 (and M3-01) |
| The fork is published as a package (M0C-06) | Point the import scripts at the fork package instead of upstream `pokemon-showdown`, re-run, and review the diff. | M1-02, M1-03 |
| The `speciesId` rename (M0A-19) | Learnsets already use `speciesId`; the orphan test switches from `DexEntry.showdownName` to `DexEntry.speciesId`. | M1-03 |
| `RegionRules` (M1) | Replace the "default Gen 1" generation choice with the region's `rules.data.moves` / `rules.data.learnsets`. | M1-04 |
| Pokédex builder on authoring commands (M0B-17) | The move views stay read-only (no authoring commands needed), but they live in the same menus M0B-17 restructures. Whichever lands second rebases onto the other. | M1-04 |

### M1-01 · `MoveDefinition` model
`Type: Task` · `Parent: E-M1-2` · `Priority: P0` · `Size: S` · `Labels: area:shared-models, domain:catalog` · `Blocked by: —` · `agent-ready: yes` · `Owner: any`

**Summary:** The catalog model for moves ([12 § Moves](../architecture/concepts/12-content-catalog-species-moves-items.md#moves-import-and-showdown-callbacks-decided-oct-2026)): a resolved Gen 9 `base`, per-gen `genOverrides` holding only differences, and per-gen behavior `hooks`. Availability (`isNonstandard`) is an ordinary `MoveData` field; text has its own `text` sub-field with the same per-gen override pattern.

```ts
MoveDefinition {
  moveId: MoveId;                 // unique; Showdown toID
  num: number; name: string;
  introducedGen: number;          // Showdown's `gen` field
  base: MoveData;                 // the resolved Gen 9 record (base Dex)
  genOverrides: Partial<Record<GenId, Partial<MoveData>>>;   // per resolved gen Dex, only the fields that differ from `base`
  text: {                         // from data/text/moves.ts, under Showdown's own field names
    desc: string; shortDesc: string;                          // Gen 9 text
    genOverrides?: Partial<Record<GenId, { desc?: string; shortDesc?: string }>>;   // e.g. gen1: { shortDesc: "10% chance to make the target flinch." }
  };
  hooks: Partial<Record<GenId, string[]>>;                    // names of behavior callbacks (basePowerCallback, onHit, …); no code
  catalogVersion: string;         // the import this record came from ([12 § Catalog versions](../architecture/concepts/12-content-catalog-species-moves-items.md#catalog-versions-decided-oct-2026))
}

MoveData = {
  // Data fields from data/moves.ts: only the fields Showdown actually has, all plain data
  type; category: 'Physical' | 'Special' | 'Status'; basePower; accuracy: number | true;
  pp; priority; target; flags; secondary?; secondaries?; critRatio?; multihit?; recoil?; drain?; …;
  isNonstandard?: string | null;  // null = available; 'Past' (removed in that gen), 'Future', … Per gen via genOverrides.
                                  // Moves that are 'CAP' (fan-made) in every gen aren't imported at all.
}
```
- **Text has its own sub-field**, mirroring Showdown's split between `data/moves.ts` (data) and `data/text/moves.ts` (text). `MoveData` stays exactly what a battle uses (what overrides patch and custom-move recipes change), and `text` can later become per-language without touching battle data. `resolveMove(def, gen)` merges both override maps and returns data and text together. The resolved Dex already applies Showdown's text fallback (a generation without its own block uses the nearest older-generation block above it, then the current text).
- **Availability is `isNonstandard`**, so it's per generation through `genOverrides` too, with no separate map.
- **Battle message templates** in the same text file (`start`, `activate`, `end`, `damage`, …) aren't stored. The battle renderer reads them from Showdown at runtime ([26](../architecture/concepts/26-discord-surface-and-ux-patterns.md#battles)); custom moves (post-MVP) inherit their template move's messages.

**Acceptance criteria**
- `moveDefinitionSchema` (Zod) and `moveDefinitionDbSchema` (Mongoose) following the model conventions above, matching the shape above. `GenId` is `'gen1' | … | 'gen9'`.
- `MoveData` covers every plain-data field Showdown has for moves (the list above is the common ones; include any other non-function field present in the source). No functions, and no text: text lives in `text`.
- A helper `resolveMove(def, gen) → { data: MoveData; desc: string; shortDesc: string }` that applies `genOverrides[gen]` over `base` and `text.genOverrides[gen]` over `text`, with unit tests.
- A shared `MoveId` type that accepts both canon IDs (`thunderbolt`) and namespaced publisher IDs (`<publisherId>:<slug>`, used by custom moves later). Only the canon `MoveDefinition` collection validates the plain Showdown format on its own records, so fields typed `MoveId` elsewhere never reject custom moves ([27 § Keeping it additive](../architecture/concepts/27-server-content-library-and-overrides.md#keeping-it-additive-mvp)).
- Unique index on `moveId`. A DTO for the read path.
- `CatalogVersion` model (`_id`, `showdownVersion`, `importedAt`, `notes?`, `counts`), shared by every catalog collection. **Why:** it keeps the catalog in sync with the Showdown version running battles, lets releases pin and embed the data they were validated against, gives overrides a base to merge upgrades from, and makes a partial import detectable ([12 § Catalog versions](../architecture/concepts/12-content-catalog-species-moves-items.md#catalog-versions-decided-oct-2026)).

**Changes later:** moves to `libs/core` with M0A-09/M0A-10.

**Refs:** [12](../architecture/concepts/12-content-catalog-species-moves-items.md)

### M1-02 · Import moves from Showdown
`Type: Task` · `Parent: E-M1-2` · `Priority: P0` · `Size: M` · `Labels: area:shared-models, domain:catalog` · `Blocked by: M1-01` · `agent-ready: yes` · `Owner: any`

**Summary:** A re-runnable script that builds `MoveDefinition` seed data from the pinned Showdown version, using Showdown's own resolved Dex per generation, never by parsing its data files.

**Acceptance criteria**
- For each generation 1–9, load the resolved Dex (`Dex.mod('gen1')` … `Dex.mod('gen8')`, base for Gen 9) so the inheritance merge and `scripts.ts` `init()` are applied. Main-series mods only; side mods (`gen1stadium`, `gen7letsgo`, `gen8bdsp`, …) are skipped.
- `base` = the resolved Gen 9 record; `genOverrides[gen]` = only the fields that differ from `base`. Functions are dropped; their names go into `hooks[gen]`.
- `isNonstandard` is imported as a data field, so per-gen availability (`Past`, `Future`) lands in `genOverrides`. Moves that are `'CAP'` in every generation aren't imported.
- `desc` / `shortDesc` come from each generation's resolved move (`dex.moves.get(id).desc`), which already applies Showdown's per-gen text fallback from `data/text/moves.ts`; differences from Gen 9 go into `text.genOverrides`. Battle message templates (`start`, `activate`, …) aren't stored.
- Each run creates one `CatalogVersion` (with the pinned `showdownVersion` and record counts) and stamps its `_id` on every record it writes. A test fails if catalog records carry more than one `catalogVersion`.
- Output is deterministic (sorted keys) and written to `scripts/seed/data/moves.json`, so a re-import is a readable diff. Register it in `scripts/seed/collections.ts` so `npm run db:seed` loads it. The script lives under `scripts/` with a `package.json` script entry (e.g. `catalog:import`).
- Tests against the generated data (worth verifying each against the source when writing them):
  - Bite: Normal type and 10% flinch in Gen 1; Dark from Gen 2.
  - Gust: Normal in Gen 1.
  - Shadow Ball: Physical in Gen 3 (Ghost was a physical type before Gen 4); Crunch: Special in Gen 3.
  - Low Kick has `basePowerCallback` in its hooks for the generations where its power is weight-based.
  - A move removed from Gen 8+ games is `Past` there and available in earlier generations.
  - Bite's `text.genOverrides.gen1.shortDesc` is the 10% flinch text, and its Gen 9 `text.desc` is the 30% one.

**Changes later:** re-point to the fork package once it's published, then re-run and review the diff.

**Refs:** [12 § Moves](../architecture/concepts/12-content-catalog-species-moves-items.md#moves-import-and-showdown-callbacks-decided-oct-2026)

### M1-03 · `Learnset` model and import
`Type: Task` · `Parent: E-M1-2` · `Priority: P0` · `Size: M` · `Labels: area:shared-models, domain:catalog` · `Blocked by: M1-02 (reuses its import setup)` · `agent-ready: yes` · `Owner: any`

**Summary:** One document per species with Showdown's per-generation source codes, so a region on Gen 1 learnsets filters to `1*` sources (`1L15` = level 15 in Gen 1, `1M` = TM/HM in Gen 1).

**Acceptance criteria**
- `Learnset { speciesId; moves: Record<MoveId, string[]>; catalogVersion }` with the model conventions above; unique index on `speciesId`.
- Imported through the Showdown API per generation, like M1-02 (`Dex.mod('genN').species.getLearnsetData(id)`; the API already merges old-generation learnset data, so no raw files are read). Forms without their own learnset get their base species' (see the gotchas in Start here). Deterministic output to `scripts/seed/data/learnsets.json`, registered in `scripts/seed/collections.ts`.
- `resolveLearnset(learnset, gen) → ResolvedLearnset` (`levelUp` sorted by level, `machine`, `tutor`, `egg`, `event`), the shape every consumer uses ([12 § Learnsets](../architecture/concepts/12-content-catalog-species-moves-items.md#learnsets--generation-decided-oct-2026)). Nothing outside the catalog reads raw source codes. Override patches are post-MVP, but the resolved shape is what they'll patch ([27 § Learnsets](../architecture/concepts/27-server-content-library-and-overrides.md#learnsets)).
- Every species ID matches an existing `DexEntry` (a test fails on orphans). Coordinate with M0A-19 if it lands at the same time.
- Tests (verify each against the source): Pikachu's Gen 1 resolved learnset has Thunderbolt in `machine`; Bulbasaur's Gen 1 `levelUp` includes Vine Whip; a move that only exists from Gen 2 never appears in Gen 1 results.

**Changes later:** moves to `libs/core` (M0A-09/M0A-10); re-point to the fork package; the orphan test follows the M0A-19 rename.

**Refs:** [12 § Learnsets](../architecture/concepts/12-content-catalog-species-moves-items.md#learnsets--generation-decided-oct-2026)

### M1-04 · Move details in the Pokédex builder (read-only)
`Type: Feature` · `Parent: E-M1-2` · `Priority: P1` · `Size: M` · `Labels: area:bot, domain:catalog` · `Blocked by: M1-02, M1-03` · `agent-ready: yes` · `Owner: junior`

**Summary:** Let admins (and later players) see a Pokémon's moves and each move's details for a chosen generation, from the catalog.

**Acceptance criteria**
- From a Pokédex entry in the builder: a paginated move list for a chosen generation (default: Gen 1 until regions have rules), grouped by method (level-up with levels, TM/HM, other).
- Reads the species' `ResolvedLearnset` for the chosen generation.
- Selecting a move shows its details for that generation: type, category, power, accuracy, PP, priority, and the short description (the generation's text block when there is one).
- Reads through a small catalog read service in `shared/`, not direct queries from the menu: `getMove(moveId, { gen, region? })` and `getLearnset(speciesId, { gen, region? })`. `region` is accepted but unused in the MVP, so publisher overrides can plug into these functions later without touching callers ([27 § Keeping it additive](../architecture/concepts/27-server-content-library-and-overrides.md#keeping-it-additive-mvp)).
- Locked or unavailable options follow [26 § Menus and feedback](../architecture/concepts/26-discord-surface-and-ux-patterns.md#menus-and-feedback).

**Changes later:** the generation comes from `RegionRules` once it exists; rebase alongside M0B-17's Pokédex builder migration.

**Refs:** [12](../architecture/concepts/12-content-catalog-species-moves-items.md), [26](../architecture/concepts/26-discord-surface-and-ux-patterns.md)

---

# Arena epics (E-M1-3, E-M1-4, E-M1-5)

Everything the Arena needs from M1 before M2 wires up its Discord side (E-M2-2): battles that run, persist, recover, and time out; teams and formats; and AI opponents. **PvP and PvAI with team presets need none of the Showdown fork patches** (state injection, the external choice hook, isolated custom-data dexes: E-M1-1, not drafted yet). Those serve adventure battles and formats with custom content.

## Start here (Arena)
New to the project? Read [`docs/start-here.md`](../start-here.md), then [M0c § Start here](m0c-arena-foundations.md#start-here) (the Arena in Pokémon terms, how the fork, `libs/battle`, and the Arena module fit together, and how to work on the fork). Context specific to these epics:
- **Design:** [25](../architecture/concepts/25-arena.md) is the Arena (teams, formats, timers, AI, the ownership table and acceptance scenarios); [14](../architecture/concepts/14-battle-system-and-showdown.md) is BattleService; [15 § Sharding](../architecture/concepts/15-persistence-concurrency-and-runtime.md#sharding-deploys-and-who-owns-live-state-decided-oct-2026) is battle ownership; [26 § Battles](../architecture/concepts/26-discord-surface-and-ux-patterns.md#battles) is how battles look.
- **Showdown's battle API in brief:** a battle is a `BattleStream` (`sim/battle-stream.ts`). You write `>start {"formatid":…,"seed":[…]}`, `>player p1 {"name":…,"team":<packed team>}`, then `>p1 move 1` / `>p2 switch 3`. It writes back protocol lines (`|move|p1a: Pikachu|Thunderbolt|p2a: Onix`, `|-damage|…`, `|turn|2`) and, per side, a `|request|` JSON that lists the legal choices and carries an `rqid`. The same seed and the same choices always produce the same battle, which is what persistence and recovery rely on. `RandomPlayerAI` (`sim/tools/random-player-ai.ts`) is a working example of a side that reads requests and answers them.
- **Teams** use Showdown's set shape (`PokemonSet`: species, moves, ability, item, level, EVs/IVs, nature). `Teams.import(paste)` / `Teams.export(team)` handle the text format players copy from Showdown's teambuilder, and `TeamValidator.get(formatId).validateTeam(team)` returns a list of problems.
- **Order:** E-M1-3 first (M1-05 is the root). E-M1-4 can start in parallel once `PokemonSet` exists (M1-11). E-M1-5 needs only M1-05's request events. M2's E-M2-2 builds on M1-05, M1-06, M1-08, and M1-10.

**Changes once foundations land:**

| When this lands | Follow-up | Affects |
|---|---|---|
| The fork is published as a package (M0C-06) | Switch `libs/battle` from upstream `pokemon-showdown` (exact pinned version) to the fork package, and re-run the battle tests. | M1-05, M1-12, M1-14 |
| Fork patches (E-M1-1) | `inject` and the external choice hook stop throwing `NotSupported`; formats with library content compile into isolated dexes; trainer item use (M1-17) is unblocked. | M1-05, M1-12, M1-17 |
| `RegionRules` (M1) | Adventure battles pass the region's mechanics generation; the Arena keeps using the format's `rules.mechanicsGen`. | M1-05 |

## E-M1-3 · BattleService
`Type: Epic` · `Priority: P0`

`libs/battle`'s Showdown implementation of `BattlePort` (M0C-01): start battles, take choices, emit events, persist every input, recover after restarts, run each battle in exactly one process, and own the turn timer. Contract: [25 § Ownership](../architecture/concepts/25-arena.md#ownership) and [14 § BattleService](../architecture/concepts/14-battle-system-and-showdown.md#battleservice-in-libsbattle).

### M1-05 · BattleService: start, choose, and events (in-process)
`Type: Feature` · `Parent: E-M1-3` · `Priority: P0` · `Size: L` · `Labels: area:battle` · `Blocked by: M0C-01` · `agent-ready: no` · `Owner: senior`

**Summary:** The core of `libs/battle`: a `BattleService` implementing `BattlePort` over Showdown's `BattleStream`, running in the game host process behind an interface that can later move battles to worker threads.

**Acceptance criteria**
- `start(spec)` creates a battle for `kind: 'pvp' | 'ai-arena'` (the adventure kinds `wild` / `trainer` are accepted by the types but not wired until M5), with a format ID, the sides' `PokemonSet[]` teams, and a seed. A missing seed is generated and stored.
- `choose(battleId, side, choice, rqid)` validates against the side's current request. A stale or already-answered `rqid` is a no-op (returns `{ accepted: false, reason: 'stale' | 'answered' }`), so a request is never resolved twice. Choices for one battle go through **one in-process queue per `battleId`**, so a timer and a press, or two presses, never interleave.
- `subscribe(battleId, sink)` delivers `BattleEvent`s: `request` (per side, with `rqid` and the legal choices), `turn` (a `TurnDigest`, M1-09), `ended` (winner, reason: `normal | forfeit | timeout`), plus `battleRecovered` (M1-06).
- `forfeit(battleId, side)`.
- `inject` and the external choice hook throw `NotSupported` until E-M1-1's fork patches land.
- Uses upstream `pokemon-showdown` at an exact pinned version until M0C-06 publishes the fork.
- Tests: a full PvP battle driven by two scripted sides finishes with the right winner; the same seed and choices give the same protocol output; a double `choose` with the same `rqid` is applied once; no Discord imports (module boundaries).

**Changes later:** switches to the fork package (M0C-06); `inject` and the external choice hook come with E-M1-1.

**Refs:** [14 § BattleService](../architecture/concepts/14-battle-system-and-showdown.md#battleservice-in-libsbattle), [25 § Ownership](../architecture/concepts/25-arena.md#ownership)

### M1-06 · Battle persistence and recovery
`Type: Feature` · `Parent: E-M1-3` · `Priority: P0` · `Size: M` · `Labels: area:battle, area:shared-models` · `Blocked by: M1-05` · `agent-ready: no` · `Owner: senior`

**Summary:** Every battle can be rebuilt from its seed and inputs, so a restart never loses a battle and replays come for free.

**Acceptance criteria**
- A `Battle` collection: `{ battleId, guildId, kind, formatId, seed, teams (as given to start), inputLog[], status: 'active' | 'ended', result?, lease (M1-07), deadlines (M1-08), createdAt, endedAt? }`. The input log is appended **before** the input is sent to the sim, in the same write as the turn's state.
- `recover()` rebuilds each active battle it may run (M1-07) by replaying `start` + `inputLog` into a fresh stream, checks that the replayed state matches the last persisted turn number, then emits `battleRecovered`.
- Retention: Arena battles keep their full log (replays); adventure battles are compressed after they end and kept for 7 days ([14](../architecture/concepts/14-battle-system-and-showdown.md#battleservice-in-libsbattle)). The cleanup is a scheduled job with a test.
- Tests: kill the service mid-turn (drop the in-memory stream), recover, finish the battle, and get the same result as an uninterrupted run with the same inputs.

**Refs:** [14 § BattleService](../architecture/concepts/14-battle-system-and-showdown.md#battleservice-in-libsbattle), [25 § Ownership](../architecture/concepts/25-arena.md#ownership) (Persistence and recovery)

### M1-07 · Battle leases and server ownership
`Type: Task` · `Parent: E-M1-3` · `Priority: P0` · `Size: M` · `Labels: area:battle, area:bot` · `Blocked by: M1-06, M0A-16` · `agent-ready: no` · `Owner: senior`

**Summary:** Each battle runs in exactly one process, even during a deploy overlap or a reshard.

**Acceptance criteria**
- `ownsGuild(guildId)` in the game host: `true` for everything with one process; Discord's shard formula once there are several (a test covers both).
- A battle lease on the `Battle` record (`ownerInstance`, `leaseExpiresAt`), taken with a conditional update and renewed by a heartbeat. A process runs a battle (accepts choices, fires its timers) only while it holds the lease.
- `recover()` takes only battles of servers this process owns whose lease is free or expired.
- A choice that reaches a process without the lease returns `{ accepted: false, reason: 'resuming' }`, which the surfaces show as "Battle is resuming, press again in a moment" ([26](../architecture/concepts/26-discord-surface-and-ux-patterns.md#menus-and-feedback)).
- Overlap test: two service instances against one database; each battle resolves each turn once, fires one timer, and records one result; the second takes over only after the first releases or its lease expires.

**Refs:** [15 § Sharding](../architecture/concepts/15-persistence-concurrency-and-runtime.md#sharding-deploys-and-who-owns-live-state-decided-oct-2026)

### M1-08 · Turn timers and timeout policy
`Type: Feature` · `Parent: E-M1-3` · `Priority: P0` · `Size: M` · `Labels: area:battle` · `Blocked by: M1-06, M0C-02` · `agent-ready: yes` · `Owner: any`

**Summary:** The Arena's turn timer, owned and persisted by BattleService (Q13), never by a Discord surface.

**Acceptance criteria**
- Enabled per format (`rules.timer`, default 90s per decision for PvP); off for PvAI and adventure battles.
- When a side gets a request, its `deadlineAt` is persisted on the battle and armed through the `Scheduler` port. On expiry the service submits Showdown's `default` choice for that side (through the same queue and `rqid` check as a press) and increments `consecutiveTimeouts[side]`. A real choice resets the counter. Reaching 3 ends the battle as a forfeit (`reason: 'timeout'`).
- `recover()` re-arms every deadline with a **fresh full window**, so downtime never counts as a timeout.
- Each `request` event carries the deadline, so surfaces can show it as a Discord relative timestamp.
- Tests with the fake `Clock`/`Scheduler`: timeout → default move; three in a row → forfeit; the counter resets on a real choice; a press and a timer at the same moment resolve the request once; recovery gives a fresh window.

**Refs:** [25 § Timers](../architecture/concepts/25-arena.md#timers-and-ai-opponents), [25 § Ownership](../architecture/concepts/25-arena.md#ownership)

### M1-09 · Protocol → events, with Showdown's battle text
`Type: Feature` · `Parent: E-M1-3` · `Priority: P0` · `Size: M` · `Labels: area:battle` · `Blocked by: M1-05` · `agent-ready: yes` · `Owner: any`

**Summary:** Turn Showdown's protocol into a `TurnDigest` the renderers and the engine read: the turn's messages in plain language, and each side's state.

**Acceptance criteria**
- A `TurnDigest` per turn: `messages: string[]` rendered from Showdown's text templates (`data/text`, the ones the Showdown client uses), and per side the active Pokémon's species, nickname, level, HP (current/max, from the owning side's request, as a percentage for the opponent's), status, and stat stages.
- Structured events alongside the text (`move`, `miss`, `crit`, `effectiveness`, `damage`, `faint`, `switch`, `status`, `item`) for the engine to react to later (EXP on `faint` in M5). Each carries the side, species, nickname, and, where relevant, the move and its type, the status, and the item, plus the Pokémon's instance ID when it has one (adventure battles), so flavor can be added later without changing the events ([29](../architecture/concepts/29-flavor-text-and-prose.md#mvp-hooks-recommended)).
- The text rendering takes a locale parameter (only `en` for now), so Showdown's localized battle templates can be used later ([30 § Showdown's translations](../architecture/concepts/30-internationalization-readiness.md#showdowns-translations)).
- Never hand-written message strings and never a second copy of battle state ([26 § Battles](../architecture/concepts/26-discord-surface-and-ux-patterns.md#battles)).
- Golden tests over recorded protocol: a super-effective hit, a miss, a critical hit, a status move, a faint and switch, and a Gen 1 battle (Gen 1 text differs).

**Refs:** [26 § Battles](../architecture/concepts/26-discord-surface-and-ux-patterns.md#battles), [14](../architecture/concepts/14-battle-system-and-showdown.md)

### M1-10 · Battle view builders (Discord)
`Type: Feature` · `Parent: E-M1-3` · `Priority: P0` · `Size: M` · `Labels: area:bot` · `Blocked by: M1-09, M0A-20` · `agent-ready: yes` · `Owner: junior`

**Summary:** Pure functions from a `BattleView` (built from a `TurnDigest` plus match info) to Components v2 JSON. M2's public message, private prompts, and PvAI screens all use them; so do adventure battles later.

**Acceptance criteria**
- `renderBattle(view)`: the turn's messages, then both active Pokémon with level, HP bar, and status, each with its sprite as a separate image (section thumbnails or a media gallery, from `resolveSpriteUrl`, M0A-20; the player's side faces back, the opponent's front; the Arena uses the format's generation), and the deadline when there is one.
- A Pokémon with no resolvable sprite (`resolveSpriteUrl` returns `null`), or a region in text mode, is shown by name and type instead of an image.
- `renderChoicePrompt(request)`: moves (with PP, type, and disabled moves explained, not just greyed out) and switches, as buttons or a select.
- `renderBattleResult(result)`.
- No I/O. Snapshot tests for each, including a fainted active, a forced switch, and a long message list that stays within the Components v2 budget ([26 § Dialogue and passages](../architecture/concepts/26-discord-surface-and-ux-patterns.md#dialogue-and-passages)).
- A reserved flavor section under the turn's messages, empty in the MVP, so flavor (a fast follow) is a new section rather than a re-layout ([29](../architecture/concepts/29-flavor-text-and-prose.md#4-battles-log-and-flavor-are-separate-layers)).
- A composed side-by-side image is post-MVP, not here.

**Refs:** [26 § Battles](../architecture/concepts/26-discord-surface-and-ux-patterns.md#battles)

## E-M1-4 · Teams & Formats
`Type: Epic` · `Priority: P0`

User-owned team presets and server-scoped formats, with Showdown's validator enforcing legality ([25 § Teams](../architecture/concepts/25-arena.md#teams-decided-oct-2026-q12), [25 § Arena formats](../architecture/concepts/25-arena.md#arena-formats-decided-oct-2026-server-scoped-not-region-scoped)). The guided team builder follows the Arena launch and isn't drafted here.

### M1-11 · `PokemonSet` type and `TeamPreset` model
`Type: Task` · `Parent: E-M1-4` · `Priority: P0` · `Size: S` · `Labels: area:shared-models` · `Blocked by: —` · `agent-ready: yes` · `Owner: any`

**Acceptance criteria**
- A shared `PokemonSet` type and Zod schema in Showdown's set shape (species, name, item, ability, moves, nature, EVs, IVs, level, gender, shiny, happiness), accepting canon IDs and `<publisherId>:<slug>` library IDs. The same type adventure Pokémon convert to later.
- `TeamPreset { userId; name; intendedFormat?; sets: PokemonSet[] }` (Zod + Mongoose, model conventions as in E-M1-2), owned by the user and usable on any server.
- A team service: create, rename, update, delete, list by user. Only the owner can change a team. A cap of **50 teams per user**, enforced with a clear error.
- Tests: the cap, ownership checks, and schema round-trips.

**Refs:** [25 § Teams](../architecture/concepts/25-arena.md#teams-decided-oct-2026-q12)

### M1-12 · `ArenaFormat` model and built-in formats
`Type: Feature` · `Parent: E-M1-4` · `Priority: P0` · `Size: M` · `Labels: area:battle, area:shared-models` · `Blocked by: M1-05, M1-11` · `agent-ready: no` · `Owner: senior`

**Summary:** Formats decide which teams are legal and how battles run. They compile to Showdown custom formats so `TeamValidator` and the battle enforce them.

**Acceptance criteria**
- `ArenaFormat` as in [25](../architecture/concepts/25-arena.md#arena-formats-decided-oct-2026-server-scoped-not-region-scoped) (`serverId | 'builtin'`, `pool`, `bans`, `rules`). Never references a region's deployment.
- `compileFormat(format) → Showdown format` (mod, rule table, bans, team size, level).
- Built-in formats seeded and available on every server: **National Dex Lv50** and **Kanto 151 Lv50** (Gen 1 mechanics), each in singles; National Dex also in doubles. Flat Lv50 (teams auto-adjusted to 50), standard clauses (Species, Sleep, OHKO, Evasion, Endless Battle), team preview where the generation has it, and the 90s timer.
- Server formats with **canon pools** (generations, tiers, include/exclude, bans) can be created by server admins through a format service with role checks. Pools using library content are rejected with "needs custom content support" until E-M1-1's isolated dexes land.
- Tests: each built-in compiles and validates a known legal team; a banned move, an out-of-pool species, and a duplicate species each fail with the right reason.

**Changes later:** library pools compile into isolated dexes with E-M1-1; the admin UI for server formats is a follow-up (format editing isn't part of the launch scope).

**Refs:** [25 § Arena formats](../architecture/concepts/25-arena.md#arena-formats-decided-oct-2026-server-scoped-not-region-scoped), [27](../architecture/concepts/27-server-content-library-and-overrides.md)

### M1-13 · Showdown paste import and export
`Type: Feature` · `Parent: E-M1-4` · `Priority: P0` · `Size: M` · `Labels: area:bot, area:battle` · `Blocked by: M1-11` · `agent-ready: yes` · `Owner: junior`

**Acceptance criteria**
- `importPaste(text) → { sets, problems }` and `exportPaste(sets) → text` using Showdown's `Teams.import` / `Teams.export`. Unknown species, moves, items, or abilities are reported per Pokémon with the offending line, instead of being dropped silently.
- A paste round-trips (import → export → import gives the same sets).
- In the `/arena` hub (FlowCord): "Import team" opens a modal (name + paste); "Export" shows the paste in a code block. The modal's 4,000-character limit fits a six-Pokémon paste; longer input gets a clear error.
- Tests with real pastes, including nicknames, gender, shiny, and Gen 1 sets with no ability or item.

**Refs:** [25 § Teams](../architecture/concepts/25-arena.md#teams-decided-oct-2026-q12)

### M1-14 · Team validation messages and random legal teams
`Type: Feature` · `Parent: E-M1-4` · `Priority: P0` · `Size: M` · `Labels: area:battle` · `Blocked by: M1-12` · `agent-ready: yes` · `Owner: any`

**Acceptance criteria**
- `validateTeam(sets, format) → { ok, problems: { slot, pokemon, message }[] }`, grouping `TeamValidator`'s output per Pokémon in plain wording ("Pikachu can't learn Surf in this format").
- `legalTeamsFor(userId, format)` lists the user's presets that pass, used by challenges ("no legal team for this format", M2-09).
- `randomLegalTeam(format, rng)`: a team of the format's size from its pool, each with a heuristic moveset from its learnset (prefer same-type attacks and coverage, at most one status move, no duplicates), and an ability and item where the generation has them. Always passes `validateTeam`.
- Tests: 100 seeded random teams for each built-in format all validate; the same seed gives the same team.

**Refs:** [25 § Timers and AI opponents](../architecture/concepts/25-arena.md#timers-and-ai-opponents)

## E-M1-5 · AI Players
`Type: Epic` · `Priority: P0`

AI sides that answer requests through the same `choose` a human uses ([14 § AI trainers](../architecture/concepts/14-battle-system-and-showdown.md#ai-trainers)). The Arena's PvAI difficulty is an AI profile; adventure trainers reuse the same profiles in M5.

### M1-15 · AI player interface and the `random` profile
`Type: Task` · `Parent: E-M1-5` · `Priority: P0` · `Size: S` · `Labels: area:battle` · `Blocked by: M1-05` · `agent-ready: yes` · `Owner: any`

**Acceptance criteria**
- `AiPlayer { profile; choose(request, view) → Promise<string> }`, attached to a side in `BattleSpec`. BattleService calls it on each request for that side and submits the result through `choose` with the request's `rqid`.
- `random`, built on Showdown's `RandomPlayerAI` logic, seeded from the battle seed so recovery replays the same AI choices.
- An AI side never has a timer.
- Tests: an AI-vs-AI battle finishes for every built-in format; replay after recovery gives the same choices.

**Refs:** [14 § AI trainers](../architecture/concepts/14-battle-system-and-showdown.md#ai-trainers)

### M1-16 · `basic` profile with damage calculation
`Type: Feature` · `Parent: E-M1-5` · `Priority: P0` · `Size: M` · `Labels: area:battle` · `Blocked by: M1-15` · `agent-ready: yes` · `Owner: any`

**Acceptance criteria**
- Picks the move with the highest expected damage against the current opponent using `@smogon/calc` (the generation from the format), never switches unless forced, and picks a sensible replacement after a faint (best expected damage against the opponent's active).
- Expected damage counts accuracy; status moves are used only when no attack does damage.
- Tests over fixed matchups: it picks Thunderbolt over Tackle against Gyarados, and Earthquake over Thunderbolt against Onix.

**Refs:** [14 § AI trainers](../architecture/concepts/14-battle-system-and-showdown.md#ai-trainers)

### M1-17 · Trainer item use for AI profiles
`Type: Feature` · `Parent: E-M1-5` · `Priority: P1` · `Size: S` · `Labels: area:battle` · `Blocked by: M1-16, E-M1-1 (external choice hook)` · `agent-ready: yes` · `Owner: any`

**Summary:** Not needed for the Arena (Arena teams carry no bag); needed for adventure trainers in M5.

**Acceptance criteria**
- Every profile except `random` uses a trainer party's `items`: a healing item when the active Pokémon's HP is low, or a status cure for a status it cures, submitted through the external choice hook. Counts are tracked per battle.
- Tests: a trainer with two Potions uses them at low HP and stops when they run out.

**Refs:** [14 § AI trainers](../architecture/concepts/14-battle-system-and-showdown.md#ai-trainers), [11](../architecture/concepts/11-npcs-trainers-and-battle-definitions.md)

### M1-18 · `smart` profile
`Type: Feature` · `Parent: E-M1-5` · `Priority: P1` · `Size: L` · `Labels: area:battle` · `Blocked by: M1-16` · `agent-ready: no` · `Owner: senior`

**Summary:** Type-aware switching and sensible status moves, for gym leaders, rivals, and the Arena's harder difficulty. The Arena can launch with `random` and `basic` if this isn't ready.

**Acceptance criteria**
- Switches out of a bad matchup when a teammate resists the opponent's likely attack and threatens it back (with a cap on consecutive switches so it doesn't loop).
- Uses status and setup moves when the opponent isn't already statused and the AI isn't threatened with a KO this turn.
- Beats `basic` in a majority of seeded AI-vs-AI battles across the built-in formats (a test with a fixed seed set; the threshold is recorded in the test).

**Refs:** [14 § AI trainers](../architecture/concepts/14-battle-system-and-showdown.md#ai-trainers)
