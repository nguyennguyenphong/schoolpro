import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  AssignmentItem,
  AssignmentSummary,
  AssignmentFilter,
  AssignmentViewMode,
  AssignmentSubmission,
} from "@/modules/students/features/assignments/types";
import { assignmentsService } from "@/modules/students/features/assignments/services";

export interface UseAssignmentsResult {
  assignments: AssignmentItem[];
  total: number;
  summary: AssignmentSummary | null;
  filter: AssignmentFilter;
  loading: boolean;
  error: Error | null;
  selectedAssignment: AssignmentItem | null;
  isDetailOpen: boolean;
  hasActiveFilters: boolean;
  setSubject: (subject: string) => void;
  setStatus: (status: string) => void;
  setType: (type: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string) => void;
  setViewMode: (mode: AssignmentViewMode) => void;
  setPage: (page: number, pageSize?: number) => void;
  resetFilters: () => void;
  openDetail: (item: AssignmentItem) => void;
  closeDetail: () => void;
  submitAssignment: (id: string, submission: AssignmentSubmission) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAssignments(): UseAssignmentsResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state from URL params
  const initialFilter: AssignmentFilter = useMemo(() => {
    const subject = searchParams.get("subject") || "all";
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const pageSize =
      parseInt(searchParams.get("pageSize") || searchParams.get("page_size") || "10", 10) || 10;
    const rawView = searchParams.get("view");
    const viewMode: AssignmentViewMode = rawView === "list" ? "list" : "grid";

    return {
      subject,
      status,
      type,
      searchQuery: q,
      sortBy,
      page,
      pageSize,
      viewMode,
    };
  }, [searchParams]);

  const [filter, setFilter] = useState<AssignmentFilter>(initialFilter);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<AssignmentSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Sync state to URL params
  const updateUrlParams = useCallback(
    (newFilter: AssignmentFilter) => {
      const params = new URLSearchParams();
      if (newFilter.subject && newFilter.subject !== "all") {
        params.set("subject", newFilter.subject);
      }
      if (newFilter.status && newFilter.status !== "all") {
        params.set("status", newFilter.status);
      }
      if (newFilter.type && newFilter.type !== "all") {
        params.set("type", newFilter.type);
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
      const [res, sumRes] = await Promise.all([
        assignmentsService.getAssignments(filter),
        assignmentsService.getSummary(),
      ]);
      setAssignments(res.items);
      setTotal(res.total);
      setSummary(sumRes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load assignments"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const [res, sumRes] = await Promise.all([
          assignmentsService.getAssignments(filter),
          assignmentsService.getSummary(),
        ]);
        if (!ignore) {
          setAssignments(res.items);
          setTotal(res.total);
          setSummary(sumRes);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Failed to load assignments"));
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
      filter.subject !== "all" ||
      filter.status !== "all" ||
      filter.type !== "all" ||
      Boolean(filter.sortBy && filter.sortBy !== "newest") ||
      filter.searchQuery.trim().length > 0
    );
  }, [filter]);

  const setSubject = useCallback(
    (subject: string) => {
      setFilter((prev) => {
        const next = { ...prev, subject, page: 1 };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

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

  const setType = useCallback(
    (type: string) => {
      setFilter((prev) => {
        const next = { ...prev, type, page: 1 };
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
    (viewMode: AssignmentViewMode) => {
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
          pageSize: pageSize || prev.pageSize || 10,
        };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const resetFilters = useCallback(() => {
    const next: AssignmentFilter = {
      subject: "all",
      status: "all",
      type: "all",
      searchQuery: "",
      sortBy: "newest",
      viewMode: "grid",
      page: 1,
      pageSize: 10,
    };
    setFilter(next);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const openDetail = useCallback((item: AssignmentItem) => {
    setSelectedAssignment(item);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedAssignment(null);
  }, []);

  const submitAssignment = useCallback(
    async (id: string, submission: AssignmentSubmission) => {
      const updated = await assignmentsService.submitAssignment(id, submission);
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (selectedAssignment?.id === id) {
        setSelectedAssignment(updated);
      }
    },
    [selectedAssignment],
  );

  return {
    assignments,
    total,
    summary,
    filter,
    loading,
    error,
    selectedAssignment,
    isDetailOpen,
    hasActiveFilters,
    setSubject,
    setStatus,
    setType,
    setSearchQuery,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    openDetail,
    closeDetail,
    submitAssignment,
    refetch: fetchData,
  };
}
