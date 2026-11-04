/**
 * Migrates an existing database to species IDs (#120):
 *   - DexEntry `showdownName` → `speciesId` (Unown `!`/`?` fixed), and its
 *     baseSpecies/changesFrom/prevo/evos/formes links become species IDs
 *   - Region pokedex slots (and included forms) store `speciesId`
 *   - Location encounter slots store `speciesId` instead of a DexEntry ObjectId
 *
 * Idempotent: documents already migrated are rewritten unchanged. Run it
 * before `npm run db:indexes` so the new unique index builds on migrated data.
 *
 * Usage: npm run db:migrate-species-id
 */

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

import {
  buildSpeciesIdByDocId,
  migrateDexEntry,
  migratePokedex,
  migrateWildTables,
} from '../../shared/src/migrations/speciesId';

dotenv.config();

const DATABASE_URI =
  process.env.DATABASE_URI ||
  'mongodb://localhost:27017/pokesandbox?replicaSet=rs0';

async function main(): Promise<void> {
  await mongoose.connect(DATABASE_URI, { autoIndex: false });
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');

  const dexEntries = db.collection('dexentries');
  const entries = await dexEntries.find().toArray();
  const ids = buildSpeciesIdByDocId(entries as never);

  const entryOps = entries.map((entry) => {
    const { $set, $unset } = migrateDexEntry(entry, ids);
    return {
      updateOne: {
        filter: { _id: entry._id },
        update: Object.keys($unset).length ? { $set, $unset } : { $set },
      },
    };
  });
  if (entryOps.length) await dexEntries.bulkWrite(entryOps);
  console.info(`Migrated ${entryOps.length} dex entries.`);

  const regions = db.collection('regions');
  let regionCount = 0;
  for await (const region of regions.find({ pokedex: { $exists: true } })) {
    const pokedex = migratePokedex(region.pokedex, ids);
    await regions.updateOne({ _id: region._id }, { $set: { pokedex } });
    regionCount++;
  }
  console.info(`Migrated ${regionCount} region pokédexes.`);

  const locations = db.collection('locations');
  let locationCount = 0;
  for await (const location of locations.find({
    wildTables: { $exists: true },
  })) {
    const wildTables = migrateWildTables(location.wildTables, ids);
    await locations.updateOne({ _id: location._id }, { $set: { wildTables } });
    locationCount++;
  }
  console.info(`Migrated ${locationCount} locations.`);
}

main()
  .catch((err) => {
    console.error('Species ID migration failed:', err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
