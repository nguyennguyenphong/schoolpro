import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
  TimetableMeta,
  TimetableViewMode,
} from "@/modules/students/features/timetable/types";
import { timetableService } from "@/modules/students/features/timetable/services";

export interface UseTimetableResult {
  slots: TimetableSlot[];
  summary: TimetableSummary;
  meta: TimetableMeta | null;
  filter: TimetableFilter;
  loading: boolean;
  error: Error | null;
  selectedSlot: TimetableSlot | null;
  isDetailOpen: boolean;
  hasActiveFilters: boolean;
  currentWeekLabel: string;
  semesterLabel: string;
  isOutsideSemester: boolean;
  vacationReason: string | null;
  minDate?: string;
  maxDate?: string;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: TimetableViewMode) => void;
  resetFilters: () => void;
  openSlotDetail: (slot: TimetableSlot) => void;
  closeSlotDetail: () => void;
  goToToday: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  refetch: () => Promise<void>;
}

const getTodayDateStr = () => dayjs().format("YYYY-MM-DD");

export const useTimetable = (initialDate = getTodayDateStr()): UseTimetableResult => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state from URL params
  const initialFilter: TimetableFilter = useMemo(() => {
    const date = searchParams.get("date") || initialDate;
    const rawView = searchParams.get("view");
    const view: TimetableViewMode = rawView === "list" ? "list" : "grid";

    return {
      selectedDate: date,
      viewMode: view,
    };
  }, [searchParams, initialDate]);

  const [filter, setFilter] = useState<TimetableFilter>(initialFilter);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [meta, setMeta] = useState<TimetableMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Sync state to URL params (only set keys with active data)
  const updateUrlParams = useCallback(
    (newFilter: TimetableFilter) => {
      const params = new URLSearchParams();
      if (newFilter.selectedDate !== getTodayDateStr()) {
        params.set("date", newFilter.selectedDate);
      }
      if (newFilter.viewMode !== "grid") {
        params.set("view", newFilter.viewMode);
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await timetableService.getTimetableSlots(filter);
      setSlots(res.slots);
      setMeta(res.meta ?? null);
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
        const res = await timetableService.getTimetableSlots(filter);
        if (!ignore) {
          setSlots(res.slots);
          setMeta(res.meta ?? null);
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

  const hasActiveFilters = useMemo(() => {
    return filter.selectedDate !== getTodayDateStr();
  }, [filter.selectedDate]);

  // Semester badge info & boundary flags
  const semesterLabel = useMemo(() => {
    return meta?.semester?.name || "";
  }, [meta]);

  const isOutsideSemester = useMemo(() => {
    return Boolean(meta?.selectedWeek?.isOutside);
  }, [meta]);

  const vacationReason = useMemo(() => {
    return meta?.selectedWeek?.vacationReason ?? null;
  }, [meta]);

  const minDate = useMemo(() => {
    return meta?.academicYear?.startDate || undefined;
  }, [meta]);

  const maxDate = useMemo(() => {
    return meta?.academicYear?.endDate || undefined;
  }, [meta]);

  // Week range label for UI
  const currentWeekLabel = useMemo(() => {
    const targetDayjs = dayjs(filter.selectedDate);
    const start = targetDayjs.startOf("isoWeek").format("DD/MM/YYYY");
    const end = targetDayjs.endOf("isoWeek").format("DD/MM/YYYY");
    if (!meta?.semester?.startDate) {
      return `${start} - ${end}`;
    }
    const semStart = dayjs(meta.semester.startDate);
    const weekNum = targetDayjs.diff(semStart, "week") + 1;
    return `${start} - ${end}${weekNum > 0 ? ` (Tuần ${weekNum})` : ""}`;
  }, [filter.selectedDate, meta]);

  // Handlers that update filter state & sync URL
  const setSelectedDate = useCallback(
    (date: string) => {
      setFilter((prev) => {
        const next = { ...prev, selectedDate: date };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const setViewMode = useCallback(
    (mode: TimetableViewMode) => {
      setFilter((prev) => {
        const next = { ...prev, viewMode: mode };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams],
  );

  const resetFilters = useCallback(() => {
    const next: TimetableFilter = {
      selectedDate: getTodayDateStr(),
      viewMode: "grid",
    };
    setFilter(next);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const openSlotDetail = useCallback((slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsDetailOpen(true);
  }, []);

  const closeSlotDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDateStr());
  }, [setSelectedDate]);

  const goToPreviousDay = useCallback(() => {
    setFilter((prev) => {
      const current = dayjs(prev.selectedDate);
      const updated = current.subtract(1, "day");
      const next = { ...prev, selectedDate: updated.format("YYYY-MM-DD") };
      updateUrlParams(next);
      return next;
    });
  }, [updateUrlParams]);

  const goToNextDay = useCallback(() => {
    setFilter((prev) => {
      const current = dayjs(prev.selectedDate);
      const updated = current.add(1, "day");
      const next = { ...prev, selectedDate: updated.format("YYYY-MM-DD") };
      updateUrlParams(next);
      return next;
    });
  }, [updateUrlParams]);

  const goToPreviousWeek = useCallback(() => {
    setFilter((prev) => {
      const current = dayjs(prev.selectedDate);
      const updated = current.subtract(1, "week");
      const next = { ...prev, selectedDate: updated.format("YYYY-MM-DD") };
      updateUrlParams(next);
      return next;
    });
  }, [updateUrlParams]);

  const goToNextWeek = useCallback(() => {
    setFilter((prev) => {
      const current = dayjs(prev.selectedDate);
      const updated = current.add(1, "week");
      const next = { ...prev, selectedDate: updated.format("YYYY-MM-DD") };
      updateUrlParams(next);
      return next;
    });
  }, [updateUrlParams]);

  return {
    slots,
    summary,
    meta,
    filter,
    loading,
    error,
    selectedSlot,
    isDetailOpen,
    hasActiveFilters,
    currentWeekLabel,
    semesterLabel,
    isOutsideSemester,
    vacationReason,
    minDate,
    maxDate,
    setSelectedDate,
    setViewMode,
    resetFilters,
    openSlotDetail,
    closeSlotDetail,
    goToToday,
    goToPreviousWeek,
    goToNextWeek,
    goToPreviousDay,
    goToNextDay,
    refetch: fetchSlots,
  };
};
