import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  TimetableSlot,
  TimetableFilter,
  TimetableSummary,
  TimetableMeta,
} from "@/modules/students/features/timetable/types";
import { timetableService } from "@/modules/students/features/timetable/services";
import {
  useTimetableFilter,
  getTodayDateStr,
} from "@/modules/students/features/timetable/hooks/useTimetableFilter";
import { useTimetableNavigation } from "@/modules/students/features/timetable/hooks/useTimetableNavigation";

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
  isToday: boolean;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  setSelectedDate: (date: string) => void;
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

export const useTimetable = (initialDate = getTodayDateStr()): UseTimetableResult => {
  const {
    filter,
    hasActiveFilters,
    setSelectedDate,
    resetFilters,
  } = useTimetableFilter(initialDate);

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [meta, setMeta] = useState<TimetableMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const navigation = useTimetableNavigation({
    selectedDate: filter.selectedDate,
    onDateChange: setSelectedDate,
    meta,
  });

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await timetableService.getTimetableSlots(filter);
      setSlots(res.slots);
      setMeta(res.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load timetable"));
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
          setError(err instanceof Error ? err : new Error("Failed to load timetable"));
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

  const openSlotDetail = useCallback((slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsDetailOpen(true);
  }, []);

  const closeSlotDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

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
    currentWeekLabel: navigation.currentWeekLabel,
    semesterLabel: navigation.semesterLabel,
    isOutsideSemester: navigation.isOutsideSemester,
    vacationReason: navigation.vacationReason,
    minDate: navigation.minDate,
    maxDate: navigation.maxDate,
    isToday: navigation.isToday,
    isPrevDisabled: navigation.isPrevDisabled,
    isNextDisabled: navigation.isNextDisabled,
    setSelectedDate,
    resetFilters,
    openSlotDetail,
    closeSlotDetail,
    goToToday: navigation.goToToday,
    goToPreviousWeek: navigation.goToPreviousWeek,
    goToNextWeek: navigation.goToNextWeek,
    goToPreviousDay: navigation.goToPreviousDay,
    goToNextDay: navigation.goToNextDay,
    refetch: fetchSlots,
  };
};
