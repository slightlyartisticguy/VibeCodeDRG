import { Stock, SearchResult, HistoricalDataPoint, ChartDataPoint } from '@/types';

// Comprehensive list of popular stocks with realistic data
export const STOCK_DATABASE: Stock[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, changePercent: 1.33, volume: 54000000, marketCap: 2800000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.91, change: 4.21, changePercent: 1.12, volume: 22000000, marketCap: 2810000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 1.45, changePercent: 1.03, volume: 25000000, marketCap: 1780000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.12, changePercent: 1.78, volume: 45000000, marketCap: 1850000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.95, change: 8.45, changePercent: 1.70, volume: 18000000, marketCap: 1300000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.35, change: 15.67, changePercent: 1.82, volume: 42000000, marketCap: 2160000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.30, changePercent: -2.09, volume: 95000000, marketCap: 790000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.25, change: 3.45, changePercent: 1.97, volume: 55000000, marketCap: 288000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corporation', price: 43.25, change: -0.85, changePercent: -1.93, volume: 35000000, marketCap: 182000000000, sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 272.80, change: 4.15, changePercent: 1.54, volume: 5500000, marketCap: 264000000000, sector: 'Technology', exchange: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', price: 125.40, change: 1.85, changePercent: 1.50, volume: 8000000, marketCap: 345000000000, sector: 'Technology', exchange: 'NYSE' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 575.30, change: 8.20, changePercent: 1.45, volume: 3200000, marketCap: 258000000000, sector: 'Technology', exchange: 'NASDAQ' },
  
  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.40, change: 2.30, changePercent: 1.19, volume: 9500000, marketCap: 565000000000, sector: 'Financial', exchange: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corp', price: 33.85, change: 0.45, changePercent: 1.35, volume: 35000000, marketCap: 268000000000, sector: 'Financial', exchange: 'NYSE' },
  { symbol: 'WFC', name: 'Wells Fargo & Co', price: 52.30, change: 0.78, changePercent: 1.51, volume: 18000000, marketCap: 188000000000, sector: 'Financial', exchange: 'NYSE' },
  { symbol: 'GS', name: 'Goldman Sachs Group', price: 385.20, change: 5.45, changePercent: 1.44, volume: 2500000, marketCap: 125000000000, sector: 'Financial', exchange: 'NYSE' },
  { symbol: 'MS', name: 'Morgan Stanley', price: 92.75, change: 1.25, changePercent: 1.37, volume: 8000000, marketCap: 152000000000, sector: 'Financial', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', price: 279.50, change: 3.80, changePercent: 1.38, volume: 7500000, marketCap: 572000000000, sector: 'Financial', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', price: 458.90, change: 5.65, changePercent: 1.25, volume: 3200000, marketCap: 428000000000, sector: 'Financial', exchange: 'NYSE' },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 158.45, change: 1.20, changePercent: 0.76, volume: 7500000, marketCap: 382000000000, sector: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group', price: 528.30, change: 6.45, changePercent: 1.24, volume: 3800000, marketCap: 488000000000, sector: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.75, change: -0.35, changePercent: -1.20, volume: 42000000, marketCap: 162000000000, sector: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', price: 162.80, change: 2.15, changePercent: 1.34, volume: 6500000, marketCap: 287000000000, sector: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'MRK', name: 'Merck & Co.', price: 118.50, change: 1.45, changePercent: 1.24, volume: 8200000, marketCap: 300000000000, sector: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'LLY', name: 'Eli Lilly and Co.', price: 752.40, change: 12.30, changePercent: 1.66, volume: 3500000, marketCap: 715000000000, sector: 'Healthcare', exchange: 'NYSE' },
  
  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', price: 165.80, change: 1.95, changePercent: 1.19, volume: 8500000, marketCap: 446000000000, sector: 'Consumer', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble', price: 158.25, change: 1.30, changePercent: 0.83, volume: 6800000, marketCap: 372000000000, sector: 'Consumer', exchange: 'NYSE' },
  { symbol: 'KO', name: 'Coca-Cola Company', price: 59.80, change: 0.45, changePercent: 0.76, volume: 12000000, marketCap: 258000000000, sector: 'Consumer', exchange: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', price: 172.50, change: 1.85, changePercent: 1.08, volume: 5500000, marketCap: 237000000000, sector: 'Consumer', exchange: 'NASDAQ' },
  { symbol: 'COST', name: 'Costco Wholesale', price: 725.60, change: 8.45, changePercent: 1.18, volume: 2200000, marketCap: 322000000000, sector: 'Consumer', exchange: 'NASDAQ' },
  { symbol: 'MCD', name: "McDonald's Corporation", price: 295.40, change: 3.25, changePercent: 1.11, volume: 3500000, marketCap: 214000000000, sector: 'Consumer', exchange: 'NYSE' },
  { symbol: 'NKE', name: 'Nike Inc.', price: 98.75, change: 1.45, changePercent: 1.49, volume: 8500000, marketCap: 149000000000, sector: 'Consumer', exchange: 'NYSE' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', price: 92.30, change: 1.15, changePercent: 1.26, volume: 7800000, marketCap: 105000000000, sector: 'Consumer', exchange: 'NASDAQ' },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corp', price: 104.25, change: 1.55, changePercent: 1.51, volume: 15000000, marketCap: 416000000000, sector: 'Energy', exchange: 'NYSE' },
  { symbol: 'CVX', name: 'Chevron Corporation', price: 152.80, change: 2.15, changePercent: 1.43, volume: 8500000, marketCap: 285000000000, sector: 'Energy', exchange: 'NYSE' },
  { symbol: 'COP', name: 'ConocoPhillips', price: 115.40, change: 1.85, changePercent: 1.63, volume: 6200000, marketCap: 135000000000, sector: 'Energy', exchange: 'NYSE' },
  
  // Industrial
  { symbol: 'CAT', name: 'Caterpillar Inc.', price: 335.20, change: 4.75, changePercent: 1.44, volume: 2800000, marketCap: 168000000000, sector: 'Industrial', exchange: 'NYSE' },
  { symbol: 'BA', name: 'Boeing Company', price: 208.45, change: 3.25, changePercent: 1.58, volume: 5500000, marketCap: 125000000000, sector: 'Industrial', exchange: 'NYSE' },
  { symbol: 'GE', name: 'General Electric', price: 158.90, change: 2.45, changePercent: 1.57, volume: 6800000, marketCap: 172000000000, sector: 'Industrial', exchange: 'NYSE' },
  { symbol: 'UPS', name: 'United Parcel Service', price: 148.75, change: 1.95, changePercent: 1.33, volume: 3200000, marketCap: 128000000000, sector: 'Industrial', exchange: 'NYSE' },
  { symbol: 'HON', name: 'Honeywell International', price: 202.30, change: 2.85, changePercent: 1.43, volume: 2500000, marketCap: 134000000000, sector: 'Industrial', exchange: 'NASDAQ' },
  
  // ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 502.45, change: 4.85, changePercent: 0.98, volume: 75000000, marketCap: 450000000000, sector: 'ETF', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 438.20, change: 5.65, changePercent: 1.31, volume: 45000000, marketCap: 215000000000, sector: 'ETF', exchange: 'NASDAQ' },
  { symbol: 'IWM', name: 'iShares Russell 2000', price: 198.75, change: 2.45, changePercent: 1.25, volume: 28000000, marketCap: 58000000000, sector: 'ETF', exchange: 'NYSE' },
  { symbol: 'DIA', name: 'SPDR Dow Jones ETF', price: 388.50, change: 3.25, changePercent: 0.84, volume: 3500000, marketCap: 32000000000, sector: 'ETF', exchange: 'NYSE' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', price: 258.90, change: 2.55, changePercent: 1.00, volume: 4200000, marketCap: 380000000000, sector: 'ETF', exchange: 'NYSE' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 462.15, change: 4.45, changePercent: 0.97, volume: 5800000, marketCap: 420000000000, sector: 'ETF', exchange: 'NYSE' },
  
  // Communication
  { symbol: 'DIS', name: 'Walt Disney Company', price: 112.45, change: 1.85, changePercent: 1.67, volume: 12000000, marketCap: 206000000000, sector: 'Communication', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 605.80, change: 9.45, changePercent: 1.58, volume: 4500000, marketCap: 262000000000, sector: 'Communication', exchange: 'NASDAQ' },
  { symbol: 'T', name: 'AT&T Inc.', price: 17.25, change: 0.15, changePercent: 0.88, volume: 32000000, marketCap: 123000000000, sector: 'Communication', exchange: 'NYSE' },
  { symbol: 'VZ', name: 'Verizon Communications', price: 40.85, change: 0.35, changePercent: 0.86, volume: 18000000, marketCap: 172000000000, sector: 'Communication', exchange: 'NYSE' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', price: 42.50, change: 0.55, changePercent: 1.31, volume: 22000000, marketCap: 168000000000, sector: 'Communication', exchange: 'NASDAQ' },
];

/**
 * Search stocks by query
 */
export function searchStocks(query: string): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return STOCK_DATABASE
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(normalizedQuery) ||
        stock.name.toLowerCase().includes(normalizedQuery)
    )
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      type: stock.sector === 'ETF' ? 'ETF' : 'Stock',
    }))
    .slice(0, 10);
}

