import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentSubmission } from "@/modules/students/features/assignments/types";

interface AssignmentModalSubmissionProps {
  submission?: AssignmentSubmission | null;
  onPreviewPdf: (pdf: { url: string; name: string; size: string }) => void;
}

export const AssignmentModalSubmission: React.FC<AssignmentModalSubmissionProps> = ({
  submission,
  onPreviewPdf,
}) => {
  const { t } = useTranslation(["card", "button"]);

  if (!submission) return null;

  const isPdf = Boolean(
    submission.fileName?.toLowerCase().endsWith(".pdf") ||
      (submission.fileUrl ? submission.fileUrl.toLowerCase().endsWith(".pdf") : false)
  );

  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-blue-900 font-bold">
        <span>{t("card:assignments.detail.submittedHeading")}</span>
        <span className="text-slate-500 font-normal">
          {t("card:assignments.detail.submittedAtLabel", {
            time: submission.submittedAt,
          })}
        </span>
      </div>

      {submission.fileName && (
        <div className="flex items-center justify-between gap-2 text-slate-700 pt-0.5">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Icon name="file" size={13} className="text-blue-600 shrink-0" />
            <span className="font-medium truncate">{submission.fileName}</span>
          </div>

          {isPdf && (
            <Button
              variant="outline"
              className="text-xs h-6 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 shrink-0"
              onClick={() => {
                onPreviewPdf({
                  url: submission.fileUrl || "/sample-notice.pdf",
                  name: submission.fileName || "Bai_lam.pdf",
                  size: t("card:assignments.detail.submittedFileTag"),
                });
              }}
            >
              <Icon name="eye" size={11} className="mr-1" />
              <span>{t("button:preview")}</span>
            </Button>
          )}
        </div>
      )}

      {submission.content && (
        <p className="text-slate-600 mb-0 italic">"{submission.content}"</p>
      )}
    </div>
  );
};
