import { message } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAttendanceRealtime } from "@/modules/students/features/attendance/hooks/useAttendanceRealtime";
import { attendanceService } from "@/modules/students/features/attendance/services";
import type {
  AttendanceClassTypeFilter,
  AttendanceFilter,
  AttendanceRecord,
  AttendanceShiftFilter,
  AttendanceSortOption,
  AttendanceStatusFilter,
  AttendanceSummary,
  AttendanceViewMode,
  CheckInPayload,
  CheckInResult,
} from "@/modules/students/features/attendance/types";
import { computeRemainingSeconds } from "@/modules/students/features/attendance/utils";

export const DEFAULT_DEMO_TODAY = "2026-09-29";

const STATUS_PRIORITY_ORDER: Record<string, number> = {
  open: 0,
  upcoming: 1,
  present: 2,
  excused: 3,
  absent: 4,
};

export const useAttendance = (initialDate = DEFAULT_DEMO_TODAY) => {
  const { t } = useTranslation(["message"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [shift, setShift] = useState<AttendanceShiftFilter>("all");
  const [classType, setClassType] = useState<AttendanceClassTypeFilter>("all");
  const [sortBy, setSortBy] = useState<AttendanceSortOption>("period_asc");
  const [viewMode, setViewMode] = useState<AttendanceViewMode>("grid");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeRecordForModal, setActiveRecordForModal] =
    useState<AttendanceRecord | null>(null);

  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Read status filter from URL query param (?status=all | open | present | upcoming | absent)
  const filterStatus = useMemo<AttendanceStatusFilter>(() => {
    const rawStatus = searchParams.get("status")?.toLowerCase();
    if (
      rawStatus === "all" ||
      rawStatus === "open" ||
      rawStatus === "present" ||
      rawStatus === "upcoming" ||
      rawStatus === "absent"
    ) {
      return rawStatus;
    }
    return "all";
  }, [searchParams]);

  const setFilterStatus = useCallback(
    (newStatus: AttendanceStatusFilter) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newStatus && newStatus !== "all") {
          next.set("status", newStatus);
        } else {
          next.delete("status");
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const refreshSilently = useCallback(async (targetDate?: string) => {
    const dateToFetch = targetDate || selectedDateRef.current;
    try {
      const { records: dayRecords, summary: daySummary } =
        await attendanceService.getDailyAttendance(dateToFetch);
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
        await attendanceService.getDailyAttendance(selectedDate);
      setRecords(dayRecords);
      setSummary(daySummary);
    } catch {
      message.error(
        t("message:attendance.loadFailed", {
          defaultValue: "Không thể tải danh sách điểm danh.",
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, t]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setLoading(true);
        const { records: dayRecords, summary: daySummary } =
          await attendanceService.getDailyAttendance(selectedDate);
        if (!ignore) {
          setRecords(dayRecords);
          setSummary(daySummary);
        }
      } catch {
        if (!ignore) {
          message.error(
            t("message:attendance.loadFailed", {
              defaultValue: "Không thể tải danh sách điểm danh.",
            }),
          );
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
  }, [selectedDate, t]);

  // 1-second live countdown ticker for any OPEN session so UI counts down smoothly
  // and immediately expires in real time when remainingSeconds reaches 0
  useEffect(() => {
    const hasOpenWithExpiry = records.some(
      (r) => r.status === "open" && Boolean(r.expiresAt),
    );
    if (!hasOpenWithExpiry) return;

    const timer = setInterval(() => {
      let anyJustExpired = false;

      setRecords((prev) =>
        prev.map((rec) => {
          if (rec.status !== "open" || !rec.expiresAt) return rec;
          const rem = computeRemainingSeconds(rec.expiresAt, 0);
          if (rem <= 0) {
            anyJustExpired = true;
            const deadlineStr =
              rec.deadlineTime ||
              new Date(rec.expiresAt).toTimeString().slice(0, 8);
            return {
              ...rec,
              status: "absent",
              remainingSeconds: 0,
              note: t("message:attendance.sessionExpiredNote", {
                time: deadlineStr,
                defaultValue: `Mã điểm danh đã hết hạn lúc ${deadlineStr}. Cổng điểm danh đã đóng.`,
              }),
            };
          }
          return {
            ...rec,
            remainingSeconds: rem,
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

  // Keep activeRecordForModal synchronized with live `records`
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

  // Navigate dates
  const goToToday = useCallback(() => {
    setSelectedDate(DEFAULT_DEMO_TODAY);
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) =>
      dayjs(prev).subtract(1, "day").format("YYYY-MM-DD"),
    );
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => dayjs(prev).add(1, "day").format("YYYY-MM-DD"));
  }, []);

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
          message: t("message:attendance.systemCheckInError", {
            defaultValue: "Lỗi hệ thống khi gửi dữ liệu điểm danh.",
          }),
        };
        message.error(errRes.message);
        return errRes;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshSilently, t],
  );

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    const filtered = records.filter((r) => {
      if (filterStatus === "open" && r.status !== "open") return false;
      if (filterStatus === "present" && r.status !== "present") return false;
      if (filterStatus === "upcoming" && r.status !== "upcoming") return false;
      if (
        filterStatus === "absent" &&
        r.status !== "absent" &&
        r.status !== "excused"
      ) {
        return false;
      }

      if (shift !== "all" && r.shift && r.shift !== shift) {
        return false;
      }

      if (classType !== "all" && r.classType && r.classType !== classType) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay =
          `${r.subjectName} ${r.subjectCode} ${r.teacherName} ${r.room} ${r.building || ""} ${r.period} ${r.lessonTopic || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "period_desc") {
        return (b.periodNumber ?? 0) - (a.periodNumber ?? 0);
      }
      if (sortBy === "status_priority") {
        const prioA = STATUS_PRIORITY_ORDER[a.status] ?? 99;
        const prioB = STATUS_PRIORITY_ORDER[b.status] ?? 99;
        if (prioA !== prioB) return prioA - prioB;
      }
      return (a.periodNumber ?? 0) - (b.periodNumber ?? 0);
    });
  }, [records, filterStatus, shift, classType, searchQuery, sortBy]);

  const filter: AttendanceFilter = useMemo(
    () => ({
      selectedDate,
      searchQuery,
      status: filterStatus,
      shift,
      classType,
      sortBy,
      viewMode,
    }),
    [
      selectedDate,
      searchQuery,
      filterStatus,
      shift,
      classType,
      sortBy,
      viewMode,
    ],
  );

  const hasActiveFilters = Boolean(
    filterStatus !== "all" ||
      searchQuery.trim() ||
      shift !== "all" ||
      classType !== "all" ||
      sortBy !== "period_asc" ||
      selectedDate !== DEFAULT_DEMO_TODAY,
  );

  const resetFilters = useCallback(() => {
    setFilterStatus("all");
    setSearchQuery("");
    setShift("all");
    setClassType("all");
    setSortBy("period_asc");
    setSelectedDate(DEFAULT_DEMO_TODAY);
  }, [setFilterStatus]);

  return {
    filter,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    shift,
    setShift,
    classType,
    setClassType,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    records,
    filteredRecords,
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
