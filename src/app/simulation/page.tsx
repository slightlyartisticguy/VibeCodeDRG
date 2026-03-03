"use client";

import { useState, useMemo } from "react";
import { usePositions, useSymbolSearch, usePriceAtDate } from "@/hooks/use-market-data";
import { useSimulation } from "@/hooks/use-simulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XIcon, CheckIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react";
import { SimulationResults } from "@/components/simulation-results";

const ASSET_TYPES = ["Equity", "ETF", "Crypto", "Bond", "Other"] as const;
type AssetType = (typeof ASSET_TYPES)[number];

type Holding = {
  symbol: string;
  quantity: number;
  purchaseDate: string;
  avg_price: number;
  assetType: AssetType;
};

type PendingHolding = {
  symbol: string;
  name: string;
  quantity: number;
  purchaseDate: string;
  assetType: AssetType;
};

type SimulationType = "monte-carlo" | "interest-rate" | "dcf";

type SortCol = "symbol" | "quantity" | "purchaseDate" | "avg_price" | "assetType" | "totalValue";
type SortDir = "asc" | "desc";

/** Returns today's date as a YYYY-MM-DD string. */
function today(): string {
  return new Date().toISOString().split("T")[0];
}

/** Maps Finnhub/Yahoo type strings to our AssetType enum. */
function mapAssetType(rawType: string): AssetType {
  const t = rawType.toLowerCase();
  if (t.includes("etf") || t === "etp" || t.includes("exchange traded")) return "ETF";
  if (t.includes("crypto") || t.includes("digital")) return "Crypto";
  if (t.includes("bond") || t.includes("fixed income") || t.includes("mutual fund") || t.includes("fund")) return "Bond";
  if (t.includes("common stock") || t.includes("equity") || t.includes("adr") || t.includes("preferred")) return "Equity";
  if (t === "") return "Equity";
  return "Other";
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Sortable column header button. */
function SortableHead({
  label,
  col,
  sort,
  onToggle,
  className,
}: {
  label: string;
  col: SortCol;
  sort: { col: SortCol; dir: SortDir } | null;
  onToggle: (col: SortCol) => void;
  className?: string;
}) {
  const active = sort?.col === col;
  return (
    <TableHead className={className}>
      <button
        className="flex items-center gap-1 hover:text-slate-100 transition-colors"
        onClick={() => onToggle(col)}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUpIcon className="h-3 w-3" />
          ) : (
            <ArrowDownIcon className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDownIcon className="h-3 w-3 opacity-30" />
        )}
      </button>
    </TableHead>
  );
}

