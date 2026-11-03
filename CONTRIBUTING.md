# Contributing to PokeSandbox

Thanks for wanting to help. This page covers how work is picked up, how to open a pull request, and the checks your change has to pass. To get the project running locally first, see [Local development](docs/local-development.md).

Most of the architecture is already decided and written down, and every PR is reviewed by a maintainer, so the process is built around small PRs from issues that are ready to work on. Building on a decided design from a well-scoped issue is the fastest way to get a change merged.

## Before you start

- Read [`docs/start-here.md`](docs/start-here.md): what PokeSandbox is, the plan, and the architecture in ten lines.
- Come say hi on the [Discord server](https://discord.gg/5BSMak3m9V), especially before taking on something large.

## Finding something to work on

- All work is tracked as issues on the [project board](https://github.com/orgs/pokesandbox/projects/1), grouped by milestone. Issues labelled [`good first issue`](https://github.com/pokesandbox/pokesandbox/labels/good%20first%20issue) are a good place to start.
- Pick an issue whose **Status** is **Ready**, that is unassigned, and that isn't labelled `needs-decision`. `Decision` and `Spike` issues are for the maintainers.
- Comment on an issue before starting so it can be assigned to you.
- Found a bug or have an idea? [Open an issue](https://github.com/pokesandbox/pokesandbox/issues/new/choose) from one of the templates first. Every PR must close an issue, so a PR without one can't be merged. How planned issues are written: [Writing issues](docs/roadmap/github-project-setup.md#writing-issues).

## Architecture

- The rules for building the new shape (package layering, content keys, conditions and effects, the cache policy, player terms, Discord and i18n rules) are in [`AGENTS.md`](AGENTS.md#architecture-rules), with an `AGENTS.md` in each package for the details. They apply to humans and AI agents alike.
- Much of today's code is the **old shape** and is being migrated, so "do what the file next to it does" can be wrong. Check the [Legacy: don't copy](AGENTS.md#legacy-dont-copy) table before copying a pattern.
- The concept docs in [`docs/architecture/concepts/`](docs/architecture/concepts/) explain each design. Where a concept's Options or Design text differs from its **Decisions** section, the Decisions win. [`open-questions.md`](docs/architecture/open-questions.md) is the decision record.
- If your change touches the architecture, or the issue leaves a design question open, raise it on the issue (or open a `Decision` issue if it needs discussion). Don't decide it in code; answers get recorded in `open-questions.md`.

## Branches and pull requests

- Branch from `develop` and name the branch `<issue#>-<short-overview>`, e.g. `103-ci-sonar-pr-automation`. The **Linked issue** check fails on other branch names.
- Open the PR against `develop` and fill in the template. The description must close the issue with a closing keyword (`Closes #123`); linking it from the sidebar doesn't count. The **Linked issue** check enforces this. Opening the PR as a draft moves the issue to **In Progress** on the board; marking it ready moves it to **In Review**. Mark it ready once the checks pass.
- Every PR needs a maintainer's review. PRs are merged with a merge commit, not squashed.

### One issue per PR, and splitting a PR

One issue per PR is the convention. It isn't a hard block (the check only needs at least one open issue), because two tiny related issues can sometimes share a PR. The check warns when a PR closes more than one.

If a PR grows bigger than its issue (bigger than the issue's size, or too big for a reviewer to check the acceptance criteria from the PR alone), split the **issue**, not just the PR:

1. Narrow the original issue to what this PR delivers.
2. Move the rest into a new issue: a sub-issue of the same epic, blocked by the original if it depends on it.
3. Each PR closes its own issue. For example, splitting #104:
   - PR 1, branch `104-…`: `Closes #104`.
   - PR 2, branch `215-…` (#215 is the new issue): `Closes #215` and `Part of #104`.

Never put `Closes #104` on both PRs. The first merge closes #104 and moves it to **Done**, so the second PR fails the **Linked issue** check (it needs an open issue), and the board shows #104 as finished while work remains.

### Commit messages

```
[#104] docs: add contributing guidelines for split PRs
```

- `[#<issue>] <type>(<scope>)?: <summary>`: the issue number first, so the commit links to its issue on GitHub. At most 72 characters, imperative mood, no trailing period.
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `style`, `perf`, `build`. The scope is optional (`refactor(shared): …`).
- Add a body only to explain _why_. Keep one logical change per commit: merge commits keep every commit on `develop`, so the history is only as readable as its subjects.
- The `commit-msg` hook checks the format, and the **Linked issue** check verifies every commit in the PR. Merge, revert, `fixup!`, and `squash!` commits are exempt.

## Code standards

- TypeScript in strict mode. No `any`, `@ts-ignore`, or non-null `!` without a one-line reason.
- New behavior needs tests: `*.test.ts` (or `.test.tsx`) next to the code, run with `npx nx test <project>`. Use only the `.test` suffix; CI fails on `*.spec.*` files.
- SonarCloud requires 80% coverage of the lines a PR adds or changes. Check before pushing with `npx nx test <project> --coverage`, which also writes a line-by-line report to `coverage/<project>/index.html`.
- Don't reformat code you didn't change (the hooks only format what you stage).
- No new dependency without a reason in the PR description.
- Model changes: run `npm run erd:generate` and update the seed data in `scripts/seed/data/`.
- Never commit `.env`, tokens, or real server IDs.

## Checks

Every PR into `develop` runs [CI](.github/workflows/ci.yml): a Prettier format check on the whole repo, then lint, typecheck, build, and unit tests for the projects the PR affects (`nx affected`), plus a [SonarCloud](https://sonarcloud.io/summary/new_code?id=pokesandbox_pokesandbox) analysis. Pushes to `develop` run everything. Run the same checks locally before pushing:

| Script                  | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| `npm run affected`      | Lint, typecheck, and test the projects you changed (compared to `origin/develop`) |
| `npm run lint`          | Lint every project                                                                |
| `npm run typecheck`     | Typecheck every project                                                           |
| `npm run test`          | Run every project's unit tests                                                    |
| `npm run test:coverage` | Run every project's unit tests with coverage (`coverage/`)                        |
| `npm run format`        | Format the whole repo with Prettier (also sorts imports)                          |
| `npm run format:check`  | Check formatting without writing (what CI runs)                                   |

**What blocks a merge:** the required checks **CI**, **Linked issue** (closing keyword, open issue, branch name, commit subjects), and **SonarCloud Code Analysis** (quality gate), plus a maintainer's review.

## Formatting, import order & git hooks

You don't need to format code or order imports by hand. Prettier formats everything and sorts imports into groups, alphabetised, with a blank line between groups:

1. Node built-ins (`node:fs`, `path`)
2. npm packages (`discord.js`, `zod`, `@flowcord/core`)
3. Other workspace packages (`@shared/*`, `@core/*`)
4. The current package (`@bot/*` or `@webapp/*`, then relative imports)

`npm install` sets up three git hooks ([husky](https://typicode.github.io/husky/)):

- **pre-commit** runs `eslint --fix` and `prettier --write` on your staged files and adds the fixes to the commit. Only ESLint errors that can't be fixed automatically stop the commit.
- **commit-msg** checks the [commit message format](#commit-messages).
- **pre-push** typechecks the projects you changed.

Build and tests run in CI, not in the hooks. Enable format-on-save with Prettier in your editor for the same result while you work.

The repo-wide format commit is listed in `.git-blame-ignore-revs`. GitHub skips it in blame automatically; to do the same locally, run `git config blame.ignoreRevsFile .git-blame-ignore-revs` once.

## AI-assisted development

AI tools are welcome. The bar doesn't change with how the code was written: you must understand everything you submit and be able to explain each design decision in review. Read the whole diff before opening a PR, and check AI-written code against the architecture rules yourself.

AI can write artifacts (code, commit messages, PR descriptions), but never use it to talk to people. Write issue and PR comments, review replies, and questions yourself, briefly and in your own words. Use AI to understand a problem, not to argue it: a short human message is easier to answer than a long generated one. Agents follow the same rule, so they bring questions to you instead of posting them.

The PR template has two checkboxes: one discloses that you used AI tools (no judgement either way), and one attests that you've read every line and can explain it. They are the human contributor's attestation, so an AI agent opening a PR leaves them unchecked for you to fill in.

To have an agent pick up `agent-ready` issues on a schedule, set up a Claude Code cloud scheduled task with the prompt in [`docs/agents/scheduled-pickup.md`](docs/agents/scheduled-pickup.md). Change the prompt there through a PR, not only in your task.

### AI context files

The repo ships context for coding agents. It describes the same rules as this page, plus the repo layout and commands:

| File                                             | For                                                                                                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                         | The rules every agent loads: musts, architecture rules, the legacy table                                                                                                                                            |
| `AGENTS.md` in each package                      | Package conventions (`shared/`, `apps/bot/`, `apps/webapp/`, `libs/core/`). Each package also has a one-line `CLAUDE.md` that imports it, because Claude Code reads only `CLAUDE.md` files once the root one exists |
| [`CLAUDE.md`](CLAUDE.md)                         | Imports `AGENTS.md` for Claude Code                                                                                                                                                                                 |
| [`.claude/skills/`](.claude/skills/)             | Step-by-step procedures: picking up an issue, shipping a PR, adding a model                                                                                                                                         |
| [`.claude/settings.json`](.claude/settings.json) | Claude Code hooks: install dependencies in cloud sessions, run `npm run affected` before a push                                                                                                                     |

If your PR changes a convention, command, or structure these files describe, update them in the same PR.
