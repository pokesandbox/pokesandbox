# apps/bot: agent instructions

The Discord bot: discord.js plus [FlowCord](https://github.com/flowcord-dev/flowcord) (`@flowcord/core`) menus. It is the game host: it wires the engine and the battle service and renders their events in Discord. Root rules: [`../../AGENTS.md`](../../AGENTS.md). Read [26: Discord surface & UX patterns](../../docs/architecture/concepts/26-discord-surface-and-ux-patterns.md) before building any screen.

## Where things are

| Path                                         | Holds                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/interactions/guilds/dev/slashCommands/` | Slash commands, grouped by domain (`regionManagement/`, `serverManagement/`). Registered through each folder's `index.ts` |
| `src/classes/`                               | `AdminMenuBuilder` (FlowCord builder for admin menus), `BotClient`                                                        |
| `src/structures/`                            | Command interfaces (`ISlashCommand`), command options (permissions, cooldowns), managers                                  |
| `src/utils/`                                 | Autocomplete helpers, option parsing (`parseCommandOptions` + a Zod schema), modal value helpers                          |
| `src/embeds/`                                | `errorEmbed` and list/pagination helpers                                                                                  |
| `src/cache/`                                 | **Legacy** cache helpers for hydrated docs (see below)                                                                    |

Reference command: the Pokédex builder, [`regionManagement/pokedex/`](src/interactions/guilds/dev/slashCommands/regionManagement/pokedex/): a command file per menu, `*.embeds.ts` for view builders, `types.ts` for menu state, options parsed with a Zod schema.

## Rules

- **No game or authoring logic in handlers.** Button, select, and modal callbacks turn input into an engine action (`engine.dispatch`) or an authoring command (`authoring.execute`) and render the result ([03](../../docs/architecture/concepts/03-engine-boundary-and-game-loop.md)). Until those libraries exist (#153, #145), put new rules in pure functions in `libs/core`, not here.
- **Pure view builders.** Embed / Components v2 builders take data and return JSON: no DB calls, no awaits, so they can be snapshot-tested. Fetch in the action, then render.
- **FlowCord sessions hold IDs, not documents.** Store `regionId`, `journeyId`, `battleId` in session state and re-fetch in every callback; never close over a document from an earlier interaction. FlowCord is single-user and in-memory ([26 § FlowCord patterns](../../docs/architecture/concepts/26-discord-surface-and-ux-patterns.md#flowcord-patterns)).
- **Restart-safe surfaces** (Arena challenges, public battle messages, trades) are plain discord.js handlers with stable custom IDs that encode only persisted data: `<feature>:<verb>:<recordId>`.
- **Locked options always explain themselves**: a 🔒 marker plus a reachable reason, never a bare disabled button. The explanation comes from the engine.
- **Fixed engine-response wording** ([26 § Menus and feedback](../../docs/architecture/concepts/26-discord-surface-and-ux-patterns.md#menus-and-feedback)): "Updated: that menu was out of date", "This game was continued in another session", "Still working on your last action…", "Battle is resuming, press again in a moment".
- **Player-facing text** goes through `t(key, params)` once #115 lands; never build sentences by concatenation. Until then, keep new strings in one place per feature so the migration is mechanical.
- **Feature flags**: the Discord authoring commands sit behind `discord.authoring` (on in dev, off in prod). New unreleased commands declare a flag (#109, #108).
- **Errors**: user-facing errors use `buildErrorEmbed` (`src/embeds/errorEmbed.ts`).

## Legacy: don't extend

- **`src/cache/`** (`getCachedRegion` → mutate → `saveRegion`) caches and shares hydrated mutable Mongoose documents, which concept [15](../../docs/architecture/concepts/15-persistence-concurrency-and-runtime.md#recommendations) rules out. Don't add helpers for new models. Read fresh per action (or `lean()` for cached reads) and write with atomic updates. #119 replaces it.
- **The `/region` builders** (Pokédex, progressions, locations) keep their logic in handlers; #146–#148 move them onto authoring commands. When editing them for another issue, keep the change minimal and don't add new logic there.
- **`/server` prefixes** and the message-command pipeline are being removed (#106).
- **Per-guild registration** under `interactions/guilds/dev` becomes global registration with flags (#108).

## Checks

`npx nx test bot`, `npx nx lint bot`, `npx nx typecheck bot`. Bot changes need a manual check in the PR (the bot starts, the changed menu works), since there are no e2e tests yet.
