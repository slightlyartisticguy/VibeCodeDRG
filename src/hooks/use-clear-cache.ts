"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cache/clear", { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to clear cache");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Cache cleared successfully. Data will be re-fetched.");
      queryClient.invalidateQueries(); // Invalidate all queries
    },
    onError: () => {
      toast.error("Failed to clear cache.");
    },
  });
}
