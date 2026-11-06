import en from './messages/en.json';

/** Nested message catalog, the JSON shape `next-intl` reads too. */
export interface MessageTree {
  readonly [key: string]: string | MessageTree;
}

type LeafKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : LeafKeys<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Dotted path to a message in the English catalog, e.g. `command.unavailable`. */
export type MessageKey = LeafKeys<typeof en>;

export const DEFAULT_LOCALE = 'en';

/** Catalogs by BCP 47 locale. English is the source; others may be partial. */
export const CATALOGS: Readonly<Record<string, MessageTree>> = Object.freeze({
  en,
});

export function lookupMessage(
  catalog: MessageTree | undefined,
  key: string,
): string | undefined {
  let node: string | MessageTree | undefined = catalog;
  for (const part of key.split('.')) {
    if (node === undefined || typeof node === 'string') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/** Every dotted key with a message in `catalog`. */
export function listMessageKeys(catalog: MessageTree, prefix = ''): string[] {
  return Object.entries(catalog).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [`${prefix}${key}`]
      : listMessageKeys(value, `${prefix}${key}.`),
  );
}
