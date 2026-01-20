'use client';

import { Header } from '@/components/Header';
import { SearchModal } from '@/components/SearchModal';
import { StrategyBuilder } from '@/components/StrategyBuilder';
import { TradeModal } from '@/components/TradeModal';
import { Notifications } from '@/components/Notifications';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { TradeType } from '@/types';
import { getStock } from '@/lib/stockData';

export default function StrategyPage() {
  const {
    state,
    dispatch,
    executeTrade,
    addStrategy,
    updateStrategy,
    deleteStrategy,
    toggleStrategy,
  } = useApp();
  const { portfolio, strategies, notifications } = state;

  const [tradeModal, setTradeModal] = useState<{
    symbol: string;
    name: string;
    type: TradeType;
    maxShares?: number;
  } | null>(null);

  // Handle search stock selection
  const handleSearchSelect = (symbol: string, name: string) => {
    setTradeModal({ symbol, name, type: 'BUY' });
  };

  // Confirm trade
  const handleConfirmTrade = (shares: number, price: number) => {
    if (tradeModal) {
      executeTrade(tradeModal.symbol, tradeModal.name, tradeModal.type, shares, price);
      setTradeModal(null);
    }
  };

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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Trading Strategies</h1>
          <p className="text-gray-500 mt-1">
            Create and manage automated trading rules for your portfolio simulations
          </p>
        </div>

        {/* Strategy Builder */}
        <StrategyBuilder
          strategies={strategies}
          onAddStrategy={addStrategy}
          onUpdateStrategy={updateStrategy}
          onDeleteStrategy={deleteStrategy}
          onToggleStrategy={toggleStrategy}
        />
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
