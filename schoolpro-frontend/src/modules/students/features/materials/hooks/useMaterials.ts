import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import type {
  MaterialItem,
  MaterialSummary,
  MaterialFilter,
  MaterialCategory,
  MaterialFormat,
  MaterialViewMode,
} from "@/modules/students/features/materials/types";
import { materialsService, mockMaterialsData } from "@/modules/students/features/materials/services";

export function useMaterials() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial state parsed from URL query
  const initialFilter: MaterialFilter = useMemo(
    () => ({
      searchQuery: searchParams.get("q") || "",
      academicYear: searchParams.get("academicYear") || "all",
      subject: searchParams.get("subject") || "all",
      category: (searchParams.get("category") as MaterialCategory) || "all",
      format: (searchParams.get("format") as MaterialFormat) || "all",
      semester: searchParams.get("semester") || "all",
      sortBy:
        (searchParams.get("sort") as
          | "newest"
          | "most_downloaded"
          | "title_asc"
          | "size_asc") || "newest",
      viewMode: (searchParams.get("view") as MaterialViewMode) || "grid",
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: parseInt(searchParams.get("pageSize") || "9", 10),
    }),
    [searchParams],
  );

  const [filter, setFilter] = useState<MaterialFilter>(initialFilter);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<MaterialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Multi-selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Subjects list
  const subjects = useMemo(() => materialsService.getSubjectsList(), []);

  // Sync state to URL (preserving existing params like 'tab')
  const updateUrlParams = useCallback(
    (newFilter: MaterialFilter) => {
      const params = new URLSearchParams(searchParams);
      if (newFilter.searchQuery.trim()) {
        params.set("q", newFilter.searchQuery.trim());
      } else {
        params.delete("q");
      }
      if (newFilter.academicYear && newFilter.academicYear !== "all") {
        params.set("academicYear", newFilter.academicYear);
      } else {
        params.delete("academicYear");
      }
      if (newFilter.subject !== "all") {
        params.set("subject", newFilter.subject);
      } else {
        params.delete("subject");
      }
      if (newFilter.category !== "all") {
        params.set("category", newFilter.category);
      } else {
        params.delete("category");
      }
      if (newFilter.semester !== "all") {
        params.set("semester", newFilter.semester);
      } else {
        params.delete("semester");
      }
      if (newFilter.sortBy !== "newest") {
        params.set("sort", newFilter.sortBy);
      } else {
        params.delete("sort");
      }
      if (newFilter.viewMode !== "grid") {
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

  // Fetch materials
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await materialsService.getMaterials(filter);
        if (!ignore) {
          setMaterials(res.items);
          setTotal(res.total);
          setSummary(materialsService.calculateSummary(mockMaterialsData));
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          message.error("Không thể tải danh sách tài liệu học tập.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [filter, refreshKey]);

  // Filter setters
  const updateFilter = useCallback(
    (partial: Partial<MaterialFilter>) => {
      setFilter((prev) => {
        const next = { ...prev, ...partial };
        if (
          partial.searchQuery !== undefined ||
          partial.academicYear !== undefined ||
          partial.subject !== undefined ||
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
  const setSubject = (sub: string) => updateFilter({ subject: sub });
  const setCategory = (cat: string) => updateFilter({ category: cat });
  const setSemester = (sem: string) => updateFilter({ semester: sem });
  const setSortBy = (sort: MaterialFilter["sortBy"]) => updateFilter({ sortBy: sort });
  const setViewMode = (mode: MaterialViewMode) => updateFilter({ viewMode: mode });
  const setPage = (page: number, pageSize?: number) => {
    updateFilter({ page, ...(pageSize && { pageSize }) });
  };

  const resetFilters = useCallback(() => {
    const cleared: MaterialFilter = {
      searchQuery: "",
      academicYear: "all",
      subject: "all",
      category: "all",
      semester: "all",
      sortBy: "newest",
      viewMode: filter.viewMode,
      page: 1,
      pageSize: filter.pageSize,
    };
    setFilter(cleared);
    setSearchParams(updateUrlParams(cleared), { replace: true });
  }, [filter.viewMode, filter.pageSize, setSearchParams, updateUrlParams]);

  // Multi-selection Handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback(() => {
    const allPageIds = materials.map((m) => m.id);
    setSelectedIds((prev) => {
      const isAllSelected = allPageIds.every((id) => prev.includes(id));
      if (isAllSelected) {
        return prev.filter((id) => !allPageIds.includes(id));
      } else {
        return Array.from(new Set([...prev, ...allPageIds]));
      }
    });
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
    try {
      await materialsService.incrementDownload(item.id);
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m,
        ),
      );
      message.success(t("card:materials.modal.downloadStarted", { fileName: item.fileName, defaultValue: `Đang bắt đầu tải tệp: ${item.fileName}` }));
    } catch {
      message.error("Lỗi khi tải tệp.");
    }
  }, [t]);

  const handleDownloadSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    message.success(
      t("card:materials.modal.downloadBatchStarted", {
        count: selectedIds.length,
        defaultValue: `Đang nén và chuẩn bị tải xuống ${selectedIds.length} tài liệu...`,
      }),
    );
    clearSelection();
  }, [selectedIds, clearSelection, t]);

  const handleDownloadAll = useCallback(() => {
    if (materials.length === 0) return;
    message.success(
      t("card:materials.modal.downloadBatchStarted", {
        count: materials.length,
        defaultValue: `Đang nén và chuẩn bị tải xuống ${materials.length} tài liệu...`,
      }),
    );
  }, [materials.length, t]);

  const toggleBookmark = useCallback((id: string) => {
    try {
      const isBookmarked = materialsService.toggleBookmark(id);
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isBookmarked } : m)),
      );
      message.success(
        isBookmarked
          ? t("card:materials.modal.bookmarkSuccess", "Đã thêm tài liệu vào mục lưu trữ quan trọng")
          : t("card:materials.modal.unbookmarkSuccess", "Đã gỡ tài liệu khỏi mục lưu trữ"),
      );
    } catch {
      message.error("Không thể lưu tài liệu.");
    }
  }, [t]);

  // Modal Handlers
  const openDetail = useCallback((item: MaterialItem) => {
    setSelectedMaterial(item);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedMaterial(null);
  }, []);

  return {
    materials,
    total,
    summary,
    subjects,
    loading,
    filter,
    selectedMaterial,
    isDetailOpen,
    selectedIds,
    isAllCurrentPageSelected,
    setSearchQuery,
    setAcademicYear,
    setSubject,
    setCategory,
    setSemester,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    handleDownload,
    handleDownloadSelected,
    downloadMaterial: handleDownload,
    downloadSelected: handleDownloadSelected,
    downloadAll: handleDownloadAll,
    toggleBookmark,
    openDetail,
    closeDetail,
    refetch,
  };
}
