import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentModalSubmitFormProps {
  assignment: AssignmentItem;
  submissionContent: string;
  selectedFile: string | null;
  submitting: boolean;
  onContentChange: (val: string) => void;
  onFileSelect: (fileName: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AssignmentModalSubmitForm: React.FC<AssignmentModalSubmitFormProps> = ({
  assignment,
  submissionContent,
  selectedFile,
  submitting,
  onContentChange,
  onFileSelect,
  onSubmit,
  onCancel,
}) => {
  if (assignment.status !== "pending" && assignment.status !== "overdue") {
    return null;
  }

  return (
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
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full p-2.5 text-xs border border-[#f0f0f0] rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-[#f0f0f0] px-3 py-1.5 rounded-lg transition-colors">
          <Icon name="upload" size={13} className="text-slate-500" />
          <span>
            {selectedFile ? "Đổi tệp khác" : "Chọn tệp đính kèm (PDF, DOCX, ZIP)"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileSelect(file.name);
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
        <Button variant="outline" onClick={onCancel}>
          Hủy bỏ
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Đang gửi..." : "Xác nhận nộp bài"}
        </Button>
      </div>
    </div>
  );
};
