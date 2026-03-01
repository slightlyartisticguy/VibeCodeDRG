/**
 * Asset Allocation donut chart component.
 * Shows breakdown of portfolio by asset type (equities, crypto, bonds, cash).
 * Styled to match the Figma design with a centered label.
 */
"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Position } from "@/lib/types";

/** Color mapping for asset types */
const ASSET_COLORS: Record<string, string> = {
  equity: "#3b82f6",   // Blue
  crypto: "#22c55e",   // Green
  bond: "#f59e0b",     // Amber
  cash: "#ef4444",     // Red
  fund: "#a855f7",     // Purple
};

const ASSET_LABELS: Record<string, string> = {
  equity: "Equities",
  crypto: "Crypto",
  bond: "Bonds",
  cash: "Cash",
  fund: "Mutual Funds",
};

interface AssetAllocationProps {
  positions: Position[];
  quotes: Record<string, { currentPrice: number } | null>;
}

export function AssetAllocation({ positions, quotes }: AssetAllocationProps) {
  const allocationData = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const pos of positions) {
      const price = quotes[pos.symbol]?.currentPrice ?? pos.avg_price;
      const value = pos.quantity * price;
      const type = pos.asset_type;
      totals[type] = (totals[type] || 0) + value;
    }

    const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);
    if (grandTotal === 0) return [];

    return Object.entries(totals).map(([type, value]) => ({
      name: ASSET_LABELS[type] || type,
      value,
      percentage: Math.round((value / grandTotal) * 100),
      color: ASSET_COLORS[type] || "#6b7280",
    }));
  }, [positions, quotes]);

  const totalAssets = positions.length;

  return (
    <Card className="border-2 border-blue-900/50 bg-[#262626]">
      <CardHeader className="pb-2">
        <h2 className="text-lg font-bold text-slate-100">Asset Allocation</h2>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {allocationData.length === 0 ? (
          <div className="flex h-48 w-48 items-center justify-center">
            <p className="text-sm text-slate-400">No positions yet</p>
          </div>
        ) : (
          <div className="relative h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400">Total Assets</span>
              <span className="text-lg font-medium text-slate-100 font-mono">
                {totalAssets}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="w-full space-y-3 px-4">
          {allocationData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-300">{entry.name}</span>
              </div>
              <span className="text-sm font-medium text-slate-100 font-mono">
                {entry.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
