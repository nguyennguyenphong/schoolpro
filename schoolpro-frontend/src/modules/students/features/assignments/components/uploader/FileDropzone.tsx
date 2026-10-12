import React from "react";
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
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50/70 scale-[0.99]"
          : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20"
      }`}
    >
      <input
        ref={fileInputRef}
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

      <div className="w-13 h-13 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
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
        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-xl">
          Word (.doc, .docx)
        </span>
        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-xl">
          Excel (.xlsx, .csv)
        </span>
        <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-xl">
          PDF (.pdf)
        </span>
        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-xl">
          Ảnh (.jpg, .png)
        </span>
        <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-xl">
          Video (.mp4, .mov)
        </span>
        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-xl">
          Audio (.mp3, .wav)
        </span>
      </div>
    </div>
  );
};
