/**
 * Type definitions for stock-related data structures
 * Used throughout the application for type safety
 */

import { z } from 'zod';

// Zod schemas for validation
export const StockQuoteSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  high: z.number(),
  low: z.number(),
  open: z.number(),
  previousClose: z.number(),
  volume: z.number(),
  latestTradingDay: z.string(),
});

export const TimeSeriesDataPointSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export const StockOverviewSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  description: z.string(),
  exchange: z.string(),
  currency: z.string(),
  sector: z.string(),
  industry: z.string(),
  marketCap: z.number(),
  peRatio: z.number().nullable(),
  pegRatio: z.number().nullable(),
  dividendYield: z.number().nullable(),
  eps: z.number().nullable(),
  weekHigh52: z.number(),
  weekLow52: z.number(),
  movingAverage50: z.number(),
  movingAverage200: z.number(),
});

// TypeScript types derived from Zod schemas
export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type TimeSeriesDataPoint = z.infer<typeof TimeSeriesDataPointSchema>;
export type StockOverview = z.infer<typeof StockOverviewSchema>;

// Portfolio-specific types
export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  totalGain: number;
  gainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  date: string;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

// API response types
export interface AlphaVantageQuoteResponse {
  Note?: string;
  Information?: string;
  'Error Message'?: string;
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

export interface AlphaVantageOverviewResponse {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  PEGRatio: string;
  DividendYield: string;
  EPS: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
}

/** A single top holding within an ETF */
export interface ETFHolding {
  symbol: string;
  name: string;
  /** Percentage weight (e.g. 7.15 means 7.15%) */
  weight: number;
  /** Sector may not be available from live sources */
  sector?: string;
}
