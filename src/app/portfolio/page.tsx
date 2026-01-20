'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw, Settings, PieChart, Download } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchModal } from '@/components/SearchModal';
import { PortfolioChart, StockChart } from '@/components/Charts';
import { PortfolioTable } from '@/components/PortfolioTable';
import { TradeModal } from '@/components/TradeModal';
import { TradeHistory } from '@/components/TradeHistory';
import { Notifications } from '@/components/Notifications';
import { useApp } from '@/context/AppContext';
import { getStock, getMultiplePrices } from '@/lib/stockData';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { TradeType } from '@/types';

export default function PortfolioPage() {
  const { state, dispatch, executeTrade, updatePrices, resetPortfolio } = useApp();
  const { portfolio, trades, notifications } = state;

  const [tradeModal, setTradeModal] = useState<{
    symbol: string;
    name: string;
    type: TradeType;
    maxShares?: number;
  } | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newInitialCash, setNewInitialCash] = useState(portfolio.initialCash);

  // Update prices periodically
  useEffect(() => {
    const symbols = portfolio.positions.map((p) => p.symbol);
    if (symbols.length > 0) {
      const prices = getMultiplePrices(symbols);
      updatePrices(prices);
    }
  }, []);

  // Handle search stock selection
  const handleSearchSelect = (symbol: string, name: string) => {
    setTradeModal({ symbol, name, type: 'BUY' });
  };

  // Handle trade from table
  const handleTrade = (symbol: string, type: TradeType) => {
    const position = portfolio.positions.find((p) => p.symbol === symbol);
    const stock = getStock(symbol);
    if (stock) {
      setTradeModal({
        symbol,
        name: stock.name,
        type,
        maxShares: type === 'SELL' ? position?.shares : undefined,
      });
    }
  };

  // Confirm trade
  const handleConfirmTrade = (shares: number, price: number) => {
    if (tradeModal) {
      executeTrade(tradeModal.symbol, tradeModal.name, tradeModal.type, shares, price);
      setTradeModal(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    resetPortfolio(newInitialCash);
    setShowResetModal(false);
  };

  // Calculate allocation
  const allocation = portfolio.positions.map((p) => ({
    symbol: p.symbol,
    name: p.name,
    value: p.marketValue,
    percent: (p.marketValue / portfolio.totalValue) * 100,
  }));

  // Add cash to allocation
  const allocationWithCash = [
    ...allocation,
    {
      symbol: 'Cash',
      name: 'Cash',
      value: portfolio.cash,
      percent: (portfolio.cash / portfolio.totalValue) * 100,
    },
  ];

  const isPositiveGain = portfolio.totalGain >= 0;

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SearchModal onSelectStock={handleSearchSelect} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
            <p className="text-gray-500 mt-1">
              Track and manage your hypothetical investments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const symbols = portfolio.positions.map((p) => p.symbol);
                if (symbols.length > 0) {
                  const prices = getMultiplePrices(symbols);
                  updatePrices(prices);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Prices
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Portfolio
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolio.totalValue)}
              </p>
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium mt-1',
                  isPositiveGain ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {formatCurrency(Math.abs(portfolio.totalGain))} ({formatPercent(portfolio.totalGainPercent)})
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cash Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolio.cash)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Available for trading
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Positions Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolio.positions.reduce((sum, p) => sum + p.marketValue, 0))}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {portfolio.positions.length} holding{portfolio.positions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Trades</p>
              <p className="text-3xl font-bold text-gray-900">{trades.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {trades.filter((t) => t.type === 'BUY').length} buys, {trades.filter((t) => t.type === 'SELL').length} sells
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Chart */}
            <PortfolioChart
              initialValue={portfolio.initialCash}
              currentValue={portfolio.totalValue}
            />

            {/* Stock Detail Chart */}
            {selectedStock && (
              <StockChart symbol={selectedStock} />
            )}

            {/* Portfolio Table */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Holdings</h2>
              <PortfolioTable
                positions={portfolio.positions}
                onSelectPosition={setSelectedStock}
                onTrade={handleTrade}
              />
            </div>

            {/* Trade History */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Trade History</h2>
              <TradeHistory trades={trades} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Allocation */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Asset Allocation</h3>
              </div>
              <div className="space-y-3">
                {allocationWithCash.map((item, index) => (
                  <div key={item.symbol}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{item.symbol}</span>
                      <span className="text-gray-500">
                        {formatCurrency(item.value)} ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.symbol === 'Cash'
                            ? 'bg-gray-400'
                            : `bg-primary-${Math.min(600, 300 + index * 100)}`
                        )}
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor:
                            item.symbol === 'Cash'
                              ? '#9ca3af'
                              : `hsl(${210 + index * 30}, 70%, ${50 - index * 5}%)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Portfolio Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Initial Capital</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(portfolio.initialCash)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(portfolio.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(portfolio.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trade Modal */}
      {tradeModal && (
        <TradeModal
          symbol={tradeModal.symbol}
          name={tradeModal.name}
          type={tradeModal.type}
          maxShares={tradeModal.maxShares}
          availableCash={portfolio.cash}
          onClose={() => setTradeModal(null)}
          onConfirm={handleConfirmTrade}
        />
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowResetModal(false)}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Portfolio</h2>
              <p className="text-gray-500 mb-6">
                This will delete all your positions and trade history. Enter your new starting capital:
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Capital
                </label>
                <input
                  type="number"
                  value={newInitialCash}
                  onChange={(e) => setNewInitialCash(parseFloat(e.target.value) || 10000)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  min={1000}
                  step={1000}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 text-sm font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 transition-colors"
                >
                  Reset Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <Notifications
        notifications={notifications}
        onDismiss={(id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })}
      />
    </div>
  );
}
