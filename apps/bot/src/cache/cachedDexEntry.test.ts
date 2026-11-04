import { getCacheService } from '@shared/cache';
import { DexEntry } from '@shared/models';

import { getAssertedCachedDexEntry, getCachedDexEntry } from './cachedDexEntry';

jest.mock('@shared/cache', () => ({ getCacheService: jest.fn() }));
jest.mock('@shared/models', () => ({ DexEntry: { findOne: jest.fn() } }));

describe('cachedDexEntry', () => {
  describe('getCachedDexEntry', () => {
    it('returns null without querying when no species ID is given', async () => {
      expect(await getCachedDexEntry(undefined)).toBeNull();
      expect(DexEntry.findOne).not.toHaveBeenCalled();
    });

    it('looks the entry up by species ID, preferring canon, and caches it', async () => {
      const { cache, exec, sort } = mockLookup({ speciesId: 'pikachu' });

      const entry = await getCachedDexEntry('pikachu');

      expect(entry).toEqual({ speciesId: 'pikachu' });
      expect(DexEntry.findOne).toHaveBeenCalledWith({ speciesId: 'pikachu' });
      expect(sort).toHaveBeenCalledWith({ isCanon: -1 });
      expect(exec).toHaveBeenCalledTimes(1);
      expect(cache.set).toHaveBeenCalledWith(
        'dex_entry:species:pikachu',
        entry,
        expect.any(Number),
      );
    });

    it('returns a cached entry without querying the database', async () => {
      const { cache } = mockLookup(null);
      cache.get.mockReturnValue({ speciesId: 'pikachu' });

      expect(await getCachedDexEntry('pikachu')).toEqual({
        speciesId: 'pikachu',
      });
      expect(DexEntry.findOne).not.toHaveBeenCalled();
    });

    it('does not cache a miss', async () => {
      const { cache } = mockLookup(null);

      expect(await getCachedDexEntry('missingno')).toBeNull();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('getAssertedCachedDexEntry', () => {
    it('throws when the species does not exist', async () => {
      mockLookup(null);

      await expect(getAssertedCachedDexEntry('missingno')).rejects.toThrow(
        'There was a problem fetching the dex entry',
      );
    });

    it('returns the entry when it exists', async () => {
      mockLookup({ speciesId: 'raichu' });

      await expect(getAssertedCachedDexEntry('raichu')).resolves.toEqual({
        speciesId: 'raichu',
      });
    });
  });
});

function mockLookup(result: unknown) {
  jest.mocked(DexEntry.findOne).mockReset();
  const cache = { get: jest.fn(), set: jest.fn() };
  jest.mocked(getCacheService).mockReturnValue(cache as never);
  const exec = jest.fn().mockResolvedValue(result);
  const sort = jest.fn().mockReturnValue({ exec });
  jest.mocked(DexEntry.findOne).mockReturnValue({ sort } as never);
  return { cache, exec, sort };
}
