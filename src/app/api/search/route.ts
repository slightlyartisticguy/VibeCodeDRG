/**
 * API route for searching instruments.
 * Combines Finnhub (equities/ETFs) with Yahoo Finance for mutual funds.
 * GET /api/search?q=apple
 */
import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/finnhub";
import { searchMutualFunds } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json(
      { error: "Please provide a search query (q parameter)." },
      { status: 400 }
    );
  }

  try {
    const [finnhubResults, mutualFunds] = await Promise.all([
      searchSymbols(query),
      searchMutualFunds(query),
    ]);

    const seen = new Set<string>();
    const merged = [...finnhubResults, ...mutualFunds].filter((item) => {
      const key = item.symbol.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ data: merged });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}
