import React from "react";
import type { SubmittedFile } from "@/modules/students/features/assignments/types";
import { FileItemCard } from "@/modules/students/features/assignments/components/FileItemCard";

interface UploadedFileListProps {
  files: SubmittedFile[];
  onRemove: (fileId: string) => void;
  onClearAll: () => void;
  onPreview: (file: SubmittedFile) => void;
}

export const UploadedFileList: React.FC<UploadedFileListProps> = ({
  files,
  onRemove,
  onClearAll,
  onPreview,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">
          Danh sách tệp chuẩn bị nộp ({files.length}):
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-slate-400 hover:text-rose-600 transition-colors text-[11px]"
        >
          Xóa tất cả tệp
        </button>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {files.map((file) => (
          <FileItemCard
            key={file.id}
            file={file}
            onPreview={onPreview}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};
