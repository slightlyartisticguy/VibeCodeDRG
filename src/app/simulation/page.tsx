'use client';

import { useState, useMemo } from 'react';
import { Play, Settings, Calendar, DollarSign, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchModal } from '@/components/SearchModal';
import { TradeModal } from '@/components/TradeModal';
import { Notifications } from '@/components/Notifications';
import { useApp } from '@/context/AppContext';
import { generateHistoricalData, STOCK_DATABASE, getStock } from '@/lib/stockData';
import { cn, formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import { TradeType, HistoricalDataPoint } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SimulationResult {
  dates: string[];
  portfolioValues: number[];
  benchmarkValues: number[];
  trades: Array<{
    date: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
  }>;
  metrics: {
    totalReturn: number;
    benchmarkReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
  };
}

export default function SimulationPage() {
  const { state, dispatch, executeTrade } = useApp();
  const { portfolio, strategies, notifications } = state;

  const [tradeModal, setTradeModal] = useState<{
    symbol: string;
    name: string;
    type: TradeType;
    maxShares?: number;
  } | null>(null);

  // Simulation configuration
  const [config, setConfig] = useState({
    initialCash: 100000,
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    selectedStrategies: [] as string[],
    selectedStocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'] as string[],
    benchmark: 'SPY',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Handle search stock selection
  const handleSearchSelect = (symbol: string, name: string) => {
    if (!config.selectedStocks.includes(symbol)) {
      setConfig({ ...config, selectedStocks: [...config.selectedStocks, symbol] });
    }
  };

  // Run simulation
  const runSimulation = () => {
    setIsRunning(true);

    // Generate historical data for simulation
    setTimeout(() => {
      const days = Math.ceil(
        (new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) /
        (24 * 60 * 60 * 1000)
      );

      // Get benchmark data
      const benchmarkData = generateHistoricalData(config.benchmark, days);

      // Simple simulation: equal weight portfolio with rebalancing
      const portfolioValues: number[] = [];
      const benchmarkValues: number[] = [];
      const dates: string[] = [];
      const trades: SimulationResult['trades'] = [];

      let cash = config.initialCash;
      let positions: { [symbol: string]: number } = {};
      
      // Initial allocation
      const allocationPerStock = config.initialCash / (config.selectedStocks.length + 1); // +1 for cash
      
      // Generate stock data
      const stocksData: { [symbol: string]: HistoricalDataPoint[] } = {};
      config.selectedStocks.forEach((symbol) => {
        stocksData[symbol] = generateHistoricalData(symbol, days);
      });

      // Run simulation day by day
      benchmarkData.forEach((day, index) => {
        dates.push(day.date);

        // Calculate benchmark value
        const benchmarkValue = index === 0
          ? config.initialCash
          : (config.initialCash * day.close) / benchmarkData[0].close;
        benchmarkValues.push(benchmarkValue);

        // First day: buy stocks
        if (index === 0) {
          config.selectedStocks.forEach((symbol) => {
            const stockPrice = stocksData[symbol][0]?.close || 100;
            const sharesToBuy = Math.floor(allocationPerStock / stockPrice);
            if (sharesToBuy > 0) {
              positions[symbol] = sharesToBuy;
              cash -= sharesToBuy * stockPrice;
              trades.push({
                date: day.date,
                symbol,
                type: 'BUY',
                shares: sharesToBuy,
                price: stockPrice,
              });
            }
          });
        }

        // Calculate portfolio value
        let positionsValue = 0;
        config.selectedStocks.forEach((symbol) => {
          const shares = positions[symbol] || 0;
          const stockData = stocksData[symbol];
          const price = stockData[index]?.close || stockData[stockData.length - 1]?.close || 100;
          positionsValue += shares * price;
        });

        portfolioValues.push(cash + positionsValue);

        // Apply strategies (simplified)
        const activeStrategies = strategies.filter(
          (s) => s.isActive && config.selectedStrategies.includes(s.id)
        );

        activeStrategies.forEach((strategy) => {
          strategy.conditions.forEach((condition) => {
            config.selectedStocks.forEach((symbol) => {
              const stockData = stocksData[symbol];
              const currentPrice = stockData[index]?.close || 0;
              const prevPrice = stockData[index - 1]?.close || currentPrice;
              const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;

              let conditionMet = false;

              if (condition.indicator === 'PRICE_CHANGE_PERCENT') {
                if (condition.operator === 'LESS_THAN' && priceChange < condition.value) {
                  conditionMet = true;
                } else if (condition.operator === 'GREATER_THAN' && priceChange > condition.value) {
                  conditionMet = true;
                }
              }

              if (conditionMet) {
                const action = strategy.action;
                if (action.type === 'BUY' && cash > 0) {
                  const amountToSpend = action.amountType === 'PERCENT_PORTFOLIO'
                    ? (cash + positionsValue) * (action.amount / 100)
                    : action.amountType === 'DOLLAR_AMOUNT'
                    ? action.amount
                    : action.amount * currentPrice;
                  
                  const sharesToBuy = Math.floor(Math.min(amountToSpend, cash) / currentPrice);
                  if (sharesToBuy > 0) {
                    positions[symbol] = (positions[symbol] || 0) + sharesToBuy;
                    cash -= sharesToBuy * currentPrice;
                    trades.push({
                      date: day.date,
                      symbol,
                      type: 'BUY',
                      shares: sharesToBuy,
                      price: currentPrice,
                    });
                  }
                }
              }
            });
          });
        });
      });

      // Calculate metrics
      const totalReturn = ((portfolioValues[portfolioValues.length - 1] - config.initialCash) / config.initialCash) * 100;
      const benchmarkReturn = ((benchmarkValues[benchmarkValues.length - 1] - config.initialCash) / config.initialCash) * 100;

      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = portfolioValues[0];
      portfolioValues.forEach((value) => {
        if (value > peak) peak = value;
        const drawdown = ((peak - value) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });

      // Calculate daily returns for Sharpe ratio
      const dailyReturns: number[] = [];
      for (let i = 1; i < portfolioValues.length; i++) {
        dailyReturns.push((portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1]);
      }
      const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
      const stdDev = Math.sqrt(
        dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
      );
      const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

      // Win rate (positive trades)
      const profitableTrades = trades.filter((t, i) => {
        if (t.type === 'SELL' && i > 0) {
          const buyTrade = trades.slice(0, i).reverse().find((bt) => bt.symbol === t.symbol && bt.type === 'BUY');
          return buyTrade && t.price > buyTrade.price;
        }
        return false;
      });
      const winRate = trades.filter(t => t.type === 'SELL').length > 0
        ? (profitableTrades.length / trades.filter(t => t.type === 'SELL').length) * 100
        : 0;

      setResult({
        dates,
        portfolioValues,
        benchmarkValues,
        trades,
        metrics: {
          totalReturn,
          benchmarkReturn,
          sharpeRatio,
          maxDrawdown,
          winRate,
          totalTrades: trades.length,
        },
      });

      setIsRunning(false);
    }, 1500);
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!result) return [];
    return result.dates.map((date, i) => ({
      date,
      portfolio: result.portfolioValues[i],
      benchmark: result.benchmarkValues[i],
    }));
  }, [result]);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Simulation</h1>
          <p className="text-gray-500 mt-1">
            Test your trading strategies with historical data
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Simulation Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Capital
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={config.initialCash}
                      onChange={(e) =>
                        setConfig({ ...config, initialCash: parseFloat(e.target.value) || 10000 })
                      }
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={config.startDate}
                      onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={config.endDate}
                      onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benchmark
                  </label>
                  <select
                    value={config.benchmark}
                    onChange={(e) => setConfig({ ...config, benchmark: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="SPY">S&P 500 (SPY)</option>
                    <option value="QQQ">NASDAQ 100 (QQQ)</option>
                    <option value="DIA">Dow Jones (DIA)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Stocks */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Selected Stocks</h3>
              <div className="flex flex-wrap gap-2">
                {config.selectedStocks.map((symbol) => (
                  <span
                    key={symbol}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {symbol}
                    <button
                      onClick={() =>
                        setConfig({
                          ...config,
                          selectedStocks: config.selectedStocks.filter((s) => s !== symbol),
                        })
                      }
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  const event = new CustomEvent('openSearch');
                  window.dispatchEvent(event);
                }}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                + Add stock
              </button>
            </div>

            {/* Strategies */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Apply Strategies</h3>
              {strategies.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No strategies created yet. Create strategies in the Strategies page.
                </p>
              ) : (
                <div className="space-y-2">
                  {strategies.map((strategy) => (
                    <label
                      key={strategy.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={config.selectedStrategies.includes(strategy.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({
                              ...config,
                              selectedStrategies: [...config.selectedStrategies, strategy.id],
                            });
                          } else {
                            setConfig({
                              ...config,
                              selectedStrategies: config.selectedStrategies.filter(
                                (id) => id !== strategy.id
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{strategy.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              onClick={runSimulation}
              disabled={isRunning || config.selectedStocks.length === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors',
                isRunning || config.selectedStocks.length === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Simulation
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <>
                {/* Performance Metrics */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500 mb-1">Total Return</p>
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        result.metrics.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
                      )}
                    >
                      {formatPercent(result.metrics.totalReturn)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      vs {formatPercent(result.metrics.benchmarkReturn)} benchmark
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500 mb-1">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.metrics.sharpeRatio.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Risk-adjusted return</p>
                  </div>
                  <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500 mb-1">Max Drawdown</p>
                    <p className="text-2xl font-bold text-danger-600">
                      -{result.metrics.maxDrawdown.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Largest peak-to-trough</p>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short' });
                          }}
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
                                  <p className="text-sm text-gray-500 mb-1">
                                    {formatDate(payload[0].payload.date)}
                                  </p>
                                  <p className="text-sm font-medium text-primary-600">
                                    Portfolio: {formatCurrency(payload[0].payload.portfolio)}
                                  </p>
                                  <p className="text-sm font-medium text-gray-500">
                                    Benchmark: {formatCurrency(payload[0].payload.benchmark)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="portfolio"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          name="Portfolio"
                        />
                        <Line
                          type="monotone"
                          dataKey="benchmark"
                          stroke="#9ca3af"
                          strokeWidth={2}
                          dot={false}
                          name="Benchmark"
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trade Summary */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Trades</p>
                      <p className="text-xl font-bold text-gray-900">{result.metrics.totalTrades}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Final Value</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(result.portfolioValues[result.portfolioValues.length - 1])}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Alpha</p>
                      <p
                        className={cn(
                          'text-xl font-bold',
                          result.metrics.totalReturn - result.metrics.benchmarkReturn >= 0
                            ? 'text-success-600'
                            : 'text-danger-600'
                        )}
                      >
                        {formatPercent(result.metrics.totalReturn - result.metrics.benchmarkReturn)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Win Rate</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.metrics.winRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Recent Trades */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Trades</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.trades.slice(-10).reverse().map((trade, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                trade.type === 'BUY'
                                  ? 'bg-success-100 text-success-700'
                                  : 'bg-danger-100 text-danger-700'
                              )}
                            >
                              {trade.type}
                            </span>
                            <span className="font-medium">{trade.symbol}</span>
                            <span className="text-gray-500">
                              {trade.shares} shares @ {formatCurrency(trade.price)}
                            </span>
                          </div>
                          <span className="text-gray-500">{formatDate(trade.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configure and Run Simulation
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Set up your simulation parameters on the left and click "Run Simulation" to see
                  how your portfolio would have performed with historical data.
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Educational Simulation Only</p>
                <p className="text-amber-700 mt-1">
                  This simulation uses generated historical data for educational purposes. Past performance
                  does not guarantee future results. This is not financial advice.
                </p>
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

      {/* Notifications */}
      <Notifications
        notifications={notifications}
        onDismiss={(id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })}
      />
    </div>
  );
}
