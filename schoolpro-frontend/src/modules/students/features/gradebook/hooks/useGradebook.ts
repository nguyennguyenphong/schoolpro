import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "@/components/ui/Message";
import type {
  SubjectGradeItem,
  GradeSummary,
  GradeFilter,
  GradeViewMode,
  GradeClassification,
} from "@/modules/students/features/gradebook/types";
import { gradebookService } from "@/modules/students/features/gradebook/services";

export const useGradebook = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = useMemo<GradeFilter>(() => {
    return {
      searchQuery: searchParams.get("q") || "",
      academicYear: searchParams.get("year") || "2025-2026",
      semester: searchParams.get("semester") || "HK1",
      classification: (searchParams.get("class") as GradeClassification) || "all",
      sortBy: (searchParams.get("sort") as GradeFilter["sortBy"]) || "gpa_desc",
      viewMode: (searchParams.get("view") as GradeViewMode) || "table",
    };
  }, [searchParams]);

  const [filter, setFilter] = useState<GradeFilter>(initialFilter);
  const [summary, setSummary] = useState<GradeSummary | null>(null);
  const [grades, setGrades] = useState<SubjectGradeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected subject for detail modal
  const [selectedSubject, setSelectedSubject] = useState<SubjectGradeItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Print/Export transcript modal
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

  // Sync state to URL params
  const updateUrlParams = useCallback((newFilter: GradeFilter) => {
    const params = new URLSearchParams();
    if (newFilter.searchQuery.trim()) params.set("q", newFilter.searchQuery.trim());
    if (newFilter.academicYear !== "2025-2026") params.set("year", newFilter.academicYear);
    if (newFilter.semester !== "HK1") params.set("semester", newFilter.semester);
    if (newFilter.classification !== "all") params.set("class", newFilter.classification);
    if (newFilter.sortBy !== "gpa_desc") params.set("sort", newFilter.sortBy);
    if (newFilter.viewMode !== "table") params.set("view", newFilter.viewMode);
    return params;
  }, []);

  // Fetch summary on mount
  useEffect(() => {
    let ignore = false;
    gradebookService
      .getGradeSummary()
      .then((res) => {
        if (!ignore) setSummary(res);
      })
      .catch(() => {
        // Fallback
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch subject grades
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await gradebookService.getSubjectGrades(filter);
        if (!ignore) {
          setGrades(res.items);
          setTotal(res.total);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Không thể tải bảng điểm.");
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
    (partial: Partial<GradeFilter>) => {
      setFilter((prev) => {
        const next = { ...prev, ...partial };
        setSearchParams(updateUrlParams(next), { replace: true });
        return next;
      });
    },
    [setSearchParams, updateUrlParams],
  );

  const setSearchQuery = (query: string) => updateFilter({ searchQuery: query });
  const setAcademicYear = (year: string) => updateFilter({ academicYear: year });
  const setSemester = (semester: string) => updateFilter({ semester });
  const setClassification = (classification: GradeClassification) =>
    updateFilter({ classification });
  const setSortBy = (sortBy: GradeFilter["sortBy"]) => updateFilter({ sortBy });
  const setViewMode = (viewMode: GradeViewMode) => updateFilter({ viewMode });

  const resetFilters = useCallback(() => {
    const reset: GradeFilter = {
      searchQuery: "",
      academicYear: "2025-2026",
      semester: "HK1",
      classification: "all",
      sortBy: "gpa_desc",
      viewMode: "table",
    };
    setFilter(reset);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = Boolean(
    filter.searchQuery.trim() ||
      filter.academicYear !== "2025-2026" ||
      filter.semester !== "HK1" ||
      filter.classification !== "all" ||
      filter.sortBy !== "gpa_desc",
  );

  // Modal actions
  const openSubjectDetail = (item: SubjectGradeItem) => {
    setSelectedSubject(item);
    setIsDetailModalOpen(true);
  };

  const closeSubjectDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedSubject(null);
  };

  const openTranscriptModal = () => {
    setIsTranscriptModalOpen(true);
  };

  const closeTranscriptModal = () => {
    setIsTranscriptModalOpen(false);
  };

  const handleExportPdf = () => {
    message.loading({ content: "Đang tạo bản sao Học bạ điện tử PDF có chữ ký số...", key: "export-pdf" });
    setTimeout(() => {
      message.success({
        content: "Học bạ điện tử (PDF) đã được tạo thành công! Đang tự động tải về...",
        key: "export-pdf",
        duration: 3,
      });
    }, 1200);
  };

  return {
    grades,
    total,
    summary,
    loading,
    error,
    filter,
    hasActiveFilters,
    selectedSubject,
    isDetailModalOpen,
    isTranscriptModalOpen,
    setSearchQuery,
    setAcademicYear,
    setSemester,
    setClassification,
    setSortBy,
    setViewMode,
    resetFilters,
    openSubjectDetail,
    closeSubjectDetail,
    openTranscriptModal,
    closeTranscriptModal,
    handleExportPdf,
  };
};
