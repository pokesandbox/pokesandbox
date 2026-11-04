import type { FlowCord } from '@flowcord/core';
import { Client, Collection } from 'discord.js';

import type { FlagEnv } from '@shared/flags';

import type {
  IBotEvent,
  IButtonCommand,
  IMessageContextCommand,
  IModalForm,
  IRoleSelectMenu,
  ISlashCommand,
  IStringSelectMenu,
  IUserContextCommand,
  IUserSelectMenu,
} from '@bot/structures/interfaces';

export class BotClient extends Client {
  flowcord?: FlowCord;
  buttons = new Collection<string, IButtonCommand>();
  events = new Collection<string, IBotEvent>();
  messageContextCommands = new Collection<string, IMessageContextCommand>();
  modalForms = new Collection<string, IModalForm>();
  roleSelectMenus = new Collection<string, IRoleSelectMenu>();
  slashCommands = new Collection<string, ISlashCommand>();
  stringSelectMenus = new Collection<string, IStringSelectMenu>();
  userContextCommands = new Collection<string, IUserContextCommand>();
  userSelectMenus = new Collection<string, IUserSelectMenu>();
  /** Set once at startup from `readFlagEnv()`; flagged commands fail closed without it. */
  flagEnv?: FlagEnv;
  /** Rewrites one server's hidden guild commands (prod only; no-op in dev). */
  syncGuildCommands: (guildId: string) => Promise<void> = async () => undefined;
}
