import { FlowCord } from '@flowcord/core';
import { GatewayIntentBits, Partials } from 'discord.js';

import { connectDb } from '@shared/connectDb';
import { readFlagEnv } from '@shared/flags';
import { createLoggerFromEnv } from '@shared/logger';

import { BotClient } from '@bot/classes';
import {
  buttonsManager,
  eventsManager,
  modalFormsManager,
  roleSelectMenusManager,
  slashCommandsManager,
  stringSelectMenusManager,
  userSelectMenusManager,
} from './structures/managers';

const logger = createLoggerFromEnv();

async function start() {
  await connectDb(logger);
  const TOKEN = process.env.DISCORD_BOT_TOKEN as string;
  logger.info('SandBot is initializing');

  const client = new BotClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Channel],
  });
  client.logger = logger;

  await buttonsManager(client);
  await modalFormsManager(client);
  await roleSelectMenusManager(client);
  const flagEnv = readFlagEnv();
  client.flagEnv = flagEnv;
  await slashCommandsManager(client, { flagEnv });
  await stringSelectMenusManager(client);
  await userSelectMenusManager(client);

  const flowcord = new FlowCord({ client });
  client.slashCommands.forEach((command, commandName) => {
    flowcord.registerMenu(commandName, command.createMenu);
  });
  client.flowcord = flowcord;

  await eventsManager(client);
  await client.login(TOKEN);
}

start().catch((error: unknown) => {
  logger.error('SandBot failed to start', { err: error });
  process.exit(1);
});
