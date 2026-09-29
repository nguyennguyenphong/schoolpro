import React from "react";
import dayjs from "dayjs";
import { Modal } from "antd";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

interface ClassDetailModalProps {
  slot: TimetableSlot | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  slot,
  isOpen,
  onClose,
}) => {
  if (!slot) return null;

  const slotDate = dayjs(slot.date);
  const formattedDate = slotDate.format("DD/MM/YYYY");
  const dayName = `Thứ ${slot.dayOfWeek === 8 ? "Chủ Nhật" : slot.dayOfWeek}`;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
    >
      <div className="pt-2 space-y-5">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              {slot.courseCode}
            </span>
            <Tag color={slot.classType === "practice" ? "green" : "blue"}>
              {slot.classType === "practice" ? "Thực hành (Lab)" : "Lý thuyết"}
            </Tag>
            <span className="text-xs text-slate-500 font-medium">
              Lớp: <strong>{slot.classCode}</strong>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              • <strong>{slot.credits} tín chỉ</strong>
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-0 leading-tight">
            {slot.courseName}
          </h3>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Thời gian & Ca học</span>
            <span className="font-bold text-slate-800 text-sm block">
              {slot.startTime} - {slot.endTime}
            </span>
            <span className="text-blue-600 font-medium">
              {slot.periods} ({slot.shift === "morning" ? "Ca Sáng" : slot.shift === "afternoon" ? "Ca Chiều" : "Ca Tối"})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Ngày học</span>
            <span className="font-bold text-slate-800 text-sm block">
              {formattedDate}
            </span>
            <span className="text-slate-600 font-medium">{dayName}</span>
          </div>
        </div>

        {/* Classroom & Lecturer Info */}
        <div className="space-y-3 text-xs">
          {/* Location */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon name="map-pin" size={16} />
            </div>
            <div>
              <span className="font-bold text-slate-800 block text-sm">
                Phòng {slot.room} • {slot.building}
              </span>
              <span className="text-slate-500 block">{slot.campus}</span>
            </div>
          </div>

          {/* Lecturer */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Icon name="user" size={16} />
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-800 block text-sm">
                {slot.instructorName}
              </span>
              <span className="text-slate-500 block font-mono text-[11px]">
                {slot.instructorEmail} {slot.instructorPhone ? `• ${slot.instructorPhone}` : ""}
              </span>
            </div>
          </div>

          {/* Lesson Topic */}
          {slot.lessonTopic && (
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-900 block mb-1">
                Nội dung bài giảng / Yêu cầu buổi học:
              </span>
              <p className="text-slate-700 mb-0 leading-relaxed">
                {slot.lessonTopic}
              </p>
            </div>
          )}

          {/* Notes */}
          {slot.notes && (
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <span className="font-bold text-amber-900 block mb-0.5">
                Ghi chú từ giảng viên:
              </span>
              <p className="text-slate-700 mb-0">{slot.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          {slot.onlineUrl && (
            <a
              href={slot.onlineUrl}
              target="_blank"
              rel="noreferrer"
              className="no-underline"
            >
              <Button variant="outline">
                Vào lớp trực tuyến
              </Button>
            </a>
          )}
          <Button
            variant="primary"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
