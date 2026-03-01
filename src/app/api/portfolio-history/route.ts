/**
 * API route for portfolio historical performance.
 * Returns a time series of portfolio value normalized to $10,000 invested.
 *
 * GET /api/portfolio-history?portfolio=A&period=6M
 *
 * For each day the portfolio value is calculated as:
 *   value = 10000 × (Σ qty_i × close_i) / (Σ qty_i × costBasis_i)
 * where only positions whose purchase_date <= that day are included.
 *
 * For "ALL" the series starts at the oldest purchase_date.
 * For other periods, the series starts at max(periodStart, oldestPurchaseDate).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getHistoricalData } from "@/lib/yahoo-finance";

interface PositionRow {
  symbol: string;
  quantity: number;
  avg_price: number;
  purchase_date: string | null;
}

/**
 * Calculates the start date for a given period.
 */
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "ALL":
      return new Date(2000, 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const portfolioId = searchParams.get("portfolio") ?? "A";
  const period = (searchParams.get("period") ?? "6M").toUpperCase();

  try {
    const db = getDb();
    const positions = db
      .prepare("SELECT symbol, quantity, avg_price, purchase_date FROM positions WHERE portfolio_id = ?")
      .all(portfolioId) as PositionRow[];

    if (positions.length === 0) {
      return NextResponse.json({ data: [], firstAvailableDate: null });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Default purchase_date to today for positions that don't have one
    for (const pos of positions) {
      if (!pos.purchase_date) {
        pos.purchase_date = todayStr;
      }
    }

    // Determine the earliest purchase date across all positions
    const purchaseDates = positions.map((p) => p.purchase_date as string).sort();
    const earliestPurchase = purchaseDates[0];

    // Determine effective start based on the selected time period
    const periodStart = getStartDate(period);
    const periodStartStr = periodStart.toISOString().split("T")[0];
    const effectiveStart =
      period === "ALL"
        ? earliestPurchase
        : periodStartStr > earliestPurchase
          ? periodStartStr
          : earliestPurchase;

    // Ensure we have cached historical data for every position
    for (const pos of positions) {
      await getHistoricalData(pos.symbol, "ALL");
    }

    // Build a map: symbol -> { date -> close_price }
    const priceData: Record<string, Record<string, number>> = {};
    const allDates = new Set<string>();

    for (const pos of positions) {
      const rows = db
        .prepare(
          `SELECT date, close FROM historical_prices
           WHERE symbol = ? AND date >= ?
           ORDER BY date ASC`
        )
        .all(pos.symbol, effectiveStart) as Array<{ date: string; close: number }>;

      priceData[pos.symbol] = {};
      for (const row of rows) {
        priceData[pos.symbol][row.date] = row.close;
        allDates.add(row.date);
      }
    }

    // Sort all dates chronologically
    const sortedDates = Array.from(allDates).sort();

    // --- New Simulation Logic ---
    const result: Array<{ date: string; value: number }> = [];
    let portfolioValue = 10000;
    const lastKnownPrice: Record<string, number> = {};

    // Initialize lastKnownPrice for the day before the first date
    const firstDate = new Date(sortedDates[0] + "T12:00:00");
    firstDate.setDate(firstDate.getDate() - 1);
    const dayBeforeFirstStr = firstDate.toISOString().split("T")[0];

    for (const pos of positions) {
      if (pos.purchase_date && pos.purchase_date <= sortedDates[0]) {
        const price = db.prepare(
          `SELECT close FROM historical_prices
           WHERE symbol = ? AND date <= ?
           ORDER BY date DESC LIMIT 1`
        ).get(pos.symbol, dayBeforeFirstStr) as { close: number } | undefined;
        lastKnownPrice[pos.symbol] = price?.close ?? pos.avg_price;
      }
    }

    for (const date of sortedDates) {
      let dailyTotalValue = 0;
      let dailyWeightedPctChange = 0;

      // Calculate total value at START of day (using previous day's prices)
      for (const pos of positions) {
        const purchaseDate = pos.purchase_date as string;
        if (date < purchaseDate) continue;

        const price = lastKnownPrice[pos.symbol];
        if (price !== undefined) {
          dailyTotalValue += pos.quantity * price;
        }
      }

      if (dailyTotalValue > 0) {
        // Calculate weighted % change for the current day
        for (const pos of positions) {
          const purchaseDate = pos.purchase_date as string;
          if (date < purchaseDate) continue;

          const prevPrice = lastKnownPrice[pos.symbol];
          const currentPrice = priceData[pos.symbol]?.[date];

          if (prevPrice !== undefined && currentPrice !== undefined) {
            const assetValue = pos.quantity * prevPrice;
            const weight = assetValue / dailyTotalValue;
            const pctChange = (currentPrice - prevPrice) / prevPrice;
            dailyWeightedPctChange += weight * pctChange;
          }
        }
        portfolioValue *= (1 + dailyWeightedPctChange);
      }

      result.push({
        date,
        value: Math.round(portfolioValue * 100) / 100,
      });

      // Update last known prices for the next iteration
      for (const pos of positions) {
        if (priceData[pos.symbol]?.[date] !== undefined) {
          lastKnownPrice[pos.symbol] = priceData[pos.symbol][date];
        }
      }
    }

    // Prepend the starting $10,000 point
    if (result.length > 0) {
      const startDate = new Date(result[0].date + "T12:00:00");
      startDate.setDate(startDate.getDate() - 1);
      result.unshift({
        date: startDate.toISOString().split("T")[0],
        value: 10000,
      });
    } else if (positions.length > 0) {
      // Handle case where there are positions but no historical data in range
      result.push({ date: effectiveStart, value: 10000 });
    }

    return NextResponse.json({
      data: result,
      firstAvailableDate: result[0]?.date ?? null,
    });
  } catch (error) {
    console.error("Portfolio history error:", error);
    return NextResponse.json(
      { error: "Failed to calculate portfolio history." },
      { status: 500 }
    );
  }
}
