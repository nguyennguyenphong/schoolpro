import React, { useState, useRef } from "react";
import { message } from "antd";
import { Icon } from "@/components/ui/Icon";
import type { SubmittedFile, FileCategory } from "@/modules/students/features/assignments/types";
import {
  detectFileType,
  formatFileSize,
  FILE_CATEGORIES_META,
  ALL_ACCEPTED_ATTR,
} from "@/modules/students/features/assignments/utils/fileUtils";
import { FileItemCard } from "@/modules/students/features/assignments/components/FileItemCard";

interface FileUploaderAreaProps {
  files: SubmittedFile[];
  onChange: (files: SubmittedFile[]) => void;
  onPreview: (file: SubmittedFile) => void;
  maxFiles?: number;
}

export const FileUploaderArea: React.FC<FileUploaderAreaProps> = ({
  files,
  onChange,
  onPreview,
  maxFiles = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<FileCategory | "all">("all");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFiles = (newFileList: FileList | File[]) => {
    const validFiles: SubmittedFile[] = [];
    const maxSizeBytes = 100 * 1024 * 1024; // 100MB

    Array.from(newFileList).forEach((file) => {
      if (files.length + validFiles.length >= maxFiles) {
        message.warning(`Bạn chỉ được đính kèm tối đa ${maxFiles} tệp cho một lần nộp.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        message.error(`Tệp "${file.name}" vượt quá giới hạn 100MB.`);
        return;
      }

      const category = detectFileType(file.name);
      let previewUrl: string | undefined = undefined;

      // Create preview object URL for multimedia & PDF documents
      if (category === "image" || category === "video" || category === "audio" || category === "pdf") {
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
        uploadedAt: "Vừa tải lên",
        previewUrl,
      });
    });

    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
      message.success(`Đã thêm ${validFiles.length} tệp bài làm.`);
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
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 block mb-0">
            Chọn tệp bài làm theo định dạng:
          </label>
          <span className="text-[11px] text-slate-500">
            {files.length}/{maxFiles} tệp đã chọn
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <button
            type="button"
            onClick={() => triggerUploadForCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              activeCategoryFilter === "all"
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon name="upload" size={12} />
            <span>Tất cả định dạng</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUploadForCategory("word")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-blue-50/60 hover:bg-blue-100 text-blue-700 border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="file-text" size={12} />
            <span>Word (.docx)</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUploadForCategory("excel")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 border-emerald-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="file-spreadsheet" size={12} />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUploadForCategory("pdf")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-rose-50/60 hover:bg-rose-100 text-rose-700 border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="file" size={12} />
            <span>PDF (.pdf)</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUploadForCategory("image")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="image" size={12} />
            <span>Hình ảnh</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUploadForCategory("video")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-purple-50/60 hover:bg-purple-100 text-purple-700 border-purple-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="video" size={12} />
            <span>Video clip</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUploadForCategory("audio")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-amber-50/60 hover:bg-amber-100 text-amber-700 border-amber-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="music" size={12} />
            <span>Ghi âm / Audio</span>
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50/70 scale-[0.99]"
            : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={currentAccept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleProcessFiles(e.target.files);
              // Reset value so user can upload same file again if needed
              e.target.value = "";
            }
          }}
        />

        <div className="w-13 h-13 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
          <Icon name="upload" size={24} />
        </div>

        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Kéo thả tệp vào đây hoặc nhấp để chọn tệp từ thiết bị
        </h4>

        <p className="text-xs text-slate-500 max-w-md mb-3">
          Hỗ trợ đầy đủ các định dạng bài nộp học sinh: Văn bản Word, Bảng tính Excel, File PDF, Ảnh chụp bài giải, Video thuyết trình và Tệp ghi âm phát âm.
        </p>

        {/* Format Badges in dropzone */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
            Word (.doc, .docx)
          </span>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
            Excel (.xlsx, .csv)
          </span>
          <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
            PDF (.pdf)
          </span>
          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
            Ảnh (.jpg, .png)
          </span>
          <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
            Video (.mp4, .mov)
          </span>
          <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
            Audio (.mp3, .wav)
          </span>
        </div>
      </div>

      {/* 3. Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Danh sách tệp chuẩn bị nộp ({files.length}):
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
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
                onRemove={handleRemoveFile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
