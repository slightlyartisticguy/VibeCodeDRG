"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { PerformanceChart } from "@/components/performance-chart";
import { ExploreMarketOverview } from "@/components/explore-market-overview";

export default function ExplorePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("SPY");

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Bar Header */}
      <Header onSymbolSelect={handleSymbolSelect} />
      
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="w-full space-y-6 pb-8">
          <div className="flex items-center justify-between px-4 lg:px-8">
            <h1 className="text-2xl font-bold text-white">Explore Markets</h1>
          </div>

          {/* Historical Data Chart */}
          <div className="w-full px-4 lg:px-8">
            <PerformanceChart
              symbol={selectedSymbol}
              title={`Historical Performance: ${selectedSymbol}`}
            />
          </div>

          {/* Market Overview by Region */}
          <div className="pt-2 px-4 lg:px-8">
            <ExploreMarketOverview 
                onMarketSelect={handleSymbolSelect} 
                selectedSymbol={selectedSymbol}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
