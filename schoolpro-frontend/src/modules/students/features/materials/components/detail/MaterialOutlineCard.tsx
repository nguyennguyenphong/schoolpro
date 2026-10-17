import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { MaterialItem } from "@/modules/students/features/materials/types";

interface MaterialOutlineCardProps {
  item: MaterialItem;
}

export const MaterialOutlineCard: React.FC<MaterialOutlineCardProps> = ({ item }) => {
  const { t } = useTranslation(["card"]);
  const contents =
    item.tableOfContents && item.tableOfContents.length > 0
      ? item.tableOfContents
      : [
          "Phần 1: Lý thuyết căn bản và các định lý mở rộng",
          "Phần 2: Phương pháp giải các dạng toán trọng tâm",
          "Phần 3: Bài tập rèn luyện có hướng dẫn giải chi tiết",
          "Phần 4: Đề kiểm tra đánh giá năng lực tự ôn tập",
        ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("card:materials.modal.tableOfContentsTitle")}
          </h3>
        </div>

        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          {t("card:materials.outline.topicsCount", { count: contents.length })}
        </span>
      </div>

      {/* Chapters list */}
      <div className="space-y-2.5">
        {contents.map((topic, idx) => (
          <div
            key={topic}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#f0f0f0] bg-slate-50/60 hover:bg-white hover:border-blue-200 transition-all text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold text-slate-800 truncate" title={topic}>
                {topic}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 shrink-0 font-medium">
              <Icon name="check" size={13} />
              <span className="hidden sm:inline text-[11px]">{t("card:materials.outline.compiledBadge")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
