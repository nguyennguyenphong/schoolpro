import dayjs from "dayjs";
import type {
  LeaveStatus,
  LeaveType,
  LeaveSessionShift,
} from "@/modules/students/features/leave-requests/types";

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  sick: "Nghỉ ốm / Khám bệnh",
  family_affair: "Việc gia đình",
  bereavement: "Việc hiếu / Tang chế",
  official_competition: "Thi đấu / Công tác trường",
  other: "Lý do khác",
};

export const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  sick: "red",
  family_affair: "blue",
  bereavement: "default",
  official_competition: "purple",
  other: "cyan",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
};

export const SESSION_SHIFT_LABELS: Record<LeaveSessionShift, string> = {
  all_day: "Cả ngày",
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
};

export function formatLeaveDateRange(startDate: string, endDate: string): string {
  if (!startDate) return "";
  const start = dayjs(startDate);
  const end = dayjs(endDate || startDate);
  if (!start.isValid()) return startDate;
  if (!end.isValid() || start.isSame(end, "day")) {
    return start.format("DD/MM/YYYY");
  }
  return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
}

export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : dateStr;
}

export function formatDateTimeDisplay(dateTimeStr?: string | null): string {
  if (!dateTimeStr) return "—";
  const parsed = dayjs(dateTimeStr);
  return parsed.isValid() ? parsed.format("HH:mm - DD/MM/YYYY") : dateTimeStr;
}

