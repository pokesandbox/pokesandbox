import { REST } from 'discord.js';

import type { AppEnv } from '@core/flags';

import type { BotClient } from '@bot/classes';
import { messageContextCommands } from '@bot/interactions/messageContextCommands';
import { slashCommands } from '@bot/interactions/slashCommands';
import { userContextCommands } from '@bot/interactions/userContextCommands';
import {
  collectCommands,
  registrationRoute,
  registrationTarget,
  type CommandSet,
} from './commandRegistration';

export interface SlashCommandsManagerOptions {
  env: AppEnv;
  devGuildId?: string;
  clientId?: string;
  rest?: Pick<REST, 'put'>;
  commands?: CommandSet;
}

/**
 * Loads the bot's commands into the client and registers them with Discord:
 * to the `DEV_GUILD_ID` test server in development, globally in production.
 */
export const slashCommandsManager = async (
  client: BotClient,
  {
    env,
    devGuildId = process.env.DEV_GUILD_ID,
    clientId = process.env.AUTH_DISCORD_ID as string,
    rest = new REST({ version: '10' }).setToken(
      process.env.DISCORD_BOT_TOKEN as string,
    ),
    commands = { messageContextCommands, slashCommands, userContextCommands },
  }: SlashCommandsManagerOptions,
) => {
  const target = registrationTarget(env, devGuildId);
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

  if (collected.body.length === 0) return;

  console.log(
    target.scope === 'global'
      ? `Registering ${collected.body.length} commands globally`
      : `Registering ${collected.body.length} commands to guild ${target.guildId}`,
  );
  try {
    await rest.put(registrationRoute(target, clientId), {
      body: collected.body,
    });
  } catch (error) {
    console.log(error);
  }
};
