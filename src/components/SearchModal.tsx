'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { searchStocks, getStock } from '@/lib/stockData';
import { SearchResult } from '@/types';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

interface SearchModalProps {
  onSelectStock: (symbol: string, name: string) => void;
}

export function SearchModal({ onSelectStock }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      setResults(searchStocks(value));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelectStock(result.symbol, result.name);
      setIsOpen(false);
      setQuery('');
      setResults([]);
    },
    [onSelectStock]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOpenSearch = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openSearch', handleOpenSearch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openSearch', handleOpenSearch);
    };
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-16 px-4">
        <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks by symbol or name..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 py-4 text-lg outline-none"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((result, index) => {
                  const stock = getStock(result.symbol);
                  const isPositive = stock && stock.change >= 0;
                  
                  return (
                    <li key={result.symbol}>
                      <button
                        onClick={() => handleSelect(result)}
                        className={cn(
                          'w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors',
                          index === selectedIndex && 'bg-primary-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">
                              {result.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">
                              {result.symbol}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {result.name}
                            </div>
                          </div>
                        </div>
                        {stock && (
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(stock.price)}
                            </div>
                            <div
                              className={cn(
                                'flex items-center gap-1 text-sm',
                                isPositive ? 'text-success-600' : 'text-danger-600'
                              )}
                            >
                              {isPositive ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {formatPercent(stock.changePercent)}
                            </div>
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : query ? (
              <div className="py-12 text-center text-gray-500">
                No stocks found for "{query}"
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                Start typing to search stocks...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
