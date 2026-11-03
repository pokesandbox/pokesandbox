import { MenuHarness } from '@flowcord/testing';
import { EmbedBuilder } from 'discord.js';

import { Server, type Server as ServerDoc } from '@shared/models';

import { getCachedServer, saveServer } from '@bot/cache';
import { AdminMenuBuilder } from './AdminMenuBuilder';

jest.mock('@bot/cache', () => ({
  getCachedServer: jest.fn(),
  saveServer: jest.fn(),
}));

describe('AdminMenuBuilder server initialization', () => {
  it('creates the server, saves it, and welcomes the admin on first use', async () => {
    const server = { serverId: 'guild-1' } as ServerDoc;
    jest.mocked(getCachedServer).mockResolvedValue(null);
    const findOrCreate = jest
      .spyOn(Server, 'findOrCreateServer')
      .mockResolvedValue({ server, created: true });

    const { followUp } = await startMenu();

    expect(findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ serverId: 'guild-1', name: 'Test Guild' }),
    );
    expect(saveServer).toHaveBeenCalledWith(server);
    expect(followUp).toHaveBeenCalledTimes(1);
  });

  it('does not welcome again when a concurrent call created the server', async () => {
    jest.mocked(getCachedServer).mockResolvedValue(null);
    jest
      .spyOn(Server, 'findOrCreateServer')
      .mockResolvedValue({ server: {} as ServerDoc, created: false });

    const { followUp } = await startMenu();

    expect(saveServer).not.toHaveBeenCalled();
    expect(followUp).not.toHaveBeenCalled();
  });

  it('skips initialization when the server already exists', async () => {
    jest
      .mocked(getCachedServer)
      .mockResolvedValue({ serverId: 'guild-1' } as ServerDoc);
    const findOrCreate = jest.spyOn(Server, 'findOrCreateServer');

    await startMenu();

    expect(findOrCreate).not.toHaveBeenCalled();
  });
});

/**
 * Opens a bare admin menu in a guild; its setup runs the server initialization.
 *
 * MenuHarness doesn't let a test supply the command interaction, so this adds
 * a guild to the harness's stub. The welcome goes out through
 * `interaction.followUp`, which the menu render never shows, so the stub's own
 * `followUp` mock is returned for assertions.
 */
async function startMenu() {
  const harness = new MenuHarness({
    main: (session) =>
      new AdminMenuBuilder(session, 'main')
        .setButtons(() => [])
        .setEmbeds(() => [new EmbedBuilder().setTitle('Admin')])
        .setCancellable()
        .build(),
  });
  const interaction = (
    harness as unknown as { _interaction: { followUp: jest.Mock } }
  )._interaction;
  Object.assign(interaction, {
    guild: {
      id: 'guild-1',
      name: 'Test Guild',
      icon: null,
      iconURL: () => null,
    },
  });
  await harness.start('main');
  return { harness, followUp: interaction.followUp };
}
