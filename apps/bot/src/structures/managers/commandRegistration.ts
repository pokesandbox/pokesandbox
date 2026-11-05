import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';

import { isEnabled, type AppEnv, type FlagValues } from '@core/flags';
import type { FlagEnv } from '@shared/flags';

import type {
  ChatInputCommand,
  IMessageContextCommand,
  ISlashCommand,
  IUserContextCommand,
} from '../interfaces';

export type RegistrationTarget =
  { scope: 'guild'; guildId: string } | { scope: 'global' };

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
  registrable: ChatInputCommand[];
}

// An ignored slash command still loads, so other menus can open it, but
// isn't registered with Discord.
export function collectCommands(commands: CommandSet): CollectedCommands {
  const collected: CollectedCommands = {
    messageContextCommands: [],
    slashCommands: [],
    userContextCommands: [],
    registrable: [],
  };

  for (const command of commands.messageContextCommands) {
    if (command.ignore || !command.command || !command.execute) continue;
    collected.messageContextCommands.push(command);
    collected.registrable.push(command);
  }

  for (const command of commands.userContextCommands) {
    if (command.ignore || !command.command || !command.execute) continue;
    collected.userContextCommands.push(command);
    collected.registrable.push(command);
  }

  for (const command of commands.slashCommands) {
    if (!command.command || !command.createMenu) continue;
    collected.slashCommands.push(command);
    if (command.ignore) continue;
    collected.registrable.push(command);
  }

  return collected;
}

export function isCommandEnabled(
  command: Pick<ChatInputCommand, 'flag'>,
  flagEnv: FlagEnv,
  serverFeatures: FlagValues = {},
): boolean {
  if (!command.flag) return true;
  return isEnabled(command.flag, { ...flagEnv, serverFeatures });
}

export interface RegistrationPlan {
  global: ChatInputCommand[];
  guildOnly: ChatInputCommand[];
}

// Discord can't hide a global command per server, so hidden commands
// register per guild instead.
export function planRegistration(
  registrable: ChatInputCommand[],
  flagEnv: FlagEnv,
): RegistrationPlan {
  const plan: RegistrationPlan = { global: [], guildOnly: [] };
  for (const command of registrable) {
    if (isCommandEnabled(command, flagEnv)) plan.global.push(command);
    else plan.guildOnly.push(command);
  }
  return plan;
}

// Empty when the server enables none; putting it clears the server's commands.
export function guildCommandBody(
  commands: ChatInputCommand[],
  flagEnv: FlagEnv,
  serverFeatures: FlagValues,
): RESTPostAPIApplicationCommandsJSONBody[] {
  return toBodies(
    commands.filter((command) =>
      isCommandEnabled(command, flagEnv, serverFeatures),
    ),
  );
}

export function toBodies(
  commands: ChatInputCommand[],
): RESTPostAPIApplicationCommandsJSONBody[] {
  return commands.map((command) => command.command.toJSON());
}
