import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface ExamExitConfirmModalProps {
  open: boolean;
  totalQuestions: number;
  unansweredCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExamExitConfirmModal: React.FC<ExamExitConfirmModalProps> = ({
  open,
  totalQuestions,
  unansweredCount,
  submitting,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation(["card", "button"]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-bold text-rose-600">
          <Icon name="warning" size={18} className="text-rose-600" />
          <span>{t("card:exams.exitModal.title")}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button
          key="stay"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="text-xs font-semibold"
        >
          {t("card:exams.exitModal.stayAndContinue")}
        </Button>,
        <Button
          key="exit"
          variant="primary"
          onClick={onConfirm}
          loading={submitting}
          className="text-xs font-semibold !bg-rose-600 hover:!bg-rose-700 !border-rose-600"
        >
          {t("card:exams.exitModal.confirmExitAndSubmit")}
        </Button>,
      ]}
      centered
    >
      <div className="py-2.5 space-y-3.5 text-xs sm:text-sm text-slate-600">
        <p className="leading-relaxed mb-0 font-medium text-slate-800">
          {t("card:exams.exitModal.warningText")}
        </p>

        {unansweredCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <span className="font-bold">
              {t("card:exams.exitModal.unansweredNotice", {
                unanswered: unansweredCount,
                total: totalQuestions,
              })}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