/**
 * Get stock by symbol
 */
export function getStock(symbol: string): Stock | undefined {
  return STOCK_DATABASE.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
}

/**
 * Get current price for a symbol (with slight randomization for realism)
 */
export function getCurrentPrice(symbol: string): number {
  const stock = getStock(symbol);
  if (!stock) return 0;
  
  // Add slight random variation (-0.5% to +0.5%)
  const variation = (Math.random() - 0.5) * 0.01;
  return stock.price * (1 + variation);
}

/**
 * Get multiple stock prices
 */
export function getMultiplePrices(symbols: string[]): { [symbol: string]: number } {
  const prices: { [symbol: string]: number } = {};
  symbols.forEach((symbol) => {
    prices[symbol] = getCurrentPrice(symbol);
  });
  return prices;
}

/**
 * Generate historical data for a stock
 */
export function generateHistoricalData(
  symbol: string,
  days: number = 365
): HistoricalDataPoint[] {
  const stock = getStock(symbol);
  if (!stock) return [];

  const data: HistoricalDataPoint[] = [];
  const basePrice = stock.price;
  const volatility = stock.sector === 'Technology' ? 0.025 : 0.015;
  
  let currentPrice = basePrice * (0.7 + Math.random() * 0.3); // Start at 70-100% of current

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Random walk with drift towards current price
    const drift = (basePrice - currentPrice) * 0.001;
    const randomChange = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + drift + randomChange, 1);

    const dayVolatility = volatility * currentPrice;
    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.5) * dayVolatility;
    const high = Math.max(open, close) + Math.random() * dayVolatility * 0.5;
    const low = Math.min(open, close) - Math.random() * dayVolatility * 0.5;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(stock.volume * (0.5 + Math.random())),
    });

    currentPrice = close;
  }

  return data;
}

