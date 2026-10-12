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
 * Student SubjectAttendanceCard styled after TimetableSlotCard:
 * - Class badge + Status badge on top
 * - Subject title
 * - Room & Building
 * - Time & Periods
 * - Teacher & Teacher Email
 * - Learning Mode (Theory/Practice) & Allowed Scan Radius
 * - Live Expiration Countdown / Verified GPS status
 * - Notes & Student Check-in / View Detail action button
 */
export const SubjectAttendanceCard: React.FC<SubjectAttendanceCardProps> = ({
  record,
  onOpenCheckIn,
  onViewDetail,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const isOpen = record.status === "open";
  const isPresent = record.status === "present";
  const isUpcoming = record.status === "upcoming";
  const isAbsent = record.status === "absent";
  const isExcused = record.status === "excused";
  const isPractice = record.classType === "practice";

  const remainingSec = isOpen
    ? computeRemainingSeconds(record.expiresAt, record.remainingSeconds ?? 300)
    : 0;
  const countdownText = formatCountdownMmSs(remainingSec);

  const getStatusTag = () => {
    if (isOpen) {
      return (
        <Tag color="processing" className="m-0 text-[11px] font-semibold">
          {t("card:attendance.status.open", {
            defaultValue: "Đang mở điểm danh",
          })}
        </Tag>
      );
    }
    if (isPresent) {
      return (
        <Tag color="success" className="m-0 text-[11px] font-semibold">
          {t("card:attendance.status.present", {
            defaultValue: "Đã điểm danh",
          })}
        </Tag>
      );
    }
    if (isExcused) {
      return (
        <Tag color="cyan" className="m-0 text-[11px] font-semibold">
          {t("card:attendance.status.excused", {
            defaultValue: "Nghỉ có phép",
          })}
        </Tag>
      );
    }
    if (isAbsent) {
      return (
        <Tag color="error" className="m-0 text-[11px] font-semibold">
          {t("card:attendance.status.absent", {
            defaultValue: "Vắng / Hết hạn mã",
          })}
        </Tag>
      );
    }
    return (
      <Tag color="default" className="m-0 text-[11px] font-semibold">
        {t("card:attendance.status.upcoming", {
          defaultValue: "Chưa mở cổng",
        })}
      </Tag>
    );
  };

  return (
    <div
      className={`w-full h-full min-h-105 bg-white border rounded-xl p-3.5 flex flex-col justify-between shadow-2xs transition-all relative ${
        isOpen
          ? "border-blue-300 ring-1 ring-blue-100 hover:border-blue-400"
          : "border-[#f0f0f0] hover:border-blue-300"
      }`}
    >
      {isOpen && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
        </span>
      )}

      {/* Top Section: Môn học, Lớp, Phòng, Thời gian, Giáo viên & Email, Hình thức, Bán kính */}
      <div className="space-y-2.5">
        {/* 1. Môn học & Lớp + Trạng thái (giống TimetableSlotCard) */}
        <div className="pb-2 border-b border-slate-100 min-h-14.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xl border border-blue-100">
              <Icon
                name="academic"
                size={12}
                className="text-blue-600 shrink-0"
              />
              <span>
                {t("card:timetable.classLabel", {
                  classCode: record.className || record.subjectCode,
                  defaultValue: `Lớp ${record.className || record.subjectCode}`,
                })}
              </span>
            </span>
            {getStatusTag()}
          </div>
          <h4
            className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-0"
            title={record.subjectName}
          >
            {record.subjectName}
          </h4>
        </div>

        {/* 2. Phòng học */}
        <div className="flex items-start gap-2 text-xs text-slate-700 min-h-8.5">
          <Icon
            name="map-pin"
            size={14}
            className="text-slate-400 shrink-0 mt-0.5"
          />
          <div className="leading-snug space-y-0.5">
            <div className="font-semibold text-slate-800">
              <span>{record.room}</span>
              {record.building && (
                <span className="font-normal text-slate-500">
                  {" "}
                  • {record.building}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {record.subjectCode}
            </div>
          </div>
        </div>

        {/* 3. Thời gian học & Tiết mấy */}
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Icon name="clock" size={14} className="text-slate-400 shrink-0" />
          <div className="font-medium">
            <span>{record.timeSlot}</span>
            <span className="text-slate-500 text-[11px] ml-1.5 font-normal">
              ({record.period})
            </span>
          </div>
        </div>

        {/* 4. Giáo viên & Email liên hệ giáo viên */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Icon name="user" size={14} className="text-slate-400 shrink-0" />
            <span
              className="font-semibold text-slate-800 truncate"
              title={record.teacherName}
            >
              {record.teacherName}
            </span>
          </div>
          {record.teacherEmail ? (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Icon name="mail" size={13} className="text-slate-400 shrink-0" />
              <a
                href={`mailto:${record.teacherEmail}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 hover:underline truncate text-[11px] font-medium"
                title={record.teacherEmail}
              >
                {record.teacherEmail}
              </a>
            </div>
          ) : null}
        </div>

        {/* 5. Hình thức học */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <span className="text-slate-500">
            {t("card:timetable.learningMode", {
              defaultValue: "Hình thức học:",
            })}
          </span>
          <Tag
            color={isPractice ? "green" : "blue"}
            className="m-0 text-[11px] font-semibold px-2 py-0.5"
          >
            {isPractice
              ? t("card:timetable.classTypes.practice", {
                  defaultValue: "Thực hành",
                })
              : t("card:timetable.classTypes.theory", {
                  defaultValue: "Lý thuyết",
                })}
          </Tag>
        </div>

        {/* 6. Bán kính thiết bị quét cho phép */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <span className="text-slate-500">
            {t("card:attendance.card.allowedRadiusLabel", {
              defaultValue: "Bán kính cho phép:",
            })}
          </span>
          <Tag
            color="cyan"
            className="m-0 text-[11px] font-semibold px-2 py-0.5"
          >
            {t("card:attendance.card.radiusBadge", {
              radius: record.allowedRadiusMeters,
              defaultValue: `≤ ${record.allowedRadiusMeters}m`,
            })}
          </Tag>
        </div>

        {/* 7. Thời gian hiệu lực mã / Khoảng cách GPS đã xác thực */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <span className="text-slate-500">
            {isOpen
              ? t("card:attendance.card.countdownRowLabel", {
                  defaultValue: "Thời hạn mã:",
                })
              : isPresent
                ? t("card:attendance.card.verifiedRowLabel", {
                    defaultValue: "Xác thực GPS:",
                  })
                : t("card:attendance.card.deadlineLabel", {
                    defaultValue: "Hạn đóng mã:",
                  })}
          </span>

          {isOpen ? (
            <span
              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                remainingSec <= 60
                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {t("card:attendance.card.expiresInLabel", {
                time: countdownText,
                defaultValue: `Còn lại: ${countdownText}`,
              })}
            </span>
          ) : isPresent ? (
            <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {record.checkInTime}
              {record.distanceMeters !== null &&
              record.distanceMeters !== undefined
                ? ` • ${record.distanceMeters.toFixed(1)}m`
                : ""}
            </span>
          ) : (
            <span className="font-mono text-[11px] font-medium text-slate-600">
              {record.deadlineTime || "—"}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Section: Ghi chú & Thao tác của Học sinh (giống TimetableSlotCard) */}
      <div className="space-y-2.5 pt-2.5 border-t border-slate-100 mt-2.5">
        {/* 8. Ghi chú */}
        <div className="text-xs">
          <span className="text-slate-500 font-medium block mb-1">
            {t("card:timetable.notes", { defaultValue: "Ghi chú:" })}
          </span>
          <div
            className="text-slate-700 italic text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100/80 leading-relaxed min-h-11.5 flex items-center"
            title={record.note || record.lessonTopic}
          >
            <span className="line-clamp-2">
              {record.note ||
                record.lessonTopic ||
                t("card:timetable.noNotes", {
                  defaultValue: "Không có ghi chú",
                })}
            </span>
          </div>
        </div>

        {/* 9. Thao tác điểm danh dành cho Học sinh */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {isOpen ? (
            <Button
              variant="primary"
              onClick={() => onOpenCheckIn(record)}
              className="w-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Icon name="scan" size={14} />
              <span>
                {t("button:checkInNow", {
                  defaultValue: "Điểm danh ngay (Mã 6 số / QR)",
                })}
              </span>
            </Button>
          ) : isPresent && onViewDetail ? (
            <Button
              variant="outline"
              onClick={() => onViewDetail(record)}
              className="w-full font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <Icon name="eye" size={13} />
              <span>
                {t("button:viewProof", {
                  defaultValue: "Xem minh chứng GPS",
                })}
              </span>
            </Button>
          ) : isUpcoming ? (
            <Button
              variant="secondary"
              disabled
              className="w-full font-medium text-xs flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
            >
              <Icon name="clock" size={13} />
              <span>
                {t("button:notYetOpen", {
                  defaultValue: "Chưa đến giờ mở cổng",
                })}
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full font-medium text-xs flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed text-rose-500 border-rose-200"
            >
              <Icon name="close" size={13} />
              <span>
                {t("button:codeExpired", {
                  defaultValue: "Đã đóng cổng điểm danh",
                })}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
