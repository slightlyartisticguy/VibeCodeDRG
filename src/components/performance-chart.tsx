/**
 * Portfolio Performance Chart component.
 * Displays a line chart of portfolio value over time with period toggles.
 * Uses Recharts for rendering, styled to match the dark theme from Figma.
 */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useHistoricalData, usePortfolioHistory } from "@/hooks/use-market-data";
import type { TimePeriod } from "@/lib/types";

const PERIODS: TimePeriod[] = ["1M", "6M", "1Y", "ALL"];

interface PerformanceChartProps {
  /** Symbol to display historical data for. Defaults to SPY (S&P 500 ETF). */
  symbol?: string;
  /** Chart title */
  title?: string;
  /** Reduces chart height and font sizes for side-by-side layouts */
  compact?: boolean;
  /** Called when the user submits a new symbol via the inline input */
  onSymbolChange?: (symbol: string) => void;
  /** When true, shows an 'Add assets to portfolio' disclaimer instead of the chart */
  empty?: boolean;
  /** When set, chart shows portfolio $10,000 growth instead of individual stock price */
  portfolioId?: "A" | "B";
}

/**
 * Formats a raw ISO date string for the X-axis tick label based on period.
 * - 1M / 6M : daily granularity  — "Jan 15"
 * - 1Y      : monthly labels    — "Jan '25"
 * - ALL     : yearly labels     — "2021"
 */
function formatTickDate(
  dateStr: string,
  period: TimePeriod,
  fullRangeYears?: number
): string {
  const date = new Date(dateStr + "T12:00:00");
  if (period === "1M" || period === "6M") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (period === "1Y") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }
  // For "ALL", decide format based on range
  if (fullRangeYears && fullRangeYears <= 2) {
    // e.g., "Jan '23"
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }
  // e.g., "2021"
  return date.getFullYear().toString();
}

/**
 * Formats a raw ISO date string for the tooltip (full human-readable date).
 */
function formatTooltipDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Custom tooltip for the chart
 */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { startPrice: number; isPortfolio?: boolean } }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  const price = payload[0].value;
  const startPrice = payload[0].payload.startPrice;
  const isPortfolio = payload[0].payload.isPortfolio;
  const pctChange = startPrice ? ((price - startPrice) / startPrice) * 100 : null;
  const isPositive = pctChange !== null && pctChange >= 0;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <div className="rounded-lg border border-slate-700 bg-[#1a1a1a] px-5 py-4 shadow-xl min-w-[200px]">
      <p className="text-xl text-slate-300 mb-1">{formatTooltipDate(label)}</p>
      <p className="text-2xl font-bold text-white">{formattedPrice}</p>
      {pctChange !== null && (
        <p className={`text-lg font-semibold mt-1 ${
          isPositive ? "text-emerald-400" : "text-red-400"
        }`}>
          {isPositive ? "+" : ""}{pctChange.toFixed(2)}% {isPortfolio ? "total return" : "from period start"}
        </p>
      )}
    </div>
  );
}

