import { isEnabled, parseFlagOverrides } from './resolve';

describe('parseFlagOverrides', () => {
  it.each([undefined, '', ' , '])('returns no overrides for %p', (raw) => {
    expect(parseFlagOverrides(raw)).toEqual({});
  });

  it('turns every flag on with *', () => {
    expect(parseFlagOverrides('*')).toEqual({ 'discord.authoring': true });
  });

  it('turns named flags on and -named flags off, ignoring whitespace', () => {
    expect(parseFlagOverrides(' discord.authoring ')).toEqual({
      'discord.authoring': true,
    });
    expect(parseFlagOverrides('-discord.authoring')).toEqual({
      'discord.authoring': false,
    });
  });

  it('lets -name win over * whatever the order', () => {
    expect(parseFlagOverrides('*,-discord.authoring')).toEqual({
      'discord.authoring': false,
    });
    expect(parseFlagOverrides('-discord.authoring,*')).toEqual({
      'discord.authoring': false,
    });
  });

  it('ignores unknown keys', () => {
    expect(parseFlagOverrides('nope,-also.nope')).toEqual({});
  });
});

describe('isEnabled', () => {
  const key = 'discord.authoring';

  it.each([
    ['dev', true],
    ['staging', true],
    ['prod', false],
  ] as const)('falls back to the %s default', (env, expected) => {
    expect(isEnabled(key, { env })).toBe(expected);
  });

  it('uses the server override over the environment default', () => {
    expect(
      isEnabled(key, { env: 'prod', serverFeatures: { [key]: true } }),
    ).toBe(true);
    expect(
      isEnabled(key, { env: 'dev', serverFeatures: { [key]: false } }),
    ).toBe(false);
  });

  it('uses the env override over the server override and the default', () => {
    expect(
      isEnabled(key, {
        env: 'prod',
        envOverrides: parseFlagOverrides('*'),
        serverFeatures: { [key]: false },
      }),
    ).toBe(true);
    expect(
      isEnabled(key, {
        env: 'dev',
        envOverrides: parseFlagOverrides('-discord.authoring'),
        serverFeatures: { [key]: true },
      }),
    ).toBe(false);
  });

  it('only accepts known flag keys', () => {
    // @ts-expect-error: an unknown flag key is a compile error.
    expect(() => isEnabled('not.a.flag', { env: 'dev' })).toThrow();
  });
});
