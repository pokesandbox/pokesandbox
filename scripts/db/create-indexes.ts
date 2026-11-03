/**
 * Creates the indexes declared in the Mongoose schemas (see #118).
 *
 * Outside production, `connectDb` builds indexes on startup (`autoIndex`).
 * In production `autoIndex` is off, so run this on deploy instead. It only
 * adds missing indexes (`createIndexes`); it never drops any, unlike
 * `syncIndexes`. A unique index fails if existing data already has
 * duplicates: dedupe first, then re-run.
 *
 * Usage: npm run db:indexes
 */

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

import { collectionSeedMap } from '../seed/collections';

dotenv.config();

const DATABASE_URI =
  process.env.DATABASE_URI ||
  'mongodb://localhost:27017/pokesandbox?replicaSet=rs0';

async function main(): Promise<void> {
  await mongoose.connect(DATABASE_URI, { autoIndex: false });
  for (const [name, { model }] of Object.entries(collectionSeedMap)) {
    await model.createIndexes();
    console.info(`Indexes ready: ${name}`);
  }
}

main()
  .catch((err) => {
    console.error('Index creation failed:', err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
