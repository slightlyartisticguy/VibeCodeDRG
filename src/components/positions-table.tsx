/**
 * Held Positions table component.
 * Displays current portfolio positions with real-time price data.
 * Styled to match the dark-themed table from the Figma design.
 */
"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X, Search, Pencil, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  usePositions,
  useAddPosition,
  useUpdatePosition,
  useDeletePosition,
  useMultipleQuotes,
  useQuote,
  useSymbolSearch,
} from "@/hooks/use-market-data";
import type { Position, PositionInput } from "@/lib/types";

/**
 * Format a number as USD currency.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Map Finnhub type strings to our asset_type enum */
function toAssetType(finnhubType: string): PositionInput["asset_type"] {
  const t = finnhubType.toLowerCase();
  if (t.includes("fund")) return "fund";
  if (t.includes("crypto")) return "crypto";
  if (t.includes("bond") || t.includes("fixed")) return "bond";
  return "equity";
}

function formatPurchaseDate(dateStr?: string | null): string {
  if (!dateStr) return "â€”";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
}

/** Inner component so we can conditionally call useQuote only when an asset is pending */
function AddPanel({
  asset,
  onAdd,
  onClear,
  isPending,
}: {
  asset: SearchResult;
  onAdd: (qty: number, date: string, price: number) => void;
  onClear: () => void;
  isPending: boolean;
}) {
  const [qty, setQty] = useState("");
  const [date, setDate] = useState("");
  const { data: quote } = useQuote(asset.symbol);
  const marketPrice = quote?.currentPrice ?? 0;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-blue-800/40 bg-[#131e2e] p-3">
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="border-slate-600 bg-slate-800 font-mono text-xs text-blue-400">
          {asset.symbol}
        </Badge>
        <span className="text-sm text-slate-300 max-w-[200px] truncate">{asset.name}</span>
        {marketPrice > 0 && (
          <span className="text-xs font-mono text-slate-500">{formatCurrency(marketPrice)}</span>
        )}
      </div>
      <div className="flex items-end gap-2 flex-wrap flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Units</label>
          <Input
            type="number"
            placeholder="Qty"
            value={qty}
            min="0"
            step="any"
            onChange={(e) => setQty(e.target.value)}
            className="h-8 w-24 border-slate-700 bg-[#262626] text-sm text-slate-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Purchase Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 border-slate-700 bg-[#262626] text-sm text-slate-300"
          />
        </div>
        <button
          type="button"
          disabled={!qty || parseFloat(qty) <= 0 || isPending}
          onClick={() => onAdd(parseFloat(qty), date, marketPrice)}
          className="h-8 self-end rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-40"
        >
          {isPending ? "Addingâ€¦" : "Add"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="h-8 self-end rounded-md px-2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PositionsTable({ portfolioId = "A" }: { portfolioId?: "A" | "B" }) {
  const queryClient = useQueryClient();
  const { data: positions = [], isLoading } = usePositions(portfolioId);
  const addPosition = useAddPosition(portfolioId);
  const updatePosition = useUpdatePosition(portfolioId);
  const deletePosition = useDeletePosition(portfolioId);

  const symbols = positions.map((p) => p.symbol);
  const { data: quotes = {} } = useMultipleQuotes(symbols);

  // Manage-mode toggle
  const [manageMode, setManageMode] = useState(false);

  // Search / add state
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: searchResults = [] } = useSymbolSearch(searchQuery);
  const [pendingAsset, setPendingAsset] = useState<SearchResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inline editing state
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editDate, setEditDate] = useState("");

  const handleSelectAsset = (asset: SearchResult) => {
    setPendingAsset(asset);
    setSearchQuery(asset.symbol);
    setDropdownOpen(false);
  };

  const handleAdd = async (qty: number, date: string, price: number) => {
    if (!pendingAsset) return;
    await addPosition.mutateAsync({
      symbol: pendingAsset.symbol,
      name: pendingAsset.name,
      quantity: qty,
      avg_price: price,
      asset_type: toAssetType(pendingAsset.type),
      purchase_date: date || undefined,
      portfolio_id: portfolioId,
    } as PositionInput);
    setPendingAsset(null);
    setSearchQuery("");
  };

  const handleStartEdit = (pos: Position) => {
    setEditingSymbol(pos.symbol);
    setEditQty(String(pos.quantity));
    setEditDate((pos as Position & { purchase_date?: string }).purchase_date ?? "");
  };

  const handleSaveEdit = async (pos: Position) => {
    await updatePosition.mutateAsync({
      symbol: pos.symbol,
      quantity: parseFloat(editQty) || pos.quantity,
      purchase_date: editDate || undefined,
    });
    setEditingSymbol(null);
  };

  const exitManageMode = () => {
    setManageMode(false);
    setPendingAsset(null);
    setSearchQuery("");
    setEditingSymbol(null);
    setDropdownOpen(false);
    // Invalidate portfolio history to trigger a refetch in the chart
    queryClient.invalidateQueries({ queryKey: ["portfolio-history", portfolioId] });
  };

  return (
    <Card className="border-2 border-blue-900/50 bg-[#262626]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            Portfolio {portfolioId} — Held Positions
          </h2>
          <button
            onClick={manageMode ? exitManageMode : () => setManageMode(true)}
            className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {manageMode ? (
              <><Check className="h-4 w-4" />Done</>
            ) : (
              <><Plus className="h-4 w-4" />Manage Assets</>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* â”€â”€ Search + Add panel (manage mode only) â”€â”€ */}
        {manageMode && (
          <div className="space-y-3 rounded-lg border border-slate-700 bg-[#1a1a1a] p-4">
            <div className="relative" ref={dropdownRef}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search for an asset to addâ€¦"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(true);
                  if (!e.target.value) setPendingAsset(null);
                }}
                onFocus={() => searchQuery.length > 0 && setDropdownOpen(true)}
                className="pl-9 border-slate-700 bg-[#262626] text-sm text-slate-300"
              />
              {dropdownOpen && searchQuery.length > 0 && searchResults.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-52 overflow-auto rounded-lg border border-slate-700 bg-[#1a1a1a] py-1 shadow-xl">
                  {searchResults.slice(0, 8).map((r) => (
                    <li key={`${r.symbol}-${r.name}`}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelectAsset(r)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="min-w-[56px] rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-blue-400">
                          {r.symbol}
                        </span>
                        <span className="truncate text-sm text-slate-300">{r.name}</span>
                        <span className="ml-auto shrink-0 text-xs text-slate-500">{r.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {pendingAsset && (
              <AddPanel
                asset={pendingAsset}
                onAdd={handleAdd}
                onClear={() => { setPendingAsset(null); setSearchQuery(""); }}
                isPending={addPosition.isPending}
              />
            )}
          </div>
        )}

        {/* â”€â”€ Positions table â”€â”€ */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : positions.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">
            No positions yet. Click &quot;Manage Assets&quot; to add your first position.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">Asset</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">Units</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">Purchase Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">Current Price</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-blue-400">Total Value</TableHead>
                  {manageMode && <TableHead className="w-20" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const pos = position as Position & { purchase_date?: string };
                  const quote = quotes[pos.symbol];
                  const currentPrice = quote?.currentPrice ?? pos.avg_price;
                  const totalValue = pos.quantity * currentPrice;
                  const isUp = currentPrice >= pos.avg_price;
                  const isEditing = editingSymbol === pos.symbol;

                  return (
                    <TableRow
                      key={pos.symbol}
                      className="border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-slate-600 bg-slate-800 font-mono text-xs text-slate-300">
                            {pos.symbol}
                          </Badge>
                          <span className="text-sm text-slate-300">{pos.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editQty}
                            min="0"
                            step="any"
                            onChange={(e) => setEditQty(e.target.value)}
                            className="h-7 w-24 border-slate-700 bg-[#1a1a1a] text-sm text-slate-300"
                          />
                        ) : (
                          <span className="text-sm text-slate-300">
                            {pos.quantity}{" "}
                            <span className="text-slate-500">
                              {pos.asset_type === "crypto" ? pos.symbol : "Shares"}
                            </span>
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="h-7 border-slate-700 bg-[#1a1a1a] text-sm text-slate-300"
                          />
                        ) : (
                          <span className={`text-sm ${pos.purchase_date ? "text-slate-400" : "italic text-slate-600"}`}>
                            {formatPurchaseDate(pos.purchase_date)}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className={`font-mono text-sm font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(currentPrice)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm text-slate-200">
                        {formatCurrency(totalValue)}
                      </TableCell>

                      {manageMode && (
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(pos)}
                                  disabled={updatePosition.isPending}
                                  className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                  title="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSymbol(null)}
                                  className="rounded p-1 text-slate-500 hover:bg-slate-700/50 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(pos)}
                                  className="rounded p-1 text-slate-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deletePosition.mutate(pos.symbol)}
                                  className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
