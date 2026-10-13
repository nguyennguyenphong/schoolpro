import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
  TimetableMeta,
  TimetableResponseData,
  TimetablePrintDocumentData,
} from "@/modules/students/features/timetable/types";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

interface TimetableApiResponse {
  success: boolean;
  code: number;
  message: string;
  data: TimetableSlot[];
  meta?: TimetableMeta;
}

class TimetableService {
  /**
   * Retrieves timetable slots filtered by date/week/month/year and criteria.
   * Directly fetches live backend data via DRF API, returns empty array if no data.
   */
  async getTimetableSlots(filter: TimetableFilter): Promise<TimetableResponseData> {
    try {
      const params: Record<string, string | number | undefined> = {
        date: filter.selectedDate,
      };

      if (filter.searchQuery?.trim()) {
        params.search = filter.searchQuery.trim();
      }
      if (filter.shift && filter.shift !== "all") {
        params.shift = filter.shift;
      }
      if (filter.classType && filter.classType !== "all") {
        params.classType = filter.classType;
      }
      if (filter.status && filter.status !== "all") {
        params.status = filter.status;
      }

      const response = await httpClient.get<TimetableApiResponse>(
        "/academic/timetable/",
        { params }
      );

      if (response.data && Array.isArray(response.data.data)) {
        return {
          slots: response.data.data,
          meta: response.data.meta ?? null,
        };
      }

      return { slots: [], meta: null };
    } catch {
      // Return empty if API error or no data
      return { slots: [], meta: null };
    }
  }

  /**
   * Calculates overview statistics for the given slots.
   */
  calculateSummary(slots: TimetableSlot[]): TimetableSummary {
    const totalSessions = slots.length;
    const courseCreditsMap = new Map<string, number>();

    let totalTheory = 0;
    let totalPractice = 0;
    let completedCount = 0;
    let upcomingCount = 0;
    let ongoingCount = 0;
    let presentCount = 0;

    slots.forEach((s) => {
      if (!courseCreditsMap.has(s.courseCode)) {
        courseCreditsMap.set(s.courseCode, s.credits);
      }
      if (s.classType === "theory") totalTheory++;
      if (s.classType === "practice") totalPractice++;
      if (s.status === "completed") completedCount++;
      if (s.status === "upcoming") upcomingCount++;
      if (s.status === "ongoing") ongoingCount++;
      if (s.attendanceStatus === "present") presentCount++;
    });

    const totalCredits = Array.from(courseCreditsMap.values()).reduce(
      (acc, c) => acc + c,
      0
    );

    const attendanceRate =
      completedCount > 0 ? Math.round((presentCount / completedCount) * 100) : 100;

    return {
      totalSessions,
      totalCredits,
      totalTheorySessions: totalTheory,
      totalPracticeSessions: totalPractice,
      attendanceRate,
      upcomingSessions: upcomingCount,
      ongoingSessions: ongoingCount,
      completedSessions: completedCount,
    };
  }

  /**
   * Returns list of unique courses for dropdown filtering.
   */
  async getCoursesList(): Promise<{ code: string; name: string }[]> {
    try {
      const response = await httpClient.get<ApiResponse<{ code: string; name: string }[]>>(
        "/academic/timetable/courses/"
      );
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch {
      // Return empty if API call fails
    }

    return [];
  }

  /**
   * Fetches official printable timetable document rendered dynamically by backend sys.export_templates.
   */
  async printOrExportTimetable(params?: {
    date?: string;
    templateCode?: string;
    format?: string;
  }): Promise<TimetablePrintDocumentData | null> {
    try {
      const response = await httpClient.get<ApiResponse<TimetablePrintDocumentData>>(
        "/academic/timetable/print/",
        { params }
      );
      if (response.data?.data?.html) {
        return response.data.data;
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  }
}

export const timetableService = new TimetableService();
