import { Types } from 'mongoose';

import { Region } from '../models/region/region.model';
import { RegionDTO } from './region.dto';

describe('RegionDTO', () => {
  describe('convertFromEntity', () => {
    it('converts Pokédex slots and included forms to species IDs', () => {
      const region = new Region({
        baseGeneration: 1,
        charactersPerPlayer: 1,
        characterList: [],
        currencyType: 'coins',
        deployable: false,
        deployed: false,
        graphicSettings: {},
        locations: [new Types.ObjectId()],
        name: 'Kanto',
        createdAt: new Date(),
        updatedAt: new Date(),
        pokedex: [
          {
            speciesId: 'vulpix',
            name: 'Vulpix',
            isBaseFormNotIncluded: false,
            includedForms: [{ speciesId: 'vulpixalola', ordinal: 1 }],
          },
          null,
          { speciesId: 'pikachu', name: 'Pikachu' },
        ],
        progressionDefinitions: new Map(),
        quests: { active: [], passive: [] },
        shops: [],
        transportationTypes: [],
      });

      const dto = RegionDTO.convertFromEntity(region);

      expect(dto.pokedex[0]).toMatchObject({
        speciesId: 'vulpix',
        name: 'Vulpix',
        includedForms: [{ speciesId: 'vulpixalola', ordinal: 1 }],
      });
      expect(dto.pokedex[1]).toBeNull();
      expect(dto.pokedex[2]).toMatchObject({ speciesId: 'pikachu' });
    });
  });
});
