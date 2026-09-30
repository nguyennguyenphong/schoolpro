import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import type { SurveyItem, EvaluationSummary } from "@/modules/students/features/evaluation/types";
import { evaluationService } from "@/modules/students/features/evaluation/services";

export const useEvaluation = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc trạng thái lọc từ query param `status` trên URL (?status=all | pending | completed)
  const rawStatus = searchParams.get("status");
  const activeTab: "all" | "pending" | "completed" = useMemo(() => {
    if (
      rawStatus &&
      ["all", "pending", "completed"].includes(rawStatus.toLowerCase())
    ) {
      return rawStatus.toLowerCase() as "all" | "pending" | "completed";
    }
    return "pending";
  }, [rawStatus]);

  const setActiveTab = useCallback(
    (tab: "all" | "pending" | "completed") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("status", tab);
        return next;
      });
    },
    [setSearchParams]
  );

  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [surveysRes, summaryRes] = await Promise.all([
        evaluationService.getSurveys(activeTab),
        evaluationService.getSummary(),
      ]);
      setSurveys(surveysRes);
      setSummary(summaryRes);
    } catch {
      message.error("Không thể tải danh sách đánh giá & khảo sát.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const [surveysRes, summaryRes] = await Promise.all([
          evaluationService.getSurveys(activeTab),
          evaluationService.getSummary(),
        ]);
        if (!ignore) {
          setSurveys(surveysRes);
          setSummary(summaryRes);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          message.error("Không thể tải danh sách đánh giá & khảo sát.");
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  return {
    surveys,
    summary,
    loading,
    activeTab,
    setActiveTab,
    refetch: loadData,
  };
};
