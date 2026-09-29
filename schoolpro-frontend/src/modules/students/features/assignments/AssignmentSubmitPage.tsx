import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type {
  AssignmentItem,
  AssignmentSubmission,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";
import { assignmentsService } from "@/modules/students/features/assignments/services";
import {
  FileUploaderArea,
  FileItemCard,
  FilePreviewModal,
  ReopenRequestModal,
} from "@/modules/students/features/assignments/components";
import {
  detectFileType,
  isDueDatePassed,
} from "@/modules/students/features/assignments/utils/fileUtils";

export const AssignmentSubmitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<AssignmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [files, setFiles] = useState<SubmittedFile[]>([]);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // File Preview Modal state
  const [previewFile, setPreviewFile] = useState<SubmittedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Reopen Request Modal state
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [requestingReopen, setRequestingReopen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const item = await assignmentsService.getAssignmentById(id);
        if (!ignore) {
          setAssignment(item);
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
    setPreviewFile(file);
    setPreviewOpen(true);
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
    return (
      <div className="space-y-4 sm:space-y-5 pb-8 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-slate-200 p-5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-white rounded-xl border border-slate-200" />
            <div className="h-64 bg-white rounded-xl border border-slate-200" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-72 bg-white rounded-xl border border-slate-200" />
          </div>
        </div>
      </div>
    );
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

  // Show upload form only when:
  // 1. Pending assignment within deadline, OR
  // 2. User clicked "Nộp lại bài làm" AND it's NOT expired
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
      {/* 1. Page Header with Breadcrumb & Back Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              href: "/student/assignments",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="edit" size={13} className="text-slate-400 shrink-0" />
                  <span>Bài tập & Nhiệm vụ</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <span>Chi tiết & Nộp bài</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                {assignment.title}
              </h1>
              <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                {assignment.subjectName}
              </span>
              <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                {getTypeLabel()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                Giáo viên: <strong className="text-slate-700">{assignment.teacherName}</strong>
              </span>
              <span>•</span>
              <span>
                Ngày giao: <strong className="text-slate-700">{assignment.assignedDate}</strong>
              </span>
              <span>•</span>
              <span>
                Hạn chót:{" "}
                <strong className={isPastDue ? "text-rose-600 font-bold" : "text-slate-700"}>
                  {assignment.dueDate}
                </strong>
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/student/assignments")}
            className="shrink-0 self-start sm:self-auto"
          >
            <Icon name="arrow-left" size={13} />
            Danh sách bài tập
          </Button>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column: Requirements, Attachments, Teacher Graded Card & Submission Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Card: Assignment Details & Requirements */}
          <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h3 className="text-base font-bold text-slate-900 mb-0">
                Nội dung yêu cầu đề bài
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-0">
              {assignment.description}
            </p>
          </div>

          {/* Card: Teacher Attachments (if any) */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                  <h3 className="text-base font-bold text-slate-900 mb-0">
                    Tài liệu & Đề bài đính kèm của giáo viên
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {assignment.attachments.length} tệp
                </span>
              </div>

              <div className="space-y-2">
                {assignment.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs hover:border-blue-400 hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name="file" size={16} />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-400">{file.size}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="shrink-0 ml-2"
                      onClick={() => message.info(`Đang tải tệp: ${file.name}`)}
                    >
                      <Icon name="download" size={12} />
                      Tải về
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card: Teacher Feedback & Grading (when graded) */}
          {isGraded && (
            <div className="p-5 border border-emerald-200 bg-emerald-50/50 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
                  <h3 className="text-base font-bold text-emerald-950 mb-0">
                    Kết quả chấm điểm & Lời nhận xét
                  </h3>
                </div>
                <Tag color="success" className="m-0 text-xs font-bold px-2.5 py-0.5">
                  Điểm số: {assignment.score} / {assignment.pointsPossible}
                </Tag>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>
                    Giáo viên chấm: <strong className="text-slate-800">{assignment.teacherName}</strong>
                  </span>
                  <span>
                    Thang điểm: <strong>10.0</strong>
                  </span>
                </div>
                {assignment.teacherFeedback && (
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 text-slate-800 italic leading-relaxed">
                    "{assignment.teacherFeedback}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card: Submission Area */}
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

            {/* CASE 1: Assignment has been submitted */}
            {hasSubmission && !isResubmitting && (
              <div className="space-y-3.5">
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-blue-900 font-bold border-b border-blue-200/70 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Icon name="check" size={14} className="text-emerald-600 shrink-0" />
                      <span>Bài tập đã được gửi lên hệ thống thành công</span>
                    </span>
                    <span className="text-slate-500 font-normal text-[11px]">
                      Thời gian nộp: {assignment.submission?.submittedAt}
                    </span>
                  </div>

                  {/* List of submitted files */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Tệp bài làm đã nộp ({files.length} tệp):
                    </span>
                    <div className="space-y-2">
                      {files.map((file) => (
                        <FileItemCard
                          key={file.id}
                          file={file}
                          readOnly
                          onPreview={handlePreview}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submission note if any */}
                  {assignment.submission?.content && (
                    <div className="pt-1">
                      <span className="text-slate-500 block mb-1 font-medium">
                        Lời nhắn / Ghi chú gửi giáo viên:
                      </span>
                      <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-slate-200 mb-0 leading-relaxed">
                        "{assignment.submission.content}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Sub-case 1A: Submission is EXPIRED -> Port CLOSED + Reopen Request Button */}
                {isSubmittedAndExpired && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                          <Icon name="lock" size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">Cổng nộp bài đã đóng</span>
                            <Tag color="default">Hết hạn nộp</Tag>
                          </div>
                          <span className="text-xs text-slate-500">
                            Hạn chót ({assignment.dueDate}) đã kết thúc. Học sinh không thể tự nộp lại bài làm.
                          </span>
                        </div>
                      </div>

                      {/* Reopen Request Button */}
                      <Button
                        variant="outline"
                        onClick={() => setReopenModalOpen(true)}
                        className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 self-start sm:self-auto"
                      >
                        <Icon name="mail" size={13} className="mr-1.5 text-blue-600" />
                        <span>
                          {assignment.reopenRequest
                            ? "Gửi lại yêu cầu mở cổng"
                            : "Yêu cầu mở lại nộp bài"}
                        </span>
                      </Button>
                    </div>

                    {/* Display existing reopen request details if already requested */}
                    {assignment.reopenRequest && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span className="flex items-center gap-1.5">
                            <Icon name="clock" size={13} className="text-amber-600" />
                            <span>Đã gửi yêu cầu mở lại cổng nộp bài</span>
                          </span>
                          <Tag color="warning">Đang chờ giáo viên phản hồi</Tag>
                        </div>
                        <p className="text-slate-600 mb-0">
                          Gửi đến email giáo viên:{" "}
                          <strong className="text-blue-700">
                            {assignment.reopenRequest.teacherEmail}
                          </strong>{" "}
                          • Thời gian gửi:{" "}
                          <span className="text-slate-700 font-medium">
                            {assignment.reopenRequest.requestedAt}
                          </span>
                        </p>
                        <div className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic">
                          "{assignment.reopenRequest.reason}"
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-case 1B: Still within deadline & not graded -> Allows Re-submitting */}
                {!isSubmittedAndExpired && !isGraded && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 italic">
                      * Thời hạn nộp bài vẫn còn hiệu lực đến {assignment.dueDate}. Bạn có thể nộp lại bản sửa đổi nếu cần.
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setIsResubmitting(true)}
                      className="self-end sm:self-auto"
                    >
                      <Icon name="refresh" size={12} />
                      Nộp lại bài làm
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* CASE 2: Assignment is OVERDUE and was NEVER submitted */}
            {!hasSubmission && isOverdue && (
              <div className="p-4 sm:p-5 border border-rose-200 bg-rose-50/40 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Icon name="lock" size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-rose-950 text-sm block">Cổng nộp bài đã khóa</span>
                      <span className="text-xs text-rose-700">
                        Thời hạn nộp bài tập đã kết thúc vào ngày <strong>{assignment.dueDate}</strong>.
                      </span>
                    </div>
                  </div>
                  <Tag color="error">Quá hạn nộp bài</Tag>
                </div>

                <p className="text-xs text-slate-600 mb-0 leading-relaxed">
                  Cổng nộp bài trực tuyến đã tự động khóa. Nếu bạn có lý do chính đáng cần nộp bù, 
                  vui lòng nhấn nút dưới đây để gửi thông điệp yêu cầu mở lại đến hòm thư email của giáo viên phụ trách.
                </p>

                {/* Reopen Request Info if already submitted */}
                {assignment.reopenRequest && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Icon name="clock" size={13} className="text-amber-600" />
                        <span>Đã gửi yêu cầu mở lại cổng nộp bài</span>
                      </span>
                      <Tag color="warning">Đang chờ giáo viên duyệt</Tag>
                    </div>
                    <p className="text-slate-600 mb-0">
                      Gửi đến: <strong className="text-blue-700">{assignment.reopenRequest.teacherEmail}</strong> lúc {assignment.reopenRequest.requestedAt}
                    </p>
                    <div className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic">
                      "{assignment.reopenRequest.reason}"
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end pt-1">
                  <Button
                    variant="primary"
                    onClick={() => setReopenModalOpen(true)}
                  >
                    <Icon name="mail" size={13} className="mr-1.5" />
                    {assignment.reopenRequest ? "Gửi lại yêu cầu mở cổng" : "Yêu cầu mở lại nộp bài"}
                  </Button>
                </div>
              </div>
            )}

            {/* CASE 3: Active Submission Form (Pending or Re-submitting within deadline) */}
            {showForm && (
              <div className="space-y-4">
                {/* File Uploader supporting Word, Excel, Video, Audio, PDF, Image */}
                <FileUploaderArea
                  files={files}
                  onChange={setFiles}
                  onPreview={handlePreview}
                />

                {/* Accompanying Teacher Note / Text Answer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 block mb-0">
                      Ghi chú / Trả lời trực tiếp cho giáo viên:
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {submissionContent.length}/1000 ký tự
                    </span>
                  </div>
                  <TextArea
                    rows={4}
                    maxLength={1000}
                    placeholder="Nhập ghi chú tóm tắt bài làm, giải trình số liệu, phân công nhóm hoặc câu trả lời tự luận trực tiếp..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    style={{ resize: "none" }}
                  />
                </div>

                {/* Submit Confirmation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    {isResubmitting && (
                      <Button
                        variant="outline"
                        onClick={() => setIsResubmitting(false)}
                        disabled={submitting}
                      >
                        Hủy nộp lại
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-5 font-semibold"
                    >
                      <Icon name="check" size={13} />
                      {submitting ? "Đang gửi bài..." : "Xác nhận nộp bài"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines, Guidelines & Format Specifications */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          {/* Card: Deadline & Status */}
          <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
              <h3 className="text-sm font-bold text-slate-900 mb-0">
                Thời hạn & Trạng thái
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                {isSubmittedAndExpired ? (
                  <Tag color="default">Đã nộp (Đã đóng)</Tag>
                ) : isGraded ? (
                  <Tag color="success">Đã chấm điểm</Tag>
                ) : isSubmitted ? (
                  <Tag color="processing">Đã nộp bài</Tag>
                ) : isOverdue ? (
                  <Tag color="error">Quá hạn nộp</Tag>
                ) : (
                  <Tag color="warning">Chưa nộp</Tag>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hạn chót:</span>
                <strong className={isPastDue ? "text-rose-600 font-bold" : "text-slate-800"}>
                  {assignment.dueDate}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tình trạng cổng:</span>
                {isPastDue ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <Icon name="lock" size={12} />
                    <span>Đã đóng cổng</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Icon name="check" size={12} />
                    <span>Đang mở nộp bài</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thang điểm tối đa:</span>
                <strong className="text-slate-800">{assignment.pointsPossible} điểm</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hình thức nộp:</span>
                <strong className="text-blue-600">Trực tuyến (SchoolPro)</strong>
              </div>
            </div>
          </div>

          {/* Card: Academic Information */}
          <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h3 className="text-sm font-bold text-slate-900 mb-0">
                Thông tin học vụ
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Môn học:</span>
                <strong className="text-slate-800">
                  {assignment.subjectName} ({assignment.subjectCode})
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lớp học:</span>
                <strong className="text-slate-800">11A1</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Giáo viên phụ trách:</span>
                <strong className="text-slate-800">{assignment.teacherName}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email giáo viên:</span>
                <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Icon name="mail" size={11} className="text-blue-600" />
                  <span className="truncate max-w-[150px]">{teacherEmail}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Học kỳ:</span>
                <strong className="text-slate-800">HK1 (2025-2026)</strong>
              </div>
            </div>
          </div>

          {/* Card: Format Specifications */}
          <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h3 className="text-sm font-bold text-slate-900 mb-0">
                Quy chuẩn định dạng tệp nộp bài
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Hệ thống chấp nhận đầy đủ 6 định dạng tiêu chuẩn cho học sinh:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/70 border border-blue-200">
                <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="file-text" size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-blue-900 block truncate">Word (.docx, .doc)</span>
                  <span className="text-[11px] text-blue-700">Bài viết luận, báo cáo thu hoạch</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="file-spreadsheet" size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-emerald-900 block truncate">Excel (.xlsx, .csv)</span>
                  <span className="text-[11px] text-emerald-700">Bảng số liệu thí nghiệm, biểu đồ</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-200">
                <div className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="file" size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-rose-900 block truncate">PDF (.pdf)</span>
                  <span className="text-[11px] text-rose-700">Bản scan bài giải viết tay, tài liệu</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-200">
                <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="image" size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-indigo-900 block truncate">Hình ảnh (.jpg, .png)</span>
                  <span className="text-[11px] text-indigo-700">Ảnh chụp vở bài tập, sơ đồ tư duy</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/70 border border-purple-200">
                <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="video" size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-purple-900 block truncate">Video (.mp4, .mov)</span>
                  <span className="text-[11px] text-purple-700">Clip thuyết trình, bài tập thực hành</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="music" size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-amber-900 block truncate">Audio (.mp3, .wav)</span>
                  <span className="text-[11px] text-amber-700">Ghi âm phát âm tiếng Anh, thuyết minh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Guidelines */}
          <div className="p-4 sm:p-5 border border-slate-200 bg-slate-50/60 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
              <Icon name="info" size={14} className="text-blue-600 shrink-0" />
              <span>Lưu ý khi nộp bài:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
              <li>
                Đặt tên file rõ ràng: <code className="text-blue-700 bg-blue-50 px-1 rounded">11A1_HoTen_BaiTap</code>.
              </li>
              <li>Dung lượng: Tối đa 100MB với Video/Audio và 25MB với tài liệu văn bản.</li>
              <li>Khi cổng nộp bài đã đóng do hết hạn, học sinh có thể gửi yêu cầu đề xuất mở lại đến giáo viên phụ trách.</li>
              <li>Học sinh có thể nộp lại bài trước thời điểm hết hạn nộp bài.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Global File Preview Modal */}
      <FilePreviewModal
        open={previewOpen}
        file={previewFile}
        onClose={handleClosePreview}
      />

      {/* 4. Reopen Request Modal */}
      <ReopenRequestModal
        open={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        assignment={assignment}
        onSubmit={handleRequestReopen}
        loading={requestingReopen}
      />
    </div>
  );
};
