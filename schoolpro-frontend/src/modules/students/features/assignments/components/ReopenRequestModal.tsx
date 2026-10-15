import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";
import { message } from "@/components/ui/Message";
import { Modal } from "@/components/ui/Modal";

interface ReopenRequestModalProps {
  open: boolean;
  onClose: () => void;
  assignment: AssignmentItem;
  onSubmit: (reason: string) => Promise<void>;
  loading?: boolean;
}

export const ReopenRequestModal: React.FC<ReopenRequestModalProps> = ({
  open,
  onClose,
  assignment,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation(["card", "button", "message"]);
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
      message.warning(t("message:assignments.reopenEmptyReasonWarning"));
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
              {t("card:assignments.modals.reopenTitle")}
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              {t("card:assignments.modals.reopenSubtitle")}
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
            <strong className="text-slate-800">{assignment.teacherName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {t("card:assignments.modals.recipientEmail")}
            </span>
            <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Icon name="mail" size={12} className="text-blue-600" />
              <span>{teacherEmail}</span>
            </span>
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
              {t("card:assignments.modals.expiredDeadline")}
            </span>
            <span className="text-rose-600 font-bold">{assignment.dueDate}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="assignment-reopen-reason"
              className="text-xs font-semibold text-slate-700 block mb-0"
            >
              {t("card:assignments.modals.messageToTeacherLabel")}{" "}
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
            id="assignment-reopen-reason"
            name="reopenReason"
            rows={4}
            maxLength={500}
            placeholder={t("card:assignments.modals.reopenPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0f0]">
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
              : t("button:sendRequestToTeacher")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
