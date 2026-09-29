import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
  TimetableViewMode,
} from "@/modules/students/features/timetable/types";
import { timetableService } from "@/modules/students/features/timetable/services";

export interface UseTimetableResult {
  slots: TimetableSlot[];
  summary: TimetableSummary;
  filter: TimetableFilter;
  loading: boolean;
  error: Error | null;
  selectedSlot: TimetableSlot | null;
  isDetailOpen: boolean;
  hasActiveFilters: boolean;
  currentWeekLabel: string;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: TimetableViewMode) => void;
  resetFilters: () => void;
  openSlotDetail: (slot: TimetableSlot) => void;
  closeSlotDetail: () => void;
  goToToday: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  refetch: () => Promise<void>;
}

const DEFAULT_DATE = "2026-09-28";

export const useTimetable = (initialDate = DEFAULT_DATE): UseTimetableResult => {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Sync state to URL params (only set keys with active data)
  const updateUrlParams = useCallback(
    (newFilter: TimetableFilter) => {
      const params = new URLSearchParams();
      if (newFilter.selectedDate !== DEFAULT_DATE) {
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

  const hasActiveFilters = useMemo(() => {
    return filter.selectedDate !== DEFAULT_DATE;
  }, [filter.selectedDate]);

  // Week range label for UI
  const currentWeekLabel = useMemo(() => {
    const targetDayjs = dayjs(filter.selectedDate);
    const start = targetDayjs.startOf("isoWeek").format("DD/MM/YYYY");
    const end = targetDayjs.endOf("isoWeek").format("DD/MM/YYYY");
    const weekNum = targetDayjs.diff(dayjs("2026-09-01"), "week") + 1;
    return `${start} - ${end} (Tuần ${Math.max(1, weekNum)})`;
  }, [filter.selectedDate]);

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
      selectedDate: DEFAULT_DATE,
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
    setSelectedDate(DEFAULT_DATE);
  }, [setSelectedDate]);

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
    filter,
    loading,
    error,
    selectedSlot,
    isDetailOpen,
    hasActiveFilters,
    currentWeekLabel,
    setSelectedDate,
    setViewMode,
    resetFilters,
    openSlotDetail,
    closeSlotDetail,
    goToToday,
    goToPreviousWeek,
    goToNextWeek,
    refetch: fetchSlots,
  };
};
