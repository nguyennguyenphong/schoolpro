import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  ExamItem,
  ExamSummary,
  ExamSubmission,
  ExamFilter,
} from "@/modules/students/features/exams/types";

class ExamsService {
  /**
   * Fetch list of exams from Backend API.
   */
  async getExams(filter?: Partial<ExamFilter>): Promise<ExamItem[]> {
    const params: Record<string, string | number | undefined> = {};
    if (filter?.status && filter.status !== "all") params.status = filter.status;
    if (filter?.semester && filter.semester !== "all") params.semester = filter.semester;
    if (filter?.searchQuery?.trim()) {
      params.q = filter.searchQuery.trim();
      params.search = filter.searchQuery.trim();
    }

    const res = await httpClient.get<ApiResponse<ExamItem[]>>("/academic/exams/", { params });
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  }

  /**
   * Fetch exam detail with dynamic questions from Backend API.
   */
  async getExamById(id: string): Promise<ExamItem | null> {
    const res = await httpClient.get<ApiResponse<ExamItem>>(`/academic/exams/${id}/`);
    if (res.data?.data) {
      return res.data.data;
    }
    return null;
  }

  /**
   * Fetch exam summary metrics from Backend API.
   */
  async getExamSummary(): Promise<ExamSummary> {
    const res = await httpClient.get<ApiResponse<ExamSummary>>("/academic/exams/summary/");
    if (res.data?.data) {
      return res.data.data;
    }
    return {
      total: 0,
      pendingCount: 0,
      completedCount: 0,
      expiredCount: 0,
      averageScore: 0,
    };
  }

  /**
   * Fetch past exam submission from Backend API.
   */
  async getSubmission(examId: string): Promise<ExamSubmission | null> {
    const res = await httpClient.get<ApiResponse<ExamSubmission>>(
      `/academic/exams/${examId}/submission/`
    );
    if (res.data?.data) {
      return res.data.data;
    }
    return null;
  }

  /**
   * Submit exam answers to Backend API for automatic grading.
   */
  async submitExam(
    examId: string,
    answers: Record<string, number | string | string[] | boolean>
  ): Promise<{ success: boolean; score: number; message: string }> {
    const res = await httpClient.post<ApiResponse<{ score: number; message: string }>>(
      `/academic/exams/${examId}/submit/`,
      { answers }
    );
    if (res.data?.data) {
      return {
        success: true,
        score: res.data.data.score,
        message: res.data.data.message || res.data.message || "Nộp bài thi thành công!",
      };
    }
    return {
      success: true,
      score: 0,
      message: res.data?.message || "Nộp bài thi thành công!",
    };
  }
}

export const examsService = new ExamsService();
