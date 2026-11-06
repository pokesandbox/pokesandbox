import type { CreateMenuDefinitionFn } from '@flowcord/core';
import {
  InteractionType,
  SlashCommandBuilder,
  type Interaction,
} from 'discord.js';

import { t } from '@core/i18n';
import { createNoopLogger } from '@core/logging';
import { getServerFeatures } from '@shared/flags';

import { BotClient } from '@bot/classes';
import type { ISlashCommand } from '@bot/structures/interfaces';
import { InteractionCreate } from './interactionCreate';

jest.mock('@shared/flags', () => ({
  ...jest.requireActual('@shared/flags'),
  getServerFeatures: jest.fn(),
}));

describe('interactionCreate', () => {
  describe('hidden commands', () => {
    it('replies unavailable instead of running a hidden slash command', async () => {
      jest.mocked(getServerFeatures).mockResolvedValue({});
      const client = clientWith(slashCommand('region'));
      const interaction = chatInput('region', 'guild-1');

      await emit(client, interaction);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: t('command.unavailable'),
        ephemeral: true,
      });
      expect(getServerFeatures).toHaveBeenCalledWith('guild-1');
    });

    it('returns no suggestions when autocompleting a hidden command', async () => {
      jest.mocked(getServerFeatures).mockResolvedValue({});
      const autocomplete = jest.fn();
      const client = clientWith(slashCommand('region', { autocomplete }));
      const interaction = {
        type: InteractionType.ApplicationCommandAutocomplete,
        commandName: 'region',
        guildId: 'guild-1',
        id: 'interaction-1',
        user: { id: 'user-1' },
        respond: jest.fn(),
      };

      await emit(client, interaction);

      expect(interaction.respond).toHaveBeenCalledWith([]);
      expect(autocomplete).not.toHaveBeenCalled();
    });
  });

  it('logs an autocomplete handler that throws', async () => {
    jest.mocked(getServerFeatures).mockResolvedValue({});
    const error = new Error('lookup failed');
    const client = clientWith(
      slashCommand('dex', { autocomplete: jest.fn().mockRejectedValue(error) }),
    );
    client.flagEnv = {
      env: 'prod',
      envOverrides: { 'discord.authoring': true },
    };
    const interactionLogger = createNoopLogger();
    const logError = jest.spyOn(interactionLogger, 'error');
    const child = jest
      .spyOn(client.logger, 'child')
      .mockReturnValue(interactionLogger);

    await emit(client, {
      type: InteractionType.ApplicationCommandAutocomplete,
      commandName: 'dex',
      guildId: 'guild-1',
      id: 'interaction-1',
      user: { id: 'user-1' },
      respond: jest.fn(),
    });

    expect(child).toHaveBeenCalledWith({
      interactionId: 'interaction-1',
      guildId: 'guild-1',
      userId: 'user-1',
    });
    expect(logError).toHaveBeenCalledWith('Autocomplete failed', {
      command: 'dex',
      err: error,
    });
  });
});

function clientWith(command: ISlashCommand): BotClient {
  const client = new BotClient({ intents: [] });
  client.flagEnv = { env: 'prod', envOverrides: {} };
  client.slashCommands.set(command.name, command);
  InteractionCreate.execute(InteractionCreate.name, client);
  return client;
}

function chatInput(commandName: string, guildId: string) {
  return {
    type: InteractionType.ApplicationCommand,
    commandName,
    guildId,
    id: 'interaction-1',
    user: { id: 'user-1' },
    isChatInputCommand: () => true,
    isMessageContextMenuCommand: () => false,
    isUserContextMenuCommand: () => false,
    reply: jest.fn(),
  };
}

/** Emits the interaction and waits for the async listener to finish. */
async function emit(client: BotClient, interaction: object) {
  client.emit('interactionCreate', interaction as Interaction);
  await new Promise((resolve) => setImmediate(resolve));
}

function slashCommand(
  name: string,
  overrides: Partial<ISlashCommand> = {},
): ISlashCommand {
  return {
    name,
    flag: 'discord.authoring',
    command: new SlashCommandBuilder().setName(name).setDescription(name),
    createMenu: jest.fn() as unknown as CreateMenuDefinitionFn,
    ...overrides,
  };
}
