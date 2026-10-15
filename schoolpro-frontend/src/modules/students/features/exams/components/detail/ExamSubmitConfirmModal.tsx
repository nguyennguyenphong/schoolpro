import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Tag } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface UnansweredQuestionItem {
  id: string;
  title: string;
  questionNumber: number;
}

interface ExamSubmitConfirmModalProps {
  open: boolean;
  examTitle: string;
  totalQuestions: number;
  answeredCount: number;
  unansweredQuestions?: UnansweredQuestionItem[];
  onJumpToQuestion?: (questionId: string) => void;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExamSubmitConfirmModal: React.FC<ExamSubmitConfirmModalProps> = ({
  open,
  examTitle,
  totalQuestions,
  answeredCount,
  unansweredQuestions = [],
  onJumpToQuestion,
  submitting,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const isAllAnswered = unansweredQuestions.length === 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Icon
            name={isAllAnswered ? "checkCircle" : "warning"}
            size={18}
            className={isAllAnswered ? "text-emerald-600" : "text-amber-500"}
          />
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
          {isAllAnswered ? t("button:cancel") : t("card:exams.exitModal.stayAndContinue")}
        </Button>,
        <Button
          key="submit"
          variant="primary"
          onClick={onConfirm}
          loading={submitting}
          className={`text-xs font-semibold ${
            !isAllAnswered ? "!bg-amber-600 hover:!bg-amber-700 !border-amber-600" : ""
          }`}
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
            <span className="font-semibold text-slate-700">
              {t("card:exams.sidebar.progress")}:
            </span>
          </div>
          <span className="font-extrabold text-slate-900">
            {answeredCount} / {totalQuestions}
          </span>
        </div>

        {/* If incomplete: Display missing question tags with jump links */}
        {!isAllAnswered && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Icon name="warning" size={14} />
              <span>
                {t("card:exams.submitModal.unansweredWarning", {
                  count: unansweredQuestions.length,
                })}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 mb-1">
              {t("card:exams.submitModal.clickToJump")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unansweredQuestions.map((q) => (
                <Tag
                  key={q.id}
                  color="orange"
                  className="cursor-pointer hover:opacity-80 px-2.5 py-0.5 rounded-lg font-bold text-xs"
                  onClick={() => {
                    onJumpToQuestion?.(q.id);
                    onCancel();
                  }}
                  title={q.title}
                >
                  {t("card:exams.question.number", { index: q.questionNumber })}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* If completely answered: show green success notice */}
        {isAllAnswered && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <Icon name="checkCircle" size={16} className="text-emerald-600 shrink-0" />
            <span>{t("card:exams.submitModal.allAnsweredNotice")}</span>
          </div>
        )}

        {/* Warning / Notes Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
          <p className="mb-0 text-[11px] leading-relaxed">
            {t("card:exams.submitModal.warning")}
          </p>
        </div>
      </div>
    </Modal>
  );
};
