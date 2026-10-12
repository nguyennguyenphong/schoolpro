import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "@/components/ui/Message";
import type { SubjectItem, SubjectFilter, MaterialViewMode } from "@/modules/students/features/materials/types";
import { materialsService } from "@/modules/students/features/materials/services";
import { mockMaterialsData } from "@/modules/students/features/materials/services/mock/mockMaterialsData";

export const useSubjects = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial filter from URL
  const initialFilter = useMemo<SubjectFilter>(() => {
    return {
      searchQuery: searchParams.get("q") || "",
      semester: searchParams.get("semester") || "all",
      sortBy: (searchParams.get("sort") as SubjectFilter["sortBy"]) || "name_asc",
      viewMode: (searchParams.get("view") as MaterialViewMode) || "grid",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 9,
    };
  }, [searchParams]);

  const [filter, setFilter] = useState<SubjectFilter>(initialFilter);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Overall system metrics
  const summary = useMemo(() => {
    return materialsService.calculateSummary(mockMaterialsData);
  }, []);

  // Sync state to URL (preserving existing params like 'tab')
  const updateUrlParams = useCallback(
    (newFilter: SubjectFilter) => {
      const params = new URLSearchParams(searchParams);
      if (newFilter.searchQuery.trim()) {
        params.set("q", newFilter.searchQuery.trim());
      } else {
        params.delete("q");
      }
      if (newFilter.semester !== "all") {
        params.set("semester", newFilter.semester);
      } else {
        params.delete("semester");
      }
      if (newFilter.sortBy !== "name_asc") {
        params.set("sort", newFilter.sortBy);
      } else {
        params.delete("sort");
      }
      if (newFilter.viewMode && newFilter.viewMode !== "grid") {
        params.set("view", newFilter.viewMode);
      } else {
        params.delete("view");
      }
      if (newFilter.page > 1) {
        params.set("page", newFilter.page.toString());
      } else {
        params.delete("page");
      }
      if (newFilter.pageSize !== 9) {
        params.set("pageSize", newFilter.pageSize.toString());
      } else {
        params.delete("pageSize");
      }
      return params;
    },
    [searchParams],
  );

  // Fetch subjects
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await materialsService.getSubjects(filter);
        if (!ignore) {
          setSubjects(res.items);
          setTotal(res.total);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          message.error("Không thể tải danh sách môn học.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [filter]);

  // Filter setters
  const updateFilter = useCallback(
    (partial: Partial<SubjectFilter>) => {
      setFilter((prev) => {
        const next = { ...prev, ...partial };
        if (partial.searchQuery !== undefined || partial.semester !== undefined) {
          next.page = 1;
        }
        setSearchParams(updateUrlParams(next), { replace: true });
        return next;
      });
    },
    [setSearchParams, updateUrlParams],
  );

  const setSearchQuery = (query: string) => updateFilter({ searchQuery: query });
  const setSemester = (sem: string) => updateFilter({ semester: sem });
  const setSortBy = (sort: SubjectFilter["sortBy"]) => updateFilter({ sortBy: sort });
  const setViewMode = (mode: MaterialViewMode) => updateFilter({ viewMode: mode });
  const setPage = (page: number, pageSize?: number) =>
    updateFilter({ page, ...(pageSize ? { pageSize } : {}) });

  const resetFilters = useCallback(() => {
    const reset: SubjectFilter = {
      searchQuery: "",
      semester: "all",
      sortBy: "name_asc",
      viewMode: filter.viewMode || "grid",
      page: 1,
      pageSize: 9,
    };
    setFilter(reset);
    setSearchParams(updateUrlParams(reset), { replace: true });
  }, [filter.viewMode, setSearchParams, updateUrlParams]);

  return {
    subjects,
    total,
    summary,
    loading,
    filter,
    setSearchQuery,
    setSemester,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
  };
};
