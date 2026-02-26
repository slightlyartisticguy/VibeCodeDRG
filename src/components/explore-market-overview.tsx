"use client";

import { useMarkets } from "@/hooks/use-market-data";
import { useEtfDetails } from "@/hooks/useEtfDetails";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Treemap,
} from "recharts";



// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(value: number): string {
  if (value === 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

const REGION_MAP: Record<string, string> = {
  US: "United States",
  Europe: "Europe",
  Asia: "Asia-Pacific",
};

const MARKET_TRACKING_MAP: Record<string, string> = {
  "^GSPC": "SPY",
  "^DJI": "DIA",
  "^IXIC": "QQQ",
  "^FTSE": "EWU",
  "^GDAXI": "EWG",
  "^FCHI": "EWQ",
  "^N225": "EWJ",
  "^HSI": "EWH",
  "000001.SS": "FXI",
};

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16", "#06b6d4",
];

// ---------------------------------------------------------------------------
// Expanded detail panel
// ---------------------------------------------------------------------------

function MarketDetailPanel({ etfSymbol }: { etfSymbol: string }) {
  const { data, isLoading, error } = useEtfDetails(etfSymbol);

  if (isLoading) {
    return <div className="py-8 text-center text-slate-400">Loading details…</div>;
  }

  if (error || !data) {
    return <div className="py-8 text-center text-red-400">Failed to load ETF details.</div>;
  }

  const holdings = data.topHoldings?.holdings || [];
  const description = data.assetProfile?.longBusinessSummary || "";

  // Sector breakdown: convert sectorWeightings object to array
  const sectorWeightings = data.topHoldings?.sectorWeightings
    ? Object.entries(data.topHoldings.sectorWeightings)
        .filter(([, v]) => v > 0)
        .map(([name, value], i) => ({
          name,
          value: parseFloat((value * 100).toFixed(2)),
          fill: PIE_COLORS[i % PIE_COLORS.length],
        }))
    : [];

  // Asset type composition
  const assetTypes = [
    data.topHoldings?.stockPosition
      ? { name: "Stocks", value: parseFloat((data.topHoldings.stockPosition * 100).toFixed(2)) }
      : null,
    data.topHoldings?.bondPosition
      ? { name: "Bonds", value: parseFloat((data.topHoldings.bondPosition * 100).toFixed(2)) }
      : null,
    data.topHoldings?.cashPosition
      ? { name: "Cash", value: parseFloat((data.topHoldings.cashPosition * 100).toFixed(2)) }
      : null,
  ].filter((item): item is { name: string; value: number } => item !== null && item.value > 0);

  return (
    <div className="mt-4 rounded-xl border border-blue-500/40 bg-[#131e2e] p-6 space-y-8">
      {/* Description */}
      <p className="text-base text-slate-300 leading-relaxed">{description}</p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top 10 Holdings */}
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-3">Top 10 Holdings</h3>
          <div className="space-y-2">
            {holdings.slice(0, 10).map((h, i) => (
              <div key={h.symbol || i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-slate-200 truncate">{h.holdingName || h.symbol}</span>
                    <span className="text-sm font-mono text-slate-400 ml-2 shrink-0">
                      {(h.holdingPercent * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${(h.holdingPercent / (holdings[0]?.holdingPercent || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Treemap */}
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-3">Sector Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <Treemap
              data={sectorWeightings}
              dataKey="value"
              nameKey="name"
              content={({
                x,
                y,
                width,
                height,
                name,
                value,
                fill,
              }: {
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                name?: string;
                value?: number;
                fill?: string;
              }) => {
                if (!width || !height || width < 2 || height < 2) return <g />;
                const showLabel = width > 50 && height > 28;
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{ fill: fill as string, stroke: "#1a1a1a", strokeWidth: 2 }}
                      rx={4}
                    />
                    {showLabel && (
                      <>
                        <text
                          x={(x ?? 0) + (width ?? 0) / 2}
                          y={(y ?? 0) + (height ?? 0) / 2 - 8}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={12}
                          fontWeight="600"
                        >
                          {name}
                        </text>
                        <text
                          x={(x ?? 0) + (width ?? 0) / 2}
                          y={(y ?? 0) + (height ?? 0) / 2 + 8}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.75)"
                          fontSize={11}
                        >
                          {value}%
                        </text>
                      </>
                    )}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Asset Type Composition */}
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-3">Asset Type Composition</h3>
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={assetTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {assetTypes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(v) => [`${v}%`]}
                    contentStyle={{
                      background: "#1a1a1a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    itemStyle={{ color: "#e2e8f0" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {assetTypes.map((a, i) => (
                <div key={a.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-3 w-3 rounded-full shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300">{a.name}</span>
                  <span className="ml-auto font-mono text-slate-400 pl-4">{a.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Removed Country Exposure as it's not readily available in TopHoldings */}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ExploreMarketOverviewProps {
  onMarketSelect?: (symbol: string) => void;
  selectedSymbol?: string;
}

export function ExploreMarketOverview({
  onMarketSelect,
  selectedSymbol,
}: ExploreMarketOverviewProps) {
  const { data: markets = [], isLoading, error } = useMarkets();
  const regions = ["US", "Europe", "Asia"];

  const handleCardClick = (marketSymbol: string) => {
    if (onMarketSelect) {
      const trackingSymbol = MARKET_TRACKING_MAP[marketSymbol] || marketSymbol;
      onMarketSelect(trackingSymbol);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400" role="status" aria-label="Loading market data">
        <RefreshCcw className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading Market Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-center text-sm" role="alert">
        Failed to load market data using Finnhub API.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {regions.map((region) => {
        const regionMarkets = markets.filter((m) => m.region === region);
        const selectedInRegion = regionMarkets.find((m) => {
          const trackingSymbol = MARKET_TRACKING_MAP[m.symbol] || m.symbol;
          return selectedSymbol === trackingSymbol;
        });

        return (
          <div key={region} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-2">
              {REGION_MAP[region]}
            </h2>

            {/* Card grid — card sizes never change regardless of selection */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regionMarkets.map((market) => {
                const isPositive = market.change >= 0;
                const trackingSymbol = MARKET_TRACKING_MAP[market.symbol] || market.symbol;
                const isSelected = selectedSymbol === trackingSymbol;

                return (
                  <Card
                    key={market.symbol}
                    onClick={() => handleCardClick(market.symbol)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && handleCardClick(market.symbol)
                    }
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${market.name} — ${formatPrice(market.currentPrice)}, ${isPositive ? "up" : "down"} ${(market.percentChange ?? 0).toFixed(2)}%`}
                    className={`bg-[#1a1a1a] transition-all cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-[#1e293b]"
                        : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-100 leading-snug">
                            {market.name}
                          </CardTitle>
                          <CardDescription className="text-sm font-mono mt-1 text-slate-400">
                            {market.symbol}
                            <span className="ml-2 text-slate-600">via {trackingSymbol}</span>
                          </CardDescription>
                        </div>
                        <div className={`flex flex-col items-end shrink-0 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          <span className="text-lg font-bold font-mono">
                            {formatPrice(market.currentPrice)}
                          </span>
                          <div className="flex items-center text-sm font-medium">
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4 mr-1" aria-hidden="true" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" aria-hidden="true" />
                            )}
                            {(market.percentChange ?? 0).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                        {isSelected ? (
                          <span className="text-blue-400 font-medium">↑ Details expanded below</span>
                        ) : (
                          <span className="italic text-slate-500">Click to load details…</span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Full-width detail panel rendered below the grid, only when a card in this region is selected */}
            {selectedInRegion && (
              <MarketDetailPanel
                etfSymbol={MARKET_TRACKING_MAP[selectedInRegion.symbol] || selectedInRegion.symbol}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

