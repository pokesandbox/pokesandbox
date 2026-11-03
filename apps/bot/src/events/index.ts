import type { IBotEvent } from '@bot/structures/interfaces';
import { ClientReady } from './clientReady';
import { ErrorManager } from './errorManager';
import { InteractionCreate } from './interactionCreate';

export const events: IBotEvent[] = [
  ClientReady,
  ErrorManager,
  InteractionCreate,
];
