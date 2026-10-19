import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  ExamItem,
  ExamSummary,
  ExamSubmission,
  ExamFilter,
  ExamListResult,
} from "@/modules/students/features/exams/types";

class ExamsService {
  /**
   * Fetch list of exams from Backend API.
   */
  async getExams(filter?: Partial<ExamFilter>): Promise<ExamListResult> {
    const params: Record<string, string | number | undefined> = {};
    if (filter?.status && filter.status !== "all") params.status = filter.status;
    if (filter?.subject && filter.subject !== "all") params.subject = filter.subject;
    if (filter?.format && filter.format !== "all") params.format = filter.format;
    if (filter?.sortBy) params.sortBy = filter.sortBy;
    if (filter?.page) params.page = filter.page;
    if (filter?.pageSize) params.pageSize = filter.pageSize;
    if (filter?.searchQuery?.trim()) {
      params.q = filter.searchQuery.trim();
      params.search = filter.searchQuery.trim();
    }

    const res = await httpClient.get<
      ApiResponse<
        | {
            items: ExamItem[];
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
          }
        | ExamItem[]
      >
    >("/academic/exams/", { params });

    if (res.data?.data) {
      const data = res.data.data;
      if (
        typeof data === "object" &&
        !Array.isArray(data) &&
        "items" in data &&
        Array.isArray(data.items)
      ) {
        return {
          items: data.items,
          total: data.total ?? data.items.length,
          page: data.page ?? 1,
          pageSize: data.pageSize ?? 10,
          totalPages: data.totalPages ?? 1,
        };
      }
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: 1,
          pageSize: data.length || 10,
          totalPages: 1,
        };
      }
    }
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
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
    answers: Record<string, number | string | string[] | boolean>,
    allowIncomplete = false
  ): Promise<{ success: boolean; score?: number; message: string }> {
    const res = await httpClient.post<ApiResponse<{ score?: number; message: string }>>(
      `/academic/exams/${examId}/submit/`,
      { answers, allowIncomplete }
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
