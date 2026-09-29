import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import type { SubjectItem, SubjectFilter } from "@/modules/students/features/materials/types";
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

  // Sync state to URL
  const updateUrlParams = useCallback((newFilter: SubjectFilter) => {
    const params = new URLSearchParams();
    if (newFilter.searchQuery.trim()) params.set("q", newFilter.searchQuery.trim());
    if (newFilter.semester !== "all") params.set("semester", newFilter.semester);
    if (newFilter.sortBy !== "name_asc") params.set("sort", newFilter.sortBy);
    if (newFilter.page > 1) params.set("page", newFilter.page.toString());
    if (newFilter.pageSize !== 9) params.set("pageSize", newFilter.pageSize.toString());
    return params;
  }, []);

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
  const setPage = (page: number, pageSize?: number) =>
    updateFilter({ page, ...(pageSize ? { pageSize } : {}) });

  const resetFilters = useCallback(() => {
    const reset: SubjectFilter = {
      searchQuery: "",
      semester: "all",
      sortBy: "name_asc",
      page: 1,
      pageSize: 9,
    };
    setFilter(reset);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    subjects,
    total,
    summary,
    loading,
    filter,
    setSearchQuery,
    setSemester,
    setSortBy,
    setPage,
    resetFilters,
  };
};
