import { createNoopLogger, isLogLevel, shouldLog } from './logger';

describe('logger port helpers', () => {
  it('recognises only known levels', () => {
    expect(isLogLevel('warn')).toBe(true);
    expect(isLogLevel('trace')).toBe(false);
    expect(isLogLevel(undefined)).toBe(false);
  });

  it.each([
    ['debug', 'info', false],
    ['info', 'info', true],
    ['error', 'warn', true],
    ['warn', 'error', false],
  ] as const)('shouldLog(%s, threshold %s) is %s', (level, threshold, want) => {
    expect(shouldLog(level, threshold)).toBe(want);
  });

  it('noop logger accepts every call and returns itself from child', () => {
    const logger = createNoopLogger();
    expect(logger.debug('a')).toBeUndefined();
    expect(logger.info('a')).toBeUndefined();
    expect(logger.warn('a')).toBeUndefined();
    expect(logger.error('a')).toBeUndefined();
    expect(logger.child({ journeyId: 'j' })).toBe(logger);
  });
});
