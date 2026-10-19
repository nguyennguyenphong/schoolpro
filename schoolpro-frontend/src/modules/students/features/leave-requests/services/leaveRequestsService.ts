import i18n from "@/i18n/i18n";
import { API_BASE_URL, httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type { LeaveRequestRenderedExport } from "@/shared/types/exportTemplate";
import type {
  CreateLeaveRequestPayload,
  LeaveAffectedLessonsLookupResult,
  LeaveRequestFilter,
  LeaveRequestItem,
  LeaveRequestListResult,
  LeaveRequestRealtimeEventType,
  LeaveRequestRealtimePayload,
  LeaveRequestRealtimeSyncSnapshot,
  LeaveRequestSummary,
  LeaveSessionShift,
} from "@/modules/students/features/leave-requests/types";

export const LEAVE_REQUEST_BROADCAST_CHANNEL = "schoolpro_leave_requests_realtime";

class LeaveRequestsService {
  /**
   * Emits a real-time event across browser tabs via BroadcastChannel and window CustomEvent.
   */
  emitLocalRealtimeEvent(payload: LeaveRequestRealtimePayload): void {
    if (typeof window === "undefined") return;

    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(LEAVE_REQUEST_BROADCAST_CHANNEL);
        channel.postMessage(payload);
        channel.close();
      }
    } catch {
      // Ignore BroadcastChannel errors in unsupported environments
    }

    try {
      window.dispatchEvent(
        new CustomEvent<LeaveRequestRealtimePayload>(LEAVE_REQUEST_BROADCAST_CHANNEL, {
          detail: payload,
        }),
      );
    } catch {
      // Ignore CustomEvent errors
    }
  }

  /**
   * Builds the authenticated WebSocket URL for real-time leave request updates.
   */
  buildRealtimeWebSocketUrl(params?: {
    leaveRequestId?: string;
    classId?: string;
  }): string {
    const httpOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    const wsOrigin = httpOrigin.replace(/^http/i, "ws");
    const searchParams = new URLSearchParams();

    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("schoolpro_access_token") ||
        sessionStorage.getItem("schoolpro_access_token");
      if (token) {
        searchParams.set("token", token);
      }
    }

    if (params?.leaveRequestId) {
      searchParams.set("leaveRequestId", params.leaveRequestId);
    }
    if (params?.classId) {
      searchParams.set("classId", params.classId);
    }

    const query = searchParams.toString();
    return `${wsOrigin}/ws/academic/leave-requests/${query ? `?${query}` : ""}`;
  }

  /**
   * Fetches lightweight real-time synchronization snapshot and triggers 3-hour pre-lesson auto-approval check.
   */
  async getRealtimeSyncSnapshot(params?: {
    leaveRequestId?: string;
    classId?: string;
    studentId?: string;
  }): Promise<LeaveRequestRealtimeSyncSnapshot | null> {
    try {
      const response = await httpClient.get<ApiResponse<LeaveRequestRealtimeSyncSnapshot>>(
        "/academic/leave-requests/realtime-sync/",
        { params },
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

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

      if (filter?.academicYear && filter.academicYear !== "all") {
        params.academicYear = filter.academicYear;
      }

      if (filter?.semester && filter.semester !== "all") {
        params.semester = filter.semester;
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
  async getSummary(filter?: {
    academicYear?: string;
    semester?: string;
  }): Promise<LeaveRequestSummary> {
    try {
      const params: Record<string, string | undefined> = {};
      if (filter?.academicYear && filter.academicYear !== "all") {
        params.academicYear = filter.academicYear;
      }
      if (filter?.semester && filter.semester !== "all") {
        params.semester = filter.semester;
      }

      const response = await httpClient.get<ApiResponse<LeaveRequestSummary>>(
        "/academic/leave-requests/summary/",
        { params },
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
        homeroomTeacherName: i18n.t("card:leaveRequests.header.homeroomTeacherFallback"),
        homeroomTeacherEmail: "",
        approvalAuthority: "HOMEROOM_TEACHER_ONLY",
        affectedLessons: [],
        notifiedTeachers: [],
      };
    } catch {
      return {
        className: "10A1",
        homeroomTeacherName: i18n.t("card:leaveRequests.header.homeroomTeacherFallback"),
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
      const created = response.data.data;
      this._notifyMutation("LEAVE_REQUEST_CREATED", created.id, created);
      return created;
    }

    throw new Error(response.data?.message || i18n.t("message:leaveRequestCreateError"));
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
      const updated = response.data.data;
      this._notifyMutation("LEAVE_REQUEST_UPDATED", updated.id, updated);
      return updated;
    }

    throw new Error(response.data?.message || i18n.t("message:leaveRequestUpdateError"));
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
      const cancelled = response.data.data;
      this._notifyMutation("LEAVE_REQUEST_CANCELLED", cancelled.id, cancelled);
      return cancelled;
    }

    throw new Error(response.data?.message || i18n.t("message:leaveRequestCancelError"));
  }

  /**
   * Delete a pending or cancelled leave request.
   */
  async deleteLeaveRequest(id: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<{ id: string }>>(
      `/academic/leave-requests/${id}/`,
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || i18n.t("message:leaveRequestDeleteError"));
    }

    this._notifyMutation("LEAVE_REQUEST_DELETED", id, null);
  }

  /**
   * Renders the leave request into full HTML & CSS using the dynamic ExportTemplate
   * stored in sys.export_templates via GET /academic/leave-requests/:id/export-render/
   */
  async renderLeaveRequestExport(
    id: string,
    options?: {
      templateCode?: string;
      templateId?: string;
    },
  ): Promise<LeaveRequestRenderedExport | null> {
    try {
      const response = await httpClient.get<ApiResponse<LeaveRequestRenderedExport>>(
        `/academic/leave-requests/${id}/export-render/`,
        {
          params: {
            templateCode: options?.templateCode,
            templateId: options?.templateId,
          },
        },
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

  /**
   * Downloads the leave request document rendered dynamically via sys.export_templates.
   * Honors the template's file_format (PDF, HTML_PRINT, WORD), CSS/HTML layout, and filename_pattern.
   */
  async downloadLeaveRequestPdf(
    id: string,
    code?: string,
    options?: {
      format?: "pdf" | "html" | "word";
      templateCode?: string;
      templateId?: string;
    },
  ): Promise<void> {
    const response = await httpClient.get<Blob>(
      `/academic/leave-requests/${id}/download/`,
      {
        params: {
          format: options?.format,
          templateCode: options?.templateCode,
          templateId: options?.templateId,
        },
        responseType: "blob",
      },
    );

    const contentDisposition = response.headers?.["content-disposition"];
    const contentType =
      (response.headers?.["content-type"] as string | undefined) || "application/pdf";
    const safeCode = (code || id).replace("#", "");
    const ext =
      options?.format === "html"
        ? "html"
        : options?.format === "word"
          ? "doc"
          : contentType.includes("html")
            ? "html"
            : contentType.includes("msword")
              ? "doc"
              : "pdf";
    let filename = `Don_Xin_Nghi_Phep_${safeCode}.${ext}`;

    if (typeof contentDisposition === "string") {
      const match = contentDisposition.match(/filename="?([^";]+)"?/i);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }

  private _notifyMutation(
    eventType: LeaveRequestRealtimeEventType,
    leaveRequestId: string,
    item: LeaveRequestItem | null,
  ): void {
    this.emitLocalRealtimeEvent({
      eventType,
      leaveRequestId,
      code: item?.code || item?.requestCode,
      status: item?.status,
      isAutoApproved: item?.isAutoApproved,
      timestamp: new Date().toISOString(),
      item,
    });
  }
}

export const leaveRequestsService = new LeaveRequestsService();
