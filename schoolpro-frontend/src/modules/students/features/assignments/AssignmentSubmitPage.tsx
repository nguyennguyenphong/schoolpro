import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  FilePreviewModal,
  ReopenRequestModal,
  ScoreAppealModal,
  AssignmentDetailSkeleton,
} from "@/modules/students/features/assignments/components";
import {
  AssignmentSubmitHeader,
  AssignmentWorkflowCard,
  AssignmentContentTabsCard,
  AssignmentSubmissionWorkspaceCard,
  AssignmentSubmitSidebar,
} from "@/modules/students/features/assignments/components/submit";
import { PdfViewerModal } from "@/components/pdf";
import {
  useAssignmentPreview,
  useAssignmentDetail,
  useAssignmentActions,
  useAssignmentSubmission,
} from "@/modules/students/features/assignments/hooks";
import { getTeacherEmail } from "@/modules/students/features/assignments/utils/assignmentFormatters";
import { getAssignmentStatus } from "@/modules/students/features/assignments/utils/assignmentStatus";

export const AssignmentSubmitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button", "message"]);

  const {
    previewFile,
    previewOpen,
    previewPdf,
    handlePreview,
    handleClosePreview,
    setPreviewPdf,
  } = useAssignmentPreview();

  const {
    assignment,
    summary,
    loading,
    setAssignment,
  } = useAssignmentDetail(id);

  const {
    reopenModalOpen,
    setReopenModalOpen,
    requestingReopen,
    handleRequestReopen,
    appealModalOpen,
    setAppealModalOpen,
    submittingAppeal,
    handleAppealScore,
  } = useAssignmentActions({
    assignment,
    setAssignment,
  });

  const {
    submissionContent,
    setSubmissionContent,
    files,
    setFiles,
    submitting,
    isResubmitting,
    setIsResubmitting,
    handleSubmit,
  } = useAssignmentSubmission({
    assignment,
    setAssignment,
  });

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

  const status = getAssignmentStatus(
    assignment,
    isResubmitting,
  );

  const {
    isPastDue,
    hasSubmission,
    isOverdue,
    isSubmitted,
    isGraded,
    isSubmittedAndExpired,
    showForm,
  } = status;

  const teacherEmail = getTeacherEmail(assignment);

  const typeLabel = (() => {
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
  })();

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8">
      {/* 1. Page Header (matching LeaveRequestDetailHeader) */}
      <AssignmentSubmitHeader
        assignment={assignment}
        isPastDue={isPastDue}
        typeLabel={typeLabel}
        onBack={() => navigate("/student/assignments")}
      />

      {/* 2. Workflow Steps Card (matching LeaveRequestWorkflowCard) */}
      <AssignmentWorkflowCard assignment={assignment} isPastDue={isPastDue} />

      {/* 3. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 spans): Tabbed Assignment Content + Submission Workspace */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <AssignmentContentTabsCard
            assignment={assignment}
            isGraded={isGraded}
            onPreviewPdf={setPreviewPdf}
            onRequestAppeal={() => setAppealModalOpen(true)}
          />

          <AssignmentSubmissionWorkspaceCard
            assignment={assignment}
            files={files}
            onFilesChange={setFiles}
            onPreview={handlePreview}
            submissionContent={submissionContent}
            onContentChange={setSubmissionContent}
            isResubmitting={isResubmitting}
            onStartResubmit={() => setIsResubmitting(true)}
            onCancelResubmit={() => setIsResubmitting(false)}
            submitting={submitting}
            onSubmit={handleSubmit}
            onRequestReopen={() => setReopenModalOpen(true)}
            hasSubmission={hasSubmission}
            isOverdue={isOverdue}
            isSubmitted={isSubmitted}
            isGraded={isGraded}
            isSubmittedAndExpired={isSubmittedAndExpired}
            showForm={showForm}
          />
        </div>

        {/* Right Column: Tabbed Deadlines/Academic Info + Tabbed Notes/Guidelines */}
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
