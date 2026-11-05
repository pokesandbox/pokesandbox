import type { FlagValues } from '@core/flags';
import { getServerFeatures, type FlagEnv } from '@shared/flags';

import type { ChatInputCommand } from '../interfaces';
import { isCommandEnabled } from './commandRegistration';

export const COMMAND_UNAVAILABLE_REPLY =
  "This command isn't available on this server yet.";

// Fails closed for flagged commands when the flag environment isn't loaded.
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
