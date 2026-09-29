import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import type { SurveyItem, EvaluationSummary } from "@/modules/students/features/evaluation/types";
import { evaluationService } from "@/modules/students/features/evaluation/services";

export const useEvaluation = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "all">("pending");
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
      setLoading(false);
    } catch {
      message.error("Không thể tải danh sách đánh giá & khảo sát.");
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
