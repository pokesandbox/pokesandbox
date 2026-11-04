import { defineFlag, FLAG_KEYS, FLAGS, isFlagKey } from './flags';

describe('flag registry', () => {
  it('defines discord.authoring on in dev and staging, off in prod', () => {
    expect(FLAGS['discord.authoring'].defaults).toEqual({
      dev: true,
      staging: true,
      prod: false,
    });
  });

  it('lists every flag key', () => {
    expect(FLAG_KEYS).toEqual(Object.keys(FLAGS));
  });

  it('recognises known keys only', () => {
    expect(isFlagKey('discord.authoring')).toBe(true);
    expect(isFlagKey('not.a.flag')).toBe(false);
  });

  it('freezes definitions so defaults cannot change at runtime', () => {
    const flag = defineFlag('example.flag', {
      description: 'Example',
      defaults: { dev: true, staging: false, prod: false },
    });
    expect(flag.key).toBe('example.flag');
    expect(Object.isFrozen(flag)).toBe(true);
    expect(Object.isFrozen(flag.defaults)).toBe(true);
    expect(Object.isFrozen(FLAGS)).toBe(true);
  });
});
