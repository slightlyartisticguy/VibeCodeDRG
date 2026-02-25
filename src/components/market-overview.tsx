/**
 * Market Overview component.
 * Displays major world market indices grouped by region.
 * Lets users explore US, European, and Asian markets.
 */
"use client";

import { TrendingUp, TrendingDown, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkets } from "@/hooks/use-market-data";

/**
 * Format a number as USD currency with compact notation for large values.
 */
function formatPrice(value: number): string {
  if (value === 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function MarketOverview() {
  const { data: markets = [], isLoading, error } = useMarkets();

  const regions = ["US", "Europe", "Asia"];

  const getMarketsByRegion = (region: string) =>
    markets.filter((m) => m.region === region);

  return (
    <Card className="border-2 border-blue-900/50 bg-[#262626]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-slate-100">Market Overview</h2>
        </div>
        <p className="text-sm text-slate-400">
          Explore major markets around the world
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center text-sm text-red-400">
            Failed to load market data. Please check your Finnhub API key in the
            .env.local file.
          </div>
        ) : (
          <Tabs defaultValue="US">
            <TabsList className="mb-4 bg-[#1a1a1a] border border-slate-700">
              {regions.map((region) => (
                <TabsTrigger
                  key={region}
                  value={region}
                  className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  {region}
                </TabsTrigger>
              ))}
            </TabsList>

            {regions.map((region) => (
              <TabsContent key={region} value={region}>
                <div className="grid gap-3">
                  {getMarketsByRegion(region).map((market) => {
                    const isPositive = market.change >= 0;
                    return (
                      <div
                        key={market.symbol}
                        className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-[#1a1a1a] p-4 transition-colors hover:border-slate-600"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-slate-200">
                            {market.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">
                            {market.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-200 font-mono">
                            {formatPrice(market.currentPrice)}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 text-xs font-mono ${
                              isPositive ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>
                              {isPositive ? "+" : ""}
                              {market.change.toFixed(2)} (
                              {market.percentChange.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {getMarketsByRegion(region).length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No market data available for this region.
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
