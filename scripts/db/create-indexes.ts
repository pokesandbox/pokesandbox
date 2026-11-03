/**
 * Creates the indexes declared in the Mongoose schemas.
 *
 * This is the only way indexes get built, in every environment: `connectDb`
 * runs with `autoIndex` off. `npm run setup` / `db:seed` run it for you
 * locally; run it on deploy elsewhere. It only adds missing indexes
 * (`createIndexes`); it never drops any, unlike `syncIndexes`. A unique index
 * fails if existing data already has duplicates: dedupe first, then re-run.
 *
 * Usage: npm run db:indexes
 */

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Importing the models registers every one of them with mongoose.
import '../../shared/src/models/index';

dotenv.config();

const DATABASE_URI =
  process.env.DATABASE_URI ||
  'mongodb://localhost:27017/pokesandbox?replicaSet=rs0';

async function main(): Promise<void> {
  await mongoose.connect(DATABASE_URI, { autoIndex: false });
  for (const name of mongoose.modelNames()) {
    await mongoose.model(name).createIndexes();
    console.info(`Indexes ready: ${name}`);
  }
}

main()
  .catch((err) => {
    console.error('Index creation failed:', err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
