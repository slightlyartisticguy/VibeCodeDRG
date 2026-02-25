'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { INTERNATIONAL_MARKETS, type MarketIndex, type RegionalMarkets } from '@/data/internationalMarkets';
import { MARKET_CAP_REFERENCE } from '@/data/marketMetadata';
import { useBatchMarketQuotes } from '@/hooks/useBundledStockData';
import type { StockQuote } from '@/types';
import type { ETFHolding } from '@/services';

// ── Collect all ETF symbols used across every region ────────────────────
const ALL_ETF_SYMBOLS = INTERNATIONAL_MARKETS.flatMap((r) =>
  r.markets.map((m) => m.trackingETF)
);

// ── MarketCard ──────────────────────────────────────────────────────────

interface MarketCardProps {
  market: MarketIndex;
  quote?: StockQuote;
  isLoading: boolean;
}

function MarketCard({ market, quote, isLoading }: MarketCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Merge live quote data into the static market structure
  const displayValue = quote?.price ?? market.value;
  const displayChange = quote?.change ?? market.change;
  const displayChangePercent = quote?.changePercent ?? market.changePercent;
  const displayMarketCap = MARKET_CAP_REFERENCE[market.trackingETF] ?? market.marketCap;
  const isPositive = displayChange >= 0;
  const holdings = market.topHoldings ?? [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{market.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {market.region}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {displayValue.toLocaleString('en-US', {
                  maximumFractionDigits: displayValue > 1000 ? 0 : 2,
                })}{' '}
                {market.currency}
              </div>
              <div
                className={`text-xs flex items-center gap-2 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span>
                  {isPositive ? '+' : ''}
                  {displayChange.toFixed(2)}
                </span>
                <span>
                  ({isPositive ? '+' : ''}
                  {displayChangePercent.toFixed(2)}%)
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Market Cap: ${displayMarketCap.toLocaleString()}B
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hover Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 top-0 left-full ml-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-80 max-w-96 transform-gpu">
          <div className="space-y-3">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {market.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {market.region} • {market.currency}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tracked by: {market.trackingETF}
              </p>
            </div>

            {/* Market Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Trading Hours:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {market.marketInfo.tradingHours}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Companies:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {market.marketInfo.totalCompanies.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Holdings */}
            <div>
              <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">
                Top 5 Holdings from {market.trackingETF}
              </h4>
              {holdings.length > 0 ? (
                <div className="space-y-1">
                  {holdings.slice(0, 5).map((holding, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {holding.symbol}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 truncate">
                          {holding.name}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {holding.weight.toFixed(2)}%
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">{holding.sector}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                  No holdings data available
                </div>
              )}
            </div>

            {/* Current Performance */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current Value:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {displayValue.toLocaleString('en-US', {
                    maximumFractionDigits: displayValue > 1000 ? 0 : 2,
                  })}{' '}
                  {market.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Daily Change:</span>
                <span
                  className={`font-medium ${
                    isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {displayChange.toFixed(2)} ({isPositive ? '+' : ''}
                  {displayChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RegionalSection ─────────────────────────────────────────────────────

interface RegionalSectionProps {
  regionalData: RegionalMarkets;
  quoteMap: Record<string, StockQuote | undefined>;
  isLoading: boolean;
}

function RegionalSection({ regionalData, quoteMap, isLoading }: RegionalSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
        {regionalData.region}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {regionalData.markets.map((market, index) => (
          <MarketCard
            key={index}
            market={market}
            quote={quoteMap[market.trackingETF]}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

// ── MarketIndices (top-level) ───────────────────────────────────────────

/**
 * MarketIndices component
 * Fetches ALL ETF tracking quotes in a single batch request instead of
 * making individual API calls per market.
 */
export function MarketIndices() {
  const { quoteMap, isLoading } = useBatchMarketQuotes(ALL_ETF_SYMBOLS);

  return (
    <div className="space-y-8">
      {INTERNATIONAL_MARKETS.map((regionalData, index) => (
        <RegionalSection
          key={index}
          regionalData={regionalData}
          quoteMap={quoteMap}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
