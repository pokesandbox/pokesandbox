import {
  isLogLevel,
  shouldLog,
  type LogFields,
  type Logger,
  type LogLevel,
} from '@core/logging';

import { appEnvFromNodeEnv } from './flags';

export interface LoggerOptions {
  level: LogLevel;
  fields?: LogFields;
  /** Receives one JSON line per record. */
  write?: (line: string) => void;
}

/** Default: `debug` outside production, `info` in production. */
export function resolveLogLevel(
  processEnv: Record<string, string | undefined> = process.env,
): LogLevel {
  const configured = processEnv.LOG_LEVEL?.trim().toLowerCase();
  if (isLogLevel(configured)) return configured;
  return appEnvFromNodeEnv(processEnv.NODE_ENV) === 'prod' ? 'info' : 'debug';
}

/** Structured JSON logger. Apps call this once at startup. */
export function createLogger(options: LoggerOptions): Logger {
  const { level: threshold, fields: base = {} } = options;
  const write = options.write ?? ((line: string) => console.log(line));

  const emit = (level: LogLevel, message: string, fields?: LogFields) => {
    if (!shouldLog(level, threshold)) return;
    write(
      JSON.stringify({
        level,
        time: new Date().toISOString(),
        message,
        ...base,
        ...fields,
      }),
    );
  };

  return {
    debug: (message, fields) => emit('debug', message, fields),
    info: (message, fields) => emit('info', message, fields),
    warn: (message, fields) => emit('warn', message, fields),
    error: (message, fields) => emit('error', message, fields),
    child: (fields) =>
      createLogger({ ...options, fields: { ...base, ...fields } }),
  };
}

/** Logger configured from `NODE_ENV` and `LOG_LEVEL`, tagged with `env`. */
export function createLoggerFromEnv(
  processEnv: Record<string, string | undefined> = process.env,
  write?: (line: string) => void,
): Logger {
  return createLogger({
    level: resolveLogLevel(processEnv),
    fields: { env: appEnvFromNodeEnv(processEnv.NODE_ENV) },
    write,
  });
}
