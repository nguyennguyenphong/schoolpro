import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentSubmissionNotesCardProps {
  assignment?: AssignmentItem;
}

export const AssignmentSubmissionNotesCard: React.FC<
  AssignmentSubmissionNotesCardProps
> = ({ assignment }) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-slate-50/60 rounded-xl text-xs space-y-2">
      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
        <Icon name="info" size={14} className="text-blue-600 shrink-0" />
        <span>{t("card:assignments.detail.notesCardTitle")}</span>
      </div>
      <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
        <li>
          {t("card:assignments.detail.noteNamingRule")}{" "}
          <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            {assignment?.fileNamingRule || "10A1_HoTen_BaiTap"}
          </span>
          .
        </li>
        <li>
          {t("card:assignments.detail.noteMaxSize", {
            maxSize: assignment?.maxFileSizeMb ?? 25,
            maxFiles: assignment?.maxFilesCount ?? 5,
          })}
        </li>
        <li>{t("card:assignments.detail.noteReopen")}</li>
        <li>{t("card:assignments.detail.noteResubmit")}</li>
      </ul>
    </div>
  );
};
