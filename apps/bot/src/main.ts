import { FlowCord } from '@flowcord/core';
import { GatewayIntentBits, Partials } from 'discord.js';

import { connectDb } from '@shared/connectDb';
import { readFlagEnv } from '@shared/flags';

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

connectDb().then(async () => {
  const TOKEN = process.env.DISCORD_BOT_TOKEN as string;
  console.log('SandBot is initializing...');

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
  client.login(TOKEN);
});
