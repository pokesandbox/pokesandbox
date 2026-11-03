import type { AdminMenuContext } from '@bot/classes';
import { getServerMenuEmbeds } from './server.embeds';

const buildCtx = (discoveryEnabled: boolean) =>
  ({
    admin: {
      getServer: async () => ({
        name: 'Test Server',
        discovery: { enabled: discoveryEnabled },
      }),
      getRoles: async (type: 'admin' | 'mod') =>
        type === 'admin' ? ['@Admins'] : [],
    },
    state: new Map<string, unknown>(),
    interaction: { guild: { iconURL: () => undefined } },
  }) as unknown as AdminMenuContext;

describe('getServerMenuEmbeds', () => {
  it('lists admin, mod, and discovery options without a prefix option', async () => {
    const [embed] = await getServerMenuEmbeds(buildCtx(false));
    const description = embed.data.description ?? '';

    expect(description).toContain(':one: Update Admin Roles: @Admins');
    expect(description).toContain(':two: Update Mod Roles: None');
    expect(description).toContain(':three: Enable Server Discovery');
    expect(description.toLowerCase()).not.toContain('prefix');
  });

  it('offers to modify discovery settings when discovery is enabled', async () => {
    const [embed] = await getServerMenuEmbeds(buildCtx(true));

    expect(embed.data.description).toContain(
      ':three: Modify Server Discovery Settings',
    );
  });
});
