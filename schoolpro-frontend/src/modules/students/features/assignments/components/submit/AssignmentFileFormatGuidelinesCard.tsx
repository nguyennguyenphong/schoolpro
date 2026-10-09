import React from "react";
import { Icon } from "@/components/ui/Icon";

export const AssignmentFileFormatGuidelinesCard: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
        <h3 className="text-sm font-bold text-slate-900 mb-0">
          Quy chuẩn định dạng tệp nộp bài
        </h3>
      </div>

      <p className="text-[11px] text-slate-500 mb-2">
        Hệ thống chấp nhận đầy đủ 6 định dạng tiêu chuẩn cho học sinh:
      </p>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/70 border border-blue-200">
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Icon name="file-text" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-blue-900 block truncate">Word (.docx, .doc)</span>
            <span className="text-[11px] text-blue-700">Bài viết luận, báo cáo thu hoạch</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Icon name="file-spreadsheet" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-emerald-900 block truncate">Excel (.xlsx, .csv)</span>
            <span className="text-[11px] text-emerald-700">Bảng số liệu thí nghiệm, biểu đồ</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-200">
          <div className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center shrink-0">
            <Icon name="file" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-rose-900 block truncate">PDF (.pdf)</span>
            <span className="text-[11px] text-rose-700">Bản scan bài giải viết tay, tài liệu</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-200">
          <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Icon name="image" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-indigo-900 block truncate">Hình ảnh (.jpg, .png)</span>
            <span className="text-[11px] text-indigo-700">Ảnh chụp vở bài tập, sơ đồ tư duy</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/70 border border-purple-200">
          <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Icon name="video" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-purple-900 block truncate">Video (.mp4, .mov)</span>
            <span className="text-[11px] text-purple-700">Clip thuyết trình, bài tập thực hành</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200">
          <div className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center shrink-0">
            <Icon name="music" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-amber-900 block truncate">Audio (.mp3, .wav)</span>
            <span className="text-[11px] text-amber-700">Ghi âm phát âm tiếng Anh, thuyết minh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
