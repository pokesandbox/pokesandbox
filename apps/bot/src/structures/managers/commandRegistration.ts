import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';

import type { AppEnv } from '@core/flags';

import type {
  IMessageContextCommand,
  ISlashCommand,
  IUserContextCommand,
} from '../interfaces';

export type RegistrationTarget =
  { scope: 'guild'; guildId: string } | { scope: 'global' };

/**
 * Where the bot registers its commands: production registers globally; every
 * other environment registers to the developer's test server (`DEV_GUILD_ID`).
 */
export function registrationTarget(
  env: AppEnv,
  devGuildId: string | undefined,
): RegistrationTarget {
  if (env === 'prod') return { scope: 'global' };

  const guildId = devGuildId?.trim();
  if (!guildId) {
    throw new Error(
      'DEV_GUILD_ID must be set when NODE_ENV is not production (commands register to your test server)',
    );
  }
  return { scope: 'guild', guildId };
}

export function registrationRoute(
  target: RegistrationTarget,
  clientId: string,
): `/${string}` {
  return target.scope === 'global'
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, target.guildId);
}

export interface CommandSet {
  messageContextCommands: IMessageContextCommand[];
  slashCommands: ISlashCommand[];
  userContextCommands: IUserContextCommand[];
}

export interface CollectedCommands extends CommandSet {
  /** The `toJSON()` bodies sent to Discord. */
  body: RESTPostAPIApplicationCommandsJSONBody[];
}

/**
 * Picks the commands the bot loads and the bodies it registers. Incomplete or
 * ignored context commands are skipped. An ignored slash command is still
 * loaded, so FlowCord can open its menu from another menu, but isn't
 * registered with Discord.
 */
export function collectCommands(commands: CommandSet): CollectedCommands {
  const collected: CollectedCommands = {
    messageContextCommands: [],
    slashCommands: [],
    userContextCommands: [],
    body: [],
  };

  for (const command of commands.messageContextCommands) {
    if (command.ignore || !command.command || !command.execute) continue;
    collected.messageContextCommands.push(command);
    collected.body.push(command.command.toJSON());
  }

  for (const command of commands.userContextCommands) {
    if (command.ignore || !command.command || !command.execute) continue;
    collected.userContextCommands.push(command);
    collected.body.push(command.command.toJSON());
  }

  for (const command of commands.slashCommands) {
    if (!command.command || !command.createMenu) continue;
    collected.slashCommands.push(command);
    if (command.ignore) continue;
    collected.body.push(command.command.toJSON());
  }

  return collected;
}
