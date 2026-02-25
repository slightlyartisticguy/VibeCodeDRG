/**
 * Custom hooks for data fetching using TanStack Query.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Quote,
  HistoricalPrice,
  MarketIndex,
  Position,
  PositionInput,
  ApiResponse,
} from "@/lib/types";

/**
 * Fetch a single stock quote.
 */
export function useQuote(symbol: string) {
  return useQuery<Quote | null>({
    queryKey: ["quote", symbol],
    queryFn: async () => {
      const res = await fetch(`/api/quote?symbol=${symbol}`);
      const json: ApiResponse<Quote> = await res.json();
      return json.data ?? null;
    },
    enabled: !!symbol,
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Fetch quotes for multiple symbols.
 */
export function useMultipleQuotes(symbols: string[]) {
  return useQuery<Record<string, Quote | null>>({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: async () => {
      if (symbols.length === 0) return {};
      const res = await fetch(`/api/quote?symbols=${symbols.join(",")}`);
      const json: ApiResponse<Record<string, Quote | null>> = await res.json();
      return json.data ?? {};
    },
    enabled: symbols.length > 0,
    refetchInterval: 60000,
  });
}

/**
 * Fetch historical price data for a symbol.
 */
export function useHistoricalData(symbol: string, period: string = "6M") {
  return useQuery<HistoricalPrice[]>({
    queryKey: ["historical", symbol, period],
    queryFn: async () => {
      const res = await fetch(
        `/api/historical?symbol=${symbol}&period=${period}`
      );
      const json: ApiResponse<HistoricalPrice[]> = await res.json();
      return json.data ?? [];
    },
    enabled: !!symbol,
  });
}

/**
 * Fetch major market indices.
 */
export function useMarkets() {
  return useQuery<MarketIndex[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      const json: ApiResponse<MarketIndex[]> = await res.json();
      return json.data ?? [];
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });
}

/**
 * Fetch all portfolio positions.
 */
export function usePositions() {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await fetch("/api/positions");
      const json: ApiResponse<Position[]> = await res.json();
      return json.data ?? [];
    },
  });
}

/**
 * Add or update a portfolio position.
 */
export function useAddPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (position: PositionInput) => {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(position),
      });
      if (!res.ok) throw new Error("Failed to add position");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

/**
 * Remove a portfolio position.
 */
export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(`/api/positions?symbol=${symbol}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete position");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

/**
 * Search for stock symbols.
 */
export function useSymbolSearch(query: string) {
  return useQuery<Array<{ symbol: string; name: string; type: string }>>({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: query.length >= 1,
    staleTime: 300000, // Cache search results for 5 minutes
  });
}
