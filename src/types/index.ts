// Stock and market data types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  exchange: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  timestamp: Date;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Portfolio types
export interface Position {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  totalCost: number;
  gain: number;
  gainPercent: number;
  purchaseDate: string;
}

export interface Portfolio {
  id: string;
  name: string;
  cash: number;
  initialCash: number;
  positions: Position[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  cash: number;
  positionsValue: number;
}

// Trade types
export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  type: TradeType;
  shares: number;
  price: number;
  total: number;
  timestamp: string;
  notes?: string;
}

// Strategy types
export type ConditionOperator = 
  | 'GREATER_THAN' 
  | 'LESS_THAN' 
  | 'EQUALS' 
  | 'GREATER_THAN_OR_EQUAL' 
  | 'LESS_THAN_OR_EQUAL'
  | 'CROSSES_ABOVE'
  | 'CROSSES_BELOW';

export type IndicatorType = 
  | 'PRICE' 
  | 'PRICE_CHANGE_PERCENT' 
  | 'VOLUME' 
  | 'SMA_20' 
  | 'SMA_50' 
  | 'SMA_200'
  | 'RSI'
  | 'PORTFOLIO_VALUE'
  | 'POSITION_GAIN_PERCENT';

export interface StrategyCondition {
  id: string;
  indicator: IndicatorType;
  operator: ConditionOperator;
  value: number;
  symbol?: string; // Optional - if empty, applies to all holdings
}

export interface StrategyAction {
  id: string;
  type: TradeType;
  amountType: 'SHARES' | 'PERCENT_PORTFOLIO' | 'DOLLAR_AMOUNT';
  amount: number;
  symbol?: string; // Optional - if empty, applies to triggering position
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: StrategyCondition[];
  action: StrategyAction;
  createdAt: string;
  updatedAt: string;
}

// Simulation types
export interface SimulationConfig {
  startDate: string;
  endDate: string;
  initialCash: number;
  strategies: Strategy[];
  rebalanceFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface SimulationResult {
  id: string;
  config: SimulationConfig;
  portfolioSnapshots: PortfolioSnapshot[];
  trades: Trade[];
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  completedAt: string;
}

// Search types
export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

// Time range for charts
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Watchlist types
export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: string;
  notes?: string;
}

// Notification types
export type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
}
