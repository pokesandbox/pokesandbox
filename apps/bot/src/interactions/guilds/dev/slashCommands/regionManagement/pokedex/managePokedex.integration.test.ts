import { MenuHarness } from '@flowcord/testing';

import { submitModalFields } from '../../../../../../testing/submitModalFields';
import { EditPokedexSlotCommand } from './editPokedexSlot';
import { ManagePokedexCommand } from './managePokedex';
import { INVALID_POKEDEX_NO_PROMPT } from './pokedex.modal';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  getCachedRegion: jest.fn(),
  getAssertedCachedRegion: jest.fn(),
  saveServer: jest.fn(),
  saveRegion: jest.fn(),
}));

const cache = jest.requireMock('@bot/cache') as Record<string, jest.Mock>;

const REGION_ID = 'region1';

describe('manage pokedex menu', () => {
  let harness: MenuHarness;

  beforeEach(async () => {
    jest.clearAllMocks();
    const region = { name: 'Kanto', pokedex: [] as unknown[] };
    cache.getCachedServer.mockResolvedValue({ name: 'Test Server' });
    cache.getCachedRegion.mockResolvedValue(region);
    cache.getAssertedCachedRegion.mockResolvedValue(region);

    harness = new MenuHarness({
      'manage-pokedex': async (session, options) =>
        ManagePokedexCommand.createMenu(session, options),
      'edit-pokedex-slot': async (session, options) =>
        EditPokedexSlotCommand.createMenu(session, options),
    });
    await harness.start('manage-pokedex', { region_id: REGION_ID });
  });

  afterEach(async () => {
    await MenuHarness.endAll();
  });

  it('shows the validation prompt for an invalid Pokédex number', async () => {
    harness.clickModal('Add / Edit Slot');
    await submitModalFields(harness, { 'pokedex-no': 'abc' });

    expect(harness.currentMenu).toBe('manage-pokedex');
    expect(harness.hasText(INVALID_POKEDEX_NO_PROMPT)).toBe(true);
  });

  it('opens the slot menu when only a number is submitted', async () => {
    harness.clickModal('Add / Edit Slot');
    await submitModalFields(harness, { 'pokedex-no': '25' });

    expect(harness.currentMenu).toBe('edit-pokedex-slot');
    expect(harness.queryButton('Add Pokémon')).not.toBeNull();
  });
});
