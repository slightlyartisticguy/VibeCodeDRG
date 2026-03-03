/**
 * API route for fetching the closing price of a symbol on or near a specific date.
 * GET /api/price-at-date?symbol=AAPL&date=2024-03-01
 * Returns the closing price for the nearest available trading day.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getHistoricalData } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  if (!symbol || !date) {
    return NextResponse.json(
      { error: "Please provide symbol and date parameters." },
      { status: 400 }
    );
  }

  try {
    // Ensure data is cached by fetching all historical data first
    await getHistoricalData(symbol.toUpperCase(), "ALL");

    const db = getDb();

    // Find the closest available trading day on or before the requested date
    const row = db
      .prepare(
        `SELECT date, close FROM historical_prices
         WHERE symbol = ? AND date <= ?
         ORDER BY date DESC
         LIMIT 1`
      )
      .get(symbol.toUpperCase(), date) as { date: string; close: number } | undefined;

    if (!row) {
      return NextResponse.json(
        { error: "No price data found for this date." },
        { status: 404 }
      );
    }

    return NextResponse.json({ price: row.close, date: row.date });
  } catch (error) {
    console.error("Price-at-date API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price data." },
      { status: 500 }
    );
  }
}
