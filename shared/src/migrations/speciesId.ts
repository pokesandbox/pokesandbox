/**
 * Pure transforms for the `showdownName` → `speciesId` migration (#120).
 * `scripts/db/migrate-species-id.ts` applies them to a live database. Every
 * function is idempotent: data already in the new shape passes through.
 */

type Id = { toString(): string };
type LinkRef = { id: Id; name?: string };

/** Maps a DexEntry `_id` (as a string) to its species ID. */
export type SpeciesIdByDocId = ReadonlyMap<string, string>;

/** Showdown's IDs for the two Unown forms the old seed named with symbols. */
const LEGACY_SPECIES_IDS: Record<string, string> = {
  'unown!': 'unownexclamation',
  'unown?': 'unownquestion',
};

export const fixLegacySpeciesId = (id: string): string =>
  LEGACY_SPECIES_IDS[id] ?? id;

const CROSS_REFERENCE_SINGLES = ['baseSpecies', 'changesFrom', 'prevo'];
const CROSS_REFERENCE_LISTS = [
  'cosmeticFormes',
  'evos',
  'formeOrder',
  'otherFormes',
];

const isLinkRef = (value: unknown): value is LinkRef =>
  typeof value === 'object' && value !== null && 'id' in value;

/** Resolves an old `{ id, name }` link (or an already converted ID). */
const resolveLink = (value: unknown, ids: SpeciesIdByDocId): string => {
  if (typeof value === 'string') return fixLegacySpeciesId(value);
  if (isLinkRef(value)) {
    const speciesId = ids.get(value.id.toString());
    if (!speciesId) {
      throw new Error(`No DexEntry found for linked id ${value.id}`);
    }
    return speciesId;
  }
  throw new Error(`Unrecognised species reference: ${JSON.stringify(value)}`);
};

export type DocumentUpdate = {
  $set: Record<string, unknown>;
  $unset: Record<string, ''>;
};

export const buildSpeciesIdByDocId = (
  entries: { _id: Id; showdownName?: string; speciesId?: string }[],
): Map<string, string> => {
  const ids = new Map<string, string>();
  for (const entry of entries) {
    const legacy = entry.speciesId ?? entry.showdownName;
    if (!legacy) {
      throw new Error(`DexEntry ${entry._id} has no showdownName or speciesId`);
    }
    ids.set(entry._id.toString(), fixLegacySpeciesId(legacy));
  }
  return ids;
};

/** Update that renames the field and converts a DexEntry's own links. */
export const migrateDexEntry = (
  entry: Record<string, unknown>,
  ids: SpeciesIdByDocId,
): DocumentUpdate => {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};

  const legacy = (entry.speciesId ?? entry.showdownName) as string;
  $set.speciesId = fixLegacySpeciesId(legacy);
  if ('showdownName' in entry) $unset.showdownName = '';

  for (const key of CROSS_REFERENCE_SINGLES) {
    if (entry[key] != null) $set[key] = resolveLink(entry[key], ids);
  }
  for (const key of CROSS_REFERENCE_LISTS) {
    const list = entry[key];
    if (Array.isArray(list)) {
      $set[key] = list.map((link) => resolveLink(link, ids));
    }
  }
  return { $set, $unset };
};

type PokedexSlot = {
  id?: Id;
  speciesId?: string;
  includedForms?: { id?: Id; speciesId?: string; ordinal: number }[];
  [key: string]: unknown;
} | null;

/** Converts a Region's `pokedex` slots to `speciesId` references. */
export const migratePokedex = (
  pokedex: PokedexSlot[],
  ids: SpeciesIdByDocId,
): PokedexSlot[] =>
  pokedex.map((slot) => {
    if (!slot) return slot;
    const { id, includedForms, ...rest } = slot;
    const speciesId = slot.speciesId ?? resolveLink({ id: id as Id }, ids);
    return {
      ...rest,
      speciesId,
      ...(includedForms && {
        includedForms: includedForms.map(({ id: formId, ...form }) => ({
          ...form,
          speciesId: form.speciesId ?? resolveLink({ id: formId as Id }, ids),
        })),
      }),
    };
  });

type WildTable = {
  timeBlocks: ({
    slots: ({ speciesId: Id | string } & Record<string, unknown>)[];
  } & Record<string, unknown>)[];
  [key: string]: unknown;
};

/** Converts a Location's encounter slots from ObjectIds to species IDs. */
export const migrateWildTables = (
  wildTables: WildTable[],
  ids: SpeciesIdByDocId,
): WildTable[] =>
  wildTables.map((table) => ({
    ...table,
    timeBlocks: table.timeBlocks.map((block) => ({
      ...block,
      slots: block.slots.map((slot) => ({
        ...slot,
        speciesId: resolveLink(
          typeof slot.speciesId === 'string'
            ? slot.speciesId
            : { id: slot.speciesId },
          ids,
        ),
      })),
    })),
  }));
