import { saveServer } from '@bot/cache';
import type { AdminMenuContext } from '@bot/classes';
import { getDiscoveryDescriptionModal } from './discoveryDescription.modal';

jest.mock('@bot/cache', () => ({ saveServer: jest.fn() }));

describe('getDiscoveryDescriptionModal onSubmit', () => {
  it('saves the description and sets a success prompt', async () => {
    const server = { discovery: { description: 'old' } };
    const ctx = {
      admin: { getServer: jest.fn().mockResolvedValue(server) },
      state: { set: jest.fn() },
    } as unknown as AdminMenuContext;

    await getDiscoveryDescriptionModal('old').onSubmit?.(ctx, {
      fields: { get: () => ({ value: 'A new description' }) },
    } as never);

    expect(server.discovery.description).toBe('A new description');
    expect(saveServer).toHaveBeenCalledWith(server);
    expect(ctx.state.set).toHaveBeenCalledWith(
      'prompt',
      'Successfully updated the server description.',
    );
  });
});
