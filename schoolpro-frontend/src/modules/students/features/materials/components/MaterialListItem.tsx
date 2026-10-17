import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MaterialFormatBadge } from "@/modules/students/features/materials/components/MaterialFormatBadge";
import { getCategoryConfig } from "@/modules/students/features/materials/utils";
import type { MaterialItem } from "@/modules/students/features/materials/types";

interface MaterialListItemProps {
  item: MaterialItem;
  onDownload: (item: MaterialItem) => void;
  onToggleBookmark: (id: string) => void;
  onClick?: (item: MaterialItem) => void;
}

export const MaterialListItem: React.FC<MaterialListItemProps> = ({
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

  const handleItemClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      navigate(`/student/materials/${item.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 sm:p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Key Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Row 1: Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              onClick={handleSubjectClick}
              className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl whitespace-nowrap transition-colors"
              title={item.subjectName}
            >
              {item.subjectName}
            </span>
            <Tag color={categoryConfig.color} className="m-0 font-semibold text-xs whitespace-nowrap">
              {categoryConfig.label}
            </Tag>
            <MaterialFormatBadge format={item.format} fileSize={item.fileSize} />
          </div>

          {/* Row 2: Title */}
          <h3
            className="text-sm sm:text-base font-bold text-slate-900 transition-colors mb-0 truncate"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Row 3: Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5 mt-2">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="calendar" size={13} className="text-slate-400" />
              <span>{item.uploadDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="shrink-0 flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0f0f0]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onToggleBookmark(item.id)}
          title={item.isBookmarked ? t("card:materials.actions.unbookmark") : t("card:materials.actions.bookmark")}
          className={`p-2 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
            item.isBookmarked
              ? "bg-amber-50 border-amber-300 text-amber-600"
              : "border-[#f0f0f0] text-slate-400 hover:text-amber-500 hover:border-amber-200"
          }`}
        >
          <Icon name="bookmark" size={15} />
        </button>

        <Button
          variant="primary"
          onClick={() => onDownload(item)}
        >
          <Icon name="download" size={14} />
          <span>{t("card:materials.actions.downloadSimple")}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={handleItemClick}
          href={`/student/materials/${item.id}`}
        >
          <span>{t("card:materials.actions.viewDetail")}</span>
          <Icon name="chevron-right" size={13} />
        </Button>
      </div>
    </div>
  );
};
