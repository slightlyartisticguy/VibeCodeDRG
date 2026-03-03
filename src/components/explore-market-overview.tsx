"use client";

import { useState } from "react";
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

function MarketDetailPanel({
  etfSymbol,
  onSymbolSelect,
}: {
  etfSymbol: string;
  onSymbolSelect?: (symbol: string) => void;
}) {
  const { data, isLoading, error } = useEtfDetails(etfSymbol);
  const [hoveredHolding, setHoveredHolding] = useState<string | null>(null);
  const [activeHolding, setActiveHolding] = useState<string | null>(null);
  const [hoveredSector, setHoveredSector] = useState<{
    name: string;
    value: number;
    fill: string;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  if (isLoading) {
    return <div className="py-8 text-center text-slate-400">Loading details…</div>;
  }

  if (error || !data) {
    return <div className="py-8 text-center text-red-400">Failed to load ETF details.</div>;
  }

  const holdings = data.topHoldings?.holdings || [];
  const description = data.assetProfile?.longBusinessSummary || "";

  // Sector breakdown: sectorWeightings is Array<{[sector: string]: number}>
  // Flatten each single-key object into [name, value] pairs
  const sectorWeightings = Array.isArray(data.topHoldings?.sectorWeightings)
    ? (data.topHoldings!.sectorWeightings as Array<Record<string, number>>)
        .flatMap((item) => Object.entries(item))
        .filter(([, v]) => typeof v === "number" && v > 0)
        .map(([name, value], i) => ({
          name: name
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
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
          <div className="space-y-1">
            {holdings.slice(0, 10).map((h, i) => {
              const sym = h.symbol as string | undefined;
              const isHovered = hoveredHolding === (sym ?? String(i));
              const isActive = activeHolding === (sym ?? String(i));
              return (
                <div
                  key={sym || i}
                  className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${
                    isActive
                      ? "bg-blue-600/25 ring-1 ring-blue-500/50"
                      : isHovered
                      ? "bg-slate-700/50"
                      : ""
                  } ${onSymbolSelect && sym ? "cursor-pointer" : ""}`}
                  onMouseEnter={() => setHoveredHolding(sym ?? String(i))}
                  onMouseLeave={() => setHoveredHolding(null)}
                  onClick={() => {
                    if (onSymbolSelect && sym) {
                      setActiveHolding(sym);
                      onSymbolSelect(sym);
                    }
                  }}
                >
                  <span className="text-xs text-slate-500 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm truncate transition-colors ${
                          isActive ? "text-blue-300 font-semibold" : isHovered ? "text-slate-100" : "text-slate-200"
                        }`}
                      >
                        {h.holdingName || sym}
                      </span>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {sym && (
                          <span className="text-[10px] font-mono text-slate-500">{sym}</span>
                        )}
                        <span className="text-sm font-mono text-slate-400">
                          {(h.holdingPercent * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isActive ? "bg-blue-400" : isHovered ? "bg-blue-400" : "bg-blue-500"
                        }`}
                        style={{ width: `${(h.holdingPercent / (holdings[0]?.holdingPercent || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  {isHovered && onSymbolSelect && sym && (
                    <span className="text-[10px] text-blue-400 shrink-0 font-medium">
                      {isActive ? "charted" : "chart →"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Treemap */}
        <div className="relative">
          <h3 className="text-lg font-bold text-slate-100 mb-3">Sector Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <Treemap
              data={[...sectorWeightings].sort((a, b) => b.value - a.value)}
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
                index,
              }: {
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                name?: string;
                value?: number;
                fill?: string;
                index?: number;
              }) => {
                if (!width || !height || width < 4 || height < 4) return <g />;

                const cx = (x ?? 0) + (width ?? 0) / 2;
                const cy = (y ?? 0) + (height ?? 0) / 2;
                const clipId = `clip-sector-${index ?? 0}`;
                const isHovered = hoveredSector?.name === name;

                const showName = width > 48 && height > 38;
                const showValue = width > 28 && height > 20;

                const nameFontSize = Math.min(12, Math.max(9, Math.floor(width / 8)));
                const valueFontSize = Math.min(11, Math.max(8, Math.floor(width / 9)));

                const maxChars = Math.max(3, Math.floor((width - 6) / (nameFontSize * 0.6)));
                const displayName =
                  (name ?? "").length > maxChars
                    ? (name ?? "").slice(0, maxChars - 1) + "…"
                    : (name ?? "");

                const nameY = showValue ? cy - valueFontSize : cy + nameFontSize * 0.35;
                const valueY = showName ? cy + nameFontSize * 0.6 : cy;

                return (
                  <g
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      setHoveredSector({
                        name: name ?? "",
                        value: value ?? 0,
                        fill: fill as string,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                      })
                    }
                    onMouseMove={(e) =>
                      setHoveredSector((prev) =>
                        prev ? { ...prev, mouseX: e.clientX, mouseY: e.clientY } : null
                      )
                    }
                    onMouseLeave={() => setHoveredSector(null)}
                  >
                    <defs>
                      <clipPath id={clipId}>
                        <rect
                          x={(x ?? 0) + 2}
                          y={(y ?? 0) + 2}
                          width={Math.max(0, (width ?? 0) - 4)}
                          height={Math.max(0, (height ?? 0) - 4)}
                        />
                      </clipPath>
                    </defs>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: fill as string,
                        stroke: isHovered ? "#fff" : "#0f172a",
                        strokeWidth: isHovered ? 2 : 2,
                        filter: isHovered ? "brightness(1.35)" : undefined,
                        transition: "filter 0.15s ease",
                      }}
                      rx={3}
                    />
                    <g clipPath={`url(#${clipId})`}>
                      {showName && (
                        <text
                          x={cx}
                          y={nameY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#fff"
                          fontSize={nameFontSize}
                          fontWeight="600"
                          style={{ pointerEvents: "none" }}
                        >
                          {displayName}
                        </text>
                      )}
                      {showValue && (
                        <text
                          x={cx}
                          y={valueY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="rgba(255,255,255,0.8)"
                          fontSize={valueFontSize}
                          style={{ pointerEvents: "none" }}
                        >
                          {value}%
                        </text>
                      )}
                    </g>
                  </g>
                );
              }}
            />
          </ResponsiveContainer>

          {/* Fixed hover tooltip — renders outside the SVG so text can overflow freely */}
          {hoveredSector && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: hoveredSector.mouseX + 14,
                top: hoveredSector.mouseY - 44,
              }}
            >
              <div
                className="rounded-lg px-3 py-2 shadow-xl border border-white/10 backdrop-blur-sm"
                style={{ background: hoveredSector.fill }}
              >
                <p className="text-sm font-bold text-white leading-tight">
                  {hoveredSector.name}
                </p>
                <p className="text-xl font-black text-white/90 tabular-nums">
                  {hoveredSector.value}%
                </p>
              </div>
            </div>
          )}
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
                onSymbolSelect={onMarketSelect}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

