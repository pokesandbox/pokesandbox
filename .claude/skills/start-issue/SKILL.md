---
name: start-issue
description: Use when picking up a PokeSandbox GitHub issue to work on. Reads the issue and its context, checks it's ready, creates the convention-named branch, and writes a plan before any code.
---

# Starting work on an issue

Follow these steps in order. The rules they apply are in `AGENTS.md` (Musts).

## 1. Read the issue and its context

- Read the issue: summary, acceptance criteria, Refs, Blocked by, Changes later, Notes.
- Read its **parent epic's Background** section. It says what to read, where the code goes, and the order of work.
- Read the concept docs the issue links, **Decisions sections first** (they win over the rest of the doc). Read only the linked ones; don't read the whole `docs/architecture/concepts/` folder.
- Read the `AGENTS.md` of every package you expect to touch.

## 2. Check it's ready

Stop and tell the user (don't start coding) if any of these hold:

- The issue is labelled `needs-decision`, or its type is `Decision` or `Spike`.
- It has an open "blocked by" issue.
- It isn't labelled `agent-ready` and you're working without a human directing you.
- Reading the docs leaves a design question the issue doesn't answer. Put it to the user briefly: the question, what the docs do and don't say, and a suggested answer if you have one. Don't decide it in code, and don't post it anywhere yourself: if it needs a maintainer's decision, the user raises it on the issue in their own words.

## 3. Create the branch

```bash
git fetch origin develop
git checkout -b <issue>-<kebab-description> origin/develop   # e.g. 104-encode-architecture-rules
```

Use this name even if your tool or harness suggested a different branch: the PR Gate fails other names. If dependencies aren't installed, run `npm ci` (it also installs the git hooks).

## 4. Check the approach

Before you start changing code, make sure:

- Every acceptance criterion maps to a change.
- You know which target-shape rule from `AGENTS.md` applies to each file and package you'll touch. Check the **Legacy: don't copy** table before copying a pattern from nearby code.
- You know which tests you'll add.
- The work fits the issue's size. If it clearly doesn't, propose splitting the issue now (see `AGENTS.md`, Musts).

When the work is done, use the `ship` skill.
