import { useState, useEffect, useCallback, useRef } from "react";
import type {
  SubjectItem,
  SubjectQueryParams,
} from "@/components/subjects/SelectSubject/types";
import {
  subjectApi,
  MOCK_SUBJECTS,
} from "@/components/subjects/SelectSubject/services/subjectApi";

export interface UseSubjectsOptions {
  /**
   * Only fetch active subjects
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Filter by department UUID
   */
  departmentId?: string;

  /**
   * Filter by grade level (10, 11, 12)
   */
  gradeLevel?: number;

  /**
   * Filter by evaluation type (SCORE, COMMENT)
   */
  evaluationType?: string;

  /**
   * Filter by compulsory status
   */
  isCompulsory?: boolean;

  /**
   * Filter by specific school UUID
   */
  schoolId?: string;

  /**
   * Search keyword for server-side filter
   */
  search?: string;

  /**
   * Optional pre-populated subjects list to avoid network request
   */
  initialSubjects?: SubjectItem[];

  /**
   * Auto fetch on mount
   * @default true
   */
  enabled?: boolean;
}

export interface UseSubjectsReturn {
  subjects: SubjectItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type UseSubjectOptions = UseSubjectsOptions;
export type UseSubjectReturn = UseSubjectsReturn;

/**
 * Custom React hook for fetching and managing subjects state.
 */
export const useSubjects = (
  options: UseSubjectsOptions = {},
): UseSubjectsReturn => {
  const {
    filterActiveOnly = true,
    departmentId,
    gradeLevel,
    evaluationType,
    isCompulsory,
    schoolId,
    search,
    initialSubjects,
    enabled = true,
  } = options;

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    return initialSubjects && initialSubjects.length > 0 ? initialSubjects : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(
      enabled && (!initialSubjects || initialSubjects.length === 0),
    );
  });
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchSubjectsData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const queryParams: SubjectQueryParams = {
      is_active: filterActiveOnly ? true : undefined,
      department_id: departmentId,
      grade_level: gradeLevel,
      evaluation_type: evaluationType,
      is_compulsory: isCompulsory,
      school_id: schoolId,
      search: search?.trim() || undefined,
    };

    try {
      const data = await subjectApi.fetchSubjects(queryParams);
      if (isMountedRef.current) {
        setSubjects(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setIsError(true);
        const errorObj =
          err instanceof Error
            ? err
            : new Error("An unexpected error occurred while fetching subjects.");
        setError(errorObj);
        setSubjects(
          filterActiveOnly
            ? MOCK_SUBJECTS.filter((s) => s.is_active)
            : MOCK_SUBJECTS,
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    filterActiveOnly,
    departmentId,
    gradeLevel,
    evaluationType,
    isCompulsory,
    schoolId,
    search,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    if (initialSubjects && initialSubjects.length > 0) {
      return;
    }

    let isSubscribed = true;

    const loadAsync = async () => {
      const queryParams: SubjectQueryParams = {
        is_active: filterActiveOnly ? true : undefined,
        department_id: departmentId,
        grade_level: gradeLevel,
        evaluation_type: evaluationType,
        is_compulsory: isCompulsory,
        school_id: schoolId,
        search: search?.trim() || undefined,
      };

      try {
        const data = await subjectApi.fetchSubjects(queryParams);
        if (isSubscribed && isMountedRef.current) {
          setSubjects(data);
        }
      } catch (err) {
        if (isSubscribed && isMountedRef.current) {
          setIsError(true);
          const errorObj =
            err instanceof Error
              ? err
              : new Error(
                  "An unexpected error occurred while fetching subjects.",
                );
          setError(errorObj);
          setSubjects(
            filterActiveOnly
              ? MOCK_SUBJECTS.filter((s) => s.is_active)
              : MOCK_SUBJECTS,
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
    filterActiveOnly,
    departmentId,
    gradeLevel,
    evaluationType,
    isCompulsory,
    schoolId,
    search,
    initialSubjects,
  ]);

  return {
    subjects,
    isLoading,
    isError,
    error,
    refetch: fetchSubjectsData,
  };
};

export const useSubject = useSubjects;
