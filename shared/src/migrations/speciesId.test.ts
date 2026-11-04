import { Types } from 'mongoose';

import {
  buildSpeciesIdByDocId,
  fixLegacySpeciesId,
  migrateDexEntry,
  migratePokedex,
  migrateWildTables,
} from './speciesId';

const pikachuId = new Types.ObjectId();
const raichuId = new Types.ObjectId();
const unownBangId = new Types.ObjectId();

const ids = buildSpeciesIdByDocId([
  { _id: pikachuId, showdownName: 'pikachu' },
  { _id: raichuId, speciesId: 'raichu' },
  { _id: unownBangId, showdownName: 'unown!' },
]);

describe('speciesId migration', () => {
  describe('fixLegacySpeciesId', () => {
    it('maps the symbol Unown IDs to Showdown IDs and leaves others alone', () => {
      expect(fixLegacySpeciesId('unown!')).toBe('unownexclamation');
      expect(fixLegacySpeciesId('unown?')).toBe('unownquestion');
      expect(fixLegacySpeciesId('pikachu')).toBe('pikachu');
    });
  });

  describe('buildSpeciesIdByDocId', () => {
    it('keys species IDs by document id, fixing legacy Unown IDs', () => {
      expect(ids.get(pikachuId.toString())).toBe('pikachu');
      expect(ids.get(raichuId.toString())).toBe('raichu');
      expect(ids.get(unownBangId.toString())).toBe('unownexclamation');
    });

    it('rejects an entry with no species name', () => {
      expect(() => buildSpeciesIdByDocId([{ _id: pikachuId }])).toThrow(
        /no showdownName or speciesId/,
      );
    });
  });

  describe('migrateDexEntry', () => {
    it('renames the field and converts links to species IDs', () => {
      const update = migrateDexEntry(
        {
          showdownName: 'pikachu',
          prevo: { id: pikachuId, name: 'Pikachu' },
          baseSpecies: { id: pikachuId, name: 'Pikachu' },
          evos: [{ id: raichuId, name: 'Raichu' }],
          otherFormes: [],
        },
        ids,
      );

      expect(update.$unset).toEqual({ showdownName: '' });
      expect(update.$set).toEqual({
        speciesId: 'pikachu',
        prevo: 'pikachu',
        baseSpecies: 'pikachu',
        evos: ['raichu'],
        otherFormes: [],
      });
    });

    it('is idempotent on already migrated entries', () => {
      const update = migrateDexEntry(
        { speciesId: 'unownexclamation', evos: ['raichu'] },
        ids,
      );

      expect(update.$unset).toEqual({});
      expect(update.$set).toEqual({
        speciesId: 'unownexclamation',
        evos: ['raichu'],
      });
    });

    it('fails loudly on a link to a missing entry', () => {
      expect(() =>
        migrateDexEntry(
          {
            showdownName: 'pikachu',
            prevo: { id: new Types.ObjectId(), name: 'Ghost' },
          },
          ids,
        ),
      ).toThrow(/No DexEntry found/);
    });

    it('fails loudly on an unrecognised link', () => {
      expect(() =>
        migrateDexEntry({ showdownName: 'pikachu', prevo: 42 }, ids),
      ).toThrow(/Unrecognised species reference/);
    });
  });

  describe('migratePokedex', () => {
    it('converts slots and included forms, keeping empty slots', () => {
      const pokedex = migratePokedex(
        [
          {
            id: pikachuId,
            name: 'Pikachu',
            includedForms: [{ id: raichuId, ordinal: 1 }],
          },
          null,
          { speciesId: 'raichu', name: 'Raichu' },
        ],
        ids,
      );

      expect(pokedex).toEqual([
        {
          speciesId: 'pikachu',
          name: 'Pikachu',
          includedForms: [{ speciesId: 'raichu', ordinal: 1 }],
        },
        null,
        { speciesId: 'raichu', name: 'Raichu' },
      ]);
    });

    it('is idempotent for included forms already migrated', () => {
      const slot = {
        speciesId: 'pikachu',
        name: 'Pikachu',
        includedForms: [{ speciesId: 'raichu', ordinal: 1 }],
      };
      expect(migratePokedex([slot], ids)).toEqual([slot]);
    });
  });

  describe('migrateWildTables', () => {
    it('converts encounter slot ObjectIds to species IDs', () => {
      const tables = migrateWildTables(
        [
          {
            encounterType: 'grass',
            timeBlocks: [
              {
                timeOfDay: 'any',
                slots: [
                  { speciesId: pikachuId, minLevel: 3, maxLevel: 5, weight: 1 },
                  { speciesId: 'raichu', minLevel: 3, maxLevel: 5, weight: 1 },
                ],
              },
            ],
          },
        ],
        ids,
      );

      expect(tables[0].timeBlocks[0].slots).toEqual([
        { speciesId: 'pikachu', minLevel: 3, maxLevel: 5, weight: 1 },
        { speciesId: 'raichu', minLevel: 3, maxLevel: 5, weight: 1 },
      ]);
    });
  });
});
