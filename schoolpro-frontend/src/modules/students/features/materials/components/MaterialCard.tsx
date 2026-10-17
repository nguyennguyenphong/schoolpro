import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Checkbox } from "@/components/ui/Checkbox";
import type {
  MaterialItem,
  MaterialFormat,
  MaterialCategory,
} from "@/modules/students/features/materials/types";

interface MaterialCardProps {
  item: MaterialItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDownload: (item: MaterialItem) => void;
  onToggleBookmark: (id: string) => void;
  onClick?: (item: MaterialItem) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  item,
  isSelected = false,
  onToggleSelect,
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
      className={`bg-white border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all shadow-2xs h-full cursor-pointer group hover:shadow-md ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/15"
          : "border-[#f0f0f0] hover:border-blue-400"
      }`}
    >
      <div className="flex flex-col gap-2.5">
        {/* Row 1: Checkbox + Subject Badge + Category Badge & Bookmark Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {onToggleSelect && (
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
                <Checkbox
                  checked={isSelected}
                  onChange={() => onToggleSelect(item.id)}
                />
              </div>
            )}
            <span
              onClick={handleSubjectClick}
              className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl truncate max-w-[140px] cursor-pointer hover:bg-blue-100 transition-colors"
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
            title={item.isBookmarked ? t("card:materials.actions.unbookmark", "Bỏ lưu yêu thích") : t("card:materials.actions.bookmark", "Lưu vào yêu thích")}
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
          {getFormatBadge(item.format, item.fileSize)}
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-medium text-slate-500">
            {item.semester} ({item.academicYear})
          </span>
        </div>
      </div>

      {/* Footer: Metadata & Direct Download Action */}
      <div
        className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-slate-700 font-medium truncate flex items-center gap-1" title={item.author}>
            <Icon name="user" size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{item.author}</span>
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{item.uploadDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="download" size={11} />
              <span>{t("card:materials.meta.downloadsCount", { count: item.downloadsCount, defaultValue: `${item.downloadsCount} lượt tải` })}</span>
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => onDownload(item)}
          className="text-xs px-3 py-1 font-semibold shrink-0"
        >
          <Icon name="download" size={13} />
          <span>{t("card:materials.actions.downloadSimple", "Tải về")}</span>
        </Button>
      </div>
    </div>
  );
};
