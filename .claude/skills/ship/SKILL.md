---
name: ship
description: Use when committing, pushing, or opening a pull request in PokeSandbox. Checks the change still fits its issue, runs the affected checks, writes convention-format commits, and opens a draft PR that passes the PR Gate.
---

# Shipping a change

The rules are in `AGENTS.md` (Musts); this is the order to apply them.

## 1. Does the change still fit the issue?

If the diff has grown past the issue's size, or a reviewer couldn't check the acceptance criteria from this PR alone, split the **issue** before going on:

1. Draft, for the user, the original issue narrowed to what this PR delivers.
2. Draft a new sub-issue (same epic) for the rest. The user edits and files both; don't post them yourself.
3. This PR closes the original. The follow-up PR, on branch `<new-issue>-…`, says `Closes #<new>` and `Part of #<original>`.

Never write `Closes #N` for the same issue in two PRs.

## 2. Run the checks

```bash
git fetch origin develop
npm run affected      # lint, typecheck, test for the changed projects and their dependents
```

Fix every failure. Never use `--no-verify`, `.skip` / `.only`, or disable a lint rule. If a failure is unrelated to your change, stop and report it; mention it in the PR.

If you changed source in `apps/bot`, `apps/webapp`, `shared`, or `libs/core`: run `npx nx test <project> --coverage` and check your new and changed lines are covered (SonarCloud fails the PR below 80%).

If you changed a model: `npm run erd:generate` and update `scripts/seed/data/`.

## 3. Commit

- Stage files by name: `git add path/to/file …`. Never `git add -A` or `git add .`.
- Subject: `[#<issue>] <type>(<scope>)?: <summary>`, ≤ 72 characters, imperative, no trailing period. Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `style`, `perf`, `build`.
- Body only for _why_. One logical change per commit.
- Use `git commit -m` or a heredoc (`git commit -F - <<'EOF'`). The pre-commit hook formats staged files and the commit-msg hook checks the subject; if a hook fails, fix the cause and commit again.

## 4. Push and open a draft PR

```bash
git push -u origin <branch>
```

Open the PR against `develop` **as a draft**, following `.github/pull_request_template.md`:

- **Linked issue:** `Closes #<issue>` (plus `Part of #<original>` for a split follow-up).
- **What changed and why:** a short bulleted list; the issue has the context.
- **Manual checks:** what you verified by hand and the commands you ran. For bot changes, whether the bot starts and the changed menu works; for webapp UI, light- and dark-mode screenshots. Say plainly what you couldn't verify.
- **Checklist:** leave both AI checkboxes **unchecked**. They're the human's attestation; tell the user to review the diff and tick them.

## 5. Mark it ready

When **CI**, **Linked issue**, and **SonarCloud Code Analysis** pass, mark the PR ready for review (this moves the issue to In Review). If a check fails, fix it with a new commit; don't rewrite pushed history. The one exception: commit subjects the Linked issue check flags, which you reword and push with `--force-with-lease`.
