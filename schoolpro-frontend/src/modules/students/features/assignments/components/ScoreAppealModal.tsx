import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { message } from "@/components/ui/Message";
import { Modal } from "@/components/ui/Modal";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface ScoreAppealModalProps {
  open: boolean;
  onClose: () => void;
  assignment: AssignmentItem;
  onSubmit: (reason: string) => Promise<void>;
  loading?: boolean;
}

export const ScoreAppealModal: React.FC<ScoreAppealModalProps> = ({
  open,
  onClose,
  assignment,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation(["card", "button", "message"]);
  const [reason, setReason] = useState("");

  const quickReasons: string[] = [
    t("card:assignments.modals.appealQuickReason1"),
    t("card:assignments.modals.appealQuickReason2"),
  ];

  const handleSend = async () => {
    if (!reason.trim()) {
      message.warning(t("message:assignments.appealEmptyReasonWarning"));
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
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon name="info" size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-0">
              {t("card:assignments.modals.appealTitle")}
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              {t("card:assignments.modals.appealSubtitle")}
            </span>
          </div>
        </div>
      }
    >
      <div className="py-3 space-y-4">
        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:assignments.modals.recipientTeacher")}
            </span>
            <strong className="text-slate-800">
              {assignment.gradedByName || assignment.teacherName}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:assignments.modals.subjectAndAssignment")}
            </span>
            <span className="text-slate-800 font-medium truncate max-w-65">
              {assignment.subjectName} • {assignment.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:assignments.modals.currentScoreLabel")}
            </span>
            <span className="text-emerald-700 font-bold">
              {assignment.score ?? 0}/{assignment.pointsPossible}
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-1.5">
            {t("card:assignments.modals.quickReasonsLabel")}
          </span>
          <div className="space-y-1.5">
            {quickReasons.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(preset)}
                className="w-full text-left p-2 rounded-lg text-[11px] text-slate-600 bg-white border border-[#f0f0f0] hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              >
                • {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="assignment-appeal-reason"
              className="text-xs font-semibold text-slate-700 block mb-0"
            >
              {t("card:assignments.modals.appealReasonLabel")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {t("card:assignments.modals.charCount", {
                count: reason.length,
                max: 500,
              })}
            </span>
          </div>

          <TextArea
            id="assignment-appeal-reason"
            name="appealReason"
            rows={4}
            maxLength={500}
            placeholder={t("card:assignments.modals.appealPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("button:cancel")}
          </Button>

          <Button
            variant="primary"
            onClick={handleSend}
            disabled={loading || !reason.trim()}
          >
            <Icon name="send" size={13} className="mr-1.5" />
            {loading
              ? t("button:sendingEmail")
              : t("button:submitScoreAppeal")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
