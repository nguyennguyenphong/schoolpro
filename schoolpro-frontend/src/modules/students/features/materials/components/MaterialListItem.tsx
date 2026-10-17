import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  MaterialItem,
  MaterialFormat,
  MaterialCategory,
} from "@/modules/students/features/materials/types";

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

  const getFormatBadge = (fmt: MaterialFormat, size: string) => {
    switch (fmt) {
      case "pdf":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shrink-0">
            <Icon name="file" size={12} />
            PDF • {size}
          </span>
        );
      case "word":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 shrink-0">
            <Icon name="fileText" size={12} />
            DOCX • {size}
          </span>
        );
      case "powerpoint":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 shrink-0">
            <Icon name="presentation" size={12} />
            PPTX • {size}
          </span>
        );
      case "excel":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
            <Icon name="fileSpreadsheet" size={12} />
            XLSX • {size}
          </span>
        );
      case "video":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shrink-0">
            <Icon name="video" size={12} />
            MP4 • {size}
          </span>
        );
      case "audio":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
            <Icon name="music" size={12} />
            MP3 • {size}
          </span>
        );
      case "archive":
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-[#f0f0f0] flex items-center gap-1 shrink-0">
            <Icon name="archive" size={12} />
            ZIP • {size}
          </span>
        );
    }
  };

  const getCategoryConfig = (cat: MaterialCategory) => {
    switch (cat) {
      case "lecture":
        return { label: t("card:materials.categories.lecture", "Bài giảng"), color: "blue" };
      case "outline":
        return { label: t("card:materials.categories.outline", "Đề cương"), color: "orange" };
      case "textbook":
        return { label: t("card:materials.categories.textbook", "Sách giáo khoa"), color: "purple" };
      case "exam_prep":
        return { label: t("card:materials.categories.exam_prep", "Đề thi"), color: "green" };
      case "reference":
      default:
        return { label: t("card:materials.categories.reference", "Tham khảo"), color: "default" };
    }
  };

  const categoryConfig = getCategoryConfig(item.category);

  const handleItemClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      navigate(`/student/materials/${item.id}`);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className="bg-white rounded-xl border border-[#f0f0f0] hover:border-blue-400 shadow-2xs p-4 sm:p-4.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Key Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Row 1: Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              onClick={handleSubjectClick}
              className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
              title={item.subjectName}
            >
              {item.subjectName}
            </span>
            <Tag color={categoryConfig.color} className="m-0 font-semibold text-xs whitespace-nowrap">
              {categoryConfig.label}
            </Tag>
            {getFormatBadge(item.format, item.fileSize)}
            <span className="text-xs text-slate-400 whitespace-nowrap">
              • {item.semester} ({item.academicYear})
            </span>
          </div>

          {/* Row 2: Title */}
          <h3
            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-0 truncate"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Row 3: Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 whitespace-nowrap">
              <Icon name="user" size={13} className="text-slate-400" />
              <span>{item.author}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="calendar" size={13} className="text-slate-400" />
              <span>{item.uploadDate}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="download" size={13} className="text-slate-400" />
              <span>{t("card:materials.meta.downloadsCount", { count: item.downloadsCount, defaultValue: `${item.downloadsCount} lượt tải` })}</span>
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
          title={item.isBookmarked ? t("card:materials.actions.unbookmark", "Bỏ lưu yêu thích") : t("card:materials.actions.bookmark", "Lưu vào yêu thích")}
          className={`p-2 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
            item.isBookmarked
              ? "bg-amber-50 border-amber-300 text-amber-600"
              : "border-[#f0f0f0] text-slate-400 hover:text-amber-500 hover:border-amber-200"
          }`}
        >
          <Icon name="bookmark" size={15} />
        </button>

        <Button
          variant="outline"
          onClick={handleItemClick}
          className="text-xs px-3 py-1.5 font-semibold"
        >
          <span>{t("card:materials.actions.viewDetail", "Chi tiết")}</span>
        </Button>

        <Button
          variant="primary"
          onClick={() => onDownload(item)}
          className="text-xs px-3.5 py-1.5 font-semibold"
        >
          <Icon name="download" size={14} />
          <span>{t("card:materials.actions.downloadSimple", "Tải về")}</span>
        </Button>
      </div>
    </div>
  );
};
