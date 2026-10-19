import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import { Modal } from "@/components/ui/Modal";
import { PdfViewerModal } from "@/components/pdf";
import type {
  AssignmentItem,
  AssignmentSubmission,
} from "@/modules/students/features/assignments/types";
import {
  AssignmentModalHeader,
  AssignmentModalAttachments,
  AssignmentModalFeedback,
  AssignmentModalSubmission,
  AssignmentModalSubmitForm,
} from "@/modules/students/features/assignments/components/detail-modal";

interface AssignmentDetailModalProps {
  assignment: AssignmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, submission: AssignmentSubmission) => Promise<void>;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation(["card", "message"]);
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    name: string;
    size: string;
  } | null>(null);

  if (!assignment) return null;

  const handleSubmit = async () => {
    if (!submissionContent.trim() && !selectedFile) {
      message.warning(t("message:assignments.emptySubmissionWarning"));
      return;
    }

    try {
      setSubmitting(true);
      const submission: AssignmentSubmission = {
        submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        content: submissionContent.trim(),
        fileName: selectedFile || "Bai_lam_nop.pdf",
      };

      await onSubmit(assignment.id, submission);
      message.success(t("message:assignments.submitSuccess"));
      setSubmissionContent("");
      setSelectedFile(null);
    } catch {
      message.error(t("message:assignments.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={620}
      centered
    >
      <div className="pt-2 space-y-4">
        {/* 1. Modal Header */}
        <AssignmentModalHeader assignment={assignment} />

        {/* 2. Assignment Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {t("card:assignments.detail.requirementsTitle")}
          </h4>
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-[#f0f0f0]/80 text-xs text-slate-700 leading-relaxed">
            {assignment.description}
          </div>
        </div>

        {/* 3. Attachments if any */}
        <AssignmentModalAttachments
          attachments={assignment.attachments}
          onPreviewPdf={setPreviewPdf}
        />

        {/* 4. Graded Feedback Callout if graded */}
        <AssignmentModalFeedback assignment={assignment} />

        {/* 5. Existing Submission Details if submitted */}
        <AssignmentModalSubmission
          submission={assignment.submission}
          onPreviewPdf={setPreviewPdf}
        />

        {/* 6. Submission Form if pending or overdue */}
        <AssignmentModalSubmitForm
          assignment={assignment}
          submissionContent={submissionContent}
          selectedFile={selectedFile}
          submitting={submitting}
          onContentChange={setSubmissionContent}
          onFileSelect={setSelectedFile}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>

      {/* PDF Viewer Modal */}
      {previewPdf && (
        <PdfViewerModal
          isOpen={Boolean(previewPdf)}
          onClose={() => setPreviewPdf(null)}
          fileUrl={previewPdf.url}
          fileName={previewPdf.name}
          fileSize={previewPdf.size}
        />
      )}
    </Modal>
  );
};
