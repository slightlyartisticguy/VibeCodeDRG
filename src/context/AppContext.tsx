'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Portfolio,
  Position,
  Trade,
  Strategy,
  WatchlistItem,
  Notification,
  PortfolioSnapshot,
  TradeType,
} from '@/types';
import { generateId, calculatePositionMetrics } from '@/lib/utils';

// State interface
interface AppState {
  portfolio: Portfolio;
  trades: Trade[];
  strategies: Strategy[];
  watchlist: WatchlistItem[];
  notifications: Notification[];
  portfolioHistory: PortfolioSnapshot[];
  isLoading: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT_STATE'; payload: Partial<AppState> }
  | { type: 'UPDATE_PORTFOLIO'; payload: Partial<Portfolio> }
  | { type: 'ADD_POSITION'; payload: { symbol: string; name: string; shares: number; price: number } }
  | { type: 'UPDATE_POSITION'; payload: { symbol: string; currentPrice: number } }
  | { type: 'REMOVE_POSITION'; payload: string }
  | { type: 'EXECUTE_TRADE'; payload: { symbol: string; name: string; type: TradeType; shares: number; price: number } }
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'ADD_STRATEGY'; payload: Strategy }
  | { type: 'UPDATE_STRATEGY'; payload: Strategy }
  | { type: 'DELETE_STRATEGY'; payload: string }
  | { type: 'TOGGLE_STRATEGY'; payload: string }
  | { type: 'ADD_TO_WATCHLIST'; payload: WatchlistItem }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'ADD_PORTFOLIO_SNAPSHOT'; payload: PortfolioSnapshot }
  | { type: 'UPDATE_PRICES'; payload: { [symbol: string]: number } }
  | { type: 'RESET_PORTFOLIO'; payload: number };

// Initial state
const INITIAL_CASH = 100000;

