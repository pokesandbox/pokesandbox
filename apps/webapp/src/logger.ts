import { createLoggerFromEnv } from '@shared/logger';

/** The webapp's one logger; server code only. */
export const logger = createLoggerFromEnv();
