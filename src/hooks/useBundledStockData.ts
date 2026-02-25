/**
 * Bundled Stock Data Hooks
 *
 * Provides TanStack Query hooks that fetch multiple symbols in a single
 * request via /api/batch-quotes, dramatically reducing API calls and
 * avoiding Alpha Vantage rate limits.
 *
 * Key hooks:
 * - useBatchQuotes: Fetches quotes for an array of symbols in one request
 * - useBatchMarketQuotes: Tailored for the MarketIndices component (ETF tracking symbols)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StockQuote } from '@/types';
import type { BatchQuotesResponse, BatchQuoteResult } from '@/app/api/batch-quotes/route';

// ── Query keys ──────────────────────────────────────────────────────────

export const batchQueryKeys = {
  /** Base key for all batch queries */
  all: ['batch'] as const,
  /** Key for a specific set of symbols */
  quotes: (symbols: string[]) =>
    ['batch', 'quotes', ...symbols.slice().sort()] as const,
};

// ── Fetcher ─────────────────────────────────────────────────────────────

/**
 * Calls the /api/batch-quotes endpoint to retrieve quotes for multiple symbols.
 */
async function fetchBatchQuotes(
  symbols: string[],
  options?: { includeOverview?: boolean }
): Promise<BatchQuotesResponse> {
  const response = await fetch('/api/batch-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbols,
      include: {
        quote: true,
        overview: options?.includeOverview ?? false,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.error ?? `Batch quotes request failed (${response.status})`
    );
  }

  return response.json();
}

// ── Hooks ───────────────────────────────────────────────────────────────

/**
 * Hook to fetch quotes for multiple stock symbols in a single batch request.
 *
 * @param symbols - Array of ticker symbols (e.g. ['AAPL', 'MSFT', 'GOOGL'])
 * @param enabled - Whether the query should run (default true)
 * @returns TanStack Query result with a map of symbol → StockQuote
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBatchQuotes(['AAPL', 'MSFT', 'GOOGL']);
 * const applePrice = data?.get('AAPL')?.price;
 * ```
 */
export function useBatchQuotes(symbols: string[], enabled: boolean = true) {
  const queryClient = useQueryClient();

  return useQuery<Map<string, StockQuote>, Error>({
    queryKey: batchQueryKeys.quotes(symbols),
    queryFn: async () => {
      const response = await fetchBatchQuotes(symbols);

      const quoteMap = new Map<string, StockQuote>();

      for (const result of response.results) {
        if (result.quote) {
          const quote: StockQuote = {
            symbol: result.symbol,
            price: result.quote.price,
            change: result.quote.change,
            changePercent: result.quote.changePercent,
            high: result.quote.high,
            low: result.quote.low,
            open: result.quote.open,
            previousClose: result.quote.previousClose,
            volume: result.quote.volume,
            latestTradingDay: result.quote.latestTradingDay,
          };
          quoteMap.set(result.symbol, quote);

          // Also populate individual quote caches so useStockQuote() hooks
          // don't trigger redundant fetches for the same symbol
          queryClient.setQueryData(
            ['stock', 'quote', result.symbol],
            quote
          );
        }
      }

      return quoteMap;
    },
    enabled: enabled && symbols.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes (gentle)
    retry: 1,
  });
}

/**
 * Hook to fetch batch quotes specifically for market index tracking ETFs.
 *
 * @param etfSymbols - Array of ETF symbols (e.g. ['SPY', 'QQQ', 'DIA'])
 * @param enabled - Whether the query should run
 * @returns Record mapping ETF symbol to its quote data + loading/error state
 *
 * @example
 * ```tsx
 * const { quoteMap, isLoading } = useBatchMarketQuotes(['SPY', 'QQQ', 'DIA']);
 * const spyPrice = quoteMap['SPY']?.price;
 * ```
 */
export function useBatchMarketQuotes(
  etfSymbols: string[],
  enabled: boolean = true
) {
  const query = useBatchQuotes(etfSymbols, enabled);

  // Convert Map to a plain Record for easier consumption
  const quoteMap: Record<string, StockQuote | undefined> = {};
  if (query.data) {
    for (const [symbol, quote] of query.data.entries()) {
      quoteMap[symbol] = quote;
    }
  }

  return {
    quoteMap,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
  };
}

/**
 * Hook to fetch batch quotes for an array of trending/watchlist stock symbols.
 * Returns an array of results aligned with the input symbols array.
 *
 * @param stocks - Array of { symbol, name } objects
 * @param enabled - Whether the query should run
 *
 * @example
 * ```tsx
 * const { quotes, isLoading } = useBatchTrendingQuotes(TRENDING_STOCKS);
 * ```
 */
export function useBatchTrendingQuotes(
  stocks: Array<{ symbol: string; name: string }>,
  enabled: boolean = true
) {
  const symbols = stocks.map((s) => s.symbol);
  const query = useBatchQuotes(symbols, enabled);

  const quotes: Array<{
    symbol: string;
    name: string;
    quote?: StockQuote;
  }> = stocks.map((stock) => ({
    symbol: stock.symbol,
    name: stock.name,
    quote: query.data?.get(stock.symbol),
  }));

  return {
    quotes,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
  };
}
