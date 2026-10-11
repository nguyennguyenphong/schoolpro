import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  CreateLeaveRequestPayload,
  LeaveAffectedLessonsLookupResult,
  LeaveRequestFilter,
  LeaveRequestItem,
  LeaveRequestListResult,
  LeaveRequestSummary,
  LeaveSessionShift,
} from "@/modules/students/features/leave-requests/types";

class LeaveRequestsService {
  /**
   * Fetch leave requests list with server-side filtering, sorting, and pagination.
   */
  async getLeaveRequests(
    filter?: Partial<LeaveRequestFilter>,
  ): Promise<LeaveRequestListResult> {
    try {
      const params: Record<string, string | number | undefined> = {
        page: filter?.page || 1,
        pageSize: filter?.pageSize || 10,
      };

      if (filter?.status && filter.status !== "all") {
        params.status = filter.status;
      }

      if (filter?.leaveType && filter.leaveType !== "all") {
        params.leaveType = filter.leaveType;
      }

      if (filter?.searchQuery?.trim()) {
        params.q = filter.searchQuery.trim();
        params.search = filter.searchQuery.trim();
      }

      if (filter?.sortBy) {
        params.sortBy = filter.sortBy;
      }

      const response = await httpClient.get<ApiResponse<LeaveRequestListResult>>(
        "/academic/leave-requests/",
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
   * Fetch aggregated summary counts and student/homeroom teacher context.
   */
  async getSummary(): Promise<LeaveRequestSummary> {
    try {
      const response = await httpClient.get<ApiResponse<LeaveRequestSummary>>(
        "/academic/leave-requests/summary/",
      );

      if (response.data?.data) {
        return response.data.data;
      }

      return {
        total: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        cancelledCount: 0,
        totalDaysOff: 0,
        maxAllowedDays: 45,
        className: null,
        semesterName: null,
        academicYear: null,
      };
    } catch {
      return {
        total: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        cancelledCount: 0,
        totalDaysOff: 0,
        maxAllowedDays: 45,
        className: null,
        semesterName: null,
        academicYear: null,
      };
    }
  }

  /**
   * Fetch timetable lessons and subject teachers affected by a leave date range and shift.
   */
  async getAffectedLessons(
    startDate: string,
    endDate: string,
    sessionShift: LeaveSessionShift = "all_day",
  ): Promise<LeaveAffectedLessonsLookupResult> {
    try {
      const response = await httpClient.get<
        ApiResponse<LeaveAffectedLessonsLookupResult>
      >("/academic/leave-requests/affected-lessons/", {
        params: { startDate, endDate, sessionShift },
      });

      if (response.data?.data) {
        return response.data.data;
      }

      return {
        className: "10A1",
        homeroomTeacherName: "Giáo viên chủ nhiệm",
        homeroomTeacherEmail: "",
        approvalAuthority: "HOMEROOM_TEACHER_ONLY",
        affectedLessons: [],
        notifiedTeachers: [],
      };
    } catch {
      return {
        className: "10A1",
        homeroomTeacherName: "Giáo viên chủ nhiệm",
        homeroomTeacherEmail: "",
        approvalAuthority: "HOMEROOM_TEACHER_ONLY",
        affectedLessons: [],
        notifiedTeachers: [],
      };
    }
  }

  /**
   * Fetch detailed view of a single leave request by ID.
   */
  async getLeaveRequestById(id: string): Promise<LeaveRequestItem | null> {
    try {
      const response = await httpClient.get<ApiResponse<LeaveRequestItem>>(
        `/academic/leave-requests/${id}/`,
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
   * Create a new leave request for the student.
   */
  async createLeaveRequest(
    payload: CreateLeaveRequestPayload,
  ): Promise<LeaveRequestItem> {
    const response = await httpClient.post<ApiResponse<LeaveRequestItem>>(
      "/academic/leave-requests/",
      payload,
    );

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Không thể gửi đơn xin nghỉ phép");
  }

  /**
   * Update an existing pending leave request.
   */
  async updateLeaveRequest(
    id: string,
    payload: Partial<CreateLeaveRequestPayload>,
  ): Promise<LeaveRequestItem> {
    const response = await httpClient.put<ApiResponse<LeaveRequestItem>>(
      `/academic/leave-requests/${id}/`,
      payload,
    );

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Không thể cập nhật đơn xin nghỉ phép");
  }

  /**
   * Cancel a pending leave request.
   */
  async cancelLeaveRequest(
    id: string,
    reason?: string,
  ): Promise<LeaveRequestItem> {
    const response = await httpClient.post<ApiResponse<LeaveRequestItem>>(
      `/academic/leave-requests/${id}/cancel/`,
      { reason: reason || "" },
    );

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Không thể hủy đơn xin nghỉ phép");
  }

  /**
   * Delete a pending or cancelled leave request.
   */
  async deleteLeaveRequest(id: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<{ id: string }>>(
      `/academic/leave-requests/${id}/`,
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Không thể xóa đơn xin nghỉ phép");
    }
  }

  /**
   * Download the latest leave request PDF generated by backend.
   */
  async downloadLeaveRequestPdf(id: string, code?: string): Promise<void> {
    const response = await httpClient.get<Blob>(
      `/academic/leave-requests/${id}/download/`,
      {
        responseType: "blob",
      },
    );

    const contentDisposition = response.headers?.["content-disposition"];
    const safeCode = (code || id).replace("#", "");
    let filename = `Don_Xin_Nghi_Phep_${safeCode}.pdf`;

    if (typeof contentDisposition === "string") {
      const match = contentDisposition.match(/filename="?([^";]+)"?/i);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }
}

export const leaveRequestsService = new LeaveRequestsService();
