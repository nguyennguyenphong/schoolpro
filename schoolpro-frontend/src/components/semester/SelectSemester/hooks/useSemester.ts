import { useState, useEffect, useCallback, useRef } from "react";
import type {
  SemesterItem,
  SemesterQueryParams,
} from "@/components/semester/SelectSemester/types";
import {
  semesterApi,
  MOCK_SEMESTERS,
} from "@/components/semester/SelectSemester/services/semesterApi";

export interface UseSemesterOptions {
  /**
   * Filter by academic year UUID
   */
  academicYearId?: string;

  /**
   * Filter by specific school UUID
   */
  schoolId?: string;

  /**
   * Only fetch the current active semester
   * @default false
   */
  filterCurrentOnly?: boolean;

  /**
   * Exclude locked semesters
   * @default false
   */
  excludeLocked?: boolean;

  /**
   * Search keyword for server-side filter
   */
  search?: string;

  /**
   * Optional pre-populated semesters list to avoid network request
   */
  initialSemesters?: SemesterItem[];

  /**
   * Auto fetch on mount
   * @default true
   */
  enabled?: boolean;
}

export interface UseSemesterReturn {
  semesters: SemesterItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type UseSemestersOptions = UseSemesterOptions;
export type UseSemestersReturn = UseSemesterReturn;

/**
 * Custom React hook for fetching and managing semesters state.
 */
export const useSemester = (
  options: UseSemesterOptions = {},
): UseSemesterReturn => {
  const {
    academicYearId,
    schoolId,
    filterCurrentOnly = false,
    excludeLocked = false,
    search,
    initialSemesters,
    enabled = true,
  } = options;

  const [semesters, setSemesters] = useState<SemesterItem[]>(() => {
    return initialSemesters && initialSemesters.length > 0
      ? initialSemesters
      : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(
      enabled && (!initialSemesters || initialSemesters.length === 0),
    );
  });
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchSemestersData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const queryParams: SemesterQueryParams = {
      academic_year_id: academicYearId,
      school_id: schoolId,
      is_current: filterCurrentOnly ? true : undefined,
      is_locked: excludeLocked ? false : undefined,
      search: search?.trim() || undefined,
    };

    try {
      const data = await semesterApi.fetchSemesters(queryParams);
      if (isMountedRef.current) {
        setSemesters(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setIsError(true);
        const errorObj =
          err instanceof Error
            ? err
            : new Error(
                "An unexpected error occurred while fetching semesters.",
              );
        setError(errorObj);
        setSemesters(semesterApi.filterMockSemesters(queryParams));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [academicYearId, schoolId, filterCurrentOnly, excludeLocked, search]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    if (initialSemesters && initialSemesters.length > 0) {
      return;
    }

    let isSubscribed = true;

    const loadAsync = async () => {
      const queryParams: SemesterQueryParams = {
        academic_year_id: academicYearId,
        school_id: schoolId,
        is_current: filterCurrentOnly ? true : undefined,
        is_locked: excludeLocked ? false : undefined,
        search: search?.trim() || undefined,
      };

      try {
        const data = await semesterApi.fetchSemesters(queryParams);
        if (isSubscribed && isMountedRef.current) {
          setSemesters(data);
        }
      } catch (err) {
        if (isSubscribed && isMountedRef.current) {
          setIsError(true);
          const errorObj =
            err instanceof Error
              ? err
              : new Error(
                  "An unexpected error occurred while fetching semesters.",
                );
          setError(errorObj);
          setSemesters(
            filterCurrentOnly
              ? MOCK_SEMESTERS.filter((sem) => sem.is_current)
              : MOCK_SEMESTERS,
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
    academicYearId,
    schoolId,
    filterCurrentOnly,
    excludeLocked,
    search,
    initialSemesters,
  ]);

  return {
    semesters,
    isLoading,
    isError,
    error,
    refetch: fetchSemestersData,
  };
};

export const useSemesters = useSemester;
