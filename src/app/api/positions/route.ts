/**
 * API route for managing portfolio positions.
 * GET /api/positions - List all positions
 * POST /api/positions - Add a new position
 * DELETE /api/positions?symbol=AAPL - Remove a position
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PositionInputSchema } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const positions = db
      .prepare("SELECT * FROM positions ORDER BY symbol ASC")
      .all();
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

    const { symbol, name, quantity, avg_price, asset_type } = parsed.data;
    const db = getDb();

    // Upsert: update if exists, insert if not
    db.prepare(
      `INSERT INTO positions (symbol, name, quantity, avg_price, asset_type, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(symbol) DO UPDATE SET
         name = excluded.name,
         quantity = excluded.quantity,
         avg_price = excluded.avg_price,
         asset_type = excluded.asset_type,
         updated_at = datetime('now')`
    ).run(symbol.toUpperCase(), name, quantity, avg_price, asset_type);

    return NextResponse.json({ data: { symbol, name, quantity, avg_price, asset_type } });
  } catch (error) {
    console.error("Positions POST error:", error);
    return NextResponse.json(
      { error: "Failed to save position." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Please provide a symbol parameter." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    db.prepare("DELETE FROM positions WHERE symbol = ?").run(
      symbol.toUpperCase()
    );
    return NextResponse.json({ data: { deleted: symbol.toUpperCase() } });
  } catch (error) {
    console.error("Positions DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete position." },
      { status: 500 }
    );
  }
}
