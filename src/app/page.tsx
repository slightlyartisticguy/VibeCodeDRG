'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  DollarSign,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchModal } from '@/components/SearchModal';
import { PortfolioChart } from '@/components/Charts';
import { PortfolioTable } from '@/components/PortfolioTable';
import { TradeModal } from '@/components/TradeModal';
import { TradeHistory } from '@/components/TradeHistory';
import { MarketOverview } from '@/components/MarketOverview';
import { Notifications } from '@/components/Notifications';
import { useApp } from '@/context/AppContext';
import { getStock, getMultiplePrices } from '@/lib/stockData';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { TradeType } from '@/types';

export default function Dashboard() {
  const { state, dispatch, executeTrade, updatePrices } = useApp();
  const { portfolio, trades, notifications } = state;

  const [tradeModal, setTradeModal] = useState<{
    symbol: string;
    name: string;
    type: TradeType;
    maxShares?: number;
  } | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Update prices periodically
  useEffect(() => {
    const symbols = portfolio.positions.map((p) => p.symbol);
    if (symbols.length > 0) {
      const prices = getMultiplePrices(symbols);
      updatePrices(prices);
    }

    const interval = setInterval(() => {
      if (symbols.length > 0) {
        const prices = getMultiplePrices(symbols);
        updatePrices(prices);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [portfolio.positions.length]);

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

  const isPositiveGain = portfolio.totalGain >= 0;

  // Show loading state
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
        {/* Portfolio Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Total Value */}
          <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Portfolio Value
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.totalValue)}
            </p>
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium mt-1',
                isPositiveGain ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {isPositiveGain ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatCurrency(Math.abs(portfolio.totalGain))} ({formatPercent(portfolio.totalGainPercent)})
            </div>
          </div>

          {/* Cash Balance */}
          <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Cash Available
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.cash)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((portfolio.cash / portfolio.totalValue) * 100).toFixed(1)}% of portfolio
            </p>
          </div>

          {/* Invested Amount */}
          <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Invested
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.positions.reduce((sum, p) => sum + p.marketValue, 0))}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {portfolio.positions.length} position{portfolio.positions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Initial Investment */}
          <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Starting Capital
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.initialCash)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatPercent(((portfolio.totalValue - portfolio.initialCash) / portfolio.initialCash) * 100)} return
            </p>
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

            {/* Portfolio Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
                <button
                  onClick={() => {
                    const symbols = portfolio.positions.map((p) => p.symbol);
                    if (symbols.length > 0) {
                      const prices = getMultiplePrices(symbols);
                      updatePrices(prices);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              <PortfolioTable
                positions={portfolio.positions}
                onSelectPosition={setSelectedStock}
                onTrade={handleTrade}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Overview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h2>
              <MarketOverview />
            </div>

            {/* Recent Trades */}
            <TradeHistory trades={trades} limit={5} />
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

      {/* Notifications */}
      <Notifications
        notifications={notifications}
        onDismiss={(id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })}
      />
    </div>
  );
}
