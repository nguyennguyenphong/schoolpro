import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import { useAuthStore } from "@/shared/store/useAuthStore";
import type {
  SubjectGradeItem,
  GradeSummary,
  GradeFilter,
  GradeViewMode,
  GradeClassification,
  TranscriptData,
} from "@/modules/students/features/gradebook/types";
import { gradebookService } from "@/modules/students/features/gradebook/services";

export const useGradebook = () => {
  const { t } = useTranslation(["card", "common", "button"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const academicContext = useAuthStore((state) => state.academicContext);

  // Read initial filter from URL params once on mount
  const initialFilter = useMemo<GradeFilter>(() => {
    const urlAcademicYear =
      searchParams.get("academicYear") ||
      searchParams.get("academic_year_id") ||
      searchParams.get("academicYearId") ||
      searchParams.get("year") ||
      academicContext?.academic_year_id ||
      "";

    const urlSemester =
      searchParams.get("semester") ||
      searchParams.get("semester_id") ||
      searchParams.get("semesterId") ||
      academicContext?.semester_id ||
      "";

    return {
      searchQuery: searchParams.get("q") || searchParams.get("search") || "",
      academicYear: urlAcademicYear,
      semester: urlSemester,
      classification: (searchParams.get("class") as GradeClassification) || "all",
      sortBy: (searchParams.get("sort") as GradeFilter["sortBy"]) || "gpa_desc",
      viewMode: (searchParams.get("view") as GradeViewMode) || "table",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filter, setFilter] = useState<GradeFilter>(initialFilter);
  const [summary, setSummary] = useState<GradeSummary | null>(null);
  const [grades, setGrades] = useState<SubjectGradeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected subject for detail modal
  const [selectedSubject, setSelectedSubject] = useState<SubjectGradeItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Transcript data and modal
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

  // Helper to sync state to URL params
  const updateUrlParams = useCallback((newFilter: GradeFilter) => {
    const params = new URLSearchParams();
    if (newFilter.searchQuery.trim()) params.set("q", newFilter.searchQuery.trim());
    if (newFilter.academicYear && newFilter.academicYear !== "all") {
      params.set("academicYear", newFilter.academicYear);
    }
    if (newFilter.semester && newFilter.semester !== "all") {
      params.set("semester", newFilter.semester);
    }
    if (newFilter.classification !== "all") params.set("class", newFilter.classification);
    if (newFilter.sortBy !== "gpa_desc") params.set("sort", newFilter.sortBy);
    if (newFilter.viewMode !== "table") params.set("view", newFilter.viewMode);
    return params;
  }, []);

  // Fetch summary when academic year or semester filter parameters change
  useEffect(() => {
    let ignore = false;
    gradebookService
      .getGradeSummary({
        academicYear: filter.academicYear,
        semester: filter.semester,
      })
      .then((res) => {
        if (!ignore) setSummary(res);
      })
      .catch(() => {
        // Fallback handled in service
      });

    return () => {
      ignore = true;
    };
  }, [filter.academicYear, filter.semester]);

  // Fetch subject grades when filter parameters change
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
          setError(err instanceof Error ? err.message : t("card:gradebook.messages.loadError"));
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter.searchQuery,
    filter.academicYear,
    filter.semester,
    filter.classification,
    filter.sortBy,
  ]);

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

  const setSearchQuery = useCallback((query: string) => updateFilter({ searchQuery: query }), [updateFilter]);

  const setAcademicYear = useCallback(
    (year: string) => {
      if (year === "all") {
        updateFilter({ academicYear: "all", semester: "all" });
      } else {
        updateFilter({
          academicYear: year,
          semester: filter.semester === "all" ? "all" : "",
        });
      }
    },
    [filter.semester, updateFilter],
  );

  const setSemester = useCallback(
    (semester: string, option?: unknown) => {
      const semObj = (option as { semester?: { academic_year_id?: string } })?.semester;
      if (semester !== "all" && semObj?.academic_year_id && filter.academicYear === "all") {
        updateFilter({
          semester,
          academicYear: semObj.academic_year_id,
        });
      } else {
        updateFilter({ semester });
      }
    },
    [filter.academicYear, updateFilter],
  );

  const setClassification = useCallback(
    (classification: GradeClassification) => updateFilter({ classification }),
    [updateFilter]
  );
  const setSortBy = useCallback((sortBy: GradeFilter["sortBy"]) => updateFilter({ sortBy }), [updateFilter]);
  const setViewMode = useCallback((viewMode: GradeViewMode) => updateFilter({ viewMode }), [updateFilter]);

  // Keep track of default baseline active academic year and semester
  const defaultYearRef = useRef<string>("");
  const defaultSemesterRef = useRef<string>("");

  useEffect(() => {
    if (!defaultYearRef.current) {
      if (academicContext?.academic_year_id) {
        defaultYearRef.current = academicContext.academic_year_id;
      } else if (filter.academicYear && filter.academicYear !== "all") {
        defaultYearRef.current = filter.academicYear;
      }
    }
  }, [academicContext?.academic_year_id, filter.academicYear]);

  useEffect(() => {
    if (!defaultSemesterRef.current) {
      if (academicContext?.semester_id) {
        defaultSemesterRef.current = academicContext.semester_id;
      } else if (filter.semester && filter.semester !== "all") {
        defaultSemesterRef.current = filter.semester;
      }
    }
  }, [academicContext?.semester_id, filter.semester]);

  const hasActiveFilters = useMemo(() => {
    const isSearchActive = Boolean(filter.searchQuery.trim());
    const isClassificationActive = filter.classification !== "all";
    const isSortActive = filter.sortBy !== "gpa_desc";

    const baseYear = defaultYearRef.current || academicContext?.academic_year_id;
    const baseSemester = defaultSemesterRef.current || academicContext?.semester_id;

    const isYearActive = Boolean(
      baseYear
        ? filter.academicYear && filter.academicYear !== baseYear
        : filter.academicYear && filter.academicYear !== "all",
    );

    const isSemesterActive = Boolean(
      baseSemester
        ? filter.semester && filter.semester !== baseSemester
        : filter.semester && filter.semester !== "all",
    );

    return (
      isSearchActive ||
      isClassificationActive ||
      isSortActive ||
      isYearActive ||
      isSemesterActive
    );
  }, [
    filter.searchQuery,
    filter.classification,
    filter.sortBy,
    filter.academicYear,
    filter.semester,
    academicContext?.academic_year_id,
    academicContext?.semester_id,
  ]);

  const resetFilters = useCallback(() => {
    const targetYear = defaultYearRef.current || academicContext?.academic_year_id || "";
    const targetSemester = defaultSemesterRef.current || academicContext?.semester_id || "";

    const reset: GradeFilter = {
      searchQuery: "",
      academicYear: targetYear,
      semester: targetSemester,
      classification: "all",
      sortBy: "gpa_desc",
      viewMode: "table",
    };
    setFilter(reset);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [academicContext, setSearchParams]);

  // Modal actions
  const openSubjectDetail = (item: SubjectGradeItem) => {
    setSelectedSubject(item);
    setIsDetailModalOpen(true);
  };

  const closeSubjectDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedSubject(null);
  };

  const openTranscriptModal = async () => {
    setIsTranscriptModalOpen(true);
    if (!transcriptData) {
      try {
        setIsTranscriptLoading(true);
        const data = await gradebookService.getTranscript();
        setTranscriptData(data);
      } catch {
        // Service provides fallback
      } finally {
        setIsTranscriptLoading(false);
      }
    }
  };

  const closeTranscriptModal = () => {
    setIsTranscriptModalOpen(false);
  };

  const handleExportPdf = async () => {
    try {
      message.loading({
        content: t("card:gradebook.messages.exportLoading"),
        key: "export-pdf",
      });
      const res = await gradebookService.exportTranscriptPdf();
      if (res?.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.downloadUrl;
        link.setAttribute("download", res.fileName || "Hoc_Ba_Dien_Tu_2025_2026.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      message.success({
        content: t("card:gradebook.messages.exportSuccess"),
        key: "export-pdf",
        duration: 3,
      });
    } catch {
      message.error({
        content: t("card:gradebook.messages.exportError"),
        key: "export-pdf",
      });
    }
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
    transcriptData,
    isTranscriptLoading,
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
