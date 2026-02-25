/**
 * React Query hooks for stock data fetching
 * Provides caching, refetching, and loading states
 */

import { useQuery } from '@tanstack/react-query';
import { getStockQuote, getTimeSeries, getStockOverview, searchSymbols } from '@/services';
import { fetchETFHoldings, type ETFHolding } from '@/services/etfService';
import type { StockQuote, TimeSeriesDataPoint, StockOverview } from '@/types';

// Query keys for caching
export const stockQueryKeys = {
  quote: (symbol: string) => ['stock', 'quote', symbol] as const,
  timeSeries: (symbol: string, outputSize: string) => ['stock', 'timeSeries', symbol, outputSize] as const,
  overview: (symbol: string) => ['stock', 'overview', symbol] as const,
  search: (keywords: string) => ['stock', 'search', keywords] as const,
  multipleQuotes: (symbols: string[]) => ['stock', 'quotes', ...symbols] as const,
  etfHoldings: (symbol: string) => ['etf', 'holdings', symbol] as const,
};

/**
 * Hook to fetch a single stock quote
 */
export function useStockQuote(symbol: string, enabled: boolean = true) {
  return useQuery<StockQuote, Error>({
    queryKey: stockQueryKeys.quote(symbol),
    queryFn: () => getStockQuote(symbol),
    enabled: enabled && !!symbol,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch time series data for a stock
 */
export function useTimeSeries(
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact',
  enabled: boolean = true
) {
  return useQuery<TimeSeriesDataPoint[], Error>({
    queryKey: stockQueryKeys.timeSeries(symbol, outputSize),
    queryFn: () => getTimeSeries(symbol, outputSize),
    enabled: enabled && !!symbol,
    staleTime: 1000 * 60 * 15, // Consider data stale after 15 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch stock overview/company data
 */
export function useStockOverview(symbol: string, enabled: boolean = true) {
  return useQuery<StockOverview, Error>({
    queryKey: stockQueryKeys.overview(symbol),
    queryFn: () => getStockOverview(symbol),
    enabled: enabled && !!symbol,
    staleTime: 1000 * 60 * 60, // Consider data stale after 1 hour
    retry: 2,
  });
}

/**
 * Hook to search for stock symbols
 */
export function useSymbolSearch(keywords: string, enabled: boolean = true) {
  return useQuery({
    queryKey: stockQueryKeys.search(keywords),
    queryFn: () => searchSymbols(keywords),
    enabled: enabled && keywords.length >= 2,
    staleTime: 1000 * 60 * 30, // Consider data stale after 30 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch live top holdings for an ETF.
 * Calls /api/etf-holdings/{symbol} (Yahoo Finance via server-side route).
 * Falls back to curated static data on error.
 */
export function useETFHoldings(etfSymbol: string, enabled: boolean = true) {
  return useQuery<ETFHolding[], Error>({
    queryKey: stockQueryKeys.etfHoldings(etfSymbol),
    queryFn: () => fetchETFHoldings(etfSymbol),
    enabled: enabled && !!etfSymbol,
    staleTime: 1000 * 60 * 60 * 4, // Holdings change infrequently; cache for 4 hours
    retry: 1,
  });
}
