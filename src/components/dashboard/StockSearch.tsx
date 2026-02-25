'use client';

/**
 * StockSearch Component
 * Searchable dropdown that matches against the local securities database
 * and falls back to Alpha Vantage SYMBOL_SEARCH for unknown tickers.
 * Fires onSelect when a user picks a result.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, AlertCircle, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { searchSecuritiesLocal, type SecurityEntry } from '@/data/securities';
import { useSymbolSearch } from '@/hooks';

interface StockSearchProps {
  /** Called when the user selects a security from the results (callback mode) */
  onSelect?: (entry: { symbol: string; name: string; type: string }) => void;
  /** If true, navigates to search results page instead of calling onSelect */
  navigationMode?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional wrapper className */
  className?: string;
}

type TypeFilter = 'all' | 'stock' | 'etf' | 'index';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  stock: TrendingUp,
  etf: BarChart3,
  index: PieChart,
};

const TYPE_COLOURS: Record<string, string> = {
  stock: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  etf: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  index: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export function StockSearch({ onSelect, navigationMode = false, placeholder = 'Search stocks, ETFs, index funds...', className }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Local search (instant, no API call)
  const localResults = searchSecuritiesLocal(query, typeFilter);

  // API fallback — only trigger when local results are sparse and query ≥ 2 chars
  const shouldSearchApi = query.length >= 2 && localResults.length < 3;
  const { data: apiResults, isLoading: isApiLoading, isError: isApiError } = useSymbolSearch(
    query,
    shouldSearchApi
  );

  // Merge local + API, de-duplicating by symbol
  const mergedResults = (() => {
    const seen = new Set(localResults.map((r) => r.symbol));
    const merged: SecurityEntry[] = [...localResults];

    if (apiResults) {
      for (const item of apiResults) {
        if (!seen.has(item.symbol)) {
          const t = item.type === 'ETF' ? 'etf' : 'stock';
          if (typeFilter === 'all' || typeFilter === t) {
            merged.push({ symbol: item.symbol, name: item.name, type: t });
            seen.add(item.symbol);
          }
        }
      }
    }

    return merged.slice(0, 15);
  })();

  // Error state
  useEffect(() => {
    if (query.length >= 2 && mergedResults.length === 0 && !isApiLoading) {
      setError(`No results found for "${query}". Check the symbol or try a different search.`);
    } else {
      setError(null);
    }
  }, [query, mergedResults.length, isApiLoading]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback(
    (entry: SecurityEntry) => {
      setQuery('');
      setIsOpen(false);
      setError(null);
      
      if (navigationMode) {
        router.push(`/search/${entry.symbol}?name=${encodeURIComponent(entry.name)}&type=${entry.type}`);
      } else {
        onSelect?.(entry);
      }
    },
    [onSelect, navigationMode, router]
  );

  const handleClear = () => {
    setQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && navigationMode && mergedResults.length > 0) {
      // Navigate to first result on Enter in navigation mode
      handleSelect(mergedResults[0]);
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 bg-muted/50"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 1 && (
        <div className="absolute z-50 mt-1 w-full min-w-[320px] rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {/* Type filter tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
            {(['all', 'stock', 'etf', 'index'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {t === 'all' ? 'All' : t === 'etf' ? 'ETFs' : t === 'index' ? 'Index Funds' : 'Stocks'}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {mergedResults.length > 0 ? (
              <ul>
                {mergedResults.map((entry) => {
                  const Icon = TYPE_ICONS[entry.type] ?? TrendingUp;
                  return (
                    <li key={entry.symbol}>
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors"
                        onClick={() => handleSelect(entry)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm">{entry.symbol}</span>
                          <span className="ml-2 text-sm text-muted-foreground truncate">
                            {entry.name}
                          </span>
                        </div>
                        <Badge variant="secondary" className={cn('text-[10px] uppercase', TYPE_COLOURS[entry.type])}>
                          {entry.type}
                        </Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : isApiLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {isApiError && !error && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 border-t border-border">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                API search unavailable — showing local results only
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
