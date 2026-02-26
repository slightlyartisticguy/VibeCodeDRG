/**
 * Portfolio Performance Chart component.
 * Displays a line chart of portfolio value over time with period toggles.
 * Uses Recharts for rendering, styled to match the dark theme from Figma.
 */
"use client";

import { useState, useMemo } from "react";
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
import { useHistoricalData } from "@/hooks/use-market-data";
import type { TimePeriod } from "@/lib/types";

const PERIODS: TimePeriod[] = ["1M", "6M", "1Y", "ALL"];

interface PerformanceChartProps {
  /** Symbol to display historical data for. Defaults to SPY (S&P 500 ETF). */
  symbol?: string;
  /** Chart title */
  title?: string;
}

/**
 * Formats a raw ISO date string for the X-axis tick label based on period.
 * - 1M / 6M : daily granularity  — "Jan 15"
 * - 1Y      : monthly labels    — "Jan '25"
 * - ALL     : yearly labels     — "2021"
 */
function formatTickDate(dateStr: string, period: TimePeriod): string {
  const date = new Date(dateStr + "T12:00:00");
  if (period === "1M" || period === "6M") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (period === "1Y") {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
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
  payload?: Array<{ value: number; payload: { startPrice: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  const price = payload[0].value;
  const startPrice = payload[0].payload.startPrice;
  const pctChange = startPrice ? ((price - startPrice) / startPrice) * 100 : null;
  const isPositive = pctChange !== null && pctChange >= 0;

  return (
    <div className="rounded-lg border border-slate-700 bg-[#1a1a1a] px-5 py-4 shadow-xl min-w-[200px]">
      <p className="text-xl text-slate-300 mb-1">{formatTooltipDate(label)}</p>
      <p className="text-2xl font-bold text-white">${price.toFixed(2)}</p>
      {pctChange !== null && (
        <p className={`text-lg font-semibold mt-1 ${
          isPositive ? "text-emerald-400" : "text-red-400"
        }`}>
          {isPositive ? "+" : ""}{pctChange.toFixed(2)}% from period start
        </p>
      )}
    </div>
  );
}

export function PerformanceChart({
  symbol = "SPY",
  title = "Portfolio Performance",
}: PerformanceChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("6M");
  const { data: historicalData, isLoading, error } = useHistoricalData(symbol, period);

  // Keep rawDate as the XAxis dataKey so ticks can be computed precisely
  // startPrice is embedded in each point so the tooltip can compute % change
  const chartData = useMemo(() => {
    if (!historicalData) return [];
    const startPrice = historicalData[0]?.close ?? 0;
    return historicalData.map((d) => ({
      rawDate: d.date,
      price: d.close,
      startPrice,
    }));
  }, [historicalData]);

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
  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    if (period === "1M") {
      return chartData
        .filter((_, i) => i % 3 === 0 || i === chartData.length - 1)
        .map((d) => d.rawDate);
    }
    if (period === "6M" || period === "1Y") {
      const seen = new Set<string>();
      return chartData
        .filter((d) => {
          const month = d.rawDate.substring(0, 7);
          if (!seen.has(month)) { seen.add(month); return true; }
          return false;
        })
        .map((d) => d.rawDate);
    }
    // ALL — one label per year
    const seen = new Set<string>();
    return chartData
      .filter((d) => {
        const year = d.rawDate.substring(0, 4);
        if (!seen.has(year)) { seen.add(year); return true; }
        return false;
      })
      .map((d) => d.rawDate);
  }, [chartData, period]);

  const subtitle = useMemo(() => {
    const periodLabels: Record<TimePeriod, string> = {
      "1M": "1 month",
      "6M": "6 months",
      "1Y": "1 year",
      ALL: "all time",
    };
    return `Investment growth over the last ${periodLabels[period]}`;
  }, [period]);

  return (
    <Card className="border-2 border-blue-900/50 bg-[#262626]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">{title}</h2>
            <p className="text-lg text-slate-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-[#1a1a1a] p-1.5" role="group" aria-label="Select time period">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                aria-label={`Show ${p} period`}
                className={`rounded-lg px-5 py-2 text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
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
          <ResponsiveContainer width="100%" height={480}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(val: string) => formatTickDate(val, period)}
                tick={{ fill: "#94a3b8", fontSize: 24, fontFamily: "monospace" }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: "#94a3b8", fontSize: 24, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val: number) => `$${val.toFixed(0)}`}
                width={112}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
