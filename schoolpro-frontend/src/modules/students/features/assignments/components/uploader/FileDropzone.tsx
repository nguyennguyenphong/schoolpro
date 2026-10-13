import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

interface FileDropzoneProps {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  isDragging,
  fileInputRef,
  accept,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
}) => {
  const { t } = useTranslation(["card", "input"]);

  return (
    <label
      htmlFor="assignment-file-upload-input"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50/70 scale-[0.99]"
          : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20"
      }`}
    >
      <input
        ref={fileInputRef}
        id="assignment-file-upload-input"
        name="assignmentFiles"
        aria-label={t("input:assignments.uploadFilesLabel")}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
            e.target.value = "";
          }
        }}
      />

      <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-2.5 shadow-inner">
        <Icon name="upload" size={20} />
      </div>

      <h4 className="text-sm font-bold text-slate-800 mb-1">
        {t("card:assignments.uploader.dropzoneTitle")}
      </h4>

      <p className="text-xs text-slate-500 max-w-md mb-0">
        {t("card:assignments.uploader.dropzoneDesc")}
      </p>
    </label>
  );
};
