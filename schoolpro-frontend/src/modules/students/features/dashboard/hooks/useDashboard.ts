import { useState, useEffect, useCallback } from "react";
import type { StudentAnalyticsData } from "@/modules/students/features/dashboard/types";
import { dashboardService } from "@/modules/students/features/dashboard/services";

export interface UseDashboardResult {
  data: StudentAnalyticsData | null;
  loading: boolean;
  error: Error | null;
  selectedSemester: string;
  setSelectedSemester: (semesterId: string) => void;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getAnalyticsData();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load analytics data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const res = await dashboardService.getAnalyticsData();
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Failed to load analytics data"));
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
    selectedSemester,
    setSelectedSemester,
    refetch: fetchData,
  };
}
