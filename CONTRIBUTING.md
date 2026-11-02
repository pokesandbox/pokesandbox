# Contributing to PokeSandbox

Thanks for wanting to help. This page covers how work is picked up, how to open a pull request, and the checks your change has to pass. To get the project running locally first, see [Local development](docs/local-development.md).

## Before you start

- Read [`docs/start-here.md`](docs/start-here.md): what PokeSandbox is, the plan, and the architecture in ten lines.
- Come say hi on the [Discord server](https://discord.gg/5BSMak3m9V), especially before taking on something large.

## Finding something to work on

- All work is tracked as issues on the [project board](https://github.com/orgs/pokesandbox/projects/1), grouped by milestone. Issues labelled [`good first issue`](https://github.com/pokesandbox/pokesandbox/labels/good%20first%20issue) are a good place to start.
- Found a bug or have an idea? [Open an issue](https://github.com/pokesandbox/pokesandbox/issues/new/choose) from one of the templates. How planned issues are written: [Writing issues](docs/roadmap/github-project-setup.md#writing-issues).
- Comment on an issue before starting so it can be assigned to you.

## Branches and pull requests

- Branch from `develop` and name the branch `<issue#>-<short-overview>`, e.g. `103-ci-sonar-pr-automation`.
- Keep one issue per PR, and follow the architecture rules in [`.github/agents.md`](.github/agents.md).
- Open the PR against `develop` and fill in the template. The description must close the issue with a closing keyword (`Closes #123`); linking it from the sidebar doesn't count. The **Linked issue** check enforces this. Opening the PR as a draft moves the issue to **In Progress** on the board; marking it ready moves it to **In Review**.
- Every PR needs a maintainer's review. PRs are merged with a merge commit, not squashed.

## Checks

Every PR into `develop` runs [CI](.github/workflows/ci.yml): a Prettier format check on the whole repo, then lint, typecheck, build, and unit tests for the projects the PR affects (`nx affected`), plus a [SonarCloud](https://sonarcloud.io/summary/new_code?id=pokesandbox_pokesandbox) analysis. Pushes to `develop` run everything. Run the same checks locally before pushing:

| Script                  | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `npm run affected`      | Lint, typecheck, and test the projects you changed         |
| `npm run lint`          | Lint every project                                         |
| `npm run typecheck`     | Typecheck every project                                    |
| `npm run test`          | Run every project's unit tests                             |
| `npm run test:coverage` | Run every project's unit tests with coverage (`coverage/`) |
| `npm run format`        | Format the whole repo with Prettier (also sorts imports)   |
| `npm run format:check`  | Check formatting without writing (what CI runs)            |

## Formatting, import order & git hooks

You don't need to format code or order imports by hand. Prettier formats everything and sorts imports into groups, alphabetised, with a blank line between groups:

1. Node built-ins (`node:fs`, `path`)
2. npm packages (`discord.js`, `zod`, `@flowcord/core`)
3. Other workspace packages (`@shared/*`, `@core/*`)
4. The current package (`@bot/*` or `@webapp/*`, then relative imports)

`npm install` sets up two git hooks ([husky](https://typicode.github.io/husky/)):

- **pre-commit** runs `eslint --fix` and `prettier --write` on your staged files and adds the fixes to the commit. Only ESLint errors that can't be fixed automatically stop the commit.
- **pre-push** typechecks the projects you changed.

Build and tests run in CI. To skip the hooks once, use `--no-verify`; to turn them off, set `HUSKY=0`. Enable format-on-save with Prettier in your editor for the same result while you work.

The repo-wide format commit is listed in `.git-blame-ignore-revs`. GitHub skips it in blame automatically; to do the same locally, run `git config blame.ignoreRevsFile .git-blame-ignore-revs` once.
