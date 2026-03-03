"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pct(n: number) {
  return n.toFixed(1) + "%";
}

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  borderColor: "rgba(99,102,241,0.3)",
  borderRadius: "6px",
  color: "#e2e8f0",
  fontSize: "12px",
};

interface YearRow { year: number; p10: number; p25: number; p50: number; p75: number; p90: number; }
interface MCData { type: string; meta: Record<string, number>; summary: Record<string, number>; results: YearRow[]; }

function MonteCarloResults({ data }: { data: MCData }) {
  const { meta, summary, results } = data;

  // Build chart data: each point is a year with [p10,p25] band, [p25,p50] band, [p50,p75] band, [p75,p90] band
  const chartData = results.map((r: YearRow) => ({
    year: r.year,
    // For recharts area stacking we pass absolute values
    p10:  r.p10,
    p25:  r.p25,
    p50:  r.p50,
    p75:  r.p75,
    p90:  r.p90,
    // Band: p10→p25
    band10_25: [r.p10, r.p25] as [number, number],
    // Band: p25→p75 (IQR)
    band25_75: [r.p25, r.p75] as [number, number],
    // Band: p75→p90
    band75_90: [r.p75, r.p90] as [number, number],
  }));

  const successColor = meta.successRate >= 90 ? "text-green-400" : meta.successRate >= 70 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Summary stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Success Rate", value: pct(meta.successRate), color: successColor },
          { label: "10th Percentile", value: `$${fmt(summary.p10)}` },
          { label: "25th Percentile", value: `$${fmt(summary.p25)}` },
          { label: "Median (50th)", value: `$${fmt(summary.median)}`, bold: true },
          { label: "75th Percentile", value: `$${fmt(summary.p75)}` },
        ].map((s) => (
          <div key={s.label} className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/50">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className={`text-sm font-semibold ${s.color ?? "text-slate-100"} ${s.bold ? "text-base" : ""}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Percentile band chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            width={64}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number | undefined, name: string | undefined) => {
              const labels: Record<string, string> = {
                p90: "90th percentile",
                p75: "75th percentile",
                p50: "Median (50th)",
                p25: "25th percentile",
                p10: "10th percentile",
              };
              return [`$${fmt(value ?? 0)}`, labels[name ?? ""] ?? name ?? ""];
            }}
          />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                p90: "90th %ile",
                p75: "75th %ile",
                p50: "Median",
                p25: "25th %ile",
                p10: "10th %ile",
              };
              return <span style={{ color: "#94a3b8", fontSize: 12 }}>{labels[value] ?? value}</span>;
            }}
          />
          {/* Outer shaded band: 10th to 90th */}
          <Area type="monotone" dataKey="p90" stroke="none" fill="#6366f1" fillOpacity={0.10} legendType="none" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#0f172a" fillOpacity={1} legendType="none" />
          {/* Middle shaded band: 25th to 75th */}
          <Area type="monotone" dataKey="p75" stroke="none" fill="#6366f1" fillOpacity={0.20} legendType="none" />
          <Area type="monotone" dataKey="p25" stroke="none" fill="#0f172a" fillOpacity={1} legendType="none" />
          {/* Percentile lines */}
          <Line type="monotone" dataKey="p90" stroke="#a78bfa" strokeWidth={1} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="p75" stroke="#818cf8" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="p50" stroke="#e2e8f0" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="p25" stroke="#818cf8" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="p10" stroke="#a78bfa" strokeWidth={1} dot={false} strokeDasharray="4 2" />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Model info */}
      <div className="text-xs text-slate-500 space-y-0.5 border-t border-slate-700/50 pt-3">
        <p>Model: Geometric Brownian Motion &mdash; Statistical returns based on full available history.</p>
        <p>
          Historical annual return: <span className="text-slate-400">{pct(meta.annualMeanReturn * 100)}</span>
          &nbsp;&nbsp;Volatility (σ): <span className="text-slate-400">{pct(meta.annualStdDev * 100)}</span>
          &nbsp;&nbsp;Initial amount: <span className="text-slate-400">${fmt(meta.initialAmount)}</span>
          {meta.annualWithdrawal > 0 && (
            <>&nbsp;&nbsp;Annual withdrawal: <span className="text-slate-400">${fmt(meta.annualWithdrawal)}</span> (inflation {pct(meta.inflationRate * 100)})</>
          )}
        </p>
      </div>
    </div>
  );
}

interface IRData { type: string; results: { portfolioValueChange: number } }
interface DCFData { type: string; results: { intrinsicValue: number } }

export function SimulationResults({ data }: { data: MCData | IRData | DCFData | null }) {
  if (!data) return null;

  const type = (data as MCData).type;

  return (
    <Card className="bg-slate-800/40 border-slate-700/50">
      <CardHeader>
        <CardTitle>Simulation Results</CardTitle>
      </CardHeader>
      <CardContent>
        {type === "monte-carlo" && <MonteCarloResults data={data as MCData} />}
        {type === "interest-rate" && (() => {
          const d = data as IRData;
          return (
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Estimated portfolio value change under the given interest rate shift.</p>
              <p className="text-2xl font-bold text-slate-100">
                {d.results.portfolioValueChange >= 0 ? "+" : ""}
                {d.results.portfolioValueChange.toFixed(2)}%
              </p>
            </div>
          );
        })()}
        {type === "dcf" && (() => {
          const d = data as DCFData;
          return (
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Estimated intrinsic value of the portfolio based on discounted future earnings.</p>
              <p className="text-2xl font-bold text-slate-100">
                ${d.results.intrinsicValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
