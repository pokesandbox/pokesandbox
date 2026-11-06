import { IntlMessageFormat } from 'intl-messageformat';

import {
  CATALOGS,
  DEFAULT_LOCALE,
  lookupMessage,
  type MessageKey,
  type MessageTree,
} from './catalog';
import { localeFallbacks } from './locale';

/** Structured values for a message's ICU placeholders. */
export type MessageParams = Readonly<
  Record<string, string | number | boolean | Date>
>;

/**
 * Formats a system message in `locale`, falling back to its base language and
 * then English. Throws on a key no catalog has.
 */
export function t(
  key: MessageKey,
  params?: MessageParams,
  locale: string = DEFAULT_LOCALE,
  catalogs: Readonly<Record<string, MessageTree>> = CATALOGS,
): string {
  for (const candidate of localeFallbacks(locale)) {
    const message = lookupMessage(catalogs[candidate], key);
    if (message === undefined) continue;
    // Plural rules and number formats follow the language the text is in.
    const formatted = new IntlMessageFormat(message, candidate).format(params);
    return Array.isArray(formatted) ? formatted.join('') : String(formatted);
  }
  throw new Error(`Unknown message key: ${key}`);
}
