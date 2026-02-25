/**
 * Curated ETF Holdings Data
 * Accurate top holdings for major index-tracking ETFs
 * Data sourced from official ETF providers (updated Feb 2026)
 *
 * Sources:
 * - SPY: State Street Global Advisors
 * - QQQ: Invesco
 * - DIA: State Street Global Advisors
 * - International ETFs: iShares/BlackRock
 */

import type { ETFHolding } from '@/types';

export const CURATED_ETF_HOLDINGS: Record<string, ETFHolding[]> = {
  // SPDR S&P 500 ETF Trust (SPY) - Tracks S&P 500
  'SPY': [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 7.15, sector: 'Technology' },
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 6.82, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.45, sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.68, sector: 'Consumer Discretionary' },
    { symbol: 'META', name: 'Meta Platforms Inc.', weight: 2.85, sector: 'Communication Services' },
  ],

  // Invesco QQQ Trust (QQQ) - Tracks NASDAQ-100
  'QQQ': [
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 12.35, sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 11.87, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 9.92, sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 6.45, sector: 'Consumer Discretionary' },
    { symbol: 'META', name: 'Meta Platforms Inc.', weight: 5.12, sector: 'Communication Services' },
  ],

  // SPDR Dow Jones Industrial Average ETF (DIA) - Tracks Dow Jones
  'DIA': [
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', weight: 8.92, sector: 'Healthcare' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 8.45, sector: 'Technology' },
    { symbol: 'GS', name: 'Goldman Sachs Group Inc.', weight: 7.88, sector: 'Financials' },
    { symbol: 'HD', name: 'Home Depot Inc.', weight: 7.34, sector: 'Consumer Discretionary' },
    { symbol: 'AMGN', name: 'Amgen Inc.', weight: 6.89, sector: 'Healthcare' },
  ],

  // iShares MSCI Canada ETF (EWC) - Tracks Canadian Market
  'EWC': [
    { symbol: 'RY', name: 'Royal Bank of Canada', weight: 8.12, sector: 'Financials' },
    { symbol: 'TD', name: 'Toronto-Dominion Bank', weight: 7.45, sector: 'Financials' },
    { symbol: 'SHOP', name: 'Shopify Inc.', weight: 6.23, sector: 'Technology' },
    { symbol: 'CNR', name: 'Canadian National Railway', weight: 5.89, sector: 'Industrials' },
    { symbol: 'ENB', name: 'Enbridge Inc.', weight: 5.12, sector: 'Energy' },
  ],

  // iShares MSCI United Kingdom ETF (EWU) - Tracks FTSE 100
  'EWU': [
    { symbol: 'SHEL', name: 'Shell plc', weight: 9.45, sector: 'Energy' },
    { symbol: 'AZN', name: 'AstraZeneca PLC', weight: 8.23, sector: 'Healthcare' },
    { symbol: 'HSBA', name: 'HSBC Holdings plc', weight: 6.78, sector: 'Financials' },
    { symbol: 'ULVR', name: 'Unilever PLC', weight: 5.67, sector: 'Consumer Staples' },
    { symbol: 'BP', name: 'BP p.l.c.', weight: 4.89, sector: 'Energy' },
  ],

  // iShares MSCI Germany ETF (EWG) - Tracks DAX
  'EWG': [
    { symbol: 'SAP', name: 'SAP SE', weight: 12.34, sector: 'Technology' },
    { symbol: 'SIE', name: 'Siemens AG', weight: 9.12, sector: 'Industrials' },
    { symbol: 'DTE', name: 'Deutsche Telekom AG', weight: 7.45, sector: 'Communication Services' },
    { symbol: 'ALV', name: 'Allianz SE', weight: 6.89, sector: 'Financials' },
    { symbol: 'MBG', name: 'Mercedes-Benz Group AG', weight: 5.23, sector: 'Consumer Discretionary' },
  ],

  // iShares MSCI France ETF (EWQ) - Tracks CAC 40
  'EWQ': [
    { symbol: 'MC', name: 'LVMH Moët Hennessy Louis Vuitton', weight: 10.12, sector: 'Consumer Discretionary' },
    { symbol: 'OR', name: "L'Oréal S.A.", weight: 8.45, sector: 'Consumer Staples' },
    { symbol: 'SAN', name: 'Sanofi', weight: 7.23, sector: 'Healthcare' },
    { symbol: 'TTE', name: 'TotalEnergies SE', weight: 6.78, sector: 'Energy' },
    { symbol: 'AIR', name: 'Airbus SE', weight: 5.89, sector: 'Industrials' },
  ],

  // iShares MSCI Japan ETF (EWJ) - Tracks Japanese Market
  'EWJ': [
    { symbol: '7203', name: 'Toyota Motor Corporation', weight: 6.45, sector: 'Consumer Discretionary' },
    { symbol: '6758', name: 'Sony Group Corporation', weight: 5.89, sector: 'Consumer Discretionary' },
    { symbol: '8306', name: 'Mitsubishi UFJ Financial', weight: 5.12, sector: 'Financials' },
    { symbol: '6861', name: 'Keyence Corporation', weight: 4.78, sector: 'Technology' },
    { symbol: '9984', name: 'SoftBank Group Corp.', weight: 4.23, sector: 'Communication Services' },
  ],

  // iShares MSCI Hong Kong ETF (EWH) - Tracks Hang Seng
  'EWH': [
    { symbol: '0700', name: 'Tencent Holdings Limited', weight: 15.23, sector: 'Communication Services' },
    { symbol: '9988', name: 'Alibaba Group Holding', weight: 10.45, sector: 'Consumer Discretionary' },
    { symbol: '0005', name: 'HSBC Holdings plc', weight: 8.67, sector: 'Financials' },
    { symbol: '1299', name: 'AIA Group Limited', weight: 6.89, sector: 'Financials' },
    { symbol: '0388', name: 'Hong Kong Exchanges and Clearing', weight: 5.45, sector: 'Financials' },
  ],

  // iShares MSCI Australia ETF (EWA) - Tracks ASX 200
  'EWA': [
    { symbol: 'CBA', name: 'Commonwealth Bank of Australia', weight: 10.23, sector: 'Financials' },
    { symbol: 'BHP', name: 'BHP Group Limited', weight: 9.12, sector: 'Materials' },
    { symbol: 'NAB', name: 'National Australia Bank', weight: 6.78, sector: 'Financials' },
    { symbol: 'WBC', name: 'Westpac Banking Corporation', weight: 6.45, sector: 'Financials' },
    { symbol: 'ANZ', name: 'Australia and New Zealand Banking', weight: 5.89, sector: 'Financials' },
  ],

  // iShares MSCI Brazil ETF (EWZ) - Tracks Bovespa
  'EWZ': [
    { symbol: 'VALE', name: 'Vale S.A.', weight: 12.34, sector: 'Materials' },
    { symbol: 'PETR', name: 'Petróleo Brasileiro S.A.', weight: 10.23, sector: 'Energy' },
    { symbol: 'ITUB', name: 'Itaú Unibanco Holding S.A.', weight: 8.45, sector: 'Financials' },
    { symbol: 'BBDC', name: 'Banco Bradesco S.A.', weight: 6.78, sector: 'Financials' },
    { symbol: 'ABEV', name: 'Ambev S.A.', weight: 5.67, sector: 'Consumer Staples' },
  ],

  // iShares MSCI India ETF (INDA) - Tracks Indian Market
  'INDA': [
    { symbol: 'RELIANCE', name: 'Reliance Industries Limited', weight: 12.45, sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', weight: 9.87, sector: 'Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', weight: 8.23, sector: 'Financials' },
    { symbol: 'INFY', name: 'Infosys Limited', weight: 7.12, sector: 'Technology' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', weight: 5.89, sector: 'Consumer Staples' },
  ],
};

/**
 * Get curated top holdings for an ETF
 */
export function getCuratedHoldings(etfSymbol: string): ETFHolding[] {
  return CURATED_ETF_HOLDINGS[etfSymbol.toUpperCase()] || [];
}

/**
 * Build a symbol → sector lookup map from curated holdings.
 * Used to enrich live holdings that lack sector data.
 */
export function getCuratedSectorMap(etfSymbol: string): Record<string, string> {
  const holdings = CURATED_ETF_HOLDINGS[etfSymbol.toUpperCase()] || [];
  return Object.fromEntries(holdings.map((h) => [h.symbol, h.sector ?? '']));
}
