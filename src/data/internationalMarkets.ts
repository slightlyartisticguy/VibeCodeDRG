/**
 * International Markets Data
 * Dynamically generated from market metadata and curated holdings data
 * All numerical data is fetched from APIs or curated sources at runtime
 */

import { MARKET_METADATA } from './marketMetadata';
import { getCuratedHoldings } from './curatedHoldings';
import type { ETFHolding } from '@/services';

export interface MarketIndex {
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

export interface RegionalMarkets {
  region: string;
  markets: MarketIndex[];
}

/**
 * Generate market data with curated holdings
 * This combines static metadata with dynamic holdings data
 */
function generateMarketWithHoldings(metadata: typeof MARKET_METADATA[0]): MarketIndex {
  return {
    symbol: metadata.symbol,
    name: metadata.name,
    value: 0, // Will be fetched dynamically
    change: 0, // Will be fetched dynamically
    changePercent: 0, // Will be fetched dynamically
    region: metadata.region,
    currency: metadata.currency,
    marketCap: 0, // Will be fetched dynamically
    trackingETF: metadata.trackingETF,
    topHoldings: getCuratedHoldings(metadata.trackingETF),
    marketInfo: metadata.marketInfo,
  };
}

/**
 * Region groupings for organizing markets
 */
const REGION_ORDER = {
  'North America': ['United States', 'Canada'],
  'Europe': ['United Kingdom', 'Germany', 'France'],
  'Asia Pacific': ['Japan', 'Hong Kong', 'Australia'],
  'Emerging Markets': ['Brazil', 'India'],
};

/**
 * Generate international markets organized by region
 */
export function generateInternationalMarkets(): RegionalMarkets[] {
  const marketsByRegion: Record<string, MarketIndex[]> = {};

  // Group markets by region
  MARKET_METADATA.forEach(metadata => {
    // Find which region group this market belongs to
    let regionGroup = 'Other';
    for (const [region, countries] of Object.entries(REGION_ORDER)) {
      if (countries.some(country => metadata.region.includes(country))) {
        regionGroup = region;
        break;
      }
    }

    if (!marketsByRegion[regionGroup]) {
      marketsByRegion[regionGroup] = [];
    }

    marketsByRegion[regionGroup].push(generateMarketWithHoldings(metadata));
  });

  // Convert to RegionalMarkets array in proper order
  return Object.entries(REGION_ORDER)
    .map(([region]) => ({
      region,
      markets: marketsByRegion[region] || [],
    }))
    .filter(r => r.markets.length > 0);
}

export const INTERNATIONAL_MARKETS = generateInternationalMarkets();
export const ALL_MARKETS = INTERNATIONAL_MARKETS.flatMap(region => region.markets);