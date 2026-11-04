import { MenuHarness } from '@flowcord/testing';

import type { Server } from '@shared/models';

import { getCachedServer, saveServer } from '@bot/cache';
import { submitModalFields } from '../../../../testing/submitModalFields';
import { DiscoveryCommand } from './discovery';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  saveServer: jest.fn(),
}));

describe('discovery menu', () => {
  it('opens the description modal and saves the submitted description', async () => {
    const server = { name: 'Test Server', discovery: { enabled: false } };
    jest.mocked(getCachedServer).mockResolvedValue(server as unknown as Server);
    const harness = new MenuHarness({
      discovery: (session, options) =>
        DiscoveryCommand.createMenu(session, options),
    });
    await harness.start('discovery');

    harness.clickModal('Set Description');
    await submitModalFields(harness, {
      'discovery-description': 'A friendly server',
    });

    expect(server.discovery).toHaveProperty('description', 'A friendly server');
    expect(saveServer).toHaveBeenCalledWith(server);
    expect(harness.currentMenu).toBe('discovery');
    expect(
      harness.hasText('Successfully updated the server description.'),
    ).toBe(true);
  });
});
