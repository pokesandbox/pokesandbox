# 27: Server Content Library & Overrides

> **TL;DR:** Custom content and changes to canon live in a **server content library**, layered on top of the catalog ([12](12-content-catalog-species-moves-items.md)) and never editing it. Every library entry is either an **original** (authored from scratch, under the publisher's namespace `<publisherId>:<slug>`) or **linked** (a pinned base, kept as a **snapshot**, plus a **patch**). Linked entries cover canon overrides and imports from other servers with one mechanism. Each region picks **one definition per ID**, and its release embeds the result. Upgrades, from a new catalog version or a new version of an imported entry, are **three-way merges** the author opts into. Species, learnsets, and moves all use this; abilities, items, and types follow later. All of it is post-MVP except two small reservations.

**MVP impact:** Low (two reservations; see Keeping it additive) · **Cost to change later:** Low, as long as the reservations hold

## Why it matters
Creators want fakemon, regional variants, rebalanced moves, and custom learnsets, and they want to share them. Doing that by editing the catalog would break other regions and every future Showdown upgrade. A separate library layer keeps canon clean, lets several regions on one server use different versions of the same Pokémon, and makes sharing and upgrades a merge rather than a manual re-copy.

## Server content library (decided Oct 2026)

Custom content belongs to the **server**, not to a region. A region is one game, and a server can host several (sequels, side stories, remakes). A creator should be able to make a fakemon, custom move, or custom item once and use it in any of their regions without recreating it.

| Scope | Holds | Examples |
|---|---|---|
| **Global** (Layer 0–1) | Canon catalog + enrichment | Bulbasaur, Thunderbolt, Potion |
| **Server library** (Layer 2) | Custom species/forms/types/moves/abilities/items, plus reusable registries (trainer classes, custom encounter methods) | `newlogora:sparkitten`, a "Ranger" trainer class |
| **Region** (Layer 3, in the release) | Which library and canon entries this game *uses*, and how: regional dex order, TM list, shop prices, rules | "Kanto 2 uses Sparkitten as dex #152" |

Consequences:
- Regions **select** library entries by ID and definition ref; publishing validates that every selected entry exists and embeds the resolved result in the release, like catalog data ([12 § Catalog versions](12-content-catalog-species-moves-items.md#catalog-versions-decided-oct-2026)). Editing a library entry (e.g. rebalancing a fakemon's stats) reaches each region that uses it at that region's next publish, so live play never changes under players until the admin republishes.
- The engine assembles one Showdown data set per **battle context**: each region release and each Arena format. Preferred delivery is **runtime injection into an isolated dex** (evolving the fork's `dynamic-dex-data` POC, see [14](14-battle-system-and-showdown.md#current-state-of-the-fork-branch-inventory-oct-2026)), not generated mod files. A server-wide mod can't work, because two regions on the same server may use different overrides of the same species (see [Compiling to Showdown](#compiling-to-showdown)).
- Library content can also be **published for other servers to import** (private by default). See [Importing from another server](#importing-from-another-server).

## Species identity: canon, custom species, variants, overrides & sharing (decided Oct 2026, Q19)

Requirements from the owner:
- Global canon species.
- Servers can add their own species, plus **variants of existing species**.
- Servers can **publish** custom content for other servers to import (private by default).
- Everything must work in Showdown **without conflicting with canon**.
- An **override** of a canon species/form and the original **can't both be in one region**. If a creator wants both, the variant must be a separate **form**.

## Namespaces & publishers (decided Oct 2026)
The namespace in custom IDs is an **opaque, immutable publisher ID**. It's never a user-chosen handle, and it's not the raw Discord guild ID. A **presentation layer** shows a human name wherever IDs would surface.

```ts
Publisher {
  _id: string;                     // short opaque ID, e.g. 'p7k2m9x4'. The namespace in `<ns>:<slug>`. Never changes.
  displayName: string;             // defaults to the server name; changeable any time
  iconUrl?; description?;
  ownerServerIds: ObjectId[];      // MVP: exactly one (auto-created, lazily, the first time a server makes library content)
}
```

Why not the alternatives:

| Option | For | Against |
|---|---|---|
| User-chosen, set-once handle (`newlogora`) | Readable in raw IDs | Needs a claim flow, uniqueness checks, squatting/impersonation moderation, and "I regret my handle" support. It's permanent, so a typo or an outgrown name sticks forever. Readability only matters in raw IDs, which users shouldn't see. |
| Discord guild ID (`1010726453974925402`) | Already unique and immutable, no claim flow. This was the original plan. | Couples content identity to one Discord guild: if a creator rebuilds their server or moves to a new guild, their whole library's IDs point at a dead guild. It also ties IDs to Discord specifically. |
| **Opaque publisher ID + display name** (chosen) | No claim flow, no collisions, rename-safe. **Ownership can move** between servers (rebuilt server, a creator running two servers that share one library) without touching a single ID. | One small model. The UI must always resolve IDs to names (it should anyway). |

Presentation rules:
- Users see "Sparkitten · by **New Logora**" (publisher display name + icon), never `p7k2m9x4:sparkitten`.
- Display names don't need to be unique. Public browsing shows the icon, the server name, and later a "verified" badge for disambiguation.
- Raw IDs appear only in JSON export/import, logs, and developer tools, where the readable `slug` half is enough for humans.

MVP needs no publisher UI. It needs only the auto-created Publisher per server and name resolution in the builder.

## Library entries: *original* and *linked* (decided Oct 2026)
Every library entry is one of two kinds. Overrides of canon and imports from other servers turn out to be **the same mechanism**: a *linked* entry, a pinned base plus a local patch.

| Kind | What it is | ID | Examples |
|---|---|---|---|
| **Original** | Data authored from scratch | `<ns>:<slug>` (the creator's namespace) | A new fakemon `newlogora:sparkitten`. A new **form** of an existing species `newlogora:pikachu-surfer` (`baseSpecies: Pikachu`, `forme: Surfer`). A custom move built from an archetype. |
| **Linked** | `base` (a pinned definition: canon at a catalog version, or another publisher's entry at version N) **+ `patch`** (local changes, possibly empty) | **the base's ID** (unchanged) | **Canon override:** base = canon Pikachu, patch = new stats. **Import:** base = `newlogora:sparkitten@v3`, patch = {} or local tweaks. |

```ts
LibraryEntry {
  entryId; publisherId; visibility: 'private' | 'public';     // private by default
  subject: 'species' | 'learnset' | 'move';                     // later: 'ability' | 'item' | 'type'
  kind: 'original' | 'linked';
  // original
  id?: `${ns}:${slug}`; versions?: { version; publishedAt; data; dependencies: DefinitionRef[] }[];  // immutable once published
  // linked
  base?: { ref: DefinitionRef; pinnedVersion: string; snapshot: SubjectData };   // canon@<catalogVersion> or <ns>:<slug>@vN
  patch?: SubjectPatch;                                         // per subject, see below; effective = base ⊕ patch
  detachedFrom?: DefinitionRef;                                 // provenance after "detach"
}
```

- **`<ns>`** is the **publisher ID** (see Namespaces & publishers). Examples use `newlogora` as a readable stand-in; a real ID looks like `p7k2m9x4:sparkitten`.
- Showdown IDs are lowercase alphanumeric only, so **any ID containing `:` can never collide with canon**, now or in future generations.
- A rename changes the display name, never the ID.

### Two identities per entry
| Identity | What it is | Used by |
|---|---|---|
| **Content ID** (in-game identity: species ID, move ID, …) | What a Pokémon *is*: `pikachu`, `newlogora:sparkitten`, `newlogora:pikachu-surfer` | Pokémon instances, encounter slots, trainer parties, regional dex, conditions, team presets |
| **Definition ref** (authoring identity) | *Which version of which library entry* supplies the data: `{ entryId, version }` | Region releases and Arena formats (what they compile), import/sharing, update notices |

They're usually 1:1. **Overrides** are the reason they're separate: an override is a library entry whose ID *is a canon ID*.

### Why this fits Showdown naturally
A linked entry *is* Showdown's mod pattern: `inherit: true` + changed fields. Each region release and Arena format assembles its **own** isolated dex, so:
- **A region using a linked entry** gets `base ⊕ patch` under the base's ID. Every content reference (`pikachu`, `newlogora:sparkitten` in encounter tables, trainer parties) picks it up with no reference changes. Switching between the original and a linked version never touches content.
- **The "not both in one region" rule is structural:** a region's species set maps each species ID to exactly one definition, so canon Pikachu and a linked (overridden) Pikachu can't coexist. The validator explains: "Pikachu is overridden by *Rebalanced Pikachu*. To use both, create it as a new form instead."

## Patches by subject
Every patch applies to the **resolved, single-generation** form of its base, the same view everything else reads ([12](12-content-catalog-species-moves-items.md)). A region only ever uses one generation, so per-gen detail in a patch would be noise.

### Species
`patch: Partial<SpeciesData>`: field-level changes (stats, types, abilities, catch rate, sprites, …).

### Learnsets
A patch on the resolved learnset (`levelUp`, `machine`, `tutor`, `egg`, `event`):
```ts
LearnsetPatch {
  add?:     { move: MoveId; method: 'levelUp' | 'machine' | 'tutor' | 'egg'; level?: number }[];
  remove?:  { move: MoveId; method?: 'levelUp' | 'machine' | 'tutor' | 'egg' }[];   // no method = remove entirely
  relevel?: { move: MoveId; from: number; to: number }[];
}
effective = applyPatch(resolveLearnset(base, gen), patch)
```
- **Why patch the resolved form, not codes:** it matches how authors think ("Charmander learns Flamethrower at 30", "remove Fly from Charizard's TMs"); a region only ever uses one generation, so per-gen codes would be noise; and it keeps the builder simple.
- **Changing a region's learnset generation** re-resolves the base for the new generation and re-applies the patch.
- **Custom species** (originals, `<ns>:<slug>`) author a `ResolvedLearnset` directly, with no codes or generations.
- **One definition per species per region:** a server can hold several learnset overrides for `pikachu`, and each region picks one.
- **TM compatibility follows automatically:** a patch adding Surf to `machine` makes that species compatible with the region's Surf machine.

### Moves
`patch: Partial<MoveData>` plus optional text changes (`desc`, `shortDesc`), data only. A move override is injected into the battle's isolated dex as `{ inherit: true, …changedFields }`. Showdown's merge keeps every key the override doesn't set, **callbacks included**, so "Thunderbolt at 95 power" behaves normally. Some fields are **controlled by callbacks** (power for Low Kick, Return, Gyro Ball, Eruption via `basePowerCallback`; type for Weather Ball and Hidden Power via `onModifyType`/`onModifyMove`; hit counts). The builder reads `hooks` and blocks or explains those fields ("this move's power is calculated, so a power override has no effect").

## Base snapshots and upgrades
A linked entry keeps the **catalog version** (or imported entry version) it patched **and a snapshot of that base**, so it never depends on old catalogs being kept. When the base moves on (a bot-wide catalog upgrade, or the author of an imported entry publishing v4):
1. **Published releases are unaffected.** They embed the resolved data, patch applied. Battles inject that data; behavior comes from the installed Showdown, which normally means upstream bug fixes.
2. **The next compile keeps working.** It uses the snapshot plus the patch, not the new base. The publish review flags the drift: "Thunderbolt override is based on `cat-2026-10-31-1`; canon changed in `cat-2027-01-15-1`: accuracy 100 → 95. [Upgrade] [Keep current base]".
3. **Upgrading is a three-way merge** (old snapshot, new base, patch): fields only the base changed are taken, fields only the author changed are kept, and fields both changed are shown as conflicts, with the author's value winning unless they pick the base's. Keeping the current base is always allowed.

Errors happen only on real conflicts, each with a named fix in the review:

| Situation | Result | Fix offered |
|---|---|---|
| The base no longer exists (a canon move or species removed or renamed upstream; an imported entry deleted) | Error | **Detach** into an original entry (`<ns>:<slug>`) built from the snapshot, or remove the override |
| (Moves) A patched field is now controlled by a callback (the move's `hooks` changed) | Warning: "power is now calculated; your override has no effect" | Drop the field from the patch, or keep the old base |
| A patched value is no longer valid (a field's allowed values changed) | Error naming the field | Edit the value |
| A custom move's template behaves differently after the upgrade | Warning, from the archetype sim tests | Review the template |

## Importing from another server
1. **Import** creates a *linked* entry in your library: `base = author's entry @ latest published version`, `patch = {}`. It's immediately usable, and it's **editable locally**: any field you change goes into your patch. The author's data is never modified.
2. **Updates:** when the author publishes v4, you get a notice listing what changed. Upgrading is the same three-way merge as a catalog upgrade ([Base snapshots and upgrades](#base-snapshots-and-upgrades)). Nothing changes until you upgrade, and live play only changes at your next region publish.
3. **Detach** (optional): flatten `base ⊕ patch` into an *original* under **your** namespace (new species ID, `detachedFrom` provenance). Use it when your version has become its own thing and you want to publish it yourself.
4. **Dependencies** (custom moves/abilities/types the species needs) import together as linked entries at pinned versions.
5. If the author **unpublishes or goes private**: you keep your pinned base (published versions are immutable). New imports stop, and you can still detach.

**Identity choice:** a linked entry keeps the base's species ID even with local tweaks, the same way a canon override keeps `pikachu`. A locally patched Sparkitten is still a Sparkitten that "works differently in this game". If cross-server trading or travel ever arrives, a Pokémon battles with the definition of the place it's in. Detaching is how a creator says "this is a different species now".

**Why not the alternatives:**
| Option | Problem |
|---|---|
| Pinned reference only (no local edits) | Fails the requirement: importers must be able to tweak locally. |
| Plain copy with a source link | Local edits are easy, but upstream updates become a manual re-import that loses your edits, and each copy needs a new ID (or else two servers own the same ID). |
| **Linked: pinned base + local patch** | Local edits *and* clean upgrades. Same mechanism as canon overrides. Keeps IDs stable. |

## Compiling to Showdown
Inside one compiled mod, Showdown keys species by `toID(name)`. The compiler:
1. **Originals (species/forms):** emits the display name. If it collides with a canon name or another selected entry in the *same* region/format, publish is blocked with a "set a local display name" fix. (Two servers' "Sparkitten"s only clash if one region imports both.)
2. **Linked entries:** emit under the base's key with `inherit: true` + patch (for canon bases), or the base's compiled data + patch (for imported bases).
3. Keeps a per-release **translation table** (species ID ↔ Showdown ID) so battle logs map back to our IDs.

Future canon additions are safe: a new real "Sparkitten" just becomes a name clash, caught at that region's next publish. Existing instances keep `newlogora:sparkitten`.

## What happens to owned Pokémon when definitions change
- **Linked entries (overrides or tweaked imports):** the Pokémon's species ID is the base's ID either way. It battles with whatever definition the current region uses.
- **Version bumps / upgrades:** apply at the region's next publish, same as any content change ([01](01-content-vs-state-and-publishing.md)).
- **Deleted entry:** blocked while any published release or instance references it. Archive instead.

## Identity and uniqueness
A species ID names what a Pokémon *is*. It is **not** a unique document key: a server library can hold several linked entries for `pikachu` (e.g. "Rebalanced Pikachu" for one region, "Hard-mode Pikachu" for another), and every server that imports Sparkitten holds an entry with the same ID.

| Where | Unique key | Species ID unique? |
|---|---|---|
| Canon catalog (`DexEntry`, later `SpeciesDefinition`) | `speciesId` (renamed from `showdownName`), plus the data version if more than one canon import is kept | Yes, among canon entries only |
| Server library | `entryId` (+ version) | No. Overrides and imports share IDs by design. |
| Region release | Its species map: each species ID → exactly one `DefinitionRef` | Yes, enforced by the publish validator, not a DB index |

- `_id` stays an ObjectId. All references store `speciesId` (plus a definition ref where pinning matters), never the `_id`.
- A region's Pokédex slot picks the definition: `{ speciesId: 'pikachu', definition: { entryId, version } }`. Instances, encounter slots, and trainer parties store only `'pikachu'`.
- The existing `isCanon` / `isPublic` / `originServer` fields map onto `kind`, `visibility`, and `ownerServerId`. Non-canon entries move to the library model instead of sharing the canon collection (the seed has none today).

## Custom moves (post-MVP, Q28)
- A custom move (`<ns>:<slug>`) **borrows an existing move's mechanics and changes data only**. At battle time its dex entry is built from the template move's entry (functions included) with the overrides applied, under the new ID.
- **Store a recipe, not functions:** `{ template: MoveId; overrides: Partial<MoveData> }`. Battles are persisted as seed + input log and replayed on recovery, so everything crossing into a battle must be serializable; functions are re-attached when the dex is built.
- **Templates come from a curated list of archetypes**, not any move: plain damage; damage + secondary effect (status, flinch, stat drop); stat changes; multi-hit; recoil; drain; priority; status-only. Some Showdown behavior is keyed by move ID elsewhere (Gust hitting targets mid-Fly, Metronome's exclusion lists), so a copy of an arbitrary move could silently lose interactions. Each archetype gets a sim test.

## Keeping it additive (MVP)
- **`MoveId` accepts namespaced IDs.** The shared type allows canon IDs (`thunderbolt`) and publisher IDs (`p7k2m9x4:sparkbolt`); only the canon collection enforces the plain Showdown format on its own records. Otherwise every field typed `MoveId` (learnsets, TM lists, trainer movesets) would reject custom moves later. Species IDs already work this way.
- **Everything reads moves through the catalog read service**, `getMove(moveId, { gen, region? })`, never raw documents. `region` is unused in the MVP; overrides later plug into that one function instead of every caller.
- **Canon documents never carry override fields.** Overrides are separate library entries; nothing needs adding to `MoveDefinition`, `Learnset`, or `DexEntry` for them.
- **Releases embed resolved data** ([12 § Catalog versions](12-content-catalog-species-moves-items.md#catalog-versions-decided-oct-2026)), so library entries are baked in at publish and live play never resolves them on the fly.

## Later: abilities, items, types (post-MVP)
The same original/linked scheme applies, deferred until they're designed. Their behavior is code in Showdown, so patches are limited to safe, data-only fields on existing behaviors, the same rule as moves.

## MVP scope
- Nothing to build beyond the reservations in Keeping it additive (and the auto-created Publisher per server when the first library content is made, post-MVP).
- Not MVP: the library model and UI, overrides, imports, custom species and moves, publishing to other servers.

## Open questions (post-MVP)
- Should publishers be able to deprecate a published version (warn importers) without unpublishing?
- Do custom types need their own typechart editor in the first library release, or can they wait for custom species?
