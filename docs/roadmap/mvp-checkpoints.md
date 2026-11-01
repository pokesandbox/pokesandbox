# MVP Checkpoints: Building Kanto Badge by Badge

> **Status: decided (Nov 2026).** The checkpoints are the MVP's GitHub milestones (CP0a–CP8, then the MVP Release), replacing M3–M6. The issue lists per checkpoint are in [`mvp.md`](mvp.md#the-kanto-checkpoints-cp0acp8).

The MVP milestones in [`mvp.md`](mvp.md) are organized by system (M3 authoring, M4 scripts, M5 adventure core, M6 Kanto). Built in that order, nothing is playable until M6. **Checkpoints turn the MVP into a series of playable slices of Kanto Classic**, each one a published release that can be played start to finish up to that point. Each checkpoint pulls in only the systems its stretch of Kanto needs, so every system is built when it first matters, and every checkpoint proves the whole stack end to end.

## How a checkpoint works
- **A checkpoint is a release of Kanto Classic**, published through the normal draft → release path ([01](../architecture/concepts/01-content-vs-state-and-publishing.md)). The end of the playable stretch is an ordinary `attemptable` gate ("The road ahead is still under construction") on the next area, removed in the next checkpoint's release.
- **Saves carry forward.** Journeys keep playing on the newer release, which is exactly what the release and migration design is for, so testers never restart between checkpoints.
- **Exit criteria for every checkpoint:**
  1. A headless engine playthrough test from a new journey to the checkpoint's end runs in CI against the template bundle.
  2. A human playtest of the new stretch, with friction logged as issues.
  3. The content needed for the stretch is in the repo bundle (`templates/kanto-classic/`), lossless on export and import.
  4. Every builder screen that stretch's content needs exists (authors build each stretch with the tools), except at CP0, where content comes from the generator and bundle import.
