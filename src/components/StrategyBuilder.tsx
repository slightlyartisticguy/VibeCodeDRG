'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  Strategy,
  StrategyCondition,
  StrategyAction,
  ConditionOperator,
  IndicatorType,
  TradeType,
} from '@/types';
import { cn, generateId } from '@/lib/utils';

const INDICATORS: { value: IndicatorType; label: string; description: string }[] = [
  { value: 'PRICE', label: 'Stock Price', description: 'Current stock price' },
  { value: 'PRICE_CHANGE_PERCENT', label: 'Price Change %', description: 'Daily price change percentage' },
  { value: 'VOLUME', label: 'Volume', description: 'Trading volume' },
  { value: 'SMA_20', label: 'SMA 20', description: '20-day Simple Moving Average' },
  { value: 'SMA_50', label: 'SMA 50', description: '50-day Simple Moving Average' },
  { value: 'SMA_200', label: 'SMA 200', description: '200-day Simple Moving Average' },
  { value: 'RSI', label: 'RSI', description: 'Relative Strength Index (14-day)' },
  { value: 'POSITION_GAIN_PERCENT', label: 'Position Gain %', description: 'Unrealized gain/loss percentage' },
];

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'GREATER_THAN', label: '>' },
  { value: 'LESS_THAN', label: '<' },
  { value: 'EQUALS', label: '=' },
  { value: 'GREATER_THAN_OR_EQUAL', label: '≥' },
  { value: 'LESS_THAN_OR_EQUAL', label: '≤' },
  { value: 'CROSSES_ABOVE', label: 'Crosses Above' },
  { value: 'CROSSES_BELOW', label: 'Crosses Below' },
];

interface StrategyBuilderProps {
  strategies: Strategy[];
  onAddStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateStrategy: (strategy: Strategy) => void;
  onDeleteStrategy: (id: string) => void;
  onToggleStrategy: (id: string) => void;
}

