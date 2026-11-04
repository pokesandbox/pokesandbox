/** Deployment environments a flag has a default for. */
export const APP_ENVS = ['dev', 'staging', 'prod'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

export interface FlagDefinition {
  description: string;
  defaults: Readonly<Record<AppEnv, boolean>>;
}

/** Declares one flag. Only call it in the `flagList` below. */
export function defineFlag<const K extends string>(
  key: K,
  definition: FlagDefinition,
): Readonly<FlagDefinition & { key: K }> {
  return Object.freeze({
    key,
    description: definition.description,
    defaults: Object.freeze({ ...definition.defaults }),
  });
}

/**
 * Every feature flag. The list doubles as the list of unreleased features:
 * remove a flag once its feature is fully released.
 */
const flagList = [
  defineFlag('discord.authoring', {
    description: 'Discord authoring commands (/region builders)',
    defaults: { dev: true, staging: true, prod: false },
  }),
] as const;

export type FlagKey = (typeof flagList)[number]['key'];

/** Per-flag on/off values, e.g. overrides from `FEATURE_FLAGS` or a server. */
export type FlagValues = Partial<Record<FlagKey, boolean>>;

export const FLAG_KEYS: readonly FlagKey[] = Object.freeze(
  flagList.map((flag) => flag.key),
);

function indexByKey(): Record<FlagKey, FlagDefinition> {
  const byKey: Partial<Record<FlagKey, FlagDefinition>> = {};
  for (const flag of flagList) byKey[flag.key] = flag;
  // Safe: the loop above sets every FlagKey, since FlagKey comes from flagList.
  return byKey as Record<FlagKey, FlagDefinition>;
}

export const FLAGS: Readonly<Record<FlagKey, FlagDefinition>> =
  Object.freeze(indexByKey());

export function isFlagKey(value: string): value is FlagKey {
  return (FLAG_KEYS as readonly string[]).includes(value);
}
