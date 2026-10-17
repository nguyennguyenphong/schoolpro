import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import type {
  MaterialItem,
  MaterialFilter,
  MaterialSummary,
  MaterialViewMode,
  SubjectItem,
} from "@/modules/students/features/materials/types";
import { materialsService } from "@/modules/students/features/materials/services";
import {
  downloadMaterialWithFeedback,
  downloadBatchWithFeedback,
  toggleBookmarkWithFeedback,
} from "@/modules/students/features/materials/utils";

export const useSubjectMaterials = () => {
  const { t } = useTranslation(["card", "message"]);
  const { subjectCode } = useParams<{ subjectCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial filter from URL
  const initialFilter = useMemo<MaterialFilter>(() => {
    return {
      searchQuery: searchParams.get("q") || "",
      academicYear: searchParams.get("academicYear") || "all",
      subject: subjectCode || "all",
      category: searchParams.get("category") || "all",
      semester: searchParams.get("semester") || "all",
      sortBy: (searchParams.get("sort") as MaterialFilter["sortBy"]) || "newest",
      viewMode: (searchParams.get("view") as MaterialViewMode) || "grid",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 9,
    };
  }, [searchParams, subjectCode]);

  const [subject, setSubject] = useState<SubjectItem | null>(null);
  const [filter, setFilter] = useState<MaterialFilter>(initialFilter);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<MaterialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch subject info
  useEffect(() => {
    if (!subjectCode) return;
    materialsService.getSubjectByCode(subjectCode).then((res) => {
      setSubject(res);
    });
  }, [subjectCode]);

  // Sync state to URL (only non-default values)
  const updateUrlParams = useCallback((newFilter: MaterialFilter) => {
    const params = new URLSearchParams();
    if (newFilter.searchQuery.trim()) params.set("q", newFilter.searchQuery.trim());
    if (newFilter.academicYear && newFilter.academicYear !== "all") params.set("academicYear", newFilter.academicYear);
    if (newFilter.category !== "all") params.set("category", newFilter.category);
    if (newFilter.semester !== "all") params.set("semester", newFilter.semester);
    if (newFilter.sortBy !== "newest") params.set("sort", newFilter.sortBy);
    if (newFilter.viewMode !== "grid") params.set("view", newFilter.viewMode);
    if (newFilter.page > 1) params.set("page", newFilter.page.toString());
    if (newFilter.pageSize !== 9) params.set("pageSize", newFilter.pageSize.toString());
    return params;
  }, []);

  // Fetch materials for this subject
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await materialsService.getMaterials({
          ...filter,
          subject: subjectCode || "all",
        });
        if (!ignore) {
          setMaterials(res.items);
          setTotal(res.total);
          setSummary(materialsService.calculateSummary(res.items));
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          message.error(t("message:materials.loadFailed"));
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [filter, subjectCode, refreshKey, t]);

  // Filter setters
  const updateFilter = useCallback(
    (partial: Partial<MaterialFilter>) => {
      setFilter((prev) => {
        const next = { ...prev, ...partial };
        if (
          partial.searchQuery !== undefined ||
          partial.academicYear !== undefined ||
          partial.category !== undefined ||
          partial.semester !== undefined
        ) {
          next.page = 1;
        }
        setSearchParams(updateUrlParams(next), { replace: true });
        return next;
      });
    },
    [setSearchParams, updateUrlParams],
  );

  const setSearchQuery = (query: string) => updateFilter({ searchQuery: query });
  const setAcademicYear = (ay: string) => updateFilter({ academicYear: ay });
  const setCategory = (cat: string) => updateFilter({ category: cat });
  const setSemester = (sem: string) => updateFilter({ semester: sem });
  const setSortBy = (sort: MaterialFilter["sortBy"]) => updateFilter({ sortBy: sort });
  const setViewMode = (mode: MaterialViewMode) => updateFilter({ viewMode: mode });
  const setPage = (page: number, pageSize?: number) =>
    updateFilter({ page, ...(pageSize ? { pageSize } : {}) });

  const resetFilters = useCallback(() => {
    const reset: MaterialFilter = {
      searchQuery: "",
      academicYear: "all",
      subject: subjectCode || "all",
      category: "all",
      semester: "all",
      sortBy: "newest",
      viewMode: "grid",
      page: 1,
      pageSize: 9,
    };
    setFilter(reset);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams, subjectCode]);

  // Selection Handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(materials.map((m) => m.id));
  }, [materials]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isAllCurrentPageSelected = useMemo(() => {
    if (materials.length === 0) return false;
    return materials.every((m) => selectedIds.includes(m.id));
  }, [materials, selectedIds]);

  // Download actions
  const handleDownload = useCallback(async (item: MaterialItem) => {
    await downloadMaterialWithFeedback(item, t);
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m,
      ),
    );
  }, [t]);

  const handleDownloadSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    downloadBatchWithFeedback(selectedIds.length, t);
    clearSelection();
  }, [selectedIds.length, clearSelection, t]);

  const handleDownloadAll = useCallback(() => {
    downloadBatchWithFeedback(materials.length, t);
  }, [materials.length, t]);

  // Bookmark toggle
  const toggleBookmark = useCallback((id: string) => {
    const isBookmarked = toggleBookmarkWithFeedback(id, t);
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isBookmarked } : m)),
    );
  }, [t]);

  return {
    subject,
    subjectCode,
    materials,
    total,
    summary,
    loading,
    filter,
    selectedIds,
    isAllCurrentPageSelected,
    setSearchQuery,
    setAcademicYear,
    setCategory,
    setSemester,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    downloadMaterial: handleDownload,
    downloadSelected: handleDownloadSelected,
    downloadAll: handleDownloadAll,
    toggleBookmark,
    refetch,
  };
};
