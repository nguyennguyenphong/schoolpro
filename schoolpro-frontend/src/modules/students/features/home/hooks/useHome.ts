import { useState, useEffect, useCallback } from "react";
import type { HomeData } from "@/modules/students/features/home/types";
import { homeService } from "@/modules/students/features/home/services";

export interface UseHomeResult {
  data: HomeData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Backward compatibility alias
export type UseDashboardResult = UseHomeResult;

export function useHome(): UseHomeResult {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const homeData = await homeService.getHomeData();
      setData(homeData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load home data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const homeData = await homeService.getHomeData();
        if (!ignore) {
          setData(homeData);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Failed to load home data"));
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
