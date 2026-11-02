# 29: Flavor Text & Prose

> **Status: decided (Nov 2026, Q37).** Adopted as written, with the decisions listed at the end.

> **TL;DR:** PokeSandbox has three kinds of text, and they need different rules. **Authored prose** belongs to one piece of content (a script's passage, a location's description) and is written once. **Event flavor** is keyed by something that happens (a wild Pokémon appears, a move lands, your Pokémon faints, an evolution) and is picked at random from **pools**, with the most specific match winning (species, move, your side vs the opponent's, your starter). **System text** (the battle log, engine responses, explanations) is factual, fixed, and never replaced by flavor. One text type (`Passage`) is used for all authored text and flavor. Flavor comes in **layered packs**: a PokeSandbox canon pack, optional server packs, and the region's own entries, which a region can use wholesale, add to, or switch off. In battles, flavor is a **separate layer** from the Showdown battle log, and each region chooses log, flavor, or both.

**MVP impact:** Low: the MVP builds only the hooks (events carry what flavor needs; the battle view keeps a separate flavor slot; location descriptions are passages; `PokemonInstance.tags` is reserved) · **Cost to change later:** Medium if events are built without perspective and identities, low otherwise

## Inventory: where text exists today

### Authored prose (bound to one piece of content)

| Where | Field | Shape today | Concept |
|---|---|---|---|
| Script passages, `say`, choice prompts and option labels, `askName` prompt | steps | `Passage`; labels are strings | [07](07-scripts-triggers-and-events.md#passages-prose-and-dialogue-decided-oct-2026) |
| Location description and its conditioned variants | `description`, `descriptionVariants` | was string + `imageUrl`; `Passage` from the start (Q37) | [08](08-region-map-and-locations.md#descriptions-and-visits-decided-oct-2026) |
| First-visit arrival | a `once` `enterLocation` script | `Passage` | [08](08-region-map-and-locations.md#descriptions-and-visits-decided-oct-2026) |
| Edge labels ("Through the gate") | `edges[].label` | string | [08](08-region-map-and-locations.md) |
| NPC talk, post-defeat talk, gym leader intro/defeat lines | `interact` / `afterDefeat.interact` scripts; templates generate them | `Passage` | [11](11-npcs-trainers-and-battle-definitions.md) |
| Shop clerk | `clerk` NPC dialogue | script | [17](17-economy-shops-inventory.md) |
| Locked option text | `Gate.lockedText` | string | [05](05-requirements.md) |
| Progression and milestone descriptions | `description` | string | [04](04-progression-and-flags.md) |
| Region discovery description, pause message, release notes | `discovery.description`, `deployment.pauseMessage`, release notes | strings | [01](01-content-vs-state-and-publishing.md) |
| Explore asides (post-MVP) | one-time scripts | `Passage` | [10](10-encounters.md) |
| Species first sighting (post-MVP) | flavor entry `encounter.firstSighting`, edited from the regional Pokédex screen | `Passage` | [10](10-encounters.md#encounter-intros-decided-nov-2026-post-mvp-the-mvp-shows-the-default-line) |
| Move and item descriptions | catalog `text` | strings from Showdown | [12](12-content-catalog-species-moves-items.md) |

Player narration on the adventure log ([22](22-adventure-log-and-narration.md#narration)) is written by players, not authors, and is out of scope here.

### Event flavor (pooled, keyed by what happened)
Only one is planned so far: **encounter intros** (post-MVP, [10](10-encounters.md#encounter-intros-decided-nov-2026-post-mvp-the-mvp-shows-the-default-line)), with scene pools per location and method and species lines.

### System text (factual, fixed)

| Where | Example | Concept |
|---|---|---|
| Battle log | Showdown's own text templates ("It's super effective!") | [26 § Battles](26-discord-surface-and-ux-patterns.md#battles) |
| Engine responses | "Updated: that menu was out of date" | [26](26-discord-surface-and-ux-patterns.md#menus-and-feedback) |
| Condition explanations, preflight errors | "You need ₽500" | [05](05-requirements.md), [06](06-effects.md) |
| Reward lines | "You received a Potion!" | [06](06-effects.md) |
| Validator issues | Region Health messages | [16](16-authoring-validation-and-portability.md) |
| Adventure log entries | engine-written summaries | [22](22-adventure-log-and-narration.md) |
| Arena surface | "This isn't your battle" | [25](25-arena.md) |

### Gaps found
- **Route trainers have no intro or defeat lines.** "Bug Catcher Rick wants to battle!" / "I'm out of Pokémon!" exist only where a template generates a script. A trainer met through Explore or `onEnter` has nowhere to put its lines.
- **Text fields are inconsistent.** Location descriptions are strings plus an image URL, while scripts use `Passage`. Locations aren't built yet, so aligning them now is cheap.
- **Nothing happens between the facts.** Battles, evolutions, level-ups, catches, travel, and healing render only system text, so a text-first region has no way to make them feel like its own.

## Where flavor should be available (proposed catalog of flavor events)

Each event declares the **qualifiers** an entry can match on and the **placeholders** its text can use. The engine and BattleService already emit these events (or will, see [Hooks](#mvp-hooks-recommended)).

| Area | Events | Qualifiers (match on) |
|---|---|---|
| **Encounters** | wild appeared (scene + subject), first sighting, flee success / fail | method, location, species, level band, first sighting |
| **Battle: actions** | move used, move hit / missed, critical hit, super / not very effective, no effect, recoil, stat raised / lowered | side (own / opponent), species, move, move type, category |
| **Battle: state** | status inflicted / cured / damage tick (burn, poison, sleep, paralysis, freeze, confusion), weather | side, status, species |
| **Battle: Pokémon** | sent out, recalled (switch), fainted, low HP, last Pokémon standing | side, species, nickname set, Pokémon tags (starter, …), trainer, trainer class |
| **Battle: items** | item used in battle (potion, status cure, X item), ball thrown, ball shakes, caught, broke free | side, item, ball, species, shake count |
| **Battle: start and end** | trainer intro, trainer defeat line, victory, defeat, whiteout | trainer, trainer class, location |
| **Pokémon growth** | level up, move learned / forgotten, evolution start / complete / cancelled | species (from / to), Pokémon tags, method (level, stone, trade) |
| **Travel and places** | departing / arriving by Fly, ferry, or on foot; traversal safe step | network, method, from / to location |
| **Care and economy** | healed at a Pokémon Center, purchase, sale, reward received | location, NPC, item |
| **Trading** | trade complete, traded Pokémon arrives | species |

"Meaningful Pokémon" are matched through **Pokémon tags**: `starter`, `gift`, `traded`, `nicknamed`, plus custom tags set by a script effect (e.g. `tag: 'ss-anne-lapras'`). This needs a reserved `PokemonInstance.tags: string[]` ([13](13-pokemon-instances-and-trading.md)); `starter` can be derived from `met.method` plus the journey's starter choice.

## Recommended architecture

### 1. One text type: `Passage`
Every authored text longer than a label is a `Passage` ([07](07-scripts-triggers-and-events.md#passages-prose-and-dialogue-decided-oct-2026)): script steps, location descriptions and their variants, first sightings, and every flavor variant. Names, labels, and short one-line strings (gate `lockedText`, which also appears in select-menu descriptions) stay plain strings, translatable the same way ([30](30-internationalization-readiness.md)). One editor, one renderer, one placeholder system, one paging rule.

**Decided (Q37), pre-MVP:** location `description` and `descriptionVariants` are `Passage`s (one prose block plus an optional image block covers today's string plus `imageUrl`).

### 2. Flavor entries: pools with most-specific-match selection
```ts
FlavorEntry {
  key: ContentKey;
  event: FlavorEventId;                         // 'battle.fainted', 'pokemon.evolved', 'encounter.scene', …
  match?: {                                     // every field optional; the event declares which apply
    side?: 'own' | 'opponent';
    species?: SpeciesId[]; move?: MoveId[]; moveType?: TypeId[]; status?: StatusId[]; item?: ItemId[];
    method?: EncounterMethodId[]; location?: ContentKey[]; trainer?: ContentKey[]; trainerClass?: string[];
    pokemonTags?: string[];
    locale?: Locale[];                          // later: locale-only lines (wordplay that doesn't translate), see 30
    condition?: Condition;                      // anything else, through the condition system (05)
  };
  priority?: number;                            // only breaks ties between equally specific entries
  chance?: number;                              // 0–1, default 1: does flavor show at all this time (keeps frequent events fresh)
  combine?: 'extend' | 'replace';               // default extend: same event + same match as a lower layer's entry → add to its pool
  variants: { id: string; passage: Passage; weight?: number }[];   // weight: relative, default 1 (an even split); id: stable for picks and translations (30)
}
```
**How one event picks its text (three independent steps, so probabilities never add up across entries):**
1. **Which entry: no randomness.** Among entries whose `match` passes, the one with the most satisfied qualifiers wins, reusing the **most specific match** policy adopted for dialogue ([05](05-requirements.md)): "your starter fainted" beats "your Pokémon fainted" beats "a Pokémon fainted". Exactly one entry is chosen. Ties: higher `priority`, then the higher layer; any tie still left is flagged by the validator at publish (and resolved by key, so it's deterministic).
2. **Whether flavor shows: that entry's `chance`.** One roll against a single probability (default 1). If it fails, this event shows no flavor this time. It does **not** fall back to a less specific entry, so `chance` means exactly what it says.
3. **Which variant: relative weights.** Each variant's share is its weight divided by the pool's total weight; the default weight 1 makes an even split. Weights can't exceed 100% because they're shares, not probabilities. The pick uses the seeded `Rng` port ([18](18-rules-time-and-randomness.md#randomness)), so re-rendering a screen never swaps the text. Avoiding an immediate repeat is a later refinement.

**Layers combine per pool, not per probability.** When a higher layer has an entry with the same event and the same `match` as a lower layer's:
- `extend` (default): its variants join the lower entry's pool, and its `chance`, if set, **replaces** the lower one (it never adds to it). Example: canon's "your Pokémon fainted" has `chance: 0.6` and 5 variants; a region extends it with 1 variant at weight 1, so that line shows on 0.6 × 1/6 = 10% of your faints. At weight 5 it's 0.6 × 5/10 = 30%. Setting `chance: 1` on the region's entry makes every faint show flavor.
- `replace`: only the higher layer's variants (and chance) are used.
- An entry with a **different** `match` is a different entry; specificity decides between them, as in step 1.

**Variants aren't entries.** An entry says *when and where* (event, match, chance); variants say *what* (alternative wordings of the same moment). Making each variant its own entry would repeat the same `match` on every line and turn step 1 into a probability contest between equally specific entries, which is exactly what produces sums over 100%. The validator flags two entries in the same layer with identical event and `match` and offers to merge them.

**The builder shows the real odds.** Editing a pool shows each line's effective share across layers ("this line: 10% of your Pokémon's faints"), so authors never do the arithmetic.
- **Placeholders** are typed per event (`{pokemon}`, `{species}`, `{move}`, `{item}`, `{trainer}`, `{player}`, `{name:rival}`). The validator rejects a placeholder the event doesn't provide.
- **Encounter intros** ([10](10-encounters.md#encounter-intros-decided-nov-2026-post-mvp-the-mvp-shows-the-default-line)) become flavor entries for `encounter.scene`, `encounter.subject`, and `encounter.firstSighting`. The builder still edits them from the location and Pokédex screens; storage is uniform.
- **Trainer lines** become flavor entries for `battle.trainerIntro` / `battle.trainerDefeat`, matched on `trainer` (one specific trainer) or `trainerClass` (every Youngster). This closes the route-trainer gap without a new per-trainer field.

### 3. Layered packs
| Layer | Owner | Notes |
|---|---|---|
| **PokeSandbox canon pack** | the project, versioned in the repo like the Kanto Classic template ([16](16-authoring-validation-and-portability.md#official-templates-decided-oct-2026)) | Default pools for every event; CI checks placeholders. **Separate from the catalog version** (see below). |
| **Server packs** | a server, in its content library ([27](27-server-content-library-and-overrides.md)) | Reusable across the server's regions; could be shared like other library content later. |
| **Region entries** | the region | Most specific to the game; stored in the region's draft like any content. |

```ts
Region.flavor: {
  packs: { pack: 'canon' | LibraryPackRef; version: string; enabled: boolean }[];   // canon on by default; turn off to start clean
  // the region's own FlavorEntry records live with its other content
}
```
- A region can take canon **wholesale**, **add** to it (`combine: 'extend'`, the default), **override** specific events (`replace`), or **switch canon off** and use only its own.
- **The canon pack is not part of the catalog version.** The catalog ([12](12-content-catalog-species-moves-items.md)) is game data imported from Showdown, and its version tracks the import. The canon pack is writing the project authors, released on its own schedule with its own semantic version. A pack names the oldest catalog version it needs when it references specific moves or species, and the validator checks that against the region's catalog version.
- **Releases embed the resolved flavor** (pack versions pinned), like catalog data ([01](01-content-vs-state-and-publishing.md)), so a canon pack update never changes a live region until it republishes, and the publish review shows the diff.

### 4. Battles: log and flavor are separate layers
- **The battle log** is Showdown's text, unchanged: authoritative and factual ([26 § Battles](26-discord-surface-and-ux-patterns.md#battles)).
- **Flavor** is generated from BattleService's structured events ([#166](https://github.com/pokesandbox/pokesandbox/issues/166)) and rendered in its own visually distinct section (e.g. italic prose under the log), never mixed into log lines.
- **Region setting:** `RegionRules.presentation.battleText: { log: boolean; flavor: boolean }`, default both on. At least one must be on. Flavor-only suits heavy roleplay servers.
- **No lost facts with flavor-only:** HP, status, and level are always shown in the battle view, and any event that has no flavor variant falls back to its log line, so nothing that happened goes unreported.
- **Volume:** a per-turn flavor budget (e.g. at most three lines, prioritized: faint > catch > critical / effectiveness > status > move) plus per-entry `chance`, so long battles don't become walls of text.
- **Perspective:** `side: 'own' | 'opponent'` is relative to the viewer. Adventure battles have one viewer. In Arena PvP the public message is seen by both players and spectators, so it uses **neutral** entries only (no `side`), and side-specific flavor can appear in each player's private prompt.
- **Player preference (later):** a player can hide flavor for themselves, which also helps accessibility and fast play.

### Where flavor is picked (decided Nov 2026)
- **One pure resolver in `libs/core`:** `resolveFlavor(index, event, rng) → { entry, variantId } | null`. It has no I/O and knows nothing about regions or Discord.
- **Adventure:** the engine calls it with the region release's compiled flavor index, for engine events and for the battle events it receives from BattleService. `libs/battle` never resolves flavor (it knows nothing about regions).
- **Arena:** the Arena module calls it with an index compiled from the canon pack plus the server's packs, with a server-level setting `Server.settings.arena.battleText: { log; flavor }` (default both). The public message uses side-less entries only ([25](25-arena.md)).
- The seeded `Rng` for battle flavor derives from the battle seed and turn, so recovery and replays pick the same lines.

### 5. System text stays fixed
Engine responses, explanations, reward lines, and the battle log are never replaced by flavor. Flavor may **add** a line beside them ("You received a Potion!" plus "Mom tucked it into your bag with a note."). This keeps the game legible no matter how a region writes its flavor.

### 6. Where the data lives: embedded prose, standalone flavor
- **Authored prose is embedded.** A `Passage` is a plain value with no ID of its own, nested in the model that owns it (a script step, a location, a gate). It's read with its owner, published with it, and deleted with it. No references to manage.
- **Flavor entries are standalone records that point at what they're about**, through their `match` (species IDs, move IDs, location and trainer content keys). The things they describe never point back. That's the right direction because flavor is many-to-many and layered: one entry can cover a whole trainer class or every species, several layers can describe the same trainer, and canon packs describe content they've never seen. It also follows the no-back-references rule ([02](02-identity-and-references.md)): a trainer doesn't need editing when someone writes a line for it.
- **Storage:** region entries live with the region's other draft content (keyed by `regionId` + `ContentKey`); server packs live in the server's content library ([27](27-server-content-library-and-overrides.md)); the canon pack is a JSON bundle in the repo, installed on deploy like the Kanto Classic template.
- **Integrity:** an entry's `match` references are reported through `references()`, so deleting a location or trainer shows "used by 3 flavor entries" ([#143](https://github.com/pokesandbox/pokesandbox/issues/143)), and the validator flags dangling references and unknown placeholders.
- **The builder hides the indirection.** A trainer's screen shows a "Lines" tab listing the entries that match it (its own and its class's, with the layer each comes from); editing there creates or updates a flavor entry. The same goes for a location's "Encounter intros" and a Pokédex entry's "First sighting".

**Examples**

```ts
// 1. Authored prose: embedded in its owner
Location {
  key: 'loc-viridian-forest'; name: 'Viridian Forest';
  description: { blocks: [ { prose: 'Sunlight barely reaches the forest floor.' } ] };          // Passage
  descriptionVariants: [ { condition: { flag: 'rocket-forest-cleared' },
                           description: { blocks: [ { prose: 'Birdsong has returned to the trees.' } ] } } ];
}
ScriptStep { passage: { blocks: [ { line: { speaker: 'npc-oak', text: 'This is my grandson, {name:rival}.' } } ] } }

// 2. A specific trainer's lines, and a whole trainer class's fallback
FlavorEntry { key: 'fl-a1', event: 'battle.trainerIntro', match: { trainer: ['npc-bugcatcher-rick'] },
              variants: [ { passage: { blocks: [ { line: { speaker: 'npc-bugcatcher-rick', text: 'My Weedle will sting you!' } } ] } } ] }
FlavorEntry { key: 'fl-a2', event: 'battle.trainerIntro', match: { trainerClass: ['youngster'] },
              variants: [ { passage: { blocks: [ { prose: '{trainer} wants to battle!' } ] } },
                          { passage: { blocks: [ { prose: '{trainer} spots you from across the route.' } ] } } ] }

// 3. Fainting: generic, side-specific, and the starter
FlavorEntry { event: 'battle.fainted', match: { side: 'opponent' }, chance: 0.6,
              variants: [ { passage: { blocks: [ { prose: '{pokemon} crumples. The path ahead is yours.' } ] } } ] }
FlavorEntry { event: 'battle.fainted', match: { side: 'own' },
              variants: [ { passage: { blocks: [ { prose: '{pokemon} can\'t go on. You call it back gently.' } ] } } ] }
FlavorEntry { event: 'battle.fainted', match: { side: 'own', pokemonTags: ['starter'] },
              variants: [ { passage: { blocks: [ { prose: '{pokemon}, who has been with you since {name:player} left home, falls.' } ] } } ] }

// 4. Evolution: generic, one species, and the starter
FlavorEntry { event: 'pokemon.evolved', variants: [ /* canon: "What? {from} is evolving!" … */ ] }
FlavorEntry { event: 'pokemon.evolved', match: { species: ['magikarp'] },
              variants: [ { passage: { blocks: [ { prose: 'The water explodes. Where a Magikarp flopped, a Gyarados roars.' } ] } } ] }
FlavorEntry { event: 'pokemon.evolved', match: { pokemonTags: ['starter'] }, combine: 'extend', variants: [ /* … */ ] }

// 5. Encounter intro scene for one location's surfing, and a species first sighting
FlavorEntry { event: 'encounter.scene', match: { location: ['loc-seafoam'], method: ['surf'] }, variants: [ /* … */ ] }
FlavorEntry { event: 'encounter.firstSighting', match: { species: ['ps:frostfang'] },
              variants: [ { passage: { blocks: [ { prose: 'A wolf of blue ice pads out of the mist.' },
                                                 { image: { url: 'https://…/frostfang.png' } } ] } } ] }

// 6. The region's pack settings
Region.flavor: { packs: [ { pack: 'canon', version: '1.2.0', enabled: true },
                          { pack: { libraryId: 'lib-…', key: 'spooky-pack' }, version: '3', enabled: true } ] }

// 7. "Meaningful Pokémon" tags (reserved)
PokemonInstance { …; tags: ['starter'] }          // or a script effect: { type: 'tagPokemon', target: 'lastReceived', tag: 'ss-anne-lapras' }
```

**At runtime.** Publishing compiles every enabled layer into one index in the release, keyed by event (`battle.fainted` → its candidate entries, already ordered by layer), so lookups don't touch the database. The engine or BattleService emits a fact event; the resolver filters the candidates by `match`, takes the most specific, rolls `chance`, and picks a variant with the seeded `Rng`. The chosen text rides on the event, so renderers stay pure and a re-render shows the same line:

```ts
{ type: 'battle.fainted', side: 'own',
  pokemon: { instanceId: 'pk-…', species: 'charmander', nickname: 'Ember', tags: ['starter'] },
  flavor?: { entry: 'fl-…', variantId: 'v3' } }
```
The event carries a **reference**, not the text: the presentation layer resolves it to a `Passage` in the viewer's language (source text, or a translation from the release) before the pure view builders run, so two viewers see the same pick in their own words ([30](30-internationalization-readiness.md)). In a battle the log line ("Ember fainted!") is rendered from the same event by Showdown's text, separately from `flavor`.

## MVP hooks (recommended)
Nothing in this doc is MVP content, but these keep it cheap to add:
- **Events carry identities and perspective:** BattleService's structured events ([#166](https://github.com/pokesandbox/pokesandbox/issues/166)) include side, species, move, item, status, and the acting Pokémon's instance ID (adventure) so later flavor can resolve tags. Engine events for evolution, level-up, catch, travel, and healing carry the same.
- **The battle view keeps a flavor slot** (empty in the MVP), so adding flavor is a new section, not a re-layout ([#167](https://github.com/pokesandbox/pokesandbox/issues/167)).
- **Location descriptions are `Passage`s** from the start (CP0a, CP1).
- **`PokemonInstance.tags`** is reserved ([13](13-pokemon-instances-and-trading.md)).
- **`Region.flavor` and `FlavorEntry`** are reserved names only; no storage or UI in the MVP.

## Writing the canon pack
- **Volume is large** (dozens of events, several variants each, own/opponent splits). It's written incrementally: battle basics and encounters first, then growth, travel, and care.
- **Tone:** neutral and faithful to the games' voice, so it suits most regions; servers add personality on top.
- **Drafting:** AI-assisted drafts reviewed by people are reasonable for volume, with every line human-approved before it ships, because it's what most players will read.

## Decisions (Nov 2026, Q37)
1. **Adopted:** three kinds of text; `Passage` for all authored text and flavor; flavor entries with most-specific-match and the three-step selection (`chance`, relative weights, `extend` by default); layered packs versioned separately from the catalog. **Encounter intros are flavor entries** ([10](10-encounters.md#encounter-intros-decided-nov-2026-post-mvp-the-mvp-shows-the-default-line)).
2. **Location `description` and `descriptionVariants` are `Passage`s from the start** (pre-MVP), so the architecture is right before anything is built on it ([08](08-region-map-and-locations.md)).
3. **Battle text setting per region, default both** (log and flavor). Flavor-only is for regions that want it, mostly heavy roleplay servers; the fallback rule (events without flavor show their log line; HP and status always visible) applies there.
4. **Arena PvP:** the public battle message uses only flavor entries without `side`; side-specific flavor appears in each player's private prompt ([25](25-arena.md)).
5. **Canon pack v1 is a fast follow to the MVP** (trainer lines are MVP, see MVP scope): Gen 1 battle flavor for moves and statuses. After that, **each new generation's content ships with its flavor** in the same release.
6. **`PokemonInstance.tags` is reserved now** ([13](13-pokemon-instances-and-trading.md)).
7. **Ready for translation** (Nov 2026, Q38): variants and passage blocks have stable IDs, events carry `{ entry, variantId }`, and translations are separate records ([30](30-internationalization-readiness.md)).

## MVP scope
- **Trainer lines are MVP (decided Nov 2026)**, to replicate the Gen 1 games: every trainer has its own pre-battle and defeat lines, as in RBY. The MVP ships a minimal slice of the flavor system for exactly two events, `battle.trainerIntro` and `battle.trainerDefeat`: `FlavorEntry` storage in the region layer only, the resolver (match on `trainer`, then `trainerClass`, then the built-in default line), and the trainer screen's "Lines" tab. No packs, no `chance` (always shown), no battle text setting. A trainer's later talk text stays its `afterDefeat.interact` script ([11](11-npcs-trainers-and-battle-definitions.md)). Kanto Classic's lines come from the generator (pret/pokered's text, [16](16-authoring-validation-and-portability.md#official-templates-decided-oct-2026)).
- Everything else in this doc is post-MVP. The MVP builds the hooks listed in [MVP hooks](#mvp-hooks-recommended): identities and perspective on battle and engine events, a reserved flavor slot in the battle view, location descriptions as passages, and `PokemonInstance.tags`.
- Fast follow: the remaining flavor events, `Region.flavor` and packs, `RegionRules.presentation.battleText`, and canon pack v1 (Gen 1 move and status battle flavor).
