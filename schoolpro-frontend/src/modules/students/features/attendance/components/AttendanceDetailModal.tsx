import React from "react";
import { Modal } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";

interface AttendanceDetailModalProps {
  open: boolean;
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  open,
  record,
  onClose,
}) => {
  if (!record) return null;

  const getMethodText = (method?: string) => {
    switch (method) {
      case "qr_scan":
        return "Quét trực tiếp qua Camera QR";
      case "qr_upload":
        return "Tải ảnh mã QR lớp học";
      case "code":
        return "Nhập mã PIN của giáo viên";
      default:
        return "Điểm danh điện tử";
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} className="font-semibold">
            Đóng
          </Button>
        </div>
      }
      width={520}
      title={
        <div className="flex items-center gap-2">
          <Icon name="checkCircle" size={18} className="text-emerald-600" />
          <span className="font-bold text-slate-800 text-base">Minh chứng điểm danh</span>
        </div>
      }
      centered
    >
      <div className="space-y-4 pt-3 text-xs">
        {/* Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Icon name="check" size={20} strokeWidth={3} />
          </span>
          <div>
            <span className="text-sm font-bold text-emerald-900 block">
              Đã ghi nhận có mặt đúng giờ
            </span>
            <span className="text-emerald-700 text-[11px]">
              Dữ liệu chuyên cần đã được đồng bộ vào sổ điểm danh điện tử của nhà trường.
            </span>
          </div>
        </div>

        {/* Details list */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Môn học:</span>
            <strong className="text-slate-900 font-bold text-right truncate max-w-64">
              {record.subjectName}
            </strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Mã học phần:</span>
            <span className="font-mono font-bold text-slate-800">{record.subjectCode}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Giáo viên phụ trách:</span>
            <strong className="text-slate-800">{record.teacherName}</strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Khung giờ học:</span>
            <span className="font-medium text-slate-800">{record.period} ({record.timeSlot})</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Phòng học:</span>
            <strong className="text-slate-800">{record.room}</strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Thời gian điểm danh:</span>
            <strong className="text-emerald-700 font-mono font-bold">
              {record.checkInTime || "Đúng giờ"} (ngày {record.date})
            </strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Phương thức:</span>
            <Tag color="blue" className="m-0 font-semibold">
              {getMethodText(record.checkInMethod)}
            </Tag>
          </div>
        </div>
      </div>
    </Modal>
  );
};
