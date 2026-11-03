import { Server } from '@shared/models';

import { getCachedServer, saveServer } from '@bot/cache';
import {
  ensureServerInitialized,
  type AdminMenuContext,
} from './AdminMenuBuilder';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  saveServer: jest.fn(),
}));

function makeCtx() {
  const followUp = jest.fn();
  const interaction = {
    guild: {
      id: 'guild-1',
      name: 'Test Guild',
      icon: null,
      iconURL: () => null,
    },
    followUp,
  };
  return { ctx: { interaction } as unknown as AdminMenuContext, followUp };
}

describe('ensureServerInitialized', () => {
  afterEach(() => jest.restoreAllMocks());

  it('creates the server, saves it, and welcomes the admin', async () => {
    const server = { serverId: 'guild-1' };
    jest.mocked(getCachedServer).mockResolvedValue(null);
    const find = jest
      .spyOn(Server, 'findOrCreateServer')
      .mockResolvedValue({ server, created: true } as never);
    const { ctx, followUp } = makeCtx();

    await ensureServerInitialized(ctx);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ serverId: 'guild-1', name: 'Test Guild' }),
    );
    expect(saveServer).toHaveBeenCalledWith(server);
    expect(followUp).toHaveBeenCalledTimes(1);
  });

  it('does not welcome again when a concurrent call created the server', async () => {
    jest.mocked(getCachedServer).mockResolvedValue(null);
    jest.mocked(saveServer).mockClear();
    jest
      .spyOn(Server, 'findOrCreateServer')
      .mockResolvedValue({ server: {}, created: false } as never);
    const { ctx, followUp } = makeCtx();

    await ensureServerInitialized(ctx);

    expect(saveServer).not.toHaveBeenCalled();
    expect(followUp).not.toHaveBeenCalled();
  });
});
