/**
 * Held Positions table component.
 * Displays current portfolio positions with real-time price data.
 * Styled to match the dark-themed table from the Figma design.
 */
"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
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
  useDeletePosition,
  useMultipleQuotes,
} from "@/hooks/use-market-data";
import type { PositionInput } from "@/lib/types";

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

export function PositionsTable() {
  const { data: positions = [], isLoading } = usePositions();
  const addPosition = useAddPosition();
  const deletePosition = useDeletePosition();
  const [showForm, setShowForm] = useState(false);

  // Fetch live quotes for all held positions
  const symbols = positions.map((p) => p.symbol);
  const { data: quotes = {} } = useMultipleQuotes(symbols);

  const [formData, setFormData] = useState<PositionInput>({
    symbol: "",
    name: "",
    quantity: 0,
    avg_price: 0,
    asset_type: "equity",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.name || formData.quantity <= 0) return;

    try {
      await addPosition.mutateAsync(formData);
      setFormData({
        symbol: "",
        name: "",
        quantity: 0,
        avg_price: 0,
        asset_type: "equity",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add position:", error);
    }
  };

  return (
    <Card className="border-2 border-blue-900/50 bg-[#262626]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Held Positions</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Manage Assets
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Position Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-slate-700 bg-[#1a1a1a] p-4 md:grid-cols-6"
          >
            <Input
              placeholder="Symbol"
              value={formData.symbol}
              onChange={(e) =>
                setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
              }
              className="border-slate-700 bg-[#262626] text-sm text-slate-300"
              required
            />
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-slate-700 bg-[#262626] text-sm text-slate-300"
              required
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
              }
              className="border-slate-700 bg-[#262626] text-sm text-slate-300"
              step="any"
              min="0"
              required
            />
            <Input
              type="number"
              placeholder="Avg. Price"
              value={formData.avg_price || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  avg_price: parseFloat(e.target.value) || 0,
                })
              }
              className="border-slate-700 bg-[#262626] text-sm text-slate-300"
              step="any"
              min="0"
              required
            />
            <select
              value={formData.asset_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  asset_type: e.target.value as PositionInput["asset_type"],
                })
              }
              className="rounded-md border border-slate-700 bg-[#262626] px-3 text-sm text-slate-300"
            >
              <option value="equity">Equity</option>
              <option value="crypto">Crypto</option>
              <option value="bond">Bond</option>
              <option value="cash">Cash</option>
            </select>
            <button
              type="submit"
              disabled={addPosition.isPending}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {addPosition.isPending ? "Adding..." : "Add"}
            </button>
          </form>
        )}

        {/* Positions Table */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : positions.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">
            No positions yet. Click &quot;Manage Assets&quot; to add your first
            position.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Asset
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Quantity
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Avg. Price
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Current Price
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Total Value
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const quote = quotes[position.symbol];
                  const currentPrice =
                    quote?.currentPrice ?? position.avg_price;
                  const totalValue = position.quantity * currentPrice;
                  const isUp = currentPrice >= position.avg_price;

                  return (
                    <TableRow
                      key={position.symbol}
                      className="border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="border-slate-600 bg-slate-800 font-mono text-xs text-slate-300"
                          >
                            {position.symbol}
                          </Badge>
                          <span className="text-sm text-slate-300">
                            {position.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-300">
                        {position.quantity}{" "}
                        <span className="text-slate-500">
                          {position.asset_type === "crypto"
                            ? position.symbol
                            : "Shares"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-300">
                        {formatCurrency(position.avg_price)}
                      </TableCell>
                      <TableCell
                        className={`font-mono text-sm font-medium ${
                          isUp ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(currentPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-200">
                        {formatCurrency(totalValue)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            deletePosition.mutate(position.symbol)
                          }
                          className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Remove position"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
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
