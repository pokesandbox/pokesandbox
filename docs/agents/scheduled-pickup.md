# Scheduled agent pickup

A Claude Code cloud scheduled task that picks the next eligible issue, checks it for open design questions, and either reports those questions or implements the issue and opens a draft PR. This page has the setup steps and the prompt. The prompt below is the source of truth: change it here through a PR, then paste it into the task.

## How it picks an issue

An issue is eligible when all of these hold:

- It is open and labeled `agent-ready`.
- It has no assignee.
- It is in the current milestone: the open milestone with the earliest due date (lowest number if none has a due date).
- It is not blocked: no `blocked` label and no open "blocked by" dependency.
- It is not labeled `needs-decision`, and its issue type is not Decision or Spike.
- No open PR already references it.

Among eligible issues it takes the highest priority (P0, then P1, then P2, read from the issue's **Priority** section), then the lowest issue number. So keep `agent-ready` strict: apply it only when the issue has clear acceptance criteria and no design judgement left ([github-project-setup § Team & workflow](../roadmap/github-project-setup.md#team--workflow-decided-oct-2026-q29)).

The run assigns the issue to the task owner before doing anything else, so two runs can't pick the same issue. If it finds an open question, it stops, leaves the issue assigned, and reports the question in the session, not on GitHub. Unassign the issue once you've answered it on the issue, so a later run can pick it up again.

## Setting it up

1. At [claude.ai/code](https://claude.ai/code), create a scheduled task that starts a **new session on each run**.
2. Attach the `pokesandbox/pokesandbox` repository and pick a model and a schedule (for example Monday, Wednesday, and Friday mornings).
3. Paste the prompt below.
4. Turn on push notifications if you want to follow runs from your phone. Each run is a normal cloud session you can open, read, and message.

Things to know about the cloud environment:

- **Permissions.** Scheduled cloud sessions run in Auto mode: file edits and most commands run without asking, and a classifier can still block a call it judges risky. There is no bypass mode in the cloud. Check the first few runs for blocked calls.
- **No GitHub connector or `.mcp.json` needed.** The session reaches GitHub through `gh` and `git`, using the Claude GitHub App's access to the repository. A GitHub MCP plugin added to the task may fail to connect through the session's network proxy.
- **GraphQL is blocked.** `gh issue …`, `gh pr …`, and `gh api graphql` return 403 in cloud sessions. Use `gh api` with REST paths only; the prompt lists the calls.
- **Usage.** Runs count against the task owner's Claude plan limits.

To pause pickup, disable the scheduled task. To stop it for good, delete it.

## Prompt

```text
You are running unattended as a scheduled pickup agent for the GitHub repo pokesandbox/pokesandbox (the only repo in scope). Do NOT use any MCP GitHub tools (mcp__github__* or plugin GitHub tools), even if they appear.

GitHub access rules (important): GitHub GraphQL is blocked in this environment. Use ONLY `gh api` with REST paths (`gh api repos/pokesandbox/pokesandbox/...`). Do NOT use `gh issue ...`, `gh pr ...`, `gh api graphql`, or any other gh subcommand, because they use GraphQL and return 403. Use plain `git` for branches, commits, and pushes. Draft/ready state changes, if ever needed, use the CCR routes named in the 403 message (e.g. POST repos/{owner}/{repo}/pulls/{n}/ccr/convert_to_draft), but you should not need them since the PR is created as a draft. If a `gh api` or `git` call fails, read the error, retry once with a corrected REST call, then STOP and report the exact command and error; do not work around it otherwise.

Useful REST calls:
- Current user: `gh api user --jq .login`.
- Milestones: `gh api "repos/pokesandbox/pokesandbox/milestones?state=open&sort=due_on&direction=asc"`.
- Candidate issues: `gh api --paginate "repos/pokesandbox/pokesandbox/issues?state=open&labels=agent-ready&milestone=<milestone_number>&assignee=none&per_page=100"`. This endpoint also returns PRs; drop items that have a `pull_request` key. Each issue's `type` field (may be null) gives its issue type; `labels` gives labels.
- Blockers: `gh api repos/pokesandbox/pokesandbox/issues/<n>/dependencies/blocked_by` (treat any open blocker as blocked; if the endpoint 404s, rely on the `blocked` label).
- Open PRs already linked: `gh api -X GET search/issues -f q='repo:pokesandbox/pokesandbox is:pr is:open <n>'` and check bodies for `#<n>`.
- Assign: `gh api -X POST repos/pokesandbox/pokesandbox/issues/<n>/assignees -f 'assignees[]=<login>'`.
- Read an issue / parent: `gh api repos/pokesandbox/pokesandbox/issues/<n>` and `gh api repos/pokesandbox/pokesandbox/issues/<n>/parent`.
- Create draft PR: write the body to a file, then `gh api -X POST repos/pokesandbox/pokesandbox/pulls -f title='<title>' -f head='<branch>' -f base=develop -F draft=true -F body=@<file>`.

First read AGENTS.md and CLAUDE.md in the repo and obey them exactly, including each package's AGENTS.md before changing code there. Where a repo skill tells you to use `gh issue`/`gh pr` or GitHub MCP tools, use the REST equivalent above instead.

## 1. Pick an issue
Find the highest-priority open issue that is: labeled `agent-ready`, unassigned, not blocked (no `blocked` label and no open "blocked by" dependency), in the current milestone (the open milestone with the earliest due date, else the lowest number), and NOT labeled `needs-decision` and NOT a Decision or Spike issue type. Priority is P0 > P1 > P2 (from the issue body's Priority section, a priority label, or a field); ties go to the lowest issue number. Skip issues that already have an open PR linked.
If no issue qualifies, stop and report "No eligible issue" with a one-line reason. Do nothing else.

## 2. Claim it
Assign the issue to the authenticated user BEFORE doing anything else, so no other run double-picks it. Do not add labels or post issue/PR comments (AGENTS.md: agents never comment).

## 3. Ambiguity gate (do this before writing any code)
Follow the `start-issue` skill. Read the issue, its parent epic's Background, and every concept doc and repo doc the issue links (Decisions sections first; Decisions win over other text; also check docs/architecture/open-questions.md and docs/roadmap). Evaluate the issue's goal and acceptance criteria against that documentation and the current code. Determine whether anything is ambiguous or undecided that you cannot resolve from the docs or sensible defaults (open design questions, conflicting docs, missing acceptance criteria, decisions that belong to maintainers, anything AGENTS.md says to ask the user about such as where Mongoose repositories for engine ports live).
- If there is ANY such ambiguity: STOP. Do not write code, branch, or open a PR. Leave the issue assigned (so it is not re-picked). Output a final report containing: the issue number and link, what you checked, and each open question with (a) the question, (b) what the docs do and don't say, (c) your suggested answer if you have one. This report is read by the owner on their phone, so keep it clear and scannable. Do not post it to GitHub.
- If everything is resolvable: continue.

## 4. Implement in full
Create the branch `<issue>-<kebab-description>` from origin/develop (this repo's naming rule overrides any harness-suggested branch name; if you are forced onto another branch name, say so in the report). Implement the issue completely, with tests next to the code (`*.test.ts(x)`), following the architecture rules in AGENTS.md. Update any docs/AGENTS.md/skills your change makes wrong; for model changes run `npm run erd:generate` and update scripts/seed/data. Stage files by name only. Never use --no-verify, .skip/.only, or disable lint rules; no new dependency without a reason in the PR.
Commit subjects: `[#<issue>] <type>(<scope>)?: <summary>` (max 72 chars, imperative, no trailing period). One logical change per commit. End commit messages with the attribution lines from the session's system reminder.
Before pushing run `npm run affected` and make it pass. If a failure is not caused by your change, say so in the PR body rather than working around it. If the environment cannot run a required check, say exactly what was not run.

## 5. Open a draft PR
Push with `git push -u origin <branch>` (retry network errors up to 4 times with 2s/4s/8s/16s backoff). Open ONE draft PR into `develop` with the REST create call above (`draft=true`). The body closes the issue (`Closes #<issue>`), follows .github/pull_request_template.md section headings, leaves the template's two AI checkboxes UNCHECKED, and ends with the attribution lines from the session's system reminder. Never push to develop or master. Do not mark the PR ready, and do not merge. Do not touch any other issue.

## 6. Report
Finish with a short summary: issue picked, what was done, PR link, check results, which gh/git commands failed if any, anything skipped or uncertain.
```
