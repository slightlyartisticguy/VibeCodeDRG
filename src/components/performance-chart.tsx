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
 * Formats a date string based on the selected period.
 */
function formatDate(dateStr: string, period: TimePeriod): string {
  const date = new Date(dateStr);
  if (period === "1M") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
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
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-[#1a1a1a] px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-emerald-400">
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export function PerformanceChart({
  symbol = "SPY",
  title = "Portfolio Performance",
}: PerformanceChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("6M");
  const { data: historicalData, isLoading, error } = useHistoricalData(symbol, period);

  const chartData = useMemo(() => {
    if (!historicalData) return [];
    return historicalData.map((d) => ({
      date: formatDate(d.date, period),
      rawDate: d.date,
      price: d.close,
    }));
  }, [historicalData, period]);

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
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-[#1a1a1a] p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  period === p
                    ? "bg-blue-500 text-slate-100"
                    : "text-slate-500 hover:text-slate-300"
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
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center text-sm text-red-400">
            Failed to load chart data. The data source may be unavailable.
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No data available for {symbol}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
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
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 12, fontFamily: "monospace" }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val: number) => `$${val}`}
                width={60}
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
