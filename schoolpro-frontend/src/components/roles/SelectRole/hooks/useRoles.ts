import { useState, useEffect, useCallback, useRef } from "react";
import type {
  RoleItem,
  RoleQueryParams,
} from "@/components/roles/SelectRole/types";
import {
  roleApi,
  MOCK_ROLES,
} from "@/components/roles/SelectRole/services/roleApi";

export interface UseRolesOptions {
  /**
   * Only fetch active roles
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Filter by system flag
   */
  isSystem?: boolean;

  /**
   * Search keyword for server-side filter
   */
  search?: string;

  /**
   * Optional pre-populated roles to avoid network request
   */
  initialRoles?: RoleItem[];

  /**
   * Auto fetch on mount
   * @default true
   */
  enabled?: boolean;
}

export interface UseRolesReturn {
  roles: RoleItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom React hook for fetching and managing roles state.
 */
export const useRoles = (options: UseRolesOptions = {}): UseRolesReturn => {
  const {
    filterActiveOnly = true,
    isSystem,
    search,
    initialRoles,
    enabled = true,
  } = options;

  const [roles, setRoles] = useState<RoleItem[]>(() => {
    return initialRoles && initialRoles.length > 0 ? initialRoles : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(enabled && (!initialRoles || initialRoles.length === 0));
  });
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchRolesData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    const queryParams: RoleQueryParams = {
      is_active: filterActiveOnly ? true : undefined,
      is_system: isSystem,
      search: search?.trim() || undefined,
    };

    try {
      const data = await roleApi.fetchRoles(queryParams);
      if (isMountedRef.current) {
        setRoles(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setIsError(true);
        const errorObj =
          err instanceof Error
            ? err
            : new Error("An unexpected error occurred while fetching roles.");
        setError(errorObj);
        setRoles(
          filterActiveOnly
            ? MOCK_ROLES.filter((r) => r.is_active)
            : MOCK_ROLES,
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filterActiveOnly, isSystem, search]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    if (initialRoles && initialRoles.length > 0) {
      return;
    }

    let isSubscribed = true;

    const loadAsync = async () => {
      const queryParams: RoleQueryParams = {
        is_active: filterActiveOnly ? true : undefined,
        is_system: isSystem,
        search: search?.trim() || undefined,
      };

      try {
        const data = await roleApi.fetchRoles(queryParams);
        if (isSubscribed && isMountedRef.current) {
          setRoles(data);
        }
      } catch (err) {
        if (isSubscribed && isMountedRef.current) {
          setIsError(true);
          const errorObj =
            err instanceof Error
              ? err
              : new Error("An unexpected error occurred while fetching roles.");
          setError(errorObj);
          setRoles(
            filterActiveOnly
              ? MOCK_ROLES.filter((r) => r.is_active)
              : MOCK_ROLES,
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
  }, [enabled, filterActiveOnly, isSystem, search, initialRoles]);

  return {
    roles,
    isLoading,
    isError,
    error,
    refetch: fetchRolesData,
  };
};
