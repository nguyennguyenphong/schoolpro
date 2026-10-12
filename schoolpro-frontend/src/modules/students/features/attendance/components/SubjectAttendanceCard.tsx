import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";
import {
  computeRemainingSeconds,
  formatCountdownMmSs,
} from "@/modules/students/features/attendance/utils";

export interface SubjectAttendanceCardProps {
  record: AttendanceRecord;
  onOpenCheckIn: (record: AttendanceRecord) => void;
  onViewDetail?: (record: AttendanceRecord) => void;
}

/**
 * Student SubjectAttendanceCard:
 * Structured like LeaveRequestCard so Period, TimeSlot, Shift, Room, and Status never wrap awkwardly
 * across any screen size.
 */
export const SubjectAttendanceCard: React.FC<SubjectAttendanceCardProps> = ({
  record,
  onOpenCheckIn,
  onViewDetail,
}) => {
  const { t } = useTranslation(["card", "button", "input"]);

  const isOpen = record.status === "open";
  const isPresent = record.status === "present";
  const isUpcoming = record.status === "upcoming";
  const isAbsent = record.status === "absent";
  const isExcused = record.status === "excused";

  const remainingSec = isOpen
    ? computeRemainingSeconds(record.expiresAt, record.remainingSeconds ?? 300)
    : 0;
  const countdownText = formatCountdownMmSs(remainingSec);

  const leaveRequestHref = record.leaveRequestId
    ? `/student/leave-requests/${record.leaveRequestId}`
    : "/student/leave-requests";

  const getShiftLabel = (shift?: AttendanceRecord["shift"]) => {
    if (shift === "afternoon") {
      return t("input:attendance.shiftAfternoon");
    }
    if (shift === "evening") {
      return t("input:attendance.shiftEvening");
    }
    return t("input:attendance.shiftMorning");
  };

  const getStatusTag = () => {
    if (isOpen) {
      return (
        <Tag
          color="processing"
          className="m-0 text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0"
        >
          {t("card:attendance.status.open")}
        </Tag>
      );
    }
    if (isPresent) {
      return (
        <Tag
          color="success"
          className="m-0 text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0"
        >
          {t("card:attendance.status.present")}
        </Tag>
      );
    }
    if (isExcused) {
      return (
        <Tag
          color="cyan"
          className="m-0 text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0"
        >
          {t("card:attendance.status.excused")}
        </Tag>
      );
    }
    if (isAbsent) {
      return (
        <Tag
          color="error"
          className="m-0 text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0"
        >
          {t("card:attendance.status.absent")}
        </Tag>
      );
    }
    return (
      <Tag
        color="default"
        className="m-0 text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0"
      >
        {t("card:attendance.status.upcoming")}
      </Tag>
    );
  };

  return (
    <div
      className="w-full h-full bg-white border rounded-xl p-4 flex flex-col justify-between gap-3.5 shadow-2xs transition-all border-[#f0f0f0]"
    >
      <div className="space-y-3">
        {/* 1. Period Badge & Status Tag (Never wraps) */}
        <div className="flex items-center justify-between gap-2">
          <Tag
            color="blue"
            className="m-0 text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0"
          >
            {record.period}
          </Tag>
          {getStatusTag()}
        </div>

        {/* 2. TimeSlot & Shift Box (Matching LeaveRequestCard layout) */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon name="clock" size={14} className="text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
              {record.timeSlot}
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 whitespace-nowrap shrink-0">
            {getShiftLabel(record.shift)}
          </span>
        </div>

        {/* 3. Subject Name */}
        <h3
          className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-0 min-h-10"
          title={record.subjectName}
        >
          {record.subjectName}
        </h3>

        {/* 4. Room & Teacher */}
        <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Icon name="map-pin" size={13} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">{record.room}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Icon name="user" size={13} className="text-slate-400 shrink-0" />
            <span className="truncate" title={record.teacherName}>
              {record.teacherName}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Footer: Concise Status Info & Student Action / Leave Request Link */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xs min-w-0 whitespace-nowrap">
          {isOpen ? (
            <span
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                remainingSec <= 60
                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <Icon name="clock" size={12} />
              <span>{countdownText}</span>
            </span>
          ) : isPresent ? (
            <span className="text-emerald-700 font-semibold whitespace-nowrap">
              {record.checkInTime
                ? t("card:attendance.card.checkedInAt", {
                    time: record.checkInTime.slice(0, 5),
                  })
                : t("card:attendance.status.present")}
            </span>
          ) : isExcused ? (
            <span className="text-cyan-700 font-semibold truncate block">
              {record.leaveRequestCode
                ? `#${record.leaveRequestCode}`
                : t("card:attendance.status.excused")}
            </span>
          ) : isUpcoming ? (
            <span className="text-slate-500 whitespace-nowrap">
              {record.startTime
                ? t("card:attendance.card.openAtTime", {
                    time: record.startTime,
                  })
                : t("card:attendance.status.upcoming")}
            </span>
          ) : (
            <span className="text-rose-600 font-medium whitespace-nowrap">
              {t("card:attendance.card.expiredShort")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          {isOpen ? (
            <Button
              variant="primary"
              onClick={() => onOpenCheckIn(record)}
              className="font-bold text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Icon name="scan" size={14} />
              <span>{t("button:checkInNow")}</span>
            </Button>
          ) : isExcused || record.leaveRequestId ? (
            <Button
              variant="ghost"
              href={leaveRequestHref}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 h-7 whitespace-nowrap"
            >
              <Icon name="file-text" size={13} />
              <span>{t("button:viewLeaveRequest")}</span>
              <Icon name="chevron-right" size={13} />
            </Button>
          ) : isPresent && onViewDetail ? (
            <Button
              variant="ghost"
              onClick={() => onViewDetail(record)}
            >
              <span>{t("button:viewDetail")}</span>
              <Icon name="chevron-right" size={13} />
            </Button>
          ) : isUpcoming ? (
            <Button
              variant="ghost"
              href="/student/leave-requests/create"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1 h-7 whitespace-nowrap"
            >
              <Icon name="file-text" size={13} />
              <span>{t("button:requestLeave")}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
