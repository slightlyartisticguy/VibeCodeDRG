/**
 * API route for fetching current stock quotes from Finnhub.
 * GET /api/quote?symbol=AAPL
 * GET /api/quote?symbols=AAPL,MSFT,GOOGL
 */
import { NextRequest, NextResponse } from "next/server";
import { getQuote, getMultipleQuotes } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const symbols = searchParams.get("symbols");

  try {
    if (symbols) {
      const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase());
      const quotes = await getMultipleQuotes(symbolList);
      return NextResponse.json({ data: quotes });
    }

    if (symbol) {
      const quote = await getQuote(symbol.toUpperCase());
      if (!quote) {
        return NextResponse.json(
          { error: "Failed to fetch quote. API may be rate limited." },
          { status: 503 }
        );
      }
      return NextResponse.json({ data: quote });
    }

    return NextResponse.json(
      { error: "Please provide a symbol or symbols parameter." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching quote data." },
      { status: 500 }
    );
  }
}