const createInitialPortfolio = (): Portfolio => ({
  id: generateId(),
  name: 'My Portfolio',
  cash: INITIAL_CASH,
  initialCash: INITIAL_CASH,
  positions: [],
  totalValue: INITIAL_CASH,
  totalGain: 0,
  totalGainPercent: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const initialState: AppState = {
  portfolio: createInitialPortfolio(),
  trades: [],
  strategies: [],
  watchlist: [],
  notifications: [],
  portfolioHistory: [],
  isLoading: true,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'INIT_STATE':
      return { ...state, ...action.payload, isLoading: false };

    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'EXECUTE_TRADE': {
      const { symbol, name, type, shares, price } = action.payload;
      const total = shares * price;
      let newPositions = [...state.portfolio.positions];
      let newCash = state.portfolio.cash;

      if (type === 'BUY') {
        if (total > newCash) {
          return state; // Insufficient funds
        }
        newCash -= total;

        const existingPosition = newPositions.find((p) => p.symbol === symbol);
        if (existingPosition) {
          const newTotalShares = existingPosition.shares + shares;
          const newTotalCost = existingPosition.totalCost + total;
          const newAvgCost = newTotalCost / newTotalShares;
          
          newPositions = newPositions.map((p) =>
            p.symbol === symbol
              ? calculatePositionMetrics({
                  ...p,
                  shares: newTotalShares,
                  avgCost: newAvgCost,
                  totalCost: newTotalCost,
                  currentPrice: price,
                })
              : p
          );
        } else {
          const newPosition: Position = calculatePositionMetrics({
            id: generateId(),
            symbol,
            name,
            shares,
            avgCost: price,
            currentPrice: price,
            marketValue: total,
            totalCost: total,
            gain: 0,
            gainPercent: 0,
            purchaseDate: new Date().toISOString(),
          });
          newPositions.push(newPosition);
        }
      } else {
        // SELL
        const existingPosition = newPositions.find((p) => p.symbol === symbol);
        if (!existingPosition || existingPosition.shares < shares) {
          return state; // Insufficient shares
        }

        newCash += total;
        const newShares = existingPosition.shares - shares;

        if (newShares === 0) {
          newPositions = newPositions.filter((p) => p.symbol !== symbol);
        } else {
          newPositions = newPositions.map((p) =>
            p.symbol === symbol
              ? calculatePositionMetrics({
                  ...p,
                  shares: newShares,
                  totalCost: p.avgCost * newShares,
                  currentPrice: price,
                })
              : p
          );
        }
      }

      const positionsValue = newPositions.reduce((sum, p) => sum + p.marketValue, 0);
      const totalValue = newCash + positionsValue;
      const totalGain = totalValue - state.portfolio.initialCash;
      const totalGainPercent = (totalGain / state.portfolio.initialCash) * 100;

      const trade: Trade = {
        id: generateId(),
        portfolioId: state.portfolio.id,
        symbol,
        name,
        type,
        shares,
        price,
        total,
        timestamp: new Date().toISOString(),
      };

      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          cash: newCash,
          positions: newPositions,
          totalValue,
          totalGain,
          totalGainPercent,
          updatedAt: new Date().toISOString(),
        },
        trades: [trade, ...state.trades],
      };
    }

    case 'UPDATE_PRICES': {
      const priceMap = action.payload;
      const newPositions = state.portfolio.positions.map((p) => {
        const newPrice = priceMap[p.symbol];
        if (newPrice !== undefined) {
          return calculatePositionMetrics({ ...p, currentPrice: newPrice });
        }
        return p;
      });

      const positionsValue = newPositions.reduce((sum, p) => sum + p.marketValue, 0);
      const totalValue = state.portfolio.cash + positionsValue;
      const totalGain = totalValue - state.portfolio.initialCash;
      const totalGainPercent = (totalGain / state.portfolio.initialCash) * 100;

      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          positions: newPositions,
          totalValue,
          totalGain,
          totalGainPercent,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'ADD_STRATEGY':
      return {
        ...state,
        strategies: [...state.strategies, action.payload],
      };

    case 'UPDATE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };

    case 'DELETE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.filter((s) => s.id !== action.payload),
      };

    case 'TOGGLE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.map((s) =>
          s.id === action.payload ? { ...s, isActive: !s.isActive } : s
        ),
      };

    case 'ADD_TO_WATCHLIST':
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      };

    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter((w) => w.symbol !== action.payload),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case 'ADD_PORTFOLIO_SNAPSHOT':
      return {
        ...state,
        portfolioHistory: [...state.portfolioHistory, action.payload],
      };

    case 'RESET_PORTFOLIO': {
      const newInitialCash = action.payload || INITIAL_CASH;
      return {
        ...state,
        portfolio: {
          ...createInitialPortfolio(),
          cash: newInitialCash,
          initialCash: newInitialCash,
          totalValue: newInitialCash,
        },
        trades: [],
        portfolioHistory: [],
      };
    }

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  executeTrade: (symbol: string, name: string, type: TradeType, shares: number, price: number) => void;
  addToWatchlist: (symbol: string, name: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStrategy: (strategy: Strategy) => void;
  deleteStrategy: (id: string) => void;
  toggleStrategy: (id: string) => void;
  resetPortfolio: (initialCash?: number) => void;
  updatePrices: (prices: { [symbol: string]: number }) => void;
  showNotification: (type: Notification['type'], message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'stock-portfolio-simulator';

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'INIT_STATE', payload: parsed });
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (!state.isLoading) {
      const stateToSave = {
        portfolio: state.portfolio,
        trades: state.trades,
        strategies: state.strategies,
        watchlist: state.watchlist,
        portfolioHistory: state.portfolioHistory,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [state.portfolio, state.trades, state.strategies, state.watchlist, state.portfolioHistory, state.isLoading]);

  // Helper functions
  const executeTrade = (symbol: string, name: string, type: TradeType, shares: number, price: number) => {
    dispatch({ type: 'EXECUTE_TRADE', payload: { symbol, name, type, shares, price } });
    showNotification(
      'SUCCESS',
      `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${shares} shares of ${symbol} at $${price.toFixed(2)}`
    );
  };

  const addToWatchlist = (symbol: string, name: string) => {
    if (!state.watchlist.find((w) => w.symbol === symbol)) {
      dispatch({
        type: 'ADD_TO_WATCHLIST',
        payload: { symbol, name, addedAt: new Date().toISOString() },
      });
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: symbol });
  };

  const addStrategy = (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_STRATEGY',
      payload: { ...strategy, id: generateId(), createdAt: now, updatedAt: now },
    });
  };

  const updateStrategy = (strategy: Strategy) => {
    dispatch({
      type: 'UPDATE_STRATEGY',
      payload: { ...strategy, updatedAt: new Date().toISOString() },
    });
  };

  const deleteStrategy = (id: string) => {
    dispatch({ type: 'DELETE_STRATEGY', payload: id });
  };

  const toggleStrategy = (id: string) => {
    dispatch({ type: 'TOGGLE_STRATEGY', payload: id });
  };

  const resetPortfolio = (initialCash?: number) => {
    dispatch({ type: 'RESET_PORTFOLIO', payload: initialCash || INITIAL_CASH });
    showNotification('INFO', 'Portfolio has been reset');
  };

  const updatePrices = (prices: { [symbol: string]: number }) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
  };

  const showNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: generateId(),
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
    }, 5000);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        executeTrade,
        addToWatchlist,
        removeFromWatchlist,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        toggleStrategy,
        resetPortfolio,
        updatePrices,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
