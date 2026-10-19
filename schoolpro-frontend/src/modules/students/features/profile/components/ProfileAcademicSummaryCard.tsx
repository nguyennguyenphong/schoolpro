import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

export interface ProfileAcademicSummaryCardProps {
  studentCode: string;
  schoolName: string;
  academicYear: string;
  semester?: string;
}

export const ProfileAcademicSummaryCard: React.FC<ProfileAcademicSummaryCardProps> = ({
  studentCode,
  schoolName,
  academicYear,
  semester,
}) => {
  const { t } = useTranslation(["card"]);

  const semesterDisplay = semester || t("card:profile.academicSummary.defaultSemester");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-1">
      {/* 1. Student Code */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
        <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Icon name="user" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium text-slate-500 block truncate">
            {t("card:profile.academicSummary.studentCode")}
          </span>
          <span className="text-sm font-bold text-slate-900 tracking-tight block truncate">
            {studentCode}
          </span>
        </div>
      </div>

      {/* 2. School */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
        <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Icon name="book" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium text-slate-500 block truncate">
            {t("card:profile.academicSummary.schoolName")}
          </span>
          <span
            className="text-sm font-bold text-slate-900 tracking-tight block truncate"
            title={schoolName}
          >
            {schoolName}
          </span>
        </div>
      </div>

      {/* 3. Academic Year */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
        <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Icon name="calendar" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium text-slate-500 block truncate">
            {t("card:profile.academicSummary.academicYear")}
          </span>
          <span className="text-sm font-bold text-slate-900 tracking-tight block truncate">
            {academicYear}
          </span>
        </div>
      </div>

      {/* 4. Semester */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
        <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Icon name="clock" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium text-slate-500 block truncate">
            {t("card:profile.academicSummary.semester")}
          </span>
          <span className="text-sm font-bold text-slate-900 tracking-tight block truncate">
            {semesterDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};
