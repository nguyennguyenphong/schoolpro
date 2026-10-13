import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

import { isDueDatePassed } from "@/modules/students/features/assignments/utils/fileUtils";

interface AssignmentModalSubmitFormProps {
  assignment: AssignmentItem;
  submissionContent: string;
  selectedFile: string | null;
  submitting: boolean;
  onContentChange: (val: string) => void;
  onFileSelect: (fileName: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AssignmentModalSubmitForm: React.FC<AssignmentModalSubmitFormProps> = ({
  assignment,
  submissionContent,
  selectedFile,
  submitting,
  onContentChange,
  onFileSelect,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation(["card", "button", "input"]);

  const isExpired =
    isDueDatePassed(assignment.dueDate) &&
    assignment.reopenRequest?.status !== "approved";

  if (assignment.status !== "pending" || isExpired) {
    return null;
  }

  return (
    <div className="border-t border-slate-100 pt-3 space-y-3">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
        {t("card:assignments.detail.submissionAreaTitle")}
      </h4>

      <div>
        <label
          htmlFor="modal-submission-content"
          className="text-xs text-slate-600 font-medium block mb-1"
        >
          {t("input:assignments.submissionNoteLabel")}
        </label>
        <textarea
          id="modal-submission-content"
          name="modalSubmissionContent"
          rows={3}
          placeholder={t("input:assignments.submissionNotePlaceholder")}
          value={submissionContent}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full p-2.5 text-xs border border-[#f0f0f0] rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor="modal-submission-file"
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-[#f0f0f0] px-3 py-1.5 rounded-lg transition-colors"
        >
          <Icon name="upload" size={13} className="text-slate-500" />
          <span>{t("input:assignments.uploadFilesLabel")}</span>
          <input
            id="modal-submission-file"
            name="modalSubmissionFile"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileSelect(file.name);
              }
            }}
          />
        </label>

        {selectedFile && (
          <span className="text-xs text-blue-600 font-medium truncate flex items-center gap-1">
            <Icon name="check" size={12} />
            <span>{selectedFile}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          {t("button:cancel")}
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={submitting}>
          {submitting
            ? t("button:submittingAssignment")
            : t("button:confirmSubmitAssignment")}
        </Button>
      </div>
    </div>
  );
};
