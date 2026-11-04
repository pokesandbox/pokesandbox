import type { CreateMenuDefinitionFn } from '@flowcord/core';
import { Routes, SlashCommandBuilder, type REST } from 'discord.js';

import type { FlagValues } from '@core/flags';
import type { FlagEnv } from '@shared/flags';

import { BotClient } from '@bot/classes';
import type { ISlashCommand } from '../interfaces';
import type { CommandSet } from './commandRegistration';
import {
  slashCommandsManager,
  type SlashCommandsManagerOptions,
} from './slashCommands';

describe('slashCommands', () => {
  describe('slashCommandsManager', () => {
    it('registers released commands globally and hidden ones per override server in production', async () => {
      const rest = fakeRest();

      await slashCommandsManager(new BotClient({ intents: [] }), {
        ...options(rest, prod()),
        loadServerFeatures: async (guildId) =>
          guildId === 'alpha' ? { 'discord.authoring': true } : {},
        listServersWithOverrides: async () => ['alpha'],
      });

      expect(putCalls(rest)).toEqual([
        { route: Routes.applicationCommands('app'), names: ['server'] },
        {
          route: Routes.applicationGuildCommands('app', 'alpha'),
          names: ['region'],
        },
      ]);
    });

    it('skips guild syncs when production has no hidden commands', async () => {
      const rest = fakeRest();
      const listServersWithOverrides = jest.fn(async () => ['alpha']);

      await slashCommandsManager(new BotClient({ intents: [] }), {
        ...options(rest, prod({ 'discord.authoring': true })),
        listServersWithOverrides,
      });

      expect(putCalls(rest)).toEqual([
        {
          route: Routes.applicationCommands('app'),
          names: ['server', 'region'],
        },
      ]);
      expect(listServersWithOverrides).not.toHaveBeenCalled();
    });

    it('registers every enabled command to the dev guild in one put', async () => {
      const rest = fakeRest();

      await slashCommandsManager(
        new BotClient({ intents: [] }),
        options(rest, dev()),
      );

      expect(putCalls(rest)).toEqual([
        {
          route: Routes.applicationGuildCommands('app', 'dev-guild'),
          names: ['server', 'region'],
        },
      ]);
    });

    it('leaves out commands FEATURE_FLAGS turns off in development', async () => {
      const rest = fakeRest();

      await slashCommandsManager(
        new BotClient({ intents: [] }),
        options(rest, dev({ 'discord.authoring': false })),
      );

      expect(putCalls(rest)).toEqual([
        {
          route: Routes.applicationGuildCommands('app', 'dev-guild'),
          names: ['server'],
        },
      ]);
    });

    it('loads every command into the client, whatever its flag', async () => {
      const client = new BotClient({ intents: [] });

      await slashCommandsManager(client, options(fakeRest(), prod()));

      expect([...client.slashCommands.keys()]).toEqual([
        'server',
        'region',
        'select-matched-pokemon',
      ]);
    });

    it('fails before registering when DEV_GUILD_ID is missing in development', async () => {
      const rest = fakeRest();

      await expect(
        slashCommandsManager(new BotClient({ intents: [] }), {
          ...options(rest, dev()),
          devGuildId: '',
        }),
      ).rejects.toThrow('DEV_GUILD_ID must be set');
      expect(rest.put).not.toHaveBeenCalled();
    });
  });

  describe('syncGuildCommands', () => {
    it('clears the hidden commands of a server without overrides', async () => {
      const rest = fakeRest();
      const client = new BotClient({ intents: [] });
      await slashCommandsManager(client, options(rest, prod()));
      rest.put.mockClear();

      await client.syncGuildCommands('beta');

      expect(putCalls(rest)).toEqual([
        { route: Routes.applicationGuildCommands('app', 'beta'), names: [] },
      ]);
    });

    it('is a no-op in development', async () => {
      const rest = fakeRest();
      const client = new BotClient({ intents: [] });
      await slashCommandsManager(client, options(rest, dev()));
      rest.put.mockClear();

      await client.syncGuildCommands('beta');

      expect(rest.put).not.toHaveBeenCalled();
    });

    it('logs a failed put instead of throwing', async () => {
      const error = new Error('Discord is down');
      const rest = fakeRest();
      rest.put.mockRejectedValue(error);
      const log = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);
      const client = new BotClient({ intents: [] });

      await slashCommandsManager(client, options(rest, prod()));
      await client.syncGuildCommands('beta');

      expect(log).toHaveBeenCalledWith(error);
      log.mockRestore();
    });
  });
});

function options(
  rest: ReturnType<typeof fakeRest>,
  flagEnv: FlagEnv,
): SlashCommandsManagerOptions {
  return {
    flagEnv,
    devGuildId: 'dev-guild',
    clientId: 'app',
    rest,
    commands: commandSet(),
    loadServerFeatures: async (): Promise<FlagValues> => ({}),
    listServersWithOverrides: async () => [],
  };
}

function prod(envOverrides: FlagValues = {}): FlagEnv {
  return { env: 'prod', envOverrides };
}

function dev(envOverrides: FlagValues = {}): FlagEnv {
  return { env: 'dev', envOverrides };
}

function fakeRest() {
  return { put: jest.fn<ReturnType<REST['put']>, Parameters<REST['put']>>() };
}

function putCalls(rest: ReturnType<typeof fakeRest>) {
  return rest.put.mock.calls.map(([route, options]) => ({
    route,
    names: (options?.body as { name: string }[]).map((body) => body.name),
  }));
}

function commandSet(): CommandSet {
  return {
    messageContextCommands: [],
    userContextCommands: [],
    slashCommands: [
      slashCommand('server'),
      slashCommand('region', { flag: 'discord.authoring' }),
      slashCommand('select-matched-pokemon', {
        flag: 'discord.authoring',
        ignore: true,
      }),
    ],
  };
}

function slashCommand(
  name: string,
  overrides: Partial<ISlashCommand> = {},
): ISlashCommand {
  return {
    name,
    command: new SlashCommandBuilder().setName(name).setDescription(name),
    createMenu: jest.fn() as unknown as CreateMenuDefinitionFn,
    ...overrides,
  };
}
