import type React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type {
  MaterialItem,
  MaterialFormat,
  MaterialCategory,
} from "@/modules/students/features/materials/types";

interface MaterialDetailHeaderProps {
  item: MaterialItem;
  downloading: boolean;
  onBack: () => void;
  onDownload: () => void;
  onToggleBookmark: () => void;
}

export const MaterialDetailHeader: React.FC<MaterialDetailHeaderProps> = ({
  item,
  downloading,
  onBack,
  onDownload,
  onToggleBookmark,
}) => {
  const { t } = useTranslation(["card", "button", "message"]);

  const getFormatBadge = (fmt: MaterialFormat, size: string) => {
    switch (fmt) {
      case "pdf":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shrink-0">
            <Icon name="file" size={13} />
            PDF • {size}
          </span>
        );
      case "word":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shrink-0">
            <Icon name="fileText" size={13} />
            DOCX • {size}
          </span>
        );
      case "powerpoint":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5 shrink-0">
            <Icon name="presentation" size={13} />
            PPTX • {size}
          </span>
        );
      case "excel":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <Icon name="fileSpreadsheet" size={13} />
            XLSX • {size}
          </span>
        );
      case "video":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 shrink-0">
            <Icon name="video" size={13} />
            MP4 • {size}
          </span>
        );
      case "audio":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shrink-0">
            <Icon name="music" size={13} />
            MP3 • {size}
          </span>
        );
      case "archive":
      default:
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-[#f0f0f0] flex items-center gap-1.5 shrink-0">
            <Icon name="archive" size={13} />
            ZIP • {size}
          </span>
        );
    }
  };

  const getCategoryConfig = (cat: MaterialCategory) => {
    switch (cat) {
      case "lecture":
        return { label: t("card:materials.categories.lecture"), color: "blue" };
      case "outline":
        return { label: t("card:materials.categories.outline"), color: "orange" };
      case "textbook":
        return { label: t("card:materials.categories.textbook"), color: "purple" };
      case "exam_prep":
        return { label: t("card:materials.categories.exam_prep"), color: "green" };
      case "reference":
      default:
        return { label: t("card:materials.categories.reference"), color: "default" };
    }
  };

  const categoryConfig = getCategoryConfig(item.category);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      {/* 1. Integrated Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                <span>{t("card:materials.header.breadcrumbHome")}</span>
              </span>
            ),
          },
          {
            href: "/student/materials",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="download" size={13} className="text-slate-400 shrink-0" />
                <span>{t("card:materials.header.breadcrumbMaterials")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>{item.title}</span>
              </span>
            ),
          },
        ]}
      />

      {/* 2. Main Title Row with Meta & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0 leading-tight">
              {item.title}
            </h1>
            <Tag color="blue" className="text-xs font-semibold m-0">
              {item.subjectName} ({item.subjectCode})
            </Tag>
            <Tag color={categoryConfig.color} className="text-xs font-semibold m-0">
              {categoryConfig.label}
            </Tag>
            {getFormatBadge(item.format, item.fileSize)}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pl-3.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Icon name="user" size={13} className="text-blue-600" />
              <span>{item.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" size={13} className="text-slate-400" />
              <span>{item.uploadDate}</span>
            </span>
            <span>•</span>
            <span>
              {item.semester} ({item.academicYear})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Icon name="download" size={12} className="text-slate-400" />
              <span>{t("card:materials.meta.downloadsCount", { count: item.downloadsCount })}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Icon name="eye" size={12} className="text-slate-400" />
              <span>{t("card:materials.meta.viewsCount", { count: item.viewsCount })}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={onBack}
            className="text-slate-700 font-medium"
          >
            <Icon name="arrow-left" size={14} />
            <span>{t("button:back")}</span>
          </Button>

          <Button
            variant="outline"
            onClick={onToggleBookmark}
            className={
              item.isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 font-medium"
                : "text-slate-700 font-medium"
            }
          >
            <Icon name="bookmark" size={14} />
            <span>
              {item.isBookmarked
                ? t("card:materials.actions.bookmarked")
                : t("card:materials.actions.bookmark")}
            </span>
          </Button>

          <Button
            variant="primary"
            onClick={onDownload}
            loading={downloading}
            className="font-semibold shadow-xs"
          >
            <Icon name="download" size={15} />
            <span>{t("card:materials.actions.downloadSimple")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
