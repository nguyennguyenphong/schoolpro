import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  AssignmentFilter,
  AssignmentItem,
  AssignmentListResult,
  AssignmentSubmission,
  AssignmentSummary,
} from "@/modules/students/features/assignments/types";

class AssignmentsService {
  /**
   * Fetch assignments list with server-side filtering and pagination.
   */
  async getAssignments(filter?: Partial<AssignmentFilter>): Promise<AssignmentListResult> {
    try {
      const params: Record<string, string | number | undefined> = {
        page: filter?.page || 1,
        pageSize: filter?.pageSize || 10,
      };

      if (filter?.subject && filter.subject !== "all") {
        params.subject = filter.subject;
      }

      if (filter?.status && filter.status !== "all") {
        params.status = filter.status;
      }

      if (filter?.type && filter.type !== "all") {
        params.type = filter.type;
      }

      if (filter?.searchQuery?.trim()) {
        params.q = filter.searchQuery.trim();
        params.search = filter.searchQuery.trim();
      }

      if (filter?.sortBy) {
        params.sortBy = filter.sortBy;
      }

      const response = await httpClient.get<ApiResponse<AssignmentListResult>>(
        "/academic/assignments/",
        { params },
      );

      if (response.data?.data) {
        return response.data.data;
      }

      return {
        items: [],
        total: 0,
        page: filter?.page || 1,
        pageSize: filter?.pageSize || 10,
        totalPages: 0,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: filter?.page || 1,
        pageSize: filter?.pageSize || 10,
        totalPages: 0,
      };
    }
  }

  /**
   * Fetch aggregated statistical counts and summary metrics for student assignments.
   */
  async getSummary(): Promise<AssignmentSummary> {
    try {
      const response = await httpClient.get<ApiResponse<AssignmentSummary>>(
        "/academic/assignments/summary/",
      );

      if (response.data?.data) {
        return response.data.data;
      }

      return {
        total: 0,
        pendingCount: 0,
        submittedCount: 0,
        gradedCount: 0,
        overdueCount: 0,
        averageScore: 0,
        className: null,
        semesterName: null,
        academicYear: null,
        subjects: [],
      };
    } catch {
      return {
        total: 0,
        pendingCount: 0,
        submittedCount: 0,
        gradedCount: 0,
        overdueCount: 0,
        averageScore: 0,
        className: null,
        semesterName: null,
        academicYear: null,
        subjects: [],
      };
    }
  }

  /**
   * Fetch detailed view of a single assignment item by ID.
   */
  async getAssignmentById(id: string): Promise<AssignmentItem | null> {
    try {
      const response = await httpClient.get<ApiResponse<AssignmentItem>>(
        `/academic/assignments/${id}/`,
      );

      if (response.data?.data) {
        return response.data.data;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Submit student answers and attachments for an assignment.
   */
  async submitAssignment(
    assignmentId: string,
    submission: AssignmentSubmission,
  ): Promise<AssignmentItem> {
    const payload = {
      content: submission.content || "",
      files: submission.files || [],
      fileName: submission.fileName || "",
      fileUrl: submission.fileUrl || "",
    };

    const response = await httpClient.post<ApiResponse<AssignmentItem>>(
      `/academic/assignments/${assignmentId}/submit/`,
      payload,
    );

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Không thể nộp bài tập");
  }

  /**
   * Send a reopen request to the subject teacher for an overdue assignment.
   */
  async requestReopenAssignment(
    assignmentId: string,
    reason: string,
  ): Promise<AssignmentItem> {
    const response = await httpClient.post<ApiResponse<AssignmentItem>>(
      `/academic/assignments/${assignmentId}/reopen/`,
      { reason },
    );

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Không thể gửi yêu cầu mở lại nộp bài");
  }
}

export const assignmentsService = new AssignmentsService();

