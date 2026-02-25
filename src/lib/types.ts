/**
 * Type definitions for the application.
 */
import { z } from "zod";

/** Schema for a portfolio position */
export const PositionSchema = z.object({
  id: z.number().optional(),
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  quantity: z.number().positive(),
  avg_price: z.number().positive(),
  asset_type: z.enum(["equity", "crypto", "bond", "cash"]),
});

export type Position = z.infer<typeof PositionSchema>;

/** Schema for adding/updating a position */
export const PositionInputSchema = PositionSchema.omit({ id: true });
export type PositionInput = z.infer<typeof PositionInputSchema>;

/** Historical price data point */
export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Current quote data from Finnhub */
export interface Quote {
  symbol: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
}

/** Market index data */
export interface MarketIndex {
  symbol: string;
  name: string;
  region: string;
  currentPrice: number;
  change: number;
  percentChange: number;
}

/** Position with current price data */
export interface PositionWithPrice extends Position {
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

/** Asset allocation breakdown */
export interface AssetAllocation {
  type: string;
  value: number;
  percentage: number;
  color: string;
}

/** Time period for chart display */
export type TimePeriod = "1M" | "6M" | "1Y" | "ALL";

/** API response wrapper */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
