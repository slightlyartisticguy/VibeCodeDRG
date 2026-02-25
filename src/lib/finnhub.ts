/**
 * Finnhub API client for fetching current market data.
 * Rate limited to 60 calls per minute on the free tier.
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

/**
 * Fetch a real-time quote for a given symbol from Finnhub.
 * @param symbol - Stock ticker symbol (e.g., "AAPL")
 * @returns Quote data or null if the request fails
 */
export async function getQuote(symbol: string) {
  try {
    const res = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 429) {
        console.warn("Finnhub rate limit hit. Please wait before retrying.");
        return null;
      }
      throw new Error(`Finnhub API error: ${res.status}`);
    }

    const data = await res.json();

    // Finnhub returns { c, d, dp, h, l, o, pc, t } for quote
    return {
      symbol,
      currentPrice: data.c,
      change: data.d,
      percentChange: data.dp,
      highPrice: data.h,
      lowPrice: data.l,
      openPrice: data.o,
      previousClose: data.pc,
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols.
 * Adds a small delay between requests to avoid rate limiting.
 */
export async function getMultipleQuotes(symbols: string[]) {
  const results: Record<string, Awaited<ReturnType<typeof getQuote>>> = {};

  for (const symbol of symbols) {
    results[symbol] = await getQuote(symbol);
    // Small delay to respect rate limits (60/min = 1/second max)
    if (symbols.indexOf(symbol) < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Search for symbols matching a query string.
 */
export async function searchSymbols(query: string) {
  try {
    const res = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      if (res.status === 429) {
        console.warn("Finnhub rate limit hit.");
        return [];
      }
      throw new Error(`Finnhub search error: ${res.status}`);
    }

    const data = await res.json();
    return (data.result || []).map(
      (item: { description: string; symbol: string; type: string }) => ({
        name: item.description,
        symbol: item.symbol,
        type: item.type,
      })
    );
  } catch (error) {
    console.error("Symbol search failed:", error);
    return [];
  }
}
