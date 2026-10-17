import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import type {
  TimetableFilter,
} from "@/modules/students/features/timetable/types";

export const getTodayDateStr = (): string => dayjs().format("YYYY-MM-DD");

export interface UseTimetableFilterResult {
  filter: TimetableFilter;
  hasActiveFilters: boolean;
  setSelectedDate: (date: string) => void;
  resetFilters: () => void;
  updateUrlParams: (newFilter: TimetableFilter) => void;
}

export const useTimetableFilter = (initialDate = getTodayDateStr()): UseTimetableFilterResult => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state from URL params
  const initialFilter: TimetableFilter = useMemo(() => {
    const date = searchParams.get("date") || initialDate;

    return {
      selectedDate: date,
    };
  }, [searchParams, initialDate]);

  const [filter, setFilter] = useState<TimetableFilter>(initialFilter);

  // Sync state to URL params (only set keys with active data)
  const updateUrlParams = useCallback(
    (newFilter: TimetableFilter) => {
      const params = new URLSearchParams();
      if (newFilter.selectedDate !== getTodayDateStr()) {
        params.set("date", newFilter.selectedDate);
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

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

  const resetFilters = useCallback(() => {
    const next: TimetableFilter = {
      selectedDate: getTodayDateStr(),
    };
    setFilter(next);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return filter.selectedDate !== getTodayDateStr();
  }, [filter.selectedDate]);

  return {
    filter,
    hasActiveFilters,
    setSelectedDate,
    resetFilters,
    updateUrlParams,
  };
};
