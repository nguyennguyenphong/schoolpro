import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentExtension } from "@/modules/students/features/assignments/types";

interface AssignmentRequirementsCardProps {
  description: string;
  originalDueDate?: string;
  extensions?: AssignmentExtension[];
}

export const AssignmentRequirementsCard: React.FC<AssignmentRequirementsCardProps> = ({
  description,
  originalDueDate,
  extensions,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3.5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
        <h3 className="text-base font-bold text-slate-900 mb-0">
          {t("card:assignments.detail.requirementsTitle")}
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-0">
        {description}
      </p>

      {extensions && extensions.length > 0 && (
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={14} className="text-amber-600 shrink-0" />
              <span>{t("card:assignments.detail.extensionsTitle")}</span>
            </span>
            {originalDueDate && (
              <span className="text-[11px] font-normal text-slate-500">
                {t("card:assignments.detail.originalDueLabel")}{" "}
                <span className="line-through">{originalDueDate}</span>
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {extensions.map((ext) => (
              <div
                key={ext.level}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white p-2.5 rounded-lg border border-amber-200/80"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {t("card:assignments.detail.extensionLevel", { level: ext.level })}
                  </span>
                  <span className="text-slate-700">{ext.reason}</span>
                </div>
                <strong className="text-blue-700 shrink-0">{ext.dueDate}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
