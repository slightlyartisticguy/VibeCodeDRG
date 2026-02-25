/**
 * Batch Quotes API Route
 * Fetches quotes and/or overviews for multiple symbols in a single request.
 * Uses SQLite cache to serve fresh data and avoid redundant Alpha Vantage calls.
 *
 * POST /api/batch-quotes
 * Body: { symbols: string[], include?: { quote?: boolean, overview?: boolean } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCachedStock, setCachedStock, initDb } from '@/lib/db';
import { fetchStockQuoteFromAlphaVantage } from '@/services/alphaVantage';
import type { StockQuote } from '@/types';

// Initialize DB on first import
try {
  initDb();
} catch (e) {
  console.error('[batch-quotes] Failed to init DB', e);
}

/** Maximum symbols per batch to prevent abuse */
const MAX_BATCH_SIZE = 30;

/** Cache freshness threshold in ms (24 hours) */
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

/** Delay between consecutive Alpha Vantage calls to respect rate limits (ms) */
const RATE_LIMIT_DELAY_MS = 300;

const BatchRequestSchema = z.object({
  symbols: z.array(z.string().min(1).max(12)).min(1).max(MAX_BATCH_SIZE),
  include: z
    .object({
      quote: z.boolean().optional().default(true),
      overview: z.boolean().optional().default(false),
    })
    .optional()
    .default({ quote: true, overview: false }),
});

export type BatchQuoteResult = {
  symbol: string;
  quote?: StockQuote;
  error?: string;
  _cached?: boolean;
};

export type BatchQuotesResponse = {
  results: BatchQuoteResult[];
  fetchedAt: string;
};

/**
 * Small helper to pause execution (rate-limit friendly)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BatchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { symbols, include } = parsed.data;
    const results: BatchQuoteResult[] = [];
    const symbolsToFetch: string[] = [];

    // ── 1. Check cache for each symbol ──────────────────────────────────
    // getCachedStock returns the parsed data directly or null if missing/expired
    for (const rawSymbol of symbols) {
      const symbol = rawSymbol.toUpperCase();

      if (include.quote) {
        const cached = getCachedStock(symbol, CACHE_TTL_MS);

        if (cached) {
          results.push({
            symbol,
            quote: cached.quote ?? cached,
            _cached: true,
          });
          continue;
        }
      }

      // Not cached or stale — need to fetch
      symbolsToFetch.push(symbol);
    }

    // ── 2. Fetch missing symbols from Alpha Vantage with rate limiting ──
    for (let i = 0; i < symbolsToFetch.length; i++) {
      const symbol = symbolsToFetch[i];

      try {
        const quote = await fetchStockQuoteFromAlphaVantage(symbol);

        // Store in cache for next time
        const dataToStore = { quote, fetchedAt: new Date().toISOString() };
        setCachedStock(symbol, dataToStore);

        results.push({ symbol, quote, _cached: false });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[batch-quotes] Error fetching ${symbol}:`, message);

        // Try to serve stale cache on error (no TTL limit)
        const stale = getCachedStock(symbol, Infinity);
        if (stale) {
          results.push({
            symbol,
            quote: stale.quote ?? stale,
            _cached: true,
            error: `Served stale data: ${message}`,
          });
        } else {
          results.push({ symbol, error: message });
        }
      }

      // Rate-limit pause between calls (skip after the last one)
      if (i < symbolsToFetch.length - 1) {
        await delay(RATE_LIMIT_DELAY_MS);
      }
    }

    const response: BatchQuotesResponse = {
      results,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[batch-quotes] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
