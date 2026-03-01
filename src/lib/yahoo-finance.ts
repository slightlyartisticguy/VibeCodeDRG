/**
 * Yahoo Finance client for fetching historical stock data.
 * Results are cached in SQLite to prevent excessive API calls.
 */
import YahooFinance from "yahoo-finance2";
import { getDb, isCacheFresh, updateCacheTimestamp } from "./db";
import type { HistoricalPrice, Quote } from "./types";

const yahooFinance = new YahooFinance();
const HISTORICAL_START_YEAR = 2006;

function normalizeHistoricalPoints(
  points: Array<{
    date: Date;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
    volume?: number | null;
  }>
): HistoricalPrice[] {
  return points
    .filter((point) => point.date instanceof Date && !Number.isNaN(point.date.getTime()))
    .filter((point) => typeof point.close === "number" && point.close > 0)
    .map((point) => {
      const close = point.close as number;
      return {
        date: point.date.toISOString().split("T")[0],
        open: point.open ?? close,
        high: point.high ?? close,
        low: point.low ?? close,
        close,
        volume: point.volume ?? 0,
      };
    });
}

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
      return new Date(HISTORICAL_START_YEAR, 0, 1);
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

    const normalizedResult = normalizeHistoricalPoints(result);
    if (normalizedResult.length === 0) {
      return [];
    }

    // Cache the results in SQLite
    const insertStmt = db.prepare(
      `INSERT OR REPLACE INTO historical_prices (symbol, date, open, high, low, close, volume)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction(
      (prices: HistoricalPrice[]) => {
        for (const price of prices) {
          insertStmt.run(
            symbol,
            price.date,
            price.open,
            price.high,
            price.low,
            price.close,
            price.volume ?? 0
          );
        }
      }
    );

    insertMany(normalizedResult);
    updateCacheTimestamp(symbol, period);

    // Return filtered data for requested period
    const filterDate = getStartDate(period);
    return normalizedResult.filter((point) => new Date(point.date) >= filterDate);
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

/**
 * Fetches ETF details including top holdings and sector breakdown.
 * @param symbol ETF symbol (e.g., 'SPY')
 */
export async function getEtfDetails(symbol: string) {
  try {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ["topHoldings", "assetProfile", "defaultKeyStatistics"],
    });
    return result;
  } catch (error) {
    console.error(`Error fetching ETF details for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch a real-time quote from Yahoo Finance. Used for instruments Finnhub does not cover (e.g., mutual funds).
 */
export async function getYahooQuote(symbol: string): Promise<Quote | null> {
  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote) return null;

    const currentPrice = quote.regularMarketPrice ?? quote.previousClose ?? null;
    if (typeof currentPrice !== "number") return null;

    const previousClose = quote.regularMarketPreviousClose ?? quote.previousClose ?? currentPrice;
    const change = quote.regularMarketChange ?? (currentPrice - previousClose);
    const percentChange =
      quote.regularMarketChangePercent ??
      (previousClose ? (change / previousClose) * 100 : 0);

    return {
      symbol,
      currentPrice,
      change,
      percentChange,
      highPrice: quote.regularMarketDayHigh ?? currentPrice,
      lowPrice: quote.regularMarketDayLow ?? currentPrice,
      openPrice: quote.regularMarketOpen ?? previousClose ?? currentPrice,
      previousClose,
    };
  } catch (error) {
    console.error(`Failed to fetch Yahoo Finance quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get the closing price of a symbol on a specific date.
 * Falls back to the nearest prior trading day if the exact date isn't available.
 * @param symbol - Stock ticker symbol
 * @param date - ISO date string (YYYY-MM-DD)
 */
export async function getPriceOnDate(symbol: string, date: string): Promise<number | null> {
  const db = getDb();

  // Check cache first
  const cached = db.prepare(
    `SELECT close FROM historical_prices
     WHERE symbol = ? AND date <= ?
     ORDER BY date DESC LIMIT 1`
  ).get(symbol, date) as { close: number } | undefined;

  if (cached) return cached.close;

  // Fetch full history (will cache it in SQLite)
  await getHistoricalData(symbol, "ALL");

  // Try cache again after fetching
  const row = db.prepare(
    `SELECT close FROM historical_prices
     WHERE symbol = ? AND date <= ?
     ORDER BY date DESC LIMIT 1`
  ).get(symbol, date) as { close: number } | undefined;

  return row?.close ?? null;
}

/**
 * Search for mutual funds using Yahoo Finance search.
 */
export async function searchMutualFunds(query: string) {
  try {
    const results = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
    });

    const seen = new Set<string>();
    return (results.quotes ?? [])
      .filter((quote) => quote.quoteType === "MUTUALFUND" && quote.symbol)
      .map((quote) => ({
        symbol: quote.symbol as string,
        name: (quote.shortname || quote.longname || quote.symbol) as string,
        type: "Mutual Fund",
      }))
      .filter((item) => {
        if (seen.has(item.symbol)) return false;
        seen.add(item.symbol);
        return true;
      });
  } catch (error) {
    console.error("Yahoo Finance mutual fund search failed:", error);
    return [];
  }
}
