import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
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
  const { t } = useTranslation();

  const handleSubjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/student/materials/${item.subjectCode}`);
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

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCheckboxChange = (e: any) => {
    e.stopPropagation?.();
    onToggleSelect?.(item.id);
  };

  return (
    <Card
      onClick={() => onClick?.(item)}
      className={`h-full rounded-xl shadow-2xs transition-all cursor-pointer group [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-4.5 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/15"
          : "hover:border-blue-300"
      }`}
    >
      <div>
        {/* Row 1: Checkbox, Tags, Format pill, Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {onToggleSelect && (
              <div onClick={handleCheckboxClick} className="shrink-0 flex items-center">
                <Checkbox
                  checked={isSelected}
                  onChange={handleCheckboxChange}
                />
              </div>
            )}

            <Tag
              color="blue"
              className="m-0 shrink-0 font-medium cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
              onClick={handleSubjectClick}
              title={t("card:materials.meta.viewSubjectMaterials", { name: item.subjectName, defaultValue: `Xem danh sách tài liệu môn ${item.subjectName}` })}
            >
              {item.subjectName}
            </Tag>

            <Tag color={categoryConfig.color} className="m-0 shrink-0 font-semibold text-xs">
              {categoryConfig.label}
            </Tag>

            {getFormatBadge(item.format, item.fileSize)}
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
        <h3
          className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2 h-12 leading-6"
          title={item.title}
        >
          {item.title}
        </h3>

        {/* Row 3: Description */}
        <p
          className="text-xs text-slate-500 mb-0 leading-5 line-clamp-2 h-10 font-normal"
          title={item.description}
        >
          {item.description}
        </p>

        {/* Row 4: Topics if present */}
        {item.tableOfContents && item.tableOfContents.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {item.tableOfContents.slice(0, 2).map((toc, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded truncate max-w-[180px]"
              >
                • {toc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row 5 & 6: Metadata + Direct Download Button */}
      <div className="mt-3.5 pt-3 border-t border-[#f0f0f0] space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon name="user" size={13} className="text-slate-400 shrink-0" />
            <span className="truncate text-slate-700 font-medium" title={item.author}>
              {item.author}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
            <Icon name="clock" size={12} />
            <span>{item.uploadDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Icon name="download" size={13} className="text-slate-400" />
            {t("card:materials.meta.downloadsCount", { count: item.downloadsCount, defaultValue: `${item.downloadsCount} lượt tải` })}
          </span>

          <Button
            variant="primary"
            className="font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(item);
            }}
          >
            <Icon name="download" size={14} />
            <span>{t("card:materials.actions.download", { size: item.fileSize, defaultValue: `Tải về (${item.fileSize})` })}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
