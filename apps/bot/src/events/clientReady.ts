import { ActivityType } from 'discord.js';

import type { BotClient } from '@bot/classes';
import type { IBotEvent } from '@bot/structures/interfaces';

export const ClientReady: IBotEvent = {
  name: 'clientReady',
  execute: (name: string, client?: BotClient) => {
    if (!client) return;
    client.once(name, async () => {
      client?.user?.setActivity('Training Videos.', {
        type: ActivityType.Watching,
      });

      client.logger.info('Client ready', {
        tag: client.user?.tag,
        loaded: {
          events: client.events.size,
          buttons: client.buttons.size,
          messageContextCommands: client.messageContextCommands.size,
          modalForms: client.modalForms.size,
          roleSelectMenus: client.roleSelectMenus.size,
          slashCommands: client.slashCommands.size,
          stringSelectMenus: client.stringSelectMenus.size,
          userContextCommands: client.userContextCommands.size,
          userSelectMenus: client.userSelectMenus.size,
        },
      });
    });
  },
};
