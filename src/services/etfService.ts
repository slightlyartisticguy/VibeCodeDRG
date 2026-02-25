/**
 * ETF Service
 * Provides real-time ETF data and holdings information
 */

import { getCuratedHoldings, getCuratedSectorMap } from '@/data/curatedHoldings';
import { getMarketMetadata, MARKET_CAP_REFERENCE } from '@/data/marketMetadata';
import type { ETFHolding } from '@/types';

const API_KEY =
  process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ||
  process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export type { ETFHolding } from '@/types';

export interface ETFQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  region: string;
  currency: string;
  marketCap: number;
  trackingETF: string;
  topHoldings?: ETFHolding[];
  marketInfo: {
    tradingHours: string;
    timezone: string;
    totalCompanies: number;
  };
}

/**
 * Fetch ETF quote data from Alpha Vantage
 */
export async function fetchETFQuote(symbol: string): Promise<ETFQuote | null> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return null;
    }

    return {
      symbol: symbol,
      price: parseFloat(quote['05. price']) || 0,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching ETF quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch live ETF holdings from the internal API route.
 * Falls back to curated data if the live fetch fails.
 */
export async function fetchETFHoldings(symbol: string): Promise<ETFHolding[]> {
  try {
    const res = await fetch(`/api/etf-holdings/${encodeURIComponent(symbol.toUpperCase())}`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const json: { holdings: ETFHolding[] } = await res.json();
    const liveHoldings = json.holdings;

    if (!liveHoldings || liveHoldings.length === 0) {
      console.warn(`[etfService] No live holdings for ${symbol}, using curated fallback`);
      return getCuratedHoldings(symbol);
    }

    // Enrich sector from curated data when live source doesn't provide it
    const sectorMap = getCuratedSectorMap(symbol);
    return liveHoldings.map((h) => ({
      ...h,
      sector: h.sector || sectorMap[h.symbol] || '',
    }));
  } catch (error) {
    console.warn(`[etfService] Live holdings fetch failed for ${symbol}, using curated fallback:`, error);
    return getCuratedHoldings(symbol);
  }
}

/**
 * Get top holdings for a market using its tracking ETF
 */
export async function getMarketTopHoldings(etfSymbol: string): Promise<ETFHolding[]> {
  const holdings = await fetchETFHoldings(etfSymbol);
  return holdings.slice(0, 5);
}

/**
 * Get complete market data by index symbol
 * Combines real-time ETF data with market metadata
 */
export async function getMarketData(indexSymbol: string): Promise<MarketData | null> {
  try {
    const metadata = getMarketMetadata(indexSymbol);
    if (!metadata) {
      console.warn(`No metadata found for index: ${indexSymbol}`);
      return null;
    }

    // Fetch real-time quote data from tracking ETF
    const quoteData = await fetchETFQuote(metadata.trackingETF);
    
    // Get holdings data
    const holdings = await getMarketTopHoldings(metadata.trackingETF);

    // Get market cap from reference data
    const marketCap = MARKET_CAP_REFERENCE[metadata.trackingETF] || 0;

    // Combine all data
    const marketData: MarketData = {
      symbol: indexSymbol,
      name: metadata.name,
      value: quoteData?.price || 0,
      change: quoteData?.change || 0,
      changePercent: quoteData?.changePercent || 0,
      region: metadata.region,
      currency: metadata.currency,
      marketCap: marketCap,
      trackingETF: metadata.trackingETF,
      topHoldings: holdings,
      marketInfo: metadata.marketInfo,
    };

    return marketData;
  } catch (error) {
    console.error(`Error getting market data for ${indexSymbol}:`, error);
    return null;
  }
}

/**
 * Mapping of indices to their primary tracking ETFs
 */
export const INDEX_TO_ETF_MAP: Record<string, string> = {
  // US Markets
  '^GSPC': 'SPY',      // S&P 500 -> SPDR S&P 500 ETF
  '^IXIC': 'QQQ',      // NASDAQ -> Invesco QQQ Trust
  '^DJI': 'DIA',       // Dow Jones -> SPDR Dow Jones Industrial Average ETF
  
  // International Markets
  '^FTSE': 'EWU',      // FTSE 100 -> iShares MSCI United Kingdom ETF
  '^GDAXI': 'EWG',     // DAX -> iShares MSCI Germany ETF
  '^FCHI': 'EWQ',      // CAC 40 -> iShares MSCI France ETF
  '^N225': 'EWJ',      // Nikkei 225 -> iShares MSCI Japan ETF
  '^HSI': 'EWH',       // Hang Seng -> iShares MSCI Hong Kong ETF
  '^AXJO': 'EWA',      // ASX 200 -> iShares MSCI Australia ETF
  '^GSPTSE': 'EWC',    // TSX -> iShares MSCI Canada ETF
  '^BVSP': 'EWZ',      // Bovespa -> iShares MSCI Brazil ETF
};