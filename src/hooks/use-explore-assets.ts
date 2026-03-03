/**
 * TanStack Query hook for fetching explore asset group data.
 */
import { useQuery } from "@tanstack/react-query";
import type { ExploreAssetGroupResponse } from "@/app/api/explore-assets/route";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Fetch performance data for a single asset group in a given year.
 */
export function useAssetGroup(groupId: string, year: number) {
  return useQuery<ExploreAssetGroupResponse>({
    queryKey: ["explore-assets", groupId, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/explore-assets?group=${encodeURIComponent(groupId)}&year=${year}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch group ${groupId} for ${year}`);
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as ExploreAssetGroupResponse;
    },
    // Historical years: cache for 1 hour. Current year: 5 minutes.
    staleTime: year < CURRENT_YEAR ? 1000 * 60 * 60 : 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24, // keep in cache for a day
    enabled: !!groupId && !!year,
  });
}
