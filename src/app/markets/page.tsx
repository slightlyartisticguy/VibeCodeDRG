'use client';

/**
 * Markets Page
 * View market data, search for stocks/ETFs/index funds, and view details.
 * Uses batch API requests to fetch multiple quotes in a single call.
 */

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout';
import { MarketIndices, StockCard, StockCardSkeleton, StockChart, StockSearch, StockDetailPanel } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeSeries } from '@/hooks';
import { useBatchTrendingQuotes } from '@/hooks/useBundledStockData';

// Sample stock data for display
const TRENDING_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
];

interface SelectedSecurity {
  symbol: string;
  name: string;
  type: string;
}

export default function MarketsPage() {
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [selectedSecurity, setSelectedSecurity] = useState<SelectedSecurity | null>(null);

  // Batch-fetch all trending stock quotes in a single API call
  const { quotes: trendingQuotes, isLoading: isTrendingLoading } =
    useBatchTrendingQuotes(TRENDING_STOCKS);

  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useTimeSeries(
    selectedStock,
    'compact',
    true
  );

  const handleSelectSecurity = (entry: SelectedSecurity) => {
    setSelectedSecurity(entry);
    setSelectedStock(entry.symbol);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Markets" />

      <div className="p-6 space-y-6">
        {/* International Market Overview */}
        <MarketIndices />

        {/* Dedicated search bar for the markets page */}
        <div className="max-w-lg">
          <StockSearch
            onSelect={handleSelectSecurity}
            placeholder="Search stocks, ETFs, index funds..."
          />
        </div>

        {/* Selected Security Detail Panel */}
        {selectedSecurity && (
          <StockDetailPanel
            symbol={selectedSecurity.symbol}
            name={selectedSecurity.name}
            type={selectedSecurity.type}
            onClose={() => setSelectedSecurity(null)}
          />
        )}

        {/* Trending Stocks Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingQuotes.map((stock) =>
                isTrendingLoading ? (
                  <StockCardSkeleton key={stock.symbol} />
                ) : (
                  <StockCard
                    key={stock.symbol}
                    symbol={stock.symbol}
                    name={stock.quote ? stock.name : `${stock.name} (no data)`}
                    price={stock.quote?.price ?? 0}
                    change={stock.quote?.change ?? 0}
                    changePercent={stock.quote?.changePercent ?? 0}
                    onClick={() =>
                      handleSelectSecurity({
                        symbol: stock.symbol,
                        name: stock.name,
                        type: 'stock',
                      })
                    }
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Stock Chart */}
        <StockChart
          symbol={selectedStock}
          data={timeSeriesData ?? []}
          isLoading={isTimeSeriesLoading}
        />
      </div>
    </div>
  );
}
