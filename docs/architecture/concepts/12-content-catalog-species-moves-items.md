# 12: Content Catalog: Species, Moves, Learnsets, Items

> **TL;DR:** The **catalog** is the canon game data every region shares: species, moves, learnsets, and items. It's imported into MongoDB from a pinned Showdown version as a **catalog version**, with per-generation data, keyed by Showdown ID. Showdown stays the **battle engine**: it receives assembled data per battle and runs all move behavior. Everything else reads resolved, single-generation views (`resolveMove`, `resolveLearnset`). **ItemDefinition** adds overworld behavior that Showdown items lack, and **TM/HM lists** are per-region. Custom content and overrides are a separate layer on top: the server content library ([27](27-server-content-library-and-overrides.md)).

**MVP impact:** High · **Cost to change later:** Medium

## Current shape
- `DexEntry` (Mongo, ~global): mirrors many Showdown species fields plus `catchRate`, `expYield`, `evYields`, `expGrowth`, `baseHappiness`, `hatchCycles`, `sprites`, `isCanon`, `isPublic`, `originServer`, and ref-ified evo links (`{id, name}`).
- `Region.pokedex` slots reference DexEntry ObjectIds plus included forms.
- No items, moves, or TM models. The Region menu has "Moves" as a placeholder.
- The Showdown fork still carries 10 New Logora custom moves in base data files (the species were already reverted; see [14](14-battle-system-and-showdown.md#what-master-changes-vs-upstream-13-files-52793)).

## Layering (revised Oct 2026)

**Correction:** species, **moves, and learnsets must all live in the DB catalog**, not only in Showdown's code:
- Admins override canon Pokémon and write **custom learnsets**.
- Players need **move details** (power, accuracy, PP, type, category, effect text) to understand their moves.
- Moves are **assigned to TMs/HMs** per region.
- Piecemeal rules pick move data and learnsets **per generation**.

Showdown stays the **battle executor**. The DB is the **catalog of record** that authoring, display, validation, and the isolated custom-data dex all read from.

```
Layer 0  Canon import (from Showdown's dex + gen mods, pinned version) → seeds Layer 1; re-run on Showdown upgrades
Layer 1  Global catalog (Mongo)    → SpeciesDefinition (stats, types, sprites, catch rate, EXP yield/growth…),
                                     MoveDefinition (per-gen data + description text), Learnset (per species, per gen sources),
                                     ItemDefinition (pocket, price, field/battle use), AbilityDefinition (later gens)
Layer 2  Server content library    → original + linked entries (species, forms, learnsets, later moves/items/abilities); owned by the server
Layer 3  Region content (release)  → regional dex order, TM/HM list (TM slot → move), shop prices, item availability, starters, rules
Battle   Per release/format: assemble Layers 1–3 (+ chosen generations) → isolated Showdown dex injection
```

- **Per-generation data:** a `MoveDefinition` holds a base record plus per-gen overrides (e.g. Bite: Normal in Gen 1, Dark from Gen 2). Learnsets keep Showdown's per-gen source codes (`1L15`, `1M`, …), so `rules.data.learnsets: 'gen1'` filters to Gen 1 sources. Species stats follow the same pattern.
- **Overrides and custom content** (species, learnsets, moves) are server library entries layered on the catalog, never edits to it ([27](27-server-content-library-and-overrides.md)).
- **TMs/HMs:** a region's TM/HM list maps machine slots to `MoveId`s. Compatibility comes from the (possibly overridden) resolved learnset's `machine` list (see [TM/HM lists](#tmhm-lists-decided-oct-2026)).
- **Showdown upgrades:** re-run the canon import, then diff. Changes to canon data reach regions at their next publish (releases pin catalog versions, see [Catalog versions](#catalog-versions-decided-oct-2026)).

## Catalog versions (decided Oct 2026)
Every catalog import is a **catalog version**, and every catalog record says which one it came from:

```ts
CatalogVersion { _id: string;                 // e.g. 'cat-2026-10-31-1'
                 showdownVersion: string;     // the exact Showdown package version imported
                 importedAt: Date;
                 notes?: string;              // our own import fixes (e.g. the Unown ID correction) that don't change Showdown's version
                 counts: { species: number; moves: number; learnsets: number } }
MoveDefinition / Learnset / SpeciesDefinition { …; catalogVersion: string }
```

**Why it matters (more than auditing):**
1. **Catalog and battle engine stay in sync.** Players see catalog data (Thunderbolt: 90 power) while Showdown runs the battle. If a move changed upstream between the import and the Showdown version the bot runs, the screen and the battle disagree. At boot, the game host compares the installed Showdown version with the latest catalog version's `showdownVersion` and warns on a mismatch.
2. **Releases pin it.** A published release ([01](01-content-vs-state-and-publishing.md)) must keep meaning the same thing after a re-import. Each release records the `catalogVersion` it was validated against and **embeds the catalog data it uses** (the resolved species, moves, and learnsets its rules select), so a release is self-contained. That also keeps battle recovery deterministic: replaying a battle's input log uses exactly the data the battle started with.
3. **Overrides can merge upgrades.** A linked override (a tweaked Thunderbolt, a custom learnset) records the catalog version it patched **and a snapshot of that base**, so a new import can be merged in three ways rather than overwriting anyone's changes ([27 § Upgrades](27-server-content-library-and-overrides.md#base-snapshots-and-upgrades)). Snapshots mean old catalog versions never need to be kept around.
4. **Partial imports are caught.** A failed or half-finished import is visible (records with different `catalogVersion`s), and a CI check can require every catalog record to share one.
5. **Support and debugging.** "Why does this move say X?" traces to a specific Showdown release and import.

**Rules:**
- The live catalog collections hold the **latest** import only. Older versions live on only where something needs them: inside releases (embedded data) and inside linked overrides (base snapshots).
- A new import never changes a published region. The region picks it up at its next publish, and the publish review lists what the catalog changed for the species and moves the region uses ([16](16-authoring-validation-and-portability.md)).

## Species (canon)
- **Today:** canon species live in `DexEntry`, which mirrors Showdown's species fields and adds what Showdown lacks (catch rate, EXP yield, EV yields, growth rate, base happiness, hatch cycles, sprites). Later it becomes `SpeciesDefinition`, imported per catalog version like moves.
- **Identity:** `speciesId` (renamed from `showdownName`, [#120](https://github.com/pokesandbox/pokesandbox/issues/120)) is the Showdown ID and the only way anything refers to a species. It's unique among canon entries; library overrides and imports share species IDs by design ([27 § Identity and uniqueness](27-server-content-library-and-overrides.md#identity-and-uniqueness)).
- **Per generation:** `DexEntry.baseStats` holds current-generation stats only. Gen 1's single Special stat and other per-gen stat changes come from the species import, with the same base + per-gen differences pattern as moves (`rules.data.speciesStats`, [18](18-rules-time-and-randomness.md)).
- **Forms and variants** that a server adds (a "Surfer" Pikachu, a fakemon) are library entries, not canon ([27](27-server-content-library-and-overrides.md)).

## Moves: import and Showdown callbacks (decided Oct 2026)

### How Showdown stores per-generation moves
- Each generation is a **mod** (`data/mods/gen1` … `gen8`; base `data/` is Gen 9), chained through `scripts.ts`: `gen1` inherits `gen2`, which inherits `gen3`, up to base.
- A mod's data files hold only differences. When the Dex loads a mod (`ModdedDex.loadData()`), a **missing** entry is taken from the parent, an entry with **`inherit: true`** is merged with the parent's (child keys win), and **`null`** removes it.
- A mod's `scripts.ts` can also change data in code through `init()`. Gen 3's re-derives every move's category from its type (the pre-Gen 4 physical/special rule).
- Entries can contain **functions** (`onHit`, `basePowerCallback`, `onModifyType`, …). That's behavior, not data.
- Text lives in `data/text/moves.ts`, with per-gen blocks (`gen1: { desc, shortDesc }`).

### Import (M1)
1. Load the pinned Showdown version and, for each generation 1–9, its **resolved** Dex (`Dex.mod('genN')`, base for Gen 9). Never parse the raw files: resolution applies the inheritance merge and `init()`, so per-gen values (Gen 1 Bite is Normal; Gen 3 Shadow Ball is Physical) come out correct with no display-time logic.
2. Keep data fields only (type, category, base power, accuracy, PP, priority, target, flags, secondary effects, crit ratio, multi-hit, recoil/drain, …) and drop functions.
3. Store the Gen 9 record as `base` and each older generation's **differences** as `genOverrides[gen]`. `isNonstandard` is one of the data fields, so per-gen availability (`Past`, `Future`) comes along in the overrides.
4. Record **`hooks`** per generation: the names of the move's behavior callbacks (`['basePowerCallback', 'onModifyType']`). Just names, no code. The builder uses them to explain which fields an override can't change.
5. Text: `desc` and `shortDesc` as resolved by each generation's Dex (from `data/text/moves.ts`), stored in `text`, with older generations' differences in `text.genOverrides`.
6. Main-series mods only (`gen1`–`gen8` + base). Side mods (`gen1stadium`, `gen7letsgo`, `gen8bdsp`, …) are skipped for now; they're candidates for later rule presets. Output is deterministic (sorted keys) so a re-import after a Showdown upgrade is a readable diff.

```ts
MoveDefinition {
  moveId: MoveId;                 // unique; Showdown toID (the shared MoveId type also accepts publisher IDs, see 27)
  num: number; name: string;
  introducedGen: number;          // Showdown's `gen` field
  base: MoveData;                 // the resolved Gen 9 record (base Dex)
  genOverrides: Partial<Record<GenId, Partial<MoveData>>>;   // per resolved gen Dex, only the fields that differ from `base`
  text: {                         // from data/text/moves.ts, under Showdown's own field names
    desc: string; shortDesc: string;                          // Gen 9 text
    genOverrides?: Partial<Record<GenId, { desc?: string; shortDesc?: string }>>;   // e.g. gen1: { shortDesc: "10% chance to make the target flinch." }
  };
  hooks: Partial<Record<GenId, string[]>>;                    // names of behavior callbacks (basePowerCallback, onHit, …); no code
  catalogVersion: string;         // the import this record came from (see Catalog versions)
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
- **Battle message templates** in the same text file (`start`, `activate`, `end`, `damage`, …) aren't stored. The battle renderer reads them from Showdown at runtime ([26](26-discord-surface-and-ux-patterns.md#battles)); custom moves (post-MVP, [27](27-server-content-library-and-overrides.md#custom-moves-post-mvp-q28)) inherit their template move's messages.

### Behavior stays in Showdown
The catalog never replicates callbacks. At battle time the isolated custom-data dex is a child of the region's mechanics-gen mod, so canon moves keep Showdown's own callbacks, including that generation's versions.

Overrides and custom moves (a tweaked Thunderbolt, a fakemon's signature move) are publisher library entries layered on top; canon `MoveDefinition` documents never change for them. See [27](27-server-content-library-and-overrides.md).

## Learnsets & generation (decided Oct 2026)

### Canon: Showdown's source codes, one document per species
```ts
Learnset { speciesId: 'pikachu'; moves: Record<MoveId, string[]>;     // e.g. thunderbolt: ['9M', …, '1M'], thundershock: ['9L1', …, '1L1']
           catalogVersion }   // see Catalog versions
```
Each code is `<gen><method><detail>`: `1L15` = Gen 1 level-up at 15, `1M` = Gen 1 TM/HM, `2T` = Gen 2 tutor, `3E` = Gen 3 egg move, `4S0` = Gen 4 event (index into the species' event data), `7V` = Virtual Console transfer. One document holds every generation; the region's learnset policy (`RegionRules.data.learnsets`, [18](18-rules-time-and-randomness.md)) picks which one applies.

### Resolved learnsets: the shape everything else uses
Nothing outside the catalog reads raw codes. A learnset is first **resolved** for one generation into a simple, generation-free shape:
```ts
ResolvedLearnset {
  levelUp: { level: number; move: MoveId }[];   // sorted by level; a move can appear at several levels
  machine: MoveId[];                            // TMs/HMs
  tutor: MoveId[]; egg: MoveId[]; event: MoveId[];
}
resolveLearnset(learnset, gen) → ResolvedLearnset
```
Move display, trainer default movesets ([11](11-npcs-trainers-and-battle-definitions.md)), level-up move prompts, and TM/HM compatibility ([TM/HM lists](#tmhm-lists-decided-oct-2026)) all read the resolved form.

Learnset overrides and custom species' learnsets patch or replace this resolved form; see [27 § Learnsets](27-server-content-library-and-overrides.md#learnsets).

## Items
Showdown knows that Leftovers heal in battle. It doesn't know:
- what bag pocket an item belongs in
- what it costs or sells for
- that a Potion can be used from the bag outside battle
- that a Fire Stone evolves Vulpix
- what Repel and Escape Rope do
- that a Bicycle exists
- what TMs teach in *this* region

```ts
ItemDefinition {
  id: ItemId;                       // showdown id where one exists ('potion'), else custom ('x_bicycle')
  name; pocket: 'items' | 'medicine' | 'balls' | 'tms' | 'berries' | 'key' | string;
  buyPrice?; sellPrice?;            // region overlays override
  fieldUse?: Effect[] | FieldUseHandlerId;   // potion → heal target 20; rarecandy → levelUp; firestone → evolve
  battleUse?: BattleUseHandlerId;   // pokeball → catch(rate 1x); potion → heal (needs sim hook, see 14)
  holdable: boolean; consumable: boolean;
}
```

Machines (TMs/HMs) are region content resolved through `machine:<label>` item IDs, not items with a fixed move (see [TM/HM lists](#tmhm-lists-decided-oct-2026)).

## TM/HM lists (decided Oct 2026)
Machine numbering is per generation (Gen 1 TM01 is Mega Punch; Gen 2 TM01 is DynamicPunch), so a machine's move can't live on a global item. Machines are **region content** (Layer 3):

```ts
Region.moveMachines: { label: string;               // 'TM01', 'HM02'; unique within the region
                       kind: 'tm' | 'hm';
                       move: MoveId;
                       reusable: boolean }[]        // Gen 1: TMs single-use, HMs reusable
```
- **Bag items** for machines use a reserved item namespace, `machine:<label>` (e.g. `machine:tm24`), resolved through the region's list for display ("TM24 Thunderbolt") and use. One generic machine `ItemDefinition` (pocket `tms`, field use "teach") covers them all, so there are no per-region item documents.
- **Compatibility** ("can this Pokémon learn TM24?") comes from the region's learnset generation: Showdown's machine sources (`1M` = a TM/HM in Gen 1), plus additions in custom learnsets. The Kanto Classic list (numbering) comes from the template generator, since Showdown doesn't store TM numbers.
- **Validation:** labels unique, every move exists and is available in the region's move generation, and each machine has at least one compatible species in the regional dex (warning).

## Where canon data lives (decided Oct 2026)

The **DB catalog is the record** (see Layering above): canon data is imported from a pinned Showdown version into Mongo, and the import is re-run and diffed on Showdown upgrades. Showdown stays the battle executor and receives the assembled data per battle context. The alternatives considered were "Showdown canonical, Mongo only enriches" (rejected: admins need overrides, custom learnsets, TM assignments, and readable move details) and a third-party API at runtime (latency, rate limits, no custom content).

## MVP scope
- Reference species, moves, and items by Showdown ID. Rename DexEntry `showdownName` to `speciesId` and reference by it.
- `CatalogVersion`, `MoveDefinition`, and `Learnset` imported per catalog version; the catalog read service (`getMove`, `getLearnset` with `{ gen, region? }`).
- ItemDefinition for the Gen 1 item set (balls, medicine, repels, escape rope, stones, key items, the generic machine item) with field/battle handlers.
- Region TM/HM lists and the learnset policy.
- Not MVP: the server library (custom species UI, overrides, custom moves; see [27](27-server-content-library-and-overrides.md)). The isolated custom-data dex is also post-MVP (revised Nov 2026): Kanto Classic is pure Gen 1, which Showdown's own `gen1` mod covers, the MVP ships only the Classic Gen 1 preset (so no mixed-generation data), and the built-in Arena formats use Showdown's own formats. It arrives with custom content and mixed-generation rules.

## Open questions
- ~~What does `baseGeneration` control?~~ **Decided (Q26):** replaced by `RegionRules`; the default `10` is removed.
- **Localized names (later, Q38):** species, move, ability, and item names and descriptions in other languages are imported from Showdown's own `data/text/<lang>` (de, es, fr, it, ja, ko, zh-cn, zh-tw in current upstream; our fork gets them with the rebase, [pokemon-showdown#9](https://github.com/pokesandbox/pokemon-showdown/issues/9)). Custom library content is translated through `Translation` records ([30](30-internationalization-readiness.md)).
- ~~Sprite hosting?~~ **Decided (Q32):** the existing Imgur-hosted set behind a sprite-URL resolver, with Showdown's CDN as fallback.
- ~~Regional forms in MVP?~~ **Decided (Oct 2026):** the model supports them (pokedex slots already hold forms), but the builder doesn't offer them while a region's data rules are Gen 1. Kanto Classic doesn't need them, and many would fail Gen 1 type rules (no Dark, Steel, or Fairy).
