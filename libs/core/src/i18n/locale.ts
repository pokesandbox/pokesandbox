import { DEFAULT_LOCALE } from './catalog';

/** Where a viewer's locale can come from, most specific first. */
export interface LocaleSources {
  /** The player's own setting (not stored yet). */
  preference?: string | null;
  /** Discord's `interaction.locale`. */
  interactionLocale?: string | null;
  /** The server setting, or Discord's `guild.preferredLocale`. */
  serverLocale?: string | null;
}

/** Canonical BCP 47 tag, or undefined for an empty or invalid one. */
export function canonicalLocale(
  locale: string | null | undefined,
): string | undefined {
  if (!locale) return undefined;
  try {
    return Intl.getCanonicalLocales(locale)[0];
  } catch {
    return undefined;
  }
}

/** Locale for a private message: preference → interaction → server → `en`. */
export function resolveLocale(sources: LocaleSources): string {
  return (
    canonicalLocale(sources.preference) ??
    canonicalLocale(sources.interactionLocale) ??
    canonicalLocale(sources.serverLocale) ??
    DEFAULT_LOCALE
  );
}

/** Locale for a message several people see at once: the server's, then `en`. */
export function resolveSharedLocale(
  serverLocale: string | null | undefined,
): string {
  return canonicalLocale(serverLocale) ?? DEFAULT_LOCALE;
}

/** Catalogs to try for `locale`: itself, its base language, then `en`. */
export function localeFallbacks(locale: string): string[] {
  const canonical = canonicalLocale(locale);
  if (!canonical) return [DEFAULT_LOCALE];
  const language = new Intl.Locale(canonical).language;
  return [...new Set([canonical, language, DEFAULT_LOCALE])];
}
