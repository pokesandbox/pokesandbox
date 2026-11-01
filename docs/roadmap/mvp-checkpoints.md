# MVP Checkpoints: Building Kanto Badge by Badge

> **Status: proposal (Nov 2026), awaiting the owner's decisions** (see [Decisions needed](#decisions-needed)).

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
| **CP0 · Pallet Town slice** | New journey, Oak's lab, starter, first rival battle, Route 1, Viridian, Oak's Parcel, Pokédex + Poké Balls, catching on Route 1 | The whole stack: engine, scripts, battles, catching, release | Character and journey start, `/play` hub, passage renderer, script VM (passage, choice, askName, battle, effects, heal), travel, explore (wild), wild and trainer battles with catch (fork patches: state injection, external choice hook, caught/ran), EXP and level-ups, party, bag basics, mart, Pokémon Center heal and respawn, rival trainer lines, publish |
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
- **CP0 is the engine vertical slice** recommended after the cohesion audit: it's where the riskiest integration (engine + scripts + BattleService + catching + publish) gets proven, before builder breadth.
- **Systems split across checkpoints where it helps.** For example, the explore outcome table needs only `wild` at CP0, adds `trainer` and `item` at CP1; the builder starts with the screens CP1 needs and grows per checkpoint.
- **The Arena track is independent** and runs as before (M0c → M1 → M2), sharing BattleService with CP0.

## Decisions needed
1. **Milestones: replace M3–M6 with checkpoint milestones, or keep them and add a Checkpoint field?**
   - **Recommended: checkpoint milestones** (`CP0 · Pallet Town` … `CP8 · Mewtwo`, plus `MVP Release`). The scheduled agent and the board both work from "the current milestone", so a checkpoint milestone automatically orders the work by what the next playable stretch needs. The M3–M5 system groupings become epics whose issues are spread across the checkpoints that first need them. Draft IDs (`M3-01`) stay as stable references; only the milestone assignment changes.
   - Alternative: keep M3–M6 and tag each issue with a Checkpoint field. Less churn now, but "current milestone" no longer means "next playable step".
2. **Who plays the checkpoints?** Recommended: the team and the alpha community server from CP0, with public access decided at a later checkpoint (CP4 or CP7 are natural "chapter" moments). Releasing by chapter is native to the release design, but each public chapter also means support load, so it's worth choosing deliberately.
3. **Is Mewtwo (CP8) part of the MVP release, or a fast follow after the Champion (CP7)?** Recommended: part of the MVP, since the template is the MVP's acceptance test and "complete Kanto" includes the post-game legendary; it's a small stretch.