export function StrategyBuilder({
  strategies,
  onAddStrategy,
  onUpdateStrategy,
  onDeleteStrategy,
  onToggleStrategy,
}: StrategyBuilderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newStrategy, setNewStrategy] = useState<{
    name: string;
    description: string;
    conditions: StrategyCondition[];
    action: StrategyAction;
  }>({
    name: '',
    description: '',
    conditions: [
      {
        id: generateId(),
        indicator: 'PRICE_CHANGE_PERCENT',
        operator: 'LESS_THAN',
        value: -5,
      },
    ],
    action: {
      id: generateId(),
      type: 'BUY',
      amountType: 'PERCENT_PORTFOLIO',
      amount: 5,
    },
  });

  const handleAddCondition = () => {
    setNewStrategy({
      ...newStrategy,
      conditions: [
        ...newStrategy.conditions,
        {
          id: generateId(),
          indicator: 'PRICE',
          operator: 'GREATER_THAN',
          value: 0,
        },
      ],
    });
  };

  const handleRemoveCondition = (id: string) => {
    setNewStrategy({
      ...newStrategy,
      conditions: newStrategy.conditions.filter((c) => c.id !== id),
    });
  };

  const handleUpdateCondition = (id: string, updates: Partial<StrategyCondition>) => {
    setNewStrategy({
      ...newStrategy,
      conditions: newStrategy.conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const handleSaveStrategy = () => {
    if (!newStrategy.name.trim() || newStrategy.conditions.length === 0) return;

    onAddStrategy({
      ...newStrategy,
      isActive: false,
    });

    // Reset form
    setNewStrategy({
      name: '',
      description: '',
      conditions: [
        {
          id: generateId(),
          indicator: 'PRICE_CHANGE_PERCENT',
          operator: 'LESS_THAN',
          value: -5,
        },
      ],
      action: {
        id: generateId(),
        type: 'BUY',
        amountType: 'PERCENT_PORTFOLIO',
        amount: 5,
      },
    });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Trading Strategies</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create automated rules to guide your investment decisions during simulations
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Strategy
          </button>
        )}
      </div>

      {/* Create Strategy Form */}
      {isCreating && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create New Strategy</h3>
              <p className="text-sm text-gray-500">Define conditions and actions for automated trading</p>
            </div>
          </div>

          {/* Strategy Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategy Name
              </label>
              <input
                type="text"
                value={newStrategy.name}
                onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                placeholder="e.g., Buy the Dip"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={newStrategy.description}
                onChange={(e) =>
                  setNewStrategy({ ...newStrategy, description: e.target.value })
                }
                placeholder="Brief description of this strategy"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                When these conditions are met:
              </label>
              <button
                onClick={handleAddCondition}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Condition
              </button>
            </div>
            <div className="space-y-3">
              {newStrategy.conditions.map((condition, index) => (
                <div
                  key={condition.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {index > 0 && (
                    <span className="text-sm font-medium text-gray-500">AND</span>
                  )}
                  <select
                    value={condition.indicator}
                    onChange={(e) =>
                      handleUpdateCondition(condition.id, {
                        indicator: e.target.value as IndicatorType,
                      })
                    }
                    className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {INDICATORS.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) =>
                      handleUpdateCondition(condition.id, {
                        operator: e.target.value as ConditionOperator,
                      })
                    }
                    className="w-32 px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={condition.value}
                    onChange={(e) =>
                      handleUpdateCondition(condition.id, {
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-24 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {newStrategy.conditions.length > 1 && (
                    <button
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Then execute this action:
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <select
                value={newStrategy.action.type}
                onChange={(e) =>
                  setNewStrategy({
                    ...newStrategy,
                    action: { ...newStrategy.action, type: e.target.value as TradeType },
                  })
                }
                className="px-3 py-2 border rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
              <input
                type="number"
                value={newStrategy.action.amount}
                onChange={(e) =>
                  setNewStrategy({
                    ...newStrategy,
                    action: {
                      ...newStrategy.action,
                      amount: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-24 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <select
                value={newStrategy.action.amountType}
                onChange={(e) =>
                  setNewStrategy({
                    ...newStrategy,
                    action: {
                      ...newStrategy.action,
                      amountType: e.target.value as 'SHARES' | 'PERCENT_PORTFOLIO' | 'DOLLAR_AMOUNT',
                    },
                  })
                }
                className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="SHARES">Shares</option>
                <option value="PERCENT_PORTFOLIO">% of Portfolio</option>
                <option value="DOLLAR_AMOUNT">$ Amount</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveStrategy}
              disabled={!newStrategy.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Strategy
            </button>
          </div>
        </div>
      )}

      {/* Strategies List */}
      {strategies.length === 0 && !isCreating ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first trading strategy to automate your investment decisions during simulations.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Strategy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={cn(
                'bg-white rounded-xl border overflow-hidden transition-all',
                strategy.isActive && 'ring-2 ring-primary-500'
              )}
            >
              {/* Strategy Header */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedId(expandedId === strategy.id ? null : strategy.id)
                }
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStrategy(strategy.id);
                    }}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                      strategy.isActive
                        ? 'bg-success-100 text-success-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {strategy.isActive ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Pause className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">{strategy.name}</h3>
                    {strategy.description && (
                      <p className="text-sm text-gray-500">{strategy.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      strategy.isActive
                        ? 'bg-success-100 text-success-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {strategy.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {expandedId === strategy.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === strategy.id && (
                <div className="px-6 pb-4 border-t">
                  <div className="py-4 space-y-4">
                    {/* Conditions */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
                      <div className="space-y-2">
                        {strategy.conditions.map((condition, index) => (
                          <div
                            key={condition.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            {index > 0 && (
                              <span className="text-gray-500 font-medium">AND</span>
                            )}
                            <span className="text-gray-700">
                              {INDICATORS.find((i) => i.value === condition.indicator)?.label}
                            </span>
                            <span className="font-medium text-primary-600">
                              {OPERATORS.find((o) => o.value === condition.operator)?.label}
                            </span>
                            <span className="font-semibold">{condition.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Action</h4>
                      <div className="text-sm text-gray-700">
                        <span
                          className={cn(
                            'font-medium',
                            strategy.action.type === 'BUY'
                              ? 'text-success-600'
                              : 'text-danger-600'
                          )}
                        >
                          {strategy.action.type}
                        </span>{' '}
                        <span className="font-semibold">{strategy.action.amount}</span>{' '}
                        {strategy.action.amountType === 'SHARES'
                          ? 'shares'
                          : strategy.action.amountType === 'PERCENT_PORTFOLIO'
                          ? '% of portfolio'
                          : 'dollars'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t">
                    <button
                      onClick={() => onDeleteStrategy(strategy.id)}
                      className="px-3 py-1.5 text-sm font-medium text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Educational Purpose Only</p>
          <p className="text-amber-700 mt-1">
            These strategies are for learning and simulation purposes only. Always conduct thorough research
            and consider consulting a financial advisor before making real investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
