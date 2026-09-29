import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { StudentAnalyticsData } from "@/modules/students/features/dashboard/types";
import { dashboardService } from "@/modules/students/features/dashboard/services";

export interface UseDashboardResult {
  data: StudentAnalyticsData | null;
  loading: boolean;
  error: Error | null;
  academicYear: string;
  semester: string;
  setAcademicYear: (year: string) => void;
  setSemester: (semester: string) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
}

const DEFAULT_YEAR = "2025-2026";
const DEFAULT_SEMESTER = "hk1";

export function useDashboard(): UseDashboardResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialYear = useMemo(() => {
    return searchParams.get("year") || DEFAULT_YEAR;
  }, [searchParams]);

  const initialSemester = useMemo(() => {
    return searchParams.get("semester") || DEFAULT_SEMESTER;
  }, [searchParams]);

  const [academicYear, setAcademicYearState] = useState<string>(initialYear);
  const [semester, setSemesterState] = useState<string>(initialSemester);
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Sync state to URL params (only set keys with active data)
  const updateUrlParams = useCallback(
    (yearVal: string, semVal: string) => {
      const params = new URLSearchParams();
      if (yearVal && yearVal !== DEFAULT_YEAR) {
        params.set("year", yearVal);
      }
      if (semVal && semVal !== DEFAULT_SEMESTER) {
        params.set("semester", semVal);
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const setAcademicYear = useCallback(
    (year: string) => {
      setAcademicYearState(year);
      updateUrlParams(year, semester);
    },
    [semester, updateUrlParams],
  );

  const setSemester = useCallback(
    (sem: string) => {
      setSemesterState(sem);
      updateUrlParams(academicYear, sem);
    },
    [academicYear, updateUrlParams],
  );

  const resetFilters = useCallback(() => {
    setAcademicYearState(DEFAULT_YEAR);
    setSemesterState(DEFAULT_SEMESTER);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

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
        setLoading(true);
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
  }, [academicYear, semester]);

  return {
    data,
    loading,
    error,
    academicYear,
    semester,
    setAcademicYear,
    setSemester,
    resetFilters,
    refetch: fetchData,
  };
}
