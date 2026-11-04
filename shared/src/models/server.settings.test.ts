import { serverSchema } from './server.model';

const base = {
  serverId: 'guild-1',
  adminRoleIds: [],
  discovery: { enabled: false },
  modRoleIds: [],
  name: 'Test',
  playerList: [],
  regions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('serverSchema settings', () => {
  it('is optional, so existing servers still parse', () => {
    expect(serverSchema.parse(base).settings).toBeUndefined();
  });

  it('hydrates feature overrides into a Map', () => {
    const parsed = serverSchema.parse({
      ...base,
      settings: { features: { 'discord.authoring': true } },
    });
    expect(parsed.settings?.features).toEqual(
      new Map([['discord.authoring', true]]),
    );
  });

  it('rejects non-boolean overrides', () => {
    expect(() =>
      serverSchema.parse({
        ...base,
        settings: { features: { 'discord.authoring': 'yes' } },
      }),
    ).toThrow();
  });
});
