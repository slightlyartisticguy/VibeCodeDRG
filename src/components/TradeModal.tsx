'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { TradeType } from '@/types';
import { getStock } from '@/lib/stockData';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

interface TradeModalProps {
  symbol: string;
  name: string;
  type: TradeType;
  maxShares?: number;
  availableCash: number;
  onClose: () => void;
  onConfirm: (shares: number, price: number) => void;
}

export function TradeModal({
  symbol,
  name,
  type,
  maxShares = Infinity,
  availableCash,
  onClose,
  onConfirm,
}: TradeModalProps) {
  const [shares, setShares] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const stock = getStock(symbol);
  const price = stock?.price || 0;
  const total = shares * price;
  const isPositiveChange = stock && stock.change >= 0;

  const isBuy = type === 'BUY';
  const maxAffordableShares = Math.floor(availableCash / price);
  const effectiveMaxShares = isBuy ? maxAffordableShares : maxShares;
  const canTrade = shares > 0 && shares <= effectiveMaxShares;

  // Validation messages
  const getValidationMessage = () => {
    if (isBuy && total > availableCash) {
      return `Insufficient funds. You can afford up to ${maxAffordableShares} shares.`;
    }
    if (!isBuy && shares > maxShares) {
      return `You only have ${maxShares} shares to sell.`;
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  const handleSubmit = () => {
    if (!canTrade) return;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onConfirm(shares, price);
      setIsLoading(false);
    }, 300);
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && canTrade) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canTrade]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              'px-6 py-4 flex items-center justify-between',
              isBuy ? 'bg-success-50' : 'bg-danger-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
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
                <h2
                  className={cn(
                    'text-lg font-semibold',
                    isBuy ? 'text-success-700' : 'text-danger-700'
                  )}
                >
                  {isBuy ? 'Buy' : 'Sell'} {symbol}
                </h2>
                <p className="text-sm text-gray-600">{name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Price */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(price)}</p>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                  isPositiveChange ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                )}
              >
                {isPositiveChange ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercent(stock?.changePercent || 0)}
              </div>
            </div>

            {/* Shares Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Shares
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShares(Math.max(1, shares - 1))}
                  disabled={shares <= 1}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-12 text-center text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  min={1}
                  max={effectiveMaxShares}
                />
                <button
                  onClick={() => setShares(Math.min(effectiveMaxShares, shares + 1))}
                  disabled={shares >= effectiveMaxShares}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-3">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setShares(Math.min(amount, effectiveMaxShares))}
                    disabled={amount > effectiveMaxShares}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {amount}
                  </button>
                ))}
                <button
                  onClick={() => setShares(effectiveMaxShares)}
                  disabled={effectiveMaxShares === 0}
                  className="flex-1 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div className="flex items-start gap-2 p-3 bg-danger-50 text-danger-700 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{validationMessage}</span>
              </div>
            )}

            {/* Order Summary */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Market Price</span>
                <span className="font-medium">{formatCurrency(price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Shares</span>
                <span className="font-medium">× {shares}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-medium text-gray-700">Estimated Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Available Cash (for buying) */}
            {isBuy && (
              <div className="text-sm text-gray-500 text-center">
                Available cash: <span className="font-medium text-gray-900">{formatCurrency(availableCash)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canTrade || isLoading}
              className={cn(
                'flex-1 py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                isBuy
                  ? 'bg-success-600 hover:bg-success-700'
                  : 'bg-danger-600 hover:bg-danger-700'
              )}
            >
              {isLoading ? 'Processing...' : `${isBuy ? 'Buy' : 'Sell'} ${shares} Shares`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
