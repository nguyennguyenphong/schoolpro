import React from "react";
import { Modal } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface ExamSubmitConfirmModalProps {
  open: boolean;
  examTitle: string;
  totalQuestions: number;
  answeredCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExamSubmitConfirmModal: React.FC<ExamSubmitConfirmModalProps> = ({
  open,
  examTitle,
  totalQuestions,
  answeredCount,
  submitting,
  onCancel,
  onConfirm,
}) => {
  const isAllAnswered = answeredCount >= totalQuestions;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Icon name="checkCircle" size={18} className="text-blue-600" />
          <span>Xác nhận nộp bài thi</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button
          key="cancel"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="text-xs font-semibold"
        >
          Tiếp tục làm bài
        </Button>,
        <Button
          key="submit"
          variant="primary"
          onClick={onConfirm}
          loading={submitting}
          className="text-xs font-semibold"
        >
          Xác nhận nộp bài
        </Button>,
      ]}
      centered
    >
      <div className="py-2.5 space-y-3.5 text-xs sm:text-sm text-slate-600">
        <p className="leading-relaxed mb-0">
          Bạn có chắc chắn muốn nộp bài thi <strong className="text-slate-800">"{examTitle}"</strong> không?
        </p>

        {/* Status statistics */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <Icon
              name={isAllAnswered ? "checkCircle" : "warning"}
              size={16}
              className={isAllAnswered ? "text-emerald-600" : "text-amber-500"}
            />
            <span className="font-semibold text-slate-700">Tiến độ câu hỏi:</span>
          </div>
          <span className="font-extrabold text-slate-900">
            {answeredCount} / {totalQuestions} câu
          </span>
        </div>

        {/* Warning / Notes Banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-blue-800">
            <Icon name="info" size={13} />
            <span>Lưu ý khi nộp bài:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-0.5">
            <li>Sau khi nộp, hệ thống sẽ khóa bài thi và bạn không thể sửa đổi câu trả lời.</li>
            <li>Hệ thống tự động chấm điểm và hiển thị kết quả cho bạn ngay sau khi nộp.</li>
            {!isAllAnswered && (
              <li className="text-amber-700 font-semibold">
                Bạn vẫn còn {totalQuestions - answeredCount} câu hỏi chưa trả lời!
              </li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  );
};
