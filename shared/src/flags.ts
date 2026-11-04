import {
  isFlagKey,
  parseFlagOverrides,
  type AppEnv,
  type FlagValues,
} from '@core/flags';

import { Server } from './models/server.model';

/**
 * `NODE_ENV=production` uses the prod defaults; anything else (unset,
 * `development`, `test`) uses the dev defaults. Nothing selects `staging` yet:
 * a staging deployment runs with `NODE_ENV=production` and turns flags on with
 * `FEATURE_FLAGS` until it gets its own setting (#180).
 */
export function appEnvFromNodeEnv(nodeEnv: string | undefined): AppEnv {
  return nodeEnv === 'production' ? 'prod' : 'dev';
}

export interface FlagEnv {
  env: AppEnv;
  envOverrides: FlagValues;
}

/** Reads `NODE_ENV` and `FEATURE_FLAGS`. Apps call this once at startup. */
export function readFlagEnv(
  processEnv: Record<string, string | undefined> = process.env,
): FlagEnv {
  return {
    env: appEnvFromNodeEnv(processEnv.NODE_ENV),
    envOverrides: parseFlagOverrides(processEnv.FEATURE_FLAGS),
  };
}

/**
 * The server's feature flag overrides (`Server.settings.features`), for
 * `isEnabled`'s `serverFeatures`. Fresh `lean()` read; empty when there is no
 * guild, no server, or no overrides. Keys of removed flags are skipped.
 */
export async function getServerFeatures(
  guildId: string | null | undefined,
): Promise<FlagValues> {
  if (!guildId) return {};
  const server = await Server.findOne({ serverId: guildId })
    .select('settings.features')
    .lean();
  // `lean()` returns a Map field as a plain object, despite its Map type.
  const raw: unknown = server?.settings?.features;
  const stored: Record<string, unknown> =
    raw instanceof Map
      ? Object.fromEntries(raw)
      : typeof raw === 'object' && raw !== null
        ? { ...raw }
        : {};

  const features: FlagValues = {};
  for (const [key, value] of Object.entries(stored)) {
    if (isFlagKey(key) && typeof value === 'boolean') features[key] = value;
  }
  return features;
}

/**
 * Discord IDs of the servers with any feature flag override, so the bot can
 * register their hidden commands at startup. Read each server's values with
 * `getServerFeatures`.
 */
export async function getServerIdsWithFeatureOverrides(): Promise<string[]> {
  const servers = await Server.find()
    .where('settings.features')
    .exists(true)
    .nin([null, {}])
    .select('serverId')
    .lean();
  return servers.map((server) => server.serverId);
}
