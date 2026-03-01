/**
 * API route for managing portfolio positions.
 * GET /api/positions - List all positions
 * POST /api/positions - Add a new position
 * DELETE /api/positions?symbol=AAPL - Remove a position
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PositionInputSchema } from "@/lib/types";
import { getPriceOnDate } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolio = searchParams.get("portfolio") ?? "A";
    const db = getDb();
    const positions = db
      .prepare("SELECT * FROM positions WHERE portfolio_id = ? ORDER BY symbol ASC")
      .all(portfolio);
    return NextResponse.json({ data: positions });
  } catch (error) {
    console.error("Positions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PositionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid position data.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { symbol, name, quantity, avg_price, asset_type, purchase_date, portfolio_id } = parsed.data;
    const db = getDb();

    // Default purchase_date to today if not provided
    const effectiveDate = purchase_date || new Date().toISOString().split("T")[0];

    // Look up the historical price on the purchase date as cost basis
    let costBasis = avg_price;
    try {
      const historicalPrice = await getPriceOnDate(symbol.toUpperCase(), effectiveDate);
      if (historicalPrice !== null) {
        costBasis = historicalPrice;
      }
    } catch (e) {
      console.warn(
        `Could not fetch historical price for ${symbol} on ${effectiveDate}, using provided price`,
        e
      );
    }

    // Upsert: update if exists, insert if not (scoped per portfolio)
    db.prepare(
      `INSERT INTO positions (symbol, portfolio_id, name, quantity, avg_price, asset_type, purchase_date, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(symbol, portfolio_id) DO UPDATE SET
         name = excluded.name,
         quantity = excluded.quantity,
         avg_price = excluded.avg_price,
         asset_type = excluded.asset_type,
         purchase_date = excluded.purchase_date,
         updated_at = datetime('now')`
    ).run(symbol.toUpperCase(), portfolio_id, name, quantity, costBasis, asset_type, effectiveDate);

    return NextResponse.json({ data: { symbol, portfolio_id, name, quantity, avg_price: costBasis, asset_type, purchase_date: effectiveDate } });
  } catch (error) {
    console.error("Positions POST error:", error);
    return NextResponse.json(
      { error: "Failed to save position." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, quantity, purchase_date, portfolio_id } = body as {
      symbol: string;
      portfolio_id?: string;
      quantity?: number;
      purchase_date?: string;
    };

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required." }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      `UPDATE positions
       SET quantity = COALESCE(?, quantity),
           purchase_date = ?,
           updated_at = datetime('now')
       WHERE symbol = ? AND portfolio_id = ?`
    ).run(quantity ?? null, purchase_date ?? null, symbol.toUpperCase(), portfolio_id ?? "A");

    return NextResponse.json({ data: { symbol, portfolio_id, quantity, purchase_date } });
  } catch (error) {
    console.error("Positions PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update position." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const portfolio = searchParams.get("portfolio") ?? "A";

  if (!symbol) {
    return NextResponse.json(
      { error: "Please provide a symbol parameter." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    db.prepare("DELETE FROM positions WHERE symbol = ? AND portfolio_id = ?").run(
      symbol.toUpperCase(),
      portfolio
    );
    return NextResponse.json({ data: { deleted: symbol.toUpperCase(), portfolio } });
  } catch (error) {
    console.error("Positions DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete position." },
      { status: 500 }
    );
  }
}
