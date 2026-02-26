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
    <div className="flex flex-col h-full overflow-hidden">
      <Header onSymbolSelect={handleSymbolSelect} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
        <div className="mx-auto max-w-7xl space-y-6 pb-8">
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
        </div>
      </main>
    </div>
  );
}
