import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getSubjectColorStyle } from "@/modules/students/features/materials/utils";
import type { SubjectItem } from "@/modules/students/features/materials/types";

interface SubjectCardProps {
  item: SubjectItem;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button"]);

  const style = getSubjectColorStyle(item.colorScheme);

  return (
    <Card
      onClick={() => navigate(`/student/materials/subject/${item.code}`)}
      className="rounded-xl border border-[#f0f0f0] shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
    >
      <div>
        {/* Header: Icon + Code + Semester */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 ${style.iconBg}`}
            >
              <Icon name="book" size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {item.code}
              </span>
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base mb-0 leading-tight truncate">
                {item.name}
              </h3>
            </div>
          </div>

          <Tag color="default" className="text-[11px] font-medium border-[#f0f0f0] m-0 shrink-0">
            {item.semester}
          </Tag>
        </div>

        {/* Teacher Info */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-[#f0f0f0]">
          <Icon name="user" size={13} className="text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700">{item.teacher}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 truncate">{item.teacherTitle}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3.5 h-10">
          {item.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50/60 rounded-xl border border-[#f0f0f0] mb-3 text-center">
          <div>
            <div className="text-sm font-bold text-slate-800">{item.lecturesCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">{t("card:materials.categories.lecture")}</div>
          </div>
          <div className="border-x border-[#f0f0f0]/80">
            <div className="text-sm font-bold text-slate-800">{item.outlinesCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">{t("card:materials.categories.outline")}</div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">{item.examsCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">{t("card:materials.categories.exam_prep")}</div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-[#f0f0f0] flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
          <Icon name="download" size={13} className="text-slate-400" />
          {t("card:materials.meta.downloadsCount", { count: item.totalDownloads })}
        </span>

        <Button
          variant="outline"
          className="text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all font-semibold text-xs"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/student/materials/subject/${item.code}`);
          }}
        >
          <Icon name="fileText" size={14} />
          <span>{t("card:materials.actions.viewMaterials", { count: item.totalMaterials })}</span>
        </Button>
      </div>
    </Card>
  );
};
