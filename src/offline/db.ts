/**
 * Local SQLite database — used for offline outbox + cached entity reads.
 *
 * Schema is intentionally minimal and append-only:
 *  - outbox: queued operations awaiting sync
 *  - cached_trip_overview: latest overview per tripId
 *  - cached_vessels: my vessels cache
 *  - cached_dashboard: latest dashboard snapshot
 */

import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export const db = (): SQLite.SQLiteDatabase => {
  if (!_db) {
    _db = SQLite.openDatabaseSync('logbook-mobile.db');
  }
  return _db;
};

export async function ensureSchema(): Promise<void> {
  const database = db();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      payload TEXT NOT NULL,
      entityType TEXT,
      entityId TEXT,
      localState TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      errorCode TEXT,
      errorMessage TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      lastAttemptAt TEXT,
      syncedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
    CREATE INDEX IF NOT EXISTS idx_outbox_entity ON outbox(entityType, entityId);

    CREATE TABLE IF NOT EXISTS cached_trip_overview (
      tripId TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      fetchedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cached_vessels (
      id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      fetchedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cached_dashboard (
      userId TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      fetchedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cached_trip_list (
      userId TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      fetchedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
