import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  AssignmentDetailSkeleton,
} from "@/modules/students/features/assignments/components";
import {
  AssignmentSubmitHeader,
  AssignmentRequirementsCard,
  AssignmentTeacherAttachments,
  AssignmentGradedFeedbackCard,
  AssignmentSubmissionView,
  AssignmentOverdueCard,
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
      message.warning("Vui lòng đính kèm ít nhất 1 tệp bài làm hoặc nhập nội dung trả lời!");
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

      const updated = await assignmentsService.submitAssignment(assignment.id, submission);
      setAssignment(updated);
      setIsResubmitting(false);
      message.success("Nộp bài tập trực tuyến thành công!");
    } catch {
      message.error("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReopen = async (reason: string) => {
    if (!assignment) return;
    try {
      setRequestingReopen(true);
      const updated = await assignmentsService.requestReopenAssignment(assignment.id, reason);
      setAssignment(updated);
      setReopenModalOpen(false);
      message.success(
        `Đã gửi email yêu cầu mở lại cổng nộp bài đến giáo viên ${assignment.teacherName} (${updated.reopenRequest?.teacherEmail || assignment.teacherEmail}) thành công!`,
      );
    } catch {
      message.error("Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau!");
    } finally {
      setRequestingReopen(false);
    }
  };

  if (loading) {
    return <AssignmentDetailSkeleton />;
  }

  if (!assignment) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="file" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Không tìm thấy bài tập
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Bài tập này không tồn tại hoặc đã được chuyển khỏi hệ thống.
        </p>
        <Button variant="primary" onClick={() => navigate("/student/assignments")}>
          Quay lại danh sách bài tập
        </Button>
      </div>
    );
  }

  const isPastDue = isDueDatePassed(assignment.dueDate);
  const isPending = assignment.status === "pending" && !isPastDue;
  const hasSubmission = Boolean(assignment.submission);
  const isOverdue = assignment.status === "overdue" || (isPastDue && !hasSubmission);
  const isSubmitted = assignment.status === "submitted";
  const isGraded = assignment.status === "graded";

  // Môn đã nộp bài rồi và hết hạn nộp thì đóng:
  const isSubmittedAndExpired = (hasSubmission || isGraded) && isPastDue;

  // Show upload form only when pending within deadline OR user clicked resubmit within deadline
  const showForm = (isPending && !hasSubmission) || (isResubmitting && !isSubmittedAndExpired);

  const teacherEmail =
    assignment.teacherEmail ||
    `${assignment.teacherName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")}@schoolpro.edu.vn`;

  const getTypeLabel = () => {
    switch (assignment.type) {
      case "quiz":
        return "Trắc nghiệm trực tuyến";
      case "project":
        return "Báo cáo / Dự án";
      case "essay":
        return "Bài viết / Tự luận";
      case "homework":
      default:
        return "Bài tập về nhà";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with Breadcrumb & Details */}
      <AssignmentSubmitHeader
        assignment={assignment}
        isPastDue={isPastDue}
        typeLabel={getTypeLabel()}
        onBack={() => navigate("/student/assignments")}
      />

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column (2 spans): Requirements, Attachments, Feedback & Submission Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <AssignmentRequirementsCard description={assignment.description} />

          <AssignmentTeacherAttachments
            attachments={assignment.attachments}
            onPreviewPdf={setPreviewPdf}
          />

          <AssignmentGradedFeedbackCard assignment={assignment} />

          {/* Submission Container Card */}
          <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
                <h3 className="text-base font-bold text-slate-900 mb-0">
                  Khu vực Nộp bài trực tuyến
                </h3>
              </div>
              <div>
                {isSubmittedAndExpired ? (
                  <Tag color="default">Đã nộp (Đã đóng)</Tag>
                ) : isGraded ? (
                  <Tag color="success">Đã chấm điểm</Tag>
                ) : isSubmitted ? (
                  <Tag color="processing">Đã nộp bài</Tag>
                ) : isOverdue ? (
                  <Tag color="error">Quá hạn nộp</Tag>
                ) : (
                  <Tag color="warning">Chưa nộp bài</Tag>
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
              />
            )}
          </div>
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
