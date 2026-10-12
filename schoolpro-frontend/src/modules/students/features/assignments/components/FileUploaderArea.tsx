import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import type { SubmittedFile, FileCategory } from "@/modules/students/features/assignments/types";
import {
  detectFileType,
  formatFileSize,
  FILE_CATEGORIES_META,
  ALL_ACCEPTED_ATTR,
} from "@/modules/students/features/assignments/utils/fileUtils";
import {
  FileCategorySelector,
  FileDropzone,
  UploadedFileList,
} from "@/modules/students/features/assignments/components/uploader";

interface FileUploaderAreaProps {
  files: SubmittedFile[];
  onChange: (files: SubmittedFile[]) => void;
  onPreview: (file: SubmittedFile) => void;
  maxFiles?: number;
  maxFileSizeMb?: number;
}

export const FileUploaderArea: React.FC<FileUploaderAreaProps> = ({
  files,
  onChange,
  onPreview,
  maxFiles = 5,
  maxFileSizeMb = 25,
}) => {
  const { t } = useTranslation(["card", "message"]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<FileCategory | "all">("all");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFiles = (newFileList: FileList | File[]) => {
    const validFiles: SubmittedFile[] = [];
    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;

    Array.from(newFileList).forEach((file) => {
      if (files.length + validFiles.length >= maxFiles) {
        message.warning(
          t("message:assignments.maxFilesWarning", { max: maxFiles }),
        );
        return;
      }

      if (file.size > maxSizeBytes) {
        message.error(
          t("message:assignments.maxFileSizeError", {
            name: file.name,
            max: maxFileSizeMb,
          }),
        );
        return;
      }

      const category = detectFileType(file.name);
      let previewUrl: string | undefined = undefined;

      if (
        category === "image" ||
        category === "video" ||
        category === "audio" ||
        category === "pdf"
      ) {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch {
          // fallback if createObjectURL fails
        }
      }

      validFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type: category,
        uploadedAt: t("card:assignments.uploader.justUploaded"),
        previewUrl,
      });
    });

    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
      message.success(
        t("message:assignments.filesAddedSuccess", { count: validFiles.length }),
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = files.filter((f) => f.id !== fileId);
    onChange(updated);
  };

  const currentAccept =
    activeCategoryFilter === "all"
      ? ALL_ACCEPTED_ATTR
      : FILE_CATEGORIES_META[activeCategoryFilter]?.acceptAttr || "*/*";

  const triggerUploadForCategory = (cat: FileCategory | "all") => {
    setActiveCategoryFilter(cat);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  return (
    <div className="space-y-3">
      {/* 1. Quick Format Selector Buttons */}
      <FileCategorySelector
        filesCount={files.length}
        maxFiles={maxFiles}
        activeCategoryFilter={activeCategoryFilter}
        onSelectCategory={triggerUploadForCategory}
      />

      {/* 2. Drag & Drop Dropzone */}
      <FileDropzone
        isDragging={isDragging}
        fileInputRef={fileInputRef}
        accept={currentAccept}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFilesSelected={handleProcessFiles}
      />

      {/* 3. Selected Files List */}
      <UploadedFileList
        files={files}
        onRemove={handleRemoveFile}
        onClearAll={() => onChange([])}
        onPreview={onPreview}
      />
    </div>
  );
};
