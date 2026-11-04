# Local development

Everything you need to run the bot and the web app on your machine. The [README](../README.md#getting-started) has the short version.

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

| Prerequisite        | Version      | Notes                                                       |
| ------------------- | ------------ | ----------------------------------------------------------- |
| [Node.js][3]        | **22.x LTS** | The project targets Node 22. Using [nvm][4] is recommended. |
| [npm][5]            | **10.x**     | Bundled with Node 22                                        |
| [Docker Desktop][6] | Latest       | Required to run the local MongoDB instance                  |
| [Git][7]            | Latest       |                                                             |

The repo pins the Node version in `.nvmrc`: run `nvm use` in the repo root to switch to it.

Run `nvm use` (or switch to the `.nvmrc` version another way) **before** `npm install`. The root `package.json` sets `devEngines`, so `npm install` and `npm ci` refuse to run on any other Node or npm major and fail with `EBADDEVENGINES`. This check runs before npm touches `package-lock.json`. A different npm major rewrites the lockfile in a way CI's `npm ci` rejects. If you see the error, run `nvm use` and install again. `npm run setup` and the other scripts don't check again: they rely on the install having run on the right versions.

`.nvmrc` is the single source for the Node version. When you bump it, update the `devEngines` ranges in `package.json` to match (the `//devEngines` note sits next to them).

### Discord Bot

You must register your own Discord application and bot in order to run the bot locally.

1. Go to the [Discord Developer Portal][8] and create a **New Application**.
2. Navigate to the **Bot** tab and click **Add Bot**.
3. Under the Bot tab, enable the following **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent
   - Presence Intent
4. On the **OAuth2 → URL Generator** page, generate an invite URL with the `bot` scope and the necessary permissions, then add the bot to your test server.
5. Copy the **Bot Token** — you will need it for `DISCORD_BOT_TOKEN` in your `.env`.
6. Copy the **Client Secret** (under OAuth2 → General) — you will need it for `AUTH_DISCORD_SECRET`.

See the official [Discord Getting Started guide][9] and [Discord.js guide][10] for more detail.

## Local Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/pokesandbox/pokesandbox.git
cd pokesandbox
npm install
```

### 2. One-Command Setup

The fastest way to get a fully working local environment is to run the setup script:

```bash
npm run setup
```

This single command will:

1. Copy `.env.example` → `.env` (skips if `.env` already exists)
2. Start the MongoDB 7 Docker container (a single-node replica set, so transactions work) and wait until it is healthy
3. Seed the database with fictional sample data

> **After running `npm run setup`**, open `.env` and fill in the required values (bot token, Discord OAuth credentials, NextAuth secret, etc.) before starting the bot or web app. See [Environment Variables](#environment-variables) below.

### 3. Manual Setup (step-by-step)

If you prefer to run each step individually:

```bash
# 1. Create your .env file
npm run env-setup

# 2. Start MongoDB (Docker)
npm run db:up

# 3. Seed the database
npm run db:seed
```

### 4. Start the Applications

```bash
# Discord bot (hot-reload)
npm run start:bot

# Next.js web app (hot-reload)
npm run start:app
```

## Environment Variables

After running `npm run env-setup` (or `npm run setup`), open `.env` and fill in:

| Variable              | Description                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_URI`        | MongoDB connection string. Pre-filled with the local Docker URI.                                            |
| `DISCORD_BOT_TOKEN`   | Bot token from the Discord Developer Portal                                                                 |
| `DEV_GUILD_ID`        | Your test server's ID. In Discord, enable Developer Mode, then right-click the server icon → Copy Server ID |
| `AUTH_DISCORD_ID`     | Application ID of your Discord Bot                                                                          |
| `AUTH_DISCORD_SECRET` | OAuth2 Client Secret                                                                                        |
| `AUTH_SECRET`         | Random secret for NextAuth session encryption (run `openssl rand -base64 32`)                               |
| `FEATURE_FLAGS`       | Flag overrides, pre-filled with `*` (all on). See [CONTRIBUTING](../CONTRIBUTING.md#feature-flags)          |
| `NODE_ENV`            | Leave unset locally. Only `production` switches flags to their production defaults                          |

## Database Scripts

| Script                                     | Description                                                   |
| ------------------------------------------ | ------------------------------------------------------------- |
| `npm run db:up`                            | Start the local MongoDB Docker container                      |
| `npm run db:down`                          | Stop the local MongoDB Docker container                       |
| `npm run db:check`                         | Prove the local Mongo supports `session.withTransaction`      |
| `npm run db:indexes`                       | Create any missing indexes (`db:seed` runs it; see below)     |
| `npm run db:seed`                          | Drop all collections and re-seed with sample data             |
| `npm run db:reset`                         | Alias for `db:seed` — wipe and re-seed                        |
| `npm run db:export`                        | Export all live local collections back to the JSON seed files |
| `npm run db:export -- --collection=<name>` | Export a single collection (e.g. `regions`)                   |

### Indexes

Unique keys and parent lookups are declared in the Mongoose schemas (`Server.serverId`, `User.userId`, `Location { regionId, ordinal }`). Nothing builds them implicitly: `connectDb` runs with `autoIndex` off in every environment, so local and production behave the same. `npm run db:indexes` builds them from the registered models. `npm run setup` and `npm run db:seed` run it (seeding drops the collections, and their indexes with them); run it yourself on deploy and after pointing the app at a fresh database. It only adds missing indexes and fails if existing data has duplicates; dedupe, then re-run.

[3]: https://nodejs.org/en/download
[4]: https://github.com/nvm-sh/nvm
[5]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[6]: https://www.docker.com/products/docker-desktop/
[7]: https://git-scm.com/downloads
[8]: https://discord.com/developers/applications
[9]: https://discord.com/developers/docs/getting-started
[10]: https://discordjs.guide/preparations/setting-up-a-bot-application.html
