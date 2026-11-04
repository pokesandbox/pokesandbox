import { readFileSync } from 'fs';
import { join } from 'path';

type SeedDexEntry = {
  name: string;
  speciesId: string;
  isCanon?: boolean;
  baseSpecies?: string;
  changesFrom?: string;
  prevo?: string;
  cosmeticFormes?: string[];
  evos?: string[];
  formeOrder?: string[];
  otherFormes?: string[];
};
type SeedSlot = {
  speciesId: string;
  includedForms?: { speciesId: string }[];
} | null;
type SeedRegion = { pokedex?: SeedSlot[] };
type SeedLocation = {
  wildTables?: { timeBlocks: { slots: { speciesId: string }[] }[] }[];
};

const readSeed = <T>(file: string): T[] =>
  JSON.parse(
    readFileSync(join(__dirname, '../../../scripts/seed/data', file), 'utf8'),
  ) as T[];

const dexEntries = readSeed<SeedDexEntry>('dexentries.json');
const regions = readSeed<SeedRegion>('regions.json');
const locations = readSeed<SeedLocation>('locations.json');

/** Showdown's `toID`: lowercase, letters and digits only. */
const toID = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Showdown names the symbol Unown forms `Unown-Exclamation` / `Unown-Question`
 * (their `toID` is not the plain `toID` of our display name).
 */
const SHOWDOWN_NAMES: Record<string, string> = {
  'Unown-!': 'Unown-Exclamation',
  'Unown-?': 'Unown-Question',
};

const speciesIds = new Set(dexEntries.map((entry) => entry.speciesId));

describe('seed data species IDs', () => {
  it('gives every dex entry the Showdown ID of its Showdown name', () => {
    const mismatches = dexEntries
      .filter(
        (entry) =>
          entry.speciesId !== toID(SHOWDOWN_NAMES[entry.name] ?? entry.name),
      )
      .map((entry) => `${entry.name} → ${entry.speciesId}`);

    expect(mismatches).toEqual([]);
  });

  it('uses Showdown IDs for the Unown symbol forms', () => {
    expect(speciesIds).toContain('unownexclamation');
    expect(speciesIds).toContain('unownquestion');
    expect(speciesIds).not.toContain('unown!');
    expect(speciesIds).not.toContain('unown?');
  });

  it('has unique species IDs among canon entries', () => {
    const canon = dexEntries.filter((entry) => entry.isCanon);
    expect(new Set(canon.map((entry) => entry.speciesId)).size).toBe(
      canon.length,
    );
  });

  it('links dex entries to each other by species ID that exists', () => {
    const links = dexEntries.flatMap((entry) => [
      ...[entry.baseSpecies, entry.changesFrom, entry.prevo].filter(
        (link) => link !== undefined,
      ),
      ...(entry.cosmeticFormes ?? []),
      ...(entry.evos ?? []),
      ...(entry.formeOrder ?? []),
      ...(entry.otherFormes ?? []),
    ]);

    expect(links.length).toBeGreaterThan(0);
    expect(links.filter((link) => !speciesIds.has(link as string))).toEqual([]);
  });

  it('references existing species from pokedex slots and encounter slots', () => {
    const slotIds = regions
      .flatMap((region) => region.pokedex ?? [])
      .flatMap((slot) =>
        slot
          ? [
              slot.speciesId,
              ...(slot.includedForms ?? []).map((f) => f.speciesId),
            ]
          : [],
      );
    const encounterIds = locations
      .flatMap((location) => location.wildTables ?? [])
      .flatMap((table) => table.timeBlocks)
      .flatMap((block) => block.slots)
      .map((slot) => slot.speciesId);

    expect(slotIds.length).toBeGreaterThan(0);
    expect(encounterIds.length).toBeGreaterThan(0);
    expect(
      [...slotIds, ...encounterIds].filter((id) => !speciesIds.has(id)),
    ).toEqual([]);
  });
});
