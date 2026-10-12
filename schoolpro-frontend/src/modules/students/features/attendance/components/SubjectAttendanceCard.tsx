import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";

interface SubjectAttendanceCardProps {
  record: AttendanceRecord;
  onOpenCheckIn: (record: AttendanceRecord) => void;
  onViewDetail?: (record: AttendanceRecord) => void;
}

export const SubjectAttendanceCard: React.FC<SubjectAttendanceCardProps> = ({
  record,
  onOpenCheckIn,
  onViewDetail,
}) => {
  const isOpen = record.status === "open";
  const isPresent = record.status === "present";
  const isUpcoming = record.status === "upcoming";
  const isAbsent = record.status === "absent";

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case "qr_scan":
        return "Quét Camera QR";
      case "qr_upload":
        return "Tải ảnh mã QR";
      case "code":
        return "Mã PIN lớp";
      default:
        return "Trực tuyến";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] transition-all p-5 shadow-2xs flex flex-col justify-between gap-4">
      {/* Top Header: Period, Time Slot & Status Badge */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold flex items-center justify-center shrink-0">
            {record.period.split(" ")[1] || "Ca"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{record.period}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-1">
                <Icon name="clock" size={12} />
                <span>{record.timeSlot}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Mã lớp: <strong className="text-slate-600">{record.subjectCode}</strong>
            </span>
          </div>
        </div>

        {/* Status Tag */}
        <div>
          {isOpen && (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Đang mở điểm danh</span>
            </span>
          )}

          {isPresent && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <Icon name="checkCircle" size={13} className="text-blue-600" />
              <span>Đã điểm danh</span>
            </span>
          )}

          {isUpcoming && (
            <Tag color="default" className="m-0 text-xs font-semibold px-2 py-0.5">
              Chưa mở
            </Tag>
          )}

          {isAbsent && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              <Icon name="warning" size={13} className="text-rose-500" />
              <span>Vắng / Quá hạn</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle Body: Subject Title & Info */}
      <div className="space-y-2.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-0">
          {record.subjectName}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
              <Icon name="user" size={12} />
            </span>
            <span className="truncate">
              Giáo viên: <strong className="text-slate-800">{record.teacherName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
              <Icon name="map-pin" size={12} />
            </span>
            <span className="truncate">
              Địa điểm: <strong className="text-slate-800">{record.room}</strong>
            </span>
          </div>
        </div>

        {/* Note / Instruction / Checked Info */}
        {record.note && (
          <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-500 flex items-start gap-2 border border-slate-100">
            <Icon name="info" size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{record.note}</span>
          </div>
        )}

        {isPresent && record.checkInTime && (
          <div className="flex items-center justify-between text-xs bg-emerald-50/60 border border-emerald-100 px-3 py-2 rounded-xl text-emerald-800">
            <div className="flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-emerald-600" />
              <span>
                Điểm danh lúc: <strong>{record.checkInTime}</strong>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
              {getMethodLabel(record.checkInMethod)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          {isOpen && record.deadlineTime && (
            <span>
              Hạn chót: <strong className="text-amber-600 font-mono">{record.deadlineTime}</strong>
            </span>
          )}
          {isUpcoming && (
            <span>Cổng sẽ mở khi giáo viên bắt đầu buổi học</span>
          )}
          {isAbsent && (
            <span className="text-rose-600">Đã kết thúc thời gian điểm danh</span>
          )}
          {isPresent && (
            <span className="text-emerald-600">Chuyên cần được ghi nhận</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <Button
              variant="primary"
              onClick={() => onOpenCheckIn(record)}
              className="font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Icon name="scan" size={15} />
              <span>Điểm danh ngay</span>
            </Button>
          )}

          {isPresent && onViewDetail && (
            <Button
              variant="outline"
              onClick={() => onViewDetail(record)}
              className="font-medium text-xs flex items-center gap-1.5"
            >
              <Icon name="eye" size={13} />
              <span>Xem minh chứng</span>
            </Button>
          )}

          {isUpcoming && (
            <Button
              variant="secondary"
              disabled
              className="font-medium text-xs flex items-center gap-1.5 opacity-60 cursor-not-allowed"
            >
              <Icon name="clock" size={13} />
              <span>Chưa đến giờ</span>
            </Button>
          )}

          {isAbsent && (
            <Button
              variant="outline"
              disabled
              className="font-medium text-xs flex items-center gap-1.5 opacity-50 cursor-not-allowed text-rose-500 border-rose-200"
            >
              <Icon name="close" size={13} />
              <span>Đã đóng cổng</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
