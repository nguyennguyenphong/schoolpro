import React, { useState } from "react";
import { Modal, message } from "antd";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PdfViewerModal } from "@/components/pdf";
import type {
  AssignmentItem,
  AssignmentSubmission,
} from "@/modules/students/features/assignments/types";

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
      message.warning("Vui lòng nhập nội dung bài làm hoặc đính kèm tệp nộp bài!");
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
      message.success("Nộp bài tập thành công!");
      setSubmissionContent("");
      setSelectedFile(null);
    } catch {
      message.error("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại!");
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
        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
              {assignment.subjectName}
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Thang điểm {assignment.pointsPossible}
            </span>
            {assignment.status === "graded" && (
              <Tag color="success" className="m-0 font-bold text-xs">
                Đã chấm: {assignment.score}/{assignment.pointsPossible} điểm
              </Tag>
            )}
            {assignment.status === "submitted" && (
              <Tag color="processing" className="m-0 font-semibold text-xs">
                Đã nộp bài (Chờ chấm)
              </Tag>
            )}
            {assignment.status === "overdue" && (
              <Tag color="error" className="m-0 font-semibold text-xs">
                Quá hạn nộp
              </Tag>
            )}
            {assignment.status === "pending" && (
              <Tag color="warning" className="m-0 font-semibold text-xs">
                Chưa hoàn thành
              </Tag>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
            {assignment.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Giáo viên: <strong className="text-slate-700">{assignment.teacherName}</strong></span>
            <span>•</span>
            <span>Giao ngày: <strong className="text-slate-700">{assignment.assignedDate}</strong></span>
            <span>•</span>
            <span>Hạn chót: <strong className={assignment.status === "overdue" ? "text-rose-600 font-bold" : "text-slate-700"}>{assignment.dueDate}</strong></span>
          </div>
        </div>

        {/* Assignment Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nội dung yêu cầu đề bài
          </h4>
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            {assignment.description}
          </div>
        </div>

        {/* Attachments if any */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tài liệu & Tệp đính kèm ({assignment.attachments.length})
            </h4>
            <div className="space-y-1.5">
              {assignment.attachments.map((file, idx) => {
                const isPdf =
                  file.name.toLowerCase().endsWith(".pdf") ||
                  (file.url ? file.url.toLowerCase().endsWith(".pdf") : false);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isPdf) {
                        setPreviewPdf({
                          url: file.url || "/sample-notice.pdf",
                          name: file.name,
                          size: file.size,
                        });
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs transition-colors ${
                      isPdf
                        ? "hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer group"
                        : "hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isPdf
                            ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Icon name="file" size={14} />
                      </div>
                      <div className="min-w-0 truncate">
                        <span
                          className={`font-medium text-slate-800 truncate block ${
                            isPdf ? "group-hover:text-rose-700" : ""
                          }`}
                        >
                          {file.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{file.size}</span>
                          {isPdf && (
                            <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPdf && (
                        <Button
                          variant="outline"
                          className="text-xs h-7 px-2 shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPdf({
                              url: file.url || "/sample-notice.pdf",
                              name: file.name,
                              size: file.size,
                            });
                          }}
                        >
                          <Icon name="eye" size={12} className="mr-1" />
                          Xem trước
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="text-xs h-7 px-2 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          message.info(`Đang tải xuống: ${file.name}`);
                        }}
                      >
                        <Icon name="download" size={12} />
                        Tải về
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Graded Feedback Callout if graded */}
        {assignment.status === "graded" && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Icon name="check" size={14} className="text-emerald-600" />
                Kết quả đánh giá từ giáo viên
              </span>
              <span className="text-sm font-extrabold text-emerald-700">
                {assignment.score} / {assignment.pointsPossible} điểm
              </span>
            </div>
            {assignment.teacherFeedback && (
              <p className="text-xs text-emerald-950 italic mb-0 leading-relaxed">
                "{assignment.teacherFeedback}"
              </p>
            )}
          </div>
        )}

        {/* Existing Submission Details if submitted */}
        {assignment.submission && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-blue-900 font-bold">
              <span>Bài đã nộp:</span>
              <span className="text-slate-500 font-normal">Thời gian: {assignment.submission.submittedAt}</span>
            </div>
            {assignment.submission.fileName && (
              <div className="flex items-center justify-between gap-2 text-slate-700 pt-0.5">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <Icon name="file" size={13} className="text-blue-600 shrink-0" />
                  <span className="font-medium truncate">{assignment.submission.fileName}</span>
                </div>
                {(assignment.submission.fileName.toLowerCase().endsWith(".pdf") ||
                  (assignment.submission.fileUrl
                    ? assignment.submission.fileUrl.toLowerCase().endsWith(".pdf")
                    : false)) && (
                  <Button
                    variant="outline"
                    className="text-xs h-6 px-2 text-rose-600 border-rose-200 hover:bg-rose-50 shrink-0"
                    onClick={() => {
                      setPreviewPdf({
                        url: assignment.submission?.fileUrl || "/sample-notice.pdf",
                        name: assignment.submission?.fileName || "Bai_lam.pdf",
                        size: "Bài làm đã nộp",
                      });
                    }}
                  >
                    <Icon name="eye" size={11} className="mr-1" />
                    Xem trước PDF
                  </Button>
                )}
              </div>
            )}
            {assignment.submission.content && (
              <p className="text-slate-600 mb-0 italic">"{assignment.submission.content}"</p>
            )}
          </div>
        )}

        {/* Submission Form if pending or overdue */}
        {(assignment.status === "pending" || assignment.status === "overdue") && (
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nộp bài tập trực tuyến
            </h4>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">
                Ghi chú / Lời nhắn cho giáo viên:
              </label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú, câu trả lời trực tiếp hoặc mô tả tệp bài làm đính kèm..."
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <Icon name="upload" size={13} className="text-slate-500" />
                <span>{selectedFile ? "Đổi tệp khác" : "Chọn tệp đính kèm (PDF, DOCX, ZIP)"}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file.name);
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
              <Button variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Xác nhận nộp bài"}
              </Button>
            </div>
          </div>
        )}
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
