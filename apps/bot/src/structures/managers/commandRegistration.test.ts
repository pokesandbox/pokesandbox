import type { CreateMenuDefinitionFn } from '@flowcord/core';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

import type {
  IMessageContextCommand,
  ISlashCommand,
  IUserContextCommand,
} from '../interfaces';
import {
  collectCommands,
  registrationRoute,
  registrationTarget,
} from './commandRegistration';

describe('commandRegistration', () => {
  describe('registrationTarget', () => {
    it('registers to the dev guild outside production', () => {
      expect(registrationTarget('dev', '123')).toEqual({
        scope: 'guild',
        guildId: '123',
      });
    });

    it.each([undefined, '', '   '])(
      'throws in dev when DEV_GUILD_ID is %p',
      (devGuildId) => {
        expect(() => registrationTarget('dev', devGuildId)).toThrow(
          'DEV_GUILD_ID must be set when NODE_ENV is not production',
        );
      },
    );

    it('registers globally in production, with or without DEV_GUILD_ID', () => {
      expect(registrationTarget('prod', undefined)).toEqual({
        scope: 'global',
      });
      expect(registrationTarget('prod', '123')).toEqual({ scope: 'global' });
    });
  });

  describe('registrationRoute', () => {
    it('uses the guild route for a guild target', () => {
      expect(registrationRoute({ scope: 'guild', guildId: '123' }, 'app')).toBe(
        Routes.applicationGuildCommands('app', '123'),
      );
    });

    it('uses the application route for a global target', () => {
      expect(registrationRoute({ scope: 'global' }, 'app')).toBe(
        Routes.applicationCommands('app'),
      );
    });
  });

  describe('collectCommands', () => {
    it('keeps going after an ignored context command', () => {
      const ignored = messageContextCommand('Ignored', { ignore: true });
      const kept = messageContextCommand('Kept');
      const user = userContextCommand('User');
      const slash = slashCommand('server');

      const collected = collectCommands({
        messageContextCommands: [ignored, kept],
        userContextCommands: [user],
        slashCommands: [slash],
      });

      expect(collected.messageContextCommands).toEqual([kept]);
      expect(collected.userContextCommands).toEqual([user]);
      expect(collected.slashCommands).toEqual([slash]);
      expect(collected.body.map((body) => body.name)).toEqual([
        'Kept',
        'User',
        'server',
      ]);
    });

    it('loads an ignored slash command without registering it', () => {
      const ignored = slashCommand('select-matched-pokemon', { ignore: true });

      const collected = collectCommands({
        messageContextCommands: [],
        userContextCommands: [],
        slashCommands: [ignored],
      });

      expect(collected.slashCommands).toEqual([ignored]);
      expect(collected.body).toEqual([]);
    });

    it('drops commands missing their handler', () => {
      const collected = collectCommands({
        messageContextCommands: [
          messageContextCommand('No execute', { execute: undefined }),
        ],
        userContextCommands: [
          userContextCommand('No execute', { execute: undefined }),
        ],
        slashCommands: [slashCommand('no-menu', { createMenu: undefined })],
      });

      expect(collected).toEqual({
        messageContextCommands: [],
        userContextCommands: [],
        slashCommands: [],
        body: [],
      });
    });

    it('registers the toJSON bodies, not the command objects', () => {
      const slash = slashCommand('server');

      const { body } = collectCommands({
        messageContextCommands: [],
        userContextCommands: [],
        slashCommands: [slash],
      });

      expect(body).toEqual([slash.command.toJSON()]);
    });
  });
});

function slashCommand(
  name: string,
  overrides: Partial<ISlashCommand> = {},
): ISlashCommand {
  return {
    name,
    command: new SlashCommandBuilder().setName(name).setDescription(name),
    createMenu: jest.fn() as unknown as CreateMenuDefinitionFn,
    ...overrides,
  } as ISlashCommand;
}

function messageContextCommand(
  name: string,
  overrides: Partial<IMessageContextCommand> = {},
): IMessageContextCommand {
  return {
    name,
    command: new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.Message),
    execute: jest.fn(),
    ...overrides,
  } as IMessageContextCommand;
}

function userContextCommand(
  name: string,
  overrides: Partial<IUserContextCommand> = {},
): IUserContextCommand {
  return {
    name,
    command: new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.User),
    execute: jest.fn(),
    ...overrides,
  } as IUserContextCommand;
}
