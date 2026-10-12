import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type {
  AssignmentItem,
  AssignmentSubmission,
  AssignmentSummary,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";
import { assignmentsService } from "@/modules/students/features/assignments/services";
import {
  FilePreviewModal,
  ReopenRequestModal,
  ScoreAppealModal,
  AssignmentDetailSkeleton,
} from "@/modules/students/features/assignments/components";
import {
  AssignmentSubmitHeader,
  AssignmentRequirementsCard,
  AssignmentTeacherAttachments,
  AssignmentRubricCard,
  AssignmentGradedFeedbackCard,
  AssignmentSubmissionView,
  AssignmentOverdueCard,
  AssignmentOverdueLog,
  AssignmentSubmitForm,
  AssignmentSubmitSidebar,
} from "@/modules/students/features/assignments/components/submit";
import { PdfViewerModal } from "@/components/pdf";
import {
  detectFileType,
  isDueDatePassed,
} from "@/modules/students/features/assignments/utils/fileUtils";

export const AssignmentSubmitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button", "message"]);

  const [assignment, setAssignment] = useState<AssignmentItem | null>(null);
  const [summary, setSummary] = useState<AssignmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [files, setFiles] = useState<SubmittedFile[]>([]);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // File Preview Modal state
  const [previewFile, setPreviewFile] = useState<SubmittedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Dedicated PDF Viewer Modal state
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    name: string;
    size: string;
  } | null>(null);

  // Reopen Request Modal state
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [requestingReopen, setRequestingReopen] = useState(false);

  // Score Appeal Modal state
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const [item, sum] = await Promise.all([
          assignmentsService.getAssignmentById(id),
          assignmentsService.getSummary(),
        ]);
        if (!ignore) {
          setAssignment(item);
          setSummary(sum);
          if (item?.submission) {
            setSubmissionContent(item.submission.content || "");
            if (item.submission.files && item.submission.files.length > 0) {
              setFiles(item.submission.files);
            } else if (item.submission.fileName) {
              setFiles([
                {
                  id: "f-legacy",
                  name: item.submission.fileName,
                  size: "1.5 MB",
                  type: detectFileType(item.submission.fileName),
                  url: item.submission.fileUrl,
                  uploadedAt: item.submission.submittedAt,
                },
              ]);
            }
          }
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handlePreview = (file: SubmittedFile) => {
    const isPdf =
      file.type === "pdf" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      (file.url ? file.url.toLowerCase().endsWith(".pdf") : false);

    if (isPdf) {
      setPreviewPdf({
        url: file.previewUrl || file.url || "/sample-notice.pdf",
        name: file.name,
        size: file.size,
      });
    } else {
      setPreviewFile(file);
      setPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    if (!submissionContent.trim() && files.length === 0) {
      message.warning(t("message:assignments.emptySubmissionWarning"));
      return;
    }

    try {
      setSubmitting(true);
      const submission: AssignmentSubmission = {
        submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        content: submissionContent.trim(),
        fileName: files[0]?.name || "Bai_lam_nop.docx",
        fileUrl: files[0]?.url || "#",
        files: files,
      };

      const updated = await assignmentsService.submitAssignment(
        assignment.id,
        submission,
      );
      setAssignment(updated);
      setIsResubmitting(false);
      message.success(t("message:assignments.submitSuccess"));
    } catch {
      message.error(t("message:assignments.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReopen = async (reason: string) => {
    if (!assignment) return;
    try {
      setRequestingReopen(true);
      const updated = await assignmentsService.requestReopenAssignment(
        assignment.id,
        reason,
      );
      setAssignment(updated);
      setReopenModalOpen(false);
      message.success(
        t("message:assignments.reopenSuccess", {
          teacher: assignment.teacherName,
          email:
            updated.reopenRequest?.teacherEmail ||
            assignment.teacherEmail ||
            "",
        }),
      );
    } catch {
      message.error(t("message:assignments.reopenError"));
    } finally {
      setRequestingReopen(false);
    }
  };

  const handleAppealScore = async (reason: string) => {
    if (!assignment) return;
    try {
      setSubmittingAppeal(true);
      const updated = await assignmentsService.appealAssignment(
        assignment.id,
        reason,
      );
      setAssignment(updated);
      setAppealModalOpen(false);
      message.success(t("message:assignments.appealSuccess"));
    } catch {
      message.error(t("message:assignments.appealError"));
    } finally {
      setSubmittingAppeal(false);
    }
  };

  if (loading) {
    return <AssignmentDetailSkeleton />;
  }

  if (!assignment) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="file" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t("card:assignments.detail.notFoundTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {t("card:assignments.detail.notFoundDesc")}
        </p>
        <Button variant="primary" onClick={() => navigate("/student/assignments")}>
          {t("button:backToAssignments")}
        </Button>
      </div>
    );
  }

  const isPastDue = isDueDatePassed(assignment.dueDate);
  const canLateSubmit = isPastDue && Boolean(assignment.allowLateSubmission);
  const isPending =
    (assignment.status === "pending" && !isPastDue) ||
    (!assignment.submission && canLateSubmit);
  const hasSubmission = Boolean(assignment.submission);
  const isOverdue =
    (assignment.status === "overdue" || (isPastDue && !hasSubmission)) &&
    !canLateSubmit;
  const isSubmitted = assignment.status === "submitted";
  const isGraded = assignment.status === "graded";

  const isSubmittedAndExpired =
    (hasSubmission || isGraded) && isPastDue && !canLateSubmit;

  const showForm =
    (isPending && !hasSubmission) || (isResubmitting && !isSubmittedAndExpired);

  const teacherEmail =
    assignment.teacherEmail ||
    `${assignment.teacherName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")}@schoolpro.edu.vn`;

  const getTypeLabel = (): string => {
    switch (assignment.type) {
      case "quiz":
        return t("card:assignments.typeLabels.quiz");
      case "project":
        return t("card:assignments.typeLabels.project");
      case "essay":
        return t("card:assignments.typeLabels.essay");
      case "homework":
      default:
        return t("card:assignments.typeLabels.homework");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with Breadcrumb & Workflow Steps */}
      <AssignmentSubmitHeader
        assignment={assignment}
        isPastDue={isPastDue}
        typeLabel={getTypeLabel()}
        onBack={() => navigate("/student/assignments")}
      />

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column (2 spans): Requirements, Attachments, Rubric, Feedback & Submission Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <AssignmentRequirementsCard
            description={assignment.description}
            originalDueDate={assignment.originalDueDate}
            extensions={assignment.extensions}
          />

          <AssignmentTeacherAttachments
            attachments={assignment.attachments}
            onPreviewPdf={setPreviewPdf}
          />

          <AssignmentRubricCard
            rubric={assignment.rubric}
            solutionAttachments={assignment.solutionAttachments}
            isGraded={isGraded}
            onPreviewPdf={setPreviewPdf}
          />

          <AssignmentGradedFeedbackCard
            assignment={assignment}
            onRequestAppeal={() => setAppealModalOpen(true)}
          />

          {/* Submission Container Card */}
          <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
                <h3 className="text-base font-bold text-slate-900 mb-0">
                  {t("card:assignments.detail.submissionAreaTitle")}
                </h3>
              </div>
              <div>
                {isSubmittedAndExpired ? (
                  <Tag color="default">
                    {t("card:assignments.statusLabels.submittedClosed")}
                  </Tag>
                ) : isGraded ? (
                  <Tag color="success">
                    {t("card:assignments.statusLabels.graded")}
                  </Tag>
                ) : isSubmitted ? (
                  <Tag color="processing">
                    {t("card:assignments.statusLabels.submitted")}
                  </Tag>
                ) : isOverdue ? (
                  <Tag color="error">
                    {t("card:assignments.statusLabels.overdue")}
                  </Tag>
                ) : (
                  <Tag color="warning">
                    {t("card:assignments.statusLabels.notSubmitted")}
                  </Tag>
                )}
              </div>
            </div>

            {hasSubmission && !isResubmitting && (
              <AssignmentSubmissionView
                assignment={assignment}
                files={files}
                isSubmittedAndExpired={isSubmittedAndExpired}
                isGraded={isGraded}
                onPreview={handlePreview}
                onRequestReopen={() => setReopenModalOpen(true)}
                onStartResubmit={() => setIsResubmitting(true)}
              />
            )}

            {!hasSubmission && isOverdue && (
              <AssignmentOverdueCard
                assignment={assignment}
                onRequestReopen={() => setReopenModalOpen(true)}
              />
            )}

            {showForm && (
              <AssignmentSubmitForm
                files={files}
                onFilesChange={setFiles}
                onPreview={handlePreview}
                submissionContent={submissionContent}
                onContentChange={setSubmissionContent}
                isResubmitting={isResubmitting}
                onCancelResubmit={() => setIsResubmitting(false)}
                submitting={submitting}
                onSubmit={handleSubmit}
                maxFilesCount={assignment.maxFilesCount}
                maxFileSizeMb={assignment.maxFileSizeMb}
              />
            )}
          </div>

          {/* Standalone Event Timeline Log Card */}
          <AssignmentOverdueLog assignment={assignment} />
        </div>

        {/* Right Column: Deadlines, Guidelines & Academic Info */}
        <AssignmentSubmitSidebar
          assignment={assignment}
          summary={summary}
          isPastDue={isPastDue}
          isSubmittedAndExpired={isSubmittedAndExpired}
          isGraded={isGraded}
          isSubmitted={isSubmitted}
          isOverdue={isOverdue}
          teacherEmail={teacherEmail}
        />
      </div>

      {/* Global Modals */}
      <FilePreviewModal
        open={previewOpen}
        file={previewFile}
        onClose={handleClosePreview}
      />

      <ReopenRequestModal
        open={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        assignment={assignment}
        onSubmit={handleRequestReopen}
        loading={requestingReopen}
      />

      <ScoreAppealModal
        open={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        assignment={assignment}
        onSubmit={handleAppealScore}
        loading={submittingAppeal}
      />

      {previewPdf && (
        <PdfViewerModal
          isOpen={Boolean(previewPdf)}
          onClose={() => setPreviewPdf(null)}
          fileUrl={previewPdf.url}
          fileName={previewPdf.name}
          fileSize={previewPdf.size}
        />
      )}
    </div>
  );
};
