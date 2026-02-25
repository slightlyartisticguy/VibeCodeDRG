/**
 * Data Constants
 * 
 * This file contains static data used throughout the application,
 * including market indices information and default stock symbols
 * for initialization and display purposes.
 */

export { ALL_SECURITIES, searchSecuritiesLocal, type SecurityEntry } from './securities';
export { INTERNATIONAL_MARKETS, ALL_MARKETS, type MarketIndex, type RegionalMarkets } from './internationalMarkets';
export { CURATED_ETF_HOLDINGS, getCuratedHoldings } from './curatedHoldings';
export { MARKET_METADATA, MARKET_CAP_REFERENCE, getMarketMetadata, getMarketsByRegion, type MarketMetadata } from './marketMetadata';

/**
 * Market index information including major indices
 * Used to display market overview data in the dashboard and markets page
 */
export const MARKET_INDICES = [
  { 
    symbol: '^GSPC', 
    name: 'S&P 500', 
    value: 5021.84, 
    change: 25.36, 
    changePercent: 0.51 
  },
  { 
    symbol: '^DJI', 
    name: 'Dow Jones', 
    value: 38654.42, 
    change: 156.78, 
    changePercent: 0.41 
  },
  { 
    symbol: '^IXIC', 
    name: 'NASDAQ', 
    value: 15990.66, 
    change: 98.42, 
    changePercent: 0.62 
  },
];

/**
 * Default stock symbols to display in the simulation sandbox
 * These are popular, high-volume stocks commonly tracked by investors
 */
export const DEFAULT_SYMBOLS = [
  'AAPL',  // Apple Inc.
  'MSFT',  // Microsoft Corporation
  'GOOGL', // Alphabet Inc.
  'AMZN',  // Amazon.com Inc.
  'NVDA',  // NVIDIA Corporation
  'TSLA',  // Tesla Inc.
  'META',  // Meta Platforms Inc.
  'NFLX',  // Netflix Inc.
];
