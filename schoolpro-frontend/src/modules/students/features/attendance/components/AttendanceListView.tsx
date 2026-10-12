import dayjs from "dayjs";
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
 * Student Attendance ListView modeled directly after Timetable's ListView.tsx:
 * - Responsive mobile cards on small screens
 * - Structured horizontal-scroll table on desktop
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
          <Tag color="processing">
            {t("card:attendance.status.open", {
              defaultValue: "Đang mở điểm danh",
            })}
          </Tag>
        );
      case "present":
        return (
          <Tag color="success">
            {t("card:attendance.status.present", {
              defaultValue: "Đã điểm danh",
            })}
          </Tag>
        );
      case "excused":
        return (
          <Tag color="cyan">
            {t("card:attendance.status.excused", {
              defaultValue: "Nghỉ có phép",
            })}
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error">
            {t("card:attendance.status.absent", {
              defaultValue: "Vắng / Hết hạn mã",
            })}
          </Tag>
        );
      case "upcoming":
      default:
        return (
          <Tag color="default">
            {t("card:attendance.status.upcoming", {
              defaultValue: "Chưa mở cổng",
            })}
          </Tag>
        );
    }
  };

  const getDayLabel = (d: dayjs.Dayjs) => {
    const day = d.day();
    switch (day) {
      case 1:
        return t("card:timetable.days.mon", { defaultValue: "Thứ 2" });
      case 2:
        return t("card:timetable.days.tue", { defaultValue: "Thứ 3" });
      case 3:
        return t("card:timetable.days.wed", { defaultValue: "Thứ 4" });
      case 4:
        return t("card:timetable.days.thu", { defaultValue: "Thứ 5" });
      case 5:
        return t("card:timetable.days.fri", { defaultValue: "Thứ 6" });
      case 6:
        return t("card:timetable.days.sat", { defaultValue: "Thứ 7" });
      default:
        return t("card:timetable.days.sun", { defaultValue: "Chủ nhật" });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Mobile & Small Tablet View: List Cards (matching Timetable ListView) */}
      <div className="block md:hidden space-y-3">
        {records.map((rec) => {
          const recDate = dayjs(rec.date);
          const formattedDate = recDate.format("DD/MM/YYYY");
          const dayName = getDayLabel(recDate);
          const isPractice = rec.classType === "practice";
          const isOpen = rec.status === "open";
          const isPresent = rec.status === "present";
          const remainingSec = isOpen
            ? computeRemainingSeconds(
                rec.expiresAt,
                rec.remainingSeconds ?? 300,
              )
            : 0;

          return (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 transition-all hover:border-slate-300"
            >
              {/* Card Header: Date & Status */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Icon
                    name="calendar"
                    size={13}
                    className="text-blue-600 shrink-0"
                  />
                  <span className="font-bold text-slate-900">
                    {formattedDate}
                  </span>
                  <span className="text-slate-500">({dayName})</span>
                </div>
                {getStatusBadge(rec.status)}
              </div>

              {/* Subject & Class */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-500">
                  {rec.subjectCode} •{" "}
                  {t("card:timetable.classLabel", {
                    classCode: rec.className || rec.subjectCode,
                    defaultValue: `Lớp ${rec.className || rec.subjectCode}`,
                  })}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-0">
                  {rec.subjectName}
                </h4>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="clock"
                    size={13}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="font-medium text-slate-800">
                    {rec.timeSlot}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({rec.period})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="map-pin"
                    size={13}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="truncate" title={rec.room}>
                    {rec.room}
                    {rec.building ? ` • ${rec.building}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="user"
                    size={13}
                    className="text-slate-400 shrink-0"
                  />
                  <span className="truncate" title={rec.teacherName}>
                    {rec.teacherName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag
                    color={isPractice ? "green" : "blue"}
                    className="text-[10px] px-1.5 py-0.5 m-0 font-semibold"
                  >
                    {isPractice
                      ? t("card:timetable.classTypes.practice", {
                          defaultValue: "Thực hành",
                        })
                      : t("card:timetable.classTypes.theory", {
                          defaultValue: "Lý thuyết",
                        })}
                  </Tag>
                  <Tag
                    color="cyan"
                    className="text-[10px] px-1.5 py-0.5 m-0 font-semibold"
                  >
                    ≤ {rec.allowedRadiusMeters}m
                  </Tag>
                </div>
              </div>

              {/* Action Row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {isOpen
                    ? t("card:attendance.card.expiresInLabel", {
                        time: formatCountdownMmSs(remainingSec),
                        defaultValue: `Hết hạn sau: ${formatCountdownMmSs(remainingSec)}`,
                      })
                    : isPresent && rec.checkInTime
                      ? `${rec.checkInTime} (${rec.distanceMeters?.toFixed(1) ?? 0}m)`
                      : rec.deadlineTime || "—"}
                </span>

                {isOpen ? (
                  <Button
                    variant="primary"
                    onClick={() => onOpenCheckIn(rec)}
                    className="text-xs font-bold"
                  >
                    <Icon name="scan" size={13} />
                    <span>
                      {t("button:checkInNow", {
                        defaultValue: "Điểm danh ngay",
                      })}
                    </span>
                  </Button>
                ) : isPresent ? (
                  <Button
                    variant="outline"
                    onClick={() => onViewDetail(rec)}
                    className="text-xs font-semibold"
                  >
                    <Icon name="eye" size={13} />
                    <span>
                      {t("button:viewProof", {
                        defaultValue: "Xem minh chứng GPS",
                      })}
                    </span>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop & Tablet Large View: Table with Horizontal Scroll (matching Timetable ListView) */}
      <div className="hidden md:block bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-300">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#f0f0f0] text-slate-500 font-semibold uppercase text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.date", {
                    defaultValue: "Ngày học",
                  })}
                </th>
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.timePeriods", {
                    defaultValue: "Thời gian / Tiết",
                  })}
                </th>
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.courseCode", {
                    defaultValue: "Mã môn",
                  })}
                </th>
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.courseName", {
                    defaultValue: "Tên môn học",
                  })}
                </th>
                <th className="py-3 px-4 text-center">
                  {t("card:timetable.tableHeaders.classType", {
                    defaultValue: "Hình thức",
                  })}
                </th>
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.room", {
                    defaultValue: "Phòng học",
                  })}
                </th>
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.teacher", {
                    defaultValue: "Giáo viên",
                  })}
                </th>
                <th className="py-3 px-4 text-center">
                  {t("card:attendance.tableHeaders.radiusAndTimer", {
                    defaultValue: "Bán kính & Thời hạn",
                  })}
                </th>
                <th className="py-3 px-4">
                  {t("card:timetable.tableHeaders.notes", {
                    defaultValue: "Ghi chú",
                  })}
                </th>
                <th className="py-3 px-4 text-center">
                  {t("card:timetable.tableHeaders.status", {
                    defaultValue: "Trạng thái",
                  })}
                </th>
                <th className="py-3 px-4 text-center">
                  {t("card:attendance.tableHeaders.action", {
                    defaultValue: "Thao tác",
                  })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => {
                const recDate = dayjs(rec.date);
                const formattedDate = recDate.format("DD/MM/YYYY");
                const dayName = getDayLabel(recDate);
                const isPractice = rec.classType === "practice";
                const isOpen = rec.status === "open";
                const isPresent = rec.status === "present";
                const remainingSec = isOpen
                  ? computeRemainingSeconds(
                      rec.expiresAt,
                      rec.remainingSeconds ?? 300,
                    )
                  : 0;

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 transition-colors whitespace-nowrap"
                  >
                    {/* 1. Date */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">
                        {formattedDate}
                      </span>
                      <span className="text-slate-400 font-medium ml-1.5">
                        ({dayName})
                      </span>
                    </td>

                    {/* 2. Time & Periods */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      <span>{rec.timeSlot}</span>
                      <span className="text-blue-600 font-sans font-medium ml-1.5">
                        ({rec.period})
                      </span>
                    </td>

                    {/* 3. Subject Code */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {rec.subjectCode}
                    </td>

                    {/* 4. Subject Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        {rec.subjectName}
                      </span>
                      {rec.className && (
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          (
                          {t("card:timetable.classLabel", {
                            classCode: rec.className,
                            defaultValue: `Lớp ${rec.className}`,
                          })}
                          )
                        </span>
                      )}
                    </td>

                    {/* 5. Class Type */}
                    <td className="py-3 px-4 text-center">
                      <Tag
                        color={isPractice ? "green" : "blue"}
                        className="text-[10px] px-2 py-0.5 m-0 font-semibold inline-block"
                      >
                        {isPractice
                          ? t("card:timetable.classTypes.practice", {
                              defaultValue: "Thực hành",
                            })
                          : t("card:timetable.classTypes.theory", {
                              defaultValue: "Lý thuyết",
                            })}
                      </Tag>
                    </td>

                    {/* 6. Room & Building */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {rec.room}
                      </span>
                      {rec.building && (
                        <span className="text-slate-500">
                          {" "}
                          • {rec.building}
                        </span>
                      )}
                    </td>

                    {/* 7. Teacher */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {rec.teacherName}
                    </td>

                    {/* 8. Radius & Timer / Check-in Info */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <Tag
                          color="cyan"
                          className="m-0 text-[10px] font-semibold px-1.5 py-0.5"
                        >
                          ≤ {rec.allowedRadiusMeters}m
                        </Tag>
                        {isOpen ? (
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                            {formatCountdownMmSs(remainingSec)}
                          </span>
                        ) : isPresent && rec.distanceMeters !== undefined ? (
                          <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px]">
                            {rec.distanceMeters?.toFixed(1)}m
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* 9. Note */}
                    <td className="py-3 px-4 text-slate-600 italic text-[11px] max-w-64 truncate">
                      {rec.note || rec.lessonTopic || "—"}
                    </td>

                    {/* 10. Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(rec.status)}
                    </td>

                    {/* 11. Action */}
                    <td className="py-3 px-4 text-center">
                      {isOpen ? (
                        <Button
                          variant="primary"
                          onClick={() => onOpenCheckIn(rec)}
                          className="text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Icon name="scan" size={13} />
                          <span>
                            {t("button:checkInNow", {
                              defaultValue: "Điểm danh ngay",
                            })}
                          </span>
                        </Button>
                      ) : isPresent ? (
                        <Button
                          variant="ghost"
                          onClick={() => onViewDetail(rec)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <span>
                            {t("button:viewDetail", {
                              defaultValue: "Xem chi tiết",
                            })}
                          </span>
                          <Icon name="arrow-right" size={12} />
                        </Button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          —
                        </span>
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
