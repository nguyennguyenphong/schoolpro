import React from "react";
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
}) => {
  return (
    <div className="space-y-4">
      {/* File Uploader supporting Word, Excel, Video, Audio, PDF, Image */}
      <FileUploaderArea
        files={files}
        onChange={onFilesChange}
        onPreview={onPreview}
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
          onChange={(e) => onContentChange(e.target.value)}
          style={{ resize: "none" }}
        />
      </div>

      {/* Submit Confirmation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {isResubmitting && (
            <Button
              variant="outline"
              onClick={onCancelResubmit}
              disabled={submitting}
            >
              Hủy nộp lại
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
            {submitting ? "Đang gửi bài..." : "Xác nhận nộp bài"}
          </Button>
        </div>
      </div>
    </div>
  );
};
