'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { Position } from '@/types';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

interface PortfolioTableProps {
  positions: Position[];
  onSelectPosition?: (symbol: string) => void;
  onTrade?: (symbol: string, type: 'BUY' | 'SELL') => void;
}

export function PortfolioTable({ positions, onSelectPosition, onTrade }: PortfolioTableProps) {
  const [sortField, setSortField] = useState<keyof Position>('marketValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedPositions = [...positions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleSort = (field: keyof Position) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (positions.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No positions yet</h3>
        <p className="text-gray-500 mb-4">
          Start building your portfolio by searching for stocks and making your first purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('shares')}
              >
                Shares
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('avgCost')}
              >
                Avg Cost
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('currentPrice')}
              >
                Current Price
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('marketValue')}
              >
                Market Value
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('gainPercent')}
              >
                Gain/Loss
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedPositions.map((position) => {
              const isPositive = position.gain >= 0;
              return (
                <tr
                  key={position.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectPosition?.(position.symbol)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">
                          {position.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{position.symbol}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {position.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    {position.shares.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-600">
                    {formatCurrency(position.avgCost)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-900">
                    {formatCurrency(position.marketValue)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
                        isPositive ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
                      )}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {formatCurrency(Math.abs(position.gain))}
                      <span className="text-xs">({formatPercent(position.gainPercent)})</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrade?.(position.symbol, 'BUY');
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-success-600 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
                      >
                        Buy
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrade?.(position.symbol, 'SELL');
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
