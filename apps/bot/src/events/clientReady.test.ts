import { BotClient } from '@bot/classes';
import { ClientReady } from './clientReady';

describe('ClientReady', () => {
  it('logs what the client loaded once it is ready', () => {
    const client = new BotClient({ intents: [] });
    const logInfo = jest.spyOn(client.logger, 'info');

    ClientReady.execute(ClientReady.name, client);
    client.emit('clientReady', client as never);

    expect(logInfo).toHaveBeenCalledWith(
      'Client ready',
      expect.objectContaining({
        loaded: expect.objectContaining({ events: 0, slashCommands: 0 }),
      }),
    );
  });
});
