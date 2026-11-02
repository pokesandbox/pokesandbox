# Copilot instructions

Follow [`AGENTS.md`](../AGENTS.md) at the repo root, and the `AGENTS.md` in the package you're changing (`shared/`, `apps/bot/`, `apps/webapp/`, `libs/core/`). They hold the musts (branch, commit, and PR conventions; checks before pushing) and the architecture rules. Human-facing version: [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Code review checklist

When reviewing a PR, flag:

- Game or authoring logic added inside a Discord menu handler instead of the engine / authoring layer (or, until those exist, a pure function in `libs/core`).
- A library importing `discord.js`, `mongoose`, Showdown (outside `libs/battle`), another workspace package it shouldn't, or using module-level singletons instead of injected ports.
- New ObjectId references to authored or canon content (use content keys and Showdown IDs), or a parent storing an array of its children.
- New requirement or reward fields instead of conditions, gates, and effects.
- Hydrated Mongoose documents cached, shared between sessions, or closed over in callbacks; new helpers in `apps/bot/src/cache`.
- The player called a "trainer" in code, or an effect writing to a character or user.
- Hard-coded or concatenated player-facing sentences, list items with text but no stable `id`, or events carrying finished text instead of references.
- Live records (battles, timers, challenges, trades) without `guildId`, or code assuming one process.
- Discord view builders doing I/O, locked options with no explanation, or custom IDs that embed per-process state for surfaces that must survive a restart.
- tRPC procedures returning documents instead of DTOs, or mutations on `publicProcedure`.
- New antd usage in the webapp, or UI without dark-mode variants.
- Zod / Mongoose schema names that don't follow `fooSchema` / `fooDbSchema`.
- New behavior without tests, `any` / `@ts-ignore` without a reason, or disabled tests and lint rules.
- Commit subjects not in the `[#<issue>] <type>: <summary>` format, or a PR that doesn't close exactly one issue of its own.
