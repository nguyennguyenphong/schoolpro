import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { MaterialItem } from "@/modules/students/features/materials/types";

interface MaterialDetailSidebarProps {
  item: MaterialItem;
  downloading: boolean;
  onDownload: () => void;
  onToggleBookmark: () => void;
}

export const MaterialDetailSidebar: React.FC<MaterialDetailSidebarProps> = ({
  item,
  downloading,
  onDownload,
  onToggleBookmark,
}) => {
  const { t } = useTranslation(["card", "button", "message"]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* 1. File Specifications Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#f0f0f0] pb-2.5">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:materials.detail.specsTitle")}
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-500">{t("card:materials.detail.fileName")}</span>
            <span className="font-semibold text-slate-800 truncate max-w-42.5" title={item.fileName}>
              {item.fileName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-500">{t("card:materials.detail.format")}</span>
            <span className="font-bold text-slate-800 uppercase">{item.format}</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-500">{t("card:materials.detail.fileSize")}</span>
            <span className="font-semibold text-slate-800">{item.fileSize}</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-500">{t("card:materials.modal.views")}</span>
            <span className="font-semibold text-slate-800">
              {item.viewsCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-500">{t("card:materials.detail.downloadsCount")}</span>
            <span className="font-bold text-blue-600">{item.downloadsCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-slate-500">{t("card:materials.detail.copyrightStandard")}</span>
            <span className="font-medium text-emerald-700">{t("card:materials.detail.internalUseOnly")}</span>
          </div>
        </div>
      </div>

      {/* 2. Teacher & Department Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#f0f0f0] pb-2.5">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm font-bold text-slate-900 mb-0">
            {t("card:materials.detail.teacherSectionTitle")}
          </h3>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-[#f0f0f0] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
              <Icon name="user" size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-0 truncate">
                {item.author}
              </h4>
              <p className="text-[11px] text-slate-500 mb-0 truncate">
                {t("card:materials.detail.departmentLabel", { name: item.subjectName })}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f0f0f0] text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>{t("card:materials.detail.subjectCodeLabel")}</span>
              <Tag color="blue" className="m-0 text-[11px] font-semibold">
                {item.subjectCode}
              </Tag>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("card:materials.modal.uploadDate")}:</span>
              <strong className="text-slate-700">{item.uploadDate}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <Button
          variant="primary"
          onClick={onDownload}
          loading={downloading}
          className="w-full justify-center py-2.5 font-bold shadow-xs text-sm"
        >
          <Icon name="download" size={16} />
          <span>{t("card:materials.actions.download", { size: item.fileSize })}</span>
        </Button>

        <Button
          variant="outline"
          onClick={onToggleBookmark}
          className={`w-full justify-center py-2 font-medium text-xs ${
            item.isBookmarked
              ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100"
              : "text-slate-700"
          }`}
        >
          <Icon name="bookmark" size={14} />
          <span>
            {item.isBookmarked
              ? t("card:materials.actions.bookmarked")
              : t("card:materials.actions.bookmark")}
          </span>
        </Button>
      </div>
    </div>
  );
};
