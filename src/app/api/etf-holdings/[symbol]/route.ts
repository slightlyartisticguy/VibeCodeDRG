/**
 * ETF Holdings API Route
 * Fetches live top holdings for a given ETF symbol via Yahoo Finance
 * Server-side only — no API key required
 */

import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yahooFinance.quoteSummary(symbol.toUpperCase(), {
      modules: ['topHoldings'],
    });

    const rawHoldings = result.topHoldings?.holdings ?? [];

    const holdings = rawHoldings.map((h: { symbol?: string; holdingName?: string; holdingPercent?: number }) => ({
      symbol: h.symbol ?? '',
      name: h.holdingName ?? '',
      // Yahoo Finance returns holdingPercent as a decimal (e.g. 0.0715 = 7.15%)
      weight: h.holdingPercent != null ? parseFloat((h.holdingPercent * 100).toFixed(2)) : 0,
      sector: '',
    }));

    return NextResponse.json({ symbol: symbol.toUpperCase(), holdings });
  } catch (error) {
    console.error(`[etf-holdings] Failed to fetch holdings for ${symbol}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch holdings for ${symbol}` },
      { status: 502 }
    );
  }
}
