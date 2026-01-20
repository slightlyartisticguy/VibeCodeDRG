'use client';

import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Trade } from '@/types';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';

interface TradeHistoryProps {
  trades: Trade[];
  limit?: number;
}

export function TradeHistory({ trades, limit }: TradeHistoryProps) {
  const displayTrades = limit ? trades.slice(0, limit) : trades;

  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No trades yet</h3>
        <p className="text-gray-500">
          Your trade history will appear here once you start buying and selling stocks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-900">Recent Trades</h3>
      </div>
      <div className="divide-y">
        {displayTrades.map((trade) => {
          const isBuy = trade.type === 'BUY';
          return (
            <div
              key={trade.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isBuy ? 'bg-success-100' : 'bg-danger-100'
                  )}
                >
                  {isBuy ? (
                    <TrendingUp className="w-5 h-5 text-success-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-danger-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{trade.symbol}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded',
                        isBuy ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                      )}
                    >
                      {trade.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {trade.shares} shares @ {formatCurrency(trade.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(trade.total)}</p>
                <p className="text-sm text-gray-500">{formatDateTime(trade.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
      {limit && trades.length > limit && (
        <div className="px-6 py-3 border-t bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            Showing {limit} of {trades.length} trades
          </p>
        </div>
      )}
    </div>
  );
}
