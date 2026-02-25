'use client';

/**
 * Search Results Page
 * Displays detailed information for a selected security
 */

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockDetailPanel, StockChart } from '@/components/dashboard';
import { useTimeSeries } from '@/hooks';

export default function SearchResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const symbol = params.symbol as string;
  const name = searchParams.get('name') || symbol;
  const type = searchParams.get('type') || 'stock';

  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useTimeSeries(
    symbol,
    'compact',
    true
  );

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{symbol}</h1>
              <p className="text-sm text-muted-foreground">Search Results</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleHome} className="gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Security Details */}
        <StockDetailPanel
          symbol={symbol}
          name={name}
          type={type}
          onClose={handleBack}
        />

        {/* Stock Chart */}
        {timeSeriesData && timeSeriesData.length > 0 && (
          <StockChart
            symbol={symbol}
            data={timeSeriesData}
            isLoading={isTimeSeriesLoading}
          />
        )}
      </div>
    </div>
  );
}