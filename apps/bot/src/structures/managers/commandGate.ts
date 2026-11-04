import type { FlagValues } from '@core/flags';
import { getServerFeatures, type FlagEnv } from '@shared/flags';

import type { ChatInputCommand } from '../interfaces';
import { isCommandEnabled } from './commandRegistration';

/** Shown when a hidden command is used, e.g. from a stale registration. */
export const COMMAND_UNAVAILABLE_REPLY =
  "This command isn't available on this server yet.";

/**
 * Whether a command may run in this guild. Only flagged commands read the
 * server's overrides; without a flag environment they fail closed.
 */
export async function canRunCommand(
  command: Pick<ChatInputCommand, 'flag'>,
  flagEnv: FlagEnv | undefined,
  guildId: string | null,
  loadServerFeatures: (
    guildId: string | null,
  ) => Promise<FlagValues> = getServerFeatures,
): Promise<boolean> {
  if (!command.flag) return true;
  if (!flagEnv) return false;
  return isCommandEnabled(command, flagEnv, await loadServerFeatures(guildId));
}
