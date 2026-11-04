import { Types } from 'mongoose';

import { serverSchema } from './server.model';

describe('serverSchema', () => {
  it('parses a full server', () => {
    const playerId = new Types.ObjectId();
    const regionId = new Types.ObjectId();
    const timestamp = new Date('2026-01-01T00:00:00Z');

    expect(
      serverSchema.parse({
        serverId: 'guild-1',
        adminRoleIds: ['role-1'],
        discovery: { enabled: true, description: 'Hi', icon: 'icon' },
        modRoleIds: [],
        name: 'Test',
        playerList: [playerId],
        regions: [regionId],
        settings: { features: { 'discord.authoring': true } },
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    ).toEqual({
      serverId: 'guild-1',
      adminRoleIds: ['role-1'],
      discovery: { enabled: true, description: 'Hi', icon: 'icon' },
      modRoleIds: [],
      name: 'Test',
      playerList: [playerId],
      regions: [regionId],
      settings: { features: new Map([['discord.authoring', true]]) },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
});
