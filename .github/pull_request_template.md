## Linked issue

Closes #

> The closing keyword must be in this description (e.g. `Closes #123`); linking from the sidebar doesn't count. The **Linked issue** check fails without it. Opening the PR as a draft moves the issue to **In Progress**; marking it ready moves it to **In Review**.

## What changed and why

<!-- The change and the reasoning behind this approach — not a line-by-line of what the code does. Link the concept doc(s) and Q-numbers it implements. -->

## Acceptance criteria

<!-- Copy the issue's acceptance criteria and say how each one is met (or why it isn't, and the follow-up issue). -->

- [ ]

## Test coverage

<!-- What tests were added or updated. If none, explain why none are needed. -->

## Manual checks

<!-- Anything a reviewer can't see from the diff: the bot starts, the webapp signs in, screenshots of UI changes (light and dark mode). Delete if not applicable. -->

## Checklist

- [ ] I followed [`.github/agents.md`](../blob/develop/.github/agents.md) and the linked concept docs' **Decisions**
- [ ] `npm run affected` (lint, typecheck, test) passes locally
- [ ] Docs are updated if behaviour or decisions changed (concept doc, `open-questions.md`, `mvp.md`)
- [ ] Any pre-existing failure this PR skips is noted above, with a follow-up issue
- [ ] I used AI assistance to write some or all of this code
- [ ] I have read every line of this PR and can independently explain each architectural decision without AI assistance
