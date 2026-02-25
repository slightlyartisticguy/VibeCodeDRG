/**
 * Yahoo Finance client for fetching historical stock data.
 * Results are cached in SQLite to prevent excessive API calls.
 */
import YahooFinance from "yahoo-finance2";
import { getDb, isCacheFresh, updateCacheTimestamp } from "./db";
import type { HistoricalPrice } from "./types";

const yahooFinance = new YahooFinance();

/**
 * Calculates the start date based on the time period.
 */
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "ALL":
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }
}

/**
 * Fetch historical price data for a symbol, using SQLite cache when available.
 * @param symbol - Stock ticker symbol
 * @param period - Time period (1M, 6M, 1Y, ALL)
 */
export async function getHistoricalData(
  symbol: string,
  period: string = "6M"
): Promise<HistoricalPrice[]> {
  const db = getDb();

  // Check if we have fresh cached data
  if (isCacheFresh(symbol)) {
    const startDate = getStartDate(period);
    const rows = db
      .prepare(
        `SELECT date, open, high, low, close, volume 
         FROM historical_prices 
         WHERE symbol = ? AND date >= ? 
         ORDER BY date ASC`
      )
      .all(symbol, startDate.toISOString().split("T")[0]) as HistoricalPrice[];

    if (rows.length > 0) {
      return rows;
    }
  }

  // Fetch from Yahoo Finance
  try {
    const startDate = getStartDate("ALL"); // Always fetch max range for caching
    const result = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: new Date(),
      interval: "1d",
      events: "history",
    });

    if (!result || !Array.isArray(result) || result.length === 0) {
      return [];
    }

    // Cache the results in SQLite
    const insertStmt = db.prepare(
      `INSERT OR REPLACE INTO historical_prices (symbol, date, open, high, low, close, volume)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction(
      (
        prices: Array<{
          date: Date;
          open?: number | null;
          high?: number | null;
          low?: number | null;
          close?: number | null;
          volume?: number | null;
        }>
      ) => {
        for (const price of prices) {
          insertStmt.run(
            symbol,
            price.date.toISOString().split("T")[0],
            price.open ?? 0,
            price.high ?? 0,
            price.low ?? 0,
            price.close ?? 0,
            price.volume ?? 0
          );
        }
      }
    );

    insertMany(result);
    updateCacheTimestamp(symbol, period);

    // Return filtered data for requested period
    const filterDate = getStartDate(period);
    return result
      .filter((r) => r.date >= filterDate)
      .map((r) => ({
        date: r.date.toISOString().split("T")[0],
        open: r.open ?? 0,
        high: r.high ?? 0,
        low: r.low ?? 0,
        close: r.close ?? 0,
        volume: r.volume ?? 0,
      }));
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);

    // Fall back to cached data if available
    const filterDate = getStartDate(period);
    const cachedRows = db
      .prepare(
        `SELECT date, open, high, low, close, volume 
         FROM historical_prices 
         WHERE symbol = ? AND date >= ? 
         ORDER BY date ASC`
      )
      .all(symbol, filterDate.toISOString().split("T")[0]) as HistoricalPrice[];

    return cachedRows;
  }
}
