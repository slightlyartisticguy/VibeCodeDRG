"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Rocket,
  BarChart2,
  Users,
  Gem,
  Bitcoin,
  Landmark,
  Globe,
  Cpu,
  Stethoscope,
  Flame,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Factory,
  Layers,
  Zap,
  Building2,
  Radio,
  Microscope,
  Crown,
  Percent,
  Wind,
  Brain,
  PieChart,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ASSET_GROUPS,
  AVAILABLE_YEARS,
  SECTOR_FILTERS,
  MARKET_FILTERS,
  filterGroups,
  type AssetGroup,
  type SectorFilter,
  type MarketFilter,
} from "@/lib/explore-assets-data";
import { useAssetGroup } from "@/hooks/use-explore-assets";
import type { AssetPerformance } from "@/app/api/explore-assets/route";

// ---------------------------------------------------------------------------
// Icon registry
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  TrendingDown,
  Rocket,
  BarChart2,
  Users,
  Gem,
  Bitcoin,
  Landmark,
  Globe,
  Cpu,
  Stethoscope,
  Flame,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Factory,
  Layers,
  Zap,
  Building2,
  Radio,
  Microscope,
  Crown,
  Percent,
  Wind,
  Brain,
  PieChart,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatYearReturn(value: number | null): string {
  if (value === null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatVolume(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

function interpolateTitle(template: string, year: number): string {
  return template.replace(/\[year\]/g, String(year));
}

// ---------------------------------------------------------------------------
// Filter pill row
// ---------------------------------------------------------------------------

interface FilterPillsProps<T extends string> {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}

function FilterPills<T extends string>({ options, value, onChange }: FilterPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === opt
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Asset row in a card
// ---------------------------------------------------------------------------

function AssetRow({
  asset,
  sortBy,
  rank,
}: {
  asset: AssetPerformance;
  sortBy: "yearReturn" | "volume";
  rank: number;
}) {
  const isPositive = (asset.yearReturn ?? 0) >= 0;
  const returnColor =
    asset.yearReturn === null
      ? "text-slate-400"
      : isPositive
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-slate-700/50 last:border-0">
      {/* Rank */}
      <span className="text-xs text-slate-500 w-4 shrink-0">{rank}</span>

      {/* Symbol */}
      <span className="font-mono text-xs font-semibold text-blue-300 w-14 shrink-0 truncate">
        {asset.symbol}
      </span>

      {/* Name */}
      <span className="text-xs text-slate-400 flex-1 truncate">{asset.name}</span>

      {/* Metric value */}
      {sortBy === "volume" ? (
        <span className="text-xs text-slate-300 font-medium tabular-nums shrink-0">
          {formatVolume(asset.avgDailyVolume)}
        </span>
      ) : (
        <span className={`text-xs font-semibold tabular-nums shrink-0 ${returnColor}`}>
          {formatYearReturn(asset.yearReturn)}
        </span>
      )}

      {/* Current price */}
      <span className="text-xs text-slate-400 tabular-nums w-16 text-right shrink-0">
        {formatPrice(asset.endPrice)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Asset group card skeleton
// ---------------------------------------------------------------------------

function AssetGroupCardSkeleton({ group, year }: { group: AssetGroup; year: number }) {
  const IconComponent = ICON_MAP[group.icon] ?? TrendingUp;
  const title = interpolateTitle(group.title, year);

  return (
    <Card
      className={`bg-slate-800/60 border-slate-700/50 ${
        group.layout === "wide" ? "lg:col-span-2" : ""
      }`}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <IconComponent className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-4 h-3 bg-slate-700 rounded" />
              <div className="w-12 h-3 bg-slate-700 rounded" />
              <div className="flex-1 h-3 bg-slate-700/60 rounded" />
              <div className="w-12 h-3 bg-slate-700 rounded" />
              <div className="w-14 h-3 bg-slate-700/60 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Asset group card (loaded)
// ---------------------------------------------------------------------------

function AssetGroupCard({ group, year }: { group: AssetGroup; year: number }) {
  const { data, isLoading, error } = useAssetGroup(group.id, year);
  const IconComponent = ICON_MAP[group.icon] ?? TrendingUp;
  const title = interpolateTitle(group.title, year);
  const description = interpolateTitle(group.description, year);

  const colSpanClass = group.layout === "wide" ? "lg:col-span-2" : "";

  if (isLoading) {
    return <AssetGroupCardSkeleton group={group} year={year} />;
  }

  if (error || !data) {
    return (
      <Card className={`bg-slate-800/60 border-slate-700/50 ${colSpanClass}`}>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <IconComponent className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center gap-2 text-red-400 text-xs py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Failed to load data. Check API connectivity.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const assets = data.assets.slice(0, group.layout === "wide" ? 10 : 8);
  const sortLabel =
    group.sortBy === "volume" ? "avg daily volume" : "year return";

  // For wide cards, show two columns of assets
  const isWide = group.layout === "wide";
  const leftColumn = isWide ? assets.slice(0, 5) : assets;
  const rightColumn = isWide ? assets.slice(5) : [];

  return (
    <Card
      className={`bg-slate-800/60 border-slate-700/50 hover:border-slate-600/70 transition-colors ${colSpanClass}`}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200 leading-tight">
            <IconComponent className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{title}</span>
          </CardTitle>
          <span className="text-[10px] text-slate-500 shrink-0 mt-0.5 whitespace-nowrap">
            by {sortLabel}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 pl-6">{description}</p>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {/* Column header */}
        <div className="flex items-center gap-2 pb-1 mb-1 border-b border-slate-700">
          <span className="text-[10px] text-slate-600 w-4 shrink-0">#</span>
          <span className="text-[10px] text-slate-600 w-14 shrink-0">Ticker</span>
          <span className="text-[10px] text-slate-600 flex-1">Name</span>
          <span className="text-[10px] text-slate-600 shrink-0">
            {group.sortBy === "volume" ? "Avg Vol" : "Return"}
          </span>
          <span className="text-[10px] text-slate-600 w-16 text-right shrink-0">Price</span>
        </div>

        {isWide ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <div>
              {leftColumn.map((asset, i) => (
                <AssetRow
                  key={asset.symbol}
                  asset={asset}
                  sortBy={group.sortBy}
                  rank={i + 1}
                />
              ))}
            </div>
            {rightColumn.length > 0 && (
              <div>
                {rightColumn.map((asset, i) => (
                  <AssetRow
                    key={asset.symbol}
                    asset={asset}
                    sortBy={group.sortBy}
                    rank={leftColumn.length + i + 1}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {assets.map((asset, i) => (
              <AssetRow
                key={asset.symbol}
                asset={asset}
                sortBy={group.sortBy}
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExploreAssets() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSector, setSelectedSector] = useState<SectorFilter>("All");
  const [selectedMarket, setSelectedMarket] = useState<MarketFilter>("All");

  const visibleGroups = useMemo(
    () => filterGroups(ASSET_GROUPS, selectedSector, selectedMarket),
    [selectedSector, selectedMarket]
  );

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Explore Assets</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Curated asset groups — {visibleGroups.length} groups for {selectedYear}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="space-y-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
        {/* Year filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-14 shrink-0">
            Year
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  selectedYear === year
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                }`}
              >
                {year}
                {year === currentYear && (
                  <span className="ml-1.5 text-[9px] font-bold text-blue-300 uppercase tracking-wider">
                    live
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sector filter */}
        <div className="flex items-start gap-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-14 shrink-0 pt-1.5">
            Sector
          </span>
          <FilterPills
            options={SECTOR_FILTERS}
            value={selectedSector}
            onChange={setSelectedSector}
          />
        </div>

        {/* Market filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-14 shrink-0">
            Market
          </span>
          <FilterPills
            options={MARKET_FILTERS}
            value={selectedMarket}
            onChange={setSelectedMarket}
          />
        </div>
      </div>

      {/* Bento grid */}
      {visibleGroups.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          No groups match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
          {visibleGroups.map((group) => (
            <AssetGroupCard key={group.id} group={group} year={selectedYear} />
          ))}
        </div>
      )}
    </section>
  );
}
