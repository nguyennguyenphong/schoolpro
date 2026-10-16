import React from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { GradebookPrintStudentProfile } from "@/modules/students/features/gradebook/print/hooks";

interface GradebookPrintStudentInfoProps {
  profile: GradebookPrintStudentProfile;
}

export const GradebookPrintStudentInfo: React.FC<GradebookPrintStudentInfoProps> = ({ profile }) => {
  const { t } = useTranslation(["card"]);
  const printDateStr = dayjs().format("DD/MM/YYYY HH:mm");

  return (
    <div className="border border-slate-700 rounded-sm bg-white text-xs sm:text-sm text-slate-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-700">
        <div className="p-3 space-y-2">
          <div className="flex items-baseline">
            <span className="w-40 font-semibold text-slate-700">
              {t("card:gradebook.print.studentName")}
            </span>
            <strong className="text-slate-900 font-bold uppercase">{profile.studentName}</strong>
          </div>
          <div className="flex items-baseline">
            <span className="w-40 font-semibold text-slate-700">
              {t("card:gradebook.print.studentCode")}
            </span>
            <strong className="text-slate-900 font-bold tracking-wide">{profile.studentCode}</strong>
          </div>
          <div className="flex items-baseline">
            <span className="w-40 font-semibold text-slate-700">
              {t("card:gradebook.print.className")}
            </span>
            <strong className="text-slate-900 font-bold">{profile.className}</strong>
          </div>
        </div>

        <div className="p-3 space-y-2">
          <div className="flex items-baseline">
            <span className="w-44 font-semibold text-slate-700">
              {t("card:gradebook.print.homeroomTeacher")}
            </span>
            <strong className="text-slate-900 font-bold">{profile.homeroomTeacher}</strong>
          </div>
          <div className="flex items-baseline">
            <span className="w-44 font-semibold text-slate-700">
              {t("card:gradebook.print.school")}
            </span>
            <span className="text-slate-900 font-medium">{profile.schoolName}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-44 font-semibold text-slate-700">
              {t("card:gradebook.print.printDate", { date: "" }).replace(":", "").trim()}
            </span>
            <span className="text-slate-800 font-medium">{printDateStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
