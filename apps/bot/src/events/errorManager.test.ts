import { BotClient } from '@bot/classes';
import { ErrorManager } from './errorManager';

describe('ErrorManager', () => {
  afterEach(() => {
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
  });

  it('logs unhandled rejections and uncaught exceptions', () => {
    const client = new BotClient({ intents: [] });
    const logError = jest.spyOn(client.logger, 'error');
    const rejection = new Error('rejected');
    const exception = new Error('thrown');

    ErrorManager.execute(ErrorManager.name, client);
    process.emit('unhandledRejection', rejection, Promise.resolve());
    process.emit('uncaughtException', exception);

    expect(logError).toHaveBeenCalledWith('Unhandled rejection', {
      err: rejection,
    });
    expect(logError).toHaveBeenCalledWith('Uncaught exception', {
      err: exception,
    });
  });
});
