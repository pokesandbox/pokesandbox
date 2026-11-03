import { MenuHarness } from '@flowcord/testing';

import type { Region, Server } from '@shared/models';

import {
  getAssertedCachedRegion,
  getCachedRegion,
  getCachedServer,
} from '@bot/cache';
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
    const harness = await startManagePokedexMenu();

    harness.clickModal('Add / Edit Slot');
    await submitModalFields(harness, { 'pokedex-no': 'abc' });

    expect(harness.currentMenu).toBe('manage-pokedex');
    expect(harness.hasText(INVALID_POKEDEX_NO_PROMPT)).toBe(true);
  });

  it('opens the slot menu when only a number is submitted', async () => {
    const harness = await startManagePokedexMenu();

    harness.clickModal('Add / Edit Slot');
    await submitModalFields(harness, { 'pokedex-no': '25' });

    expect(harness.currentMenu).toBe('edit-pokedex-slot');
    expect(harness.queryButton('Add Pokémon')).not.toBeNull();
  });
});

/**
 * Mocks the server and a region with an empty Pokédex, then opens the manage
 * Pokédex menu. The edit slot menu is registered so the menu can navigate to it.
 */
async function startManagePokedexMenu() {
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
  return harness;
}

/**
 * Submits the open modal. `harness.submitModal` only fakes `fields.getField`,
 * but our handlers read the `ModalSubmitFields` collection, so this enqueues a
 * submit in that shape (flowcord-dev/flowcord#112, #229).
 */
async function submitModalFields(
  harness: MenuHarness,
  values: Record<string, string>,
) {
  harness.adapter.enqueueModalSubmit({
    getFieldValue: (id: string) => values[id] ?? '',
    raw: {
      deferred: false,
      replied: false,
      deferUpdate: async () => undefined,
      fields: {
        fields: new Map(
          Object.entries(values).map(([id, value]) => [id, { value }]),
        ),
      },
    },
  } as never);
  await harness.adapter.waitForNextRender();
}
