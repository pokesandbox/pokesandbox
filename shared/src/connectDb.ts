import { connect } from 'mongoose';

import type { Logger } from '@core/logging';

const cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDb(logger: Logger) {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = // Indexes are built by `npm run db:indexes`, never implicitly at startup.
      connect(process.env.DATABASE_URI || '', { autoIndex: false }).then(
        (mongoose) => {
          return mongoose;
        },
      );
  }

  try {
    cached.conn = await cached.promise;
    (global as any).mongoose = cached;
    logger.info('Connected to MongoDB');
  } catch (error) {
    cached.promise = null;
    // Only exit if we are NOT in a Next.js/Browser environment
    logger.error('MongoDB connection failed', { err: error });
    if (process.env.APP_TYPE === 'bot') {
      process.exit(1);
    }
    throw new Error('Database connection failed');
  }

  return cached.conn;
}
