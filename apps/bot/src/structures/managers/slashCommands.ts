import { REST, Routes } from 'discord.js';

import type { FlagValues } from '@core/flags';
import {
  getServerFeatures,
  getServerIdsWithFeatureOverrides,
  type FlagEnv,
} from '@shared/flags';

import type { BotClient } from '@bot/classes';
import { messageContextCommands } from '@bot/interactions/messageContextCommands';
import { slashCommands } from '@bot/interactions/slashCommands';
import { userContextCommands } from '@bot/interactions/userContextCommands';
import {
  collectCommands,
  guildCommandBody,
  planRegistration,
  registrationRoute,
  registrationTarget,
  toBodies,
  type CommandSet,
} from './commandRegistration';

export interface SlashCommandsManagerOptions {
  flagEnv: FlagEnv;
  devGuildId?: string;
  clientId?: string;
  rest?: Pick<REST, 'put'>;
  commands?: CommandSet;
  loadServerFeatures?: (guildId: string) => Promise<FlagValues>;
  listServersWithOverrides?: () => Promise<string[]>;
}

// Dev: one put to DEV_GUILD_ID. Prod: a global put of released commands,
// then a guild put of hidden commands per server with overrides.
export const slashCommandsManager = async (
  client: BotClient,
  {
    flagEnv,
    devGuildId = process.env.DEV_GUILD_ID,
    clientId = process.env.AUTH_DISCORD_ID as string,
    rest = new REST({ version: '10' }).setToken(
      process.env.DISCORD_BOT_TOKEN as string,
    ),
    commands = { messageContextCommands, slashCommands, userContextCommands },
    loadServerFeatures = getServerFeatures,
    listServersWithOverrides = getServerIdsWithFeatureOverrides,
  }: SlashCommandsManagerOptions,
) => {
  const target = registrationTarget(flagEnv.env, devGuildId);
  const collected = collectCommands(commands);

  for (const command of collected.messageContextCommands) {
    client.messageContextCommands.set(command.command.name, command);
  }
  for (const command of collected.userContextCommands) {
    client.userContextCommands.set(command.command.name, command);
  }
  for (const command of collected.slashCommands) {
    client.slashCommands.set(command.command.name, command);
  }

  const put = async (route: `/${string}`, body: unknown[]) => {
    try {
      await rest.put(route, { body });
    } catch (error) {
      client.logger.error('Command registration failed', {
        route,
        err: error,
      });
    }
  };

  if (target.scope === 'guild') {
    // One put only: a second put to the same guild would replace this one.
    const body = guildCommandBody(
      collected.registrable,
      flagEnv,
      await loadServerFeatures(target.guildId),
    );
    client.logger.info('Registering guild commands', {
      count: body.length,
      guildId: target.guildId,
    });
    await put(registrationRoute(target, clientId), body);
    return;
  }

  const plan = planRegistration(collected.registrable, flagEnv);

  client.syncGuildCommands = async (guildId: string) => {
    const body = guildCommandBody(
      plan.guildOnly,
      flagEnv,
      await loadServerFeatures(guildId),
    );
    await put(Routes.applicationGuildCommands(clientId, guildId), body);
  };

  client.logger.info('Registering global commands', {
    count: plan.global.length,
  });
  await put(registrationRoute(target, clientId), toBodies(plan.global));

  if (plan.guildOnly.length === 0) return;
  const guildIds = await listServersWithOverrides();
  client.logger.info('Syncing hidden commands for servers with overrides', {
    count: guildIds.length,
  });
  for (const guildId of guildIds) {
    await client.syncGuildCommands(guildId);
  }
};
