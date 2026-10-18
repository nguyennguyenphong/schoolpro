import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { TimetableMeta } from "@/modules/students/features/timetable/types";

dayjs.extend(isoWeek);

export interface UseTimetableNavigationProps {
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  meta: TimetableMeta | null;
}

export interface UseTimetableNavigationResult {
  currentWeekLabel: string;
  semesterLabel: string;
  isOutsideSemester: boolean;
  vacationReason: string | null;
  minDate?: string;
  maxDate?: string;
  isToday: boolean;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
}

export const useTimetableNavigation = ({
  selectedDate,
  onDateChange,
  meta,
}: UseTimetableNavigationProps): UseTimetableNavigationResult => {
  const currentDayjs = dayjs(selectedDate);
  const minDate = useMemo(() => meta?.academicYear?.startDate || undefined, [meta]);
  const maxDate = useMemo(() => meta?.academicYear?.endDate || undefined, [meta]);

  const minDayjs = useMemo(() => (minDate ? dayjs(minDate) : null), [minDate]);
  const maxDayjs = useMemo(() => (maxDate ? dayjs(maxDate) : null), [maxDate]);

  const isToday = useMemo(() => currentDayjs.isSame(dayjs(), "day"), [currentDayjs]);

  const isPrevDisabled = useMemo(() => {
    if (!minDayjs) return false;
    return currentDayjs.isBefore(minDayjs) || currentDayjs.isSame(minDayjs, "day");
  }, [currentDayjs, minDayjs]);

  const isNextDisabled = useMemo(() => {
    if (!maxDayjs) return false;
    return currentDayjs.isAfter(maxDayjs) || currentDayjs.isSame(maxDayjs, "day");
  }, [currentDayjs, maxDayjs]);

  // Semester info and vacation metadata
  const semesterLabel = useMemo(() => meta?.semester?.name || "", [meta]);

  const isOutsideSemester = useMemo(() => Boolean(meta?.selectedWeek?.isOutside), [meta]);

  const vacationReason = useMemo(() => meta?.selectedWeek?.vacationReason ?? null, [meta]);

  // Formatted week label (e.g. "06/10/2026 - 12/10/2026 (Week 5)")
  const currentWeekLabel = useMemo(() => {
    const targetDayjs = dayjs(selectedDate);
    const start = targetDayjs.startOf("isoWeek").format("DD/MM/YYYY");
    const end = targetDayjs.endOf("isoWeek").format("DD/MM/YYYY");
    if (!meta?.semester?.startDate) {
      return `${start} - ${end}`;
    }
    const semStart = dayjs(meta.semester.startDate);
    const weekNum = targetDayjs.diff(semStart, "week") + 1;
    return `${start} - ${end}${weekNum > 0 ? ` (Tuần ${weekNum})` : ""}`;
  }, [selectedDate, meta]);

  // Navigation handlers
  const goToToday = useCallback(() => {
    onDateChange(dayjs().format("YYYY-MM-DD"));
  }, [onDateChange]);

  const goToPreviousDay = useCallback(() => {
    const updated = currentDayjs.subtract(1, "day");
    onDateChange(updated.format("YYYY-MM-DD"));
  }, [currentDayjs, onDateChange]);

  const goToNextDay = useCallback(() => {
    const updated = currentDayjs.add(1, "day");
    onDateChange(updated.format("YYYY-MM-DD"));
  }, [currentDayjs, onDateChange]);

  const goToPreviousWeek = useCallback(() => {
    const updated = currentDayjs.subtract(1, "week");
    onDateChange(updated.format("YYYY-MM-DD"));
  }, [currentDayjs, onDateChange]);

  const goToNextWeek = useCallback(() => {
    const updated = currentDayjs.add(1, "week");
    onDateChange(updated.format("YYYY-MM-DD"));
  }, [currentDayjs, onDateChange]);

  return {
    currentWeekLabel,
    semesterLabel,
    isOutsideSemester,
    vacationReason,
    minDate,
    maxDate,
    isToday,
    isPrevDisabled,
    isNextDisabled,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
  };
};
