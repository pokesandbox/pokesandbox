# 10: Wild Encounters

> **TL;DR:** Turn the hardcoded `encounterType` enum into a **region-configurable method registry** (grass, cave, surf, rods, headbutt, rock smash, …), each with its own `condition` (e.g. Surf needs the move plus a badge), Discord button label, and Explore outcome table. Generalize `timeOfDay` blocks into **conditioned tables** (time, flags, progression, weather, swarms). Move static/gift Pokémon to scripts.

**MVP impact:** High (it's the core loop) · **Cost to change later:** Medium

## Current shape (built)

```ts
wildTables: {
  encounterType: 'grass' | 'surf' | 'old_rod' | 'good_rod' | 'super_rod' | 'rock_smash' | 'gift',
  timeBlocks: { timeOfDay: 'morning' | 'day' | 'evening' | 'night' | 'any', slots: { speciesId: ObjectId, minLevel, maxLevel, weight }[] }[]
}[]
```

## Gaps

| Gap                                     | Example                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Hardcoded methods                       | Headbutt (Gen 2), Dark grass (Gen 5), Hordes (Gen 6), SOS (Gen 7), overworld-visible spawns (LGPE/SwSh/SV)                                     |
| `gift` isn't a wild method              | Gifts are scripts with `givePokemon`                                                                                                           |
| Time is the only variant axis           | Swarms (flag/daily), post-game tables (milestone), weather (Gen 8), Pokéradar, version-exclusive tables (choice!), radio station music (Gen 2) |
| No encounter rate per method            | What share of Explore presses find a wild Pokémon vs a trainer or item (and whether Repel suppresses it)                                       |
| No per-slot form/gender/shiny/held-item | Wild Pikachu holding a Light Ball. Alolan forms.                                                                                               |
| Species by ObjectId                     | See [02](02-identity-and-references.md)                                                                                                        |

## Design

```ts
// Region-level registry (with canon defaults seeded)
EncounterMethod { id: 'grass' | 'surf' | 'old-rod' | string; name; label; icon?; condition?: Condition; outcomes: OutcomeRow[]; repelAffected: boolean }
// label is the Discord button text ("Walk in the grass"); outcomes is the region's default Explore outcome table (see Decisions)

// Location-level
EncounterTable {
  method: EncounterMethodId;
  condition?: Condition;            // time of day, flags, milestones, choice, weather…
  priority?: number;                // first matching table per method wins (swarm table > default)
  slots: { species: SpeciesId; form?; minLevel; maxLevel; weight; heldItem?: { item, chance }[]; shinyRateMultiplier? }[];
}
```

`timeOfDay` stays as a _condition predicate_ (`{ type: 'time', of: ['night'] }`), so it composes with everything else.

### Encounter loop (game-dev)

Options for how wild encounters trigger in a text game:

1. **On-demand "Explore" button** per method (Walk in grass / Fish with Old Rod / Surf): roll the method's outcome table, then a slot. Simple, player-paced, grindable.
2. **On traversal**: moving along a route rolls encounters (adds tension, slows travel).
3. **Visible spawns**: show 3 Pokémon "in the grass" and the player picks one to engage (modern feel, reduces RNG frustration, great for Discord).

**Decided (Q3):** (1) for MVP, plus a **Repel** status (N explores without encounters below the lead's level). Design the resolver so (3) is a later presentation over the same tables.

### Static & special encounters

Snorlax, legendaries, Electrode "items", and Voltorb traps are **scripts** with `wildBattle` steps, gated by flags. They're not table entries.

## Decisions (Oct 2026, Q3)

### Explore is the core loop, and it always finds _something_

MVP uses **Explore buttons per method** ("Walk in the grass", "Fish", "Surf"). A press never yields "nothing happened". It rolls a location's **explore outcome table**:

```ts
OutcomeRow = { kind: 'wild' | 'trainer' | 'item'; percent: number }   // percents in one table sum to exactly 100
EventRow   = { kind: 'event'; trigger: ContentKey; percent: number }   // location level only: a chance Explore trigger (07)

Location.explore: Record<EncounterMethodId, {
  outcomes?: (OutcomeRow | EventRow)[];   // absent: the method's region default table; present: this location's customized copy
  tables: EncounterTable[];               // the wild slots for this method
}>;
Location.hiddenItems?: HiddenItem[];      // see Hidden items below
// POST-MVP: { kind: 'aside' } rows, one-time flavor scripts (see below)
```

- Exhausted rows drop out and the remaining rows renormalize (revised Nov 2026, see below).
- **Asides (post-MVP):** short one-time scripts in place of "nothing happened". A description of the area, a cute or eerie moment, a fleeting NPC. Ordinary scripts with `once`, authored per location. They make the region feel alive without wasting the player's time.
- Repel suppresses only `wild` outcomes below the lead's level.

### Explore outcome tables (decided Nov 2026, revised)

From the authoring mockups ([#250](https://github.com/pokesandbox/pokesandbox/issues/250)). This replaces the earlier `rate` + `otherOutcomes` design.

- **The player picks the method.** Each method is its own Explore button, labeled with `EncounterMethod.label` ("Walk in the grass", "Fish", "Surf"). A button shows only when the location has that method, the method's condition passes, and something in its table is still available.
- **Each method has an outcome table:** rows of Wild Pokémon, A trainer, or A hidden item, each with a percent. Rows sum to exactly 100; anything else is a validator error and the builder blocks saving. Editing one row never changes another. Any row can be removed, but a table keeps at least one. Canon defaults (placeholders until the bundle generator tunes them): grass Wild 70 · Trainer 20 · Item 10; cave 60 · 25 · 15; Surf Wild 95 · Item 5; the rods Wild 100.
- **Look around** is a seeded method with no requirement and no wild row (Trainer 50 · Item 50), not affected by Repel. It's how towns and buildings offer hidden items. Adding a hidden item to a location where no method has an item row offers to add it.
- **Running out:** a row whose supply is used up at this location (every `onExplore` trainer beaten, every hidden item unavailable, a `once` event done) drops out and the rest renormalize. Within a trainer or item row the pick is uniform among those still available, using the action's seeded `Rng`. A method with nothing left hides its button, so a press always finds something.
- **Locations customize a table** by copying the region default (`Location.explore[method].outcomes`); the builder shows "Customized" with Reset to region default. A customized copy doesn't follow later changes to the default. **Event rows** (chance Explore triggers, [07](07-scripts-triggers-and-events.md)) exist only at location level; region- or server-wide event rows are post-MVP.
- **Repel** affects only the wild row.
- **No default method.** A location has no Explore at all until it has a method. So an author never has to remove a default.
- **Validator:** errors for an `onExplore` trainer or a hidden item at a location where no method has a trainer or item row, and for a chance event with no row. Deleting a method lists the locations using it and removes their tables for it.
- **Builder:** the location's **Explore** tab shows, in order: method tabs with the selected method's outcomes, requirement and tables; "Also found by exploring here" (read-only counts of trainers, hidden items, Explore events and traversal costs, each linking to where it's edited); Hidden items; Traversal costs. Methods are edited in Settings → Encounter methods (label, icon, outcome table, requirement, Affected by Repel, "Used by N locations"); custom methods work like seeded ones.

### Hidden items (decided Nov 2026)

```ts
HiddenItem {
  key: ContentKey;
  item: ItemId;                 // TMs included (machine:<label>)
  quantity: number;
  condition?: Condition;
  renew?: { every: number; unit: 'hours' | 'days' };   // absent: once per journey
}

Journey.pickups: Record<ContentKey, { foundAt: Date }>   // replaces the pickup:<key>:taken flag (04)
```

- A hidden item is an Explore outcome while it's **available** to that journey: its condition passes, and it hasn't been found, or `renew` is set and `now ≥ foundAt + every`. Each journey has its own timer.
- The check reads the injected `Clock` when Explore is pressed. Nothing runs on a timer, so no battle lease is involved ([15](15-persistence-concurrency-and-runtime.md)).
- The server picks the cadence, with no minimum or maximum. Region Health shows an info item when a sellable item renews more often than once a day.
- Removing a hidden item asks first. Players who already found it keep what they got.

### Traversal requirements (MVP, decided Oct 2026)

Authors can make moving through a location cost something. Explore presses are how players pay it. Two kinds of cost, which can be combined:

- **One-time route costs** (first pass only), e.g. the unavoidable trainers on a route, or "fight 5 wild Pokémon your first time through".
- **Permanent minimum costs** (every pass), e.g. caves you can't cross without walking through them, unlike grass routes you can skirt.

```ts
// Revised Nov 2026: costs are per exit, and first-time and every-time costs are separate entries
Location.traversal?: {
  key: ContentKey;
  when: 'first' | 'every';      // first: must be met once per exit, then never again; every: on each pass
  exits: ContentKey[];          // the gated outgoing edges; one cost can cover several exits
  rule: Condition;              // restricted to the traversal facts below; no `not`
}[];
```

- **First-time rows:** beat these named trainers (`trainers.defeated`), N wild battles, N explores (lifetime counters at this location).
- **Every-time rows:** N explores, or N encounters (per-visit counters). An encounter is a wild roll, including one a Repel turned into a safe step. The old `trainerBattles` count is dropped: trainers are always named.
- Rows combine with All of / Any of and one level of groups (the rule-group editor, [05](05-requirements.md)), each row type at most once per cost.
- An exit belongs to at most one first-time and one every-time cost (validator error otherwise). The builder's "Edit just this exit" splits an exit off into its own copy of a cost.

**Why permanent costs count explores, not battles:** a Repel should still help in caves, as in the games. With a Repel active, an explore press that would have rolled a weak wild Pokémon resolves as a **safe step** ("You press deeper into the cave…"). It still counts toward every-time explores and encounters, but no battle happens. If permanent costs counted _battles_, Repel would make a cave impassable.

The **first pass** through an exit must satisfy both its first-time and every-time costs. Later passes only need the every-time cost. Exits without a cost are free.

How it maps onto existing primitives (no special engine path):

- The engine keeps per-journey **location progress**: `{ lifetime: Counters; visit: Counters }` (explores, encounters, wild battles, trainers defeated), where `visit` resets on each entry. Updated by engine event listeners: wild battle finished, trainer defeated, explore pressed.
- Condition facts `location.lifetime.<counter>`, `location.visit.<counter>` and `trainers.defeated`, scoped to the location being exited, are in the **MVP fact list** ([05](05-requirements.md#mvp-scope)).
- The builder compiles each exit's costs into **its gate** (`presentation: 'attemptable'`, explanation e.g. "Defeat Bug Catcher Rick and 1 more trainer to continue", "Keep exploring: 2 more steps to get through Mt. Moon"): `(flag traversal:<edge>:passed OR first-time rule) AND every-time rule`. The engine sets the flag the first time the player passes that exit, so later passes need only the every-time cost, even if a later release raises the first-time cost. This replaces the per-location `cleared` flag. The builder preview has a first visit / later visit switch.
- Unavoidable trainers can also use `engagement: 'onEnter'` (they battle you as you arrive). Traversal is for "you can't leave until…".

### "Encounters while travelling" (option B): decided no

Option B means **the trip itself can be interrupted**. You pick "Go to Viridian City" from Route 1, and the engine rolls encounters _along the way_ (e.g. a chance per step of the route's length). You might be ambushed by a Rattata or a trainer before arriving, and you can't decline the encounter except via Repel or running. With option A (MVP), choosing a destination moves you instantly, and encounters only happen when you press Explore. **Decision: B won't be built.** Authors who want routes to cost something every time use an every-time traversal cost instead.

### Encounter intros (decided Nov 2026: post-MVP; the MVP shows the default line)

> Stored as flavor entries in the uniform flavor system ([29](29-flavor-text-and-prose.md), decided Nov 2026, Q37).

The text shown when a wild encounter starts. It matters most in text-first regions, where a fakemon may have no art at all, and for legendary and event Pokémon.

**MVP:** the default line per method ("A wild {species} appeared!"; fishing "Oh! A bite! A wild {species} appeared!"). Nothing else is authored.

**Post-MVP:** an intro is assembled from two optional parts, each falling back to the default:

1. **Scene** (where and how), picked at random from the most specific pool that exists: location + method, then region default for the method, then the built-in default.
2. **Subject** (the Pokémon): a one-time **first sighting** passage the first time the journey sees the species (from `journey.dex.seen`, [23](23-players-characters-journeys-and-scopes.md)), otherwise a random line from the species' own pool (per method or any). Without either, the default subject.

```ts
// post-MVP; flavor entries (29), each variant a Passage (07)
FlavorEntry { event: 'encounter.scene',          match: { location?, method? }, variants }   // location+method, or region-wide per method
FlavorEntry { event: 'encounter.subject',        match: { species?, method? }, variants }    // a species' lines for later encounters
FlavorEntry { event: 'encounter.firstSighting',  match: { species }, variants }              // once per journey per species
```

**What the MVP builds so this slots in without reshaping data:**

- **The engine resolves the intro, not the renderer.** The wild-encounter start event carries `{ species, level, method, location, firstSighting, intro }`, where `intro` is a reference (`{ entry, variantId }`, or the default line's message key with its parameters) that the presentation layer turns into text in the viewer's language ([30](30-internationalization-readiness.md)). In the MVP the resolver always returns the default line; later it consults the pools. Selection follows the flavor rules ([29](29-flavor-text-and-prose.md)): most specific entry, its `chance`, then a weighted pick with the seeded `Rng`, so a re-render never swaps the text.
- **`firstSighting` is computed in the MVP** (the species isn't in `journey.dex.seen` yet), because the Pokédex needs it anyway.
- **Species text is edited from the regional Pokédex screen** and stored as region-layer flavor entries matched on the species, so the same Pokémon can read differently in different regions. A server pack can supply defaults that regions fall back to ([29](29-flavor-text-and-prose.md), [27](27-server-content-library-and-overrides.md)).
- **Legendaries and event Pokémon stay scripts** with a `wildBattle` step and their own passages. The step's reserved `intro: 'auto' | 'none'` decides whether the species' first-sighting text is also shown.
- **Intros are independent of graphics.** They show in sprite regions too, as flavor above the battle view's sprites; in text-mode regions they're the only depiction, which is where they matter most. A first-sighting passage can carry its own `image` block (e.g. a legendary's splash art) regardless of the region's sprite set.
- **First sightings in trainer battles** (the rival's starter, a gym leader's ace) are post-MVP too. They come from the battle's send-out events and appear in the turn view ([26](26-discord-surface-and-ux-patterns.md#battles)).

## MVP scope

- Method registry with canon defaults (grass, cave, surf, old/good/super rod).
- Conditioned tables, per-method Explore outcome tables (wild/trainer/item, plus location event rows) with location overrides, the Look around method, and the Repel effect (with safe steps).
- Hidden items, once per journey or renewing.
- Per-exit traversal costs (first-time and every-time) compiled into latched exit gates.
- A wild battle that hands off to the battle system with catch/run/bag (see [14](14-battle-system-and-showdown.md)).
- The default intro line per method, carried on the encounter start event with `firstSighting` (authored intros are post-MVP).

## Open questions

- ~~Day/night time model?~~ **Decided (Q6):** none for the Kanto MVP (tables use `any`). The injected Clock defaults to real time in the server's timezone when Gen 2+ content needs it. See [18](18-rules-time-and-randomness.md).
- ~~Level scaling?~~ **Decided (Oct 2026):** post-MVP. `RegionRules.systems.levelScaling` is reserved so it can be added later without reshaping data ([18](18-rules-time-and-randomness.md)). A candidate rule: wild levels drawn from just below the party's highest level ([18 § Candidate options](18-rules-time-and-randomness.md#candidate-post-mvp-options-not-decided)).
- Level-banded slots? (post-MVP idea, not decided) A slot names an evolution line instead of one species, and the rolled level picks the stage (e.g. stage 1 below L18, stage 2 from L18). Tables stay short, and it pairs well with level scaling, where a fixed species per slot would show under-evolved Pokémon at high levels.
