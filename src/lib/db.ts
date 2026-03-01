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

  // Migration: add purchase_date column to positions if it doesn't already exist
  try {
    db.exec(`ALTER TABLE positions ADD COLUMN purchase_date TEXT`);
  } catch {
    // Column already exists — safe to ignore
  }

  // Migration: add portfolio_id support — recreate table with UNIQUE(symbol, portfolio_id)
  // so the same symbol can be held in multiple portfolios independently.
  const hasPortfolioId = db
    .prepare("SELECT name FROM pragma_table_info('positions') WHERE name='portfolio_id'")
    .get();

  if (!hasPortfolioId) {
    const migrate = db.transaction(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS positions_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT NOT NULL,
          portfolio_id TEXT NOT NULL DEFAULT 'A',
          name TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 0,
          avg_price REAL NOT NULL DEFAULT 0,
          asset_type TEXT NOT NULL DEFAULT 'equity',
          purchase_date TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(symbol, portfolio_id)
        );
      `);

      db.exec(`
        INSERT INTO positions_new
          (id, symbol, portfolio_id, name, quantity, avg_price, asset_type, purchase_date, created_at, updated_at)
        SELECT
          id, symbol, 'A', name, quantity, avg_price, asset_type,
          purchase_date, created_at, updated_at
        FROM positions;
      `);

      db.exec(`DROP TABLE positions;`);
      db.exec(`ALTER TABLE positions_new RENAME TO positions;`);
    });
    migrate();
  }
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

/**
 * Drops all data from cache tables to force a refresh.
 */
export function clearCache(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM historical_prices;
    DELETE FROM cache_metadata;
  `);
}
