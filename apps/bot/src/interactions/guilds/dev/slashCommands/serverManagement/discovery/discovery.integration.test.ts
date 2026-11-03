import { MenuHarness } from '@flowcord/testing';

import { saveServer } from '@bot/cache';
import { submitModalFields } from '../../../../../../testing/submitModalFields';
import { DiscoveryCommand } from './discovery';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  saveServer: jest.fn(),
}));

const { getCachedServer } = jest.requireMock('@bot/cache') as {
  getCachedServer: jest.Mock;
};

describe('discovery menu', () => {
  let server: {
    name: string;
    discovery: { enabled: boolean; description?: string };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    server = { name: 'Test Server', discovery: { enabled: false } };
    getCachedServer.mockResolvedValue(server);
  });

  afterEach(async () => {
    await MenuHarness.endAll();
  });

  it('opens the description modal and saves the submitted description', async () => {
    const harness = new MenuHarness({
      discovery: (session, options) =>
        DiscoveryCommand.createMenu(session, options),
    });
    await harness.start('discovery');

    harness.clickModal('Set Description');
    await submitModalFields(harness, {
      'discovery-description': 'A friendly server',
    });

    expect(server.discovery.description).toBe('A friendly server');
    expect(saveServer).toHaveBeenCalledWith(server);
    expect(harness.currentMenu).toBe('discovery');
    expect(
      harness.hasText('Successfully updated the server description.'),
    ).toBe(true);
  });
});
