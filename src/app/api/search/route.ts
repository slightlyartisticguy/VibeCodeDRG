/**
 * API route for searching stock symbols via Finnhub.
 * GET /api/search?q=apple
 */
import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/finnhub";

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
    const results = await searchSymbols(query);
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}
