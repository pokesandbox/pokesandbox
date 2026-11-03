/**
 * Proves the local Mongo is a replica set that supports multi-document
 * transactions: commits one, aborts another, and checks both outcomes.
 *
 * Usage: npm run db:check (needs `npm run db:up` first)
 */

import mongoose from 'mongoose';

const DATABASE_URI =
  process.env.DATABASE_URI ||
  'mongodb://localhost:27017/pokesandbox?replicaSet=rs0';
const COLLECTION = '__transaction_check';

async function main() {
  await mongoose.connect(DATABASE_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database handle after connecting');

  // Collections must exist before they are used inside a transaction.
  await db.dropCollection(COLLECTION).catch(() => undefined);
  const col = await db.createCollection<{ _id: string }>(COLLECTION);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await col.insertMany([{ _id: 'a' }, { _id: 'b' }], { session });
    });
    const committed = await col.countDocuments();
    if (committed !== 2)
      throw new Error(`Commit failed: expected 2, got ${committed}`);

    await session
      .withTransaction(async () => {
        await col.insertOne({ _id: 'c' }, { session });
        throw new Error('rollback');
      })
      .catch((e: Error) => {
        if (e.message !== 'rollback') throw e;
      });
    const afterAbort = await col.countDocuments();
    if (afterAbort !== 2)
      throw new Error(`Abort failed: expected 2, got ${afterAbort}`);
  } finally {
    await session.endSession();
    await db.dropCollection(COLLECTION).catch(() => undefined);
  }
  console.info('OK: session.withTransaction commits and rolls back.');
}

main()
  .catch((err) => {
    console.error(
      'Transaction check failed. Is Mongo running as a replica set (npm run db:up)?',
      err,
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
