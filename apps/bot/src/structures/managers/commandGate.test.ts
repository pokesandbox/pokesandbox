import type { FlagValues } from '@core/flags';
import type { FlagEnv } from '@shared/flags';

import { canRunCommand } from './commandGate';

describe('commandGate', () => {
  describe('canRunCommand', () => {
    it('runs an unflagged command without reading the server', async () => {
      const loadServerFeatures = jest.fn();

      await expect(
        canRunCommand({}, prod(), 'guild-1', loadServerFeatures),
      ).resolves.toBe(true);
      expect(loadServerFeatures).not.toHaveBeenCalled();
    });

    it('blocks a hidden command on a server without an override', async () => {
      await expect(
        canRunCommand(builder(), prod(), 'guild-1', features({})),
      ).resolves.toBe(false);
    });

    it('runs a hidden command on a server that enables it', async () => {
      const loadServerFeatures = features({ 'discord.authoring': true });

      await expect(
        canRunCommand(builder(), prod(), 'guild-1', loadServerFeatures),
      ).resolves.toBe(true);
      expect(loadServerFeatures).toHaveBeenCalledWith('guild-1');
    });

    it('uses the environment default outside a server', async () => {
      await expect(
        canRunCommand(builder(), dev(), null, features({})),
      ).resolves.toBe(true);
    });

    it('fails closed without a flag environment', async () => {
      await expect(
        canRunCommand(
          builder(),
          undefined,
          'guild-1',
          features({ 'discord.authoring': true }),
        ),
      ).resolves.toBe(false);
    });
  });
});

function builder() {
  return { flag: 'discord.authoring' as const };
}

function features(values: FlagValues) {
  return jest.fn(async () => values);
}

function prod(): FlagEnv {
  return { env: 'prod', envOverrides: {} };
}

function dev(): FlagEnv {
  return { env: 'dev', envOverrides: {} };
}
