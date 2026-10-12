import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { FileUploaderArea } from "@/modules/students/features/assignments/components/FileUploaderArea";
import type { SubmittedFile } from "@/modules/students/features/assignments/types";

interface AssignmentSubmitFormProps {
  files: SubmittedFile[];
  onFilesChange: (files: SubmittedFile[]) => void;
  onPreview: (file: SubmittedFile) => void;
  submissionContent: string;
  onContentChange: (val: string) => void;
  isResubmitting: boolean;
  onCancelResubmit: () => void;
  submitting: boolean;
  onSubmit: () => void;
  maxFilesCount?: number;
  maxFileSizeMb?: number;
}

export const AssignmentSubmitForm: React.FC<AssignmentSubmitFormProps> = ({
  files,
  onFilesChange,
  onPreview,
  submissionContent,
  onContentChange,
  isResubmitting,
  onCancelResubmit,
  submitting,
  onSubmit,
  maxFilesCount = 10,
  maxFileSizeMb = 100,
}) => {
  const { t } = useTranslation(["card", "button", "input"]);

  return (
    <div className="space-y-4">
      <FileUploaderArea
        files={files}
        onChange={onFilesChange}
        onPreview={onPreview}
        maxFiles={maxFilesCount}
        maxFileSizeMb={maxFileSizeMb}
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="assignment-submission-content"
            className="text-xs font-semibold text-slate-700 block mb-0"
          >
            {t("input:assignments.submissionNoteLabel")}
          </label>
          <span className="text-[11px] text-slate-400">
            {t("card:assignments.modals.charCount", {
              count: submissionContent.length,
              max: 1000,
            })}
          </span>
        </div>
        <TextArea
          id="assignment-submission-content"
          name="submissionContent"
          rows={4}
          maxLength={1000}
          placeholder={t("input:assignments.submissionNotePlaceholder")}
          value={submissionContent}
          onChange={(e) => onContentChange(e.target.value)}
          style={{ resize: "none" }}
        />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {isResubmitting && (
            <Button
              variant="outline"
              onClick={onCancelResubmit}
              disabled={submitting}
            >
              {t("button:cancelResubmit")}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={submitting}
            className="px-5 font-semibold"
          >
            <Icon name="check" size={13} />
            {submitting
              ? t("button:submittingAssignment")
              : t("button:confirmSubmitAssignment")}
          </Button>
        </div>
      </div>
    </div>
  );
};
