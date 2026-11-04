import {
  FLAG_KEYS,
  FLAGS,
  isFlagKey,
  type AppEnv,
  type FlagKey,
  type FlagValues,
} from './flags';

/**
 * Parses a `FEATURE_FLAGS` value: `*` turns every flag on, `a,b` turns flags
 * on, `-a` turns one off. `*` applies first, then named entries in order, so
 * `*,-a` means "everything except a". Unknown keys are ignored.
 */
export function parseFlagOverrides(raw: string | undefined): FlagValues {
  const entries = (raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const overrides: FlagValues = {};

  if (entries.includes('*')) {
    for (const key of FLAG_KEYS) overrides[key] = true;
  }
  for (const entry of entries) {
    const disable = entry.startsWith('-');
    const key = disable ? entry.slice(1) : entry;
    if (isFlagKey(key)) overrides[key] = !disable;
  }
  return overrides;
}

export interface FlagContext {
  env: AppEnv;
  /** From `FEATURE_FLAGS` (see `parseFlagOverrides`); wins over everything. */
  envOverrides?: FlagValues;
  /** The server's `settings.features`; wins over the environment default. */
  serverFeatures?: FlagValues;
}

/**
 * The only place a flag is resolved: the env override, then the server
 * override, then the environment's default.
 */
export function isEnabled(key: FlagKey, context: FlagContext): boolean {
  return (
    context.envOverrides?.[key] ??
    context.serverFeatures?.[key] ??
    FLAGS[key].defaults[context.env]
  );
}
