'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { getMarketSummary, getTopMovers } from '@/lib/stockData';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

export function MarketOverview() {
  const marketSummary = getMarketSummary();
  const { gainers, losers } = getTopMovers(3);

  const indices = [
    { name: 'S&P 500', data: marketSummary.sp500 },
    { name: 'NASDAQ', data: marketSummary.nasdaq },
    { name: 'Dow Jones', data: marketSummary.dow },
  ];

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div className="grid grid-cols-3 gap-4">
        {indices.map((index) => {
          const isPositive = index.data && index.data.change >= 0;
          return (
            <div
              key={index.name}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-1">{index.name}</p>
              <p className="text-xl font-bold text-gray-900">
                {index.data ? formatCurrency(index.data.value) : 'N/A'}
              </p>
              {index.data && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium mt-1',
                    isPositive ? 'text-success-600' : 'text-danger-600'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(index.data.change)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Top Movers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gainers */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-success-50">
            <h3 className="font-semibold text-success-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Gainers
            </h3>
          </div>
          <div className="divide-y">
            {gainers.map((stock) => (
              <div
                key={stock.symbol}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-500 truncate max-w-32">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(stock.price)}</p>
                  <p className="text-sm text-success-600 font-medium">
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-danger-50">
            <h3 className="font-semibold text-danger-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Top Losers
            </h3>
          </div>
          <div className="divide-y">
            {losers.map((stock) => (
              <div
                key={stock.symbol}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-500 truncate max-w-32">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(stock.price)}</p>
                  <p className="text-sm text-danger-600 font-medium">
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
