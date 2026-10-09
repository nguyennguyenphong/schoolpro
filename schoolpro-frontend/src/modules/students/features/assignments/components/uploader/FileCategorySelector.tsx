import React from "react";
import { Icon } from "@/components/ui/Icon";
import type { FileCategory } from "@/modules/students/features/assignments/types";

interface FileCategorySelectorProps {
  filesCount: number;
  maxFiles: number;
  activeCategoryFilter: FileCategory | "all";
  onSelectCategory: (cat: FileCategory | "all") => void;
}

export const FileCategorySelector: React.FC<FileCategorySelectorProps> = ({
  filesCount,
  maxFiles,
  activeCategoryFilter,
  onSelectCategory,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-700 block mb-0">
          Chọn tệp bài làm theo định dạng:
        </label>
        <span className="text-[11px] text-slate-500">
          {filesCount}/{maxFiles} tệp đã chọn
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            activeCategoryFilter === "all"
              ? "bg-blue-50 text-blue-700 border-blue-300"
              : "bg-white text-slate-600 border-[#f0f0f0] hover:bg-slate-50"
          }`}
        >
          <Icon name="upload" size={12} />
          <span>Tất cả định dạng</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory("word")}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-blue-50/60 hover:bg-blue-100 text-blue-700 border-blue-200 transition-colors flex items-center gap-1.5"
        >
          <Icon name="file-text" size={12} />
          <span>Word (.docx)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory("excel")}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 border-emerald-200 transition-colors flex items-center gap-1.5"
        >
          <Icon name="file-spreadsheet" size={12} />
          <span>Excel (.xlsx)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory("pdf")}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-rose-50/60 hover:bg-rose-100 text-rose-700 border-rose-200 transition-colors flex items-center gap-1.5"
        >
          <Icon name="file" size={12} />
          <span>PDF (.pdf)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory("image")}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 border-indigo-200 transition-colors flex items-center gap-1.5"
        >
          <Icon name="image" size={12} />
          <span>Hình ảnh</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory("video")}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-purple-50/60 hover:bg-purple-100 text-purple-700 border-purple-200 transition-colors flex items-center gap-1.5"
        >
          <Icon name="video" size={12} />
          <span>Video clip</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory("audio")}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-amber-50/60 hover:bg-amber-100 text-amber-700 border-amber-200 transition-colors flex items-center gap-1.5"
        >
          <Icon name="music" size={12} />
          <span>Ghi âm / Audio</span>
        </button>
      </div>
    </div>
  );
};
