import type {
  SurveyItem,
  EvaluationSummary,
  SurveySubmission,
} from "@/modules/students/features/evaluation/types";
import {
  mockSurveys,
} from "@/modules/students/features/evaluation/services/mock/mockEvaluationData";

class EvaluationService {
  private surveys: SurveyItem[] = [...mockSurveys];
  private submissions: Map<string, SurveySubmission> = new Map<string, SurveySubmission>([
    [
      "survey-04",
      {
        surveyId: "survey-04",
        answers: {
          "hd-1": 5,
          "hd-2": 4,
        },
        submittedAt: "2025-12-15 09:15",
      },
    ],
    [
      "survey-05",
      {
        surveyId: "survey-05",
        answers: {
          "eng-1": 5,
          "eng-2": 5,
        },
        submittedAt: "2025-12-20 16:45",
      },
    ],
  ]);
  private latency = 200;

  /**
   * Lấy tổng quan số liệu khảo sát
   */
  async getSummary(): Promise<EvaluationSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = this.surveys.length;
        const pendingCount = this.surveys.filter((s) => s.status === "pending").length;
        const completedCount = this.surveys.filter((s) => s.status === "completed").length;
        const expiredCount = this.surveys.filter((s) => s.status === "expired").length;
        const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        resolve({
          total,
          pendingCount,
          completedCount,
          expiredCount,
          completionRate,
        });
      }, this.latency);
    });
  }

  /**
   * Lấy danh sách khảo sát theo tab (pending | completed | all)
   */
  async getSurveys(statusFilter?: "all" | "pending" | "completed"): Promise<SurveyItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.surveys];
        if (statusFilter === "pending") {
          result = result.filter((s) => s.status === "pending");
        } else if (statusFilter === "completed") {
          result = result.filter((s) => s.status === "completed");
        }
        resolve(result);
      }, this.latency);
    });
  }

  /**
   * Lấy chi tiết khảo sát theo id
   */
  async getSurveyById(id: string): Promise<SurveyItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.surveys.find((s) => s.id === id);
        resolve(found || null);
      }, this.latency);
    });
  }

  /**
   * Nộp kết quả đánh giá khảo sát
   */
  async submitSurvey(
    surveyId: string,
    answers: Record<string, number | string | string[]>,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
          2,
          "0",
        )}:${String(now.getMinutes()).padStart(2, "0")}`;

        // Lưu câu trả lời
        this.submissions.set(surveyId, {
          surveyId,
          answers,
          submittedAt: formattedDate,
        });

        // Cập nhật trạng thái phiếu khảo sát
        const targetIndex = this.surveys.findIndex((s) => s.id === surveyId);
        if (targetIndex !== -1) {
          this.surveys[targetIndex] = {
            ...this.surveys[targetIndex],
            status: "completed",
            completedAt: formattedDate,
          };
        }

        resolve(true);
      }, this.latency);
    });
  }

  /**
   * Lấy kết quả đã nộp của 1 khảo sát
   */
  async getSubmission(surveyId: string): Promise<SurveySubmission | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.submissions.get(surveyId);
        resolve(found || null);
      }, this.latency);
    });
  }
}

export const evaluationService = new EvaluationService();
