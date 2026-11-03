describe('connectDb', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
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

      const { connectDb } = await import('./connectDb');
      await connectDb();

      expect(connect).toHaveBeenCalledWith('mongodb://example/test', {
        autoIndex: false,
      });
    },
  );
});
