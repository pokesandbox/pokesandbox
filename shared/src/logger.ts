import pino, { type DestinationStream } from 'pino';

import {
  isLogLevel,
  type LogFields,
  type Logger,
  type LogLevel,
} from '@core/logging';

import { appEnvFromNodeEnv } from './flags';

export interface LoggerOptions {
  level: LogLevel;
  fields?: LogFields;
  /** Where JSON lines go; stdout when omitted. */
  destination?: DestinationStream;
}

/** Default: `debug` outside production, `info` in production. */
export function resolveLogLevel(
  processEnv: Record<string, string | undefined> = process.env,
): LogLevel {
  const configured = processEnv.LOG_LEVEL?.trim().toLowerCase();
  if (isLogLevel(configured)) return configured;
  return appEnvFromNodeEnv(processEnv.NODE_ENV) === 'prod' ? 'info' : 'debug';
}

function wrap(instance: pino.Logger): Logger {
  return {
    debug: (message, fields) => instance.debug(fields ?? {}, message),
    info: (message, fields) => instance.info(fields ?? {}, message),
    warn: (message, fields) => instance.warn(fields ?? {}, message),
    error: (message, fields) => instance.error(fields ?? {}, message),
    child: (fields) => wrap(instance.child(fields)),
  };
}

/** Structured JSON logger backed by pino. Apps call this once at startup. */
export function createLogger(options: LoggerOptions): Logger {
  const instance = pino(
    {
      level: options.level,
      base: options.fields ?? {},
      messageKey: 'message',
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: { level: (label) => ({ level: label }) },
    },
    options.destination ?? pino.destination(1),
  );
  return wrap(instance);
}

/** Logger configured from `NODE_ENV` and `LOG_LEVEL`, tagged with `env`. */
export function createLoggerFromEnv(
  processEnv: Record<string, string | undefined> = process.env,
  destination?: DestinationStream,
): Logger {
  return createLogger({
    level: resolveLogLevel(processEnv),
    fields: { env: appEnvFromNodeEnv(processEnv.NODE_ENV) },
    destination,
  });
}
