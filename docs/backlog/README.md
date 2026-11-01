# Backlog Drafts

New here? Start with [`docs/start-here.md`](../start-here.md).

Issue drafts reviewed here before they're created in GitHub. Once created, the issue is the source of truth, and the mapping table below records where each draft went.

| File | Milestone |
|---|---|
| [`m0a-platform-hygiene.md`](m0a-platform-hygiene.md) | M0a: Platform Hygiene |
| [`m0c-arena-foundations.md`](m0c-arena-foundations.md) | M0c: Arena Foundations (the Arena track's first step) |
| [`m0b-content-foundations.md`](m0b-content-foundations.md) | M0b: Engine & Content Foundations |
| [`m1-battle-core-and-catalog.md`](m1-battle-core-and-catalog.md) | M1: Battle Core & Catalog (moves and learnsets catalog; Arena epics: BattleService, teams and formats, AI) |
| [`m2-launch-readiness.md`](m2-launch-readiness.md) | M2: Arena Release (FlowCord dependencies, launch readiness, and the Arena multiplayer surface, so far) |
| [`m3-region-authoring.md`](m3-region-authoring.md) | Region authoring epics (TM/HM lists, webapp builder foundation), landing in **CP1** |
| [`m6-kanto-classic-and-release.md`](m6-kanto-classic-and-release.md) | Trust & safety (M6-02 lands in **CP4**, M6-01 in the **MVP Release**) |
| *(the rest of M1 and the checkpoint issues, CP0a onward, drafted once M0a is underway)* | |

**Milestones vs file names (Nov 2026):** the MVP's milestones are now the Kanto checkpoints (CP0a–CP8, then the MVP Release; see [`mvp-checkpoints.md`](../roadmap/mvp-checkpoints.md)). Files and draft IDs keep their original `M3`/`M6` names as stable references; each issue's milestone is the checkpoint that first needs it, as listed in [`mvp.md`](../roadmap/mvp.md#the-kanto-checkpoints-cp0acp8).

## Format
Each issue is a `###` heading with a **stable draft ID** (`M0A-07`, `M0B-12`) followed by a field line, then the body.

```
### M0A-07 · Title
`Type: Task` · `Parent: E-M0A-1` · `Priority: P1` · `Size: M` · `Labels: area:bot` · `Blocked by: M0A-04` · `agent-ready: yes` · `Owner: junior`
```

| Field | Values / meaning |
|---|---|
| ID | `E-<MS>-n` = epic. `<MS>-nn` = child issue. IDs are only for drafting and cross-references before GitHub numbers exist. |
| Type | `Epic`, `Feature` (user-visible), `Task` (internal) |
| Parent | The epic the issue becomes a sub-issue of |
| Priority | `P0` blocks the milestone · `P1` needed for the milestone · `P2` nice to have |
| Size | `S` ≤ 1 day · `M` 2–4 days · `L` 1–2 weeks (consider splitting) |
| Blocked by | Draft IDs. Becomes GitHub "blocked by" dependencies. |
| agent-ready | `yes` = clear acceptance criteria, concept-doc links, no open decision. Eligible for the scheduled agent. `no` = needs owner/senior design judgement or account access. |
| Owner | Suggested only: `owner`, `senior`, `junior`, `agent`, or `any` |

Bodies use **Summary**, **Acceptance criteria**, and **Refs** (concept docs). Acceptance criteria are written so a reviewer can check them from the PR alone.

## Drafting more issues (for new sessions)
Everything needed to draft the remaining milestones is in the repo. Nothing depends on the conversations that produced these docs.

**Still to draft:** the rest of M1 (catalog read service details, if needed), the rest of M2 (`/arena` hub, PvAI setup, battle history, alpha test, release notes), and the checkpoint issues (CP0a onward; TM/HM lists, the webapp builder foundation, and trust and safety are drafted). The candidate issues are the checklists in [`mvp.md`](../roadmap/mvp.md). Expand them into drafts in a new file per checkpoint (e.g. `cp0a-pallet-town.md`), using the existing files as the style reference.

**Every milestone file starts with a "Start here" section** giving a newcomer the context for that file (what it is, what to read, where the code goes, the order), linking to [`docs/start-here.md`](../start-here.md) for everything general. Keep that pattern for new files.

**Read first, in this order:**
1. [`open-questions.md`](../architecture/open-questions.md): Q1–Q38 and the "Smaller decisions" index. This is the decision record.
2. The relevant concept docs' **Decisions** sections. Where a concept's Options or Design text differs from its Decisions, the Decisions win. Struck-through open questions are answered.
3. [`mvp.md`](../roadmap/mvp.md) for milestone scope, the gap matrix, and the Kanto Classic adaptations (in the checkpoints section).

**Rules:**
- Every issue links its concept doc(s) and the Q-numbers it implements, and has checkable acceptance criteria.
- Split anything bigger than `L`. Mark `agent-ready: yes` only when no design judgement is left.
- Keep the Arena critical path (M0c → M1 → M2, needing only `libs/core` from M0a) lean. Hosting stays at the end of M2.
- If drafting surfaces a question the docs don't answer, don't decide it inside an issue. Ask the owner, then record it as the next Q-number (or in the Smaller decisions index), update the concept doc's Decisions, and update `mvp.md`/`roadmap.md`.
- Use the player terms from [23](../architecture/concepts/23-players-characters-journeys-and-scopes.md) (character, journey, and the `user` / `character` / `journey` scopes). Issues that render anything in Discord follow [26](../architecture/concepts/26-discord-surface-and-ux-patterns.md).
- **FlowCord** is a separate org (`flowcord-dev`). Never create or comment on its issues without the owner's approval. Current dependencies: flowcord#105–#107 (see [M2 § FlowCord dependencies](m2-launch-readiness.md#flowcord-dependencies)).

## Creating issues
1. The owner reviews and edits these files (this PR).
2. Org setup: transfer repos, install the Claude GitHub App on the org, create the project.
3. The owner runs [`scripts/github/bootstrap.sh`](../../scripts/github/bootstrap.sh): `labels`, `milestones`, and `project`.
4. Claude creates epics, then child issues (types, milestones, labels, sub-issue links, blockers) and fills in the mapping below.
5. The owner runs `bootstrap.sh add-issues` with the created issue numbers, then sets the Priority/Size/Status fields (or asks Claude to list them per issue).

## Mapping (draft ID → GitHub issue)
| Draft ID | Issue |
|---|---|
| *(filled in on creation)* | |
