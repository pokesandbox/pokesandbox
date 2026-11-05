import { DexEntry } from './dexentry.model';
import { Location } from './location/location.model';
import { Server } from './server.model';
import { User } from './user.model';
import { isDuplicateKeyError } from './utils';

describe('declared indexes', () => {
  it('makes Server.serverId unique', () => {
    expect(Server.schema.indexes()).toContainEqual([
      { serverId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });

  it('makes User.userId unique', () => {
    expect(User.schema.indexes()).toContainEqual([
      { userId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });

  it('makes DexEntry.speciesId unique among canon entries only', () => {
    expect(DexEntry.schema.indexes()).toContainEqual([
      { speciesId: 1 },
      expect.objectContaining({
        unique: true,
        partialFilterExpression: { isCanon: true },
      }),
    ]);
  });

  it('makes Location { regionId, ordinal } unique', () => {
    expect(Location.schema.indexes()).toContainEqual([
      { regionId: 1, ordinal: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });
});

describe('isDuplicateKeyError', () => {
  it('recognises code 11000 only', () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true);
    expect(isDuplicateKeyError({ code: 1 })).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
    expect(isDuplicateKeyError('x')).toBe(false);
  });
});
