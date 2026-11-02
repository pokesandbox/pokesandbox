# GitHub Org & Project Setup

How the `pokesandbox` org, its repos, and the [PokeSandbox project](https://github.com/orgs/pokesandbox/projects/1) are set up, and how to write issues for it.

**Adding a repo to the org?** Turn on its issues, then run [`scripts/github/bootstrap.sh`](../../scripts/github/bootstrap.sh) `repo pokesandbox/<repo>`. It creates the labels and milestones below and links the repo to the project board. Everything else (issue types, the board, its fields and views) is org-wide and already exists.

## Repositories
| Repo | Notes |
|---|---|
| `pokesandbox` | Monorepo (bot, webapp, shared, `libs/core`, `libs/engine`, `libs/battle`, `libs/authoring`, `libs/presentation`) |
| `pokemon-showdown` (keeps upstream's name after the move, Q20) | Fork: upstream + a small patch set, consumed as a versioned package. Monthly scheduled upstream-sync PR. Fork work is tracked in this repo's own issues (same labels, M0c milestone), as sub-issues of the monorepo's epics. |
| `flowcord` (separate **FlowCord org**, not part of the PokeSandbox org) | An independent dependency (`@flowcord/core` on npm). Menus are single-person today, and the Arena doesn't depend on FlowCord multi-user support (Q34). The FlowCord issues PokeSandbox uses are listed in [E-M2-2 § Background](https://github.com/pokesandbox/pokesandbox/issues/190). |

## Issue types (org-level)
`Epic` · `Feature` · `Task` · `Bug` · `Spike` (time-boxed research with a written outcome) · `Decision` (for *new* architecture decisions only; links to the concept doc)

Use **sub-issues** for Epic → Feature/Task.

## Labels
| Group | Labels |
|---|---|
| Area | `area:engine`, `area:bot`, `area:webapp`, `area:shared-models`, `area:battle`, `area:showdown-fork`, `area:authoring`, `area:presentation`, `area:infra`, `area:docs` |
| Domain | `domain:map`, `domain:scripts`, `domain:conditions-effects`, `domain:progression`, `domain:encounters`, `domain:npcs-trainers`, `domain:catalog`, `domain:players`, `domain:economy`, `domain:transport`, `domain:rules`, `domain:arena`, `domain:text` (passages, flavor, i18n), `domain:trust-safety` |
| Phase | `phase:0-foundations`, `phase:1-arena`, `phase:2-mvp`, `phase:3-full`, `phase:4-sky` |
| Flags | `good first issue`, `help wanted`, `needs-decision`, `blocked`, `breaking-change`, `agent-ready`, `dependencies` |

Labels are per repo; `bootstrap.sh` holds the list. Add a new label there too, so new repos get it.

## Milestones
M0a, M0c, M0b, M1, M2, the Kanto checkpoints CP0a–CP8, and MVP Release, as in [`mvp.md`](mvp.md) (see [`mvp-checkpoints.md`](mvp-checkpoints.md)). Milestones are per repo, with the same titles in each so the board groups them together. Phase 3/4 items go into the project without milestones until MVP ships.

## Project (Projects v2) fields
| Field | Type | Values |
|---|---|---|
| Status | single select | Backlog · Ready · In Progress · In Review · Done |
| Priority | single select | P0 (blocks milestone) · P1 · P2 |
| Size | single select | S · M · L · XL |
| Phase | single select | 0 · 1 · 2 · 3 · 4 |
| Area | single select | mirrors `area:*` |
| Track | single select | Arena · Content · Platform (the two tracks in [`mvp.md`](mvp.md), plus platform work) |
| Skill | single select | agent · any · junior · senior · owner (who should take it, not the assignee) |

**Status** starts at **Ready** for issues with no open blockers and **Backlog** otherwise.

**Views:**
- **Board by Status**, filtered to the current milestone (`milestone:"M0a: Platform Hygiene"` today; update the filter when the milestone changes).
- **Roadmap by Milestone** (timeline grouped by milestone; it needs milestone due dates or a date field to draw bars).
- **Table by Epic** (grouped by parent issue).
- **Decisions** (`type:Decision`).

## Issue templates
| Template | Type | For |
|---|---|---|
| `epic.yml` | Epic | A body of work split into sub-issues: Summary, Background (the context its issues need), Changes once foundations land, Refs |
| `task.yml` | Task | Planned internal work: Summary, Acceptance criteria, Refs, Blocked by, Changes later, Notes, Priority, Size, Skill |
| `planned_feature.yml` | Feature | Planned user-visible work, same fields as a task |
| `decision.yml` | Decision | *Future* decisions only: Context, Options (with pros/cons), Recommendation, Decision, Consequences. Mirrors the concept-doc format so ADRs stay lightweight. |
| `spike.yml` | Spike | Question, Time box, Findings, Recommendation, Follow-up issues |
| `bug_report.yml`, `*_feature_request.yml`, `data_model_request.yml` | Bug / Feature | Reports and suggestions from anyone; triaged into tasks or planned features |

Every template adds the issue to the project. Milestone, labels, parent epic, and "blocked by" are set on the issue after it's created.

## Writing issues
**Read first, in this order:**
1. [`open-questions.md`](../architecture/open-questions.md): Q1–Q38 and the "Smaller decisions" index. This is the decision record.
2. The relevant concept docs' **Decisions** sections. Where a concept's Options or Design text differs from its Decisions, the Decisions win. Struck-through open questions are answered.
3. [`mvp.md`](mvp.md) for milestone scope, the gap matrix, and the Kanto Classic adaptations (in the checkpoints section).

**Rules:**
- Every issue links its concept doc(s) and the Q-numbers it implements, and has acceptance criteria a reviewer can check from the PR alone.
- Every issue has a milestone and a parent epic (sub-issue). An epic's **Background** gives a newcomer the context for its issues (what it is, what to read, where the code goes, the order), linking to [`docs/start-here.md`](../start-here.md) for everything general.
- Split anything bigger than `L` (`S` ≤ 1 day, `M` 2–4 days, `L` 1–2 weeks). Apply `agent-ready` only when no design judgement is left.
- Blockers are GitHub "blocked by" relationships. A blocker that isn't an issue yet goes in the issue's **Blocked by** section.
- When an issue starts ahead of a foundation it will sit on, list the follow-up both under its **Changes later** and on the foundation's issue.
- Keep the Arena critical path (M0c → M1 → M2, needing only `libs/core` from M0a) lean. Hosting stays at the end of M2.
- If writing an issue surfaces a question the docs don't answer, don't decide it inside the issue. Ask the owner (a **Decision** issue if it needs discussion), then record it as the next Q-number (or in the Smaller decisions index), update the concept doc's Decisions, and update `mvp.md`/`roadmap.md`.
- Use the player terms from [23](../architecture/concepts/23-players-characters-journeys-and-scopes.md) (character, journey, and the `user` / `character` / `journey` scopes). Issues that render anything in Discord follow [26](../architecture/concepts/26-discord-surface-and-ux-patterns.md).
- **FlowCord** is a separate org (`flowcord-dev`). Never create or comment on its issues without the owner's approval. Refer to them as `flowcord-dev/flowcord#N`, so GitHub doesn't link them to this repo's issues.

**Still to write:** the rest of M1 (catalog read service details, if needed), the rest of M2 (`/arena` hub, PvAI setup, battle history, alpha test, release notes), and the checkpoint issues from CP0a onward (TM/HM lists, the webapp builder foundation, and trust and safety exist). The candidate issues are the checklists in [`mvp.md`](mvp.md).

**Draft IDs:** the first backlog was drafted as Markdown files and created as issues in Nov 2026. Those issues keep their draft ID (e.g. `M0A-07`) at the bottom of the body, so old references can be found with a search.

## Team & workflow (decided Oct 2026, Q29)
- **Team:** owner (senior), possibly a second senior (commitment TBD), 2 junior-to-mid devs, plus AI agents.
- **Backlog shape:** epics plus self-contained issues, every one attributed to a **milestone**.
- **Review:** every PR needs the owner's review (`CODEOWNERS` = owner). Add the second senior to `CODEOWNERS` for their areas if they commit. Because review is the bottleneck, keep issues small enough for one focused PR.
- **Scheduled agent workflow:** a scheduled job may pick up the next available, highest-priority issue. For that to be safe, issues need machine-readable readiness:
  - Label **`agent-ready`**, applied only when the issue has clear acceptance criteria, links to its concept doc, and no open `needs-decision`.
  - **Priority** (P0–P2) and **Milestone** set. The job picks the highest-priority `agent-ready`, unassigned, **unblocked** issue in the **current milestone**. Use GitHub issue dependencies ("blocked by") to mark blockers.
  - The job **assigns itself before starting** (to avoid double pickup), opens **one PR per issue** linking it, and never picks `Decision`/`Spike` issues or anything labeled `needs-decision`.
  - Agent PRs follow `agents.md` + `copilot-instructions.md`, updated with the architecture rules from these docs. They go through the same owner review.
