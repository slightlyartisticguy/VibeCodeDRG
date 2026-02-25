import { NextRequest, NextResponse } from 'next/server';
import { getCachedStock, setCachedStock, initDb } from '@/lib/db';
import { fetchStockQuoteFromAlphaVantage } from '@/services/alphaVantage';

// Cache TTL: 24 hours (in ms)
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

// Initialize DB on first import
try {
  initDb();
} catch (e) {
  console.error('Failed to init DB', e);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const symbol = ((await params).symbol ?? '').toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // getCachedStock returns the parsed data object directly, or null if missing/expired
  const cached = getCachedStock(symbol, CACHE_TTL_MS);

  if (cached) {
    console.log(`[stock-quote] Serving ${symbol} from cache`);
    return NextResponse.json(cached);
  }

  console.log(`[stock-quote] Fetching ${symbol} from Alpha Vantage`);

  try {
    const quote = await fetchStockQuoteFromAlphaVantage(symbol);
    const dataToStore = { quote, fetchedAt: new Date().toISOString() };
    setCachedStock(symbol, dataToStore);
    return NextResponse.json(dataToStore);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stock data';
    console.error(`[stock-quote] Error fetching ${symbol}:`, message);

    // Try to serve stale data on error (no TTL limit)
    const stale = getCachedStock(symbol, Infinity);
    if (stale) {
      console.log(`[stock-quote] Returning stale cache for ${symbol} due to API error`);
      return NextResponse.json({ ...stale, _warning: 'Data is stale due to API error' });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
