/**
 * Main dashboard page for the investment portfolio simulator.
 * Combines the performance chart, asset allocation, held positions,
 * and market overview into a single responsive layout.
 */
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { PerformanceChart } from "@/components/performance-chart";
import { AssetAllocation } from "@/components/asset-allocation";
import { PositionsTable } from "@/components/positions-table";
import { MarketOverview } from "@/components/market-overview";
import { usePositions, useMultipleQuotes } from "@/hooks/use-market-data";

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("SPY");
  const { data: positions = [] } = usePositions();
  const symbols = positions.map((p) => p.symbol);
  const { data: quotes = {} } = useMultipleQuotes(symbols);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header onSymbolSelect={handleSymbolSelect} />

      <main className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        {/* Top Section: Performance Chart + Asset Allocation */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <PerformanceChart
            symbol={selectedSymbol}
            title="Portfolio Performance"
          />
          <AssetAllocation positions={positions} quotes={quotes} />
        </div>

        {/* Middle Section: Held Positions Table */}
        <PositionsTable />

        {/* Bottom Section: Market Overview */}
        <MarketOverview />
      </main>
    </div>
  );
}
