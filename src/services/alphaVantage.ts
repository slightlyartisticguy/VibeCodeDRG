/**
 * Alpha Vantage API Service
 * Handles all stock data fetching from Alpha Vantage API
 * API Documentation: https://www.alphavantage.co/documentation/
 */

import axios from 'axios';
import type {
  StockQuote,
  TimeSeriesDataPoint,
  StockOverview,
  AlphaVantageQuoteResponse,
  AlphaVantageTimeSeriesResponse,
  AlphaVantageOverviewResponse,
} from '@/types';

const API_KEY =
  process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY ||
  process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

if (!API_KEY) {
  throw new Error(
    'Missing Alpha Vantage API key. Set NEXT_PUBLIC_ALPHAVANTAGE_API_KEY or NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY.'
  );
}

const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetches the current quote for a stock symbol from Alpha Vantage directly
 * @param symbol - Stock ticker symbol (e.g., 'AAPL', 'MSFT')
 * @returns StockQuote object with current price and change data
 */
export async function fetchStockQuoteFromAlphaVantage(symbol: string): Promise<StockQuote> {
  try {
    const response = await axios.get<AlphaVantageQuoteResponse>(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: API_KEY,
      },
    });

    if (response.data.Note) {
      throw new Error('Alpha Vantage rate limit reached. Please wait about a minute and try again.');
    }

    if (response.data.Information) {
      throw new Error(response.data.Information);
    }

    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }

    const quote = response.data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0 || !quote['01. symbol']) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetches the current quote for a stock symbol via our internal API proxy
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  // If running on server, call directly to avoid loop/network overhead if desired, 
  // but usually we want the caching logic in the API route to be the single source of truth.
  // However, the API route itself calls fetchStockQuoteFromAlphaVantage.
  // So we must ensure this function calls the API route (for client) OR calls direct (for server IF we want to bypass cache/api route).
  
  // Since this app uses React Query hooks on client, this function is primarily client-side.
  if (typeof window === 'undefined') {
     // Server side: we should probably reuse the logic in the route.ts or call fetchStockQuoteFromAlphaVantage directly?
     // But wait, if someone calls getStockQuote on server (e.g. Server Component), they might want caching too.
     // For now, let's assume this is client-side usage via hooks.
     return fetchStockQuoteFromAlphaVantage(symbol);
  }

  // Client side: fetch from our proxy API
  const response = await axios.get(`/api/stock-quote/${symbol}`);
  
  // The API returns { quote: ..., fetchedAt: ... }
  // We need to return the StockQuote object
  if (response.data && response.data.quote) {
    return response.data.quote;
  }
  
  throw new Error('Invalid response from stock proxy');
}

/**
 * Fetches historical daily time series data for a stock
 * @param symbol - Stock ticker symbol
 * @param outputSize - 'compact' (100 data points) or 'full' (20+ years)
 * @returns Array of TimeSeriesDataPoint objects
 */
export async function getTimeSeries(
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<TimeSeriesDataPoint[]> {
  try {
    const response = await axios.get<AlphaVantageTimeSeriesResponse>(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: outputSize,
        apikey: API_KEY,
      },
    });

    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
      throw new Error(`No time series data found for symbol: ${symbol}`);
    }

    return Object.entries(timeSeries)
      .map(([date, data]) => ({
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume']),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetches company overview and fundamental data
 * @param symbol - Stock ticker symbol
 * @returns StockOverview object with company details
 */
export async function getStockOverview(symbol: string): Promise<StockOverview> {
  try {
    const response = await axios.get<AlphaVantageOverviewResponse>(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase(),
        apikey: API_KEY,
      },
    });

    const data = response.data;

    if (!data.Symbol) {
      throw new Error(`No overview data found for symbol: ${symbol}`);
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      exchange: data.Exchange,
      currency: data.Currency,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseFloat(data.MarketCapitalization) || 0,
      peRatio: data.PERatio !== 'None' ? parseFloat(data.PERatio) : null,
      pegRatio: data.PEGRatio !== 'None' ? parseFloat(data.PEGRatio) : null,
      dividendYield: data.DividendYield !== 'None' ? parseFloat(data.DividendYield) : null,
      eps: data.EPS !== 'None' ? parseFloat(data.EPS) : null,
      weekHigh52: parseFloat(data['52WeekHigh']),
      weekLow52: parseFloat(data['52WeekLow']),
      movingAverage50: parseFloat(data['50DayMovingAverage']),
      movingAverage200: parseFloat(data['200DayMovingAverage']),
    };
  } catch (error) {
    console.error(`Error fetching overview for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetches quotes for multiple symbols
 * @param symbols - Array of stock ticker symbols
 * @returns Array of StockQuote objects
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  // Alpha Vantage free tier has rate limits (5 calls/min, 500 calls/day)
  // We'll fetch sequentially with a small delay
  const quotes: StockQuote[] = [];

  for (const symbol of symbols) {
    try {
      const quote = await getStockQuote(symbol);
      quotes.push(quote);
      // Small delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
    }
  }

  return quotes;
}

/**
 * Searches for stock symbols matching a query
 * @param keywords - Search keywords
 * @returns Array of matching symbols with metadata
 */
export async function searchSymbols(keywords: string): Promise<
  Array<{
    symbol: string;
    name: string;
    type: string;
    region: string;
    currency: string;
  }>
> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords,
        apikey: API_KEY,
      },
    });

    const matches = response.data.bestMatches || [];

    return matches.map(
      (match: {
        '1. symbol': string;
        '2. name': string;
        '3. type': string;
        '4. region': string;
        '8. currency': string;
      }) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency'],
      })
    );
  } catch (error) {
    console.error(`Error searching for ${keywords}:`, error);
    throw error;
  }
}
