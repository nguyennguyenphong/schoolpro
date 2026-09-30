import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import type {
  ContactBookTab,
  ContactBookSummary,
  WeeklyReportItem,
  SubjectFeedbackItem,
  ParentMessage,
  SendFeedbackPayload,
} from "@/modules/students/features/contact-book/types";
import { contactBookService } from "@/modules/students/features/contact-book/services";

export const useContactBook = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc tab / status từ query param URL (?status=overview | weekly | subjects | feedback)
  const rawTab = searchParams.get("status") || searchParams.get("tab");
  const activeTab: ContactBookTab = useMemo(() => {
    if (
      rawTab &&
      ["overview", "weekly", "subjects", "feedback"].includes(rawTab.toLowerCase())
    ) {
      return rawTab.toLowerCase() as ContactBookTab;
    }
    return "overview";
  }, [rawTab]);

  const searchQuery = searchParams.get("q") || "";
  const rawWeek = searchParams.get("week");
  const selectedWeek: number | "all" = useMemo(() => {
    if (rawWeek && rawWeek !== "all") {
      const num = parseInt(rawWeek, 10);
      if (!Number.isNaN(num) && num > 0) return num;
    }
    return "all";
  }, [rawWeek]);

  // State
  const [summary, setSummary] = useState<ContactBookSummary | null>(null);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportItem[]>([]);
  const [subjectFeedbacks, setSubjectFeedbacks] = useState<SubjectFeedbackItem[]>([]);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync to URL
  const setActiveTab = useCallback(
    (tab: ContactBookTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("status", tab);
        return next;
      });
    },
    [setSearchParams]
  );

  const setSearchQuery = useCallback(
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

  const setSelectedWeek = useCallback(
    (week: number | "all") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (week !== "all") {
          next.set("week", String(week));
        } else {
          next.delete("week");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ status: "overview" }));
  }, [setSearchParams]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sum, weekly, subjects, msgs] = await Promise.all([
        contactBookService.getSummary(),
        contactBookService.getWeeklyReports(selectedWeek),
        contactBookService.getSubjectFeedbacks(),
        contactBookService.getParentMessages(),
      ]);
      setSummary(sum);
      setWeeklyReports(weekly);
      setSubjectFeedbacks(subjects);
      setMessages(msgs);
    } catch {
      message.error("Không thể tải thông tin sổ liên lạc điện tử.");
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [sum, weekly, subjects, msgs] = await Promise.all([
          contactBookService.getSummary(),
          contactBookService.getWeeklyReports(selectedWeek),
          contactBookService.getSubjectFeedbacks(),
          contactBookService.getParentMessages(),
        ]);
        if (!ignore) {
          setSummary(sum);
          setWeeklyReports(weekly);
          setSubjectFeedbacks(subjects);
          setMessages(msgs);
        }
      } catch {
        if (!ignore) {
          message.error("Lỗi khi tải dữ liệu sổ liên lạc.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [selectedWeek]);

  // Actions
  const handleConfirmReport = async (
    weekNumber: number,
    feedback: string,
    parentName: string
  ) => {
    try {
      setSubmitting(true);
      await contactBookService.confirmWeeklyReport(weekNumber, feedback, parentName);
      message.success("Đã gửi phản hồi và ký xác nhận phiếu liên lạc tuần!");
      await loadData();
      return true;
    } catch {
      message.error("Gửi phản hồi thất bại, vui lòng thử lại.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (payload: SendFeedbackPayload) => {
    try {
      setSubmitting(true);
      await contactBookService.sendMessage(payload);
      message.success("Tin nhắn đã được gửi tới Giáo viên chủ nhiệm!");
      await loadData();
      return true;
    } catch {
      message.error("Không thể gửi tin nhắn, vui lòng thử lại.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjectFeedbacks;
    const lower = searchQuery.toLowerCase();
    return subjectFeedbacks.filter(
      (s) =>
        s.subjectName.toLowerCase().includes(lower) ||
        s.teacherName.toLowerCase().includes(lower) ||
        s.teacherComment.toLowerCase().includes(lower)
    );
  }, [subjectFeedbacks, searchQuery]);

  const filteredWeeklyReports = useMemo(() => {
    let list = weeklyReports;
    if (selectedWeek !== "all") {
      list = list.filter((r) => r.weekNumber === selectedWeek);
    }
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.studyComment.toLowerCase().includes(lower) ||
          r.disciplineComment.toLowerCase().includes(lower) ||
          (r.parentFeedback && r.parentFeedback.content.toLowerCase().includes(lower))
      );
    }
    return list;
  }, [weeklyReports, selectedWeek, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedWeek,
    setSelectedWeek,
    resetFilters,
    summary,
    weeklyReports: filteredWeeklyReports,
    allWeeklyReports: weeklyReports,
    subjectFeedbacks: filteredSubjects,
    messages,
    loading,
    submitting,
    handleConfirmReport,
    handleSendMessage,
    reload: loadData,
  };
};