/** Inline add / edit form. */
function AddHoldingForm({
  pending,
  onConfirm,
  onCancel,
  confirmLabel = "Add",
}: {
  pending: PendingHolding;
  onConfirm: (h: Holding) => void;
  onCancel: () => void;
  confirmLabel?: string;
}) {
  const [quantity, setQuantity] = useState(String(pending.quantity));
  const [purchaseDate, setPurchaseDate] = useState(pending.purchaseDate);

  const { data: priceData, isFetching } = usePriceAtDate(pending.symbol, purchaseDate);

  const parsedQty = parseFloat(quantity) || 0;
  const price = priceData?.price ?? 0;
  const totalValue = parsedQty * price;

  const handleConfirm = () => {
    onConfirm({
      symbol: pending.symbol,
      quantity: parsedQty,
      purchaseDate,
      avg_price: price,
      assetType: pending.assetType,
    });
  };

  return (
    <div className="mt-2 p-3 border border-slate-600 rounded-md bg-slate-800/60 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-100">{pending.symbol}</span>
        <span className="text-sm text-slate-400">{pending.name !== pending.symbol ? pending.name : ""}</span>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Quantity</label>
          <Input
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-28 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Asset Type</label>
          <div className="h-9 px-3 flex items-center text-sm rounded-md border border-slate-600 bg-slate-700/50 text-slate-300 min-w-[80px]">
            {pending.assetType}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Purchase Date</label>
          <Input
            type="date"
            max={today()}
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-36"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Price on Date</label>
          <div className="h-9 px-3 flex items-center text-sm rounded-md border border-slate-600 bg-slate-700 min-w-[80px]">
            {isFetching
              ? <span className="text-slate-500">Loading…</span>
              : price
                ? `$${fmt(price)}`
                : <span className="text-slate-500">—</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Total Value</label>
          <div className="h-9 px-3 flex items-center text-sm rounded-md border border-slate-600 bg-slate-700 min-w-[100px]">
            {isFetching
              ? <span className="text-slate-500">Loading…</span>
              : price && parsedQty
                ? `$${fmt(totalValue)}`
                : <span className="text-slate-500">—</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={isFetching || !parsedQty} size="sm">
            <CheckIcon className="h-4 w-4 mr-1" /> {confirmLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Table row — owns its own edit-mode state. */
function HoldingRow({
  holding,
  onRemove,
  onUpdate,
}: {
  holding: Holding;
  onRemove: (symbol: string) => void;
  onUpdate: (symbol: string, updates: Omit<Holding, "symbol">) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: priceData, isFetching } = usePriceAtDate(holding.symbol, holding.purchaseDate);
  const displayPrice = priceData?.price ?? holding.avg_price;
  const totalValue = holding.quantity * displayPrice;

  if (isEditing) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="p-0">
          <AddHoldingForm
            pending={{
              symbol: holding.symbol,
              name: holding.symbol,
              quantity: holding.quantity,
              purchaseDate: holding.purchaseDate,
              assetType: holding.assetType,
            }}
            onConfirm={(updated) => {
              onUpdate(updated.symbol, {
                quantity: updated.quantity,
                purchaseDate: updated.purchaseDate,
                avg_price: updated.avg_price,
                assetType: updated.assetType,
              });
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            confirmLabel="Save"
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{holding.symbol}</TableCell>
      <TableCell className="text-slate-300">{holding.quantity}</TableCell>
      <TableCell className="text-slate-300">{holding.purchaseDate}</TableCell>
      <TableCell className="text-slate-300">
        {isFetching ? <span className="text-slate-500 text-sm">Loading…</span> : `$${fmt(displayPrice)}`}
      </TableCell>
      <TableCell className="text-slate-300">{holding.assetType}</TableCell>
      <TableCell className="text-slate-300">
        {isFetching ? <span className="text-slate-500 text-sm">Loading…</span> : `$${fmt(totalValue)}`}
      </TableCell>
      <TableCell>
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onRemove(holding.symbol)}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function SimulationPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingHolding, setPendingHolding] = useState<PendingHolding | null>(null);
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir } | null>(null);

  const { data: searchResults, isLoading: isSearching } = useSymbolSearch(searchQuery);
  const { data: portfolioA } = usePositions("A");
  const { data: portfolioB } = usePositions("B");

  const [simulationType, setSimulationType] = useState<SimulationType>("monte-carlo");
  const [years, setYears] = useState(10);
  const [numSimulations, setNumSimulations] = useState(1000);
  const [interestRateChange, setInterestRateChange] = useState(0.5);
  const [annualWithdrawal, setAnnualWithdrawal] = useState(0);
  const [inflationRate, setInflationRate] = useState(2.5);
  // Derived from holdings but user-overridable
  const [initialAmountOverride, setInitialAmountOverride] = useState<string>("");

  const simulationMutation = useSimulation();

  const toggleSort = (col: SortCol) => {
    setSort((prev) =>
      prev?.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" }
    );
  };

  const sortedHoldings = useMemo(() => {
    if (!sort) return holdings;
    return [...holdings].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sort.col) {
        case "symbol":     av = a.symbol;    bv = b.symbol;    break;
        case "quantity":   av = a.quantity;  bv = b.quantity;  break;
        case "purchaseDate": av = a.purchaseDate; bv = b.purchaseDate; break;
        case "avg_price":  av = a.avg_price; bv = b.avg_price; break;
        case "assetType":  av = a.assetType; bv = b.assetType; break;
        case "totalValue": av = a.quantity * a.avg_price; bv = b.quantity * b.avg_price; break;
        default:           return 0;
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [holdings, sort]);

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.quantity * h.avg_price, 0);

  const handleRunSimulation = () => {
    const initialAmount = initialAmountOverride !== "" ? parseFloat(initialAmountOverride) : totalPortfolioValue;
    simulationMutation.mutate({
      holdings,
      simulationType,
      years,
      numSimulations,
      interestRateChange,
      annualWithdrawal,
      inflationRate: inflationRate / 100,
      initialAmount,
    });
  };

  const selectFromSearch = (symbol: string, name: string, rawType: string) => {
    setSearchQuery("");
    if (holdings.some((h) => h.symbol === symbol)) return;
    setPendingHolding({ symbol, name, quantity: 1, purchaseDate: today(), assetType: mapAssetType(rawType) });
  };

  const confirmAddHolding = (holding: Holding) => {
    setHoldings((prev) => [...prev, holding]);
    setPendingHolding(null);
  };

  const removeHolding = (symbol: string) => {
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));
  };

  const updateHolding = (symbol: string, updates: Omit<Holding, "symbol">) => {
    setHoldings((prev) => prev.map((h) => (h.symbol === symbol ? { ...h, ...updates } : h)));
  };

  const importPortfolio = (portfolio: Omit<Holding, "purchaseDate" | "assetType">[] | undefined) => {
    if (!portfolio) return;
    setHoldings(portfolio.map((h) => ({ ...h, purchaseDate: today(), assetType: "Equity" as AssetType })));
  };

  return (
    <main className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Simulations</h1>

      {/* Portfolio Card */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Portfolio for Simulation</CardTitle>
              {holdings.length > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  Total Value:{" "}
                  <span className="text-slate-100 font-semibold">${fmt(totalPortfolioValue)}</span>
                  &nbsp;&mdash;&nbsp;
                  {holdings.length} {holdings.length === 1 ? "position" : "positions"}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => importPortfolio(portfolioA)}>
                Import Portfolio A
              </Button>
              <Button variant="outline" size="sm" onClick={() => importPortfolio(portfolioB)}>
                Import Portfolio B
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setHoldings([])}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Input
              placeholder="Search to add a symbol…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearching && <div className="p-2 text-slate-400">Searching…</div>}
                {searchResults?.map((item) => (
                  <div
                    key={item.symbol}
                    className="p-2 hover:bg-slate-800 cursor-pointer"
                    onClick={() => selectFromSearch(item.symbol, item.name ?? "", item.type ?? "")}
                  >
                    <div className="font-bold">{item.symbol}</div>
                    <div className="text-sm text-slate-400">{item.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending add form */}
          {pendingHolding && (
            <AddHoldingForm
              pending={pendingHolding}
              onConfirm={confirmAddHolding}
              onCancel={() => setPendingHolding(null)}
            />
          )}

          {/* Holdings table */}
          {holdings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Symbol"        col="symbol"       sort={sort} onToggle={toggleSort} />
                  <SortableHead label="Quantity"      col="quantity"     sort={sort} onToggle={toggleSort} />
                  <SortableHead label="Purchase Date" col="purchaseDate" sort={sort} onToggle={toggleSort} />
                  <SortableHead label="Avg. Price"    col="avg_price"    sort={sort} onToggle={toggleSort} />
                  <SortableHead label="Asset Type"    col="assetType"    sort={sort} onToggle={toggleSort} />
                  <SortableHead label="Total Value"   col="totalValue"   sort={sort} onToggle={toggleSort} />
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHoldings.map((holding) => (
                  <HoldingRow
                    key={holding.symbol}
                    holding={holding}
                    onRemove={removeHolding}
                    onUpdate={updateHolding}
                  />
                ))}
              </TableBody>
            </Table>
          )}

          {holdings.length === 0 && !pendingHolding && (
            <p className="text-slate-500 text-sm text-center py-4">
              Search for a symbol above to build your portfolio.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Simulation Setup */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle>Simulation Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={simulationType}
            onValueChange={(value) => setSimulationType(value as SimulationType)}
          >
            <TabsList>
              <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
              <TabsTrigger value="interest-rate">Interest Rate Sensitivity</TabsTrigger>
              <TabsTrigger value="dcf">DCF</TabsTrigger>
            </TabsList>
            <TabsContent value="monte-carlo" className="mt-4">
              <div className="flex flex-wrap gap-6">
                <div>
                  <label htmlFor="initialAmount" className="block text-sm font-medium text-slate-300 mb-1">Initial Amount ($)</label>
                  <Input
                    id="initialAmount"
                    inputMode="decimal"
                    placeholder={totalPortfolioValue > 0 ? `$${fmt(totalPortfolioValue)}` : "From portfolio"}
                    value={initialAmountOverride}
                    onChange={(e) => setInitialAmountOverride(e.target.value)}
                    className="w-36"
                  />
                </div>
                <div>
                  <label htmlFor="years" className="block text-sm font-medium text-slate-300 mb-1">Simulation Period (years)</label>
                  <Input id="years" type="number" min={1} max={50} value={years} onChange={(e) => setYears(parseInt(e.target.value))} className="w-28" />
                </div>
                <div>
                  <label htmlFor="numSimulations" className="block text-sm font-medium text-slate-300 mb-1">Number of Simulations</label>
                  <Input id="numSimulations" type="number" min={100} max={5000} value={numSimulations} onChange={(e) => setNumSimulations(parseInt(e.target.value))} className="w-36" />
                </div>
                <div>
                  <label htmlFor="annualWithdrawal" className="block text-sm font-medium text-slate-300 mb-1">Annual Withdrawal ($)</label>
                  <Input id="annualWithdrawal" type="number" min={0} value={annualWithdrawal} onChange={(e) => setAnnualWithdrawal(parseFloat(e.target.value) || 0)} className="w-36" />
                </div>
                <div>
                  <label htmlFor="inflationRate" className="block text-sm font-medium text-slate-300 mb-1">Inflation Rate (%)</label>
                  <Input id="inflationRate" type="number" min={0} step={0.1} value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)} className="w-28" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="interest-rate" className="mt-4">
              <div>
                <label htmlFor="interestRateChange" className="block text-sm font-medium text-slate-300 mb-1">Interest Rate Change (%)</label>
                <Input id="interestRateChange" type="number" step="0.1" value={interestRateChange} onChange={(e) => setInterestRateChange(parseFloat(e.target.value))} className="w-36" />
              </div>
            </TabsContent>
            <TabsContent value="dcf" className="mt-4">
              <p className="text-slate-400 text-sm">
                DCF simulation will be based on the portfolio holdings using analyst earnings estimates.
              </p>
            </TabsContent>
          </Tabs>
          <Button
            onClick={handleRunSimulation}
            disabled={simulationMutation.isPending || holdings.length === 0}
            className="mt-6"
          >
            {simulationMutation.isPending ? "Running…" : "Run Simulation"}
          </Button>
        </CardContent>
      </Card>

      {simulationMutation.isSuccess && <SimulationResults data={simulationMutation.data} />}
      {simulationMutation.isError && (
        <Card className="bg-red-900/20 border-red-500/50">
          <CardHeader><CardTitle className="text-red-400">Simulation Error</CardTitle></CardHeader>
          <CardContent><p className="text-red-400">{simulationMutation.error.message}</p></CardContent>
        </Card>
      )}
    </main>
  );
}
