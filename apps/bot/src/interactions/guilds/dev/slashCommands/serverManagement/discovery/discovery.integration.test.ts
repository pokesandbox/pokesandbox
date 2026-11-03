import { MenuHarness } from '@flowcord/testing';

import type { Server } from '@shared/models';

import { getCachedServer, saveServer } from '@bot/cache';
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

/**
 * Submits the open modal. `harness.submitModal` only fakes `fields.getField`,
 * but our handlers read the `ModalSubmitFields` collection, so this enqueues a
 * submit in that shape (flowcord-dev/flowcord#112, #229).
 */
async function submitModalFields(
  harness: MenuHarness,
  values: Record<string, string>,
) {
  harness.adapter.enqueueModalSubmit({
    getFieldValue: (id: string) => values[id] ?? '',
    raw: {
      deferred: false,
      replied: false,
      deferUpdate: async () => undefined,
      fields: {
        fields: new Map(
          Object.entries(values).map(([id, value]) => [id, { value }]),
        ),
      },
    },
  } as never);
  await harness.adapter.waitForNextRender();
}
