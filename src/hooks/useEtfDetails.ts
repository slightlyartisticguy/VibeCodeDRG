import { useQuery } from "@tanstack/react-query";

export interface EtfHolding {
  symbol: string;
  holdingName: string;
  holdingPercent: number;
}

export interface EtfDetails {
  topHoldings?: {
    holdings: EtfHolding[];
    sectorWeightings?: Record<string, number>;
    cashPosition?: number;
    stockPosition?: number;
    bondPosition?: number;
  };
  assetProfile?: {
    longBusinessSummary: string;
  };
}

export function useEtfDetails(symbol: string | null) {
  return useQuery<EtfDetails>({
    queryKey: ["etf-details", symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const response = await fetch(`/api/etf/details?symbol=${symbol}`);
      if (!response.ok) throw new Error("Failed to fetch fund details");
      return response.json();
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
