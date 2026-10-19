import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "@/components/ui/Message";
import { i18n } from "@/i18n";
import type {
  ExamItem,
  ExamSummary,
  ExamFilter,
} from "@/modules/students/features/exams/types";
import { examsService } from "@/modules/students/features/exams/services";

export const useExams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read status from URL param
  const rawStatus = searchParams.get("status");
  const activeStatus: ExamFilter["status"] =
    rawStatus && ["all", "pending", "completed", "expired"].includes(rawStatus.toLowerCase())
      ? (rawStatus.toLowerCase() as ExamFilter["status"])
      : "all";

  const searchQuery = searchParams.get("q") || "";
  const subject = searchParams.get("subject") || "all";
  const format = searchParams.get("format") || "all";
  const sortBy = searchParams.get("sortBy") || "newest";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawPageSize = parseInt(searchParams.get("pageSize") || "9", 10);
  const pageSize = Number.isNaN(rawPageSize) || rawPageSize < 1 ? 9 : rawPageSize;

  const filter: ExamFilter = useMemo(
    () => ({
      status: activeStatus,
      subject,
      format,
      sortBy,
      searchQuery,
      page,
      pageSize,
    }),
    [activeStatus, subject, format, sortBy, searchQuery, page, pageSize]
  );

  const hasActiveFilters = useMemo(
    () =>
      activeStatus !== "all" ||
      searchQuery.trim() !== "" ||
      (subject !== "all" && subject !== "") ||
      (format !== "all" && format !== "") ||
      (sortBy !== "newest" && sortBy !== ""),
    [activeStatus, searchQuery, subject, format, sortBy]
  );

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<ExamSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync status to URL
  const setFilterStatus = useCallback(
    (newStatus: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newStatus && newStatus !== "all") {
          next.set("status", newStatus);
        } else {
          next.delete("status");
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  // Sync subject to URL
  const setSubject = useCallback(
    (newSubject: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newSubject && newSubject !== "all") {
          next.set("subject", newSubject);
        } else {
          next.delete("subject");
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  // Sync format to URL
  const setFormat = useCallback(
    (newFormat: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newFormat && newFormat !== "all") {
          next.set("format", newFormat);
        } else {
          next.delete("format");
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  // Sync sortBy to URL
  const setSortBy = useCallback(
    (newSortBy: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newSortBy && newSortBy !== "newest") {
          next.set("sortBy", newSortBy);
        } else {
          next.delete("sortBy");
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  // Sync search to URL
  const setSearch = useCallback(
    (q: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (q.trim()) {
          next.set("q", q.trim());
        } else {
          next.delete("q");
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  // Sync page and pageSize to URL
  const setPage = useCallback(
    (newPage: number, newPageSize: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(newPage));
        next.set("pageSize", String(newPageSize));
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [listResult, sum] = await Promise.all([
        examsService.getExams(filter),
        examsService.getExamSummary(),
      ]);
      setExams(listResult.items);
      setTotal(listResult.total);
      setSummary(sum);
    } catch {
      message.error(i18n.t("card:exams.messages.listLoadError"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let ignore = false;
    async function fetchAll() {
      try {
        setLoading(true);
        const [listResult, sum] = await Promise.all([
          examsService.getExams(filter),
          examsService.getExamSummary(),
        ]);
        if (!ignore) {
          setExams(listResult.items);
          setTotal(listResult.total);
          setSummary(sum);
        }
      } catch {
        if (!ignore) {
          message.error(i18n.t("card:exams.messages.listLoadError"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => {
      ignore = true;
    };
  }, [filter]);

  return {
    filter,
    exams,
    total,
    summary,
    loading,
    hasActiveFilters,
    setFilterStatus,
    setSubject,
    setFormat,
    setSortBy,
    setSearch,
    setPage,
    resetFilters,
    reload: loadData,
  };
};

