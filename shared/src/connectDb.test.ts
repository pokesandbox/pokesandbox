import { createNoopLogger } from '@core/logging';

describe('connectDb', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    delete (global as { mongoose?: unknown }).mongoose;
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it.each(['production', 'development'])(
    'connects with autoIndex off when NODE_ENV is %s',
    async (nodeEnv) => {
      const connect = jest.fn().mockResolvedValue({ connected: true });
      jest.doMock('mongoose', () => ({ connect }));
      process.env.NODE_ENV = nodeEnv;
      process.env.DATABASE_URI = 'mongodb://example/test';
      const logger = createNoopLogger();
      const info = jest.spyOn(logger, 'info');

      const { connectDb } = await import('./connectDb');
      await connectDb(logger);

      expect(connect).toHaveBeenCalledWith('mongodb://example/test', {
        autoIndex: false,
      });
      expect(info).toHaveBeenCalledWith('Connected to MongoDB');
    },
  );

  it('logs and throws when the connection fails outside the bot', async () => {
    const error = new Error('refused');
    jest.doMock('mongoose', () => ({
      connect: jest.fn().mockRejectedValue(error),
    }));
    delete process.env.APP_TYPE;
    const logger = createNoopLogger();
    const logError = jest.spyOn(logger, 'error');

    const { connectDb } = await import('./connectDb');

    await expect(connectDb(logger)).rejects.toThrow(
      'Database connection failed',
    );
    expect(logError).toHaveBeenCalledWith('MongoDB connection failed', {
      err: error,
    });
  });
});
