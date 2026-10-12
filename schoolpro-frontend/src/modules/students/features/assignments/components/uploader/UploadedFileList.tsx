import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["card"]);

  if (files.length === 0) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">
          {t("card:assignments.uploader.preparedFilesLabel", {
            count: files.length,
          })}
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-slate-400 hover:text-rose-600 transition-colors text-[11px] cursor-pointer"
        >
          {t("card:assignments.uploader.clearAllFiles")}
        </button>
      </div>

      <div className="space-y-2 max-h-90 overflow-y-auto pr-1">
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
