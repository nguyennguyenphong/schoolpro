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

export interface AttendanceListViewProps {
  records: AttendanceRecord[];
  onOpenCheckIn: (record: AttendanceRecord) => void;
  onViewDetail: (record: AttendanceRecord) => void;
}

/**
 * Clean Student Attendance ListView with non-wrapping Period/Time badges and direct Leave Request links.
 */
export const AttendanceListView: React.FC<AttendanceListViewProps> = ({
  records,
  onOpenCheckIn,
  onViewDetail,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "open":
        return (
          <Tag color="processing" className="m-0 whitespace-nowrap shrink-0">
            {t("card:attendance.status.open")}
          </Tag>
        );
      case "present":
        return (
          <Tag color="success" className="m-0 whitespace-nowrap shrink-0">
            {t("card:attendance.status.present")}
          </Tag>
        );
      case "excused":
        return (
          <Tag color="cyan" className="m-0 whitespace-nowrap shrink-0">
            {t("card:attendance.status.excused")}
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" className="m-0 whitespace-nowrap shrink-0">
            {t("card:attendance.status.absent")}
          </Tag>
        );
      case "upcoming":
      default:
        return (
          <Tag color="default" className="m-0 whitespace-nowrap shrink-0">
            {t("card:attendance.status.upcoming")}
          </Tag>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Mobile View: Clean Non-Wrapping Cards */}
      <div className="block md:hidden space-y-3">
        {records.map((rec) => {
          const isOpen = rec.status === "open";
          const isPresent = rec.status === "present";
          const isExcused = rec.status === "excused";
          const isUpcoming = rec.status === "upcoming";
          const remainingSec = isOpen
            ? computeRemainingSeconds(
                rec.expiresAt,
                rec.remainingSeconds ?? 300,
              )
            : 0;
          const leaveHref = rec.leaveRequestId
            ? `/student/leave-requests/${rec.leaveRequestId}`
            : "/student/leave-requests";

          return (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold whitespace-nowrap">
                  <Tag
                    color="blue"
                    className="m-0 text-[11px] font-bold px-2 py-0 whitespace-nowrap shrink-0"
                  >
                    {rec.period}
                  </Tag>
                  <span className="text-slate-500 whitespace-nowrap">
                    {rec.timeSlot}
                  </span>
                </div>
                {getStatusBadge(rec.status)}
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-0">
                {rec.subjectName}
              </h4>

              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <Icon
                    name="map-pin"
                    size={13}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="font-semibold text-slate-700">
                    {rec.room}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon
                    name="user"
                    size={13}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="truncate">{rec.teacherName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {isOpen
                    ? formatCountdownMmSs(remainingSec)
                    : isPresent && rec.checkInTime
                      ? rec.checkInTime.slice(0, 5)
                      : isExcused && rec.leaveRequestCode
                        ? `#${rec.leaveRequestCode}`
                        : "—"}
                </span>

                {isOpen ? (
                  <Button
                    variant="primary"
                    onClick={() => onOpenCheckIn(rec)}
                    className="text-xs font-bold whitespace-nowrap shrink-0"
                  >
                    <Icon name="scan" size={13} />
                    <span>{t("button:checkInNow")}</span>
                  </Button>
                ) : isExcused || rec.leaveRequestId ? (
                  <Button
                    variant="ghost"
                    href={leaveHref}
                    className="text-xs font-semibold text-blue-600 whitespace-nowrap shrink-0"
                  >
                    <span>{t("button:viewLeaveRequest")}</span>
                    <Icon name="chevron-right" size={13} />
                  </Button>
                ) : isPresent ? (
                  <Button
                    variant="ghost"
                    onClick={() => onViewDetail(rec)}
                    className="text-xs font-semibold text-blue-600 whitespace-nowrap shrink-0"
                  >
                    <span>{t("button:viewDetail")}</span>
                    <Icon name="chevron-right" size={13} />
                  </Button>
                ) : isUpcoming ? (
                  <Button
                    variant="ghost"
                    href="/student/leave-requests/create"
                    className="text-xs font-semibold text-slate-600 whitespace-nowrap shrink-0"
                  >
                    <span>{t("button:requestLeave")}</span>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop View: Clean Student Table */}
      <div className="hidden md:block bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#f0f0f0] text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">
                  {t("card:timetable.tableHeaders.timePeriods")}
                </th>
                <th className="py-3 px-4 whitespace-nowrap">
                  {t("card:timetable.tableHeaders.courseName")}
                </th>
                <th className="py-3 px-4 whitespace-nowrap">
                  {t("card:timetable.tableHeaders.room")}
                </th>
                <th className="py-3 px-4 whitespace-nowrap">
                  {t("card:timetable.tableHeaders.teacher")}
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  {t("card:timetable.tableHeaders.status")}
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  {t("card:attendance.tableHeaders.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => {
                const isOpen = rec.status === "open";
                const isPresent = rec.status === "present";
                const isExcused = rec.status === "excused";
                const isUpcoming = rec.status === "upcoming";
                const remainingSec = isOpen
                  ? computeRemainingSeconds(
                      rec.expiresAt,
                      rec.remainingSeconds ?? 300,
                    )
                  : 0;
                const leaveHref = rec.leaveRequestId
                  ? `/student/leave-requests/${rec.leaveRequestId}`
                  : "/student/leave-requests";

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* 1. Time & Period */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Tag
                        color="blue"
                        className="m-0 text-[11px] font-bold px-2 py-0 whitespace-nowrap"
                      >
                        {rec.period}
                      </Tag>
                      <span className="text-slate-500 ml-2 whitespace-nowrap">
                        {rec.timeSlot}
                      </span>
                    </td>

                    {/* 2. Subject Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">
                        {rec.subjectName}
                      </span>
                    </td>

                    {/* 3. Room */}
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold">{rec.room}</span>
                      {rec.building && (
                        <span className="text-slate-400">
                          {" "}
                          | {rec.building}
                        </span>
                      )}
                    </td>

                    {/* 4. Teacher */}
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {rec.teacherName}
                    </td>

                    {/* 5. Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {getStatusBadge(rec.status)}
                        {isOpen && (
                          <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap">
                            {formatCountdownMmSs(remainingSec)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isOpen ? (
                        <Button
                          variant="primary"
                          onClick={() => onOpenCheckIn(rec)}
                          className="text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <Icon name="scan" size={13} />
                          <span>{t("button:checkInNow")}</span>
                        </Button>
                      ) : isExcused || rec.leaveRequestId ? (
                        <Button
                          variant="ghost"
                          href={leaveHref}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <Icon name="file-text" size={13} />
                          <span>{t("button:viewLeaveRequest")}</span>
                          <Icon name="chevron-right" size={12} />
                        </Button>
                      ) : isPresent ? (
                        <Button
                          variant="ghost"
                          onClick={() => onViewDetail(rec)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <span>{t("button:viewDetail")}</span>
                          <Icon name="chevron-right" size={12} />
                        </Button>
                      ) : isUpcoming ? (
                        <Button
                          variant="ghost"
                          href="/student/leave-requests/create"
                          className="text-slate-600 hover:text-blue-600 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <Icon name="file-text" size={13} />
                          <span>{t("button:requestLeave")}</span>
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
