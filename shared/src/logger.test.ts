import { createLogger, createLoggerFromEnv, resolveLogLevel } from './logger';

function capture() {
  const lines: string[] = [];
  return {
    lines,
    destination: {
      write: (line: string) => {
        lines.push(line);
      },
    },
  };
}

describe('logger', () => {
  describe('resolveLogLevel', () => {
    it.each([
      [{ NODE_ENV: 'production' }, 'info'],
      [{}, 'debug'],
      [{ NODE_ENV: 'production', LOG_LEVEL: 'WARN' }, 'warn'],
      [{ LOG_LEVEL: 'bogus' }, 'debug'],
    ])('%j -> %s', (env, expected) => {
      expect(resolveLogLevel(env)).toBe(expected);
    });

    it('reads process.env by default', () => {
      expect(['debug', 'info', 'warn', 'error']).toContain(resolveLogLevel());
    });
  });

  it('writes JSON lines with level, message and correlation fields', () => {
    const { lines, destination } = capture();
    createLogger({ level: 'debug', destination }).info('hello', {
      journeyId: 'j1',
      battleId: 'b1',
    });
    expect(JSON.parse(lines[0])).toMatchObject({
      level: 'info',
      message: 'hello',
      journeyId: 'j1',
      battleId: 'b1',
    });
    expect(typeof JSON.parse(lines[0]).time).toBe('string');
  });

  it('drops records below the configured level', () => {
    const { lines, destination } = capture();
    const logger = createLogger({ level: 'warn', destination });
    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');
    expect(lines.map((l) => JSON.parse(l).message)).toEqual(['c', 'd']);
  });

  it('child loggers add fields to every record', () => {
    const { lines, destination } = capture();
    const child = createLogger({ level: 'debug', destination })
      .child({ regionId: 'r1' })
      .child({ actionId: 'a1' });
    child.debug('x', { journeyId: 'j' });
    expect(JSON.parse(lines[0])).toMatchObject({
      regionId: 'r1',
      actionId: 'a1',
      journeyId: 'j',
    });
  });

  it('createLoggerFromEnv tags env and applies the level', () => {
    const { lines, destination } = capture();
    const logger = createLoggerFromEnv({ NODE_ENV: 'production' }, destination);
    logger.debug('hidden');
    logger.info('shown');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({ env: 'prod' });
  });

  it('serializes errors with their message and stack', () => {
    const { lines, destination } = capture();
    createLogger({ level: 'info', destination }).error('boom', {
      err: new Error('bad'),
    });
    const record = JSON.parse(lines[0]);
    expect(record.err).toMatchObject({ type: 'Error', message: 'bad' });
    expect(record.err.stack).toContain('Error: bad');
  });

  it('writes to stdout when no destination is given', () => {
    expect(() =>
      createLoggerFromEnv({ LOG_LEVEL: 'error' }).debug('dropped'),
    ).not.toThrow();
  });
});
