import { message } from "@/components/ui/Message";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAttendanceRealtime } from "@/modules/students/features/attendance/hooks/useAttendanceRealtime";
import { attendanceService } from "@/modules/students/features/attendance/services";
import type {
  AttendanceFilter,
  AttendanceRecord,
  AttendanceShiftFilter,
  AttendanceStatusFilter,
  AttendanceSummary,
  AttendanceViewMode,
  CheckInPayload,
  CheckInResult,
} from "@/modules/students/features/attendance/types";
import {
  evaluateAttendanceRecordStatus,
} from "@/modules/students/features/attendance/utils";

const getTodayDateStr = (): string => dayjs().format("YYYY-MM-DD");
export const DEFAULT_DEMO_TODAY = getTodayDateStr();

export const useAttendance = (initialDate = getTodayDateStr()) => {
  const { t } = useTranslation(["message"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeRecordForModal, setActiveRecordForModal] =
    useState<AttendanceRecord | null>(null);

  // 1. Read filter state from URL query params (?date=...&shift=...&status=...&q=...&view=...)
  const selectedDate = useMemo<string>(() => {
    const rawDate = searchParams.get("date")?.trim();
    if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return rawDate;
    }
    return initialDate;
  }, [searchParams, initialDate]);

  const shift = useMemo<AttendanceShiftFilter>(() => {
    const rawShift = searchParams.get("shift")?.toLowerCase();
    if (
      rawShift === "morning" ||
      rawShift === "afternoon" ||
      rawShift === "evening"
    ) {
      return rawShift;
    }
    return "all";
  }, [searchParams]);

  const filterStatus = useMemo<AttendanceStatusFilter>(() => {
    const rawStatus = searchParams.get("status")?.toLowerCase();
    if (
      rawStatus === "all" ||
      rawStatus === "open" ||
      rawStatus === "present" ||
      rawStatus === "upcoming" ||
      rawStatus === "excused" ||
      rawStatus === "absent"
    ) {
      return rawStatus;
    }
    return "all";
  }, [searchParams]);

  const searchQuery = useMemo<string>(() => {
    return searchParams.get("q") || searchParams.get("search") || "";
  }, [searchParams]);

  const viewMode = useMemo<AttendanceViewMode>(() => {
    return searchParams.get("view") === "list" ? "list" : "grid";
  }, [searchParams]);

  // 2. Sync URL query parameters when any filter changes
  const updateUrlParams = useCallback(
    (patch: Partial<AttendanceFilter>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const todayStr = getTodayDateStr();

          const nextDate = patch.selectedDate ?? selectedDate;
          if (nextDate && nextDate !== todayStr) {
            next.set("date", nextDate);
          } else {
            next.delete("date");
          }

          const nextShift = patch.shift ?? shift;
          if (nextShift && nextShift !== "all") {
            next.set("shift", nextShift);
          } else {
            next.delete("shift");
          }

          const nextStatus = patch.status ?? filterStatus;
          if (nextStatus && nextStatus !== "all") {
            next.set("status", nextStatus);
          } else {
            next.delete("status");
          }

          const nextSearch =
            patch.searchQuery !== undefined ? patch.searchQuery : searchQuery;
          next.delete("search");
          if (nextSearch.trim()) {
            next.set("q", nextSearch.trim());
          } else {
            next.delete("q");
          }

          const nextView = patch.viewMode ?? viewMode;
          if (nextView === "list") {
            next.set("view", "list");
          } else {
            next.delete("view");
          }

          return next;
        },
        { replace: true },
      );
    },
    [selectedDate, shift, filterStatus, searchQuery, viewMode, setSearchParams],
  );

  const setSelectedDate = useCallback(
    (dateStr: string) => {
      updateUrlParams({ selectedDate: dateStr });
    },
    [updateUrlParams],
  );

  const setShift = useCallback(
    (newShift: AttendanceShiftFilter) => {
      updateUrlParams({ shift: newShift });
    },
    [updateUrlParams],
  );

  const setFilterStatus = useCallback(
    (newStatus: AttendanceStatusFilter) => {
      updateUrlParams({ status: newStatus });
    },
    [updateUrlParams],
  );

  const setSearchQuery = useCallback(
    (newQuery: string) => {
      updateUrlParams({ searchQuery: newQuery });
    },
    [updateUrlParams],
  );

  const setViewMode = useCallback(
    (newMode: AttendanceViewMode) => {
      updateUrlParams({ viewMode: newMode });
    },
    [updateUrlParams],
  );

  const queryRef = useRef({
    date: selectedDate,
    shift,
    status: filterStatus,
    search: searchQuery,
  });
  useEffect(() => {
    queryRef.current = {
      date: selectedDate,
      shift,
      status: filterStatus,
      search: searchQuery,
    };
  }, [selectedDate, shift, filterStatus, searchQuery]);

  // 3. Pass URL parameters directly to the API to fetch data
  const refreshSilently = useCallback(async () => {
    try {
      const { records: dayRecords, summary: daySummary } =
        await attendanceService.getDailyAttendance(queryRef.current);
      setRecords(dayRecords);
      setSummary(daySummary);
      setActiveRecordForModal((prev) => {
        if (!prev) return null;
        return (
          dayRecords.find(
            (r) =>
              r.id === prev.id ||
              (prev.timetableId && r.timetableId === prev.timetableId),
          ) || prev
        );
      });
    } catch {
      // Ignore silent refresh errors
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { records: dayRecords, summary: daySummary } =
        await attendanceService.getDailyAttendance({
          date: selectedDate,
          shift,
          status: filterStatus,
          search: searchQuery,
        });
      setRecords(dayRecords);
      setSummary(daySummary);
    } catch {
      message.error(t("message:attendance.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, shift, filterStatus, searchQuery, t]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setLoading(true);
        const { records: dayRecords, summary: daySummary } =
          await attendanceService.getDailyAttendance({
            date: selectedDate,
            shift,
            status: filterStatus,
            search: searchQuery,
          });
        if (!ignore) {
          setRecords(dayRecords);
          setSummary(daySummary);
        }
      } catch {
        if (!ignore) {
          message.error(t("message:attendance.loadFailed"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchData();
    return () => {
      ignore = true;
    };
  }, [selectedDate, shift, filterStatus, searchQuery, t]);

  // 1-second live countdown ticker for any OPEN session
  useEffect(() => {
    const hasOpenWithExpiry = records.some(
      (r) => r.status === "open" && Boolean(r.expiresAt),
    );
    if (!hasOpenWithExpiry) return;

    const timer = setInterval(() => {
      let anyJustExpired = false;

      setRecords((prev) =>
        prev.map((rec) => {
          if (rec.status !== "open") return rec;
          const evaluated = evaluateAttendanceRecordStatus(rec);
          if (evaluated.status !== "open") {
            anyJustExpired = true;
            return {
              ...rec,
              status: evaluated.status,
              remainingSeconds: 0,
              note: evaluated.note || rec.note,
            };
          }
          return {
            ...rec,
            remainingSeconds: evaluated.remainingSeconds,
          };
        }),
      );

      if (anyJustExpired) {
        attendanceService.syncLocalExpirations();
        void refreshSilently();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [records, refreshSilently, t]);

  const resolvedActiveRecordForModal = useMemo(() => {
    if (!activeRecordForModal) return null;
    return (
      records.find(
        (r) =>
          r.id === activeRecordForModal.id ||
          (activeRecordForModal.timetableId &&
            r.timetableId === activeRecordForModal.timetableId),
      ) || activeRecordForModal
    );
  }, [activeRecordForModal, records]);

  // Real-time WebSocket + BroadcastChannel + Delta Sync
  const { isConnected: isRealtimeConnected, lastSyncedAt } =
    useAttendanceRealtime({
      date: selectedDate,
      enabled: true,
      onEvent: () => {
        void refreshSilently();
      },
      onSyncChange: () => {
        void refreshSilently();
      },
    });

  // Navigate dates via URL params
  const goToToday = useCallback(() => {
    updateUrlParams({ selectedDate: getTodayDateStr() });
  }, [updateUrlParams]);

  const goToPreviousDay = useCallback(() => {
    const prevDate = dayjs(selectedDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    updateUrlParams({ selectedDate: prevDate });
  }, [selectedDate, updateUrlParams]);

  const goToNextDay = useCallback(() => {
    const nextDate = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
    updateUrlParams({ selectedDate: nextDate });
  }, [selectedDate, updateUrlParams]);

  // Perform student check-in
  const performCheckIn = useCallback(
    async (payload: CheckInPayload): Promise<CheckInResult> => {
      try {
        setSubmitting(true);
        const res = await attendanceService.submitCheckIn(payload);
        if (res.success) {
          message.success(res.message);
          await refreshSilently();
          if (res.record) {
            setActiveRecordForModal(res.record);
          }
        } else {
          message.error(res.message);
        }
        return res;
      } catch {
        const errRes: CheckInResult = {
          success: false,
          message: t("message:attendance.systemCheckInError"),
        };
        message.error(errRes.message);
        return errRes;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshSilently, t],
  );

  const filter: AttendanceFilter = useMemo(
    () => ({
      selectedDate,
      shift,
      status: filterStatus,
      searchQuery,
      viewMode,
    }),
    [selectedDate, shift, filterStatus, searchQuery, viewMode],
  );

  const hasActiveFilters = Boolean(
    filterStatus !== "all" ||
      shift !== "all" ||
      searchQuery.trim() ||
      selectedDate !== getTodayDateStr(),
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        if (prev.get("view") === "list") {
          next.set("view", "list");
        }
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return {
    filter,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    shift,
    setShift,
    viewMode,
    setViewMode,
    records,
    summary,
    loading,
    submitting,
    filterStatus,
    setFilterStatus,
    hasActiveFilters,
    resetFilters,
    activeRecordForModal: resolvedActiveRecordForModal,
    setActiveRecordForModal,
    isRealtimeConnected,
    lastSyncedAt,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    performCheckIn,
    reload: loadData,
  };
};
