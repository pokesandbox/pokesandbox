import { MenuHarness } from '@flowcord/testing';
import { Types } from 'mongoose';

import type { DexEntry, Region, Server } from '@shared/models';

import {
  getAssertedCachedDexEntry,
  getAssertedCachedRegion,
  getCachedRegion,
  getCachedServer,
  saveRegion,
} from '@bot/cache';
import { searchPokemon } from '@bot/utils';
import { submitModalFields } from '../../../../../../testing/submitModalFields';
import { EditPokedexSlotCommand } from './editPokedexSlot';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  getCachedRegion: jest.fn(),
  getAssertedCachedRegion: jest.fn(),
  getAssertedCachedDexEntry: jest.fn(),
  saveRegion: jest.fn(),
}));
jest.mock('@bot/utils', () => ({
  ...jest.requireActual('@bot/utils'),
  searchPokemon: jest.fn(),
}));

const pikachu = {
  _id: new Types.ObjectId(),
  name: 'Pikachu',
  classification: 'Mouse',
  types: ['Electric'],
  abilities: { 0: 'Static' },
  sprites: {},
} as unknown as DexEntry;
const raichu = {
  _id: new Types.ObjectId(),
  name: 'Raichu',
  classification: 'Mouse',
  types: ['Electric'],
  abilities: { 0: 'Static' },
  sprites: {},
} as unknown as DexEntry;

describe('edit pokedex slot menu', () => {
  it('opens the name modal from Swap and replaces the slot', async () => {
    const region = {
      name: 'Kanto',
      pokedex: [{ id: pikachu._id, name: 'Pikachu' }],
    } as unknown as Region;
    jest
      .mocked(getCachedServer)
      .mockResolvedValue({ _id: new Types.ObjectId() } as Server);
    jest.mocked(getCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedRegion).mockResolvedValue(region);
    jest
      .mocked(getAssertedCachedDexEntry)
      .mockImplementation(async (id) =>
        id?.toString() === raichu._id.toString() ? raichu : pikachu,
      );
    jest
      .mocked(searchPokemon)
      .mockResolvedValue({ exactMatch: raichu, potentialMatches: [raichu] });
    const harness = new MenuHarness({
      'edit-pokedex-slot': async (session, options) =>
        EditPokedexSlotCommand.createMenu(session, options),
    });
    await harness.start('edit-pokedex-slot', {
      region_id: 'region1',
      pokedex_no: 1,
    });

    harness.clickModal('Swap');
    await submitModalFields(harness, { 'pokemon-name': 'Raichu' });

    expect(region.pokedex[0]?.name).toBe('Raichu');
    expect(saveRegion).toHaveBeenCalledWith(region);
    expect(harness.currentMenu).toBe('edit-pokedex-slot');
    expect(harness.hasText('#1: Raichu - The Mouse Pokémon')).toBe(true);
  });

  it('keeps the original Pokémon when a swap finds no match', async () => {
    const region = {
      name: 'Kanto',
      pokedex: [{ id: pikachu._id, name: 'Pikachu' }],
    } as unknown as Region;
    jest
      .mocked(getCachedServer)
      .mockResolvedValue({ _id: new Types.ObjectId() } as Server);
    jest.mocked(getCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedDexEntry).mockResolvedValue(pikachu);
    jest.mocked(searchPokemon).mockResolvedValue({ potentialMatches: [] });
    const harness = new MenuHarness({
      'edit-pokedex-slot': async (session, options) =>
        EditPokedexSlotCommand.createMenu(session, options),
    });
    await harness.start('edit-pokedex-slot', {
      region_id: 'region1',
      pokedex_no: 1,
    });

    harness.clickModal('Swap');
    await submitModalFields(harness, { 'pokemon-name': 'Missingno' });

    expect(region.pokedex[0]?.name).toBe('Pikachu');
    expect(saveRegion).not.toHaveBeenCalled();
    expect(harness.hasText('#1: Pikachu - The Mouse Pokémon')).toBe(true);
  });

  it('opens the name modal from Add Pokémon and fills an empty slot', async () => {
    const region = { name: 'Kanto', pokedex: [] } as unknown as Region;
    jest
      .mocked(getCachedServer)
      .mockResolvedValue({ _id: new Types.ObjectId() } as Server);
    jest.mocked(getCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedDexEntry).mockResolvedValue(pikachu);
    jest
      .mocked(searchPokemon)
      .mockResolvedValue({ exactMatch: pikachu, potentialMatches: [pikachu] });
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
    expect(harness.hasText('#1: Pikachu - The Mouse Pokémon')).toBe(true);
  });
});
