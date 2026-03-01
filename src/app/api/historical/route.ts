/**
 * API route for fetching historical stock data.
 * Uses yahoo-finance2 with SQLite caching.
 * GET /api/historical?symbol=AAPL&period=6M
 */
import { NextRequest, NextResponse } from "next/server";
import { getHistoricalData } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") || "6M";

  if (!symbol) {
    return NextResponse.json(
      { error: "Please provide a symbol parameter." },
      { status: 400 }
    );
  }

  const validPeriods = ["1M", "6M", "1Y", "ALL"];
  if (!validPeriods.includes(period.toUpperCase())) {
    return NextResponse.json(
      { error: `Invalid period. Use one of: ${validPeriods.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const data = await getHistoricalData(
      symbol.toUpperCase(),
      period.toUpperCase()
    );
    const firstAvailableDate = data[0]?.date ?? null;
    return NextResponse.json({ data, firstAvailableDate });
  } catch (error) {
    console.error("Historical data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data." },
      { status: 500 }
    );
  }
}