/**
 * Generate portfolio performance chart data
 */
export function generatePortfolioChartData(
  initialValue: number,
  currentValue: number,
  days: number = 30
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const totalChange = currentValue - initialValue;
  const dailyDrift = totalChange / days;
  
  let value = initialValue;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation
    const randomVariation = (Math.random() - 0.5) * initialValue * 0.01;
    value = value + dailyDrift + randomVariation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(Math.max(value, initialValue * 0.5).toFixed(2)),
    });
  }

  // Ensure the last point matches current value
  if (data.length > 0) {
    data[data.length - 1].value = currentValue;
  }

  return data;
}

/**
 * Get all sectors
 */
export function getSectors(): string[] {
  const sectors = new Set(STOCK_DATABASE.map((s) => s.sector));
  return Array.from(sectors).sort();
}

/**
 * Get stocks by sector
 */
export function getStocksBySector(sector: string): Stock[] {
  return STOCK_DATABASE.filter((s) => s.sector === sector);
}

/**
 * Get top movers (stocks with highest absolute change)
 */
export function getTopMovers(limit: number = 5): { gainers: Stock[]; losers: Stock[] } {
  const sorted = [...STOCK_DATABASE].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  
  return {
    gainers: sorted.slice(0, limit),
    losers: sorted.slice(-limit).reverse(),
  };
}

/**
 * Get market summary
 */
export function getMarketSummary() {
  const spy = getStock('SPY');
  const qqq = getStock('QQQ');
  const dia = getStock('DIA');

  return {
    sp500: spy ? { value: spy.price, change: spy.changePercent } : null,
    nasdaq: qqq ? { value: qqq.price, change: qqq.changePercent } : null,
    dow: dia ? { value: dia.price, change: dia.changePercent } : null,
  };
}
