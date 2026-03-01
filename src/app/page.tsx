/**
 * Main dashboard page for the investment portfolio simulator.
 * Combines the performance chart, asset allocation, held positions,
 * and market overview into a single responsive layout.
 */
"use client";

import { Header } from "@/components/header";
import { PerformanceChart } from "@/components/performance-chart";
import { AssetAllocation } from "@/components/asset-allocation";
import { PositionsTable } from "@/components/positions-table";
import { usePositions, useMultipleQuotes } from "@/hooks/use-market-data";

export default function DashboardPage() {
  // Each portfolio fetches its own independent set of positions
  const { data: positionsA = [] } = usePositions("A");
  const { data: positionsB = [] } = usePositions("B");

  const symbolsA = positionsA.map((p) => p.symbol);
  const symbolsB = positionsB.map((p) => p.symbol);
  const { data: quotesA = {} } = useMultipleQuotes(symbolsA);
  const { data: quotesB = {} } = useMultipleQuotes(symbolsB);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
        {/*
         * Two-column grid: each column is an independent portfolio stack.
         * Rows align horizontally so both charts, both allocation panels,
         * and both position tables are visible at the same scroll position.
         * On screens narrower than xl (1280px) collapses to a single column.
         */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">

          {/* ── Row 1: Performance Charts ─────────────────────────── */}
          <PerformanceChart
            portfolioId="A"
            title="Portfolio A"
            compact
            empty={positionsA.length === 0}
          />
          <PerformanceChart
            portfolioId="B"
            title="Portfolio B"
            compact
            empty={positionsB.length === 0}
          />

          {/* ── Row 2: Asset Allocation ───────────────────────────── */}
          <AssetAllocation positions={positionsA} quotes={quotesA} />
          <AssetAllocation positions={positionsB} quotes={quotesB} />

          {/* ── Row 3: Held Positions ─────────────────────────────── */}
          <PositionsTable portfolioId="A" />
          <PositionsTable portfolioId="B" />

        </div>
      </main>
    </div>
  );
}
