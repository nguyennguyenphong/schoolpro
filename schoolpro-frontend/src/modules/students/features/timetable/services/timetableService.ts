import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
} from "@/modules/students/features/timetable/types";
import { mockTimetableSlots } from "@/modules/students/features/timetable/services/mock/mockTimetableData";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

class TimetableService {
  /**
   * Retrieves timetable slots filtered by date/week/month/year and criteria.
   * Tries to fetch live backend data via DRF API, falling back to local mock data.
   */
  async getTimetableSlots(filter: TimetableFilter): Promise<TimetableSlot[]> {
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

      const response = await httpClient.get<ApiResponse<TimetableSlot[]>>(
        "/academic/timetable/",
        { params }
      );

      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }

      // If backend returns empty or unavailable, fallback to mock data
      return this.mockGetTimetableSlots(filter);
    } catch {
      // Fallback to local mock data if backend request fails
      return this.mockGetTimetableSlots(filter);
    }
  }

  /**
   * Local mock implementation providing realistic fallback schedules for high school students.
   */
  private mockGetTimetableSlots(filter: TimetableFilter): Promise<TimetableSlot[]> {
    return new Promise((resolve) => {
      const target = dayjs(filter.selectedDate);
      const weekStart = target.startOf("isoWeek");

      // Dynamically map slots according to target week so all weeks have active high school schedule
      let filtered = mockTimetableSlots.map((slot, index) => {
        const slotDate = weekStart.add(slot.dayOfWeek - 2, "day").format("YYYY-MM-DD");
        return {
          ...slot,
          id: `${slot.id}-${target.format("YYYY-MM-DD")}-${index}`,
          date: slotDate,
        };
      });

      // 1. Filter by Week (or Date/Month if specified)
      if (filter.filterMode === "date") {
        const targetDateStr = target.format("YYYY-MM-DD");
        filtered = filtered.filter((s) => s.date === targetDateStr);
      } else if (filter.filterMode === "month") {
        filtered = filtered.filter((s) => {
          const slotDate = dayjs(s.date);
          return slotDate.year() === target.year() && slotDate.month() === target.month();
        });
      } else if (filter.filterMode === "year") {
        filtered = filtered.filter((s) => {
          return dayjs(s.date).year() === target.year();
        });
      }

      // 2. Filter by Course
      if (filter.courseCode && filter.courseCode !== "all") {
        filtered = filtered.filter((s) => s.courseCode === filter.courseCode);
      }

      // 3. Filter by Shift
      if (filter.shift && filter.shift !== "all") {
        filtered = filtered.filter((s) => s.shift === filter.shift);
      }

      // 4. Filter by Class Type
      if (filter.classType && filter.classType !== "all") {
        filtered = filtered.filter((s) => s.classType === filter.classType);
      }

      // 5. Filter by Status
      if (filter.status && filter.status !== "all") {
        filtered = filtered.filter((s) => s.status === filter.status);
      }

      // 6. Search query
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.courseName.toLowerCase().includes(q) ||
            s.courseCode.toLowerCase().includes(q) ||
            s.room.toLowerCase().includes(q) ||
            s.instructorName.toLowerCase().includes(q)
        );
      }

      // Sort by date, then by startTime
      filtered.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.startTime.localeCompare(b.startTime);
      });

      resolve(filtered);
    });
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
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    const map = new Map<string, string>();
    mockTimetableSlots.forEach((s) => {
      if (!map.has(s.courseCode)) {
        map.set(s.courseCode, s.courseName);
      }
    });

    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }
}

export const timetableService = new TimetableService();
