import {
  canonicalLocale,
  localeFallbacks,
  resolveLocale,
  resolveSharedLocale,
} from './locale';

describe('resolveLocale', () => {
  it('prefers the player, then the interaction, then the server', () => {
    expect(
      resolveLocale({
        preference: 'fr',
        interactionLocale: 'de',
        serverLocale: 'es-ES',
      }),
    ).toBe('fr');
    expect(
      resolveLocale({ interactionLocale: 'de', serverLocale: 'es-ES' }),
    ).toBe('de');
    expect(
      resolveLocale({ interactionLocale: null, serverLocale: 'es-ES' }),
    ).toBe('es-ES');
  });

  it('defaults to English', () => {
    expect(resolveLocale({})).toBe('en');
  });

  it('skips invalid tags', () => {
    expect(
      resolveLocale({ preference: 'not a locale', serverLocale: 'fr' }),
    ).toBe('fr');
  });
});

describe('resolveSharedLocale', () => {
  it("uses the server's locale, then English", () => {
    expect(resolveSharedLocale('pt-BR')).toBe('pt-BR');
    expect(resolveSharedLocale(undefined)).toBe('en');
  });
});

describe('canonicalLocale', () => {
  it('canonicalizes the case of a tag', () => {
    expect(canonicalLocale('zh-cn')).toBe('zh-CN');
  });
});

describe('localeFallbacks', () => {
  it('lists the locale, its base language, and English once each', () => {
    expect(localeFallbacks('pt-BR')).toEqual(['pt-BR', 'pt', 'en']);
    expect(localeFallbacks('en-US')).toEqual(['en-US', 'en']);
    expect(localeFallbacks('en')).toEqual(['en']);
  });
});
