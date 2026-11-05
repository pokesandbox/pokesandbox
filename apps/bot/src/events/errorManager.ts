import type { BotClient } from '@bot/classes';
import type { IBotEvent } from '@bot/structures/interfaces';

export const ErrorManager: IBotEvent = {
  name: 'errorManager',
  customEvent: true,
  execute: (_name: string, client?: BotClient) => {
    if (!client) return;
    process.on('unhandledRejection', (error) => {
      client.logger.error('Unhandled rejection', { err: error });
    });
    process.on('uncaughtException', (error) => {
      client.logger.error('Uncaught exception', { err: error });
    });
  },
};
