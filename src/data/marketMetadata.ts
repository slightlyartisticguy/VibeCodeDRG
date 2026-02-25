/**
 * Market Metadata Reference
 * Static reference data for markets (trading hours, timezones, company counts)
 * Dynamic data (prices, changes, holdings) are fetched from APIs
 */

export interface MarketMetadata {
  symbol: string;
  name: string;
  region: string;
  currency: string;
  trackingETF: string;
  marketInfo: {
    tradingHours: string;
    timezone: string;
    totalCompanies: number;
  };
}

export const MARKET_METADATA: MarketMetadata[] = [
  // North America
  {
    symbol: '^GSPC',
    name: 'S&P 500',
    region: 'United States',
    currency: 'USD',
    trackingETF: 'SPY',
    marketInfo: {
      tradingHours: '9:30 AM - 4:00 PM EST',
      timezone: 'EST',
      totalCompanies: 500,
    },
  },
  {
    symbol: '^IXIC',
    name: 'NASDAQ Composite',
    region: 'United States',
    currency: 'USD',
    trackingETF: 'QQQ',
    marketInfo: {
      tradingHours: '9:30 AM - 4:00 PM EST',
      timezone: 'EST',
      totalCompanies: 3000,
    },
  },
  {
    symbol: '^DJI',
    name: 'Dow Jones Industrial',
    region: 'United States',
    currency: 'USD',
    trackingETF: 'DIA',
    marketInfo: {
      tradingHours: '9:30 AM - 4:00 PM EST',
      timezone: 'EST',
      totalCompanies: 30,
    },
  },
  {
    symbol: '^GSPTSE',
    name: 'S&P/TSX Composite',
    region: 'Canada',
    currency: 'CAD',
    trackingETF: 'EWC',
    marketInfo: {
      tradingHours: '9:30 AM - 4:00 PM EST',
      timezone: 'EST',
      totalCompanies: 230,
    },
  },
  // Europe
  {
    symbol: '^FTSE',
    name: 'FTSE 100',
    region: 'United Kingdom',
    currency: 'GBP',
    trackingETF: 'EWU',
    marketInfo: {
      tradingHours: '8:00 AM - 4:30 PM GMT',
      timezone: 'GMT',
      totalCompanies: 100,
    },
  },
  {
    symbol: '^GDAXI',
    name: 'DAX',
    region: 'Germany',
    currency: 'EUR',
    trackingETF: 'EWG',
    marketInfo: {
      tradingHours: '9:00 AM - 5:30 PM CET',
      timezone: 'CET',
      totalCompanies: 40,
    },
  },
  {
    symbol: '^FCHI',
    name: 'CAC 40',
    region: 'France',
    currency: 'EUR',
    trackingETF: 'EWQ',
    marketInfo: {
      tradingHours: '9:00 AM - 5:30 PM CET',
      timezone: 'CET',
      totalCompanies: 40,
    },
  },
  // Asia Pacific
  {
    symbol: '^N225',
    name: 'Nikkei 225',
    region: 'Japan',
    currency: 'JPY',
    trackingETF: 'EWJ',
    marketInfo: {
      tradingHours: '9:00 AM - 3:00 PM JST',
      timezone: 'JST',
      totalCompanies: 225,
    },
  },
  {
    symbol: '^HSI',
    name: 'Hang Seng Index',
    region: 'Hong Kong',
    currency: 'HKD',
    trackingETF: 'EWH',
    marketInfo: {
      tradingHours: '9:30 AM - 4:00 PM HKT',
      timezone: 'HKT',
      totalCompanies: 82,
    },
  },
  {
    symbol: '^AXJO',
    name: 'ASX 200',
    region: 'Australia',
    currency: 'AUD',
    trackingETF: 'EWA',
    marketInfo: {
      tradingHours: '10:00 AM - 4:00 PM AEST',
      timezone: 'AEST',
      totalCompanies: 200,
    },
  },
  // Emerging Markets
  {
    symbol: '^BVSP',
    name: 'Bovespa',
    region: 'Brazil',
    currency: 'BRL',
    trackingETF: 'EWZ',
    marketInfo: {
      tradingHours: '10:00 AM - 5:00 PM BRT',
      timezone: 'BRT',
      totalCompanies: 400,
    },
  },
  {
    symbol: '^BSESN',
    name: 'SENSEX',
    region: 'India',
    currency: 'INR',
    trackingETF: 'INDA',
    marketInfo: {
      tradingHours: '9:15 AM - 3:30 PM IST',
      timezone: 'IST',
      totalCompanies: 30,
    },
  },
];

/**
 * Reference market cap data (in billions USD)
 * Used for display when real market cap data is unavailable
 */
export const MARKET_CAP_REFERENCE: Record<string, number> = {
  'SPY': 45200,   // S&P 500
  'QQQ': 25800,   // NASDAQ
  'DIA': 12400,   // Dow Jones
  'EWC': 3200,    // Canada
  'EWU': 2800,    // UK
  'EWG': 1950,    // Germany
  'EWQ': 2650,    // France
  'EWJ': 4200,    // Japan
  'EWH': 3850,    // Hong Kong
  'EWA': 1850,    // Australia
  'EWZ': 1250,    // Brazil
  'INDA': 3650,   // India
};

/**
 * Get market metadata by index symbol
 */
export function getMarketMetadata(indexSymbol: string): MarketMetadata | undefined {
  return MARKET_METADATA.find(m => m.symbol === indexSymbol);
}

/**
 * Get all markets organized by region
 */
export function getMarketsByRegion(): Record<string, MarketMetadata[]> {
  const byRegion: Record<string, MarketMetadata[]> = {};
  
  MARKET_METADATA.forEach(market => {
    const regionKey = market.region.split(' ')[0]; // Group by country
    if (!byRegion[regionKey]) {
      byRegion[regionKey] = [];
    }
    byRegion[regionKey].push(market);
  });

  return byRegion;
}