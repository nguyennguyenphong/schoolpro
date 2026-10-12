import dayjs from "dayjs";
import type {
  LeaveAffectedLesson,
  LeaveRequestSummary,
  LeaveSessionShift,
} from "@/modules/students/features/leave-requests/types";

export interface NotifiedTeacherPreview {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  subjects: string[];
  lessonCount: number;
}

export interface NotificationRecipientsPreview {
  homeroomAlsoSubjectTeacher: boolean;
  homeroomTeachingSubjects: string[];
  homeroomLessonCount: number;
  otherSubjectTeachers: NotifiedTeacherPreview[];
}

export interface ApprovalDeadlinePreview {
  firstLesson: LeaveAffectedLesson;
  deadlineFormatted: string;
}

/**
 * Converts a Dayjs weekday (0 = Sunday, 1 = Monday ... 6 = Saturday)
 * to SchoolPro DB timetable day_of_week (2 = Monday ... 7 = Saturday, 8 = Sunday).
 */
export function toTimetableDayOfWeek(d: dayjs.Dayjs): number {
  const jsDay = d.day();
  return jsDay === 0 ? 8 : jsDay + 1;
}

/**
 * Finds the nearest date starting from `baseDate` that falls on one of `activeDaysOfWeek`.
 */
export function getNearestValidStudyDate(
  baseDate: dayjs.Dayjs,
  activeDaysOfWeek: number[],
): string {
  if (!activeDaysOfWeek || activeDaysOfWeek.length === 0) {
    return baseDate.format("YYYY-MM-DD");
  }
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = baseDate.add(offset, "day");
    if (activeDaysOfWeek.includes(toTimetableDayOfWeek(candidate))) {
      return candidate.format("YYYY-MM-DD");
    }
  }
  return baseDate.format("YYYY-MM-DD");
}

/**
 * Computes the earliest lesson and the 3-hour pre-lesson auto-approval deadline.
 */
export function computeApprovalDeadlinePreview(
  selectedLessons: LeaveAffectedLesson[],
): ApprovalDeadlinePreview | null {
  if (selectedLessons.length === 0) return null;

  let earliest: dayjs.Dayjs | null = null;
  let firstLesson: LeaveAffectedLesson | null = null;

  for (const lesson of selectedLessons) {
    const candidate = dayjs(
      `${lesson.date} ${lesson.startTime || "07:15"}`,
      "YYYY-MM-DD HH:mm",
    );
    if (candidate.isValid() && (!earliest || candidate.isBefore(earliest))) {
      earliest = candidate;
      firstLesson = lesson;
    }
  }

  if (!earliest || !firstLesson) return null;

  const deadline = earliest.subtract(3, "hour");
  return {
    firstLesson,
    deadlineFormatted: deadline.format("HH:mm - DD/MM/YYYY"),
  };
}

/**
 * Groups notified teachers from selected lessons and detects whether the Homeroom Teacher
 * also teaches one or more of the affected subjects.
 */
export function computeNotificationRecipients(
  selectedLessons: LeaveAffectedLesson[],
  summary: LeaveRequestSummary | null,
): NotificationRecipientsPreview {
  const homeroomEmail = (summary?.homeroomTeacherEmail || "").trim().toLowerCase();
  const homeroomName = (summary?.homeroomTeacherName || "").trim().toLowerCase();

  let homeroomTeachingSubjects: string[] = [];
  let homeroomLessonCount = 0;

  const otherTeachersMap = new Map<string, NotifiedTeacherPreview>();

  for (const lesson of selectedLessons) {
    const tEmail = (lesson.teacherEmail || "").trim().toLowerCase();
    const tName = (lesson.teacherName || "").trim().toLowerCase();
    const isHomeroom =
      (Boolean(homeroomEmail) && tEmail === homeroomEmail) ||
      (Boolean(homeroomName) && tName === homeroomName);

    if (isHomeroom) {
      if (!homeroomTeachingSubjects.includes(lesson.subjectName)) {
        homeroomTeachingSubjects = [...homeroomTeachingSubjects, lesson.subjectName];
      }
      homeroomLessonCount += 1;
      continue;
    }

    const key = lesson.teacherEmail || lesson.teacherId || lesson.teacherName;
    if (!key) continue;

    const existing = otherTeachersMap.get(key);
    if (!existing) {
      otherTeachersMap.set(key, {
        teacherId: lesson.teacherId,
        teacherName: lesson.teacherName,
        teacherEmail: lesson.teacherEmail,
        subjects: [lesson.subjectName],
        lessonCount: 1,
      });
    } else {
      if (!existing.subjects.includes(lesson.subjectName)) {
        existing.subjects.push(lesson.subjectName);
      }
      existing.lessonCount += 1;
    }
  }

  return {
    homeroomAlsoSubjectTeacher: homeroomLessonCount > 0,
    homeroomTeachingSubjects,
    homeroomLessonCount,
    otherSubjectTeachers: Array.from(otherTeachersMap.values()),
  };
}

/**
 * Calculates total study days based on active timetable lessons in the selected range.
 */
export function calculateStudyDaysCount(
  startDate: string,
  endDate: string,
  sessionShift: LeaveSessionShift,
  allDayLessonsForRange: LeaveAffectedLesson[],
  availableLessonsCount: number,
): number {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
    return 0;
  }

  const uniqueLessonDates = new Set(allDayLessonsForRange.map((l) => l.date));
  const activeDaysCount = uniqueLessonDates.size;
  if (activeDaysCount === 0) {
    return 0;
  }

  if (
    activeDaysCount === 1 &&
    (sessionShift === "morning" || sessionShift === "afternoon")
  ) {
    return availableLessonsCount > 0 ? 0.5 : 0;
  }

  return activeDaysCount;
}
