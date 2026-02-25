'use client';

/**
 * Stock Card Component
 * Displays individual stock information in a compact card
 */

import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isLoading?: boolean;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
  onClick?: () => void;
}

/**
 * Formats a number as currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number as percentage
 */
function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  isLoading,
  isWatchlisted,
  onToggleWatchlist,
  onClick,
}: StockCardProps) {
  const isPositive = change >= 0;

  if (isLoading) {
    return <StockCardSkeleton />;
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
              {symbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold">{symbol}</p>
              <p className="text-sm text-muted-foreground truncate max-w-[100px]">
                {name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist?.();
            }}
          >
            <Star
              className={cn(
                'h-4 w-4',
                isWatchlisted
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          </Button>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(price)}</p>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
              isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{formatPercent(changePercent)}</span>
          </div>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          <span
            className={cn(
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {change >= 0 ? '+' : ''}
            {formatCurrency(change)}
          </span>{' '}
          today
        </div>
      </CardContent>
    </Card>
  );
}

export function StockCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="mt-4 flex items-end justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-20 mt-2" />
      </CardContent>
    </Card>
  );
}
