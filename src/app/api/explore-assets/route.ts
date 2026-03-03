/**
 * API route for fetching asset group data for the Explore Assets section.
 * Returns performance metrics for a curated group of assets in a given year.
 *
 * GET /api/explore-assets?group=tech-leaders&year=2024
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getHistoricalData } from "@/lib/yahoo-finance";
import {
  ASSET_GROUPS,
  getGroupSymbols,
  type SymbolEntry,
} from "@/lib/explore-assets-data";

export interface AssetPerformance {
  symbol: string;
  name: string;
  yearReturn: number | null;
  startPrice: number | null;
  endPrice: number | null;
  avgDailyVolume: number | null;
}

export interface ExploreAssetGroupResponse {
  groupId: string;
  year: number;
  assets: AssetPerformance[];
}

/**
 * Get the ISO date string for the first trading day on or after a given date.
 * Retrieves the nearest available price from the DB.
 */
function getPriceNearDate(symbol: string, date: string, lookForward: boolean): number | null {
  const db = getDb();
  const direction = lookForward ? "ASC" : "DESC";
  const operator = lookForward ? ">=" : "<=";

  const row = db
    .prepare(
      `SELECT close FROM historical_prices
       WHERE symbol = ? AND date ${operator} ?
       ORDER BY date ${direction}
       LIMIT 1`
    )
    .get(symbol, date) as { close: number } | undefined;

  return row?.close ?? null;
}

/**
 * Get the average daily volume for a symbol within a year's date range.
 */
function getAvgVolume(symbol: string, fromDate: string, toDate: string): number | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT AVG(volume) as avg_vol FROM historical_prices
       WHERE symbol = ? AND date >= ? AND date <= ? AND volume > 0`
    )
    .get(symbol, fromDate, toDate) as { avg_vol: number | null } | undefined;

  return row?.avg_vol ?? null;
}

/**
 * Compute year performance for a symbol.
 * Fetches historical data (cached in SQLite) then reads start/end prices.
 */
async function computePerformance(
  entry: SymbolEntry,
  yearStart: string,
  yearEnd: string
): Promise<AssetPerformance> {
  // Ensure data is cached
  try {
    await getHistoricalData(entry.symbol, "ALL");
  } catch {
    // Proceed with whatever is cached
  }

  const startPrice = getPriceNearDate(entry.symbol, yearStart, true);
  const endPrice = getPriceNearDate(entry.symbol, yearEnd, false);

  const yearReturn =
    startPrice && endPrice && startPrice > 0
      ? ((endPrice - startPrice) / startPrice) * 100
      : null;

  const avgDailyVolume = getAvgVolume(entry.symbol, yearStart, yearEnd);

  return {
    symbol: entry.symbol,
    name: entry.name,
    yearReturn: yearReturn !== null ? parseFloat(yearReturn.toFixed(2)) : null,
    startPrice: startPrice !== null ? parseFloat(startPrice.toFixed(2)) : null,
    endPrice: endPrice !== null ? parseFloat(endPrice.toFixed(2)) : null,
    avgDailyVolume: avgDailyVolume !== null ? Math.round(avgDailyVolume) : null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("group");
  const yearParam = searchParams.get("year");

  if (!groupId || !yearParam) {
    return NextResponse.json(
      { error: "Missing required parameters: group and year" },
      { status: 400 }
    );
  }

  const year = parseInt(yearParam, 10);
  if (isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
  }

  const group = ASSET_GROUPS.find((g) => g.id === groupId);
  if (!group) {
    return NextResponse.json({ error: `Unknown group: ${groupId}` }, { status: 404 });
  }

  const symbols = getGroupSymbols(group, year);
  const currentYear = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  // For current year, end date is today; for past years use Dec 31
  const yearEnd =
    year === currentYear
      ? new Date().toISOString().split("T")[0]
      : `${year}-12-31`;

  try {
    // Fetch all symbol performances in parallel (SQLite reads are fast after first cache)
    const assets = await Promise.all(
      symbols.map((entry) => computePerformance(entry, yearStart, yearEnd))
    );

    // Sort based on group's sortBy metric
    const sorted = [...assets].sort((a, b) => {
      if (group.sortBy === "volume") {
        return (b.avgDailyVolume ?? 0) - (a.avgDailyVolume ?? 0);
      }
      // yearReturn: handle nulls (push to end)
      if (a.yearReturn === null && b.yearReturn === null) return 0;
      if (a.yearReturn === null) return 1;
      if (b.yearReturn === null) return -1;
      return b.yearReturn - a.yearReturn;
    });

    const response: ExploreAssetGroupResponse = {
      groupId,
      year,
      assets: sorted,
    };

    return NextResponse.json(
      { data: response },
      {
        headers: {
          // Cache historical data for 1 hour; current year for 5 minutes
          "Cache-Control":
            year < currentYear
              ? "public, s-maxage=3600, stale-while-revalidate=86400"
              : "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error(`Explore assets API error for group ${groupId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch asset group data." },
      { status: 500 }
    );
  }
}
