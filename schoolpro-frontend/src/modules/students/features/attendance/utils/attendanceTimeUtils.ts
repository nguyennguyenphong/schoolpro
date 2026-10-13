import dayjs from "dayjs";
import i18n from "@/i18n/i18n";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";
import { computeRemainingSeconds } from "./attendanceGeoUtils";

/**
 * Evaluates real-time attendance status based on date, time window, and timezone:
 * 1. 'present' - Student already attended/checked in successfully
 * 2. 'excused' - Student has an approved leave request
 * 3. 'absent' ('Hết giờ') - Past attendance window (now > endTime on target date, or target date is in the past, or session expired)
 * 4. 'upcoming' ('Chưa đến thời gian điểm danh') - Future attendance window (now < startTime on target date, or target date is in the future)
 * 5. 'open' ('Đang trong thời gian điểm danh') - Within attendance window (startTime <= now <= endTime on target date) and session is active
 */
export function evaluateAttendanceRecordStatus(record: AttendanceRecord): {
  status: AttendanceRecord["status"];
  remainingSeconds: number;
  note: string;
} {
  // If already checked in, preserve present status
  if (record.status === "present") {
    return {
      status: "present",
      remainingSeconds: 0,
      note: record.note || i18n.t("card:attendance.status.present"),
    };
  }

  // If already excused or has an approved leave request
  if (record.status === "excused" || Boolean(record.leaveRequestId)) {
    return {
      status: "excused",
      remainingSeconds: 0,
      note: record.note || i18n.t("card:attendance.status.excused"),
    };
  }

  const now = dayjs();
  const todayStr = now.format("YYYY-MM-DD");
  const targetDateStr = record.date;

  // 1. Past dates -> Always "Hết giờ"
  if (targetDateStr < todayStr) {
    return {
      status: "absent",
      remainingSeconds: 0,
      note: i18n.t("card:attendance.status.absent"),
    };
  }

  // 2. Future dates -> Always "Chưa đến thời gian điểm danh"
  if (targetDateStr > todayStr) {
    return {
      status: "upcoming",
      remainingSeconds: 0,
      note: i18n.t("card:attendance.status.upcoming"),
    };
  }

  // 3. Same day (today): compare against slot startTime and endTime
  const startTimeStr =
    record.startTime ||
    (record.timeSlot ? record.timeSlot.split("-")[0]?.trim() : "");
  const endTimeStr =
    record.endTime ||
    (record.timeSlot ? record.timeSlot.split("-")[1]?.trim() : "");

  const startDayjs = startTimeStr
    ? dayjs(
        `${todayStr}T${startTimeStr.length === 5 ? `${startTimeStr}:00` : startTimeStr}`,
      )
    : null;
  const endDayjs = endTimeStr
    ? dayjs(
        `${todayStr}T${endTimeStr.length === 5 ? `${endTimeStr}:00` : endTimeStr}`,
      )
    : null;

  // Has the period already ended?
  if (endDayjs && (now.isAfter(endDayjs) || now.isSame(endDayjs))) {
    return {
      status: "absent",
      remainingSeconds: 0,
      note: i18n.t("card:attendance.status.absent"),
    };
  }

  // Has the period not started yet?
  if (startDayjs && now.isBefore(startDayjs)) {
    return {
      status: "upcoming",
      remainingSeconds: 0,
      note: i18n.t("card:attendance.status.upcoming"),
    };
  }

  // Currently within the period (startDayjs <= now < endDayjs)!
  // Check if session is open and expiresAt has not passed
  if (record.expiresAt) {
    const remaining = computeRemainingSeconds(
      record.expiresAt,
      record.remainingSeconds ?? 0,
    );
    if (remaining > 0) {
      return {
        status: "open",
        remainingSeconds: remaining,
        note: record.note || i18n.t("card:attendance.status.open"),
      };
    }
    // Expired
    return {
      status: "absent",
      remainingSeconds: 0,
      note: i18n.t("card:attendance.status.absent"),
    };
  }

  if (record.status === "open") {
    return {
      status: "open",
      remainingSeconds: record.remainingSeconds ?? 300,
      note: record.note || i18n.t("card:attendance.status.open"),
    };
  }

  return {
    status: "upcoming",
    remainingSeconds: 0,
    note: i18n.t("card:attendance.status.upcoming"),
  };
}
