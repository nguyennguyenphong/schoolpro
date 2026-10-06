import React, { useState } from "react";
import { Modal, message } from "antd";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface ReopenRequestModalProps {
  open: boolean;
  onClose: () => void;
  assignment: AssignmentItem;
  onSubmit: (reason: string) => Promise<void>;
  loading?: boolean;
}

const QUICK_REASONS = [
  "Em nộp nhầm phiên bản file nháp, xin phép thầy/cô cho em nộp lại bản chính thức hoàn thiện.",
  "Em gặp sự cố mất kết nối mạng và thiết bị sát giờ nộp, kính mong thầy/cô xem xét mở lại cổng.",
  "Nhóm em đã bổ sung thêm video thuyết trình và bảng số liệu thực hành còn thiếu, xin phép nộp bổ sung.",
];

export const ReopenRequestModal: React.FC<ReopenRequestModalProps> = ({
  open,
  onClose,
  assignment,
  onSubmit,
  loading = false,
}) => {
  const [reason, setReason] = useState("");

  const teacherEmail =
    assignment.teacherEmail ||
    `${assignment.teacherName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")}@schoolpro.edu.vn`;

  const handleSend = async () => {
    if (!reason.trim()) {
      message.warning("Vui lòng nhập lý do và lời nhắn gửi giáo viên!");
      return;
    }
    await onSubmit(reason.trim());
    setReason("");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={560}
      centered
      title={
        <div className="flex items-center gap-2.5 pb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Icon name="mail" size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-0">
              Yêu cầu mở lại cổng nộp bài
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              Gửi thông điệp đề xuất trực tiếp đến email giáo viên phụ trách
            </span>
          </div>
        </div>
      }
    >
      <div className="py-3 space-y-4">
        {/* Recipient Teacher Information Box */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Giáo viên phụ trách:</span>
            <strong className="text-slate-800">{assignment.teacherName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email nhận yêu cầu:</span>
            <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Icon name="mail" size={12} className="text-blue-600" />
              <span>{teacherEmail}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Môn học & Bài tập:</span>
            <span className="text-slate-800 font-medium truncate max-w-[260px]">
              {assignment.subjectName} • {assignment.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Hạn chót đã kết thúc:</span>
            <span className="text-rose-600 font-bold">{assignment.dueDate}</span>
          </div>
        </div>

        {/* Quick Reason Suggestions */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Gợi ý lý do nhanh:
          </label>
          <div className="space-y-1.5">
            {QUICK_REASONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(preset)}
                className="w-full text-left p-2 rounded-lg text-[11px] text-slate-600 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              >
                • {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Message Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 block mb-0">
              Nội dung lời nhắn gửi thầy/cô: <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {reason.length}/500 ký tự
            </span>
          </div>

          <TextArea
            rows={4}
            maxLength={500}
            placeholder="Kính gửi thầy/cô, em xin phép gửi lý do xin mở lại cổng nộp bài tập..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
          </Button>

          <Button
            variant="primary"
            onClick={handleSend}
            disabled={loading || !reason.trim()}
          >
            <Icon name="send" size={13} className="mr-1.5" />
            {loading ? "Đang gửi email..." : "Gửi yêu cầu đến giáo viên"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
