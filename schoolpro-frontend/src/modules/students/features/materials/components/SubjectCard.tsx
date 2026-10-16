import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectItem } from "@/modules/students/features/materials/types";

interface SubjectCardProps {
  item: SubjectItem;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ item }) => {
  const { t } = useTranslation();

  const getColorStyles = (scheme: SubjectItem["colorScheme"]) => {
    switch (scheme) {
      case "blue":
        return {
          iconBg: "bg-blue-50 text-blue-600 border-blue-200",
          tagColor: "blue",
          accentHover: "hover:border-blue-400",
        };
      case "purple":
        return {
          iconBg: "bg-purple-50 text-purple-600 border-purple-200",
          tagColor: "purple",
          accentHover: "hover:border-purple-400",
        };
      case "emerald":
        return {
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          tagColor: "green",
          accentHover: "hover:border-emerald-400",
        };
      case "amber":
        return {
          iconBg: "bg-amber-50 text-amber-600 border-amber-200",
          tagColor: "gold",
          accentHover: "hover:border-amber-400",
        };
      case "rose":
        return {
          iconBg: "bg-rose-50 text-rose-600 border-rose-200",
          tagColor: "red",
          accentHover: "hover:border-rose-400",
        };
      case "cyan":
        return {
          iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200",
          tagColor: "cyan",
          accentHover: "hover:border-cyan-400",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
          tagColor: "geekblue",
          accentHover: "hover:border-indigo-400",
        };
      case "orange":
        return {
          iconBg: "bg-orange-50 text-orange-600 border-orange-200",
          tagColor: "orange",
          accentHover: "hover:border-orange-400",
        };
      case "teal":
      default:
        return {
          iconBg: "bg-teal-50 text-teal-600 border-teal-200",
          tagColor: "cyan",
          accentHover: "hover:border-teal-400",
        };
    }
  };

  const style = getColorStyles(item.colorScheme);

  return (
    <Card className="rounded-xl border border-[#f0f0f0] shadow-2xs">
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
            <div className="text-[10px] text-slate-400 font-medium">{t("card:materials.categories.lecture", "Bài giảng")}</div>
          </div>
          <div className="border-x border-[#f0f0f0]/80">
            <div className="text-sm font-bold text-slate-800">{item.outlinesCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">{t("card:materials.categories.outline", "Đề cương")}</div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">{item.examsCount}</div>
            <div className="text-[10px] text-slate-400 font-medium">{t("card:materials.categories.exam_prep", "Đề thi")}</div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-[#f0f0f0] flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
          <Icon name="download" size={13} className="text-slate-400" />
          {t("card:materials.meta.downloadsCount", { count: item.totalDownloads, defaultValue: `${item.totalDownloads} lượt tải` })}
        </span>

        <Button
          variant="outline"
          className="text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all font-semibold text-xs"
          onClick={(e) => {
            e.stopPropagation();
          }}
          href={`/student/materials/${item.code}`}
        >
          <Icon name="fileText" size={14} />
          <span>{t("card:materials.actions.viewMaterials", { count: item.totalMaterials, defaultValue: `Xem tài liệu (${item.totalMaterials})` })}</span>
        </Button>
      </div>
    </Card>
  );
};
