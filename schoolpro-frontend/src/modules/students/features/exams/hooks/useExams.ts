import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "@/components/ui/Message";
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
  const semester = searchParams.get("semester") || "all";

  const filter: ExamFilter = useMemo(
    () => ({
      status: activeStatus,
      searchQuery,
      semester,
    }),
    [activeStatus, searchQuery, semester]
  );

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [summary, setSummary] = useState<ExamSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync to URL
  const setFilterStatus = useCallback(
    (newStatus: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newStatus && newStatus !== "all") {
          next.set("status", newStatus);
        } else {
          next.delete("status");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setSearch = useCallback(
    (q: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (q.trim()) {
          next.set("q", q.trim());
        } else {
          next.delete("q");
        }
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
      const [list, sum] = await Promise.all([
        examsService.getExams(filter),
        examsService.getExamSummary(),
      ]);
      setExams(list);
      setSummary(sum);
    } catch {
      message.error("Không thể tải danh sách đề thi trắc nghiệm.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let ignore = false;
    async function fetchAll() {
      try {
        setLoading(true);
        const [list, sum] = await Promise.all([
          examsService.getExams(filter),
          examsService.getExamSummary(),
        ]);
        if (!ignore) {
          setExams(list);
          setSummary(sum);
        }
      } catch {
        if (!ignore) {
          message.error("Lỗi khi tải dữ liệu bài thi.");
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
    summary,
    loading,
    setFilterStatus,
    setSearch,
    resetFilters,
    reload: loadData,
  };
};
