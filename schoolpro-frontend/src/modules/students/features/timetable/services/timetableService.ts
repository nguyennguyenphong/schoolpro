import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
} from "@/modules/students/features/timetable/types";
import { mockTimetableSlots } from "@/modules/students/features/timetable/services/mock/mockTimetableData";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

class TimetableService {
  private latency = 250;

  /**
   * Retrieves timetable slots filtered by date/week/month/year and criteria
   */
  async getTimetableSlots(filter: TimetableFilter): Promise<TimetableSlot[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const target = dayjs(filter.selectedDate);
        let filtered = [...mockTimetableSlots];

        // 1. Filter by Date / Week / Month / Year
        if (filter.filterMode === "date" || filter.viewMode === "day") {
          const targetDateStr = target.format("YYYY-MM-DD");
          filtered = filtered.filter((s) => s.date === targetDateStr);
        } else if (filter.filterMode === "week" || filter.viewMode === "week") {
          const weekStart = target.startOf("isoWeek");
          const weekEnd = target.endOf("isoWeek");
          filtered = filtered.filter((s) => {
            const slotDate = dayjs(s.date);
            return (
              slotDate.isSame(weekStart, "day") ||
              slotDate.isSame(weekEnd, "day") ||
              slotDate.isBetween(weekStart, weekEnd, "day")
            );
          });
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
      }, this.latency);
    });
  }

  /**
   * Calculates overview statistics for the given slots
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
   * Returns list of unique courses for dropdown filtering
   */
  async getCoursesList(): Promise<{ code: string; name: string }[]> {
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
