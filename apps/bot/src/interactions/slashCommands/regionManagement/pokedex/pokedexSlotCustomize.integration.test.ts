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
import { PokedexSlotCustomizeCommand } from './pokedexSlotCustomize';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  getCachedRegion: jest.fn(),
  getAssertedCachedRegion: jest.fn(),
  getAssertedCachedDexEntry: jest.fn(),
  saveRegion: jest.fn(),
}));

const entries: Record<string, DexEntry> = {
  vulpix: {
    speciesId: 'vulpix',
    name: 'Vulpix',
    otherFormes: ['vulpixalola'],
  } as unknown as DexEntry,
  vulpixalola: {
    speciesId: 'vulpixalola',
    name: 'Vulpix-Alola',
  } as unknown as DexEntry,
};

describe('customize pokedex slot menu', () => {
  it('lists the base form and alternate forms by species ID', async () => {
    const { harness } = await startCustomizeMenu({
      speciesId: 'vulpix',
      name: 'Vulpix',
      includedForms: [],
    });

    expect(harness.hasText('0. Vulpix (Base Form)')).toBe(true);
    expect(harness.queryButton('Vulpix-Alola')).not.toBeNull();
  });

  it('adds an alternate form to the slot by species ID', async () => {
    const { harness, region } = await startCustomizeMenu({
      speciesId: 'vulpix',
      name: 'Vulpix',
      includedForms: [],
    });

    await harness.click('Vulpix-Alola');

    expect(region.pokedex[0]?.includedForms).toEqual([
      { speciesId: 'vulpixalola', ordinal: 1 },
    ]);
    expect(saveRegion).toHaveBeenCalledWith(region);
  });

  it('removes an included form from the slot by species ID', async () => {
    const { harness, region } = await startCustomizeMenu({
      speciesId: 'vulpix',
      name: 'Vulpix',
      includedForms: [{ speciesId: 'vulpixalola', ordinal: 1 }],
    });

    await harness.click('Vulpix-Alola');

    expect(region.pokedex[0]?.includedForms).toEqual([]);
    expect(saveRegion).toHaveBeenCalledWith(region);
  });

  it('toggles whether the base form is included', async () => {
    const { harness, region } = await startCustomizeMenu({
      speciesId: 'vulpix',
      name: 'Vulpix',
      includedForms: [{ speciesId: 'vulpixalola', ordinal: 1 }],
    });

    await harness.click('Vulpix');

    expect(region.pokedex[0]?.isBaseFormNotIncluded).toBe(true);
    expect(saveRegion).toHaveBeenCalledWith(region);
  });
});

/** Opens the customize menu on slot 1 of a region holding the given slot. */
async function startCustomizeMenu(
  slot: NonNullable<Region['pokedex'][number]>,
) {
  const region = { name: 'Kanto', pokedex: [slot] } as unknown as Region;
  jest
    .mocked(getCachedServer)
    .mockResolvedValue({ _id: new Types.ObjectId() } as Server);
  jest.mocked(getCachedRegion).mockResolvedValue(region);
  jest.mocked(getAssertedCachedRegion).mockResolvedValue(region);
  jest
    .mocked(getAssertedCachedDexEntry)
    .mockImplementation(async (speciesId) => entries[speciesId ?? '']);

  const harness = new MenuHarness({
    'customize-pokedex-slot': async (session, options) =>
      PokedexSlotCustomizeCommand.createMenu(session, options),
  });
  await harness.start('customize-pokedex-slot', {
    region_id: 'region1',
    pokedex_no: 1,
  });
  return { harness, region };
}
