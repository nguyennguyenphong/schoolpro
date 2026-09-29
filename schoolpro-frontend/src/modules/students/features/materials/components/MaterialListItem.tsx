import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Checkbox } from "antd";
import type { MaterialItem, MaterialFormat, MaterialCategory } from "@/modules/students/features/materials/types";

interface MaterialListItemProps {
  item: MaterialItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDownload: (item: MaterialItem) => void;
  onToggleBookmark: (id: string) => void;
}

export const MaterialListItem: React.FC<MaterialListItemProps> = ({
  item,
  isSelected = false,
  onToggleSelect,
  onDownload,
  onToggleBookmark,
}) => {
  const navigate = useNavigate();

  const handleSubjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/student/materials/${item.subjectCode}`);
  };
  const getFormatBadge = (fmt: MaterialFormat, size: string) => {
    switch (fmt) {
      case "pdf":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shrink-0">
            <Icon name="fileText" size={12} />
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
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shrink-0">
            <Icon name="archive" size={12} />
            ZIP • {size}
          </span>
        );
    }
  };

  const getCategoryConfig = (cat: MaterialCategory) => {
    switch (cat) {
      case "lecture":
        return { label: "Bài giảng", color: "blue" };
      case "outline":
        return { label: "Đề cương", color: "orange" };
      case "textbook":
        return { label: "Sách GK", color: "purple" };
      case "exam_prep":
        return { label: "Đề thi", color: "green" };
      case "reference":
      default:
        return { label: "Tham khảo", color: "default" };
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
      className={`rounded-xl shadow-2xs transition-all w-full [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-4.5 ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/15"
          : "hover:border-blue-300"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Checkbox */}
          {onToggleSelect && (
            <div onClick={handleCheckboxClick} className="pt-1 shrink-0 flex items-center">
              <Checkbox
                checked={isSelected}
                onChange={handleCheckboxChange}
              />
            </div>
          )}

          {/* Info Column */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag
                color="blue"
                className="m-0 font-medium cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                onClick={handleSubjectClick}
                title={`Xem danh sách tài liệu môn ${item.subjectName}`}
              >
                {item.subjectName}
              </Tag>
              <Tag color={categoryConfig.color} className="m-0 font-semibold text-xs">
                {categoryConfig.label}
              </Tag>
              {getFormatBadge(item.format, item.fileSize)}
              <span className="text-xs text-slate-400">
                • {item.semester}
              </span>
            </div>

            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-base line-clamp-1 mb-0">
              {item.title}
            </h3>

            <p className="text-xs text-slate-500 line-clamp-1 mb-0">
              {item.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Icon name="user" size={13} className="text-slate-400" />
                {item.author}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="calendar" size={13} className="text-slate-400" />
                {item.uploadDate}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="download" size={13} className="text-slate-400" />
                {item.downloadsCount} lượt tải
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons (No size prop, direct download, no modal) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 shrink-0 md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-end"
        >
          <button
            type="button"
            onClick={() => onToggleBookmark(item.id)}
            title={item.isBookmarked ? "Bỏ lưu trữ" : "Lưu vào mục quan trọng"}
            className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
              item.isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
            }`}
          >
            <Icon name="bookmark" size={16} />
          </button>

          <Button
            variant="primary"
            onClick={() => onDownload(item)}
            className="font-semibold"
          >
            <Icon name="download" size={14} />
            Tải về ({item.fileSize})
          </Button>
        </div>
      </div>
    </Card>
  );
};
