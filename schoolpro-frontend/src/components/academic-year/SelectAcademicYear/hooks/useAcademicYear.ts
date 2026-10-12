import { useState, useEffect, useCallback, useRef } from "react";
import type {
  AcademicYearItem,
  AcademicYearQueryParams,
} from "@/components/academic-year/SelectAcademicYear/types";
import {
  academicYearApi,
  MOCK_ACADEMIC_YEARS,
} from "@/components/academic-year/SelectAcademicYear/services/academicYearApi";

export interface UseAcademicYearOptions {
  /**
   * Only fetch the current academic year
   * @default false
   */
  filterCurrentOnly?: boolean;

  /**
   * Exclude locked academic years
   * @default false
   */
  excludeLocked?: boolean;

  /**
   * Filter by specific school UUID
   */
  schoolId?: string;

  /**
   * Search keyword for server-side filter
   */
  search?: string;

  /**
   * Optional pre-populated academic years list to avoid network request
   */
  initialAcademicYears?: AcademicYearItem[];

  /**
   * Auto fetch on mount
   * @default true
   */
  enabled?: boolean;
}

export interface UseAcademicYearReturn {
  academicYears: AcademicYearItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type UseAcademicYearsOptions = UseAcademicYearOptions;
export type UseAcademicYearsReturn = UseAcademicYearReturn;

/**
 * Custom React hook for fetching and managing academic years state.
 */
export const useAcademicYear = (
  options: UseAcademicYearOptions = {},
): UseAcademicYearReturn => {
  const {
    filterCurrentOnly = false,
    excludeLocked = false,
    schoolId,
    search,
    initialAcademicYears,
    enabled = true,
  } = options;

  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>(() => {
    return initialAcademicYears && initialAcademicYears.length > 0
      ? initialAcademicYears
      : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(
      enabled && (!initialAcademicYears || initialAcademicYears.length === 0),
    );
  });
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchAcademicYearsData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const queryParams: AcademicYearQueryParams = {
      is_current: filterCurrentOnly ? true : undefined,
      is_locked: excludeLocked ? false : undefined,
      school_id: schoolId,
      search: search?.trim() || undefined,
    };

    try {
      const data = await academicYearApi.fetchAcademicYears(queryParams);
      if (isMountedRef.current) {
        setAcademicYears(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setIsError(true);
        const errorObj =
          err instanceof Error
            ? err
            : new Error(
                "An unexpected error occurred while fetching academic years.",
              );
        setError(errorObj);
        setAcademicYears(
          academicYearApi.filterMockAcademicYears(queryParams),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filterCurrentOnly, excludeLocked, schoolId, search]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    if (initialAcademicYears && initialAcademicYears.length > 0) {
      return;
    }

    let isSubscribed = true;

    const loadAsync = async () => {
      const queryParams: AcademicYearQueryParams = {
        is_current: filterCurrentOnly ? true : undefined,
        is_locked: excludeLocked ? false : undefined,
        school_id: schoolId,
        search: search?.trim() || undefined,
      };

      try {
        const data = await academicYearApi.fetchAcademicYears(queryParams);
        if (isSubscribed && isMountedRef.current) {
          setAcademicYears(data);
        }
      } catch (err) {
        if (isSubscribed && isMountedRef.current) {
          setIsError(true);
          const errorObj =
            err instanceof Error
              ? err
              : new Error(
                  "An unexpected error occurred while fetching academic years.",
                );
          setError(errorObj);
          setAcademicYears(
            filterCurrentOnly
              ? MOCK_ACADEMIC_YEARS.filter((ay) => ay.is_current)
              : MOCK_ACADEMIC_YEARS,
          );
        }
      } finally {
        if (isSubscribed && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void loadAsync();

    return () => {
      isSubscribed = false;
      isMountedRef.current = false;
    };
  }, [
    enabled,
    filterCurrentOnly,
    excludeLocked,
    schoolId,
    search,
    initialAcademicYears,
  ]);

  return {
    academicYears,
    isLoading,
    isError,
    error,
    refetch: fetchAcademicYearsData,
  };
};

export const useAcademicYears = useAcademicYear;
