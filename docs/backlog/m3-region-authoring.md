# Region Authoring: TM/HM Lists & Webapp Builder (backlog draft, partial)

> **Milestones (Nov 2026):** the old M3 milestone was replaced by the Kanto checkpoints. Everything in this file lands in **CP1** (Boulder Badge: Brock's TM34 and the first builder screens); M3-05, the headless library trial, can start any time. Draft IDs keep their `M3-` names.

Drafted so far: the **TM/HM lists** epic (E-M3-1) and the start of the **Webapp Builder** epic (E-M3-2: the headless library trial, the antd migration, and the builder shell). The other builder and region work (region config, locations and connections, encounters, transport, shops, validator tiers, bundles) is listed per checkpoint in [`mvp.md`](../roadmap/mvp.md#the-kanto-checkpoints-cp0acp8) and drafted later.

Refs: concept [12 § TM/HM lists](../architecture/concepts/12-content-catalog-species-moves-items.md#tmhm-lists-decided-oct-2026), [`mvp.md` § CP1](../roadmap/mvp.md#cp1-boulder-badge)

## Start here
New to the project? Read [`docs/start-here.md`](../start-here.md) first, then the moves and learnsets primer in [E-M1-2 § Start here](m1-battle-core-and-catalog.md#start-here-no-prior-context-needed), since these issues build on that catalog. Context specific to this file:
- **What this is:** parts of the region builder (everything admins use to author a region): TM/HM lists and the webapp builder's foundation, both needed by CP1.
- **Where it's built:** the **webapp**, mobile-first (Q36, [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)). Rules live in `libs/authoring` commands; the webapp screen is a thin client of them. Phone-first layouts, list/detail editors, 44px touch targets, no hover-only interactions, Playwright tests at phone width.
- **In Pokémon terms:** every region gets its own TM case, so "TM24" means whatever that region says (Thunderbolt in Gen 1). HMs are reusable; Gen 1 TMs are single-use.
- **Order:** M3-01 and M3-02 can start once M1-01/M1-02 exist; M3-03 needs the validator skeleton (M0B-22); M3-04 (the builder screen) waits for the authoring layer (M0B-16) and the webapp builder shell (M3-06). The headless library trial (M3-05) comes before any webapp authoring work; it has no dependencies, so it can start any time, ideally while M0b is in progress.

## E-M3-1 · TM/HM Lists
`Type: Epic` · `Priority: P0`

Each region defines its own TM/HM list: machine labels mapped to moves, with Gen 1's single-use TMs and reusable HMs. Machine numbering differs per generation, so machines are **region content**, not global items. Bag items use the reserved `machine:<label>` namespace and resolve through the region's list. Compatibility comes from the region's learnset generation ([12 § TM/HM lists](../architecture/concepts/12-content-catalog-species-moves-items.md#tmhm-lists-decided-oct-2026)).

Using a TM from the bag (teaching it to a Pokémon) is CP1 work too (Brock's TM34), and shops selling TMs come with the CP4 shops work (Celadon); both read this list.

**Changes once foundations land.** M3-04 is already blocked on the authoring layer, so it's built once, on the final foundation. The others start earlier and get small follow-ups (also listed on the triggering foundation issues):

| When this lands | Follow-up | Affects |
|---|---|---|
| `libs/core` (M0A-09/M0A-10) | Move the model and helpers into `libs/core`. | M3-01, M3-03 |
| Content keys and model cleanup (M0B-10, M0B-11) | Re-check that `moveMachines` survives the `Region` model cleanup (it holds move IDs, not ObjectIds, so it should carry over unchanged). | M3-01 |
| Region releases (M0B-21) | Include `moveMachines` in the compiled release, and have play-time lookups read the release instead of the draft region. | M3-01, M3-03 |
| `RegionRules` (M1) | Replace the "default Gen 1" learnset generation with the region's `rules.data.learnsets`, and the move-availability check with `rules.data.moves`. | M3-03 |

### M3-01 · `Region.moveMachines` model and machine item resolution
`Type: Task` · `Parent: E-M3-1` · `Priority: P0` · `Size: S` · `Labels: area:shared-models, domain:catalog` · `Blocked by: M1-01` · `agent-ready: yes` · `Owner: any`

**Summary:** The region-level list and the helpers every other machine feature uses.

**Acceptance criteria**
- `Region.moveMachines: { label; kind: 'tm' | 'hm'; move: MoveId; reusable: boolean }[]` (Zod + Mongoose, model conventions as in [E-M1-2](m1-battle-core-and-catalog.md#e-m1-2--catalog-moves--learnsets)). Labels are unique within a region and normalized (`TM01`, `HM02`).
- `machineItemId(label) → 'machine:tm01'` and `resolveMachine(region, itemId) → { label, kind, move, reusable } | null`, with tests.
- `isMachineItem(itemId)` recognizes the reserved `machine:` namespace, so the item catalog never needs one document per machine.
- Included in the region's draft content (and, once M0B-21 exists, in the compiled release).

**Changes later:** moves to `libs/core`; compiled into releases with M0B-21; re-checked against the M0B-10/M0B-11 model cleanup.

**Refs:** [12 § TM/HM lists](../architecture/concepts/12-content-catalog-species-moves-items.md#tmhm-lists-decided-oct-2026)

### M3-02 · Gen 1 TM/HM preset
`Type: Task` · `Parent: E-M3-1` · `Priority: P1` · `Size: S` · `Labels: domain:catalog` · `Blocked by: M1-02, M3-01` · `agent-ready: yes` · `Owner: any`

**Summary:** The canonical Red/Blue/Yellow numbering (TM01–TM50, HM01–HM05) as a preset the builder can apply in one step, and that the Kanto Classic template generator reuses. Showdown doesn't store TM numbers.

**Acceptance criteria**
- A checked-in preset (`TM01` → `megapunch` … `HM05` → `flash`), sourced from the pret/pokered disassembly's TM/HM move table, with the exact source file noted in the preset.
- Every move ID exists in the catalog and is available in Gen 1 (a test).
- Gen 1 flags: TMs `reusable: false`, HMs `reusable: true`.

**Refs:** [18](../architecture/concepts/18-rules-time-and-randomness.md) (pret/pokered is the Gen 1 reference)

### M3-03 · Machine compatibility and validation
`Type: Task` · `Parent: E-M3-1` · `Priority: P0` · `Size: S` · `Labels: area:authoring, domain:catalog` · `Blocked by: M1-03, M3-01, M0B-22` · `agent-ready: yes` · `Owner: any`

**Summary:** "Which species can learn this machine?" and the publish-time checks for the list.

**Acceptance criteria**
- `compatibleSpecies(region, label)` and `canLearnMachine(region, speciesId, label)`, using the species' `ResolvedLearnset` for the region's learnset generation (its `machine` list; later, after any learnset override, [27 § Learnsets](../architecture/concepts/27-server-content-library-and-overrides.md#learnsets)). Until `RegionRules` exists (M1), the learnset generation defaults to Gen 1.
- Validator checks registered with the M0B-22 registry: duplicate labels (error), a move that doesn't exist or isn't available in the region's move generation (error), a machine no species in the regional dex can learn (warning).
- Tests with the Gen 1 preset: Pikachu can learn TM24 Thunderbolt; a species without a `1M` source for a machine can't.

**Changes later:** reads the generation from `RegionRules`; play-time lookups read the compiled release (M0B-21); moves to `libs/core`.

**Refs:** [12 § TM/HM lists](../architecture/concepts/12-content-catalog-species-moves-items.md#tmhm-lists-decided-oct-2026), [16](../architecture/concepts/16-authoring-validation-and-portability.md)

### M3-04 · TM/HM list builder (webapp)
`Type: Feature` · `Parent: E-M3-1` · `Priority: P0` · `Size: M` · `Labels: area:webapp, area:authoring, domain:catalog` · `Blocked by: M0B-16, M3-01, M3-02, M3-03, M3-06` · `agent-ready: no` · `Owner: junior`

**Summary:** A webapp screen for managing a region's TM/HM list, built on `libs/authoring` commands (so a Discord editor can be added later without new rules).

**Acceptance criteria**
- Authoring commands: `region.moveMachines.set` (add/edit one machine), `.remove`, `.reorder`, and `.applyPreset` (e.g. Gen 1). Each validates input and returns warnings from M3-03.
- Webapp screen, mobile-first list/detail: a list ("TM24 · Thunderbolt · 12 species"), tap to edit in a detail view with move search (the shared search combobox, filtered to moves available in the region's move generation), remove with confirmation, reorder with drag handles and move up/down, and "Apply Gen 1 preset" (confirms before replacing an existing list). Warnings show next to the affected machine.
- Selecting a machine shows the compatible species from the regional dex.
- Follows [28 § Mobile-first rules](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md#mobile-first-rules), with a Playwright test at phone width.

**Refs:** [16 § Authoring](../architecture/concepts/16-authoring-validation-and-portability.md#authoring-the-same-pattern-for-region-building), [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)

## E-M3-2 · Webapp Builder
`Type: Epic` · `Priority: P0`

MVP authoring is webapp-first and mobile-first (Q36, [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)). This epic sets up the webapp's UI stack and the builder shell every editor uses. **Rule: no webapp authoring work starts before the headless library trial (M3-05) is decided.** Every webapp editor issue, drafted now or later, lists M3-05 (directly or through M3-06) as a blocker. The editors themselves (region map, encounter grid, trainer parties, script steps, condition builder, Region Health) are drafted with their features; the list is in [`mvp.md` § CP1](../roadmap/mvp.md#cp1-boulder-badge) onward.

### M3-05 · Headless library trial: React Aria vs Base UI
`Type: Task` · `Parent: E-M3-2` · `Priority: P0` · `Size: S` · `Labels: area:webapp` · `Blocked by: —` · `agent-ready: no` · `Owner: senior`

**Summary:** Pick the headless component library the whole webapp builder is built on, by trying the top two contenders side by side ([28 § UI stack](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md#ui-stack-off-antd-onto-tailwind-plus-a-headless-library)). **This must finish before any webapp authoring work starts**: M3-06 (the builder shell) and every webapp editor are blocked on it. It has no other dependencies, so it can start any time.

**Acceptance criteria**
- A throwaway branch (or a `trial/` route in the webapp) with the same three components built twice, with shadcn/ui on **React Aria** (the favorite) and on **Base UI**:
  - a dialog that becomes a bottom sheet on phones;
  - a species search combobox over the full species list (1,000+ entries), with keyboard and touch selection;
  - a drag-to-reorder list (e.g. script steps) with a non-drag way to reorder (move up/down).
- A written comparison in the PR: touch behavior on a real phone (iOS Safari and Android Chrome, including inside Discord's in-app browser), screen-reader behavior (VoiceOver or TalkBack spot check), bundle size added, how much code each component took, React 19 / Next 16 support, and whether Tailwind 4 is needed.
- **The owner picks one.** The choice is recorded in [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md) and Q36. The trial code is not merged as-is.

**Refs:** [28 § UI stack](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md#ui-stack-off-antd-onto-tailwind-plus-a-headless-library)

### M3-07 · Move the webapp off antd onto Tailwind and the chosen library
`Type: Task` · `Parent: E-M3-2` · `Priority: P0` · `Size: M` · `Labels: area:webapp, dependencies` · `Blocked by: M3-05` · `agent-ready: no` · `Owner: senior`

**Summary:** antd is used in seven files (`HeaderPrivate`, `HeaderPublic`, `SearchBar`, `ServerCard`, `ProfilePage`, `DiscordIcon`, `ThemeProvider`) alongside Tailwind. Replace it with Tailwind plus the library M3-05 picked, so every builder screen is built mobile-first on one styling system.

**Acceptance criteria**
- The chosen library set up through shadcn/ui, with the components the trial proved out moved into `apps/webapp` properly (not copied from the trial branch as-is).
- Every antd usage replaced; `antd` and `@ant-design/*` removed from `package.json`; the dark/light theme handled with Tailwind (CSS variables) instead of antd's `ConfigProvider`.
- Tailwind upgraded to v4 if the chosen library's current components expect it.
- The existing pages look and behave the same on desktop and work at phone width (a Playwright screenshot at 390×844 and at desktop for each page, attached to the PR).
- `npx nx lint webapp`, typecheck, and the webapp tests pass.

**Refs:** [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)

### M3-06 · Webapp builder shell, mobile-first
`Type: Feature` · `Parent: E-M3-2` · `Priority: P0` · `Size: M` · `Labels: area:webapp, area:authoring` · `Blocked by: M3-05, M3-07, M0B-16` · `agent-ready: no` · `Owner: senior`

**Summary:** The frame every builder screen lives in: who can open a region's draft, the list/detail layout, saving through authoring commands, and conflict handling.

**Acceptance criteria**
- A route per region draft (`/regions/<regionId>/build/...`), reachable only by members with the server's admin/mod roles. Roles are resolved server-side (bot or Discord API), never from the browser ([16](../architecture/concepts/16-authoring-validation-and-portability.md#authoring-the-same-pattern-for-region-building)). Others get a clear "You don't have builder access for this server".
- A tRPC mutation that wraps `authoring.execute(actor, command)` and returns warnings and issues to the form.
- A list/detail layout: full-screen list and detail on phones (with back navigation), side by side from `md:` up.
- Conflicts (`version` mismatch) show "This was changed by X, reload" with a reload button, never a silent overwrite.
- Playwright tests at 390×844 and desktop: open a draft, edit one field of a location through the shell, see the conflict message when the version changed underneath.
- Follows [28 § Mobile-first rules](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md#mobile-first-rules).

**Refs:** [28](../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md), [16](../architecture/concepts/16-authoring-validation-and-portability.md)
