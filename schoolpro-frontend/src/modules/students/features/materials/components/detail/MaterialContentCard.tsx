import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { MaterialItem } from "@/modules/students/features/materials/types";
import { getCategoryConfig } from "@/modules/students/features/materials/utils";

interface MaterialContentCardProps {
  item: MaterialItem;
}

export const MaterialContentCard: React.FC<MaterialContentCardProps> = ({ item }) => {
  const { t } = useTranslation(["card"]);
  const categoryConfig = getCategoryConfig(item.category, t);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
      {/* Card Header matching LeaveRequestContentCard */}
      <div className="flex items-center gap-2 border-b border-[#f0f0f0] pb-3">
        <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
          {t("card:materials.modal.descriptionTitle")}
        </h3>
      </div>

      {/* 3 Metric Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#f0f0f0]">
          <span className="text-[11px] text-slate-500 block mb-1">
            {t("card:materials.modal.subject")}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm truncate">
            <Icon name="book" size={14} className="text-blue-600 shrink-0" />
            <span className="truncate">{item.subjectName} ({item.subjectCode})</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#f0f0f0]">
          <span className="text-[11px] text-slate-500 block mb-1">
            {t("card:materials.modal.author")}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs sm:text-sm truncate">
            <Icon name="user" size={14} className="text-blue-600 shrink-0" />
            <span className="truncate">{item.author}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#f0f0f0]">
          <span className="text-[11px] text-slate-500 block mb-1">
            {t("card:materials.modal.category")}
          </span>
          <Tag
            color={categoryConfig.color}
            className="m-0 font-semibold text-xs"
          >
            {categoryConfig.label}
          </Tag>
        </div>
      </div>

      {/* Detailed Description */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 block">
            {t("card:materials.preview.overviewTitle")}
          </span>
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {item.description}
          </div>
        </div>

        {/* Pedagogical Key Objectives */}
        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <Icon name="checkCircle" size={14} className="text-blue-600 shrink-0" />
            <span>{t("card:materials.preview.keyObjectives")}</span>
          </div>
          <ul className="text-xs text-blue-900/80 list-disc list-inside space-y-1 mb-0 pl-1">
            <li>{t("card:materials.preview.objective1")}</li>
            <li>{t("card:materials.preview.objective2")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
