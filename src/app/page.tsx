'use client';

import { useState } from 'react';
import { Header } from '@/components/layout';
import { MarketIndices, LiveStockCard, StockChart, StockSearch, StockDetailPanel } from '@/components/dashboard';
import { useTimeSeries } from '@/hooks';

const TRENDING_SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
];

interface SelectedSecurity {
  symbol: string;
  name: string;
  type: string;
}

export default function HomePage() {
  const [selectedSecurity, setSelectedSecurity] = useState<SelectedSecurity | null>(null);
  const selectedSymbol = selectedSecurity?.symbol ?? 'AAPL';

  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useTimeSeries(
    selectedSymbol,
    'compact',
    !!selectedSymbol
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        <MarketIndices />

        <div className="max-w-xl">
          <StockSearch
            onSelect={(entry) => setSelectedSecurity(entry)}
            placeholder="Search stocks, ETFs, index funds..."
          />
        </div>

        {selectedSecurity && (
          <StockDetailPanel
            symbol={selectedSecurity.symbol}
            name={selectedSecurity.name}
            type={selectedSecurity.type}
            onClose={() => setSelectedSecurity(null)}
          />
        )}

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Trending Stocks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRENDING_SYMBOLS.map(({ symbol, name }) => (
              <LiveStockCard
                key={symbol}
                symbol={symbol}
                name={name}
                onClick={() => setSelectedSecurity({ symbol, name, type: 'stock' })}
              />
            ))}
          </div>
        </section>

        <StockChart
          symbol={selectedSymbol}
          data={timeSeriesData ?? []}
          isLoading={isTimeSeriesLoading}
        />
      </div>
    </div>
  );
}