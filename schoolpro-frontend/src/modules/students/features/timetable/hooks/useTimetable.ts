import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
  TimetableFilterMode,
  TimetableViewMode,
  ClassShift,
  ClassType,
  ClassStatus,
} from "@/modules/students/features/timetable/types";
import { timetableService } from "@/modules/students/features/timetable/services";

export interface UseTimetableResult {
  slots: TimetableSlot[];
  summary: TimetableSummary;
  courses: { code: string; name: string }[];
  filter: TimetableFilter;
  loading: boolean;
  error: Error | null;
  selectedSlot: TimetableSlot | null;
  isDetailOpen: boolean;
  currentWeekLabel: string;
  currentMonthLabel: string;
  currentYearLabel: string;
  currentDateLabel: string;
  setSelectedDate: (date: string) => void;
  setFilterMode: (mode: TimetableFilterMode) => void;
  setViewMode: (mode: TimetableViewMode) => void;
  setCourseCode: (code?: string) => void;
  setShift: (shift?: "all" | ClassShift) => void;
  setClassType: (type?: "all" | ClassType) => void;
  setStatus: (status?: "all" | ClassStatus) => void;
  setSearchQuery: (query: string) => void;
  openSlotDetail: (slot: TimetableSlot) => void;
  closeSlotDetail: () => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  refetch: () => Promise<void>;
}

const DEFAULT_DATE = "2026-09-28";

export const useTimetable = (initialDate = DEFAULT_DATE): UseTimetableResult => {
  const [filter, setFilter] = useState<TimetableFilter>({
    selectedDate: initialDate,
    filterMode: "week",
    viewMode: "week",
    shift: "all",
    classType: "all",
    status: "all",
  });

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load courses once
  useEffect(() => {
    timetableService.getCoursesList().then(setCourses).catch(console.error);
  }, []);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await timetableService.getTimetableSlots(filter);
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Lỗi tải thời khóa biểu"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const data = await timetableService.getTimetableSlots(filter);
        if (!ignore) {
          setSlots(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Lỗi tải thời khóa biểu"));
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [filter]);

  const summary = useMemo(() => {
    return timetableService.calculateSummary(slots);
  }, [slots]);

  // Labels for UI
  const targetDayjs = dayjs(filter.selectedDate);

  const currentWeekLabel = useMemo(() => {
    const start = targetDayjs.startOf("isoWeek").format("DD/MM/YYYY");
    const end = targetDayjs.endOf("isoWeek").format("DD/MM/YYYY");
    return `${start} - ${end}`;
  }, [targetDayjs]);

  const currentMonthLabel = useMemo(() => {
    return targetDayjs.format("MM/YYYY");
  }, [targetDayjs]);

  const currentYearLabel = useMemo(() => {
    return targetDayjs.format("YYYY");
  }, [targetDayjs]);

  const currentDateLabel = useMemo(() => {
    return targetDayjs.format("DD/MM/YYYY");
  }, [targetDayjs]);

  // Handlers
  const setSelectedDate = useCallback((date: string) => {
    setFilter((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const setFilterMode = useCallback((mode: TimetableFilterMode) => {
    setFilter((prev) => {
      let newViewMode = prev.viewMode;
      if (mode === "date") newViewMode = "day";
      if (mode === "week") newViewMode = "week";
      if (mode === "month" || mode === "year") newViewMode = "list";
      return { ...prev, filterMode: mode, viewMode: newViewMode };
    });
  }, []);

  const setViewMode = useCallback((mode: TimetableViewMode) => {
    setFilter((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setCourseCode = useCallback((code?: string) => {
    setFilter((prev) => ({ ...prev, courseCode: code }));
  }, []);

  const setShift = useCallback((shift?: "all" | ClassShift) => {
    setFilter((prev) => ({ ...prev, shift }));
  }, []);

  const setClassType = useCallback((type?: "all" | ClassType) => {
    setFilter((prev) => ({ ...prev, classType: type }));
  }, []);

  const setStatus = useCallback((status?: "all" | ClassStatus) => {
    setFilter((prev) => ({ ...prev, status }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const openSlotDetail = useCallback((slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsDetailOpen(true);
  }, []);

  const closeSlotDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const goToToday = useCallback(() => {
    setFilter((prev) => ({ ...prev, selectedDate: DEFAULT_DATE }));
  }, []);

  const goToPrevious = useCallback(() => {
    setFilter((prev) => {
      const current = dayjs(prev.selectedDate);
      let updated = current;
      if (prev.filterMode === "date" || prev.viewMode === "day") {
        updated = current.subtract(1, "day");
      } else if (prev.filterMode === "week" || prev.viewMode === "week") {
        updated = current.subtract(1, "week");
      } else if (prev.filterMode === "month") {
        updated = current.subtract(1, "month");
      } else if (prev.filterMode === "year") {
        updated = current.subtract(1, "year");
      }
      return { ...prev, selectedDate: updated.format("YYYY-MM-DD") };
    });
  }, []);

  const goToNext = useCallback(() => {
    setFilter((prev) => {
      const current = dayjs(prev.selectedDate);
      let updated = current;
      if (prev.filterMode === "date" || prev.viewMode === "day") {
        updated = current.add(1, "day");
      } else if (prev.filterMode === "week" || prev.viewMode === "week") {
        updated = current.add(1, "week");
      } else if (prev.filterMode === "month") {
        updated = current.add(1, "month");
      } else if (prev.filterMode === "year") {
        updated = current.add(1, "year");
      }
      return { ...prev, selectedDate: updated.format("YYYY-MM-DD") };
    });
  }, []);

  return {
    slots,
    summary,
    courses,
    filter,
    loading,
    error,
    selectedSlot,
    isDetailOpen,
    currentWeekLabel,
    currentMonthLabel,
    currentYearLabel,
    currentDateLabel,
    setSelectedDate,
    setFilterMode,
    setViewMode,
    setCourseCode,
    setShift,
    setClassType,
    setStatus,
    setSearchQuery,
    openSlotDetail,
    closeSlotDetail,
    goToToday,
    goToPrevious,
    goToNext,
    refetch: fetchSlots,
  };
};
