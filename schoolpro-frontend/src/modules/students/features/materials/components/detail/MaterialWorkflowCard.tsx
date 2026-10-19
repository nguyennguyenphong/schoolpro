import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Steps } from "@/components/ui/Steps";
import { Tag } from "@/components/ui/Tag";
import type { MaterialItem } from "@/modules/students/features/materials/types";
import { getCategoryConfig } from "@/modules/students/features/materials/utils";

interface MaterialWorkflowCardProps {
  item: MaterialItem;
}

export const MaterialWorkflowCard: React.FC<MaterialWorkflowCardProps> = ({ item }) => {
  const { t } = useTranslation(["card", "button"]);
  const categoryConfig = getCategoryConfig(item.category, t);

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("card:materials.overview.workflowCardTitle")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
            <Icon name="checkCircle" size={13} className="text-emerald-600 shrink-0" />
            <span>{t("card:materials.preview.pedagogyStandard")}</span>
          </div>
          <Tag color={categoryConfig.color} className="m-0 font-bold text-xs px-2.5 py-0.5">
            {categoryConfig.label}
          </Tag>
        </div>
      </div>

      <div className="px-1 sm:px-2">
        <Steps
          size="small"
          current={3}
          status="finish"
          items={[
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:materials.overview.step1Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {t("card:materials.overview.step1Desc")}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:materials.overview.step2Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {t("card:materials.overview.step2Desc")}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:materials.overview.step3Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {t("card:materials.overview.step3Desc")}
                </span>
              ),
            },
            {
              title: (
                <span className="font-semibold text-xs sm:text-sm">
                  {t("card:materials.overview.step4Title")}
                </span>
              ),
              content: (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {t("card:materials.overview.step4Desc")}
                </span>
              ),
            },
          ]}
        />
      </div>

      <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="info" size={14} className="text-blue-600 shrink-0" />
          <span>{t("card:materials.overview.officialNotice")}</span>
        </div>
        <span className="text-[11px] font-medium text-blue-800">
          {t("card:materials.meta.author", { author: item.author })} | <strong>{item.subjectName}</strong>
        </span>
      </div>
    </div>
  );
};
