import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { MaterialItem } from "@/modules/students/features/materials/types";

interface MaterialPreviewCardProps {
  item: MaterialItem;
  downloading: boolean;
  onDownload: () => void;
}

export const MaterialPreviewCard: React.FC<MaterialPreviewCardProps> = ({
  item,
  downloading,
  onDownload,
}) => {
  const { t } = useTranslation(["card", "button"]);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-6">
      {/* 1. Header with Verified Pedagogy Standard Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f0] pb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0">
            {t("card:materials.modal.descriptionTitle")}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold self-start sm:self-auto shadow-2xs">
          <Icon name="checkCircle" size={14} className="text-emerald-600 shrink-0" />
          <span>Đạt chuẩn sư phạm số</span>
        </div>
      </div>

      {/* 2. Document Description */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">
          Tổng quan tài liệu
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-[#f0f0f0] mb-0">
          {item.description}
        </p>
      </div>

      {/* 3. Document Preview Simulator Canvas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Icon name="file" size={13} className="text-blue-600" />
            <span>Bản xem trước trực tuyến: {item.fileName}</span>
          </div>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-semibold">
            Trang 1 / 24
          </span>
        </div>

        <div className="relative rounded-xl border border-slate-300 bg-slate-100 overflow-hidden shadow-inner min-h-[380px] sm:min-h-[460px] flex flex-col items-center justify-between p-4 sm:p-8">
          {/* Simulated document paper */}
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 sm:p-10 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0">
                  TRƯỜNG TRUNG HỌC PHỔ THÔNG CHUYÊN
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mb-0">
                  TỔ CHUYÊN MÔN: {item.subjectName.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  LƯU HÀNH NỘI BỘ
                </span>
              </div>
            </div>

            <div className="text-center py-3">
              <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-snug mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Biên soạn: <strong className="text-slate-700">{item.author}</strong> • {item.semester} ({item.academicYear})
              </p>
            </div>

            {/* Simulated text lines */}
            <div className="space-y-2.5 pt-2">
              <div className="h-3 w-11/12 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-200 rounded" />
              <div className="h-3 w-4/5 bg-slate-200 rounded" />
              <div className="h-3 w-5/6 bg-slate-200 rounded" />
              <div className="h-3 w-3/4 bg-slate-200 rounded" />
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1.5 my-3">
              <div className="text-xs font-bold text-blue-800">Mục tiêu bài học trọng tâm:</div>
              <ul className="text-xs text-blue-900/80 list-disc list-inside space-y-0.5 mb-0">
                <li>Nắm vững phương pháp luận và lý thuyết mở rộng.</li>
                <li>Hệ thống hóa dạng bài tập trắc nghiệm và tự luận phân hóa cao.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-1 opacity-70">
              <div className="h-3 w-full bg-slate-200 rounded" />
              <div className="h-3 w-5/6 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Fade overlay with Download CTA */}
          <div className="w-full max-w-2xl mt-4 bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-blue-200 shadow-md text-center space-y-2">
            <p className="text-xs text-slate-600 mb-0">
              Hệ thống hiển thị xem trước trang đầu tiên. Tải về tài liệu gốc để đọc toàn bộ nội dung và bài tập chi tiết.
            </p>
            <Button
              variant="primary"
              onClick={onDownload}
              loading={downloading}
              className="text-xs sm:text-sm font-semibold px-5 py-2"
            >
              <Icon name="download" size={14} />
              <span>{t("card:materials.actions.download", { size: item.fileSize })}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
