import { message } from "@/components/ui/Message";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import i18n from "@/i18n/i18n";
import { useLeaveRequestRealtime } from "@/modules/students/features/leave-requests/hooks/useLeaveRequestRealtime";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services";
import type {
  LeaveRequestFilter,
  LeaveRequestItem,
  LeaveRequestRealtimePayload,
  LeaveRequestSummary,
  LeaveRequestViewMode,
} from "@/modules/students/features/leave-requests/types";

export interface UseLeaveRequestsResult {
  items: LeaveRequestItem[];
  total: number;
  summary: LeaveRequestSummary | null;
  filter: LeaveRequestFilter;
  loading: boolean;
  deletingId: string | null;
  error: Error | null;
  hasActiveFilters: boolean;
  isRealtimeConnected: boolean;
  lastSyncedAt: string | null;
  setStatus: (status: string) => void;
  setLeaveType: (leaveType: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string) => void;
  setViewMode: (mode: LeaveRequestViewMode) => void;
  setPage: (page: number, pageSize?: number) => void;
  resetFilters: () => void;
  deleteLeaveRequest: (item: LeaveRequestItem) => Promise<void>;
  refetch: () => Promise<void>;
  silentRefetch: () => Promise<void>;
}

export function useLeaveRequests(): UseLeaveRequestsResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter: LeaveRequestFilter = useMemo(() => {
    const status = searchParams.get("status") || "all";
    const leaveType = searchParams.get("leaveType") || "all";
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const pageSize =
      parseInt(searchParams.get("pageSize") || searchParams.get("page_size") || "10", 10) || 10;
    const rawView = searchParams.get("view");
    const viewMode: LeaveRequestViewMode = rawView === "list" ? "list" : "grid";

    return {
      status,
      leaveType,
      searchQuery: q,
      sortBy,
      page,
      pageSize,
      viewMode,
    };
  }, [searchParams]);

  const [filter, setFilter] = useState<LeaveRequestFilter>(initialFilter);
  const [items, setItems] = useState<LeaveRequestItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<LeaveRequestSummary | null>(null);
  const summaryRef = useRef<LeaveRequestSummary | null>(null);
  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const updateUrlParams = useCallback(
    (newFilter: LeaveRequestFilter) => {
      const params = new URLSearchParams();
      if (newFilter.status && newFilter.status !== "all") {
        params.set("status", newFilter.status);
      }
      if (newFilter.leaveType && newFilter.leaveType !== "all") {
        params.set("leaveType", newFilter.leaveType);
      }
      if (newFilter.searchQuery && newFilter.searchQuery.trim()) {
        params.set("q", newFilter.searchQuery.trim());
      }
      if (newFilter.sortBy && newFilter.sortBy !== "newest") {
        params.set("sortBy", newFilter.sortBy);
      }
      if (newFilter.page && newFilter.page > 1) {
        params.set("page", String(newFilter.page));
      }
      if (newFilter.pageSize && newFilter.pageSize !== 10) {
        params.set("pageSize", String(newFilter.pageSize));
      }
      if (newFilter.viewMode && newFilter.viewMode !== "grid") {
        params.set("view", newFilter.viewMode);
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, sumRes] = await Promise.all([
        leaveRequestsService.getLeaveRequests(filter),
        leaveRequestsService.getSummary(),
      ]);
      setItems(listRes.items);
      setTotal(listRes.total);
      setSummary(sumRes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(i18n.t("message:failedToLoadLeaveRequests")));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  /**
   * Refetches leave requests and summary metrics in the background without toggling loading skeleton.
   */
  const silentRefetch = useCallback(async () => {
    try {
      const [listRes, sumRes] = await Promise.all([
        leaveRequestsService.getLeaveRequests(filter),
        leaveRequestsService.getSummary(),
      ]);
      setItems(listRes.items);
      setTotal(listRes.total);
      setSummary(sumRes);
    } catch {
      // Preserve current items during background revalidation
    }
  }, [filter]);

  const handleRealtimeEvent = useCallback(
    (payload: LeaveRequestRealtimePayload) => {
      if (payload.eventType === "LEAVE_REQUEST_DELETED") {
        setItems((prev) => prev.filter((it) => it.id !== payload.leaveRequestId));
        silentRefetch();
        return;
      }

      if (payload.item) {
        const updatedItem = payload.item;
        setItems((prev) => {
          const exists = prev.some((it) => it.id === updatedItem.id);
          if (!exists) {
            return prev;
          }
          return prev.map((it) => (it.id === updatedItem.id ? { ...it, ...updatedItem } : it));
        });
      }

      silentRefetch();
    },
    [silentRefetch],
  );

  const { isConnected: isRealtimeConnected, lastSyncedAt } = useLeaveRequestRealtime({
    enabled: true,
    onEvent: handleRealtimeEvent,
    onSyncChange: () => {
      silentRefetch();
    },
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const [listRes, sumRes] = await Promise.all([
          leaveRequestsService.getLeaveRequests(filter),
          summaryRef.current ? Promise.resolve(summaryRef.current) : leaveRequestsService.getSummary(),
        ]);
        if (!ignore) {
          setItems(listRes.items);
          setTotal(listRes.total);
          setSummary(sumRes);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err : new Error(i18n.t("message:failedToLoadLeaveRequests")),
          );
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [filter]);

  const hasActiveFilters = useMemo(() => {
    return (
      filter.status !== "all" ||
      filter.leaveType !== "all" ||
      filter.searchQuery.trim().length > 0
    );
  }, [filter]);

  const setStatus = useCallback(
    (status: string) => {
      setFilter((prev) => {
        const next = { ...prev, status, page: 1 };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setLeaveType = useCallback(
    (leaveType: string) => {
      setFilter((prev) => {
        const next = { ...prev, leaveType, page: 1 };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setSearchQuery = useCallback(
    (searchQuery: string) => {
      setFilter((prev) => {
        const next = { ...prev, searchQuery, page: 1 };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setSortBy = useCallback(
    (sortBy: string) => {
      setFilter((prev) => {
        const next = { ...prev, sortBy, page: 1 };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setViewMode = useCallback(
    (viewMode: LeaveRequestViewMode) => {
      setFilter((prev) => {
        const next = { ...prev, viewMode };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setPage = useCallback(
    (page: number, pageSize?: number) => {
      setFilter((prev) => {
        const next = {
          ...prev,
          page,
          pageSize: pageSize ?? prev.pageSize,
        };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const resetFilters = useCallback(() => {
    setFilter((prev) => {
      const next: LeaveRequestFilter = {
        status: "all",
        leaveType: "all",
        searchQuery: "",
        sortBy: "newest",
        page: 1,
        pageSize: prev.pageSize,
        viewMode: prev.viewMode,
      };
      updateUrlParams(next);
      return next;
    });
  }, [updateUrlParams]);

  const deleteLeaveRequest = useCallback(
    async (item: LeaveRequestItem) => {
      try {
        setDeletingId(item.id);
        await leaveRequestsService.deleteLeaveRequest(item.id);
        message.success(i18n.t("message:leaveRequestDeleteWithCodeSuccess", { code: item.requestCode }));
        await silentRefetch();
      } catch (err) {
        message.error(
          err instanceof Error ? err.message : i18n.t("message:leaveRequestDeleteError"),
        );
      } finally {
        setDeletingId(null);
      }
    },
    [silentRefetch],
  );

  return {
    items,
    total,
    summary,
    filter,
    loading,
    deletingId,
    error,
    hasActiveFilters,
    isRealtimeConnected,
    lastSyncedAt,
    setStatus,
    setLeaveType,
    setSearchQuery,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    deleteLeaveRequest,
    refetch: fetchData,
    silentRefetch,
  };
}
