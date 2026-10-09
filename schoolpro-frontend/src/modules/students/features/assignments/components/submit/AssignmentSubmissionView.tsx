import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { FileItemCard } from "@/modules/students/features/assignments/components/FileItemCard";
import type {
  AssignmentItem,
  SubmittedFile,
} from "@/modules/students/features/assignments/types";

interface AssignmentSubmissionViewProps {
  assignment: AssignmentItem;
  files: SubmittedFile[];
  isSubmittedAndExpired: boolean;
  isGraded: boolean;
  onPreview: (file: SubmittedFile) => void;
  onRequestReopen: () => void;
  onStartResubmit: () => void;
}

export const AssignmentSubmissionView: React.FC<AssignmentSubmissionViewProps> = ({
  assignment,
  files,
  isSubmittedAndExpired,
  isGraded,
  onPreview,
  onRequestReopen,
  onStartResubmit,
}) => {
  return (
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
                onPreview={onPreview}
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
            <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-[#f0f0f0] mb-0 leading-relaxed">
              "{assignment.submission.content}"
            </p>
          </div>
        )}
      </div>

      {/* Sub-case 1A: Submission is EXPIRED -> Port CLOSED + Reopen Request Button */}
      {isSubmittedAndExpired && (
        <div className="p-4 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#f0f0f0]/80">
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
              onClick={onRequestReopen}
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
            onClick={onStartResubmit}
            className="self-end sm:self-auto"
          >
            <Icon name="refresh" size={12} />
            Nộp lại bài làm
          </Button>
        </div>
      )}
    </div>
  );
};
