import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MaterialFormatBadge } from "@/modules/students/features/materials/components/MaterialFormatBadge";
import { getCategoryConfig } from "@/modules/students/features/materials/utils";
import type { MaterialItem } from "@/modules/students/features/materials/types";

interface MaterialCardProps {
  item: MaterialItem;
  onDownload: (item: MaterialItem) => void;
  onToggleBookmark: (id: string) => void;
  onClick?: (item: MaterialItem) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  item,
  onDownload,
  onToggleBookmark,
  onClick,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button"]);

  const handleSubjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/student/materials/subject/${item.subjectCode}`);
  };

  const categoryConfig = getCategoryConfig(item.category, t);

  const handleCardClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      navigate(`/student/materials/${item.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-[#f0f0f0] rounded-xl p-4 flex flex-col justify-between gap-3 transition-all shadow-2xs h-full cursor-pointer hover:border-blue-200"
    >
      <div className="flex flex-col gap-2.5">
        {/* Row 1: Subject Badge + Category Badge & Bookmark Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span
              onClick={handleSubjectClick}
              className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl truncate max-w-35 cursor-pointer hover:bg-blue-100 transition-colors"
              title={item.subjectName}
            >
              {item.subjectName}
            </span>
            <Tag color={categoryConfig.color} className="m-0 font-semibold text-[11px] shrink-0">
              {categoryConfig.label}
            </Tag>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(item.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
              item.isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-500"
                : "border-[#f0f0f0] text-slate-300 hover:text-amber-500 hover:border-amber-200"
            }`}
            title={item.isBookmarked ? t("card:materials.actions.unbookmark") : t("card:materials.actions.bookmark")}
          >
            <Icon name="bookmark" size={14} />
          </button>
        </div>

        {/* Row 2: Title */}
        <h4
          className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-0"
          title={item.title}
        >
          {item.title}
        </h4>

        {/* Row 3: Format & Semester Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <MaterialFormatBadge format={item.format} fileSize={item.fileSize} />
        </div>
      </div>

      {/* Footer: Metadata & Direct Actions */}
      <div
        className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{item.uploadDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="primary"
            onClick={() => onDownload(item)}
            className="text-xs px-3 py-1 font-semibold"
          >
            <Icon name="download" size={13} />
            <span>{t("card:materials.actions.downloadSimple")}</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleCardClick}
            href={`/student/materials/${item.id}`}
          >
            <span>{t("card:materials.actions.viewDetail")}</span>
            <Icon name="chevron-right" size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
};
