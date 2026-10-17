import { useState, useEffect, useCallback, useRef } from "react";
import type {
  DepartmentItem,
  DepartmentQueryParams,
} from "@/components/departments/SelectDepartment/types";
import {
  departmentApi,
  MOCK_DEPARTMENTS,
} from "@/components/departments/SelectDepartment/services/departmentApi";

export interface UseDepartmentOptions {
  /**
   * Only fetch active departments
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Filter by department type (SUBJECT, ADMINISTRATION, etc.)
   */
  departmentType?: string;

  /**
   * Filter by specific school UUID
   */
  schoolId?: string;

  /**
   * Search keyword for server-side filter
   */
  search?: string;

  /**
   * Optional pre-populated departments list to avoid network request
   */
  initialDepartments?: DepartmentItem[];

  /**
   * Auto fetch on mount
   * @default true
   */
  enabled?: boolean;
}

export interface UseDepartmentReturn {
  departments: DepartmentItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom React hook for fetching and managing educational & administrative departments state.
 */
export const useDepartment = (
  options: UseDepartmentOptions = {},
): UseDepartmentReturn => {
  const {
    filterActiveOnly = true,
    departmentType,
    schoolId,
    search,
    initialDepartments,
    enabled = true,
  } = options;

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    return initialDepartments && initialDepartments.length > 0
      ? initialDepartments
      : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(
      enabled && (!initialDepartments || initialDepartments.length === 0),
    );
  });
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchDepartmentsData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const queryParams: DepartmentQueryParams = {
      is_active: filterActiveOnly ? true : undefined,
      department_type: departmentType,
      school_id: schoolId,
      search: search?.trim() || undefined,
    };

    try {
      const data = await departmentApi.fetchDepartments(queryParams);
      if (isMountedRef.current) {
        setDepartments(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setIsError(true);
        const errorObj =
          err instanceof Error
            ? err
            : new Error(
                "An unexpected error occurred while fetching departments.",
              );
        setError(errorObj);
        setDepartments(
          filterActiveOnly
            ? MOCK_DEPARTMENTS.filter((d) => d.is_active)
            : MOCK_DEPARTMENTS,
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filterActiveOnly, departmentType, schoolId, search]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    if (initialDepartments && initialDepartments.length > 0) {
      return;
    }

    let isSubscribed = true;

    const loadAsync = async () => {
      const queryParams: DepartmentQueryParams = {
        is_active: filterActiveOnly ? true : undefined,
        department_type: departmentType,
        school_id: schoolId,
        search: search?.trim() || undefined,
      };

      try {
        const data = await departmentApi.fetchDepartments(queryParams);
        if (isSubscribed) {
          setDepartments(data);
        }
      } catch (err) {
        if (isSubscribed) {
          setIsError(true);
          const errorObj =
            err instanceof Error
              ? err
              : new Error(
                  "An unexpected error occurred while fetching departments.",
                );
          setError(errorObj);
          setDepartments(
            filterActiveOnly
              ? MOCK_DEPARTMENTS.filter((d) => d.is_active)
              : MOCK_DEPARTMENTS,
          );
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    void loadAsync();

    return () => {
      isSubscribed = false;
      isMountedRef.current = false;
    };
  }, [enabled, filterActiveOnly, departmentType, schoolId, search, initialDepartments]);

  return {
    departments,
    isLoading,
    isError,
    error,
    refetch: fetchDepartmentsData,
  };
};
