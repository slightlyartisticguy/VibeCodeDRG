'use client';

/**
 * LiveStockCard
 * Fetches a live quote for the given symbol and renders a StockCard.
 * Falls back to a skeleton or a zeroed card when data is missing.
 */

import { StockCard, StockCardSkeleton } from './StockCard';
import { useStockQuote } from '@/hooks';

interface LiveStockCardProps {
  symbol: string;
  name: string;
  onClick?: () => void;
}

export function LiveStockCard({ symbol, name, onClick }: LiveStockCardProps) {
  const { data, isLoading, isError } = useStockQuote(symbol);

  if (isLoading) return <StockCardSkeleton />;

  if (isError || !data) {
    // Minimal fallback so missing data is obvious
    return (
      <StockCard
        symbol={symbol}
        name={`${name} (no data)`}
        price={0}
        change={0}
        changePercent={0}
        onClick={onClick}
      />
    );
  }

  return (
    <StockCard
      symbol={data.symbol}
      name={name}
      price={data.price}
      change={data.change}
      changePercent={data.changePercent}
      onClick={onClick}
    />
  );
}
