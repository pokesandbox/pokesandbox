import { appEnvFromNodeEnv, getServerFeatures, readFlagEnv } from './flags';
import { Server } from './models/server.model';

function mockServerLookup(server: unknown) {
  const lean = jest.fn().mockResolvedValue(server);
  const select = jest.fn().mockReturnValue({ lean });
  const findOne = jest
    .spyOn(Server, 'findOne')
    .mockReturnValue({ select } as never);
  return { findOne, select };
}

describe('flags', () => {
  describe('appEnvFromNodeEnv', () => {
    it.each([
      ['production', 'prod'],
      ['development', 'dev'],
      ['test', 'dev'],
      [undefined, 'dev'],
    ])('maps NODE_ENV=%p to %s', (nodeEnv, expected) => {
      expect(appEnvFromNodeEnv(nodeEnv)).toBe(expected);
    });
  });

  describe('readFlagEnv', () => {
    it('reads NODE_ENV and parses FEATURE_FLAGS', () => {
      expect(
        readFlagEnv({ NODE_ENV: 'production', FEATURE_FLAGS: '*' }),
      ).toEqual({ env: 'prod', envOverrides: { 'discord.authoring': true } });
    });

    it('defaults to dev with no overrides', () => {
      expect(readFlagEnv({})).toEqual({ env: 'dev', envOverrides: {} });
    });
  });

  describe('getServerFeatures', () => {
    it('returns nothing without a guild, and does not query', async () => {
      const findOne = jest.spyOn(Server, 'findOne');
      await expect(getServerFeatures(null)).resolves.toEqual({});
      await expect(getServerFeatures(undefined)).resolves.toEqual({});
      expect(findOne).not.toHaveBeenCalled();
    });

    it('returns nothing for an unknown server', async () => {
      const { findOne, select } = mockServerLookup(null);
      await expect(getServerFeatures('guild-1')).resolves.toEqual({});
      expect(findOne).toHaveBeenCalledWith({ serverId: 'guild-1' });
      expect(select).toHaveBeenCalledWith('settings.features');
    });

    it('returns nothing for a server without overrides', async () => {
      mockServerLookup({ serverId: 'guild-1' });
      await expect(getServerFeatures('guild-1')).resolves.toEqual({});
    });

    it('returns known overrides from the lean plain object', async () => {
      mockServerLookup({
        settings: {
          features: { 'discord.authoring': true, 'removed.flag': true },
        },
      });
      await expect(getServerFeatures('guild-1')).resolves.toEqual({
        'discord.authoring': true,
      });
    });

    it('accepts overrides stored as a Map', async () => {
      mockServerLookup({
        settings: { features: new Map([['discord.authoring', false]]) },
      });
      await expect(getServerFeatures('guild-1')).resolves.toEqual({
        'discord.authoring': false,
      });
    });

    it('skips non-boolean values', async () => {
      mockServerLookup({
        settings: { features: { 'discord.authoring': 'yes' } },
      });
      await expect(getServerFeatures('guild-1')).resolves.toEqual({});
    });
  });
});
