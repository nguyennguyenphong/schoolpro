import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["card", "button"]);
  const isAllAnswered = answeredCount >= totalQuestions;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Icon name="checkCircle" size={18} className="text-blue-600" />
          <span>{t("card:exams.submitModal.title")}</span>
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
          {t("button:cancel")}
        </Button>,
        <Button
          key="submit"
          variant="primary"
          onClick={onConfirm}
          loading={submitting}
          className="text-xs font-semibold"
        >
          {isAllAnswered
            ? t("card:exams.submitModal.confirmButton")
            : t("card:exams.submitModal.confirmButtonUnfinished")}
        </Button>,
      ]}
      centered
    >
      <div className="py-2.5 space-y-3.5 text-xs sm:text-sm text-slate-600">
        <p className="leading-relaxed mb-0">
          {t("card:exams.submitModal.confirmQuestion", { title: examTitle })}
        </p>

        {/* Status statistics */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <Icon
              name={isAllAnswered ? "checkCircle" : "warning"}
              size={16}
              className={isAllAnswered ? "text-emerald-600" : "text-amber-500"}
            />
            <span className="font-semibold text-slate-700">{t("card:exams.sidebar.progress")}:</span>
          </div>
          <span className="font-extrabold text-slate-900">
            {answeredCount} / {totalQuestions}
          </span>
        </div>

        {/* Warning / Notes Banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-blue-800">
            <Icon name="info" size={13} />
            <span>{t("card:exams.detail.notesTitle")}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-0.5">
            <li>{t("card:exams.submitModal.warning")}</li>
            {!isAllAnswered && (
              <li className="text-amber-700 font-semibold">
                {t("card:exams.submitModal.unansweredWarning", { count: totalQuestions - answeredCount })}
              </li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  );
};
