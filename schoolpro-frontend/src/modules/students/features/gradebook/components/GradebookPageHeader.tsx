import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface GradebookPageHeaderProps {
  className?: string;
  semesterText?: string;
  studentCode?: string;
  onOpenTranscript: () => void;
  onExportPdf: () => void;
}

export const GradebookPageHeader: React.FC<GradebookPageHeaderProps> = ({
  className = "Lớp 11A1",
  semesterText = "Học kỳ 1 • 2025-2026",
  studentCode = "SV202688",
  onOpenTranscript,
  onExportPdf,
}) => {
  const { t } = useTranslation(["navigation", "card", "button"]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5">
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <Icon name="book" size={13} className="text-blue-600 shrink-0" />
                <span>{t("navigation:breadcrumb.gradebook")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {t("navigation:pageTitle.gradebook")}
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {className}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#f0f0f0]">
              {semesterText}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {t("card:gradebook.header.studentCode", { code: studentCode })}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.gradebook")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={onOpenTranscript}
            className="font-semibold text-xs sm:text-sm text-slate-700"
          >
            <Icon name="file-text" size={15} />
            <span>{t("card:gradebook.header.viewTranscript")}</span>
          </Button>
          <Button
            variant="primary"
            onClick={onExportPdf}
            className="font-semibold text-xs sm:text-sm"
          >
            <Icon name="download" size={15} />
            <span>{t("card:gradebook.header.exportPdf")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
