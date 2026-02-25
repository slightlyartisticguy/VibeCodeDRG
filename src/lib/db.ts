/**
 * SQLite database connection and initialization for caching historical stock data.
 * Uses better-sqlite3 for synchronous, fast access to local SQLite storage.
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "market-data.db");

let db: Database.Database | null = null;

/**
 * Returns a singleton database connection, creating tables if they don't exist.
 */
export function getDb(): Database.Database {
  if (!db) {
    // Ensure the data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initializeDb(db);
  }
  return db;
}

/**
 * Creates tables for caching historical price data and portfolio positions.
 */
function initializeDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS historical_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      date TEXT NOT NULL,
      open REAL,
      high REAL,
      low REAL,
      close REAL,
      volume INTEGER,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(symbol, date)
    );

    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      avg_price REAL NOT NULL DEFAULT 0,
      asset_type TEXT NOT NULL DEFAULT 'equity',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cache_metadata (
      symbol TEXT PRIMARY KEY,
      last_fetched TEXT NOT NULL,
      period TEXT NOT NULL DEFAULT '1y'
    );

    CREATE INDEX IF NOT EXISTS idx_historical_symbol_date 
      ON historical_prices(symbol, date);
  `);
}

/**
 * Check if cached data for a symbol is still fresh (less than 24 hours old).
 */
export function isCacheFresh(symbol: string): boolean {
  const db = getDb();
  const row = db.prepare(
    "SELECT last_fetched FROM cache_metadata WHERE symbol = ?"
  ).get(symbol) as { last_fetched: string } | undefined;

  if (!row) return false;

  const lastFetched = new Date(row.last_fetched);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
}

/**
 * Update the cache metadata timestamp for a symbol.
 */
export function updateCacheTimestamp(symbol: string, period: string): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO cache_metadata (symbol, last_fetched, period) 
     VALUES (?, datetime('now'), ?)`
  ).run(symbol, period);
}
