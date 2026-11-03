import { MenuHarness } from '@flowcord/testing';
import { Types } from 'mongoose';

import { saveRegion } from '@bot/cache';
import { searchPokemon } from '@bot/utils';
import { submitModalFields } from '../../../../../../testing/submitModalFields';
import { EditPokedexSlotCommand } from './editPokedexSlot';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  getCachedRegion: jest.fn(),
  getAssertedCachedRegion: jest.fn(),
  getAssertedCachedDexEntry: jest.fn(),
  saveServer: jest.fn(),
  saveRegion: jest.fn(),
}));
jest.mock('@bot/utils', () => ({
  ...jest.requireActual('@bot/utils'),
  searchPokemon: jest.fn(),
}));

const cache = jest.requireMock('@bot/cache') as Record<string, jest.Mock>;

const buildDexEntry = (name: string, classification: string) => ({
  _id: new Types.ObjectId(),
  name,
  classification,
  types: ['Electric'],
  abilities: { 0: 'Static' },
  sprites: {},
});

const pikachu = buildDexEntry('Pikachu', 'Mouse');
const raichu = buildDexEntry('Raichu', 'Mouse');

describe('edit pokedex slot menu: swap', () => {
  let region: {
    name: string;
    pokedex: ({ id: Types.ObjectId; name: string } | null)[];
  };
  let harness: MenuHarness;

  beforeEach(async () => {
    jest.clearAllMocks();
    region = {
      name: 'Kanto',
      pokedex: [{ id: pikachu._id, name: pikachu.name }],
    };
    cache.getCachedServer.mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Test Server',
    });
    cache.getCachedRegion.mockResolvedValue(region);
    cache.getAssertedCachedRegion.mockResolvedValue(region);
    cache.getAssertedCachedDexEntry.mockImplementation(
      async (id: Types.ObjectId) =>
        [pikachu, raichu].find((entry) => entry._id.equals(id)),
    );

    harness = new MenuHarness({
      'edit-pokedex-slot': async (session, options) =>
        EditPokedexSlotCommand.createMenu(session, options),
    });
    await harness.start('edit-pokedex-slot', {
      region_id: 'region1',
      pokedex_no: 1,
    });
  });

  afterEach(async () => {
    await MenuHarness.endAll();
  });

  it('opens the name modal from Swap and replaces the slot', async () => {
    (searchPokemon as jest.Mock).mockResolvedValue({
      exactMatch: raichu,
      potentialMatches: [raichu],
    });

    harness.clickModal('Swap');
    await submitModalFields(harness, { 'pokemon-name': 'Raichu' });

    expect(region.pokedex[0]?.name).toBe('Raichu');
    expect(saveRegion).toHaveBeenCalledWith(region);
    expect(harness.currentMenu).toBe('edit-pokedex-slot');
    expect(harness.hasText('#1: Raichu - The Mouse Pokémon')).toBe(true);
  });

  it('keeps the original Pokémon when no match is found', async () => {
    (searchPokemon as jest.Mock).mockResolvedValue({ potentialMatches: [] });

    harness.clickModal('Swap');
    await submitModalFields(harness, { 'pokemon-name': 'Missingno' });

    expect(region.pokedex[0]?.name).toBe('Pikachu');
    expect(saveRegion).not.toHaveBeenCalled();
    expect(harness.hasText('#1: Pikachu - The Mouse Pokémon')).toBe(true);
  });
});

describe('edit pokedex slot menu: empty slot', () => {
  afterEach(async () => {
    await MenuHarness.endAll();
  });

  it('opens the name modal from Add Pokémon and fills the slot', async () => {
    jest.clearAllMocks();
    const region = {
      name: 'Kanto',
      pokedex: [] as ({ id: Types.ObjectId; name: string } | null)[],
    };
    cache.getCachedServer.mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Test Server',
    });
    cache.getCachedRegion.mockResolvedValue(region);
    cache.getAssertedCachedRegion.mockResolvedValue(region);
    (searchPokemon as jest.Mock).mockResolvedValue({
      exactMatch: pikachu,
      potentialMatches: [pikachu],
    });

    const harness = new MenuHarness({
      'edit-pokedex-slot': async (session, options) =>
        EditPokedexSlotCommand.createMenu(session, options),
    });
    await harness.start('edit-pokedex-slot', {
      region_id: 'region1',
      pokedex_no: 1,
    });
    expect(harness.hasText('This slot is currently empty')).toBe(true);

    harness.clickModal('Add Pokémon');
    await submitModalFields(harness, { 'pokemon-name': 'Pikachu' });

    expect(region.pokedex[0]).toEqual({ id: pikachu._id, name: 'Pikachu' });
    expect(saveRegion).toHaveBeenCalledWith(region);
  });
});
