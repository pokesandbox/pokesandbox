# apps/bot: agent instructions

The Discord bot: discord.js plus [FlowCord](https://github.com/flowcord-dev/flowcord) (`@flowcord/core`) menus. It is the game host: it wires the engine and the battle service and renders their events in Discord. Root rules: [`../../AGENTS.md`](../../AGENTS.md). Read [26: Discord surface & UX patterns](../../docs/architecture/concepts/26-discord-surface-and-ux-patterns.md) before building any screen.

## Where things are

| Path                              | Holds                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/interactions/slashCommands/` | Slash commands, grouped by domain (`regionManagement/`, `serverManagement/`). Registered through each folder's `index.ts` |
| `src/classes/`                    | `AdminMenuBuilder` (FlowCord builder for admin menus), `BotClient`                                                        |
| `src/structures/`                 | Command interfaces (`ISlashCommand`), command options (permissions, cooldowns), managers                                  |
| `src/utils/`                      | Autocomplete helpers, option parsing (`parseCommandOptions` + a Zod schema), modal value helpers                          |
| `src/embeds/`                     | `errorEmbed` and list/pagination helpers                                                                                  |
| `src/cache/`                      | **Legacy** cache helpers for hydrated docs (see below)                                                                    |

Reference command: the Pokédex builder, [`regionManagement/pokedex/`](src/interactions/slashCommands/regionManagement/pokedex/): a command file per menu, `*.embeds.ts` for view builders, `types.ts` for menu state, options parsed with a Zod schema.

## Commands and registration

- One command set: `src/interactions/slashCommands/`, `messageContextCommands/`, and `userContextCommands/`. `structures/managers/slashCommands.ts` loads them all and registers them; the planning (`commandRegistration.ts`) is pure and tested.
- The scope follows the environment from `readFlagEnv()` (`@shared/flags`): `NODE_ENV=production` registers globally; anything else, including unset, registers to `DEV_GUILD_ID`, and startup fails if it's missing.
- A slash command with `ignore: true` is loaded (so FlowCord can open its menu from another menu) but not registered with Discord.
- `rest.put` only replaces the commands of the scope it targets. A guild that switches from dev to production keeps its old guild commands until they're cleared: `rest.put(Routes.applicationGuildCommands(appId, guildId), { body: [] })`.
- **Unreleased commands declare a `flag`** (e.g. `flag: 'discord.authoring'` on every `/region` builder). Registration and the interaction handler both follow it:
  - development: one put to `DEV_GUILD_ID` with every command the flags enable there;
  - production: released commands register globally; a flagged command that's off by default registers only as a guild command on servers whose `settings.features` turns it on;
  - the handler checks the flag before running a command (`commandGate.ts`), so a stale registration replies `command.unavailable` ("This command isn't available on this server yet.") instead of running.
- **`client.syncGuildCommands(guildId)` is the only way to rewrite a server's guild commands** in production. It runs at startup for every server with overrides. Code that changes a server's `settings.features` must call it after the write. Today overrides are set by hand in the database, so a change needs a restart; removing a server's last override leaves its guild commands registered (but blocked by the handler) until that server is synced.

## Rules

- **No game or authoring logic in handlers.** Button, select, and modal callbacks turn input into an engine action (`engine.dispatch`) or an authoring command (`authoring.execute`) and render the result ([03](../../docs/architecture/concepts/03-engine-boundary-and-game-loop.md)). Until those libraries exist (#153, #145), put new rules in pure functions in `libs/core`, not here.
- **Pure view builders.** Embed / Components v2 builders take data and return JSON: no DB calls, no awaits, so they can be snapshot-tested. Fetch in the action, then render.
- **FlowCord sessions hold IDs, not documents.** Store `regionId`, `journeyId`, `battleId` in session state and re-fetch in every callback; never close over a document from an earlier interaction. FlowCord is single-user and in-memory ([26 § FlowCord patterns](../../docs/architecture/concepts/26-discord-surface-and-ux-patterns.md#flowcord-patterns)).
- **Restart-safe surfaces** (Arena challenges, public battle messages, trades) are plain discord.js handlers with stable custom IDs that encode only persisted data: `<feature>:<verb>:<recordId>`.
- **Locked options always explain themselves**: a 🔒 marker plus a reachable reason, never a bare disabled button. The explanation comes from the engine.
- **Fixed engine-response wording** ([26 § Menus and feedback](../../docs/architecture/concepts/26-discord-surface-and-ux-patterns.md#menus-and-feedback)): "Updated: that menu was out of date", "This game was continued in another session", "Still working on your last action…", "Battle is resuming, press again in a moment".
- **Player-facing text** goes through `t(key, params, locale)` from `@core/i18n`, with the message in `libs/core/src/i18n/messages/en.json`; never build sentences by concatenation. Pick the locale with `resolveLocale({ interactionLocale: interaction.locale, serverLocale: interaction.guildLocale })`, or `resolveSharedLocale` for messages several players see. `src/testing/rendererText.test.ts` fails on literal text in view builders; the renderers it lists as legacy are migrated as they're touched (take a file off the list once it's clean).
- **Feature flags**: the Discord authoring commands sit behind `discord.authoring` (on in dev, off in prod). New unreleased commands declare a flag (#109, #108).
- **Errors**: user-facing errors use `buildErrorEmbed` (`src/embeds/errorEmbed.ts`).
- **Logging**: use `client.logger` (`@core/logging` port, set in `main.ts`), never `console`. `interactionCreate` makes a child logger per interaction tagged with `interactionId`, `guildId`, and `userId`; pass it to what handles the interaction. Pass correlation fields (`journeyId`, `battleId`, …) and errors as `err`.

## Legacy: don't extend

- **`src/cache/`** (`getCachedRegion` → mutate → `saveRegion`) caches and shares hydrated mutable Mongoose documents, which concept [15](../../docs/architecture/concepts/15-persistence-concurrency-and-runtime.md#recommendations) rules out. Don't add helpers for new models. Read fresh per action (or `lean()` for cached reads) and write with atomic updates. #119 replaces it.
- **The `/region` builders** (Pokédex, progressions, locations) keep their logic in handlers; #146–#148 move them onto authoring commands. When editing them for another issue, keep the change minimal and don't add new logic there.

## Checks

`npx nx test bot`, `npx nx lint bot`, `npx nx typecheck bot`. Bot changes need a manual check in the PR (the bot starts, the changed menu works), since there are no e2e tests yet. Menus are tested headless as `*.integration.test.ts` with `MenuHarness`; see [Bot integration tests](../../docs/testing.md#bot-integration-tests).
