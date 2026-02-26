import { NextRequest, NextResponse } from "next/server";
import { getEtfDetails } from "@/lib/yahoo-finance";
import { z } from "zod";

const QuerySchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  const parseResult = QuerySchema.safeParse({ symbol });
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.message }, { status: 400 });
  }

  try {
    const data = await getEtfDetails(symbol!.toUpperCase());
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fund details from Yahoo Finance" },
      { status: 500 }
    );
  }
}
