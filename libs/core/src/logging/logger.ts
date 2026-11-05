import type { AppEnv } from '../flags';

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export function isLogLevel(value: unknown): value is LogLevel {
  return LOG_LEVELS.some((level) => level === value);
}

/** Correlation fields attached to every record; all optional. */
export interface LogFields {
  env?: AppEnv;
  actionId?: string;
  journeyId?: string;
  battleId?: string;
  regionId?: string;
  [extra: string]: unknown;
}

/** Libraries receive this port; only apps provide an implementation. */
export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  /** A logger that adds `fields` to every record it writes. */
  child(fields: LogFields): Logger;
}

export function shouldLog(level: LogLevel, threshold: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(threshold);
}

/** Logs nothing; for tests and callers that pass no logger. */
export function createNoopLogger(): Logger {
  const logger: Logger = {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
    child: () => logger,
  };
  return logger;
}
