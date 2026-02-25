/**
 * API route for fetching major market indices data.
 * GET /api/markets
 */
import { NextResponse } from "next/server";
import { getMultipleQuotes } from "@/lib/finnhub";

/** Major world market indices tracked by the app */
const MARKET_INDICES = [
  // US Markets
  { symbol: "^GSPC", name: "S&P 500", region: "US" },
  { symbol: "^DJI", name: "Dow Jones Industrial", region: "US" },
  { symbol: "^IXIC", name: "NASDAQ Composite", region: "US" },
  // European Markets
  { symbol: "^FTSE", name: "FTSE 100", region: "Europe" },
  { symbol: "^GDAXI", name: "DAX", region: "Europe" },
  { symbol: "^FCHI", name: "CAC 40", region: "Europe" },
  // Asian Markets
  { symbol: "^N225", name: "Nikkei 225", region: "Asia" },
  { symbol: "^HSI", name: "Hang Seng", region: "Asia" },
  { symbol: "000001.SS", name: "Shanghai Composite", region: "Asia" },
];

/**
 * Finnhub uses different symbol formats for indices.
 * This maps display symbols to Finnhub-compatible symbols.
 */
const FINNHUB_SYMBOL_MAP: Record<string, string> = {
  "^GSPC": "SPY",    // S&P 500 ETF as proxy
  "^DJI": "DIA",     // Dow Jones ETF as proxy
  "^IXIC": "QQQ",    // NASDAQ ETF as proxy
  "^FTSE": "EWU",    // UK ETF as proxy
  "^GDAXI": "EWG",   // Germany ETF as proxy
  "^FCHI": "EWQ",    // France ETF as proxy
  "^N225": "EWJ",    // Japan ETF as proxy
  "^HSI": "EWH",     // Hong Kong ETF as proxy
  "000001.SS": "FXI", // China ETF as proxy
};

export async function GET() {
  try {
    const finnhubSymbols = MARKET_INDICES.map(
      (idx) => FINNHUB_SYMBOL_MAP[idx.symbol] || idx.symbol
    );

    const quotes = await getMultipleQuotes(finnhubSymbols);

    const markets = MARKET_INDICES.map((idx) => {
      const finnhubSymbol = FINNHUB_SYMBOL_MAP[idx.symbol] || idx.symbol;
      const quote = quotes[finnhubSymbol];

      return {
        symbol: idx.symbol,
        name: idx.name,
        region: idx.region,
        currentPrice: quote?.currentPrice ?? 0,
        change: quote?.change ?? 0,
        percentChange: quote?.percentChange ?? 0,
      };
    });

    return NextResponse.json({ data: markets });
  } catch (error) {
    console.error("Markets API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data." },
      { status: 500 }
    );
  }
}
