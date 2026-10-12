import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentFileFormatGuidelinesCardProps {
  assignment?: AssignmentItem;
}

export const AssignmentFileFormatGuidelinesCard: React.FC<
  AssignmentFileFormatGuidelinesCardProps
> = ({ assignment }) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
        <h3 className="text-sm font-bold text-slate-900 mb-0">
          {t("card:assignments.detail.fileGuidelinesTitle")}
        </h3>
      </div>

      <p className="text-[11px] text-slate-500 mb-2">
        {t("card:assignments.detail.fileGuidelinesSubtitle")}
      </p>

      {assignment?.allowedFileTypes && assignment.allowedFileTypes.length > 0 && (
        <div className="p-2.5 bg-slate-50 border border-[#f0f0f0] rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <strong className="text-blue-700">
              {t("card:assignments.detail.maxFilesAndSizeBadge", {
                maxFiles: assignment.maxFilesCount ?? 5,
                maxSize: assignment.maxFileSizeMb ?? 25,
              })}
            </strong>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {assignment.allowedFileTypes.map((ext) => (
              <span
                key={ext}
                className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase"
              >
                .{ext}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/70 border border-blue-200">
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Icon name="file-text" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-blue-900 block truncate">
              {t("card:assignments.detail.formatWordTitle")}
            </span>
            <span className="text-[11px] text-blue-700">
              {t("card:assignments.detail.formatWordDesc")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Icon name="file-spreadsheet" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-emerald-900 block truncate">
              {t("card:assignments.detail.formatExcelTitle")}
            </span>
            <span className="text-[11px] text-emerald-700">
              {t("card:assignments.detail.formatExcelDesc")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-200">
          <div className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center shrink-0">
            <Icon name="file" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-rose-900 block truncate">
              {t("card:assignments.detail.formatPdfTitle")}
            </span>
            <span className="text-[11px] text-rose-700">
              {t("card:assignments.detail.formatPdfDesc")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-200">
          <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Icon name="image" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-indigo-900 block truncate">
              {t("card:assignments.detail.formatImageTitle")}
            </span>
            <span className="text-[11px] text-indigo-700">
              {t("card:assignments.detail.formatImageDesc")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/70 border border-purple-200">
          <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Icon name="video" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-purple-900 block truncate">
              {t("card:assignments.detail.formatVideoTitle")}
            </span>
            <span className="text-[11px] text-purple-700">
              {t("card:assignments.detail.formatVideoDesc")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200">
          <div className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center shrink-0">
            <Icon name="music" size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-amber-900 block truncate">
              {t("card:assignments.detail.formatAudioTitle")}
            </span>
            <span className="text-[11px] text-amber-700">
              {t("card:assignments.detail.formatAudioDesc")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