export function PerformanceChart({
  symbol = "SPY",
  title = "Portfolio Performance",
  compact = false,
  onSymbolChange,
  empty = false,
  portfolioId,
}: PerformanceChartProps) {
  const isPortfolioMode = !!portfolioId;
  const [symbolInput, setSymbolInput] = useState(symbol);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input in sync if the parent changes the symbol externally
  useEffect(() => { setSymbolInput(symbol); }, [symbol]);

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = symbolInput.trim().toUpperCase();
    if (trimmed && trimmed !== symbol) onSymbolChange?.(trimmed);
  };
  const [period, setPeriod] = useState<TimePeriod>("6M");

  // Portfolio mode: fetch portfolio $10K growth series
  const { data: portfolioResult, isLoading: portfolioLoading, error: portfolioError } =
    usePortfolioHistory(portfolioId, period);

  // Symbol mode: fetch individual stock historical data
  const { data: historicalResult, isLoading: symbolLoading, error: symbolError } = useHistoricalData(
    isPortfolioMode ? "" : symbol,
    period
  );

  const isLoading = isPortfolioMode ? portfolioLoading : symbolLoading;
  const error = isPortfolioMode ? portfolioError : symbolError;

  const historicalData = useMemo(
    () => historicalResult?.prices ?? [],
    [historicalResult?.prices]
  );

  // Keep rawDate as the XAxis dataKey so ticks can be computed precisely
  // startPrice is embedded in each point so the tooltip can compute % change
  const chartData = useMemo(() => {
    // ── Portfolio mode: normalised $10K growth series ──
    if (isPortfolioMode) {
      const data = portfolioResult?.data ?? [];
      if (data.length === 0) return [];
      return data.map((d) => ({
        rawDate: d.date,
        price: d.value,
        startPrice: 10000,
        isPortfolio: true,
      }));
    }

    // ── Symbol mode: individual stock price ──
    if (!historicalData || historicalData.length === 0) return [];

    let trimmedData = historicalData;

    if (period === "ALL" && historicalData.length > 0) {
      const allPrices = historicalData.map((d) => d.close);
      const priceMin = Math.min(...allPrices);
      const priceMax = Math.max(...allPrices);
      const priceRange = priceMax - priceMin;

      // Only trim if the price range is significant relative to the starting price.
      // A 10x multiplier means the stock must have grown to at least 10x its
      // initial value before we consider trimming the flat early data.
      const SIGNIFICANT_RANGE_MULTIPLIER = 10;
      const isSignificantRange =
        priceRange > historicalData[0].close * SIGNIFICANT_RANGE_MULTIPLIER;

      if (isSignificantRange) {
        // Trim leading flat data where price stays within the bottom 5% of range
        const ACTIVITY_THRESHOLD = priceRange * 0.05;

        const firstActiveIndex = historicalData.findIndex(
          (d) =>
            Math.abs(d.close - historicalData[0].close) > ACTIVITY_THRESHOLD
        );

        if (firstActiveIndex > 1) {
          // Step back a small buffer so we see the run-up to activity
          const lookbackBuffer = Math.max(
            0,
            firstActiveIndex - Math.floor(historicalData.length * 0.02)
          );
          trimmedData = historicalData.slice(lookbackBuffer);
        }
      }
    }

    const startPrice = trimmedData[0]?.close ?? 0;
    return trimmedData.map((d) => ({
      rawDate: d.date,
      price: d.close,
      startPrice,
      isPortfolio: false,
    }));
  }, [isPortfolioMode, portfolioResult?.data, historicalData, period]);

  /** Y-axis domain fitted to the visible period with 5% padding */
  const yDomain = useMemo((): [number, number] => {
    if (chartData.length === 0) return [0, 0];
    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.05 || max * 0.01;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  /**
   * Compute which tick values (rawDate strings) to display on the X-axis:
   * - 1M  : every 3rd trading day
   * - 6M  : first trading day of each month
   * - 1Y  : first trading day of each month (12 ticks)
   * - ALL : first trading day of each calendar year
   */
  const fullRangeYears = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = new Date(chartData[0].rawDate);
    const last = new Date(chartData[chartData.length - 1].rawDate);
    return last.getFullYear() - first.getFullYear();
  }, [chartData]);

  /**
   * Compute which tick values (rawDate strings) to display on the X-axis:
   * - 1M  : every 3rd trading day
   * - 6M  : first trading day of each month
   * - 1Y  : first trading day of each month (12 ticks)
   * - ALL : depends on range (yearly for >2yr, monthly for <=2yr)
   */
  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    if (period === "1M") {
      return chartData
        .filter((_, i) => i % 3 === 0 || i === chartData.length - 1)
        .map((d) => d.rawDate);
    }
    if (period === "6M" || period === "1Y" || (period === "ALL" && fullRangeYears <= 2)) {
      const seen = new Set<string>();
      return chartData
        .filter((d) => {
          const month = d.rawDate.substring(0, 7);
          if (!seen.has(month)) {
            seen.add(month);
            return true;
          }
          return false;
        })
        .map((d) => d.rawDate);
    }
    // ALL with >2yr range — one label per year
    const seen = new Set<string>();
    return chartData
      .filter((d) => {
        const year = d.rawDate.substring(0, 4);
        if (!seen.has(year)) {
          seen.add(year);
          return true;
        }
        return false;
      })
      .map((d) => d.rawDate);
  }, [chartData, period, fullRangeYears]);

  const subtitle = useMemo(() => {
    const periodLabels: Record<TimePeriod, string> = {
      "1M": "1 month",
      "6M": "6 months",
      "1Y": "1 year",
      ALL: "all time",
    };
    if (isPortfolioMode) {
      return `Growth of $10,000 over ${period === "ALL" ? "all time" : `the last ${periodLabels[period]}`}`;
    }
    return `Investment growth over the last ${periodLabels[period]}`;
  }, [period, isPortfolioMode]);

  const xAxisLabel = useMemo(() => {
    if (isPortfolioMode) {
      const firstDate = portfolioResult?.firstAvailableDate;
      if (!firstDate) return "";
      return `Data since ${formatTooltipDate(firstDate)}`;
    }
    const firstDate = historicalResult?.firstAvailableDate;
    if (!firstDate) return "";
    return `Data since ${formatTooltipDate(firstDate)}`;
  }, [isPortfolioMode, portfolioResult?.firstAvailableDate, historicalResult?.firstAvailableDate]);

  // Unique gradient id prevents two charts on the same page from sharing one gradient
  const gradientId = `priceGradient-${symbol}`;

  return (
    <Card className="border-2 border-blue-900/50 bg-[#262626]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className={`font-bold text-slate-100 ${compact ? "text-xl" : "text-3xl"}`}>{title}</h2>
            <p className={`text-slate-400 ${compact ? "text-sm" : "text-lg"}`}>{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Inline symbol selector */}
            {onSymbolChange && (
              <form onSubmit={handleSymbolSubmit} className="flex items-center">
                <input
                  ref={inputRef}
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  onBlur={handleSymbolSubmit}
                  maxLength={10}
                  aria-label="Change symbol"
                  className={`w-24 rounded-l-lg border border-slate-700 bg-[#1a1a1a] px-2 font-mono text-blue-400 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${compact ? "py-1 text-sm" : "py-2 text-base"}`}
                />
                <button
                  type="submit"
                  className={`rounded-r-lg border border-l-0 border-slate-700 bg-blue-600 px-2 text-white hover:bg-blue-500 transition-colors ${compact ? "py-1 text-xs" : "py-2 text-sm"}`}
                >
                  Go
                </button>
              </form>
            )}
            <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-[#1a1a1a] p-1.5" role="group" aria-label="Select time period">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  aria-pressed={period === p}
                  aria-label={`Show ${p} period`}
                  className={`rounded-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    compact ? "px-3 py-1 text-sm" : "px-5 py-2 text-lg"
                  } ${
                    period === p
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {empty ? (
          <div
            className="flex flex-col items-center justify-center gap-2 text-center"
            style={{ height: compact ? 280 : 480 }}
          >
            <p className="text-base font-medium text-slate-400">
              Add assets to portfolio
            </p>
            <p className="text-xs text-slate-600">
              Use the positions panel below to add holdings to this portfolio.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex h-96 items-center justify-center" role="status" aria-label="Loading chart data">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="sr-only">Loading chart data…</span>
          </div>
        ) : error ? (
          <div className="flex h-96 items-center justify-center text-sm text-red-400" role="alert">
            Failed to load chart data. The data source may be unavailable.
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-96 items-center justify-center text-sm text-slate-400" role="status">
            No data available for {symbol}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={compact ? 280 : 480}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="rawDate"
                ticks={xAxisTicks}
                tickFormatter={(val: string) =>
                  formatTickDate(val, period, fullRangeYears)
                }
                tick={{ fill: "#94a3b8", fontSize: compact ? 11 : 16, fontFamily: "monospace" }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                interval={0}
                label={{
                  value: xAxisLabel,
                  position: "insideBottomLeft",
                  dy: 20,
                  fill: "#94a3b8",
                  fontSize: compact ? 10 : 13,
                }}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: "#94a3b8", fontSize: compact ? 11 : 16, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val: number) => {
                const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
                return `$${fmt.format(val)}`;
              }}
                width={compact ? 68 : 96}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
