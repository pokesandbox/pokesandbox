import { MenuHarness } from '@flowcord/testing';

import type { Region, Server } from '@shared/models';

import {
  getAssertedCachedRegion,
  getCachedRegion,
  getCachedServer,
} from '@bot/cache';
import { submitModalFields } from '../../../../../../testing/submitModalFields';
import { EditPokedexSlotCommand } from './editPokedexSlot';
import { ManagePokedexCommand } from './managePokedex';
import { INVALID_POKEDEX_NO_PROMPT } from './pokedex.modal';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  getCachedRegion: jest.fn(),
  getAssertedCachedRegion: jest.fn(),
}));

describe('manage pokedex menu', () => {
  it('shows the validation prompt for an invalid Pokédex number', async () => {
    const region = { name: 'Kanto', pokedex: [] } as unknown as Region;
    jest
      .mocked(getCachedServer)
      .mockResolvedValue({ name: 'Test Server' } as Server);
    jest.mocked(getCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedRegion).mockResolvedValue(region);
    const harness = new MenuHarness({
      'manage-pokedex': async (session, options) =>
        ManagePokedexCommand.createMenu(session, options),
    });
    await harness.start('manage-pokedex', { region_id: 'region1' });

    harness.clickModal('Add / Edit Slot');
    await submitModalFields(harness, { 'pokedex-no': 'abc' });

    expect(harness.currentMenu).toBe('manage-pokedex');
    expect(harness.hasText(INVALID_POKEDEX_NO_PROMPT)).toBe(true);
  });

  it('opens the slot menu when only a number is submitted', async () => {
    const region = { name: 'Kanto', pokedex: [] } as unknown as Region;
    jest
      .mocked(getCachedServer)
      .mockResolvedValue({ name: 'Test Server' } as Server);
    jest.mocked(getCachedRegion).mockResolvedValue(region);
    jest.mocked(getAssertedCachedRegion).mockResolvedValue(region);
    const harness = new MenuHarness({
      'manage-pokedex': async (session, options) =>
        ManagePokedexCommand.createMenu(session, options),
      'edit-pokedex-slot': async (session, options) =>
        EditPokedexSlotCommand.createMenu(session, options),
    });
    await harness.start('manage-pokedex', { region_id: 'region1' });

    harness.clickModal('Add / Edit Slot');
    await submitModalFields(harness, { 'pokedex-no': '25' });

    expect(harness.currentMenu).toBe('edit-pokedex-slot');
    expect(harness.queryButton('Add Pokémon')).not.toBeNull();
  });
});
