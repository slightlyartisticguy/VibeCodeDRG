'use client';

/**
 * StockDetailPanel Component
 * Fetches and displays quote + company overview for a selected symbol.
 * Data is loaded on demand from Alpha Vantage; nothing is stored.
 */

import { X, TrendingUp, TrendingDown, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useStockQuote, useStockOverview } from '@/hooks';

interface StockDetailPanelProps {
  symbol: string;
  name?: string;
  type?: string;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
}

function StatRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function StockDetailPanel({ symbol, name, type, onClose }: StockDetailPanelProps) {
  const {
    data: quote,
    isLoading: isQuoteLoading,
    isError: isQuoteError,
    error: quoteError,
  } = useStockQuote(symbol);

  const {
    data: overview,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useStockOverview(symbol);

  const isLoading = isQuoteLoading || isOverviewLoading;

  // Hard error — symbol not found at all
  const notFound =
    isQuoteError &&
    quoteError?.message?.includes('No data found');

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{symbol}</CardTitle>
              {type && (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {type}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isOverviewLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                overview?.name ?? name ?? symbol
              )}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Not-found error */}
        {notFound && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium text-destructive">Symbol Not Found</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              &ldquo;{symbol}&rdquo; could not be found on Alpha Vantage. It may be
              delisted, misspelled, or unavailable.
            </p>
            <Button size="sm" variant="outline" className="mt-2" onClick={onClose}>
              Try another search
            </Button>
          </div>
        )}

        {/* API error (rate limit, network, etc.) */}
        {isQuoteError && !notFound && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Failed to load quote data. You may have hit the API rate limit — please wait a moment and try again.</span>
          </div>
        )}

        {/* Loading skeleton */}
        {isQuoteLoading && !isQuoteError && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-40" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </div>
        )}

        {/* Quote data */}
        {quote && (
          <>
            {/* Price & change */}
            <div>
              <p className="text-3xl font-bold">{formatCurrency(quote.price)}</p>
              <div className="flex items-center gap-2 mt-1">
                {quote.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {quote.change >= 0 ? '+' : ''}
                  {quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%)
                </span>
                {quote.latestTradingDay && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    as of {quote.latestTradingDay}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Trading stats */}
            <div>
              <p className="text-sm font-semibold mb-2">Trading Data</p>
              <StatRow label="Open" value={formatCurrency(quote.open)} />
              <StatRow label="High" value={formatCurrency(quote.high)} />
              <StatRow label="Low" value={formatCurrency(quote.low)} />
              <StatRow label="Prev Close" value={formatCurrency(quote.previousClose)} />
              <StatRow label="Volume" value={quote.volume?.toLocaleString()} />
            </div>
          </>
        )}

        {/* Overview data */}
        {overview && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-semibold mb-2">Company Overview</p>
              {overview.sector && <StatRow label="Sector" value={overview.sector} />}
              {overview.industry && <StatRow label="Industry" value={overview.industry} />}
              {overview.exchange && <StatRow label="Exchange" value={overview.exchange} />}
              {overview.marketCap > 0 && (
                <StatRow label="Market Cap" value={formatLargeNumber(overview.marketCap)} />
              )}
              {overview.peRatio !== null && (
                <StatRow label="P/E Ratio" value={overview.peRatio?.toFixed(2)} />
              )}
              {overview.eps !== null && (
                <StatRow label="EPS" value={formatCurrency(overview.eps!)} />
              )}
              {overview.dividendYield !== null && (
                <StatRow label="Dividend Yield" value={`${(overview.dividendYield! * 100).toFixed(2)}%`} />
              )}
              {overview.weekHigh52 > 0 && (
                <StatRow label="52-Week High" value={formatCurrency(overview.weekHigh52)} />
              )}
              {overview.weekLow52 > 0 && (
                <StatRow label="52-Week Low" value={formatCurrency(overview.weekLow52)} />
              )}
            </div>

            {overview.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-2">About</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {overview.description}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {isOverviewError && !isQuoteError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Company overview data unavailable for this security.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