- **Bulk data comes from the generator** (locations, encounters, trainers, marts, TM list, trainer lines), stretch by stretch; story scripts and gates are authored with the builder ([16 § Official templates](../architecture/concepts/16-authoring-validation-and-portability.md#official-templates-decided-oct-2026)).

## The checkpoints

| CP | Stretch of Kanto | What it proves | Systems it pulls in first |
|---|---|---|---|
| **CP0a · Pallet Town: talk & walk** | New journey, Oak's intro, starter pick, naming the rival, Pallet ↔ Route 1 ↔ Viridian | The engine, scripts, and publishing, with no battles | Generator and bundle import, headless playthrough harness, `RegionRules` (Classic Gen 1), journey and character start, script VM core steps, triggers, NPCs, `givePokemon`, passage renderer, `/play` hub, travel, party view, the `adventure.play` flag |
| **CP0b · Pallet Town: first battle** | The rival battle in Oak's lab | Adventure battles in `/play`, end to end | State-injection patch, BattleService `trainer` battles in `/play`, the `battle` step, trainers and party variants, trainer lines, Gen 1 EXP and payout, mid-battle level-ups and move learning |
| **CP0c · Pallet Town: into the grass** | Route 1 wild battles, Oak's Parcel, the Pokédex and Poké Balls, catching, the Viridian Mart, the Pokémon Center | Catching and the core loop | External choice hook and caught/ran patch, `ItemDefinition` (Gen 1), catch and escape formulas, encounter tables, Explore (wild), wild battles with catch/run/bag, bag and key items, mart, heal, respawn, whiteout |
| **CP1 · Boulder Badge** | Route 2, Viridian Forest, Pewter, Brock; Route 22 rival | Authoring with the builder; gyms and route trainers | Webapp builder shell (after the headless UI trial), location/encounter/trainer screens, route trainers on Explore with lines, hidden items, traversal requirements, Gym Leader template, badges, TM/HM list, `enterLocation` triggers, whiteout, evolution and move-learn prompts, badge case, adventure log |
| **CP2 · Cascade Badge** | Route 3, Mt. Moon, Route 4, Cerulean, Nugget Bridge, Bill, Misty | Dungeons, choices, multiplayer trading | Cave traversal costs, choice progressions (fossil), Gauntlet template, stone evolution, Repel, PC boxes, in-game trades, **player trading**, Gen 1 traded-Pokémon EXP and **obedience** |
| **CP3 · Thunder Badge** | Routes 5–6, Underground Path, Vermilion, S.S. Anne, Lt. Surge, Diglett's Cave, Route 11 | Key items and field moves as gates | Ticket and Cut gates (conditions on bag and party moves), ferry transport, fishing methods (Old Rod), gifts with a full party (swap offer) |
| **CP4 · Rainbow Badge** | Routes 9–10, Rock Tunnel, Lavender (lower Tower), Routes 7–8, Celadon (Dept Store, Game Corner, Rocket Hideout), Erika | Economy depth | Flash gate, multi-shop locations, coins as a progression currency and the prize shop, conditioned descriptions (`descriptionVariants`) |
| **CP5 · Soul & Marsh (6 badges)** | Pokémon Tower (Silph Scope), Poké Flute and Snorlax, Routes 12–18 and Cycling Road, Fuchsia (Safari Zone replacement gifts: Surf, Strength), Koga, Saffron, Silph Co., Sabrina, Fighting Dojo | Story density and travel | Fly network (HM02), static legendary-style encounters (scripted `wildBattle`), Card Key gates, Lapras gift, many in-game trades, Fly destination lists grouped and paginated |
| **CP6 · Volcano & Earth (8 badges)** | Surf routes, Seafoam Islands (Articuno), Cinnabar (Mansion, fossil revival, Blaine), Power Plant (Zapdos), Giovanni | Late-game gates and legendaries | Surf as a method and gate, Strength gates (simplified), fossil revival script, region-wide progression checks |
| **CP7 · Champion** | Route 23 badge checks, Victory Road (Moltres), Indigo Plateau, Elite Four, Champion | The endgame | Badge-check gates, Gauntlet with `resetOnLoss` and no healing, Hall of Fame milestone and log entry, `smart` AI for the League |
| **CP8 · Mewtwo (MVP complete)** | Cerulean Cave after becoming Champion; Mewtwo | Post-game content | A post-Champion gate; the full Kanto Classic template |

The **MVP release** adds the release work from M6 on top of the last checkpoint: webapp hosting (needed earlier, privately, from CP1 for builder dogfooding), trust and safety ([M6 backlog](../backlog/m6-kanto-classic-and-release.md)), load test, documentation, and discovery.

## How this maps onto the existing plan
- **Nothing in the architecture changes.** Checkpoints change the **order** systems are built in, not what they are.
- **CP0 is the engine vertical slice** recommended after the cohesion audit: it's where the riskiest integration (engine + scripts + BattleService + catching + publish) gets proven, before builder breadth. **It's by far the biggest checkpoint**, because it builds the core of what used to be M4 and M5 (about 35 issues on top of M0b and M1's BattleService), so it's split into three playable sub-checkpoints: **CP0a** (no battles), **CP0b** (one trainer battle), **CP0c** (wild battles and catching). From CP1 on, checkpoints mostly add content, builder screens, and incremental systems.
- **Two sim patches and the obedience rule moved out of M1** into the checkpoints that need them (CP0b, CP0c, CP2), and **isolated custom-data dexes moved past the MVP**: Kanto Classic is pure Gen 1, so Showdown's own `gen1` mod covers it. M1 now holds only what the Arena needs plus the catalog.
- **Systems split across checkpoints where it helps.** For example, the explore outcome table needs only `wild` at CP0, adds `trainer` and `item` at CP1; the builder starts with the screens CP1 needs and grows per checkpoint.
- **The Arena track is independent** and runs as before (M0c → M1 → M2), sharing BattleService with CP0.

## Decisions (Nov 2026)
1. **Checkpoint milestones replace M3–M6:** `CP0a`, `CP0b`, `CP0c`, `CP1` … `CP8`, then `MVP Release`. The scheduled agent and the board work from the current milestone, so work is ordered by the next playable stretch. The old M3–M5 groupings live on as epics; draft IDs (`M3-01`, `M6-01`) keep their names.
2. **Who plays:** the team and invited members of the Pokémon community. **CP4 and CP7 are public playtests on the PokeSandbox server only**, not a general release: adventure play is behind the `adventure.play` feature flag ([21 § Feature flags](../architecture/concepts/21-hosting-and-environments.md#feature-flags-decided-oct-2026)), on only for that server until the MVP Release. The Arena keeps running everywhere as released in M2.
3. **Mewtwo (CP8) is part of the MVP.**

## What the MVP Release opens up (decided Nov 2026)
- **Playing Kanto Classic opens to every server** at the MVP Release (install the official template; `adventure.play` on generally).
- **Region authoring for other servers is an invite-only creator beta** (a per-server flag). Gen 1-only authoring (151 species, no abilities or held items) is a narrow toolset most server owners would outgrow, and every creator adds support load.
- **Open authoring waits for the Modern preset** (Gen 6+ mechanics: the physical/special split, hidden abilities as authoring controls, abilities, natures, IVs/EVs, held items, the Fairy type chart; gimmicks as toggles), defined in [18](../architecture/concepts/18-rules-time-and-randomness.md). The owner's rule: not before the generation where most modern mechanics are solidified.
- **Custom content (fakemon, custom moves, overrides) is post-MVP regardless**: it needs the server content library and isolated custom-data dexes ([27](../architecture/concepts/27-server-content-library-and-overrides.md)).
