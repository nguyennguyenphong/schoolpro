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
  summary: AssignmentSummary;
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
  setViewMode: (mode: AssignmentViewMode) => void;
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
    const searchQuery = searchParams.get("search") || "";
    const rawView = searchParams.get("view");
    const viewMode: AssignmentViewMode = rawView === "list" ? "list" : "grid";

    return {
      subject,
      status,
      type,
      searchQuery,
      viewMode,
    };
  }, [searchParams]);

  const [filter, setFilter] = useState<AssignmentFilter>(initialFilter);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Sync state to URL params (only set keys with active data)
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
        params.set("search", newFilter.searchQuery.trim());
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
      const res = await assignmentsService.getAssignments(filter);
      setAssignments(res);
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
        const res = await assignmentsService.getAssignments(filter);
        if (!ignore) {
          setAssignments(res);
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

  const summary = useMemo(() => {
    return assignmentsService.calculateSummary(assignments);
  }, [assignments]);

  const hasActiveFilters = useMemo(() => {
    return (
      filter.subject !== "all" ||
      filter.status !== "all" ||
      filter.type !== "all" ||
      filter.searchQuery.trim().length > 0
    );
  }, [filter]);

  const setSubject = useCallback(
    (subject: string) => {
      setFilter((prev) => {
        const next = { ...prev, subject };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setStatus = useCallback(
    (status: string) => {
      setFilter((prev) => {
        const next = { ...prev, status };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setType = useCallback(
    (type: string) => {
      setFilter((prev) => {
        const next = { ...prev, type };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setSearchQuery = useCallback(
    (searchQuery: string) => {
      setFilter((prev) => {
        const next = { ...prev, searchQuery };
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

  const resetFilters = useCallback(() => {
    setFilter({
      subject: "all",
      status: "all",
      type: "all",
      searchQuery: "",
      viewMode: "grid",
    });
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
    setViewMode,
    resetFilters,
    openDetail,
    closeDetail,
    submitAssignment,
    refetch: fetchData,
  };
}
