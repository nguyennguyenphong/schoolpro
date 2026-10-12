import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";
import {
  computeRemainingSeconds,
  formatCoordinate,
  formatCountdownMmSs,
} from "@/modules/students/features/attendance/utils";

interface SubjectAttendanceCardProps {
  record: AttendanceRecord;
  onOpenCheckIn: (record: AttendanceRecord) => void;
  onViewDetail?: (record: AttendanceRecord) => void;
  onConfigureSession?: (record: AttendanceRecord) => void;
}

export const SubjectAttendanceCard: React.FC<SubjectAttendanceCardProps> = ({
  record,
  onOpenCheckIn,
  onViewDetail,
  onConfigureSession,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const isOpen = record.status === "open";
  const isPresent = record.status === "present";
  const isUpcoming = record.status === "upcoming";
  const isAbsent = record.status === "absent";
  const isExcused = record.status === "excused";

  const remainingSec = isOpen
    ? computeRemainingSeconds(record.expiresAt, record.remainingSeconds ?? 300)
    : 0;
  const countdownText = formatCountdownMmSs(remainingSec);

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case "qr_scan":
        return t("card:attendance.method.qrScan", {
          defaultValue: "Quét Camera QR",
        });
      case "qr_upload":
        return t("card:attendance.method.qrUpload", {
          defaultValue: "Tải ảnh mã QR",
        });
      case "code":
        return t("card:attendance.method.pinCode", {
          defaultValue: "Mã 6 chữ số",
        });
      default:
        return t("card:attendance.method.electronic", {
          defaultValue: "Điểm danh trực tuyến",
        });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] hover:border-blue-300 transition-all p-5 shadow-2xs flex flex-col justify-between gap-4 h-full">
      <div className="flex flex-col gap-3.5">
        {/* Row 1: Period Badge, Time Slot & Status Badge */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold flex items-center justify-center shrink-0">
              {record.periodNumber || record.period.split(" ")[1] || "1"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {record.period}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  <span>{record.timeSlot}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {t("card:attendance.card.subjectCodeLabel", {
                  defaultValue: "Mã môn học:",
                })}{" "}
                <strong className="text-slate-600">{record.subjectCode}</strong>
                {record.className ? ` • Lớp ${record.className}` : ""}
              </span>
            </div>
          </div>

          {/* Status Tag */}
          <div className="flex items-center gap-2">
            {isOpen && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>
                  {t("card:attendance.status.open", {
                    defaultValue: "Đang mở điểm danh",
                  })}
                </span>
              </span>
            )}

            {isPresent && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                <Icon name="checkCircle" size={13} className="text-blue-600" />
                <span>
                  {t("card:attendance.status.present", {
                    defaultValue: "Đã điểm danh",
                  })}
                </span>
              </span>
            )}

            {isExcused && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-full">
                <Icon
                  name="file-text"
                  size={13}
                  className="text-cyan-600"
                />
                <span>
                  {t("card:attendance.status.excused", {
                    defaultValue: "Nghỉ có phép",
                  })}
                </span>
              </span>
            )}

            {isUpcoming && (
              <Tag
                color="default"
                className="m-0 text-xs font-semibold px-2.5 py-0.5"
              >
                {t("card:attendance.status.upcoming", {
                  defaultValue: "Chưa mở cổng",
                })}
              </Tag>
            )}

            {isAbsent && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                <Icon name="warning" size={13} className="text-rose-500" />
                <span>
                  {t("card:attendance.status.absent", {
                    defaultValue: "Vắng / Hết hạn mã",
                  })}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Subject Title & Teacher / Classroom Info */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-0">
            {record.subjectName}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                <Icon name="user" size={12} />
              </span>
              <span className="truncate">
                {t("card:attendance.card.teacherLabel", {
                  defaultValue: "Giáo viên:",
                })}{" "}
                <strong className="text-slate-800">{record.teacherName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                <Icon name="map-pin" size={12} />
              </span>
              <span className="truncate">
                {t("card:attendance.card.roomLabel", {
                  defaultValue: "Phòng học:",
                })}{" "}
                <strong className="text-slate-800">{record.room}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Anti-cheat GPS Radius & Live Expiration / Check-in Verification Strip */}
        {isOpen ? (
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                <Icon name="keyRound" size={12} className="text-blue-600" />
                <span>
                  {t("card:attendance.card.pinCodeBadge", {
                    code: record.attendanceCode,
                    defaultValue: `Mã 6 số: ${record.attendanceCode}`,
                  })}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                <Icon name="map-pin" size={12} className="text-emerald-600" />
                <span>
                  {t("card:attendance.card.radiusBadge", {
                    radius: record.allowedRadiusMeters,
                    defaultValue: `Bán kính quét: ≤ ${record.allowedRadiusMeters}m`,
                  })}
                </span>
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 font-mono font-extrabold px-2.5 py-0.5 rounded-md border ${
                remainingSec <= 60
                  ? "bg-rose-100 text-rose-700 border-rose-300 animate-pulse"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              <Icon name="clock" size={12} />
              <span>
                {t("card:attendance.card.expiresInLabel", {
                  time: countdownText,
                  defaultValue: `Hết hạn sau: ${countdownText}`,
                })}
              </span>
            </span>
          </div>
        ) : isPresent && record.checkInTime ? (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-emerald-600 shrink-0" />
              <span>
                {t("card:attendance.card.checkedInAt", {
                  time: record.checkInTime,
                  defaultValue: `Điểm danh lúc: ${record.checkInTime}`,
                })}
              </span>
              {record.distanceMeters !== null &&
                record.distanceMeters !== undefined && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    GPS: {record.distanceMeters.toFixed(1)}m /{" "}
                    {record.allowedRadiusMeters}m
                  </span>
                )}
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              {getMethodLabel(record.checkInMethod)}
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Icon name="map-pin" size={12} className="text-blue-600" />
              <span>
                {t("card:attendance.card.teacherGpsCoord", {
                  lat: formatCoordinate(record.teacherLatitude),
                  lng: formatCoordinate(record.teacherLongitude),
                  defaultValue: `Tọa độ thiết bị Giáo viên: ${formatCoordinate(record.teacherLatitude)}, ${formatCoordinate(record.teacherLongitude)}`,
                })}
              </span>
            </span>
            <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {t("card:attendance.card.radiusBadge", {
                radius: record.allowedRadiusMeters,
                defaultValue: `Bán kính quét: ≤ ${record.allowedRadiusMeters}m`,
              })}
            </span>
          </div>
        )}

        {/* Row 4: Note / System Status Message */}
        {record.note && (
          <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
            <Icon
              name="info"
              size={14}
              className="text-blue-500 shrink-0 mt-0.5"
            />
            <span className="leading-relaxed line-clamp-2">{record.note}</span>
          </div>
        )}
      </div>

      {/* Footer Row: Deadline Info & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          {isOpen && record.deadlineTime && (
            <span>
              {t("card:attendance.card.deadlineLabel", {
                defaultValue: "Hạn đóng mã:",
              })}{" "}
              <strong className="text-amber-700 font-mono">
                {record.deadlineTime}
              </strong>
            </span>
          )}
          {isUpcoming && (
            <span>
              {t("card:attendance.card.upcomingHint", {
                defaultValue: "Giáo viên sẽ phát mã 6 số & QR khi vào tiết",
              })}
            </span>
          )}
          {isAbsent && (
            <span className="text-rose-600 font-medium">
              {t("card:attendance.card.expiredHint", {
                defaultValue: "Mã điểm danh đã hết thời gian sử dụng",
              })}
            </span>
          )}
          {isPresent && (
            <span className="text-emerald-700 font-medium">
              {t("card:attendance.card.verifiedGpsHint", {
                defaultValue: "Đã xác thực tọa độ GPS & chuyên cần hợp lệ",
              })}
            </span>
          )}
          {isExcused && (
            <span className="text-cyan-700 font-medium">
              {t("card:attendance.card.excusedHint", {
                defaultValue: "Đã đồng bộ từ đơn xin nghỉ phép hợp lệ",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onConfigureSession && (
            <Button
              variant="ghost"
              onClick={() => onConfigureSession(record)}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 px-2.5"
              title={t("button:configureSessionTooltip", {
                defaultValue:
                  "Thiết lập mã 6 chữ số, mã QR, bán kính quét và thời hạn (Giáo viên)",
              })}
            >
              <Icon name="settings" size={13} />
              <span>
                {t("button:teacherConfigShort", {
                  defaultValue: "Cấu hình mã",
                })}
              </span>
            </Button>
          )}

          {isOpen && (
            <Button
              variant="primary"
              onClick={() => onOpenCheckIn(record)}
              className="font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Icon name="scan" size={15} />
              <span>
                {t("button:checkInNow", {
                  defaultValue: "Điểm danh ngay",
                })}
              </span>
            </Button>
          )}

          {isPresent && onViewDetail && (
            <Button
              variant="outline"
              onClick={() => onViewDetail(record)}
              className="font-semibold text-xs flex items-center gap-1.5"
            >
              <Icon name="eye" size={13} />
              <span>
                {t("button:viewProof", {
                  defaultValue: "Xem minh chứng GPS",
                })}
              </span>
            </Button>
          )}

          {isUpcoming && (
            <Button
              variant="secondary"
              disabled
              className="font-medium text-xs flex items-center gap-1.5 opacity-60 cursor-not-allowed"
            >
              <Icon name="clock" size={13} />
              <span>
                {t("button:notYetOpen", {
                  defaultValue: "Chưa đến giờ",
                })}
              </span>
            </Button>
          )}

          {isAbsent && (
            <Button
              variant="outline"
              disabled
              className="font-medium text-xs flex items-center gap-1.5 opacity-60 cursor-not-allowed text-rose-500 border-rose-200"
            >
              <Icon name="close" size={13} />
              <span>
                {t("button:codeExpired", {
                  defaultValue: "Mã đã hết hạn",
                })}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
