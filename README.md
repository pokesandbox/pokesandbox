# PokeSandbox - The Discord Pokémon Fan-Game Engine

[![CI](https://github.com/pokesandbox/pokesandbox/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/pokesandbox/pokesandbox/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pokesandbox_pokesandbox&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=pokesandbox_pokesandbox)

[Discord server][1] · [Docs](docs/README.md) · [Roadmap][3] · [Report a bug or request a feature][4] · [Pokémon Showdown fork][2]

## What is PokeSandbox?

PokeSandbox is a Discord bot plus a web app that lets Discord servers build their own Pokémon games ("regions") and play them right in Discord: a faithful Kanto remake, a fan region with custom Pokémon, or a story-driven roleplay server. Server admins author regions (maps, encounters, trainers, story scripts, rules) in the web app, built for phones first. Players play through a `/play` menu, battle in a system powered by a fork of [Pokémon Showdown][2], and trade. The first public piece is the **Arena**: Showdown-style PvP and PvAI battles between server members.

New here? Start with [`docs/start-here.md`](docs/start-here.md).

## Getting started

You'll need [Node.js 22](https://nodejs.org/en/download) (run `nvm use` to pick up `.nvmrc`), [Docker Desktop](https://www.docker.com/products/docker-desktop/), and your own [Discord application and bot](docs/local-development.md#discord-bot).

```bash
git clone https://github.com/pokesandbox/pokesandbox.git
cd pokesandbox
npm install
npm run setup        # creates .env, starts MongoDB in Docker, seeds sample data
# fill in .env (bot token, Discord OAuth credentials, auth secret)
npm run start:bot    # Discord bot
npm run start:app    # web app
```

The full guide, including the Discord bot setup, environment variables, and database scripts, is in [Local development](docs/local-development.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for how work is picked up and what a PR needs, browse issues labelled [`good first issue`][5], or ask on the [Discord server][1].

## Credits

**Development Team**

- [Nick Bely](https://github.com/nbely) (Chronicler) - Architect, Team Lead, and Full-stack Developer
- [Kevin Nguyen](https://github.com/Kevnien) - Full-stack Developer
- [Rodney Dennings (Eve)](https://github.com/rdennings) - Full-stack Developer

**Other Credits**

- Pokémon Showdown Team - for the Pokémon Battle Simulator Base

## License & legal

The source code is released under the [MIT License](LICENSE).

PokeSandbox is a free, non-commercial fan project. It is not affiliated with, endorsed, sponsored, or approved by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company. Pokémon and all related names, characters, and data are trademarks and © of their respective owners. The MIT License covers only this project's original source code and grants no rights to Pokémon intellectual property. The project charges nothing; any optional donations go only toward hosting costs.

[1]: https://discord.gg/5BSMak3m9V
[2]: https://github.com/pokesandbox/pokemon-showdown#pok%C3%A9mon-showdown
[3]: https://github.com/orgs/pokesandbox/projects/1
[4]: https://github.com/pokesandbox/pokesandbox/issues/new/choose
[5]: https://github.com/pokesandbox/pokesandbox/labels/good%20first%20issue
