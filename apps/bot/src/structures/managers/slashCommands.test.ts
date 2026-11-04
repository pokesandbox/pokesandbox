import type { CreateMenuDefinitionFn } from '@flowcord/core';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  Routes,
  SlashCommandBuilder,
  type REST,
} from 'discord.js';

import { BotClient } from '@bot/classes';
import type {
  IMessageContextCommand,
  ISlashCommand,
  IUserContextCommand,
} from '../interfaces';
import type { CommandSet } from './commandRegistration';
import { slashCommandsManager } from './slashCommands';

describe('slashCommands', () => {
  describe('slashCommandsManager', () => {
    it('registers every command to the dev guild in development', async () => {
      const rest = fakeRest();
      const commands = commandSet();

      await slashCommandsManager(new BotClient({ intents: [] }), {
        env: 'dev',
        devGuildId: 'guild-1',
        clientId: 'app',
        rest,
        commands,
      });

      expect(rest.put).toHaveBeenCalledTimes(1);
      expect(rest.put).toHaveBeenCalledWith(
        Routes.applicationGuildCommands('app', 'guild-1'),
        { body: expect.any(Array) },
      );
      expect(registeredNames(rest)).toEqual([
        'Message ID',
        'User Tag',
        'server',
      ]);
    });

    it('registers globally in production, with no guild registration', async () => {
      const rest = fakeRest();

      await slashCommandsManager(new BotClient({ intents: [] }), {
        env: 'prod',
        devGuildId: 'guild-1',
        clientId: 'app',
        rest,
        commands: commandSet(),
      });

      expect(rest.put).toHaveBeenCalledTimes(1);
      expect(rest.put).toHaveBeenCalledWith(Routes.applicationCommands('app'), {
        body: expect.any(Array),
      });
      expect(registeredNames(rest)).toEqual([
        'Message ID',
        'User Tag',
        'server',
      ]);
    });

    it('loads the same commands into the client in both modes', async () => {
      const devClient = new BotClient({ intents: [] });
      const prodClient = new BotClient({ intents: [] });
      const commands = commandSet();

      await slashCommandsManager(devClient, {
        env: 'dev',
        devGuildId: 'guild-1',
        clientId: 'app',
        rest: fakeRest(),
        commands,
      });
      await slashCommandsManager(prodClient, {
        env: 'prod',
        clientId: 'app',
        rest: fakeRest(),
        commands,
      });

      for (const client of [devClient, prodClient]) {
        expect([...client.slashCommands.keys()]).toEqual([
          'server',
          'select-matched-pokemon',
        ]);
        expect([...client.messageContextCommands.keys()]).toEqual([
          'Message ID',
        ]);
        expect([...client.userContextCommands.keys()]).toEqual(['User Tag']);
      }
    });

    it('fails before registering when DEV_GUILD_ID is missing in development', async () => {
      const rest = fakeRest();

      await expect(
        slashCommandsManager(new BotClient({ intents: [] }), {
          env: 'dev',
          devGuildId: '',
          clientId: 'app',
          rest,
          commands: commandSet(),
        }),
      ).rejects.toThrow('DEV_GUILD_ID must be set');
      expect(rest.put).not.toHaveBeenCalled();
    });

    it('logs a failed registration instead of crashing startup', async () => {
      const error = new Error('Discord is down');
      const rest = fakeRest();
      rest.put.mockRejectedValue(error);
      const log = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);

      await slashCommandsManager(new BotClient({ intents: [] }), {
        env: 'prod',
        clientId: 'app',
        rest,
        commands: commandSet(),
      });

      expect(log).toHaveBeenCalledWith(error);
      log.mockRestore();
    });

    it('skips registration when there is nothing to register', async () => {
      const rest = fakeRest();

      await slashCommandsManager(new BotClient({ intents: [] }), {
        env: 'prod',
        clientId: 'app',
        rest,
        commands: {
          messageContextCommands: [],
          userContextCommands: [],
          slashCommands: [],
        },
      });

      expect(rest.put).not.toHaveBeenCalled();
    });
  });
});

function fakeRest() {
  return { put: jest.fn<ReturnType<REST['put']>, Parameters<REST['put']>>() };
}

function registeredNames(rest: ReturnType<typeof fakeRest>): string[] {
  const [, options] = rest.put.mock.calls[0];
  return (options?.body as { name: string }[]).map((body) => body.name);
}

function commandSet(): CommandSet {
  return {
    messageContextCommands: [
      {
        name: 'Message ID',
        command: new ContextMenuCommandBuilder()
          .setName('Message ID')
          .setType(ApplicationCommandType.Message),
        execute: jest.fn(),
      } as IMessageContextCommand,
    ],
    userContextCommands: [
      {
        name: 'User Tag',
        command: new ContextMenuCommandBuilder()
          .setName('User Tag')
          .setType(ApplicationCommandType.User),
        execute: jest.fn(),
      } as IUserContextCommand,
    ],
    slashCommands: [
      slashCommand('server'),
      slashCommand('select-matched-pokemon', { ignore: true }),
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
