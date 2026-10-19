import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectItem } from "@/modules/students/features/materials/types";

import { getSubjectColorStyle } from "@/modules/students/features/materials/utils";

interface SubjectListItemProps {
  item: SubjectItem;
}

export const SubjectListItem: React.FC<SubjectListItemProps> = ({ item }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button"]);
  const style = getSubjectColorStyle(item.colorScheme);

  const handleCardClick = () => {
    navigate(`/student/materials/subject/${item.code}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="rounded-xl border border-[#f0f0f0] shadow-2xs hover:border-blue-400 transition-all cursor-pointer group w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 mt-0.5 ${style.iconBg}`}
          >
            <Icon name="book" size={22} />
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {item.code}
              </span>
              <Tag color="default" className="text-xs font-medium m-0">
                {item.semester} ({item.academicYear})
              </Tag>
              <span className="text-xs text-slate-500 font-medium">
                {t("card:materials.meta.teacher")} <strong className="text-slate-700">{item.teacher}</strong>
              </span>
            </div>

            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base line-clamp-1 mb-0">
              {item.name}
            </h3>

            <p className="text-xs text-slate-500 line-clamp-1 mb-0">
              {item.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-0.5">
              <span>{t("card:materials.meta.lecturesCount")} <strong className="text-slate-700">{item.lecturesCount}</strong></span>
              <span>|</span>
              <span>{t("card:materials.meta.outlinesCount")} <strong className="text-slate-700">{item.outlinesCount}</strong></span>
              <span>|</span>
              <span>{t("card:materials.meta.examsCount")} <strong className="text-slate-700">{item.examsCount}</strong></span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Icon name="download" size={13} className="text-slate-400" />
                {t("card:materials.meta.downloadsCount", { count: item.totalDownloads })}
              </span>
            </div>
          </div>
        </div>

        {/* Right action button */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 shrink-0 md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-[#f0f0f0] justify-end"
        >
          <Button
            variant="outline"
            className="text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all font-semibold"
            onClick={handleCardClick}
          >
            <Icon name="fileText" size={14} />
            <span>{t("card:materials.actions.viewMaterials", { count: item.totalMaterials })}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
