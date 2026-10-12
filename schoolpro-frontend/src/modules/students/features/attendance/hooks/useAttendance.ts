import { message } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAttendanceRealtime } from "@/modules/students/features/attendance/hooks/useAttendanceRealtime";
import { attendanceService } from "@/modules/students/features/attendance/services";
import type {
  AttendanceRecord,
  AttendanceSummary,
  CheckInPayload,
  CheckInResult,
  OpenAttendanceSessionPayload,
} from "@/modules/students/features/attendance/types";
import { computeRemainingSeconds } from "@/modules/students/features/attendance/utils";

export const DEFAULT_DEMO_TODAY = "2026-09-29";

export const useAttendance = (initialDate = DEFAULT_DEMO_TODAY) => {
  const { t } = useTranslation(["message"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  // Read status filter from URL query param (?status=all | open | present | absent)
  const filterStatus = useMemo(() => {
    const rawStatus = searchParams.get("status");
    if (
      rawStatus &&
      ["all", "open", "present", "absent"].includes(rawStatus.toLowerCase())
    ) {
      return rawStatus.toLowerCase();
    }
    return "all";
  }, [searchParams]);

  const setFilterStatus = useCallback(
    (newStatus: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (
          newStatus &&
          ["all", "open", "present", "absent"].includes(newStatus.toLowerCase())
        ) {
          next.set("status", newStatus.toLowerCase());
        } else if (newStatus) {
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
  // and immediately expires in real time when remainingSeconds reaches 0!
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

  // Keep activeRecordForModal synchronized with live `records` (e.g. countdown or teacher code regeneration)
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

  // Teacher opens or updates an attendance session (6-digit PIN + QR + radius + duration)
  const openOrUpdateTeacherSession = useCallback(
    async (
      payload: OpenAttendanceSessionPayload,
    ): Promise<AttendanceRecord | null> => {
      try {
        setSubmitting(true);
        const updated =
          await attendanceService.openOrUpdateTeacherSession(payload);
        message.success(
          t("message:attendance.teacherOpenedSessionSuccess", {
            subject: updated.subjectName,
            pinCode: updated.attendanceCode,
            radius: updated.allowedRadiusMeters,
            defaultValue: `Đã phát mã điểm danh 6 chữ số (${updated.attendanceCode}) & mã QR môn ${updated.subjectName} (Bán kính: ${updated.allowedRadiusMeters}m).`,
          }),
        );
        await refreshSilently(payload.date);
        return updated;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : t("message:attendance.openSessionFailed", {
                defaultValue: "Không thể mở phiên điểm danh.",
              });
        message.error(msg);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshSilently, t],
  );

  // Teacher or timer expires session immediately
  const expireSessionNow = useCallback(
    async (recordId: string): Promise<void> => {
      try {
        setSubmitting(true);
        await attendanceService.expireSessionNow(recordId, selectedDate);
        message.warning(
          t("message:attendance.sessionExpiredSuccess", {
            defaultValue:
              "Đã đóng cổng điểm danh. Mã 6 chữ số và mã QR đã hết hiệu lực sử dụng.",
          }),
        );
        await refreshSilently();
      } finally {
        setSubmitting(false);
      }
    },
    [refreshSilently, selectedDate, t],
  );

  // Filter records by status and searchQuery
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterStatus === "open" && r.status !== "open") return false;
      if (filterStatus === "present" && r.status !== "present") return false;
      if (
        filterStatus === "absent" &&
        r.status !== "absent" &&
        r.status !== "excused"
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay =
          `${r.subjectName} ${r.subjectCode} ${r.teacherName} ${r.room} ${r.period}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, filterStatus, searchQuery]);

  const hasActiveFilters =
    filterStatus !== "all" || Boolean(searchQuery.trim());

  const resetFilters = useCallback(() => {
    setFilterStatus("all");
    setSearchQuery("");
  }, [setFilterStatus]);

  return {
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
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
    openOrUpdateTeacherSession,
    expireSessionNow,
    reload: loadData,
  };
};
