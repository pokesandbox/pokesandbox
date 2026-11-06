import { IntlMessageFormat } from 'intl-messageformat';

import {
  CATALOGS,
  listMessageKeys,
  lookupMessage,
  type MessageKey,
} from './catalog';
import { t } from './translate';

describe('t', () => {
  it('formats an English message', () => {
    expect(t('command.unavailable')).toBe(
      "This command isn't available on this server yet.",
    );
  });

  it('fills ICU placeholders with structured values', () => {
    expect(t('money.amount', { amount: 1234 })).toBe('₽1,234');
  });

  it('formats numbers in the language the message is written in', () => {
    const catalogs = {
      en: CATALOGS['en'],
      de: { money: { amount: '{amount, number, integer} ₽' } },
    };

    expect(t('money.amount', { amount: 1234 }, 'de', catalogs)).toBe('1.234 ₽');
  });

  it('applies ICU plural rules', () => {
    const catalogs = {
      en: {
        command: { unavailable: '{n, plural, one {# item} other {# items}}' },
      },
    };

    expect(t('command.unavailable', { n: 1 }, 'en', catalogs)).toBe('1 item');
    expect(t('command.unavailable', { n: 3 }, 'en', catalogs)).toBe('3 items');
  });

  it('falls back to the base language, then English', () => {
    const catalogs = {
      en: { command: { unavailable: 'English' } },
      pt: { command: { unavailable: 'Português' } },
    };

    expect(t('command.unavailable', {}, 'pt-BR', catalogs)).toBe('Português');
    expect(t('command.unavailable', {}, 'de', catalogs)).toBe('English');
    expect(t('command.unavailable', {}, 'not a locale', catalogs)).toBe(
      'English',
    );
  });

  it('throws on a key no catalog has', () => {
    // Cast: an unknown key is a type error; this checks the runtime guard too.
    expect(() => t('nope.missing' as MessageKey)).toThrow(
      'Unknown message key: nope.missing',
    );
  });
});

describe('message catalogs', () => {
  const english = CATALOGS['en'];

  it.each(Object.entries(CATALOGS))(
    'every %s message is valid ICU',
    (locale, catalog) => {
      for (const key of listMessageKeys(catalog)) {
        const message = lookupMessage(catalog, key) ?? '';
        expect(() => new IntlMessageFormat(message, locale)).not.toThrow();
      }
    },
  );

  it.each(Object.entries(CATALOGS))(
    'every %s key exists in English',
    (_locale, catalog) => {
      const englishKeys = listMessageKeys(english);
      expect(
        listMessageKeys(catalog).filter((key) => !englishKeys.includes(key)),
      ).toEqual([]);
    },
  );
});

describe('lookupMessage', () => {
  it('returns undefined for a missing catalog, a branch, or a path through a leaf', () => {
    const catalog = { a: { b: 'leaf' } };

    expect(lookupMessage(undefined, 'a.b')).toBeUndefined();
    expect(lookupMessage(catalog, 'a')).toBeUndefined();
    expect(lookupMessage(catalog, 'a.b.c')).toBeUndefined();
    expect(lookupMessage(catalog, 'a.b')).toBe('leaf');
  });
});
