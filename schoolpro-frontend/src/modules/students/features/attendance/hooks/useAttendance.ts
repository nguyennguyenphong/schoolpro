import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { message } from "antd";
import type {
  AttendanceRecord,
  AttendanceSummary,
  CheckInPayload,
  CheckInResult,
} from "@/modules/students/features/attendance/types";
import { attendanceService } from "@/modules/students/features/attendance/services";

export const useAttendance = (initialDate = "2026-09-29") => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeRecordForModal, setActiveRecordForModal] =
    useState<AttendanceRecord | null>(null);

  // Đọc trạng thái lọc từ query param `status` trên URL (?status=all | open | present | absent)
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

  // Đẩy trạng thái mới lên URL qua query param `status`
  const setFilterStatus = useCallback(
    (newStatus: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newStatus && ["all", "open", "present", "absent"].includes(newStatus.toLowerCase())) {
          next.set("status", newStatus.toLowerCase());
        } else if (newStatus) {
          next.set("status", newStatus);
        } else {
          next.delete("status");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [listData, summaryData] = await Promise.all([
        attendanceService.getAttendanceByDate(selectedDate),
        attendanceService.getSummary(),
      ]);
      setRecords(listData);
      setSummary(summaryData);
    } catch {
      message.error("Không thể tải danh sách điểm danh.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [listData, summaryData] = await Promise.all([
          attendanceService.getAttendanceByDate(selectedDate),
          attendanceService.getSummary(),
        ]);
        if (!ignore) {
          setRecords(listData);
          setSummary(summaryData);
        }
      } catch {
        if (!ignore) {
          message.error("Không thể tải danh sách điểm danh.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  // Navigate dates
  const goToToday = () => {
    setSelectedDate("2026-09-29");
  };

  const goToPreviousDay = () => {
    const prev = dayjs(selectedDate).subtract(1, "day").format("YYYY-MM-DD");
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
    setSelectedDate(next);
  };

  // Perform check-in
  const performCheckIn = async (payload: CheckInPayload): Promise<CheckInResult> => {
    try {
      setSubmitting(true);
      const res = await attendanceService.submitCheckIn(payload);
      if (res.success) {
        message.success(res.message);
        // Refresh local data
        await loadData();
        // Update active record in modal if needed
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
        message: "Lỗi hệ thống khi gửi điểm danh.",
      };
      message.error(errRes.message);
      return errRes;
    } finally {
      setSubmitting(false);
    }
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "open") return r.status === "open";
    if (filterStatus === "present") return r.status === "present";
    if (filterStatus === "absent") return r.status === "absent";
    return true;
  });

  return {
    selectedDate,
    setSelectedDate,
    records,
    filteredRecords,
    summary,
    loading,
    submitting,
    filterStatus,
    setFilterStatus,
    activeRecordForModal,
    setActiveRecordForModal,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    performCheckIn,
    reload: loadData,
  };
};
