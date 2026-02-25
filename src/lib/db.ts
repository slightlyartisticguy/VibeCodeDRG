import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Store the database in the project root under /data
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'stocks.db');

export function getDb() {
  // Ensure the data directory exists before opening the database
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

export function initDb() {
  try {
    const db = getDb();

    db.exec(`
      CREATE TABLE IF NOT EXISTS stock_cache (
        symbol TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        cached_at INTEGER NOT NULL
      )
    `);

    db.close();
    console.log('[db] Database initialized at', dbPath);
  } catch (error) {
    console.error('[db] Failed to initialize database:', error);
    throw error;
  }
}

/** Retrieve a cached stock quote, returns null if not found or expired */
export function getCachedStock(symbol: string, maxAgeMs = 5 * 60 * 1000) {
  const db = getDb();
  try {
    const row = db.prepare(
      'SELECT data, cached_at FROM stock_cache WHERE symbol = ?'
    ).get(symbol) as { data: string; cached_at: number } | undefined;

    if (!row) return null;

    const isExpired = Date.now() - row.cached_at > maxAgeMs;
    if (isExpired) return null;

    return JSON.parse(row.data);
  } finally {
    db.close();
  }
}

/** Save a stock quote to the cache */
export function setCachedStock(symbol: string, data: unknown) {
  const db = getDb();
  try {
    db.prepare(`
      INSERT INTO stock_cache (symbol, data, cached_at)
      VALUES (?, ?, ?)
      ON CONFLICT(symbol) DO UPDATE SET
        data = excluded.data,
        cached_at = excluded.cached_at
    `).run(symbol, JSON.stringify(data), Date.now());
  } finally {
    db.close();
  }
}