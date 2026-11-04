import { DexEntry } from '@shared/models';

import { searchPokemon } from './searchPokemon';

jest.mock('@shared/models', () => ({ DexEntry: { find: jest.fn() } }));

describe('searchPokemon', () => {
  it('matches by name or by species ID, among canon and server entries', async () => {
    jest.mocked(DexEntry.find).mockResolvedValue([] as never);

    await searchPokemon('server1', 'Mr. Mime');

    const query = jest.mocked(DexEntry.find).mock.calls[0][0] as unknown as {
      $and: { $or?: Record<string, unknown>[] }[];
    };
    expect(query.$and[1].$or).toContainEqual({ speciesId: 'mrmime' });
    expect(query.$and[2].$or).toEqual([
      { isCanon: true },
      { originServer: 'server1' },
    ]);
  });

  it('returns the exact name match and sorts matches by dex number', async () => {
    const raichu = { name: 'Raichu', num: 26 };
    const pikachu = { name: 'Pikachu', num: 25 };
    jest.mocked(DexEntry.find).mockResolvedValue([raichu, pikachu] as never);

    const result = await searchPokemon('server1', 'pikachu');

    expect(result.exactMatch).toBe(pikachu);
    expect(result.potentialMatches).toEqual([pikachu, raichu]);
  });

  it('returns no exact match when nothing is found', async () => {
    jest.mocked(DexEntry.find).mockResolvedValue([] as never);

    expect(await searchPokemon('server1', 'missingno')).toEqual({
      potentialMatches: [],
    });
  });
});
