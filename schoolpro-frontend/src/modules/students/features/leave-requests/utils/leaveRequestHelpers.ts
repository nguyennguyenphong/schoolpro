import dayjs from "dayjs";
import i18n from "@/i18n/i18n";
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

export function getLeaveTypeLabel(leaveType?: LeaveType | string | null): string {
  switch (leaveType) {
    case "sick":
      return i18n.t("card:leaveRequests.leaveTypes.sick");
    case "family_affair":
      return i18n.t("card:leaveRequests.leaveTypes.family_affair");
    case "bereavement":
      return i18n.t("card:leaveRequests.leaveTypes.bereavement");
    case "official_competition":
      return i18n.t("card:leaveRequests.leaveTypes.official_competition");
    case "other":
      return i18n.t("card:leaveRequests.leaveTypes.other");
    default:
      return i18n.t("card:leaveRequests.leaveTypes.default");
  }
}

export function getLeaveStatusLabel(status?: LeaveStatus | string | null): string {
  switch (status) {
    case "pending":
      return i18n.t("card:leaveRequests.statuses.pending");
    case "approved":
      return i18n.t("card:leaveRequests.statuses.approved");
    case "rejected":
      return i18n.t("card:leaveRequests.statuses.rejected");
    case "cancelled":
      return i18n.t("card:leaveRequests.statuses.cancelled");
    default:
      return status || "";
  }
}

export function getSessionShiftLabel(shift?: LeaveSessionShift | string | null): string {
  switch (shift) {
    case "morning":
      return i18n.t("card:leaveRequests.shifts.morning");
    case "afternoon":
      return i18n.t("card:leaveRequests.shifts.afternoon");
    case "all_day":
    default:
      return i18n.t("card:leaveRequests.shifts.all_day");
  }
}

export function formatLeaveDateRange(startDate: string, endDate: string): string {
  if (!startDate) return "";
  const start = dayjs(startDate);
  const end = dayjs(endDate || startDate);
  if (!start.isValid()) return startDate;
  const startFmt = start.format("DD/MM/YYYY");
  const endFmt = end.isValid() ? end.format("DD/MM/YYYY") : startFmt;
  return `${startFmt} - ${endFmt}`;
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

