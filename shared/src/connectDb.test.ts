import { shouldAutoIndex } from './connectDb';

describe('shouldAutoIndex', () => {
  it('is off in production only', () => {
    expect(shouldAutoIndex('production')).toBe(false);
    expect(shouldAutoIndex('development')).toBe(true);
    expect(shouldAutoIndex(undefined)).toBe(true);
  });
});

describe('connectDb', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    delete (global as { mongoose?: unknown }).mongoose;
  });

  afterEach(() => {
    process.env = { ...env };
    jest.restoreAllMocks();
  });

  async function load(nodeEnv: string) {
    const connect = jest.fn().mockResolvedValue({ connected: true });
    jest.doMock('mongoose', () => ({ connect }));
    process.env.NODE_ENV = nodeEnv;
    process.env.DATABASE_URI = 'mongodb://example/test';
    const { connectDb } = await import('./connectDb');
    return { connect, connectDb };
  }

  it('connects with autoIndex off in production', async () => {
    const { connect, connectDb } = await load('production');
    await connectDb();
    expect(connect).toHaveBeenCalledWith('mongodb://example/test', {
      autoIndex: false,
    });
  });

  it('connects with autoIndex on in development', async () => {
    const { connect, connectDb } = await load('development');
    await connectDb();
    expect(connect).toHaveBeenCalledWith('mongodb://example/test', {
      autoIndex: true,
    });
  });
});
